#!/usr/bin/env python3
"""
1~7단계 전수 검증 스크립트
실제 URL DOM + API 응답까지 확인
"""
import subprocess, json, time, sys, re
from datetime import datetime

BASE_URL = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"
REPORT = []  # (단계, 항목, 상태, 메모)

def log(step, item, ok, msg=""):
    status = "✅" if ok else "❌"
    REPORT.append((step, item, status, msg))
    print(f"  {status} [{step}] {item}" + (f" — {msg}" if msg else ""))

def curl_get(path, token=None, timeout=15):
    headers = ["-H", f"Authorization: Bearer {token}"] if token else []
    r = subprocess.run(
        ["curl", "-s", "-w", "\n__STATUS__%{http_code}", "--max-time", str(timeout),
         BASE_URL + path] + headers,
        capture_output=True, text=True
    )
    out = r.stdout
    if "__STATUS__" in out:
        body, code = out.rsplit("__STATUS__", 1)
    else:
        body, code = out, "000"
    try:
        data = json.loads(body)
    except:
        data = body
    return int(code), data

def curl_post(path, payload, token=None, timeout=15):
    headers = ["-H", "Content-Type: application/json"]
    if token:
        headers += ["-H", f"Authorization: Bearer {token}"]
    r = subprocess.run(
        ["curl", "-s", "-w", "\n__STATUS__%{http_code}", "--max-time", str(timeout),
         "-X", "POST", "-d", json.dumps(payload),
         BASE_URL + path] + headers,
        capture_output=True, text=True
    )
    out = r.stdout
    if "__STATUS__" in out:
        body, code = out.rsplit("__STATUS__", 1)
    else:
        body, code = out, "000"
    try:
        data = json.loads(body)
    except:
        data = body
    return int(code), data

def playwright_check(url, wait_selector=None, timeout=20):
    """Playwright로 DOM 확인 — JS 오류, 404 리소스, 셀렉터 존재"""
    script = f"""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        ctx = await browser.new_context()
        page = await ctx.new_page()
        
        js_errors = []
        failed_resources = []
        console_errors = []
        
        page.on("pageerror", lambda e: js_errors.append(str(e)))
        page.on("requestfailed", lambda r: failed_resources.append(r.url) 
                if "cdn-cgi" not in r.url else None)
        page.on("console", lambda m: console_errors.append(m.text) 
                if m.type == "error" and "cdn-cgi" not in m.text else None)
        
        resp = await page.goto("{url}", wait_until="networkidle", timeout={timeout*1000})
        status = resp.status if resp else 0
        
        selector_found = False
        if "{wait_selector or ''}":
            try:
                await page.wait_for_selector("{wait_selector or 'body'}", timeout=5000)
                selector_found = True
            except:
                pass
        else:
            selector_found = True
        
        title = await page.title()
        body_len = len(await page.content())
        
        result = {{
            "status": status,
            "title": title,
            "body_len": body_len,
            "js_errors": js_errors[:5],
            "failed_resources": failed_resources[:5],
            "console_errors": console_errors[:5],
            "selector_found": selector_found
        }}
        print(json.dumps(result))
        await browser.close()

import json
asyncio.run(main())
"""
    r = subprocess.run(["python3", "-c", script], capture_output=True, text=True, timeout=timeout+10)
    if r.returncode != 0 or not r.stdout.strip():
        return {"error": r.stderr[:200] or "no output", "status": 0}
    try:
        return json.loads(r.stdout.strip().split("\n")[-1])
    except:
        return {"error": r.stdout[:200], "status": 0}

