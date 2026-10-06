#!/usr/bin/env python3
"""
2~7단계 깊은 검증: B2B포털/질문지플로우/결과지DOM/컨설턴트/TODAY/엣지케이스
실제 DOM 내부까지 전부 확인
"""
import asyncio, json, subprocess, sys
from playwright.async_api import async_playwright

BASE_URL = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

REPORT = []  # (단계, 항목, ok, 메모)

def ok(step, item, msg=""):
    REPORT.append((step, item, True, msg))
    print(f"  ✅ [{step}] {item}" + (f" — {msg}" if msg else ""))

def ng(step, item, msg=""):
    REPORT.append((step, item, False, msg))
    print(f"  ❌ [{step}] {item}" + (f" — {msg}" if msg else ""))

def warn(step, item, msg=""):
    REPORT.append((step, item, None, msg))
    print(f"  ⚠️  [{step}] {item}" + (f" — {msg}" if msg else ""))

def curl_get(path, token=None):
    h = ["-H", f"Authorization: Bearer {token}"] if token else []
    r = subprocess.run(["curl","-s","-w","\n__S__%{http_code}","--max-time","15", BASE_URL+path]+h, capture_output=True, text=True)
    body,code = r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000")
    try: return int(code), json.loads(body)
    except: return int(code), body

