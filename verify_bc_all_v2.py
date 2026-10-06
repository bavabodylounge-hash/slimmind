#!/usr/bin/env python3
"""
BC-1~BC-16 × 4업종 × male/female 결과지 렌더링 전수 검증 v2
- /api/v1/diagnosis 엔드포인트로 직접 bc_code_key 지정 제출
- axis_scores를 BC 코드별 축 우선순위에 맞게 설정
- 결과지 URL = /result-{category}/{result_id}
"""
import asyncio, json, httpx
from playwright.async_api import async_playwright

BASE = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

# BC 코드별 대표 축 + 닉네임 (bc-engine.js 기준)
BC_MASTER_INFO = {
    "BC-1":  {"nickname": "코끼리다리형",   "axes": {"A02":90,"A01":10}},
    "BC-2":  {"nickname": "귤껍질 하체형",  "axes": {"A02":80,"A03":20}},
    "BC-3":  {"nickname": "단단 내장형",    "axes": {"A01":90,"A02":10}},
    "BC-4":  {"nickname": "물렁 피하형",    "axes": {"A08":80,"A03":20}},
    "BC-5":  {"nickname": "가스 팽만형",    "axes": {"A05":90,"A01":10}},
    "BC-6":  {"nickname": "올챙이배형",     "axes": {"A04":80,"A06":20}},
    "BC-7":  {"nickname": "말벅지형",       "axes": {"A02":70,"A04":30}},
    "BC-8":  {"nickname": "승마살형",       "axes": {"A06":80,"A02":20}},
    "BC-9":  {"nickname": "거북이형",       "axes": {"A06":70,"A02":30}},
    "BC-10": {"nickname": "팔뚝부종형",     "axes": {"A02":85,"A06":15}},
    "BC-11": {"nickname": "상체근육형",     "axes": {"A04":75,"A06":25}},
    "BC-12": {"nickname": "부유방형",       "axes": {"A06":80,"A03":20}},
    "BC-13": {"nickname": "갱년기 변환형",  "axes": {"A03":90,"A01":10}},
    "BC-14": {"nickname": "번아웃 무기력형","axes": {"A07":80,"A08":20}},
    "BC-15": {"nickname": "대사증후군형",   "axes": {"A09":90,"A01":10}},
    "BC-16": {"nickname": "다중악순환형",   "axes": {"A01":40,"A02":35,"A07":25}},
}

# 4업종
INDUSTRIES = [
    {"name": "hospital",  "ref": "B2B-HOS-001", "result": "result-hospital"},
    {"name": "fitness",   "ref": "B2B-PIL-001", "result": "result-fitness"},
    {"name": "aesthetic", "ref": "B2B-AES-001", "result": "result-aesthetic"},
    {"name": "salon",     "ref": "B2B-ETC-001", "result": "result-salon"},
]


def make_axis_scores(bc_code: str) -> dict:
    """BC 코드별 axis_scores 생성 (A01~A10 전부 포함)"""
    info = BC_MASTER_INFO.get(bc_code, {"axes": {"A01": 50}})
    base = {f"A{i:02d}": 5 for i in range(1, 11)}
    base.update(info["axes"])
    return base