def playwright_check_with_login(url, fill_code, fill_pw, submit_selector, success_selector, timeout=25):
    """로그인 폼 자동 입력 후 성공 셀렉터 확인"""
    script = f"""
import asyncio, json
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox","--disable-dev-shm-usage"])
        ctx = await browser.new_context()
        page = await ctx.new_page()
        
        js_errors = []
        page.on("pageerror", lambda e: js_errors.append(str(e)))
        
        resp = await page.goto("{url}", wait_until="domcontentloaded", timeout={timeout*1000})
        status = resp.status if resp else 0
        
        try:
            await page.fill('input[type="text"], input[placeholder*="코드"], #code', "{fill_code}")
            await page.fill('input[type="password"]', "{fill_pw}")
            await page.click('{submit_selector}')
            await page.wait_for_selector('{success_selector}', timeout=8000)
            login_ok = True
            post_title = await page.title()
            post_body_len = len(await page.content())
        except Exception as e:
            login_ok = False
            post_title = str(e)[:100]
            post_body_len = 0
        
        result = {{
            "status": status,
            "login_ok": login_ok,
            "post_title": post_title,
            "post_body_len": post_body_len,
            "js_errors": js_errors[:5]
        }}
        print(json.dumps(result))
        await browser.close()

asyncio.run(main())
"""
    r = subprocess.run(["python3", "-c", script], capture_output=True, text=True, timeout=timeout+15)
    if r.returncode != 0 or not r.stdout.strip():
        return {"error": r.stderr[:200] or "no output", "login_ok": False}
    try:
        return json.loads(r.stdout.strip().split("\n")[-1])
    except:
        return {"error": r.stdout[:200], "login_ok": False}

# ─────────────────────────────────────────────────────────────────────
# 1단계: MASTER admin 페이지
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【1단계】 MASTER admin 페이지 검증")
print("="*60)

# 1-1. admin.html DOM 접근
print("\n[1-1] admin.html 페이지 로드")
r = playwright_check(BASE_URL + "/admin.html", wait_selector="body")
log("1단계", "admin.html 로드(HTTP)", r.get("status") == 200 or r.get("status") == 307, f"status={r.get('status')}, body={r.get('body_len',0)}bytes")
log("1단계", "admin.html JS오류", len(r.get("js_errors",[])) == 0, f"js_errors={r.get('js_errors',[])}")

# 1-2. Admin 로그인 API
print("\n[1-2] Admin API 로그인 (code=MASTER, password=admin1234)")
code, data = curl_post("/api/auth/login", {"code": "MASTER", "password": "admin1234"})
token = data.get("token") if isinstance(data, dict) else None
log("1단계", "POST /api/auth/login (MASTER)", code == 200 and token, f"HTTP {code}, role={data.get('role') if isinstance(data,dict) else 'N/A'}")
MASTER_TOKEN = token or ""

# 1-3. 주요 admin API 검증
if MASTER_TOKEN:
    print("\n[1-3] Admin API 경로 검증")
    
    # dashboard
    code, data = curl_get("/api/admin/dashboard", MASTER_TOKEN)
    has_kpi = isinstance(data, dict) and "kpi" in data
    log("1단계", "GET /api/admin/dashboard", code == 200 and has_kpi, f"HTTP {code}, keys={list(data.keys()) if isinstance(data,dict) else 'N/A'}")
    
    # b2b-partners
    code, data = curl_get("/api/admin/b2b-partners", MASTER_TOKEN)
    partner_count = len(data.get("partners", [])) if isinstance(data, dict) else 0
    log("1단계", "GET /api/admin/b2b-partners", code == 200 and partner_count > 0, f"HTTP {code}, partners={partner_count}")
    
    # results
    code, data = curl_get("/api/admin/results?limit=5", MASTER_TOKEN)
    result_count = len(data.get("results", [])) if isinstance(data, dict) else 0
    log("1단계", "GET /api/admin/results?limit=5", code == 200, f"HTTP {code}, results={result_count}")
    
    # bc-codes
    code, data = curl_get("/api/admin/bc-codes", MASTER_TOKEN)
    log("1단계", "GET /api/admin/bc-codes", code == 200, f"HTTP {code}, keys={list(data.keys()) if isinstance(data,dict) else 'N/A'}")
    
    # consultants
    code, data = curl_get("/api/admin/consultants", MASTER_TOKEN)
    log("1단계", "GET /api/admin/consultants", code == 200, f"HTTP {code}")
    
    # rediagnosis/scan (알려진 500 오류)
    code, data = curl_post("/api/admin/rediagnosis/scan", {}, MASTER_TOKEN)
    err_msg = data.get("error", str(data))[:80] if isinstance(data, dict) else str(data)[:80]
    log("1단계", "POST /api/admin/rediagnosis/scan", code != 500, f"HTTP {code}, err={err_msg}")