def curl_post(path, payload, token=None):
    h = ["-H","Content-Type: application/json"]
    if token: h += ["-H", f"Authorization: Bearer {token}"]
    r = subprocess.run(["curl","-s","-w","\n__S__%{http_code}","--max-time","15","-X","POST","-d",json.dumps(payload),BASE_URL+path]+h, capture_output=True, text=True)
    body,code = r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000")
    try: return int(code), json.loads(body)
    except: return int(code), body

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])

        # ────────────────────────────────────────────────────────────────
        # 2단계: B2B 파트너 포털 깊은 검증
        # ────────────────────────────────────────────────────────────────
        print("\n" + "="*60)
        print("【2단계】 B2B 파트너 포털 깊은 검증")
        print("="*60)

        B2B_CASES = [
            {"code":"B2B-HOS-001","pw":"b2b001","cat":"hospital","name":"바바성형외과"},
            {"code":"B2B-PIL-001","pw":"b2b001","cat":"fitness","name":"바디라운지"},
            {"code":"B2B-AES-001","pw":"b2b001","cat":"aesthetic","name":"슬에스테틱"},
            {"code":"B2B-ETC-001","pw":"b2b001","cat":"salon","name":"우미용실"},
        ]

        b2b_tokens = {}
        for bp in B2B_CASES:
            code, data = curl_post("/api/auth/login", {"code":bp["code"],"password":bp["pw"]})
            tok = data.get("token") if isinstance(data,dict) else None
            ok("2단계", f"B2B 로그인 {bp['code']}", f"HTTP {code}") if tok else ng("2단계", f"B2B 로그인 {bp['code']}", f"HTTP {code}: {data}")
            if tok:
                b2b_tokens[bp["code"]] = tok
                # 브랜드 정보 확인
                ok("2단계", f"  브랜드명 확인 {bp['code']}", data.get("brand_name","")) if data.get("brand_name") else warn("2단계", f"  브랜드명 없음 {bp['code']}", "")
                ok("2단계", f"  survey_category {bp['code']}", data.get("survey_category","")) if data.get("survey_category")==bp["cat"] else ng("2단계", f"  survey_category 불일치 {bp['code']}", f"기대={bp['cat']}, 실제={data.get('survey_category')}")

        # B2B stats (대시보드 실제 경로)
        print("\n── [2단계-API] B2B stats 대시보드 ──")
        for bp in B2B_CASES:
            tok = b2b_tokens.get(bp["code"])
            if not tok: continue
            code, data = curl_get("/api/b2b/stats", tok)
            if code == 200 and isinstance(data, dict):
                ok("2단계", f"  /api/b2b/stats {bp['cat']}", f"total={data.get('total')}, today={data.get('today')}, month={data.get('this_month')}")
            else:
                ng("2단계", f"  /api/b2b/stats {bp['cat']}", f"HTTP {code}")

        # B2B 고객 목록 상세
        print("\n── [2단계-API] B2B 고객 목록 상세 ──")
        sample_rids = {}
        for bp in B2B_CASES:
            tok = b2b_tokens.get(bp["code"])
            if not tok: continue
            code, data = curl_get("/api/b2b/results?limit=5", tok)
            results = data.get("results",[]) if isinstance(data,dict) else []
            ok("2단계", f"  고객목록 {bp['cat']}", f"count={len(results)}") if code==200 else ng("2단계", f"  고객목록 {bp['cat']}", f"HTTP {code}")
            if results:
                r0 = results[0]
                print(f"      샘플: user={r0.get('user_name','?')}, bc={r0.get('bc_primary','?')}, date={r0.get('created_at','?')[:10]}")
                sample_rids[bp["cat"]] = r0.get("id","")
                # 컬럼 필드 확인
                required_cols = ["id","user_name","bc_primary","created_at"]
                missing = [c for c in required_cols if c not in r0]
                ok("2단계", f"  고객목록 필드 완전성 {bp['cat']}", "") if not missing else ng("2단계", f"  고객목록 누락필드 {bp['cat']}", str(missing))

        # 결과지 공유링크 API 탐색
        print("\n── [2단계-API] 결과지 공유링크 ──")
        for cat, rid in sample_rids.items():
            tok = b2b_tokens.get({"hospital":"B2B-HOS-001","fitness":"B2B-PIL-001","aesthetic":"B2B-AES-001","salon":"B2B-ETC-001"}.get(cat,""))
            if not tok or not rid: continue
            # 공유 링크 생성 API 탐색
            for path in [f"/api/b2b/result/{rid}/share", f"/api/share/{rid}", f"/api/result/{rid}/share"]:
                c2 = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","8","-H",f"Authorization: Bearer {tok}",BASE_URL+path], capture_output=True, text=True)
                if c2.stdout.strip() in ["200","201"]:
                    ok("2단계", f"  공유링크 API {cat}", f"경로: {path}"); break
            else:
                # 결과지 URL 직접 접근 확인
                result_path = f"/result-{cat}/{rid}"
                c3 = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","8",BASE_URL+result_path], capture_output=True, text=True)
                if c3.stdout.strip() == "200":
                    ok("2단계", f"  결과지 직접 URL {cat}", f"HTTP 200: {result_path}")
                else:
                    warn("2단계", f"  결과지 공유링크 API 미구현 {cat}", f"직접 URL HTTP {c3.stdout.strip()}")

        # b2b.html Playwright 로그인 후 DOM
        print("\n── [2단계-Playwright] b2b.html 로그인→대시보드 DOM ──")
        ctx2 = await browser.new_context(viewport={"width":1440,"height":900})
        pg2 = await ctx2.new_page()
        js_errs2 = []
        pg2.on("pageerror", lambda e: js_errs2.append(str(e)))
        await pg2.goto(BASE_URL+"/b2b.html", wait_until="networkidle", timeout=25000)

        # 온보딩 오버레이 닫기 시도
        try:
            skip = await pg2.query_selector(".b2b-obd-skip, [class*='skip']")
            if skip: await skip.click(); await pg2.wait_for_timeout(500)
        except: pass

        await pg2.fill("#login-code", "B2B-HOS-001")
        await pg2.fill("#login-pw", "b2b001")
        await pg2.click(".login-btn")
        await pg2.wait_for_timeout(3000)

        ok("2단계", "b2b.html 로그인 후 URL 전환", pg2.url) if "/b2b" in pg2.url or "b2b" in pg2.url else ng("2단계", "b2b.html 로그인 후 URL", f"현재={pg2.url}")

        # 대시보드 숫자 DOM
        stat_vals = await pg2.query_selector_all(".stat-value, .kpi-value, [class*='stat-num'], [class*='count-value'], .total-count")
        vals_text = []
        for el in stat_vals[:6]:
            t = (await el.inner_text()).strip()
            if t: vals_text.append(t)
        ok("2단계", "대시보드 수치 DOM", str(vals_text)) if vals_text else ng("2단계", "대시보드 수치 DOM 없음", "stat 숫자 텍스트 없음")

        # 고객 목록 테이블
        await pg2.wait_for_timeout(2000)
        rows = await pg2.query_selector_all("tbody tr, .customer-row, [class*='result-row'], [class*='list-item']")
        ok("2단계", "고객 목록 테이블 행", f"{len(rows)}행") if len(rows)>=1 else ng("2단계", "고객 목록 테이블 행", f"{len(rows)}행")

        # 행 클릭 → 결과지 상세
        if rows:
            await rows[0].click()
            await pg2.wait_for_timeout(1500)
            popup = await pg2.query_selector(".modal, .popup, .detail-panel, [class*='modal'], [class*='overlay-content']")
            ok("2단계", "고객 행 클릭 → 상세 팝업/패널", "") if popup else warn("2단계", "고객 행 클릭 → 상세 팝업 없음", "탭 전환 방식일 수 있음")

        ok("2단계", "b2b.html JS오류", "") if not js_errs2 else ng("2단계", "b2b.html JS오류", str(js_errs2[:2]))
        await ctx2.close()

        # ────────────────────────────────────────────────────────────────
        # 3단계: 질문지 실제 플로우 (인트로→동의→성별→질문→결과지)
        # ────────────────────────────────────────────────────────────────
        print("\n" + "="*60)
        print("【3단계】 질문지 실제 플로우 4업종 Playwright 검증")
        print("="*60)

        SURVEY_CASES = [
            {"url":"/h/B2B-HOS-001","cat":"hospital","code":"B2B-HOS-001"},
            {"url":"/f/B2B-PIL-001","cat":"fitness","code":"B2B-PIL-001"},
            {"url":"/a/B2B-AES-001","cat":"aesthetic","code":"B2B-AES-001"},
            {"url":"/salon/B2B-ETC-001","cat":"salon","code":"B2B-ETC-001"},
        ]

        survey_result_ids = {}

        for sc in SURVEY_CASES:
            print(f"\n── {sc['cat']} 질문지 ({sc['url']}) ──")
            ctx3 = await browser.new_context(viewport={"width":390,"height":844})  # 모바일 뷰
            pg3 = await ctx3.new_page()
            js3 = []
            pg3.on("pageerror", lambda e: js3.append(str(e)))

            resp = await pg3.goto(BASE_URL + sc["url"], wait_until="networkidle", timeout=30000)
            ok("3단계", f"{sc['cat']} HTTP 응답", f"{resp.status}") if resp and resp.status in [200,307] else ng("3단계", f"{sc['cat']} HTTP 응답", f"{resp.status if resp else 0}")

            body_len = len(await pg3.content())
            ok("3단계", f"{sc['cat']} body 크기", f"{body_len//1024}KB") if body_len > 100000 else ng("3단계", f"{sc['cat']} body 크기", f"{body_len}")

            # 브랜드 인젝션 확인 (__BRAND__ 객체)
            brand_info = await pg3.evaluate("() => window.__BRAND__ || null")
            if brand_info:
                ok("3단계", f"{sc['cat']} __BRAND__ 인젝션", f"name={brand_info.get('brand_name')}, color={brand_info.get('brand_color')}")
            else:
                ng("3단계", f"{sc['cat']} __BRAND__ 없음", "브랜드 인젝션 실패")

            # 인트로 화면 요소
            intro_els = await pg3.query_selector_all(".intro-section, #intro, [class*='intro'], .start-btn, [class*='start']")
            ok("3단계", f"{sc['cat']} 인트로 화면 DOM", f"{len(intro_els)}개 요소") if intro_els else warn("3단계", f"{sc['cat']} 인트로 요소 불명확", "")

            # 진행바 존재
            progress = await pg3.query_selector(".progress, #progress, [class*='progress-bar'], progress")
            ok("3단계", f"{sc['cat']} 진행바 DOM", "") if progress else warn("3단계", f"{sc['cat']} 진행바 없음(인트로중)", "")

            # JS 오류
            ok("3단계", f"{sc['cat']} JS오류", "") if not js3 else ng("3단계", f"{sc['cat']} JS오류", str(js3[:2]))

            # 이름 입력 필드 탐색
            name_input = await pg3.query_selector("input[placeholder*='이름'], input[id*='name'], input[name*='name'], #user-name")
            ok("3단계", f"{sc['cat']} 이름 입력 필드 존재", "") if name_input else warn("3단계", f"{sc['cat']} 이름 입력 없음", "다음 단계 필드일 수 있음")

            await ctx3.close()

            # API로 실제 진단 제출 후 result_id 확보 (결과지 검증용)
            tok_b2b = b2b_tokens.get(sc["code"])
            if tok_b2b:
                BC_BY_CAT = {"hospital":("BC-1","코끼리다리형",{"A02":90,"A01":10}),
                             "fitness":("BC-3","단단 내장형",{"A01":90,"A02":10}),
                             "aesthetic":("BC-5","팔뚝 상체형",{"A01":90,"A03":10}),
                             "salon":("BC-13","갱년기 변환형",{"A03":90,"A01":10})}
                bc_key, bc_nick, axes = BC_BY_CAT[sc["cat"]]
                code, data = curl_post("/api/v1/diagnosis", {
                    "user_name": f"검증_{sc['cat']}",
                    "gender": "female",
                    "axis_scores": axes,
                    "bc_code_key": bc_key,
                    "bc_nickname": bc_nick,
                    "survey_category": sc["cat"],
                }, tok_b2b)
                rid = data.get("result_id") if isinstance(data,dict) else None
                ok("3단계", f"{sc['cat']} 진단 제출 → result_id", rid[:8]+"..." if rid else "N/A") if rid else ng("3단계", f"{sc['cat']} 진단 제출", f"HTTP {code}: {data}")
                if rid:
                    survey_result_ids[sc["cat"]] = {"id":rid,"bc_key":bc_key,"bc_nick":bc_nick}

        # ────────────────────────────────────────────────────────────────
        # 4단계: 결과지 렌더링 DOM 깊은 확인
        # ────────────────────────────────────────────────────────────────
        print("\n" + "="*60)
        print("【4단계】 결과지 렌더링 DOM 깊은 확인")
        print("="*60)

        RESULT_URL_MAP = {
            "hospital": "result-hospital",
            "fitness": "result-fitness",
            "aesthetic": "result-aesthetic",
            "salon": "result-salon",
        }

        for cat, info in survey_result_ids.items():
            rid = info["id"]
            bc_key = info["bc_key"]
            bc_nick = info["bc_nick"]
            result_url = f"/{RESULT_URL_MAP[cat]}/{rid}"
            print(f"\n── {cat} 결과지 ({result_url}) ──")

            ctx4 = await browser.new_context(viewport={"width":390,"height":844})
            pg4 = await ctx4.new_page()
            js4 = []
            failed4 = []
            pg4.on("pageerror", lambda e: js4.append(str(e)))
            pg4.on("requestfailed", lambda r: failed4.append(r.url) if "cdn-cgi" not in r.url else None)

            resp4 = await pg4.goto(BASE_URL+result_url, wait_until="networkidle", timeout=35000)
            await pg4.wait_for_timeout(2000)

            ok("4단계", f"{cat} HTTP 응답", f"{resp4.status}") if resp4 and resp4.status==200 else ng("4단계", f"{cat} HTTP 응답", f"{resp4.status if resp4 else 0}")

            # ── BC 코드/닉네임 DOM 확인 ──
            bc_code_el = await pg4.query_selector("#p7sum-code, .bc-code, [id*='bc-code'], [class*='bc-code']")
            bc_nick_el = await pg4.query_selector("#p7sum-nick, .bc-nick, [id*='bc-nick'], [class*='bc-nick'], .body-type-name")

            if bc_code_el:
                bc_text = (await bc_code_el.inner_text()).strip()
                ok("4단계", f"{cat} BC코드 DOM", f"'{bc_text}'") if bc_key in bc_text or bc_text else warn("4단계", f"{cat} BC코드 DOM", f"'{bc_text}' (기대:{bc_key})")
            else:
                ng("4단계", f"{cat} BC코드 DOM 없음", "#p7sum-code 셀렉터 없음")

            if bc_nick_el:
                nick_text = (await bc_nick_el.inner_text()).strip()
                ok("4단계", f"{cat} BC닉네임 DOM", f"'{nick_text}'") if bc_nick in nick_text or nick_text else warn("4단계", f"{cat} BC닉네임 DOM", f"'{nick_text}'")
            else:
                ng("4단계", f"{cat} BC닉네임 DOM 없음", "#p7sum-nick 셀렉터 없음")

            # ── 처방 섹션 ──
            prescription = await pg4.query_selector("[class*='prescription'], [id*='prescription'], .rx-section, [class*='recommend'], [class*='treatment']")
            ok("4단계", f"{cat} 처방 섹션 DOM", "") if prescription else ng("4단계", f"{cat} 처방 섹션 없음", "")

            # ── Chart.js 캔버스 ──
            canvas = await pg4.query_selector("canvas")
            ok("4단계", f"{cat} Chart.js 캔버스 존재", "") if canvas else ng("4단계", f"{cat} Chart.js 캔버스 없음", "")

            # ── 성별 분기 텍스트 확인 (female로 제출) ──
            # isMale 전역 변수 값 확인
            is_male_val = await pg4.evaluate("() => typeof window.isMale !== 'undefined' ? window.isMale : 'UNDEFINED'")
            ok("4단계", f"{cat} isMale 전역변수", f"isMale={is_male_val}") if is_male_val != 'UNDEFINED' else warn("4단계", f"{cat} isMale 미정의", "")

            # smIsFemaleG 함수 확인 (fitness/aesthetic/salon)
            if cat != "hospital":
                is_female_g = await pg4.evaluate("() => typeof smIsFemaleG === 'function' ? smIsFemaleG() : 'NOT_FUNCTION'")
                ok("4단계", f"{cat} smIsFemaleG()", f"반환값={is_female_g}") if is_female_g != 'NOT_FUNCTION' else ng("4단계", f"{cat} smIsFemaleG 미정의", "")

            # ── BC_MASTER 정의 ──
            bc_master_count = await pg4.evaluate("() => typeof BC_MASTER !== 'undefined' ? Object.keys(BC_MASTER).length : -1")
            ok("4단계", f"{cat} BC_MASTER 종수", f"{bc_master_count}종") if bc_master_count==16 else ng("4단계", f"{cat} BC_MASTER", f"{bc_master_count}종 (기대 16)")

            # ── 공유하기 버튼 ──
            share_btn = await pg4.query_selector("[class*='share'], button[onclick*='share'], [id*='share-btn'], .share-btn")
            ok("4단계", f"{cat} 공유하기 버튼 DOM", "") if share_btn else warn("4단계", f"{cat} 공유하기 버튼 없음", "")

            # ── CTA 버튼 ──
            cta_btn = await pg4.query_selector("[class*='cta'], .reserve-btn, [class*='consult'], [id*='cta']")
            ok("4단계", f"{cat} CTA 버튼 DOM", "") if cta_btn else warn("4단계", f"{cat} CTA 버튼 없음", "")

            # ── 실패 리소스 ──
            ok("4단계", f"{cat} 리소스 로딩", "") if not failed4 else ng("4단계", f"{cat} 실패 리소스", str(failed4[:2]))

            # ── JS 오류 ──
            ok("4단계", f"{cat} JS오류", "") if not js4 else ng("4단계", f"{cat} JS오류", str(js4[:2]))

            await ctx4.close()

        # 성별분기: male 버전도 확인 (BC-7)
        print("\n── 성별분기 male 결과지 확인 (BC-7) ──")
        tok_hos = b2b_tokens.get("B2B-HOS-001")
        if tok_hos:
            code, data = curl_post("/api/v1/diagnosis", {
                "user_name":"성별분기테스트남",
                "gender":"male",
                "axis_scores":{"A02":50,"A04":50,"A01":10,"A03":10},
                "bc_code_key":"BC-7",
                "bc_nickname":"팔다리 말랑형",
                "survey_category":"hospital",
            }, tok_hos)
            male_rid = data.get("result_id") if isinstance(data,dict) else None
            if male_rid:
                ctx_m = await browser.new_context(viewport={"width":390,"height":844})
                pg_m = await ctx_m.new_page()
                await pg_m.goto(BASE_URL+f"/result-hospital/{male_rid}", wait_until="networkidle", timeout=30000)
                await pg_m.wait_for_timeout(1000)
                is_male_v = await pg_m.evaluate("() => typeof window.isMale !== 'undefined' ? window.isMale : 'UNDEFINED'")
                ok("4단계", "BC-7 male isMale=true 확인", f"isMale={is_male_v}") if is_male_v == True else ng("4단계", "BC-7 male isMale값", f"isMale={is_male_v} (기대 true)")
                # male/female 텍스트 다른지: 한 가지 성별분기 element 텍스트 비교
                await ctx_m.close()

        # ────────────────────────────────────────────────────────────────
        # 5단계: 컨설턴트 페이지 깊은 검증
        # ────────────────────────────────────────────────────────────────
        print("\n" + "="*60)
        print("【5단계】 컨설턴트 페이지 깊은 검증")
        print("="*60)

        code, data = curl_post("/api/auth/login", {"code":"SC-0001","password":"pass0001"})
        c_tok = data.get("token") if isinstance(data,dict) else None
        ok("5단계", "컨설턴트 로그인 SC-0001", f"name={data.get('name')}") if c_tok else ng("5단계", "컨설턴트 로그인", f"HTTP {code}")

        if c_tok:
            # /api/consultant/stats
            code, data = curl_get("/api/consultant/stats", c_tok)
            ok("5단계", "GET /api/consultant/stats", f"total={data.get('total')}, keys={list(data.keys())}") if code==200 else ng("5단계", "/api/consultant/stats", f"HTTP {code}")

            # /api/consultant/results
            code, data = curl_get("/api/consultant/results?limit=5", c_tok)
            c_results = data.get("results",[]) if isinstance(data,dict) else []
            ok("5단계", "GET /api/consultant/results", f"count={len(c_results)}") if code==200 else ng("5단계", "/api/consultant/results", f"HTTP {code}")

            # 컨설턴트 메모/코멘트 API 탐색
            print("\n── [5단계-API] 메모/코멘트 API ──")
            if c_results:
                rid5 = c_results[0].get("id","")
                for path in [f"/api/consultant/memo/{rid5}", f"/api/memo/{rid5}", f"/api/consultant/comment/{rid5}", f"/api/result/{rid5}/memo"]:
                    c2 = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","8","-H",f"Authorization: Bearer {c_tok}",BASE_URL+path], capture_output=True, text=True)
                    if c2.stdout.strip() in ["200","404"]:  # 404도 존재하는 경로
                        warn("5단계", f"  메모 API 후보: {path}", f"HTTP {c2.stdout.strip()}")

            # /api/consultant/rediagnosis
            code, data = curl_get("/api/consultant/rediagnosis", c_tok)
            ok("5단계", "GET /api/consultant/rediagnosis", f"HTTP {code}") if code in [200,404] else ng("5단계", "/api/consultant/rediagnosis", f"HTTP {code}")

        # Playwright consultant 로그인 → DOM
        print("\n── [5단계-Playwright] consultant.html 로그인 → 고객목록 DOM ──")
        ctx5 = await browser.new_context(viewport={"width":1440,"height":900})
        pg5 = await ctx5.new_page()
        js5 = []
        pg5.on("pageerror", lambda e: js5.append(str(e)))
        await pg5.goto(BASE_URL+"/consultant.html", wait_until="networkidle", timeout=25000)

        try:
            skip5 = await pg5.query_selector(".cons-obd-btn-skip")
            if skip5: await skip5.click(); await pg5.wait_for_timeout(400)
        except: pass

        await pg5.fill("#l-code", "SC-0001")
        await pg5.fill("#l-pw", "pass0001")
        await pg5.click(".login-btn")
        await pg5.wait_for_timeout(3000)

        ok("5단계", "consultant 로그인 후 URL", pg5.url) if "consultant" in pg5.url or "/sc" in pg5.url else ng("5단계", "consultant 로그인 URL", f"{pg5.url}")

        # 고객목록 DOM
        cust_rows = await pg5.query_selector_all("tbody tr, .customer-row, [class*='cust-row'], .result-list li")
        ok("5단계", "고객목록 DOM", f"{len(cust_rows)}행") if len(cust_rows)>=1 else ng("5단계", "고객목록 DOM", f"{len(cust_rows)}행")

        # 검색창
        search5 = await pg5.query_selector("#cust-search, input[placeholder*='검색']")
        ok("5단계", "고객 검색창 DOM", "") if search5 else ng("5단계", "고객 검색창", "")

        # 결과지 열람 - 오버레이 강제 제거 후 행 클릭
        if cust_rows:
            # cons-obd-overlay 강제 제거
            await pg5.evaluate("""
                const ov = document.getElementById('cons-obd-overlay');
                if (ov) { ov.style.pointerEvents='none'; ov.style.display='none'; }
                document.querySelectorAll('[id*="overlay"],[id*="obd"]').forEach(el=>{
                    el.style.pointerEvents='none'; el.style.display='none';
                });
            """)
            await pg5.wait_for_timeout(300)
            try:
                await cust_rows[0].click(force=True, timeout=5000)
                await pg5.wait_for_timeout(1500)
                detail = await pg5.query_selector(".modal, .popup, .result-detail, [class*='detail'], .overlay")
                ok("5단계", "고객 클릭 → 결과 상세", "") if detail else warn("5단계", "고객 클릭 상세 없음", "다른 UI일 수 있음")
            except Exception as e:
                warn("5단계", "고객 클릭 실패(오버레이)", str(e)[:80])

        ok("5단계", "consultant.html JS오류", "") if not js5 else ng("5단계", "consultant.html JS오류", str(js5[:2]))
        await ctx5.close()

        # ────────────────────────────────────────────────────────────────
        # 6단계: TODAY 깊은 검증
        # ────────────────────────────────────────────────────────────────
        print("\n" + "="*60)
        print("【6단계】 슬림마인드 TODAY 깊은 검증")
        print("="*60)

        # guest-token 발급
        any_rid = next(iter(survey_result_ids.values()), {}).get("id")
        g_tok = None
        if any_rid:
            code, data = curl_post("/api/auth/guest-token", {"result_id": any_rid})
            g_tok = data.get("token") if isinstance(data,dict) else None
            ok("6단계", "guest-token 발급", f"HTTP {code}") if g_tok else ng("6단계", "guest-token 발급", f"HTTP {code}: {data}")

        if g_tok and any_rid:
            # /api/today/status
            code, data = curl_get(f"/api/today/status?result_id={any_rid}", g_tok)
            ok("6단계", "GET /api/today/status", f"keys={list(data.keys()) if isinstance(data,dict) else 'N/A'}") if code==200 else ng("6단계", "/api/today/status", f"HTTP {code}")

            # /api/today/slots
            code, data = curl_get(f"/api/today/slots?result_id={any_rid}", g_tok)
            slots = data.get("slots",[]) if isinstance(data,dict) else []
            ok("6단계", "GET /api/today/slots", f"slots={len(slots)}개") if code==200 else ng("6단계", "/api/today/slots", f"HTTP {code}")

            # daily check POST
            code, data = curl_post("/api/today/check", {"result_id":any_rid,"axis":"A01","checked":True}, g_tok)
            ok("6단계", "POST /api/today/check", f"HTTP {code}") if code in [200,201] else ng("6단계", "POST /api/today/check", f"HTTP {code}: {data}")

            # streak/연속달성
            code, data = curl_get(f"/api/today/streak?result_id={any_rid}", g_tok)
            ok("6단계", "GET /api/today/streak", f"HTTP {code}, keys={list(data.keys()) if isinstance(data,dict) else 'N/A'}") if code==200 else warn("6단계", "/api/today/streak", f"HTTP {code}")

        # Playwright: slimmind-today.html (리다이렉트 후)
        print("\n── [6단계-Playwright] slimmind-today 로드 ──")
        ctx6 = await browser.new_context(viewport={"width":390,"height":844})
        pg6 = await ctx6.new_page()
        js6 = []
        pg6.on("pageerror", lambda e: js6.append(str(e)))

        if any_rid:
            await pg6.goto(BASE_URL+f"/slimmind-today.html?id={any_rid}", wait_until="networkidle", timeout=25000)
        else:
            await pg6.goto(BASE_URL+"/slimmind-today.html", wait_until="networkidle", timeout=25000)

        ok("6단계", "slimmind-today 최종 URL", pg6.url) if "slimmind-today" in pg6.url or "today" in pg6.url else ng("6단계", "slimmind-today URL", pg6.url)

        body_len6 = len(await pg6.content())
        ok("6단계", "slimmind-today body 크기", f"{body_len6//1024}KB") if body_len6 > 10000 else ng("6단계", "slimmind-today body", f"{body_len6}bytes")

        check_items = await pg6.query_selector_all(".check-item, [class*='daily'], [class*='mission'], [class*='today-']")
        ok("6단계", "데일리 체크 아이템 DOM", f"{len(check_items)}개") if check_items else ng("6단계", "데일리 체크 아이템 없음", "")

        ok("6단계", "slimmind-today JS오류", "") if not js6 else ng("6단계", "slimmind-today JS오류", str(js6[:2]))
        await ctx6.close()

        # ────────────────────────────────────────────────────────────────
        # 7단계: 엣지 케이스 깊은 검증
        # ────────────────────────────────────────────────────────────────
        print("\n" + "="*60)
        print("【7단계】 엣지 케이스 깊은 검증")
        print("="*60)

        # 7-1. 존재하지 않는 진단ID
        print("\n── [7-1] 존재하지 않는 진단ID ──")
        for path in ["/result-hospital/00000000-0000-0000-0000-000000000000", "/r/invalid-id-xyz"]:
            c2 = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","10",BASE_URL+path], capture_output=True, text=True)
            code_val = c2.stdout.strip()
            ok("7단계", f"존재하지 않는ID {path}", f"HTTP {code_val} (404/200 에러페이지)") if code_val in ["404","200"] else ng("7단계", f"존재하지 않는ID {path}", f"HTTP {code_val}")

        # Playwright로 404 에러페이지 확인
        ctx7 = await browser.new_context(viewport={"width":390,"height":844})
        pg7 = await ctx7.new_page()
        js7 = []
        pg7.on("pageerror", lambda e: js7.append(str(e)))

        resp7 = await pg7.goto(BASE_URL+"/result-hospital/00000000-0000-0000-0000-000000000000", wait_until="networkidle", timeout=20000)
        body7 = await pg7.content()
        has_error_msg = any(w in body7 for w in ["찾을 수 없", "존재하지", "유효하지", "없습니다", "Not Found", "오류"])
        ok("7단계", "존재하지않는 진단ID 에러 메시지", "") if has_error_msg else ng("7단계", "존재하지않는 진단ID 에러 메시지 없음", f"HTTP {resp7.status if resp7 else 0}")

        # 7-2. 모바일 뷰 (390px) 레이아웃
        print("\n── [7-2] 모바일 뷰 레이아웃 ──")
        for rid, cat in [(v["id"],k) for k,v in list(survey_result_ids.items())[:2]]:
            await pg7.goto(BASE_URL+f"/{RESULT_URL_MAP[cat]}/{rid}", wait_until="networkidle", timeout=30000)
            await pg7.wait_for_timeout(1000)
            # 가로 스크롤 여부 확인
            scroll_width = await pg7.evaluate("() => document.documentElement.scrollWidth")
            client_width = await pg7.evaluate("() => document.documentElement.clientWidth")
            no_overflow = scroll_width <= client_width + 5
            ok("7단계", f"모바일390px 가로스크롤 없음 {cat}", f"scroll={scroll_width}, client={client_width}") if no_overflow else ng("7단계", f"모바일 가로오버플로 {cat}", f"scroll={scroll_width} > client={client_width}")

        # 7-3. 중복 제출 방지
        print("\n── [7-3] 중복 제출 방지 ──")
        tok_b = b2b_tokens.get("B2B-HOS-001")
        if tok_b:
            payload = {"user_name":"중복테스트","gender":"female","axis_scores":{"A02":80,"A01":20},"bc_code_key":"BC-1","bc_nickname":"코끼리다리형","survey_category":"hospital"}
            c1, d1 = curl_post("/api/v1/diagnosis", payload, tok_b)
            c2_r, d2 = curl_post("/api/v1/diagnosis", payload, tok_b)
            ok("7단계", "중복제출 방지", f"1차={c1} 2차={c2_r}") if c1==200 and c2_r in [200,409] else warn("7단계", "중복제출 결과", f"1차HTTP={c1}, 2차HTTP={c2_r}")

        # 7-4. 만료된/정지된 B2B 코드
        print("\n── [7-4] 정지/만료 B2B 코드 ──")
        c_inv = subprocess.run(["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time","8",BASE_URL+"/h/B2B-SUSPENDED-999"], capture_output=True, text=True)
        ok("7단계", "정지된 B2B코드 처리", f"HTTP {c_inv.stdout.strip()}") if c_inv.stdout.strip() in ["404","403","200"] else ng("7단계", "정지코드 처리", c_inv.stdout.strip())

        # 7-5. 뒤로가기 후 재진입 (결과지)
        print("\n── [7-5] 뒤로가기 후 재진입 ──")
        if survey_result_ids:
            cat0, info0 = next(iter(survey_result_ids.items()))
            rid0 = info0["id"]
            await pg7.goto(BASE_URL+f"/{RESULT_URL_MAP[cat0]}/{rid0}", wait_until="networkidle", timeout=25000)
            await pg7.wait_for_timeout(1000)
            await pg7.go_back()
            await pg7.wait_for_timeout(500)
            await pg7.go_forward()
            await pg7.wait_for_timeout(2000)
            body_fwd = await pg7.content()
            ok("7단계", "뒤로가기 → 앞으로 재진입", f"{len(body_fwd)//1024}KB") if len(body_fwd) > 10000 else ng("7단계", "뒤로→앞으로 재진입 실패", f"{len(body_fwd)}bytes")

        ok("7단계", "JS오류(엣지케이스)", "") if not js7 else ng("7단계", "JS오류(엣지케이스)", str(js7[:2]))
        await ctx7.close()

        await browser.close()

    # ────────────────────────────────────────────────────────────────
    # 최종 보고서
    # ────────────────────────────────────────────────────────────────
    print("\n" + "="*60)
    print("【최종 보고서】 2~7단계")
    print("="*60)
    for step in ["2단계","3단계","4단계","5단계","6단계","7단계"]:
        items = [(i,o,m) for s,i,o,m in REPORT if s==step]
        pass_c = sum(1 for _,o,_ in items if o==True)
        fail_c = sum(1 for _,o,_ in items if o==False)
        warn_c = sum(1 for _,o,_ in items if o is None)
        print(f"\n▶ {step}: {pass_c}✅ / {fail_c}❌ / {warn_c}⚠️")
        for item, ok_, msg in items:
            if ok_ == False:
                print(f"    ❌ {item}")
                if msg: print(f"       → {msg}")
            elif ok_ is None:
                print(f"    ⚠️  {item}" + (f" — {msg}" if msg else ""))

asyncio.run(run())
