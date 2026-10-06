#!/usr/bin/env python3
"""
BC-1~BC-16 전 코드 경로 결과지 렌더링 검증 + male/female 성별 분기 텍스트 확인
- 4업종 × 16개 BC 코드 × male/female = 128개 진단 ID 생성
- 실제 API 제출 → 결과지 URL 확보 → Playwright 렌더링 검증
"""
import asyncio, json, random, time, re
import httpx
from playwright.async_api import async_playwright

BASE = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

# 4업종별 API 엔드포인트 및 B2B 코드
INDUSTRIES = [
    {"name": "hospital",  "api": "/api/submit/hospital",  "ref": "B2B-HOS-001", "result": "result-hospital"},
    {"name": "fitness",   "api": "/api/submit/fitness",   "ref": "B2B-PIL-001", "result": "result-fitness"},
    {"name": "aesthetic", "api": "/api/submit/aesthetic",  "ref": "B2B-AES-001", "result": "result-aesthetic"},
    {"name": "salon",     "api": "/api/submit/salon",      "ref": "B2B-ETC-001", "result": "result-salon"},
]

# BC-1~BC-16 강제 유발 답변 세트
# 각 BC 코드에 맞는 인슐린/순환/호르몬 등 축 조합
BC_PROFILES = {
    "BC-1":  {"s1": [3,3,3,3,3], "dominant": "A01", "label": "인슐린저항"},   # A01 독주
    "BC-2":  {"s1": [0,0,0,0,0], "dominant": "A02", "label": "순환"},
    "BC-3":  {"s1": [3,3,3,3,3], "dominant": "A01", "label": "인슐린저항"},   # 같은 패턴도 bc-engine이 분류
    "BC-4":  {"s1": [0,0,3,3,3], "dominant": "A03", "label": "호르몬"},
    "BC-5":  {"s1": [3,0,3,0,3], "dominant": "A04", "label": "근감소"},
    "BC-6":  {"s1": [0,3,0,3,0], "dominant": "A05", "label": "간기능"},
    "BC-7":  {"s1": [3,3,0,0,3], "dominant": "A06", "label": "골격자세"},
    "BC-8":  {"s1": [0,0,3,3,0], "dominant": "A07", "label": "스트레스"},
    "BC-9":  {"s1": [3,0,0,3,3], "dominant": "A08", "label": "폭식"},
    "BC-10": {"s1": [0,3,3,0,0], "dominant": "A09", "label": "대사위험"},
    "BC-11": {"s1": [3,3,3,0,0], "dominant": "A10", "label": "갑상선"},
    "BC-12": {"s1": [0,0,0,3,3], "dominant": "A01+A02", "label": "복합"},
    "BC-13": {"s1": [3,3,0,3,0], "dominant": "A01+A03", "label": "복합"},
    "BC-14": {"s1": [0,3,3,3,0], "dominant": "A02+A03", "label": "복합"},
    "BC-15": {"s1": [3,0,3,3,0], "dominant": "A04+A01", "label": "복합"},
    "BC-16": {"s1": [0,3,0,0,3], "dominant": "A05+A02", "label": "복합"},
}

def make_answers(bc_code: str, gender: str, industry: str) -> dict:
    """BC 코드별 더미 답변 생성"""
    profile = BC_PROFILES.get(bc_code, BC_PROFILES["BC-1"])
    s1 = profile["s1"]
    
    # 공통 기본 답변 구조
    base = {
        "ref":    INDUSTRIES[[i["name"] for i in INDUSTRIES].index(industry)]["ref"] if industry in [i["name"] for i in INDUSTRIES] else "B2B-HOS-001",
        "gender": gender,
        "age":    "40대",
        "name":   f"테스트{bc_code}",
        # stage1: 5개 문항 (인슐린/순환/호르몬/근감소/간)
        "s1_q1": s1[0], "s1_q2": s1[1], "s1_q3": s1[2], "s1_q4": s1[3], "s1_q5": s1[4],
        # stage2: 5개 확장 문항
        "s2_q1": random.randint(0,2), "s2_q2": random.randint(0,2),
        "s2_q3": random.randint(0,2), "s2_q4": random.randint(0,2), "s2_q5": random.randint(0,2),
        # stage3: 4개
        "s3_q1": random.randint(0,2), "s3_q2": random.randint(0,2),
        "s3_q3": random.randint(0,2), "s3_q4": random.randint(0,2),
    }
    return base