# 1-4. Playwright admin 로그인 DOM 확인
print("\n[1-4] admin.html Playwright 로그인 DOM 검증")
pr = playwright_check_with_login(
    BASE_URL + "/admin.html",
    fill_code="MASTER", fill_pw="admin1234",
    submit_selector="button[type='submit'], .login-btn, button:has-text('로그인')",
    success_selector=".dashboard, #dashboard, .admin-main, [class*='dashboard'], nav"
)
log("1단계", "admin.html 로그인 후 대시보드 DOM", pr.get("login_ok", False), f"js_errors={pr.get('js_errors',[])}")

# ─────────────────────────────────────────────────────────────────────
# 2단계: B2B 파트너 포털 (b2b.html)
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【2단계】 B2B 파트너 포털 (b2b.html) 검증")
print("="*60)

B2B_PARTNERS = [
    {"code": "B2B-HOS-001", "pw": "b2b001", "name": "바바성형외과", "category": "hospital"},
    {"code": "B2B-PIL-001", "pw": "b2b001", "name": "바디라운지", "category": "fitness"},
    {"code": "B2B-AES-001", "pw": "b2b001", "name": "슬에스테틱", "category": "aesthetic"},
    {"code": "B2B-ETC-001", "pw": "b2b001", "name": "우미용실", "category": "salon"},
]

# 2-1. b2b.html 페이지 로드
print("\n[2-1] b2b.html 페이지 로드")
r = playwright_check(BASE_URL + "/b2b.html", wait_selector="body")
log("2단계", "b2b.html 로드", r.get("status", 0) in [200, 307], f"status={r.get('status')}, body={r.get('body_len',0)}bytes")
log("2단계", "b2b.html JS오류", len(r.get("js_errors",[])) == 0, f"js_errors={r.get('js_errors',[])}")

# 2-2. B2B 로그인 API - 4개 파트너
print("\n[2-2] B2B 파트너 로그인 API (4업종)")
b2b_tokens = {}
for p in B2B_PARTNERS:
    code, data = curl_post("/api/auth/login", {"code": p["code"], "password": p["pw"]})
    tok = data.get("token") if isinstance(data, dict) else None
    ok = code == 200 and tok is not None
    log("2단계", f"B2B 로그인 {p['code']} ({p['category']})", ok, 
        f"HTTP {code}, category={data.get('survey_category') if isinstance(data,dict) else 'N/A'}")
    if tok:
        b2b_tokens[p["code"]] = tok

# 2-3. B2B 대시보드 API
print("\n[2-3] B2B 대시보드 API 검증")
for p in B2B_PARTNERS:
    tok = b2b_tokens.get(p["code"])
    if not tok:
        log("2단계", f"B2B 대시보드 {p['code']}", False, "토큰 없음")
        continue
    code, data = curl_get("/api/b2b/dashboard", tok)
    log("2단계", f"GET /api/b2b/dashboard ({p['category']})", code == 200, f"HTTP {code}")

# 2-4. B2B 고객 목록 API
print("\n[2-4] B2B 고객 목록 API")
for p in B2B_PARTNERS:
    tok = b2b_tokens.get(p["code"])
    if not tok:
        continue
    code, data = curl_get("/api/b2b/results?limit=3", tok)
    cnt = len(data.get("results", [])) if isinstance(data, dict) else 0
    log("2단계", f"GET /api/b2b/results ({p['category']})", code == 200, f"HTTP {code}, count={cnt}")

