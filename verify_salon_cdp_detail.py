#!/usr/bin/env python3
"""CDP scriptParsed 이벤트로 scriptId 14가 어느 URL/라인에서 시작하는지 확인"""
import asyncio
from playwright.async_api import async_playwright

BASE = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"
URL = f"{BASE}/salon/B2B-ETC-001"

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=[
            '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
        ])
        context = await browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            ignore_https_errors=True,
        )
        page = await context.new_page()
        cdp = await context.new_cdp_session(page)
        await cdp.send('Debugger.enable')
        await cdp.send('Runtime.enable')

        scripts = {}  # scriptId → info

        def on_script_parsed(params):
            sid = params.get('scriptId', '')
            scripts[sid] = {
                'url':        params.get('url', ''),
                'startLine':  params.get('startLine', -1),
                'endLine':    params.get('endLine', -1),
                'startCol':   params.get('startColumn', -1),
                'length':     params.get('length', -1),
            }

        def on_exception(params):
            exc = params.get('exceptionDetails', {})
            sid = exc.get('scriptId', '?')
            line = exc.get('lineNumber', '?')
            col  = exc.get('columnNumber', '?')
            text = exc.get('text', '')
            desc = exc.get('exception', {}).get('description', '')
            print(f"\n❌ EXCEPTION scriptId={sid} L{line} C{col}")
            print(f"   text:  {text}")
            print(f"   desc:  {desc[:200]}")
            # 해당 스크립트 정보
            info = scripts.get(str(sid), {})
            print(f"   script_url:   {info.get('url','?')}")
            print(f"   script_start: L{info.get('startLine','?')}")
            print(f"   script_end:   L{info.get('endLine','?')}")
            # 오류 라인의 절대 HTML 라인 = script_start(HTML 라인) + exception_line
            # Debugger startLine은 0-indexed
            html_start = info.get('startLine', -1)
            if html_start >= 0 and isinstance(line, int):
                abs_line = html_start + line
                print(f"   >> HTML 절대 라인 (0-indexed): {abs_line}  (1-indexed: {abs_line+1})")

        cdp.on('Debugger.scriptParsed', on_script_parsed)
        cdp.on('Runtime.exceptionThrown', on_exception)

        print(f"Loading: {URL}")
        await page.goto(URL, wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(5)

        print(f"\n총 파싱된 스크립트: {len(scripts)}개")
        # scriptId 14 근처 확인
        for sid in ['13','14','15','16']:
            info = scripts.get(sid, None)
            if info:
                print(f"  scriptId={sid}: L{info['startLine']}~{info['endLine']}  len={info['length']}  {info['url'][:80]}")

        await browser.close()

asyncio.run(main())
