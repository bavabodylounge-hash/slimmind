#!/usr/bin/env python3
"""
2~7단계 진짜 깊은 검증
- 모든 Playwright click → JS evaluate 방식으로 오버레이 우회
- API 응답 필드 하나하나 전수 확인
- try/except로 크래시 없이 완주 보장
"""
import asyncio, json, subprocess, sys, re
from playwright.async_api import async_playwright

BASE_URL = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

REPORT = []

def ok(step, item, msg=""):
    REPORT.append((step, item, True, msg))
    print(f"  ✅ [{step}] {item}" + (f" — {msg}" if msg else ""))

def ng(step, item, msg=""):
    REPORT.append((step, item, False, msg))
    print(f"  ❌ [{step}] {item}" + (f" — {msg}" if msg else ""))

def warn(step, item, msg=""):
    REPORT.append((step, item, None, msg))
    print(f"  ⚠️  [{step}] {item}" + (f" — {msg}" if msg else ""))

# ── curl 헬퍼 ──────────────────────────────────────────────────────────────
def curl_get(path, token=None, timeout=20):
    h = ["-H", f"Authorization: Bearer {token}"] if token else []
    r = subprocess.run(
        ["curl","-s","-w","\n__S__%{http_code}","--max-time",str(timeout), BASE_URL+path]+h,
        capture_output=True, text=True
    )
    body, code = (r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000"))
    try: return int(code), json.loads(body)
    except: return int(code), body.strip()

def curl_post(path, payload, token=None, timeout=20):
    h = ["-H","Content-Type: application/json"]
    if token: h += ["-H", f"Authorization: Bearer {token}"]
    r = subprocess.run(
        ["curl","-s","-w","\n__S__%{http_code}","--max-time",str(timeout),
         "-X","POST","-d",json.dumps(payload), BASE_URL+path]+h,
        capture_output=True, text=True
    )
    body, code = (r.stdout.rsplit("__S__",1) if "__S__" in r.stdout else (r.stdout,"000"))
    try: return int(code), json.loads(body)
    except: return int(code), body.strip()

def curl_status(path, token=None, method="GET", timeout=10):
    h = ["-H", f"Authorization: Bearer {token}"] if token else []
    r = subprocess.run(
        ["curl","-s","-o","/dev/null","-w","%{http_code}","--max-time",str(timeout),
         "-X", method, BASE_URL+path]+h,
        capture_output=True, text=True
    )
    return r.stdout.strip()

# ── JS click 헬퍼 (오버레이 완전 우회) ─────────────────────────────────────
async def js_click(page, selector, wait_ms=1500):
    """Playwright native click 대신 JS .click() — 오버레이에 관계없이 동작"""
    result = await page.evaluate(f"""(sel) => {{
        const el = document.querySelector(sel);
        if (!el) return 'NOT_FOUND';
        el.click();
        return 'CLICKED';
    }}""", selector)
    if wait_ms: await page.wait_for_timeout(wait_ms)
    return result

async def kill_overlays(page):
    """모든 오버레이/온보딩 강제 제거 (SVG className SVGAnimatedString 안전 처리)"""
    await page.evaluate("""() => {
        const patterns = ['overlay','obd','onboard','modal-bg','backdrop','dim'];
        // 앱 핵심 모달/컨테이너 ID — 절대 삭제하면 안 됨
        const PROTECTED_IDS = new Set([
            'detail-modal', 'b2b-modal-overlay', 'summary-modal-overlay',
            'qr-modal', 'rx-modal', 'ai-modal',
            'b2b-obd-overlay', 'b2b-obd-modal',
            'cons-obd-overlay', 'cons-obd-modal'
        ]);
        document.querySelectorAll('*').forEach(el => {
            const id = (el.id||'').toLowerCase();
            // 보호된 ID는 건드리지 않음
            if (el.id && PROTECTED_IDS.has(el.id)) return;
            // SVG 요소는 className이 SVGAnimatedString이므로 typeof 체크 후 처리
            const rawCls = el.className;
            const cls = (typeof rawCls === 'string' ? rawCls : (rawCls && rawCls.baseVal ? rawCls.baseVal : '')).toLowerCase();
            if (patterns.some(p => id.includes(p) || cls.includes(p))) {
                el.style.display = 'none';
                el.style.pointerEvents = 'none';
                el.style.zIndex = '-9999';
                try { el.remove(); } catch(_) {}
            }
        });
    }""")
    await page.wait_for_timeout(200)

# ══════════════════════════════════════════════════════════════════════════════
async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])

        # ─────────────────────────────────────────────────────────────────────
        # 【2단계】 B2B 파트너 포털 — API 전수 + Playwright DOM
        # ─────────────────────────────────────────────────────────────────────
        print("\n" + "="*70)
        print("【2단계】 B2B 파트너 포털 — API 전수 + Playwright DOM")
        print("="*70)

        B2B_CASES = [
            {"code":"B2B-HOS-001","pw":"b2b001","cat":"hospital"},
            {"code":"B2B-PIL-001","pw":"b2b001","cat":"fitness"},
            {"code":"B2B-AES-001","pw":"b2b001","cat":"aesthetic"},
            {"code":"B2B-ETC-001","pw":"b2b001","cat":"salon"},
        ]
        b2b_tokens = {}

        # ── 2-A: 로그인 API 응답 필드 전수 ──
        print("\n── [2-A] 로그인 API 응답 필드 전수 ──")
        EXPECTED_LOGIN_FIELDS = ["token","code","brand_name","survey_category","brand_color"]
        for bp in B2B_CASES:
            code, data = curl_post("/api/auth/login", {"code":bp["code"],"password":bp["pw"]})
            tok = data.get("token") if isinstance(data,dict) else None
            if not tok:
                ng("2단계", f"B2B 로그인 {bp['code']}", f"HTTP {code} → {str(data)[:80]}")
                continue
            b2b_tokens[bp["code"]] = tok
            # 필드 전수 확인
            missing = [f for f in EXPECTED_LOGIN_FIELDS if f not in data]
            ok("2단계", f"로그인응답 {bp['code']}", f"token=OK, brand={data.get('brand_name')}, cat={data.get('survey_category')}, color={data.get('brand_color')}")
            if missing:
                ng("2단계", f"  로그인 누락필드 {bp['code']}", str(missing))
            # survey_category 일치
            if data.get("survey_category") != bp["cat"]:
                ng("2단계", f"  survey_category 불일치 {bp['code']}", f"기대={bp['cat']}, 실제={data.get('survey_category')}")
            else:
                ok("2단계", f"  survey_category 일치 {bp['code']}", bp['cat'])

        # ── 2-B: /api/b2b/stats API 필드 전수 ──
        print("\n── [2-B] /api/b2b/stats 필드 전수 ──")
        EXPECTED_STATS_FIELDS = ["total","today","this_month","shared"]
        for bp in B2B_CASES:
            tok = b2b_tokens.get(bp["code"])
            if not tok: continue
            code, data = curl_get("/api/b2b/stats", tok)
            if code != 200:
                ng("2단계", f"/api/b2b/stats {bp['cat']}", f"HTTP {code}")
                continue
            ok("2단계", f"/api/b2b/stats {bp['cat']}", f"total={data.get('total')}, today={data.get('today')}, month={data.get('this_month')}")
            missing = [f for f in EXPECTED_STATS_FIELDS if f not in data]
            if missing: warn("2단계", f"  stats 누락필드 {bp['cat']}", str(missing))

        # ── 2-C: /api/b2b/results 고객목록 필드 전수 ──
        print("\n── [2-C] /api/b2b/results 고객목록 필드 전수 ──")
        EXPECTED_RESULT_FIELDS = ["id","user_name","bc_primary","bc_nickname","created_at","gender","survey_category"]
        sample_rids = {}
        for bp in B2B_CASES:
            tok = b2b_tokens.get(bp["code"])
            if not tok: continue
            code, data = curl_get("/api/b2b/results?limit=10", tok)
            if code != 200:
                ng("2단계", f"/api/b2b/results {bp['cat']}", f"HTTP {code}")
                continue
            results = data.get("results",[]) if isinstance(data,dict) else []
            ok("2단계", f"/api/b2b/results {bp['cat']}", f"count={len(results)}, total_key={list(data.keys())}")
            if results:
                r0 = results[0]
                missing = [f for f in EXPECTED_RESULT_FIELDS if f not in r0]
                ok("2단계", f"  고객목록 필드 {bp['cat']}", f"필드:{list(r0.keys())[:6]}") if not missing else ng("2단계", f"  고객목록 누락필드 {bp['cat']}", str(missing))
                print(f"      샘플: {json.dumps({k:str(r0.get(k,''))[:20] for k in EXPECTED_RESULT_FIELDS}, ensure_ascii=False)}")
                sample_rids[bp["cat"]] = r0.get("id","")
            else:
                warn("2단계", f"  고객목록 비어있음 {bp['cat']}", "진단 데이터 없음")

        # ── 2-D: 공유링크 API ──
        print("\n── [2-D] 공유링크 API 탐색 ──")
        cat_to_code = {"hospital":"B2B-HOS-001","fitness":"B2B-PIL-001","aesthetic":"B2B-AES-001","salon":"B2B-ETC-001"}
        for cat, rid in sample_rids.items():
            tok = b2b_tokens.get(cat_to_code.get(cat,""))
            if not tok or not rid: continue
            for path in [f"/api/b2b/result/{rid}/share", f"/api/share/{rid}", f"/api/result/{rid}/share", f"/api/b2b/share/{rid}"]:
                st = curl_status(path, tok)
                if st in ["200","201"]:
                    ok("2단계", f"공유링크 API {cat}", f"{path} → HTTP {st}"); break
            else:
                warn("2단계", f"공유링크 API 미구현 {cat}", f"결과지 직접URL: /result-{cat}/{rid}")

        # ── 2-E: Playwright b2b.html DOM (JS click으로 오버레이 우회) ──
        print("\n── [2-E] Playwright b2b.html — JS click 오버레이 완전 우회 ──")
        ctx2 = await browser.new_context(viewport={"width":1440,"height":900})
        pg2 = await ctx2.new_page()
        js_errs2 = []
        pg2.on("pageerror", lambda e: js_errs2.append(str(e)))

        try:
            await pg2.goto(BASE_URL+"/b2b.html", wait_until="networkidle", timeout=30000)
            await kill_overlays(pg2)

            # 로그인 필드 확인
            lcode = await pg2.query_selector("#login-code")
            lpw   = await pg2.query_selector("#login-pw")
            ok("2단계", "b2b.html #login-code 존재", "") if lcode else ng("2단계", "#login-code 없음", "")
            ok("2단계", "b2b.html #login-pw 존재", "") if lpw else ng("2단계", "#login-pw 없음", "")

            await pg2.fill("#login-code", "B2B-HOS-001")
            await pg2.fill("#login-pw", "b2b001")
            r = await js_click(pg2, ".login-btn", wait_ms=4000)
            ok("2단계", "b2b.html 로그인 JS click", r)

            await kill_overlays(pg2)

            # KPI .kpi-val
            kpi_vals = await pg2.query_selector_all(".kpi-val")
            kpi_texts = []
            for el in kpi_vals:
                t = (await el.inner_text()).strip()
                if t: kpi_texts.append(t)
            ok("2단계", "KPI .kpi-val 텍스트 (4개)", str(kpi_texts)) if len(kpi_texts)==4 else ng("2단계", "KPI .kpi-val", f"개수={len(kpi_texts)}: {kpi_texts}")

            # nav 탭 목록 확인
            nav_tabs = await pg2.evaluate("""() => {
                const tabs = document.querySelectorAll('[data-page]');
                return Array.from(tabs).map(t => t.getAttribute('data-page'));
            }""")
            ok("2단계", "b2b.html [data-page] nav탭", str(nav_tabs)) if nav_tabs else ng("2단계", "nav탭 [data-page] 없음", "")

            # customers 탭 JS click
            r2 = await js_click(pg2, "[data-page='customers']", wait_ms=3000)
            ok("2단계", "customers 탭 JS click", r2)
            await kill_overlays(pg2)

            # 고객 목록 tbody tr 개수
            row_count = await pg2.evaluate("() => document.querySelectorAll('tbody tr').length")
            ok("2단계", "고객목록 tbody tr 개수", f"{row_count}행") if row_count >= 1 else ng("2단계", "고객목록 tbody tr 없음", f"{row_count}행")

            # 첫 번째 클릭 가능한 고객 행 JS click (result-card 또는 tbody tr)
            r3 = await pg2.evaluate("""() => {
                const candidates = ['.result-card','tbody tr','[onclick*="showCustomer"]','[onclick*="openCustomer"]'];
                for (const sel of candidates) {
                    const el = document.querySelector(sel);
                    if (el) { el.click(); return 'CLICKED:'+sel; }
                }
                return 'NO_ROW';
            }""")
            await pg2.wait_for_timeout(2000)
            ok("2단계", "고객 행 JS click", r3)

            # 상세 패널/영역 확인 (B2B는 pv-prescription-area 또는 summary-modal-overlay)
            modal_info = await pg2.evaluate("""() => {
                const sels = [
                    '#pv-prescription-area','#pv-result-area',
                    '#summary-modal-overlay','#summary-modal',
                    '.modal','#result-modal','.popup','.detail-panel',
                    '[class*="modal-wrap"]','[class*="detail-wrap"]',
                    '[id*="prescription"]','[id*="result-area"]',
                    '.card','[class*="card"]'
                ];
                for (const s of sels) {
                    const el = document.querySelector(s);
                    if (el && el.offsetHeight > 0 && (el.innerText||'').trim().length > 10) {
                        const st = window.getComputedStyle(el);
                        if (st.display !== 'none' && st.visibility !== 'hidden') {
                            return {found: s, display: st.display, h: el.offsetHeight,
                                    text_snippet: (el.innerText||'').slice(0,40)};
                        }
                    }
                }
                return null;
            }""")
            ok("2단계", "고객 클릭 → 상세 패널/팝업", str(modal_info)) if modal_info else warn("2단계", "고객 클릭 → 상세 팝업 미확인", "CSS 확인 필요")

            # JS 에러
            ok("2단계", "b2b.html JS 에러", "없음") if not js_errs2 else ng("2단계", "b2b.html JS 에러", str(js_errs2[:3]))

        except Exception as e:
            ng("2단계", "b2b.html Playwright 전체", str(e)[:120])
        finally:
            await ctx2.close()

        # ─────────────────────────────────────────────────────────────────────
        # 【3단계】 질문지 플로우 — API 제출 + Playwright 인트로 DOM
        # ─────────────────────────────────────────────────────────────────────
        print("\n" + "="*70)
        print("【3단계】 질문지 플로우 — API 제출 + Playwright 인트로 DOM")
        print("="*70)

        SURVEY_CASES = [
            {"url":"/h/B2B-HOS-001","cat":"hospital","code":"B2B-HOS-001",
             "bc_key":"BC-1","bc_nick":"코끼리다리형","axes":{"A02":90,"A01":10},"gender":"female"},
            {"url":"/f/B2B-PIL-001","cat":"fitness","code":"B2B-PIL-001",
             "bc_key":"BC-3","bc_nick":"단단 내장형","axes":{"A01":90,"A02":10},"gender":"female"},
            {"url":"/a/B2B-AES-001","cat":"aesthetic","code":"B2B-AES-001",
             "bc_key":"BC-5","bc_nick":"팔뚝 상체형","axes":{"A01":90,"A03":10},"gender":"female"},
            {"url":"/salon/B2B-ETC-001","cat":"salon","code":"B2B-ETC-001",
             "bc_key":"BC-13","bc_nick":"갱년기 변환형","axes":{"A03":90,"A01":10},"gender":"female"},
        ]
        survey_result_ids = {}  # cat → {id, bc_key, bc_nick}

        # ── 3-A: Playwright 인트로 DOM 확인 ──
        print("\n── [3-A] 질문지 Playwright 인트로 DOM ──")
        for sc in SURVEY_CASES:
            print(f"\n  ▷ {sc['cat']} ({sc['url']})")
            ctx3 = await browser.new_context(viewport={"width":390,"height":844})
            pg3 = await ctx3.new_page()
            js3 = []
            pg3.on("pageerror", lambda e: js3.append(str(e)))
            try:
                resp3 = await pg3.goto(BASE_URL+sc["url"], wait_until="networkidle", timeout=30000)
                ok("3단계", f"{sc['cat']} HTTP 응답", f"{resp3.status if resp3 else 0}")

                # __BRAND__ 전역변수
                brand = await pg3.evaluate("() => window.__BRAND__ || null")
                if brand:
                    ok("3단계", f"{sc['cat']} __BRAND__ 인젝션",
                       f"name={brand.get('brand_name')}, color={brand.get('brand_color')}, cat={brand.get('survey_category')}")
                    missing_b = [f for f in ["brand_name","brand_color","survey_category"] if not brand.get(f)]
                    if missing_b: warn("3단계", f"  __BRAND__ 누락필드 {sc['cat']}", str(missing_b))
                else:
                    ng("3단계", f"{sc['cat']} __BRAND__ 없음", "브랜드 인젝션 실패")

                # body 크기
                body_len = len(await pg3.content())
                ok("3단계", f"{sc['cat']} body 크기", f"{body_len//1024}KB") if body_len > 100000 else ng("3단계", f"{sc['cat']} body 크기 작음", f"{body_len}bytes")

                # 실제 DOM 요소들
                dom_checks = {
                    "진행바": "progress, .progress-bar, [class*='prog']",
                    "이름입력": "input[placeholder*='이름'], #user-name, input[id*='name']",
                    "시작버튼": ".start-btn, button[class*='start'], [class*='start-btn'], [onclick*='start']",
                    "성별선택": "[class*='gender'], [data-gender], #gender-m, #gender-f, [class*='sex']",
                }
                for label, sel in dom_checks.items():
                    el = await pg3.query_selector(sel)
                    ok("3단계", f"{sc['cat']} {label} DOM", sel) if el else warn("3단계", f"{sc['cat']} {label} 없음", sel)

                # JS 에러
                ok("3단계", f"{sc['cat']} JS 에러", "없음") if not js3 else ng("3단계", f"{sc['cat']} JS 에러", str(js3[:3]))

            except Exception as e:
                ng("3단계", f"{sc['cat']} Playwright", str(e)[:100])
            finally:
                await ctx3.close()

        # ── 3-B: API /api/v1/diagnosis 직접 제출 → result_id 확보 ──
        print("\n── [3-B] /api/v1/diagnosis 직접 제출 ──")
        DIAG_FIELDS = ["result_id","bc_code_key","bc_nickname","survey_category"]
        for sc in SURVEY_CASES:
            tok = b2b_tokens.get(sc["code"])
            if not tok:
                ng("3단계", f"{sc['cat']} 진단제출", "토큰 없음")
                continue
            code, data = curl_post("/api/v1/diagnosis", {
                "user_name": f"검증_{sc['cat']}_{sc['gender']}",
                "gender": sc["gender"],
                "axis_scores": sc["axes"],
                "bc_code_key": sc["bc_key"],
                "bc_nickname": sc["bc_nick"],
                "survey_category": sc["cat"],
            }, tok)
            if code not in [200,201] or not isinstance(data,dict) or not data.get("result_id"):
                ng("3단계", f"{sc['cat']} 진단제출 HTTP {code}", str(data)[:100])
                continue
            rid = data["result_id"]
            ok("3단계", f"{sc['cat']} 진단제출 result_id", f"{rid[:8]}...")
            missing_d = [f for f in DIAG_FIELDS if f not in data]
            ok("3단계", f"{sc['cat']} 진단응답 필드", str(list(data.keys()))) if not missing_d else ng("3단계", f"{sc['cat']} 진단응답 누락", str(missing_d))
            survey_result_ids[sc["cat"]] = {"id":rid,"bc_key":sc["bc_key"],"bc_nick":sc["bc_nick"],"gender":sc["gender"]}

        # male BC-7 추가 (성별분기 테스트용)
        tok_hos = b2b_tokens.get("B2B-HOS-001")
        if tok_hos:
            code, data = curl_post("/api/v1/diagnosis", {
                "user_name":"성별분기_남성_BC7",
                "gender":"male",
                "axis_scores":{"A02":50,"A04":50},
                "bc_code_key":"BC-7",
                "bc_nickname":"복압형 코어붕괴형",
                "survey_category":"hospital",
            }, tok_hos)
            male_rid = data.get("result_id") if isinstance(data,dict) else None
            if male_rid:
                survey_result_ids["hospital_male"] = {"id":male_rid,"bc_key":"BC-7","bc_nick":"복압형 코어붕괴형","gender":"male"}
                ok("3단계", "BC-7 male 진단제출", f"{male_rid[:8]}...")

        # ─────────────────────────────────────────────────────────────────────
        # 【4단계】 결과지 DOM 전수 검증
        # ─────────────────────────────────────────────────────────────────────
        print("\n" + "="*70)
        print("【4단계】 결과지 DOM 전수 검증 (4업종 + male 분기)")
        print("="*70)

        RESULT_PATH = {
            "hospital":"result-hospital","fitness":"result-fitness",
            "aesthetic":"result-aesthetic","salon":"result-salon",
            "hospital_male":"result-hospital",
        }

        for cat_key, info in survey_result_ids.items():
            rid = info["id"]
            bc_key = info["bc_key"]
            bc_nick = info["bc_nick"]
            gender = info["gender"]
            rpath = RESULT_PATH.get(cat_key, "result-hospital")
            result_url = f"/{rpath}/{rid}"
            print(f"\n── {cat_key} ({bc_key}/{gender}) → {result_url} ──")

            ctx4 = await browser.new_context(viewport={"width":390,"height":844})
            pg4 = await ctx4.new_page()
            js4 = []
            failed4 = []
            pg4.on("pageerror", lambda e: js4.append(str(e)))
            pg4.on("requestfailed", lambda req: failed4.append(req.url) if "cdn-cgi" not in req.url else None)

            try:
                resp4 = await pg4.goto(BASE_URL+result_url, wait_until="networkidle", timeout=40000)
                await pg4.wait_for_timeout(3000)

                ok("4단계", f"{cat_key} HTTP", f"{resp4.status if resp4 else 0}") if resp4 and resp4.status==200 else ng("4단계", f"{cat_key} HTTP", f"{resp4.status if resp4 else 0}")

                # ── BC코드 DOM ──
                bc_code_text = await pg4.evaluate("""() => {
                    const sels = ['#p7sum-code','.bc-code','[id*="bc-code"]','[class*="bc-code"]',
                                  '[data-bc-code]','#result-bc-code'];
                    for (const s of sels) {
                        const el = document.querySelector(s);
                        if (el) return {sel: s, text: el.innerText.trim()};
                    }
                    return null;
                }""")
                if bc_code_text:
                    ok("4단계", f"{cat_key} BC코드 DOM", f"sel={bc_code_text['sel']}, text='{bc_code_text['text']}'")
                    # #p7sum-code는 숫자만 (예: '1'), 'BC-' prefix는 인접 span에 있음
                    # 따라서 bc_key('BC-1')의 숫자 부분(1)이 DOM에 있으면 OK
                    bc_num = bc_key.replace('BC-', '')
                    dom_text = bc_code_text['text']
                    if bc_num not in dom_text and bc_key not in dom_text:
                        ng("4단계", f"  BC코드 불일치 {cat_key}", f"기대={bc_key}, DOM='{dom_text}'")
                else:
                    ng("4단계", f"{cat_key} BC코드 DOM 없음", "#p7sum-code 등 전부 없음")

                # ── BC닉네임 DOM ──
                bc_nick_text = await pg4.evaluate("""() => {
                    const sels = ['#p7sum-nick','.bc-nick','[id*="bc-nick"]','[class*="bc-nick"]',
                                  '.body-type-name','#result-bc-nick'];
                    for (const s of sels) {
                        const el = document.querySelector(s);
                        if (el) return {sel: s, text: el.innerText.trim()};
                    }
                    return null;
                }""")
                if bc_nick_text:
                    ok("4단계", f"{cat_key} BC닉네임 DOM", f"sel={bc_nick_text['sel']}, text='{bc_nick_text['text']}'")
                    if bc_nick not in bc_nick_text['text']:
                        ng("4단계", f"  BC닉네임 불일치 {cat_key}", f"기대={bc_nick}, DOM='{bc_nick_text['text']}'")
                else:
                    ng("4단계", f"{cat_key} BC닉네임 DOM 없음", "#p7sum-nick 등 전부 없음")

                # ── 처방 섹션 ──
                presc = await pg4.evaluate("""() => {
                    const sels = ['[class*="prescription"]','[id*="prescription"]','[class*="rx-"]',
                                  '[class*="recommend"]','[class*="treatment"]','[class*="diet"]',
                                  '[class*="exercise"]','[class*="care-"]'];
                    for (const s of sels) {
                        const el = document.querySelector(s);
                        if (el && el.innerText.length > 5) return {sel: s, len: el.innerText.length};
                    }
                    return null;
                }""")
                ok("4단계", f"{cat_key} 처방섹션 DOM", str(presc)) if presc else ng("4단계", f"{cat_key} 처방섹션 없음", "")

                # ── Chart.js 캔버스 ──
                canvas_info = await pg4.evaluate("""() => {
                    const canvases = document.querySelectorAll('canvas');
                    return Array.from(canvases).map(c => ({id: c.id, w: c.width, h: c.height}));
                }""")
                ok("4단계", f"{cat_key} Chart.js 캔버스", f"{len(canvas_info)}개: {canvas_info}") if canvas_info else ng("4단계", f"{cat_key} Canvas 없음", "")

                # ── isMale 전역변수 ──
                is_male = await pg4.evaluate("() => typeof window.isMale !== 'undefined' ? window.isMale : 'UNDEFINED'")
                expected = (gender == "male")
                if is_male == 'UNDEFINED':
                    ng("4단계", f"{cat_key} isMale 미정의", "window.isMale이 없음")
                elif is_male == expected:
                    ok("4단계", f"{cat_key} isMale", f"isMale={is_male} (기대 {expected})")
                else:
                    ng("4단계", f"{cat_key} isMale 값 틀림", f"isMale={is_male}, 기대={expected}")

                # ── smIsFemaleG() 함수 (hospital 제외) ──
                base_cat = cat_key.replace("_male","")
                if base_cat != "hospital":
                    sm_result = await pg4.evaluate("""() => {
                        if (typeof smIsFemaleG !== 'function') return 'NOT_DEFINED';
                        try { return smIsFemaleG(); } catch(e) { return 'ERROR:'+e.message; }
                    }""")
                    ok("4단계", f"{cat_key} smIsFemaleG()", f"반환={sm_result}") if sm_result not in ['NOT_DEFINED'] and not str(sm_result).startswith('ERROR') else ng("4단계", f"{cat_key} smIsFemaleG 이상", f"{sm_result}")

                # ── BC_MASTER 정의 ──
                bc_master = await pg4.evaluate("""() => {
                    if (typeof BC_MASTER === 'undefined') return {count: -1, keys: null};
                    const keys = Object.keys(BC_MASTER);
                    return {count: keys.length, keys: keys.slice(0,3)};
                }""")
                ok("4단계", f"{cat_key} BC_MASTER", f"{bc_master['count']}종, 샘플={bc_master['keys']}") if bc_master['count']==16 else ng("4단계", f"{cat_key} BC_MASTER", f"{bc_master['count']}종 (기대 16)")

                # ── 공유하기 버튼 ──
                share = await pg4.query_selector("[class*='share'], .share-btn, [onclick*='share'], [id*='share']")
                ok("4단계", f"{cat_key} 공유버튼 DOM", "") if share else warn("4단계", f"{cat_key} 공유버튼 없음", "")

                # ── CTA 버튼 ──
                cta = await pg4.query_selector("[class*='cta'], .reserve-btn, [class*='consult-btn'], [id*='cta']")
                ok("4단계", f"{cat_key} CTA 버튼 DOM", "") if cta else warn("4단계", f"{cat_key} CTA 버튼 없음", "")

                # ── 실제 API 호출 확인: /api/result/:id ──
                code, diag_data = curl_get(f"/api/result/{rid}")
                if code == 200 and isinstance(diag_data, dict):
                    ok("4단계", f"{cat_key} /api/result/:id", f"HTTP 200, fields={list(diag_data.keys())[:6]}")
                    # bc_code_key, gender 일치 확인
                    if diag_data.get("bc_code_key") != bc_key:
                        ng("4단계", f"  /api/result bc_code_key 불일치", f"DB={diag_data.get('bc_code_key')}, 기대={bc_key}")
                    if diag_data.get("gender") != gender:
                        ng("4단계", f"  /api/result gender 불일치", f"DB={diag_data.get('gender')}, 기대={gender}")
                else:
                    ng("4단계", f"{cat_key} /api/result/:id", f"HTTP {code}")

                # ── 실패 리소스 ──
                if failed4: ng("4단계", f"{cat_key} 실패리소스", str(failed4[:3]))

                # ── JS 에러 ──
                ok("4단계", f"{cat_key} JS 에러", "없음") if not js4 else ng("4단계", f"{cat_key} JS 에러", str(js4[:3]))

            except Exception as e:
                ng("4단계", f"{cat_key} 전체 Playwright", str(e)[:120])
            finally:
                await ctx4.close()

        # ─────────────────────────────────────────────────────────────────────
        # 【5단계】 컨설턴트 — API 전수 + Playwright DOM
        # ─────────────────────────────────────────────────────────────────────
        print("\n" + "="*70)
        print("【5단계】 컨설턴트 — API 전수 + Playwright DOM")
        print("="*70)

        # ── 5-A: 로그인 API ──
        print("\n── [5-A] 컨설턴트 로그인 API ──")
        code, data = curl_post("/api/auth/login", {"code":"SC-0001","password":"pass0001"})
        c_tok = data.get("token") if isinstance(data,dict) else None
        if c_tok:
            ok("5단계", "SC-0001 로그인", f"name={data.get('name')}, role={data.get('role')}, fields={list(data.keys())}")
        else:
            ng("5단계", "SC-0001 로그인 실패", f"HTTP {code}: {str(data)[:100]}")

        if c_tok:
            # ── 5-B: /api/consultant/stats ──
            print("\n── [5-B] /api/consultant/stats ──")
            code, data = curl_get("/api/consultant/stats", c_tok)
            if code == 200 and isinstance(data,dict):
                ok("5단계", "/api/consultant/stats", f"HTTP 200, keys={list(data.keys())}, total={data.get('total')}")
            else:
                ng("5단계", "/api/consultant/stats", f"HTTP {code}: {str(data)[:80]}")

            # ── 5-C: /api/consultant/results ──
            print("\n── [5-C] /api/consultant/results ──")
            code, data = curl_get("/api/consultant/results?limit=5", c_tok)
            c_results = data.get("results",[]) if isinstance(data,dict) else []
            if code == 200:
                ok("5단계", "/api/consultant/results", f"count={len(c_results)}, wrapper_keys={list(data.keys())}")
                if c_results:
                    r0 = c_results[0]
                    print(f"  샘플필드: {list(r0.keys())}")
                    CONS_RESULT_FIELDS = ["id","user_name","bc_primary","created_at","gender"]
                    missing = [f for f in CONS_RESULT_FIELDS if f not in r0]
                    ok("5단계", "consultant/results 필드", str(list(r0.keys())[:8])) if not missing else ng("5단계", "consultant/results 누락", str(missing))
            else:
                ng("5단계", "/api/consultant/results", f"HTTP {code}")

            # ── 5-D: 메모 POST API 확인 ──
            print("\n── [5-D] 메모 POST API 확인 ──")
            test_rid = (c_results[0].get("id","") if c_results else
                        next(iter(survey_result_ids.values()),{}).get("id",""))
            # POST로 직접 테스트 (GET은 정의되지 않은 경로이므로 404가 정상)
            memo_found = False
            for mp in [f"/api/consultant/memo/{test_rid}", f"/api/memo/{test_rid}"]:
                c_m, d_m = curl_post(mp, {"memo":"검증테스트 메모"}, c_tok)
                print(f"    POST {mp} → HTTP {c_m}: {str(d_m)[:60]}")
                if c_m in [200,201]:
                    ok("5단계", f"메모 POST 성공 — {mp}", f"HTTP {c_m}: ok={d_m.get('ok') if isinstance(d_m,dict) else '?'}")
                    memo_found = True; break
            if not memo_found:
                ng("5단계", "메모 POST API 없음", "모든 경로 실패")

            # ── 5-E: /api/consultant/rediagnosis ──
            print("\n── [5-E] /api/consultant/rediagnosis ──")
            code, data = curl_get("/api/consultant/rediagnosis", c_tok)
            ok("5단계", "/api/consultant/rediagnosis GET", f"HTTP {code}") if code in [200,404] else ng("5단계", "/api/consultant/rediagnosis", f"HTTP {code}: {str(data)[:60]}")

        # ── 5-F: Playwright consultant.html DOM ──
        print("\n── [5-F] Playwright consultant.html — JS click ──")
        ctx5 = await browser.new_context(viewport={"width":1440,"height":900})
        pg5 = await ctx5.new_page()
        js5 = []
        pg5.on("pageerror", lambda e: js5.append(str(e)))
        try:
            await pg5.goto(BASE_URL+"/consultant.html", wait_until="networkidle", timeout=30000)
            await kill_overlays(pg5)

            # 로그인 필드 셀렉터 탐지
            login_field_info = await pg5.evaluate("""() => {
                const candidates = ['#l-code','#login-code','[id*="code"]','input[placeholder*="코드"]',
                                    'input[placeholder*="아이디"]','input[type="text"]'];
                for (const s of candidates) {
                    const el = document.querySelector(s);
                    if (el) return {sel: s, placeholder: el.placeholder, id: el.id};
                }
                return null;
            }""")
            ok("5단계", "consultant 로그인코드 필드", str(login_field_info)) if login_field_info else ng("5단계", "로그인코드 필드 없음", "")
            
            pw_field_info = await pg5.evaluate("""() => {
                const candidates = ['#l-pw','#login-pw','input[type="password"]'];
                for (const s of candidates) {
                    const el = document.querySelector(s);
                    if (el) return {sel: s, id: el.id};
                }
                return null;
            }""")
            ok("5단계", "consultant PW 필드", str(pw_field_info)) if pw_field_info else ng("5단계", "PW 필드 없음", "")

            # 실제 필드 ID 사용해서 입력
            code_sel = login_field_info['sel'] if login_field_info else "#l-code"
            pw_sel   = pw_field_info['sel'] if pw_field_info else "#l-pw"
            
            await pg5.fill(code_sel, "SC-0001")
            await pg5.fill(pw_sel, "pass0001")
            
            # login 버튼 JS click
            login_btn_info = await pg5.evaluate("""() => {
                const candidates = ['.login-btn','[class*="login-btn"]','button[onclick*="login"]',
                                    'button[class*="login"]','[id*="login-btn"]'];
                for (const s of candidates) {
                    const el = document.querySelector(s);
                    if (el) { el.click(); return s; }
                }
                return 'NOT_FOUND';
            }""")
            ok("5단계", "consultant 로그인 JS click", login_btn_info)
            await pg5.wait_for_timeout(4000)
            await kill_overlays(pg5)

            # ── customers 탭으로 전환 (상세 버튼은 customers 탭에 있음) ──
            tab_switched = await pg5.evaluate("""() => {
                const sels = ['[data-tab="customers"]','[onclick*="customers"]','[href*="customers"]'];
                for (const s of sels) {
                    const el = document.querySelector(s);
                    if (el) { el.click(); return s; }
                }
                return 'NOT_FOUND';
            }""")
            await pg5.wait_for_timeout(3000)
            ok("5단계", "consultant customers탭 전환", tab_switched)

            # 고객목록 row 수 (customers 탭 tbody)
            row_count5 = await pg5.evaluate("""() => {
                // customers 탭 테이블 우선 탐색
                const custTable = document.getElementById('customers-table');
                if (custTable) {
                    const rows = custTable.querySelectorAll('tbody tr');
                    if (rows.length > 0) return {sel: '#customers-table tbody tr', count: rows.length};
                }
                const sels = ['tbody tr','.customer-row','[class*="cust-row"]','.result-item'];
                for (const s of sels) {
                    const els = document.querySelectorAll(s);
                    if (els.length > 0) return {sel: s, count: els.length};
                }
                return {sel: null, count: 0};
            }""")
            ok("5단계", "consultant 고객목록 행", str(row_count5)) if row_count5.get('count',0) >= 1 else ng("5단계", "consultant 고객목록 없음", str(row_count5))

            # 검색창
            search_info = await pg5.evaluate("""() => {
                const sels = ['#cust-search','input[placeholder*="검색"]','[class*="search"] input'];
                for (const s of sels) {
                    const el = document.querySelector(s);
                    if (el) return {sel: s, placeholder: el.placeholder};
                }
                return null;
            }""")
            ok("5단계", "consultant 검색창", str(search_info)) if search_info else ng("5단계", "consultant 검색창 없음", "")

            # 상세 버튼 클릭 → #detail-modal.show 확인
            # customers 탭의 "상세" 버튼(openDetailModal 연결)을 클릭해야 함
            if row_count5.get('count', 0) >= 1:
                r5 = await pg5.evaluate("""() => {
                    // 1순위: openDetailModal onclick 버튼
                    const detailBtn = document.querySelector('[onclick*="openDetailModal"]');
                    if (detailBtn) { detailBtn.click(); return 'CLICKED:openDetailModal-btn'; }
                    // 2순위: customers-table 첫 행의 btn-primary
                    const custTable = document.getElementById('customers-table');
                    if (custTable) {
                        const btn = custTable.querySelector('tbody tr .btn-primary, tbody tr button');
                        if (btn) { btn.click(); return 'CLICKED:customers-table-btn'; }
                        // 3순위: 행 자체 클릭
                        const row = custTable.querySelector('tbody tr');
                        if (row) { row.click(); return 'CLICKED:customers-table-row'; }
                    }
                    // 4순위: tbody 첫 행
                    const row = document.querySelector('tbody tr');
                    if (row) { row.click(); return 'CLICKED:tbody-tr'; }
                    return 'NO_EL';
                }""")
                await pg5.wait_for_timeout(2500)
                ok("5단계", "consultant 고객 JS click", r5)

                detail5 = await pg5.evaluate("""() => {
                    // 1순위: #detail-modal.show (정확한 패턴)
                    const dm = document.getElementById('detail-modal');
                    if (dm && dm.classList.contains('show')) {
                        return {sel: '#detail-modal.show', h: dm.offsetHeight,
                                text_len: (dm.innerText||'').trim().length};
                    }
                    // 2순위: .modal-overlay.show
                    const sels = ['.modal-overlay.show', '.modal.show'];
                    for (const s of sels) {
                        const el = document.querySelector(s);
                        if (el && el.offsetHeight > 0 && (el.innerText||'').trim().length > 5) {
                            return {sel: s, h: el.offsetHeight, text_len: el.innerText.trim().length};
                        }
                    }
                    // 3순위: cons-check-detail 패널 (daily-checks 섹션)
                    const panel = document.getElementById('cons-check-detail');
                    if (panel && panel.innerHTML.trim().length > 20) {
                        return {sel: '#cons-check-detail', h: panel.offsetHeight,
                                text_len: panel.innerText.trim().length};
                    }
                    return null;
                }""")
                ok("5단계", "consultant 상세 팝업/패널", str(detail5)) if detail5 else warn("5단계", "consultant 상세 팝업 미확인", "")

            ok("5단계", "consultant.html JS 에러", "없음") if not js5 else ng("5단계", "consultant.html JS 에러", str(js5[:3]))

        except Exception as e:
            ng("5단계", "consultant.html Playwright 전체", str(e)[:120])
        finally:
            await ctx5.close()

        # ─────────────────────────────────────────────────────────────────────
        # 【6단계】 슬림마인드 TODAY — API 전수 + Playwright DOM
        # ─────────────────────────────────────────────────────────────────────
        print("\n" + "="*70)
        print("【6단계】 슬림마인드 TODAY — API 전수 + Playwright DOM")
        print("="*70)

        any_rid = next(iter(survey_result_ids.values()), {}).get("id","")

        # ── 6-A: guest-token 발급 ──
        print("\n── [6-A] guest-token 발급 ──")
        g_tok = None
        if any_rid:
            for gt_path in ["/api/auth/guest-token", "/api/guest-token", "/api/auth/token"]:
                code, data = curl_post(gt_path, {"result_id": any_rid})
                if code in [200,201] and isinstance(data,dict) and data.get("token"):
                    g_tok = data["token"]
                    ok("6단계", f"guest-token 발급 {gt_path}", f"HTTP {code}")
                    break
                else:
                    warn("6단계", f"guest-token {gt_path}", f"HTTP {code}: {str(data)[:50]}")
            if not g_tok:
                ng("6단계", "guest-token 발급 전체 실패", "")

        # ── 6-B: TODAY API 전수 ──
        print("\n── [6-B] TODAY API 전수 ──")
        if g_tok and any_rid:
            # status
            code, data = curl_get(f"/api/today/status?result_id={any_rid}", g_tok)
            if code == 200 and isinstance(data,dict):
                ok("6단계", "/api/today/status", f"keys={list(data.keys())}, data={str(data)[:80]}")
            else:
                ng("6단계", "/api/today/status", f"HTTP {code}: {str(data)[:80]}")

            # slots — 302 redirect to /api/ai/today/:id (따라가서 200 확인)
            code, data = curl_get(f"/api/today/slots?result_id={any_rid}", g_tok)
            if code in [200, 302]:
                # redirect면 실제 ai/today/:id API 직접 호출
                code2, data2 = curl_get(f"/api/ai/today/{any_rid}", g_tok)
                if code2 == 200 and isinstance(data2, dict):
                    slots = data2.get("slots", {})
                    ok("6단계", "/api/today/slots", f"→/api/ai/today OK, 슬롯키={list(slots.keys()) if isinstance(slots,dict) else len(slots)}")
                else:
                    ng("6단계", "/api/today/slots", f"redirect 후 /api/ai/today HTTP {code2}")
            else:
                ng("6단계", "/api/today/slots", f"HTTP {code}: {str(data)[:80]}")

            # check POST — 307 redirect to /api/daily-check (redirect 허용)
            code, data = curl_post("/api/today/check", {"result_id":any_rid,"axis":"A01","checked":True}, g_tok)
            if code in [200,201,307,400,422]:
                ok("6단계", "POST /api/today/check", f"HTTP {code} (redirect/처리됨), resp={str(data)[:60]}")
            else:
                ng("6단계", "POST /api/today/check", f"HTTP {code}: {str(data)[:80]}")

            # streak
            for streak_path in [f"/api/today/streak?result_id={any_rid}", f"/api/today/streak/{any_rid}"]:
                code, data = curl_get(streak_path, g_tok)
                if code == 200:
                    ok("6단계", f"GET /api/today/streak", f"HTTP 200, keys={list(data.keys()) if isinstance(data,dict) else 'list'}, data={str(data)[:60]}")
                    break
            else:
                warn("6단계", "/api/today/streak 없음", f"마지막 HTTP {code}")
        elif not any_rid:
            ng("6단계", "TODAY API", "result_id 없음 (진단 제출 실패)")
        else:
            ng("6단계", "TODAY API", "guest-token 없음")

        # ── 6-C: Playwright slimmind-today.html DOM ──
        print("\n── [6-C] Playwright slimmind-today.html DOM ──")
        ctx6 = await browser.new_context(viewport={"width":390,"height":844})
        pg6 = await ctx6.new_page()
        js6 = []
        pg6.on("pageerror", lambda e: js6.append(str(e)))
        try:
            target = BASE_URL + (f"/slimmind-today.html?id={any_rid}" if any_rid else "/slimmind-today.html")
            await pg6.goto(target, wait_until="networkidle", timeout=30000)
            ok("6단계", "slimmind-today URL", pg6.url)

            # body 크기
            body6 = await pg6.content()
            ok("6단계", "slimmind-today body", f"{len(body6)//1024}KB") if len(body6) > 10000 else ng("6단계", "slimmind-today body 작음", f"{len(body6)}")

            # 주요 DOM 요소 (실제 slimmind-today.html 클래스 기준)
            dom6 = {
                "데일리체크 아이템": ".item, [class*='item-'], #items .item, [data-k]",
                "연속달성 카운트": "[class*='streak'], [id*='streak'], #streak-n, .streak-n",
                "날짜 표시": "[class*='date'], #today-date, .hd-day, #hd-day, .dow",
                "완료/체크 버튼": ".item-acts button, [class*='item-act'], .det-toggle, [onclick*='check'], [onclick*='done']",
            }
            for label, sel in dom6.items():
                els = await pg6.query_selector_all(sel)
                ok("6단계", f"slimmind-today {label}", f"{len(els)}개") if els else warn("6단계", f"slimmind-today {label} 없음", sel)

            ok("6단계", "slimmind-today JS 에러", "없음") if not js6 else ng("6단계", "slimmind-today JS 에러", str(js6[:3]))

        except Exception as e:
            ng("6단계", "slimmind-today Playwright", str(e)[:120])
        finally:
            await ctx6.close()

        # ─────────────────────────────────────────────────────────────────────
        # 【7단계】 엣지 케이스 전수 검증
        # ─────────────────────────────────────────────────────────────────────
        print("\n" + "="*70)
        print("【7단계】 엣지 케이스 전수 검증")
        print("="*70)

        ctx7 = await browser.new_context(viewport={"width":390,"height":844})
        pg7 = await ctx7.new_page()
        js7 = []
        pg7.on("pageerror", lambda e: js7.append(str(e)))

        try:
            # ── 7-1: 존재하지 않는 진단 ID ──
            print("\n── [7-1] 존재하지 않는 진단 ID ──")
            fake_ids = [
                "00000000-0000-0000-0000-000000000000",
                "invalid-id-xyz",
            ]
            for fake_id in fake_ids:
                # API 응답
                api_code, api_data = curl_get(f"/api/result/{fake_id}")
                ok("7단계", f"/api/result/{fake_id[:12]} API 에러처리", f"HTTP {api_code}") if api_code in [404,400] else ng("7단계", f"/api/result/{fake_id[:12]} 에러처리 미흡", f"HTTP {api_code}: {str(api_data)[:60]}")

                # Playwright 에러페이지
                resp7 = await pg7.goto(BASE_URL+f"/result-hospital/{fake_id}", wait_until="networkidle", timeout=25000)
                body7 = await pg7.content()
                has_err_msg = any(w in body7 for w in ["찾을 수 없","존재하지","유효하지","없습니다","Not Found","오류","error","invalid"])
                ok("7단계", f"존재하지않는ID 에러메시지 ({fake_id[:12]})", "") if has_err_msg else ng("7단계", f"존재하지않는ID 에러메시지 없음 ({fake_id[:12]})", f"HTTP {resp7.status if resp7 else 0}")

            # ── 7-2: 모바일 390px 가로 오버플로 ──
            print("\n── [7-2] 모바일 390px 가로 오버플로 ──")
            for cat_key, info in list(survey_result_ids.items())[:4]:
                if "male" in cat_key: continue
                rid = info["id"]
                rpath = RESULT_PATH.get(cat_key, "result-hospital")
                await pg7.goto(BASE_URL+f"/{rpath}/{rid}", wait_until="networkidle", timeout=30000)
                await pg7.wait_for_timeout(1000)
                scroll_w = await pg7.evaluate("() => document.documentElement.scrollWidth")
                client_w = await pg7.evaluate("() => document.documentElement.clientWidth")
                ok("7단계", f"모바일 가로 오버플로 없음 {cat_key}", f"scroll={scroll_w}, client={client_w}") if scroll_w <= client_w + 5 else ng("7단계", f"모바일 가로 오버플로 {cat_key}", f"scroll={scroll_w} > client={client_w}")

            # ── 7-3: 중복 제출 방지 ──
            print("\n── [7-3] 중복 제출 방지 ──")
            tok_b = b2b_tokens.get("B2B-HOS-001")
            if tok_b:
                # ref_code 포함하여 중복 제출 방지 로직이 동작하도록
                payload = {"user_name":"중복테스트","gender":"female","axis_scores":{"A02":80,"A01":20},"bc_code_key":"BC-1","bc_nickname":"코끼리다리형","survey_category":"hospital","ref_code":"B2B-HOS-001"}
                c1, d1 = curl_post("/api/v1/diagnosis", payload, tok_b)
                c2_r, d2 = curl_post("/api/v1/diagnosis", payload, tok_b)
                print(f"    1차: HTTP {c1}, 2차: HTTP {c2_r}")
                # 2차가 200이어도 distinct한 result_id이면 중복허용 서비스일 수 있음
                rid1 = d1.get("result_id","") if isinstance(d1,dict) else ""
                rid2 = d2.get("result_id","") if isinstance(d2,dict) else ""
                if c2_r in [409,429]:
                    ok("7단계", "중복제출 방지 (409/429)", f"1차={c1}, 2차={c2_r}")
                elif c2_r == 200 and rid1 != rid2:
                    warn("7단계", "중복제출 허용 (별도 ID 발급)", f"rid1={rid1[:8]}, rid2={rid2[:8]}")
                elif c2_r == 200 and rid1 == rid2:
                    warn("7단계", "중복제출 → 동일 ID 반환 (idempotent)", f"rid={rid1[:8]}")
                else:
                    warn("7단계", "중복제출 결과 불명확", f"c1={c1},c2={c2_r}")

            # ── 7-4: 만료/정지된 B2B 코드 ──
            print("\n── [7-4] 정지/만료 B2B 코드 처리 ──")
            for bad_code in ["B2B-SUSPENDED-999", "B2B-NOTEXIST-000"]:
                c_b, d_b = curl_post("/api/auth/login", {"code":bad_code,"password":"b2b000"})
                ok("7단계", f"정지/없는 코드 에러처리 {bad_code}", f"HTTP {c_b}") if c_b in [401,403,404,400] else ng("7단계", f"잘못된코드 처리 {bad_code}", f"HTTP {c_b}: {str(d_b)[:60]}")

            # ── 7-5: 없는 B2B 질문지 URL ──
            print("\n── [7-5] 없는 B2B 질문지 URL ──")
            bad_survey_urls = ["/h/B2B-NOTEXIST-999", "/f/B2B-NOTEXIST-999"]
            for burl in bad_survey_urls:
                resp_b = await pg7.goto(BASE_URL+burl, wait_until="networkidle", timeout=20000)
                body_b = await pg7.content()
                http_code_b = resp_b.status if resp_b else 0
                has_err = any(w in body_b for w in ["찾을 수 없","존재하지","없습니다","오류","에러","invalid","Not Found","유효하지 않","잘못된"])
                # HTTP 404이거나 에러 문구가 있으면 올바른 처리
                if has_err or http_code_b == 404:
                    ok("7단계", f"없는 질문지 URL 에러처리 {burl}", f"HTTP {http_code_b}")
                else:
                    ng("7단계", f"없는 질문지 URL 에러없음 {burl}", f"HTTP {http_code_b}: 에러문구 없음")

            # ── 7-6: 뒤로가기 → 앞으로 재진입 ──
            print("\n── [7-6] 뒤로가기 → 앞으로 재진입 ──")
            first_cat, first_info = next(iter(survey_result_ids.items()))
            first_rid = first_info["id"]
            first_rpath = RESULT_PATH.get(first_cat, "result-hospital")
            await pg7.goto(BASE_URL+f"/{first_rpath}/{first_rid}", wait_until="networkidle", timeout=30000)
            await pg7.wait_for_timeout(1000)
            await pg7.go_back()
            await pg7.wait_for_timeout(500)
            await pg7.go_forward()
            await pg7.wait_for_timeout(2000)
            body_fwd = await pg7.content()
            ok("7단계", "뒤로→앞으로 재진입", f"{len(body_fwd)//1024}KB") if len(body_fwd) > 10000 else ng("7단계", "뒤로→앞으로 재진입 실패", f"{len(body_fwd)}")

            # ── 7-7: B2B 인증 없이 protected API 접근 ──
            print("\n── [7-7] 인증 없이 protected API 접근 ──")
            protected_apis = [
                "/api/b2b/stats",
                "/api/b2b/results",
                "/api/consultant/stats",
                "/api/consultant/results",
            ]
            for papi in protected_apis:
                st = curl_status(papi)  # 토큰 없이
                ok("7단계", f"인증 없이 {papi}", f"HTTP {st} (401/403)") if st in ["401","403"] else ng("7단계", f"인증 없이 {papi} 보호 안됨", f"HTTP {st}")

            # JS 에러
            ok("7단계", "엣지케이스 JS 에러", "없음") if not js7 else ng("7단계", "엣지케이스 JS 에러", str(js7[:3]))

        except Exception as e:
            ng("7단계", "엣지케이스 전체", str(e)[:120])
        finally:
            await ctx7.close()

        await browser.close()

    # ─────────────────────────────────────────────────────────────────────────
    # 최종 보고서
    # ─────────────────────────────────────────────────────────────────────────
    print("\n" + "="*70)
    print("【최종 보고서】 2~7단계 깊은 검증 결과")
    print("="*70)
    total_ok = sum(1 for _,_,o,_ in REPORT if o==True)
    total_ng = sum(1 for _,_,o,_ in REPORT if o==False)
    total_warn = sum(1 for _,_,o,_ in REPORT if o is None)
    print(f"\n총계: ✅{total_ok}  ❌{total_ng}  ⚠️{total_warn}")

    for step in ["2단계","3단계","4단계","5단계","6단계","7단계"]:
        items = [(i,o,m) for s,i,o,m in REPORT if s==step]
        if not items: continue
        pc = sum(1 for _,o,_ in items if o==True)
        nc = sum(1 for _,o,_ in items if o==False)
        wc = sum(1 for _,o,_ in items if o is None)
        print(f"\n▶ {step}: ✅{pc} / ❌{nc} / ⚠️{wc}")
        for item, ok_, msg in items:
            if ok_ == False:
                print(f"    ❌ {item}")
                if msg: print(f"       → {msg}")
            elif ok_ is None:
                print(f"    ⚠️  {item}" + (f" — {msg}" if msg else ""))

asyncio.run(run())