# 2-5. b2b.html Playwright 로그인
print("\n[2-5] b2b.html Playwright 로그인 DOM (hospital)")
pr = playwright_check_with_login(
    BASE_URL + "/b2b.html",
    fill_code="B2B-HOS-001", fill_pw="b2b001",
    submit_selector="button[type='submit'], .login-btn, button:has-text('로그인')",
    success_selector=".dashboard, #dashboard, .b2b-main, .customer-list, [class*='partner']"
)
log("2단계", "b2b.html 로그인 후 DOM", pr.get("login_ok", False), f"js_errors={pr.get('js_errors',[])}")

# ─────────────────────────────────────────────────────────────────────
# 3단계: 질문지 실제 플로우 4업종
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【3단계】 질문지 실제 플로우 4업종 검증")
print("="*60)

SURVEY_CONFIGS = [
    {"url": "/h/B2B-HOS-001", "name": "hospital", "selector": ".progress, #progress, .question-wrap, .survey-wrap"},
    {"url": "/h/B2B-PIL-001", "name": "fitness",  "selector": ".progress, #progress, .question-wrap, .survey-wrap"},
    {"url": "/h/B2B-AES-001", "name": "aesthetic","selector": ".progress, #progress, .question-wrap, .survey-wrap"},
    {"url": "/h/B2B-ETC-001", "name": "salon",    "selector": ".progress, #progress, .question-wrap, .survey-wrap"},
]

for cfg in SURVEY_CONFIGS:
    print(f"\n[3] {cfg['name']} 질문지 ({cfg['url']})")
    r = playwright_check(BASE_URL + cfg["url"], wait_selector=None, timeout=25)
    
    status_ok = r.get("status", 0) in [200, 307]
    js_ok = len(r.get("js_errors", [])) == 0
    body_ok = r.get("body_len", 0) > 50000
    no_fail_res = len(r.get("failed_resources", [])) == 0
    
    log("3단계", f"{cfg['name']} 질문지 HTTP 응답", status_ok, f"status={r.get('status')}, body={r.get('body_len',0)}bytes")
    log("3단계", f"{cfg['name']} 질문지 JS오류", js_ok, f"js_errors={r.get('js_errors', [])}")
    log("3단계", f"{cfg['name']} 질문지 body 크기(>50KB)", body_ok, f"{r.get('body_len',0)} bytes")
    if r.get("failed_resources"):
        log("3단계", f"{cfg['name']} 리소스 로딩", no_fail_res, f"failed={r.get('failed_resources', [])}")
    else:
        log("3단계", f"{cfg['name']} 리소스 로딩", True, "실패 리소스 없음")

# ─────────────────────────────────────────────────────────────────────
# 4단계: 결과지 렌더링 핵심 (샘플 제출 후 결과지 URL 확인)
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【4단계】 결과지 렌더링 핵심 검증")
print("="*60)

INDUSTRY_BC = {
    "hospital":  ("B2B-HOS-001", "BC-1",  "코끼리다리형",  {"A02":90,"A01":10,"A03":5,"A04":5}),
    "fitness":   ("B2B-PIL-001", "BC-3",  "단단 내장형",   {"A01":90,"A02":10,"A03":5,"A04":5}),
    "aesthetic": ("B2B-AES-001", "BC-5",  "팔뚝/어깨 상체형",{"A01":90,"A03":10,"A02":5,"A04":5}),
    "salon":     ("B2B-ETC-001", "BC-13", "갱년기 변환형", {"A03":90,"A01":10,"A02":5,"A04":5}),
}

RESULT_HTML = {
    "hospital":  "result-hospital.html",
    "fitness":   "result-fitness.html",
    "aesthetic": "result-aesthetic.html",
    "salon":     "result-salon.html",
}

