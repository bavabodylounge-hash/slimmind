#!/usr/bin/env python3
"""
4업종 질문지 페이지 Playwright 렌더링 검증
- 4개 B2B 코드 URL 로딩
- JS 오류 / 콘솔 오류 수집
- 질문 DOM 존재 여부 (질문요소, 진행바, 다음버튼)
- 실패 리소스 (bc-engine.js, survey-data.js 등)
- bodyLen > 5000 (빈 페이지 아닌지)
"""
import asyncio
import json
from playwright.async_api import async_playwright

BASE = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"

SURVEY_URLS = [
    ("hospital",  f"{BASE}/h/B2B-HOS-001"),
    ("fitness",   f"{BASE}/f/B2B-PIL-001"),
    ("aesthetic", f"{BASE}/a/B2B-AES-001"),
    ("salon",     f"{BASE}/salon/B2B-ETC-001"),
]

# 질문지 DOM 체크 셀렉터 후보
QUESTION_SELECTORS = [
    # 공통 래퍼
    '.question', '.quiz-wrap', '.survey-wrap', '.survey-container',
    '#survey-container', '#quiz', '#question',
    # 진행 바
    '.progress', '.progress-bar', '#progress', '#progress-bar',
    # 다음 버튼
    '.next-btn', '.btn-next', '#next-btn', 'button[class*="next"]',
    # 질문 텍스트
    '.q-text', '.question-text', 'h2.question', '.quiz-question',
    # 라디오/선택지
    '.choice', '.answer', '.option', 'input[type="radio"]',
    # 기타
    '.survey-page', '.quiz-page', 'form.survey', 'form.quiz',
]

FAILED_RESOURCE_KEYWORDS = [
    'bc-engine', 'mapping-engine', 'survey-data',
    'chart.js', 'tailwind', 'fontawesome',
]

async def check_survey_page(playwright, name: str, url: str) -> dict:
    browser = await playwright.chromium.launch(headless=True, args=[
        '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    ])
    context = await browser.new_context(
        user_agent=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        viewport={'width': 390, 'height': 844},
        ignore_https_errors=True,
    )
    page = await context.new_page()

    console_errors   = []
    console_warnings = []
    console_logs     = []
    js_errors        = []
    failed_resources = []
    network_summary  = {'ok': 0, 'fail': 0}

    def on_console(msg):
        txt = msg.text
        if msg.type == 'error':
            console_errors.append(txt)
        elif msg.type == 'warning':
            console_warnings.append(txt)
        else:
            console_logs.append(f"[{msg.type}] {txt[:200]}")

    def on_pageerror(err):
        js_errors.append(str(err))

    def on_requestfailed(req):
        failed_resources.append(req.url)
        network_summary['fail'] += 1

    def on_response(res):
        if res.status < 400:
            network_summary['ok'] += 1
        else:
            # 400+ 응답도 실패로 기록
            for kw in FAILED_RESOURCE_KEYWORDS:
                if kw in res.url.lower():
                    failed_resources.append(f"{res.status} {res.url}")
            network_summary['fail'] += 1

    page.on('console', on_console)
    page.on('pageerror', on_pageerror)
    page.on('requestfailed', on_requestfailed)
    page.on('response', on_response)

    try:
        await page.goto(url, wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(6)  # JS 실행 대기

        # 최종 URL (리다이렉트 확인)
        final_url = page.url

        # body 길이
        body_len = await page.evaluate("document.body ? document.body.innerHTML.length : 0")

        # title
        title = await page.title()

        # DOM 셀렉터 확인
        found_selectors = []
        for sel in QUESTION_SELECTORS:
            try:
                count = await page.locator(sel).count()
                if count > 0:
                    found_selectors.append(f"{sel}×{count}")
            except Exception:
                pass

        # 스크린샷
        shot_path = f"/home/user/webapp/survey_{name}.png"
        await page.screenshot(path=shot_path, full_page=False)

        # 외부 리소스 URL별 체크
        checked_resources = {}
        for kw in FAILED_RESOURCE_KEYWORDS:
            found = [r for r in failed_resources if kw in r.lower()]
            checked_resources[kw] = found if found else 'OK'

        result = {
            'name':         name,
            'url':          url,
            'final_url':    final_url,
            'status':       '✅' if not js_errors and len(console_errors) == 0 else '⚠️',
            'title':        title,
            'body_len':     body_len,
            'body_ok':      body_len > 5000,
            'js_errors':    js_errors,
            'console_errors':   console_errors[:10],
            'console_warnings': console_warnings[:5],
            'found_selectors':  found_selectors,
            'failed_resources': failed_resources[:20],
            'resources':        checked_resources,
            'network':          network_summary,
            'screenshot':       shot_path,
        }

    except Exception as e:
        result = {
            'name': name, 'url': url, 'status': '❌',
            'error': str(e),
            'js_errors': js_errors,
            'console_errors': console_errors[:5],
        }
    finally:
        await browser.close()

    return result


async def main():
    print(f"\n{'='*70}")
    print("  4업종 질문지 Playwright 렌더링 검증")
    print(f"{'='*70}\n")

    results = []
    async with async_playwright() as pw:
        for name, url in SURVEY_URLS:
            print(f"🔍 [{name}] {url}")
            r = await check_survey_page(pw, name, url)
            results.append(r)

            status = r.get('status', '❌')
            print(f"   {status} title={r.get('title','?')!r}")
            print(f"   final_url={r.get('final_url', url)}")
            print(f"   body_len={r.get('body_len',0):,}  body_ok={r.get('body_ok',False)}")
            
            # DOM 발견 셀렉터
            sel = r.get('found_selectors', [])
            print(f"   found_selectors ({len(sel)}): {sel[:8]}")

            # JS 오류
            jerrs = r.get('js_errors', [])
            print(f"   js_errors ({len(jerrs)}): {jerrs[:3]}")

            # Console 오류
            cerrs = r.get('console_errors', [])
            print(f"   console_errors ({len(cerrs)}): {cerrs[:3]}")

            # 실패 리소스
            failed = r.get('failed_resources', [])
            important_fails = [f for f in failed 
                               if any(kw in f.lower() for kw in FAILED_RESOURCE_KEYWORDS)]
            print(f"   important_failed ({len(important_fails)}): {important_fails[:5]}")
            
            # 리소스 체크
            res = r.get('resources', {})
            for kw, v in res.items():
                icon = '✅' if v == 'OK' else f'❌ {v}'
                print(f"   {kw}: {icon}")
            
            print(f"   network: {r.get('network', {})}")
            print()

    # JSON 요약 저장
    with open('/home/user/webapp/survey_check_result.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*70}")
    print("  최종 요약")
    print(f"{'='*70}")
    for r in results:
        s = r.get('status', '❌')
        js_cnt = len(r.get('js_errors', []))
        ce_cnt = len(r.get('console_errors', []))
        body   = r.get('body_len', 0)
        sel_cnt = len(r.get('found_selectors', []))
        print(f"  {s} [{r['name']:12s}] body={body:,}  js_err={js_cnt}  console_err={ce_cnt}  selectors_found={sel_cnt}")
    print(f"\n결과 JSON: /home/user/webapp/survey_check_result.json")
    print("스크린샷:  /home/user/webapp/survey_*.png")


if __name__ == '__main__':
    asyncio.run(main())