async def submit_diagnosis(client: httpx.AsyncClient, industry: dict, bc_code: str, gender: str) -> dict:
    """API 제출 → result_id 획득"""
    axis_scores = make_axis_scores(bc_code)
    payload = {
        "user_name":       f"테스트_{bc_code}_{gender[:1]}",
        "gender":          gender,
        "age":             "40대",
        "ref_code":        industry["ref"],
        "survey_category": industry["name"],
        "axis_scores":     axis_scores,
        "bc_code_key":     bc_code,
        "bc_primary":      BC_MASTER_INFO.get(bc_code, {}).get("nickname", ""),
        "bc_nickname":     BC_MASTER_INFO.get(bc_code, {}).get("nickname", ""),
        "disp_answers":    {},
    }
    try:
        r = await client.post(f"{BASE}/api/v1/diagnosis", json=payload, timeout=15)
        if r.status_code == 200:
            data = r.json()
            rid = data.get("result_id") or data.get("id") or data.get("diagId")
            if rid:
                return {"ok": True, "result_id": rid,
                        "url": f"{BASE}/{industry['result']}/{rid}"}
            return {"ok": False, "error": f"no result_id: {str(data)[:100]}"}
        return {"ok": False, "error": f"HTTP {r.status_code}: {r.text[:80]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)[:80]}


async def check_result_page(pw, url: str) -> dict:
    """결과지 Playwright 검증"""
    browser = await pw.chromium.launch(headless=True, args=[
        '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    ])
    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
        ),
        ignore_https_errors=True,
    )
    page = await context.new_page()
    js_errors = []
    console_errors = []
    page.on('pageerror', lambda e: js_errors.append(str(e)))
    page.on('console', lambda m: console_errors.append(m.text) if m.type == 'error' else None)

    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(6)

        data = await page.evaluate("""() => {
            return {
                bc_master:    typeof BC_MASTER !== 'undefined' ? Object.keys(BC_MASTER).length : -1,
                bc_err:       (typeof window.__bcInitErr__ !== 'undefined') ? String(window.__bcInitErr__) : 'OK',
                p7_code:      document.getElementById('p7sum-code') ? document.getElementById('p7sum-code').textContent.trim() : 'MISSING',
                p7_nick:      document.getElementById('p7sum-nick') ? document.getElementById('p7sum-nick').textContent.trim() : 'MISSING',
                gender_val:   (typeof smIsFemaleG === 'function') ? (smIsFemaleG() ? '여성' : '남성') : '?',
                body_len:     document.body.innerHTML.length,
                title:        document.title,
            };
        }""")
        await browser.close()
        return {
            "ok":            not js_errors and len(console_errors) == 0,
            "bc_master":     data.get("bc_master", -1),
            "bc_err":        data.get("bc_err", "?"),
            "p7_code":       data.get("p7_code", ""),
            "p7_nick":       data.get("p7_nick", ""),
            "gender_val":    data.get("gender_val", "?"),
            "body_len":      data.get("body_len", 0),
            "title":         data.get("title", ""),
            "js_errors":     js_errors[:3],
            "console_errors":console_errors[:3],
        }
    except Exception as e:
        await browser.close()
        return {"ok": False, "error": str(e)[:80], "js_errors": js_errors}


async def main():
    print(f"\n{'='*80}")
    print("  BC-1~BC-16 × 4업종 × male/female 결과지 전수 검증 v2")
    print(f"{'='*80}\n")

    # 1단계: 전체 API 제출
    submissions = []
    async with httpx.AsyncClient(follow_redirects=True) as client:
        for ind in INDUSTRIES:
            for bc_code in BC_MASTER_INFO.keys():
                for gender in ["남성", "여성"]:
                    r = await submit_diagnosis(client, ind, bc_code, gender)
                    entry = {
                        "industry": ind["name"], "bc_code": bc_code,
                        "gender": gender, **r,
                    }
                    submissions.append(entry)
                    ok_mark = "✅" if r["ok"] else "❌"
                    rid = r.get("result_id", r.get("error", "?"))[:36]
                    print(f"  {ok_mark} {ind['name']:10s} {bc_code:6s} {gender:3s} → {rid}")
                    await asyncio.sleep(0.08)

    ok_subs = [s for s in submissions if s.get("ok")]
    print(f"\n제출: {len(ok_subs)}/{len(submissions)} 성공\n")

    if not ok_subs:
        print("❌ 제출 실패 — 종료")
        return

    # 2단계: Playwright 결과지 검증 (병렬 4개)
    sem = asyncio.Semaphore(4)
    results = []

    async with async_playwright() as pw:
        async def verify(s):
            async with sem:
                r = await check_result_page(pw, s["url"])
                return {**s, **r}

        tasks = [verify(s) for s in ok_subs]
        results = await asyncio.gather(*tasks)

    # 3단계: 결과 출력
    print(f"\n{'='*80}")
    print("  결과 요약 (업종 × BC코드 × 성별)")
    print(f"{'='*80}\n")

    all_ok = True
    gender_diff_count = 0  # 성별 분기된 닉네임 수

    for ind in INDUSTRIES:
        ind_r = [r for r in results if r["industry"] == ind["name"]]
        print(f"【{ind['name']}】")
        for bc_code in BC_MASTER_INFO.keys():
            bc_r = [r for r in ind_r if r["bc_code"] == bc_code]
            male_r   = next((r for r in bc_r if r["gender"]=="남성"), None)
            female_r = next((r for r in bc_r if r["gender"]=="여성"), None)

            for r in bc_r:
                stat = "✅" if (r.get("ok") and r.get("bc_master",-1)==16) else "❌"
                if not (r.get("ok") and r.get("bc_master",-1)==16):
                    all_ok = False
                g_icon = "♂" if r["gender"]=="남성" else "♀"
                nick = r.get("p7_nick","")[:20]
                gv   = r.get("gender_val","?")
                print(f"  {stat} {bc_code:6s} {g_icon}  "
                      f"BC_M={r.get('bc_master',-1):2d}  "
                      f"bcErr={r.get('bc_err','?')!r:5s}  "
                      f"gender={gv:3s}  "
                      f"nick={nick!r:22s}  "
                      f"js_err={len(r.get('js_errors',[]))}")
                if r.get("js_errors"):
                    for e in r["js_errors"][:2]:
                        print(f"       ❌ JS: {e[:80]}")

            # 성별 분기 확인
            if male_r and female_r:
                m_nick = male_r.get("p7_nick","")
                f_nick = female_r.get("p7_nick","")
                if m_nick != f_nick and m_nick not in ("MISSING","") and f_nick not in ("MISSING",""):
                    gender_diff_count += 1
                    print(f"       ♂≠♀ gender_diff: ♂={m_nick!r}  ♀={f_nick!r}")
        print()

    # 4단계: 최종 요약
    total  = len(results)
    passed = sum(1 for r in results if r.get("ok") and r.get("bc_master",-1)==16)
    failed = total - passed
    
    print(f"\n{'='*80}")
    print("  최종 요약")
    print(f"{'='*80}")
    print(f"  총 검증: {total}개  ✅통과: {passed}개  ❌실패: {failed}개")
    print(f"  성별 분기(닉네임 다름): {gender_diff_count}쌍")

    if failed == 0:
        print("  🎉 BC-1~BC-16 × 4업종 × male/female 전수 통과!")
    else:
        failed_list = [r for r in results if not (r.get("ok") and r.get("bc_master",-1)==16)]
        for r in failed_list[:10]:
            print(f"  ❌ [{r['industry']}] {r['bc_code']} {r['gender']}: "
                  f"BC_M={r.get('bc_master',-1)} js_err={r.get('js_errors',[])} "
                  f"err={r.get('error','')}")

    # JSON 저장
    with open('/home/user/webapp/bc_all_v2_result.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print(f"\n  결과 JSON: /home/user/webapp/bc_all_v2_result.json")


if __name__ == '__main__':
    asyncio.run(main())