result_urls = {}
for industry, (b2b_code, bc, nickname, axes) in INDUSTRY_BC.items():
    print(f"\n[4-{industry}] {industry} 결과지 제출 및 검증")
    tok = b2b_tokens.get(b2b_code)
    if not tok:
        log("4단계", f"{industry} 진단 제출", False, "B2B 토큰 없음")
        continue
    
    payload = {
        "partner_code": b2b_code,
        "customer_name": f"테스트_{industry}",
        "customer_age": 35,
        "customer_gender": "female",
        "axis_scores": axes,
        "bc_code_key": bc,
        "bc_nickname": nickname,
    }
    code, data = curl_post("/api/v1/diagnosis", payload, tok)
    result_id = data.get("result_id") if isinstance(data, dict) else None
    result_url = data.get("result_url") if isinstance(data, dict) else None
    
    log("4단계", f"{industry} POST /api/v1/diagnosis", code == 200 and result_id, 
        f"HTTP {code}, result_id={result_id}, bc={bc}")
    
    if result_id:
        result_urls[industry] = result_id

# 결과지 HTML 직접 접근 확인
print("\n[4] result HTML 파일 직접 접근")
for industry, html_file in RESULT_HTML.items():
    url = f"{BASE_URL}/{html_file}"
    r = playwright_check(url, timeout=20)
    js_ok = len(r.get("js_errors", [])) == 0
    body_ok = r.get("body_len", 0) > 100000  # 결과지는 4~8MB
    log("4단계", f"{industry} {html_file} 직접 접근", r.get("status",0) == 200 and body_ok, 
        f"status={r.get('status')}, body={r.get('body_len',0)}bytes, js_err={r.get('js_errors',[])}")

# result_id로 결과지 접근
if result_urls:
    print("\n[4] result_id 기반 결과지 URL 접근")
    for industry, rid in result_urls.items():
        # 결과지 URL: /r/{result_id} 또는 /{result_html}?id=...
        for path in [f"/r/{rid}", f"/result/{rid}"]:
            code, _ = curl_get(path)
            if code == 200:
                log("4단계", f"{industry} 결과지 URL /r/{rid[:8]}...", True, f"HTTP {code}")
                break
        else:
            # Playwright로 result html + query string
            html_file = RESULT_HTML.get(industry, "")
            url = f"{BASE_URL}/{html_file}?id={rid}"
            r = playwright_check(url, timeout=20)
            log("4단계", f"{industry} 결과지 ?id= 접근", r.get("status",0) == 200, 
                f"status={r.get('status')}, js_err={r.get('js_errors',[])}")

# ─────────────────────────────────────────────────────────────────────
# 5단계: 컨설턴트 페이지
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【5단계】 컨설턴트 페이지 검증")
print("="*60)

# consultant.html DOM
print("\n[5-1] consultant.html 페이지 로드")
r = playwright_check(BASE_URL + "/consultant.html", timeout=20)
log("5단계", "consultant.html 로드", r.get("status",0) in [200, 307], f"status={r.get('status')}, body={r.get('body_len',0)}bytes")
log("5단계", "consultant.html JS오류", len(r.get("js_errors",[])) == 0, f"{r.get('js_errors',[])}")

# 컨설턴트 로그인 API (SC-001 or SC-1 형태 탐색)
print("\n[5-2] 컨설턴트 로그인 API")
consultant_token = None
for ccode, cpw in [("SC-001", "pass001"), ("SC-01", "pass01"), ("SC-1", "pass1")]:
    code, data = curl_post("/api/auth/login", {"code": ccode, "password": cpw})
    if code == 200 and data.get("token"):
        consultant_token = data["token"]
        log("5단계", f"컨설턴트 로그인 ({ccode})", True, f"role={data.get('role')}, name={data.get('name')}")
        break
    else:
        pass

