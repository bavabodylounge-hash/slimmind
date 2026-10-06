#!/usr/bin/env python3
"""hospital 결과지 404 리소스 정확히 확인"""
import asyncio
from playwright.async_api import async_playwright

BASE = "https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"
URL = f"{BASE}/result-hospital/f8d1c1ed-3cf6-4236-afc1-4ff51893bfd2"  # BC-3 남성

async def main():
    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True, args=[
            '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
        ])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36",
            ignore_https_errors=True,
        )
        page = await context.new_page()

        failed_reqs = []
        console_errs = []

        page.on('requestfailed', lambda r: failed_reqs.append(r.url))
        page.on('response', lambda r: failed_reqs.append(f"HTTP{r.status} {r.url}") if r.status >= 400 else None)
        page.on('console', lambda m: console_errs.append(f"[{m.type}] {m.text[:200]}") if m.type in ('error','warning') else None)

        await page.goto(URL, wait_until='domcontentloaded', timeout=20000)
        await asyncio.sleep(6)

        print(f"\n404/실패 리소스 ({len(failed_reqs)}개):")
        for r in failed_reqs:
            print(f"  {r}")

        print(f"\n콘솔 에러/경고 ({len(console_errs)}개):")
        for c in console_errs:
            print(f"  {c}")

        # smIsFemaleG 확인
        gv = await page.evaluate("""() => {
            return {
                smIsFemaleG_type: typeof smIsFemaleG,
                smIsFemaleG_val:  (typeof smIsFemaleG === 'function') ? smIsFemaleG() : 
                                  (typeof smIsFemaleG !== 'undefined') ? String(smIsFemaleG) : 'UNDEF',
                isMale_type:      typeof isMale,
                isMale_val:       typeof isMale !== 'undefined' ? isMale : 'UNDEF',
                gender_meta:      window.__LAST_META__ ? window.__LAST_META__.gender : 'NO_META',
            };
        }""")
        print(f"\n성별 변수:")
        for k,v in gv.items():
            print(f"  {k}: {v!r}")

        await browser.close()

asyncio.run(main())
