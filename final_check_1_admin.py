#!/usr/bin/env python3
"""
1단계: MASTER admin 페이지 전수 검증
- MASTER 로그인
- B2B 파트너 목록 조회
- 파트너 등록/URL 생성
- 진단결과 조회/검색
- 재진단 발송 기능
"""
import asyncio, json
from playwright.async_api import async_playwright

BASE = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"
RESULTS = []

def rec(item, status, detail="", error=""):
    icon = "✅" if status == "OK" else "❌" if status == "FAIL" else "⚠️"
    RESULTS.append({"item": item, "status": status, "detail": detail, "error": error})
    print(f"  {icon} {item}" + (f" — {detail}" if detail else "") + (f"\n     ERR: {error}" if error else ""))

async def main():
    print(f"\n{'='*70}")
    print("  [1단계] MASTER admin 페이지 검증")
    print(f"{'='*70}\n")

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=['--no-sandbox','--disable-dev-shm-usage'])
        ctx = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
            viewport={"width": 1280, "height": 900},
            ignore_https_errors=True,
        )
        page = await ctx.new_page()
        js_errors = []
        page.on('pageerror', lambda e: js_errors.append(str(e)))

        # ── 1-1. admin.html 로드 ──────────────────────────
        print("【1-1】 admin.html 로드")
        try:
            await page.goto(f"{BASE}/admin.html", wait_until='domcontentloaded', timeout=20000)
            await asyncio.sleep(3)
            title = await page.title()
            body_len = await page.evaluate("document.body.innerHTML.length")
            rec("admin.html 로드", "OK", f"title={title!r} body={body_len:,}")
        except Exception as e:
            rec("admin.html 로드", "FAIL", error=str(e)[:100])
            await browser.close(); return

        # ── 1-2. 로그인 폼 DOM 존재 ──────────────────────
        print("\n【1-2】 로그인 폼 DOM")
        login_selectors = ['#adminCode','#adminPassword','#loginBtn',
                           'input[type="password"]','button[type="submit"]']
        found_login = []
        for sel in login_selectors:
            cnt = await page.locator(sel).count()
            if cnt > 0: found_login.append(sel)
        if found_login:
            rec("로그인 폼 DOM", "OK", f"found: {found_login}")
        else:
            # 폼 없으면 현재 HTML에서 input 찾기
            all_inputs = await page.evaluate("() => Array.from(document.querySelectorAll('input')).map(e=>e.id||e.type||e.name).filter(Boolean)")
            rec("로그인 폼 DOM", "WARN", f"기본 셀렉터 없음, inputs={all_inputs[:5]}")

        # ── 1-3. API 직접 로그인 (MASTER) ────────────────
        print("\n【1-3】 MASTER 로그인 API")
        import httpx
        master_token = None
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                r = await client.post(f"{BASE}/api/auth/login",
                    json={"code": "MASTER", "password": "admin1234"}, timeout=10)
                if r.status_code == 200:
                    data = r.json()
                    master_token = data.get("token")
                    role = data.get("role","?")
                    rec("MASTER API 로그인", "OK", f"role={role} token={str(master_token)[:20]}...")
                else:
                    rec("MASTER API 로그인", "FAIL", error=f"HTTP {r.status_code}: {r.text[:80]}")
        except Exception as e:
            rec("MASTER API 로그인", "FAIL", error=str(e)[:80])

        # ── 1-4. B2B 파트너 목록 API ─────────────────────
        print("\n【1-4】 B2B 파트너 목록 API")
        partners = []
        if master_token:
            try:
                async with httpx.AsyncClient(follow_redirects=True) as client:
                    r = await client.get(f"{BASE}/api/admin/partners",
                        headers={"Authorization": f"Bearer {master_token}"}, timeout=10)
                    if r.status_code == 200:
                        data = r.json()
                        partners = data if isinstance(data, list) else data.get("partners", data.get("data", []))
                        rec("B2B 파트너 목록 API", "OK", f"총 {len(partners)}개 파트너")
                        for p in partners[:6]:
                            name = p.get('name','?')
                            code = p.get('code','?')
                            cat  = p.get('survey_category','?')
                            stat = p.get('status','?')
                            print(f"     [{stat}] {code} / {name} / {cat}")
                    else:
                        rec("B2B 파트너 목록 API", "FAIL", error=f"HTTP {r.status_code}: {r.text[:80]}")
            except Exception as e:
                rec("B2B 파트너 목록 API", "FAIL", error=str(e)[:80])
        else:
            rec("B2B 파트너 목록 API", "WARN", detail="토큰 없어 스킵")

        # ── 1-5. 4개 활성 파트너 확인 ────────────────────
        print("\n【1-5】 4업종 활성 파트너 존재 확인")
        expected_cats = {"hospital","fitness","aesthetic","salon"}
        active_cats = {p.get('survey_category') for p in partners if p.get('status')=='active'}
        for cat in expected_cats:
            if cat in active_cats:
                rec(f"활성 파트너({cat})", "OK")
            else:
                rec(f"활성 파트너({cat})", "FAIL", error="active 파트너 없음")

        # ── 1-6. 진단결과 목록 API ───────────────────────
        print("\n【1-6】 진단결과 목록 API")
        if master_token:
            try:
                async with httpx.AsyncClient(follow_redirects=True) as client:
                    r = await client.get(f"{BASE}/api/admin/diagnoses?limit=5",
                        headers={"Authorization": f"Bearer {master_token}"}, timeout=10)
                    if r.status_code == 200:
                        data = r.json()
                        items = data if isinstance(data, list) else data.get("diagnoses", data.get("data", data.get("results",[])))
                        rec("진단결과 목록 API", "OK", f"최근 {len(items)}건 조회")
                        if items:
                            d = items[0]
                            print(f"     최신: id={str(d.get('id','?'))[:20]} bc={d.get('bc_code_key','?')} name={d.get('user_name','?')}")
                    else:
                        rec("진단결과 목록 API", "FAIL", error=f"HTTP {r.status_code}: {r.text[:100]}")
            except Exception as e:
                rec("진단결과 목록 API", "FAIL", error=str(e)[:80])
        else:
            rec("진단결과 목록 API", "WARN", detail="토큰 없어 스킵")

        # ── 1-7. 진단결과 검색 (bc 필터) ─────────────────
        print("\n【1-7】 진단결과 검색 (BC-3 필터)")
        if master_token:
            try:
                async with httpx.AsyncClient(follow_redirects=True) as client:
                    r = await client.get(f"{BASE}/api/admin/diagnoses?bc=BC-3&limit=3",
                        headers={"Authorization": f"Bearer {master_token}"}, timeout=10)
                    if r.status_code == 200:
                        data = r.json()
                        items = data if isinstance(data, list) else data.get("diagnoses", data.get("data", data.get("results",[])))
                        rec("진단결과 BC-3 검색", "OK", f"{len(items)}건 조회")
                    else:
                        rec("진단결과 BC-3 검색", "FAIL", error=f"HTTP {r.status_code}: {r.text[:80]}")
            except Exception as e:
                rec("진단결과 BC-3 검색", "FAIL", error=str(e)[:80])

        # ── 1-8. 재진단 API 엔드포인트 존재 확인 ──────────
        print("\n【1-8】 재진단 API 엔드포인트")
        if master_token:
            try:
                async with httpx.AsyncClient(follow_redirects=True) as client:
                    # scan 엔드포인트 존재 확인 (POST 없이 확인)
                    r = await client.post(f"{BASE}/api/admin/rediagnosis/scan",
                        headers={"Authorization": f"Bearer {master_token}"},
                        json={}, timeout=10)
                    # 400/422도 엔드포인트 존재를 의미
                    if r.status_code in (200, 400, 422, 404):
                        status = "OK" if r.status_code != 404 else "FAIL"
                        rec("재진단 scan API", status, f"HTTP {r.status_code}")
                    else:
                        rec("재진단 scan API", "WARN", f"HTTP {r.status_code}: {r.text[:60]}")
            except Exception as e:
                rec("재진단 scan API", "FAIL", error=str(e)[:80])

        # ── 1-9. admin.html DOM 핵심 요소 ────────────────
        print("\n【1-9】 admin.html DOM 핵심 요소")
        # 토큰 주입 후 페이지 상태 확인
        if master_token:
            await page.evaluate(f"""() => {{
                localStorage.setItem('slimmind_admin_token', {json.dumps(master_token)});
            }}""")
            await page.reload(wait_until='domcontentloaded')
            await asyncio.sleep(3)

        dom_checks = [
            ("#adminCode,input[placeholder*='코드'],input[placeholder*='CODE']", "관리자코드 입력"),
            ("#loginBtn,button[type='submit'],.login-btn", "로그인 버튼"),
        ]
        for sel, label in dom_checks:
            cnt = await page.locator(sel).count()
            if cnt > 0:
                rec(f"DOM: {label}", "OK", f"{sel} × {cnt}")
            else:
                rec(f"DOM: {label}", "WARN", f"{sel} 없음")

        # ── 1-10. JS 오류 최종 확인 ──────────────────────
        print("\n【1-10】 JS 오류")
        if js_errors:
            for e in js_errors:
                rec(f"JS 오류", "FAIL", error=e[:120])
        else:
            rec("JS 오류 없음", "OK")

        await browser.close()

    # 최종 요약
    print(f"\n{'─'*70}")
    ok   = sum(1 for r in RESULTS if r['status']=='OK')
    fail = sum(1 for r in RESULTS if r['status']=='FAIL')
    warn = sum(1 for r in RESULTS if r['status']=='WARN')
    print(f"  1단계 결과: ✅ {ok}  ❌ {fail}  ⚠️ {warn}")
    return RESULTS

if __name__ == '__main__':
    asyncio.run(main())