if not consultant_token:
    # MASTER 토큰으로 컨설턴트 목록 조회
    code, data = curl_get("/api/admin/consultants", MASTER_TOKEN)
    consultants = data.get("consultants", []) if isinstance(data, dict) else []
    if consultants:
        first_c = consultants[0]
        c_code = first_c.get("code", "")
        if c_code and c_code != "MASTER":
            num = c_code.replace("SC-", "")
            code2, data2 = curl_post("/api/auth/login", {"code": c_code, "password": f"pass{num}"})
            if code2 == 200 and data2.get("token"):
                consultant_token = data2["token"]
                log("5단계", f"컨설턴트 로그인 ({c_code})", True, f"name={data2.get('name')}")
            else:
                log("5단계", "컨설턴트 로그인", False, f"code={c_code}, HTTP {code2}, {data2}")
        else:
            log("5단계", "컨설턴트 계정", False, "MASTER만 존재 또는 목록 비어있음")
    else:
        log("5단계", "컨설턴트 목록", False, f"HTTP {code}, data={data}")

# 컨설턴트 API
if consultant_token:
    code, data = curl_get("/api/consultant/dashboard", consultant_token)
    log("5단계", "GET /api/consultant/dashboard", code == 200, f"HTTP {code}")
    
    code, data = curl_get("/api/consultant/results?limit=3", consultant_token)
    log("5단계", "GET /api/consultant/results", code == 200, f"HTTP {code}")

# 5-3. Playwright 컨설턴트 로그인
print("\n[5-3] consultant.html Playwright 로그인 DOM")
pr = playwright_check_with_login(
    BASE_URL + "/consultant.html",
    fill_code="MASTER", fill_pw="admin1234",
    submit_selector="button[type='submit'], .login-btn, button:has-text('로그인')",
    success_selector=".dashboard, .consultant-main, [class*='customer'], nav, .result-list"
)
log("5단계", "consultant.html 로그인 DOM", pr.get("login_ok", False), f"js_errors={pr.get('js_errors',[])}")

# ─────────────────────────────────────────────────────────────────────
# 6단계: 슬림마인드 TODAY
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【6단계】 슬림마인드 TODAY 검증")
print("="*60)

print("\n[6-1] slimmind-today.html 페이지 로드")
r = playwright_check(BASE_URL + "/slimmind-today.html", timeout=25)
log("6단계", "slimmind-today.html 로드", r.get("status",0) == 200, f"status={r.get('status')}, body={r.get('body_len',0)}bytes")
log("6단계", "slimmind-today.html JS오류", len(r.get("js_errors",[])) == 0, f"{r.get('js_errors',[])}")
log("6단계", "slimmind-today.html 외부리소스", len(r.get("failed_resources",[])) == 0, f"failed={r.get('failed_resources',[])}")

# TODAY API - guest token으로 접근
print("\n[6-2] TODAY API (슬롯 조회)")
if result_urls:
    for industry, rid in list(result_urls.items())[:1]:  # 첫 번째만
        code, data = curl_post("/api/auth/guest-token", {"result_id": rid})
        guest_tok = data.get("token") if isinstance(data, dict) else None
        log("6단계", f"guest-token 발급 ({industry})", code == 200 and guest_tok, f"HTTP {code}")
        
        if guest_tok:
            code2, data2 = curl_get(f"/api/today/slots?result_id={rid}", guest_tok)
            log("6단계", f"GET /api/today/slots", code2 == 200, f"HTTP {code2}")
            
            code3, data3 = curl_get(f"/api/today/status?result_id={rid}", guest_tok)
            log("6단계", f"GET /api/today/status", code3 == 200, f"HTTP {code3}")
else:
    log("6단계", "TODAY API 테스트", False, "result_id 없음 (4단계 제출 실패)")

# ─────────────────────────────────────────────────────────────────────
# 7단계: 엣지 케이스
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【7단계】 엣지 케이스 검증")
print("="*60)