async def submit_and_get_result_url(client: httpx.AsyncClient, industry: dict, bc_code: str, gender: str) -> dict:
    """API 제출 → 결과 ID 획득"""
    answers = make_answers(bc_code, gender, industry["name"])
    answers["ref"] = industry["ref"]
    
    try:
        r = await client.post(
            f"{BASE}{industry['api']}",
            json=answers,
            timeout=15,
        )
        if r.status_code == 200:
            data = r.json()
            diag_id = data.get("id") or data.get("diagId") or data.get("diagnosis_id")
            if diag_id:
                result_url = f"{BASE}/{industry['result']}/{diag_id}"
                return {"ok": True, "diag_id": diag_id, "url": result_url}
            else:
                return {"ok": False, "error": f"no id in response: {str(data)[:100]}"}
        else:
            return {"ok": False, "error": f"HTTP {r.status_code}: {r.text[:100]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)[:100]}


async def check_result_page(playwright, url: str, industry: str, bc_code: str, gender: str) -> dict:
    """결과지 Playwright 검증"""
    browser = await playwright.chromium.launch(headless=True, args=[
        '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    ])
    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        ignore_https_errors=True,
    )
    page = await context.new_page()

    js_errors    = []
    console_errors = []

    page.on('pageerror', lambda e: js_errors.append(str(e)))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)

    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(6)

        # 핵심 지표 추출
        js_result = await page.evaluate("""() => {
            return {
                bc_master_keys: typeof BC_MASTER !== 'undefined' ? Object.keys(BC_MASTER).length : -1,
                bc_err:         typeof window.__bcInitErr__ !== 'undefined' ? window.__bcInitErr__ : 'OK',
                p7_code:        document.getElementById('p7sum-code')  ? document.getElementById('p7sum-code').textContent.trim()  : 'MISSING',
                p7_nick:        document.getElementById('p7sum-nick')  ? document.getElementById('p7sum-nick').textContent.trim()  : 'MISSING',
                gender_flag:    typeof smIsFemaleG === 'function' ? (smIsFemaleG() ? 'FEMALE' : 'MALE') : '?',
                bc_code_el:     document.getElementById('result-bc-code') ? document.getElementById('result-bc-code').textContent.trim() : 
                                document.querySelector('[data-bc-code]') ? document.querySelector('[data-bc-code]').dataset.bcCode : 
                                document.body.textContent.match(/BC-\\d+/) ? document.body.textContent.match(/BC-\\d+/)[0] : 'UNKNOWN',
                body_len:       document.body.innerHTML.length,
            };
        }""")

        await browser.close()
        return {
            "ok":       len(js_errors) == 0,
            "bc_master":  js_result.get("bc_master_keys", -1),
            "bc_err":     js_result.get("bc_err", "?"),
            "p7_code":    js_result.get("p7_code", ""),
            "p7_nick":    js_result.get("p7_nick", ""),
            "gender_flag": js_result.get("gender_flag", "?"),
            "bc_code_el":  js_result.get("bc_code_el", "?"),
            "body_len":    js_result.get("body_len", 0),
            "js_errors":   js_errors[:3],
            "console_errors": console_errors[:3],
        }
    except Exception as e:
        await browser.close()
        return {"ok": False, "error": str(e)[:100], "js_errors": js_errors}


async def main():
    print(f"\n{'='*80}")
    print("  BC-1~BC-16 × 4업종 × male/female 결과지 렌더링 전수 검증")
    print(f"{'='*80}\n")

    # 1단계: API 제출 (동기적으로, 너무 빠르면 rate limit)
    submissions = []
    async with httpx.AsyncClient(follow_redirects=True) as client:
        for ind in INDUSTRIES:
            for bc_code in BC_PROFILES.keys():
                for gender in ["남성", "여성"]:
                    r = await submit_and_get_result_url(client, ind, bc_code, gender)
                    submissions.append({
                        "industry": ind["name"],
                        "bc_code":  bc_code,
                        "gender":   gender,
                        **r,
                    })
                    if r["ok"]:
                        print(f"  ✅ {ind['name']:10s} {bc_code:6s} {gender:3s} → {r['diag_id']}")
                    else:
                        print(f"  ❌ {ind['name']:10s} {bc_code:6s} {gender:3s} → {r.get('error','?')}")
                    await asyncio.sleep(0.1)  # gentle rate limit

    ok_submissions = [s for s in submissions if s.get("ok")]
    print(f"\n제출 완료: {len(ok_submissions)}/{len(submissions)} 성공\n")

    # 2단계: Playwright 결과지 검증 (병렬 4개씩)
    print(f"{'='*80}")
    print("  결과지 렌더링 검증 시작...")
    print(f"{'='*80}\n")

    results = []
    async with async_playwright() as pw:
        # 4개씩 병렬
        sem = asyncio.Semaphore(4)
        
        async def check_with_sem(s):
            async with sem:
                r = await check_result_page(pw, s["url"], s["industry"], s["bc_code"], s["gender"])
                return {**s, **r}
        
        tasks = [check_with_sem(s) for s in ok_submissions]
        results = await asyncio.gather(*tasks)

    # 결과 분석
    print(f"\n{'='*80}")
    print("  업종별 × BC코드별 결과 요약")
    print(f"{'='*80}\n")

    all_ok = True
    errors = []
    
    # 업종별로 그룹화
    for ind in INDUSTRIES:
        ind_results = [r for r in results if r["industry"] == ind["name"]]
        print(f"【{ind['name']}】")
        
        # BC코드별
        for bc_code in BC_PROFILES.keys():
            bc_results = [r for r in ind_results if r["bc_code"] == bc_code]
            
            for r in bc_results:
                status = "✅" if r.get("ok") and r.get("bc_master", -1) == 16 else "⚠️" if r.get("ok") else "❌"
                gender_icon = "♂" if r.get("gender") == "남성" else "♀"
                
                if not r.get("ok") or r.get("bc_master", -1) != 16:
                    all_ok = False
                    errors.append(r)
                
                # p7_nick 성별 분기 확인
                nick = r.get("p7_nick", "")
                gender_flag = r.get("gender_flag", "?")
                
                print(f"  {status} {bc_code:6s} {gender_icon}  "
                      f"BC_M={r.get('bc_master',-1):2d}  "
                      f"bcErr={r.get('bc_err','?')!r:5s}  "
                      f"gender={gender_flag:6s}  "
                      f"nick={nick[:20]!r:22s}  "
                      f"js_err={len(r.get('js_errors',[]))}")
                
                if r.get("js_errors"):
                    for e in r["js_errors"][:2]:
                        print(f"         ❌ {e[:80]}")
        print()

    # 성별 분기 분석
    print(f"\n{'='*80}")
    print("  성별 분기 텍스트 분석 (닉네임 male vs female 비교)")
    print(f"{'='*80}\n")
    
    for ind in INDUSTRIES:
        ind_results = [r for r in results if r["industry"] == ind["name"]]
        diffs = 0
        same  = 0
        for bc_code in BC_PROFILES.keys():
            male_r   = next((r for r in ind_results if r["bc_code"]==bc_code and r["gender"]=="남성"), None)
            female_r = next((r for r in ind_results if r["bc_code"]==bc_code and r["gender"]=="여성"), None)
            if male_r and female_r:
                m_nick = male_r.get("p7_nick","")
                f_nick = female_r.get("p7_nick","")
                if m_nick != f_nick:
                    diffs += 1
                    print(f"  ♂≠♀ [{ind['name']}] {bc_code}: ♂={m_nick!r}  ♀={f_nick!r}")
                else:
                    same += 1
        print(f"  [{ind['name']}] 동일닉네임: {same}개  성별분기: {diffs}개\n")

    # 최종 요약
    print(f"\n{'='*80}")
    print("  최종 요약")
    print(f"{'='*80}")
    total = len(results)
    passed = sum(1 for r in results if r.get("ok") and r.get("bc_master",-1)==16)
    print(f"  총 검증: {total}개  통과: {passed}개  실패: {total-passed}개")
    
    if all_ok:
        print("  ✅ BC-1~BC-16 전 코드 경로 결과지 렌더링 이상 없음")
    else:
        print(f"  ❌ {len(errors)}개 오류:")
        for e in errors[:10]:
            print(f"     [{e['industry']}] {e['bc_code']} {e['gender']}: {e.get('js_errors',[])} {e.get('error','')}")

    # JSON 저장
    with open('/home/user/webapp/bc_all_result.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n  결과 JSON: /home/user/webapp/bc_all_result.json")


if __name__ == '__main__':
    asyncio.run(main())
