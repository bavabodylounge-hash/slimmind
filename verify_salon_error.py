#!/usr/bin/env python3
"""salon 페이지 JS 오류 상세 정보 수집 (라인/컬럼 포함)"""
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

        errors = []
        console_all = []

        def on_console(msg):
            console_all.append(f"[{msg.type}] {msg.text[:300]}")

        def on_pageerror(err):
            errors.append({
                'message': str(err),
                'name': getattr(err, 'name', ''),
                'stack': getattr(err, 'stack', ''),
            })
            print(f"❌ PAGE ERROR: {err}")

        page.on('console', on_console)
        page.on('pageerror', on_pageerror)

        # CDP로 JS 오류 상세 정보 수집
        cdp = await context.new_cdp_session(page)
        await cdp.send('Runtime.enable')
        
        cdp_exceptions = []
        
        def on_exception(params):
            exc = params.get('exceptionDetails', {})
            cdp_exceptions.append(exc)
            print(f"📍 CDP Exception:")
            print(f"   text:     {exc.get('text','')}")
            print(f"   url:      {exc.get('url','')}")
            print(f"   line:     {exc.get('lineNumber','')}")
            print(f"   column:   {exc.get('columnNumber','')}")
            if 'exception' in exc:
                ev = exc['exception']
                print(f"   desc:     {ev.get('description','')[:300]}")
            if 'stackTrace' in exc:
                st = exc['stackTrace']
                frames = st.get('callFrames', [])[:5]
                for f in frames:
                    print(f"   frame:    {f.get('functionName','?')} {f.get('url','?')}:{f.get('lineNumber','?')}:{f.get('columnNumber','?')}")

        cdp.on('Runtime.exceptionThrown', on_exception)

        print(f"Loading: {URL}")
        await page.goto(URL, wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(6)

        print(f"\n--- 전체 콘솔 로그 ({len(console_all)}건) ---")
        for c in console_all[:30]:
            print(f"  {c}")

        print(f"\n--- page errors ({len(errors)}건) ---")
        for e in errors:
            print(f"  {e}")

        print(f"\n--- CDP exceptions ({len(cdp_exceptions)}건) ---")
        for e in cdp_exceptions:
            print(f"  {e}")

        await browser.close()

asyncio.run(main())