# 7-1. 잘못된 B2B 코드로 질문지 접근
print("\n[7-1] 잘못된 B2B 코드 URL 접근")
code, data = curl_get("/h/B2B-INVALID-999")
log("7단계", "잘못된 B2B 코드 /h/B2B-INVALID-999", code in [404, 302, 200], f"HTTP {code} (리다이렉트/오류 처리 확인)")

# 7-2. 토큰 없이 보호 API 접근
print("\n[7-2] 인증 없이 보호 API 접근")
code, data = curl_get("/api/admin/dashboard")
log("7단계", "인증 없이 /api/admin/dashboard", code in [401, 403], f"HTTP {code}")

code, data = curl_get("/api/b2b/dashboard")
log("7단계", "인증 없이 /api/b2b/dashboard", code in [401, 403], f"HTTP {code}")

# 7-3. 만료/위조 토큰
print("\n[7-3] 위조 토큰으로 API 접근")
code, data = curl_get("/api/admin/dashboard", "fake.jwt.token")
log("7단계", "위조 토큰 /api/admin/dashboard", code in [401, 403], f"HTTP {code}")

# 7-4. 빈 진단 제출
print("\n[7-4] 빈 진단 데이터 제출")
if b2b_tokens.get("B2B-HOS-001"):
    code, data = curl_post("/api/v1/diagnosis", {}, b2b_tokens["B2B-HOS-001"])
    log("7단계", "빈 payload 진단 제출", code in [400, 422], f"HTTP {code}, err={data.get('error','') if isinstance(data,dict) else ''}")

# 7-5. index.html (메인 페이지)
print("\n[7-5] 메인 index.html")
r = playwright_check(BASE_URL + "/", timeout=20)
log("7단계", "index.html 메인 페이지", r.get("status",0) == 200, f"status={r.get('status')}, body={r.get('body_len',0)}bytes")
log("7단계", "index.html JS오류", len(r.get("js_errors",[])) == 0, f"{r.get('js_errors',[])}")

# 7-6. B2B partner role로 admin API 접근 (권한 분리)
print("\n[7-6] B2B 토큰으로 admin API 접근 (권한 분리)")
b2b_tok = b2b_tokens.get("B2B-HOS-001")
if b2b_tok:
    code, data = curl_get("/api/admin/dashboard", b2b_tok)
    log("7단계", "B2B 토큰으로 /api/admin 접근 차단", code in [401, 403], f"HTTP {code}")

# ─────────────────────────────────────────────────────────────────────
# 최종 보고서 출력
# ─────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("【최종 검증 보고서】")
print(f"실행 시각: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("="*60)

steps = ["1단계","2단계","3단계","4단계","5단계","6단계","7단계"]
total_ok = 0
total_fail = 0

for step in steps:
    items = [(s,i,ok,m) for s,i,ok,m in REPORT if s == step]
    ok_cnt = sum(1 for _,_,ok,_ in items if ok == "✅")
    fail_cnt = sum(1 for _,_,ok,_ in items if ok == "❌")
    total_ok += ok_cnt
    total_fail += fail_cnt
    
    print(f"\n▶ {step}: {ok_cnt}✅ / {fail_cnt}❌")
    for _, item, ok, msg in items:
        if ok == "❌":
            print(f"    ❌ {item}")
            if msg:
                print(f"       └→ {msg}")
        else:
            print(f"    ✅ {item}" + (f" ({msg})" if msg and len(msg) < 60 else ""))

print(f"\n{'='*60}")
print(f"총계: {total_ok}✅ 통과 / {total_fail}❌ 실패 / {total_ok+total_fail} 전체")
print(f"{'='*60}")

# 실패 항목만 모아서
if total_fail > 0:
    print("\n【❌ 실패 항목 요약】")
    for step, item, ok, msg in REPORT:
        if ok == "❌":
            print(f"  [{step}] {item}")
            print(f"    → {msg}")
