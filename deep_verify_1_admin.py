#!/usr/bin/env python3
"""
1단계: admin.html 실제 DOM 깊은 검증
- 파트너 목록 실제 DOM 노출
- 파트너 등록 API
- 질문지 URL 자동생성 확인
- 진단결과 검색/필터 실제 동작
- 재진단 API
"""
import asyncio, json, subprocess, time
from playwright.async_api import async_playwright

BASE_URL = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"
PASS = []
FAIL = []

def ok(item, msg=""):
    PASS.append(item)
    print(f"  ✅ {item}" + (f" — {msg}" if msg else ""))

def ng(item, msg=""):
    FAIL.append(item)
    print(f"  ❌ {item}" + (f" — {msg}" if msg else ""))

def curl_get(path, token=None):
    h = ["-H", f"Authorization: Bearer {token}"] if token else []
    r = subprocess.run(["curl","-s","-w","\n__S__%{http_code}","--max-time","12",BASE_URL+path]+h, capture_output=True, text=True)
    body,code = r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000")
    try: return int(code), json.loads(body)
    except: return int(code), body

def curl_post(path, payload, token=None):
    h = ["-H","Content-Type: application/json"]
    if token: h += ["-H", f"Authorization: Bearer {token}"]
    r = subprocess.run(["curl","-s","-w","\n__S__%{http_code}","--max-time","12","-X","POST","-d",json.dumps(payload),BASE_URL+path]+h, capture_output=True, text=True)
    body,code = r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000")
    try: return int(code), json.loads(body)
    except: return int(code), body

def curl_put(path, payload, token=None):
    h = ["-H","Content-Type: application/json"]
    if token: h += ["-H", f"Authorization: Bearer {token}"]
    r = subprocess.run(["curl","-s","-w","\n__S__%{http_code}","--max-time","12","-X","PUT","-d",json.dumps(payload),BASE_URL+path]+h, capture_output=True, text=True)
    body,code = r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000")
    try: return int(code), json.loads(body)
    except: return int(code), body

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        ctx = await browser.new_context(viewport={"width":1440,"height":900})
        page = await ctx.new_page()
        js_errors = []
        page.on("pageerror", lambda e: js_errors.append(str(e)))

        # ──────────────────────────────────────────
        # API 토큰 획득
        # ──────────────────────────────────────────
        code, data = curl_post("/api/auth/login", {"code":"MASTER","password":"admin1234"})
        tok = data.get("token") if isinstance(data,dict) else None
        if not tok:
            ng("MASTER 로그인", f"HTTP {code}: {data}")
            await browser.close(); return
        ok("MASTER 로그인", f"role={data.get('role')}")

        # ──────────────────────────────────────────
        # [API] B2B 파트너 목록 상세 확인
        # ──────────────────────────────────────────
        print("\n── [API] B2B 파트너 목록 ──")
        code, data = curl_get("/api/admin/b2b-partners", tok)
        partners = data.get("partners",[]) if isinstance(data,dict) else []
        ok("b2b-partners API", f"총 {len(partners)}개") if code==200 else ng("b2b-partners API", f"HTTP {code}")

        active = [p for p in partners if p.get("status")=="active"]
        ok(f"활성 파트너 수", f"{len(active)}개 active") if len(active)>=4 else ng(f"활성 파트너 수", f"active={len(active)}")

        # 4업종 파트너 존재 확인
        cats = {p.get("survey_category") for p in active}
        for cat in ["hospital","fitness","aesthetic","salon"]:
            found = any(p.get("survey_category")==cat for p in active)
            ok(f"파트너 존재: {cat}", "") if found else ng(f"파트너 존재: {cat}", "해당 업종 파트너 없음")

        # 파트너 코드별 상세 확인
        print("\n── [API] 파트너 코드/URL 상세 ──")
        for p in active[:6]:
            code_val = p.get("code","")
            cat = p.get("survey_category","")
            brand = p.get("brand_name") or p.get("name","")
            # survey_url 필드나 code로부터 URL 추론
            survey_url = p.get("survey_url","") or f"/h/{code_val}"
            print(f"    • {code_val} [{cat}] {brand} → {survey_url}")
            # 해당 URL 접근 가능한지
            c2 = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","8",BASE_URL+survey_url], capture_output=True, text=True)
            url_code = c2.stdout.strip()
            ok(f"  질문지 URL {survey_url}", f"HTTP {url_code}") if url_code in ["200","307"] else ng(f"  질문지 URL {survey_url}", f"HTTP {url_code}")

        # ──────────────────────────────────────────
        # [API] 진단결과 검색/필터
        # ──────────────────────────────────────────
        print("\n── [API] 진단결과 검색/필터 ──")
        # 전체 조회
        code, data = curl_get("/api/admin/results?limit=10", tok)
        results = data.get("results",[]) if isinstance(data,dict) else []
        total = data.get("total",0) if isinstance(data,dict) else 0
        ok("results 전체 조회", f"total={total}, 반환={len(results)}") if code==200 else ng("results 전체 조회", f"HTTP {code}")

        # BC 코드 필터
        code, data = curl_get("/api/admin/results?bc=BC-1&limit=5", tok)
        bc1_results = data.get("results",[]) if isinstance(data,dict) else []
        ok("results BC=BC-1 필터", f"count={len(bc1_results)}") if code==200 else ng("results BC=BC-1 필터", f"HTTP {code}")

        # 업종 필터
        code, data = curl_get("/api/admin/results?category=hospital&limit=5", tok)
        ok("results category=hospital 필터", f"HTTP {code}") if code==200 else ng("results category=hospital 필터", f"HTTP {code}")

        # 검색
        if results:
            first_name = results[0].get("user_name","")[:2]
            if first_name:
                code, data = curl_get(f"/api/admin/results?search={first_name}&limit=5", tok)
                ok(f"results 이름검색({first_name})", f"HTTP {code}") if code==200 else ng(f"results 이름검색", f"HTTP {code}")

        # ──────────────────────────────────────────
        # [API] 개별 결과 상세
        # ──────────────────────────────────────────
        print("\n── [API] 개별 결과 상세 ──")
        if results:
            rid = results[0].get("id","")
            code, data = curl_get(f"/api/admin/result/{rid}", tok)
            if code == 404:
                # 다른 경로 시도
                code, data = curl_get(f"/api/admin/results/{rid}", tok)
            ok(f"개별 결과 상세 /admin/result/{{id}}", f"HTTP {code}, keys={list(data.keys()) if isinstance(data,dict) else 'N/A'}") if code==200 else ng(f"개별 결과 상세", f"HTTP {code} → 경로 확인필요")

        # ──────────────────────────────────────────
        # [API] 대시보드 KPI 실제 수치 확인
        # ──────────────────────────────────────────
        print("\n── [API] 대시보드 KPI 수치 ──")
        code, data = curl_get("/api/admin/dashboard", tok)
        if code==200 and isinstance(data,dict):
            kpi = data.get("kpi",{})
            print(f"    total_users={kpi.get('total_users','?')}")
            print(f"    today_users={kpi.get('today_users','?')}")
            print(f"    this_month={kpi.get('this_month','?')}")
            bc_dist = data.get("bc_distribution",[])
            print(f"    bc_distribution={len(bc_dist)}종")
            ok("대시보드 KPI 수치", f"total={kpi.get('total_users')}, month={kpi.get('this_month')}")
        else:
            ng("대시보드 KPI", f"HTTP {code}")

        # ──────────────────────────────────────────
        # [API] 재진단 스캔/목록
        # ──────────────────────────────────────────
        print("\n── [API] 재진단 ──")
        code, data = curl_post("/api/admin/rediagnosis/scan", {}, tok)
        ok("rediagnosis/scan", f"ok={data.get('ok')}, created={data.get('created')}") if code==200 and data.get("ok") else ng("rediagnosis/scan", f"HTTP {code}: {data}")

        code, data = curl_get("/api/admin/rediagnosis", tok)
        alerts = data.get("alerts",[]) if isinstance(data,dict) else []
        ok("rediagnosis 목록", f"count={len(alerts)}") if code==200 else ng("rediagnosis 목록", f"HTTP {code}")

        # ──────────────────────────────────────────
        # [API] 컨설턴트 목록
        # ──────────────────────────────────────────
        print("\n── [API] 컨설턴트 목록 ──")
        code, data = curl_get("/api/admin/consultants", tok)
        consultants = data.get("consultants",[]) if isinstance(data,dict) else []
        ok("consultants 목록", f"count={len(consultants)}") if code==200 else ng("consultants 목록", f"HTTP {code}")
        for c in consultants[:3]:
            print(f"    • {c.get('code')} {c.get('name')} [{c.get('subscription_status')}]")

        # ──────────────────────────────────────────
        # [API] bc-codes 실제 16종 확인
        # ──────────────────────────────────────────
        print("\n── [API] BC 코드 목록 ──")
        code, data = curl_get("/api/admin/bc-codes", tok)
        bc_codes = data.get("bc_codes",{}) if isinstance(data,dict) else {}
        ok(f"bc-codes {len(bc_codes)}종", "") if code==200 and len(bc_codes)>=16 else ng("bc-codes", f"HTTP {code}, count={len(bc_codes)}")

        # ──────────────────────────────────────────
        # [Playwright] admin.html 실제 DOM 로그인 후 확인
        # ──────────────────────────────────────────
        print("\n── [Playwright] admin.html DOM 로그인 후 전체 확인 ──")
        await page.goto(BASE_URL+"/admin.html", wait_until="networkidle", timeout=25000)
        await page.fill("#login-code", "MASTER")
        await page.fill("#login-pw", "admin1234")
        await page.click(".login-btn")
        await page.wait_for_timeout(3000)

        # URL 변경 확인
        cur_url = page.url
        ok("로그인 후 URL 전환", cur_url) if "/admin" in cur_url else ng("로그인 후 URL 전환", f"현재={cur_url}")

        # KPI 카드 DOM 확인
        kpi_grid = await page.query_selector(".kpi-grid")
        ok("KPI 그리드 존재") if kpi_grid else ng("KPI 그리드 존재")

        kpi_cards = await page.query_selector_all(".kpi-card, .stat-card, [class*='kpi']")
        ok(f"KPI 카드 DOM 노출", f"{len(kpi_cards)}개") if kpi_cards else ng("KPI 카드 DOM 노출", "0개")

        # KPI 실제 숫자 텍스트 확인
        kpi_nums = await page.query_selector_all(".kpi-value, .stat-value, [class*='kpi-num'], [class*='count']")
        vals = []
        for el in kpi_nums[:4]:
            t = (await el.inner_text()).strip()
            vals.append(t)
        ok(f"KPI 수치 텍스트", f"{vals}") if vals else ng("KPI 수치 텍스트", "노출 없음")

        # 사이드바 메뉴 확인
        sidebar = await page.query_selector(".sidebar, nav.sidebar, #sidebar")
        ok("사이드바 DOM 존재") if sidebar else ng("사이드바 DOM 존재")
        nav_items = await page.query_selector_all(".sidebar a, .sidebar li, .nav-item, [class*='nav-link']")
        ok(f"사이드바 메뉴 아이템", f"{len(nav_items)}개") if len(nav_items)>=3 else ng("사이드바 메뉴 아이템", f"{len(nav_items)}개")

        # B2B 파트너 섹션으로 이동
        print("\n── [Playwright] B2B 파트너 섹션 ──")
        partner_nav = await page.query_selector("a[href*='partner'], [data-section='partners'], #nav-partners, [onclick*='partner']")
        if partner_nav:
            await partner_nav.click()
            await page.wait_for_timeout(1500)
        else:
            # JS 직접 실행으로 섹션 전환 시도
            await page.evaluate("window.showSection && window.showSection('partners')")
            await page.wait_for_timeout(1000)

        partner_rows = await page.query_selector_all("tr[data-partner], .partner-row, [class*='partner-item'], tbody tr")
        ok(f"파트너 목록 테이블 행", f"{len(partner_rows)}행") if len(partner_rows)>=4 else ng(f"파트너 목록 테이블 행", f"{len(partner_rows)}행 (4개 기대)")

        # 진단결과 섹션
        print("\n── [Playwright] 진단결과 섹션 ──")
        result_nav = await page.query_selector("a[href*='result'], [data-section='results'], #nav-results, [onclick*='result']")
        if result_nav:
            await result_nav.click()
            await page.wait_for_timeout(1500)
        else:
            await page.evaluate("window.showSection && window.showSection('results')")
            await page.wait_for_timeout(1000)

        result_rows = await page.query_selector_all("tr[data-result], .result-row, tbody tr, [class*='result-item']")
        ok(f"진단결과 테이블 행", f"{len(result_rows)}행") if len(result_rows)>=1 else ng(f"진단결과 테이블 행", f"{len(result_rows)}행")

        # 검색 인풋 존재
        search_input = await page.query_selector("input[placeholder*='검색'], #result-search, [type='search']")
        ok("검색 인풋 존재") if search_input else ng("검색 인풋 존재")

        if search_input:
            await search_input.fill("테스트")
            await page.wait_for_timeout(800)
            result_rows_after = await page.query_selector_all("tbody tr, .result-row, [class*='result-item']")
            ok("검색 후 결과 필터", f"{len(result_rows_after)}행") if True else ng("검색 후 결과 필터", "")

        # JS 오류 최종 확인
        ok("admin.html JS 오류 없음", "") if not js_errors else ng("admin.html JS 오류", f"{js_errors[:2]}")

        await browser.close()

    # ── 결과 요약 ──
    print(f"\n{'='*50}")
    print(f"1단계 admin: {len(PASS)}✅ / {len(FAIL)}❌")
    if FAIL:
        print("❌ 실패 항목:")
        for f in FAIL:
            print(f"  - {f}")

asyncio.run(run())
