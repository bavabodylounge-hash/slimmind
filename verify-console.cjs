const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', e => errors.push('PAGE_ERROR: ' + e.message));

  await page.goto('https://slimmind.kr/result-hospital/7c0f51de-deac-4b02-b973-f34c09795edd', { waitUntil: 'networkidle', timeout: 30000 });
  
  // p1-full-code 대기
  await page.waitForFunction(() => {
    const el = document.getElementById('p1-full-code');
    return el && el.textContent.trim().length > 0;
  }, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  console.log('\n=== JS 에러 목록 ===');
  errors.forEach(e => console.log('❌', e.substring(0, 120)));
  if (errors.length === 0) console.log('✅ JS 에러 없음');

  // renderP2 함수가 정상 존재하는지, p2-bc-code-em이 DOM에 있는지 확인
  const check = await page.evaluate(() => {
    return {
      p2EmExists:    !!document.getElementById('p2-bc-code-em'),
      p5BcExists:    !!document.getElementById('p5-bc-code-inline'),
      p6FullExists:  !!document.getElementById('p6-fullcode-strong'),
      p7NickExists:  !!document.getElementById('p7up-nick'),
      p7ChipExists:  !!document.getElementById('p7-chip-ohaeng'),
      renderP2Type:  typeof renderP2,
      renderP5Type:  typeof renderP5,
      renderP7Type:  typeof renderP7,
      RENDER_OHAENG: window.__RENDER_OHAENG__,
      RENDER_MBTI:   window.__RENDER_MBTI__,
      RENDER_BC:     window.__RENDER_BC_CODE__,
      allPageIds:    Array.from(document.querySelectorAll('[id]')).map(e=>e.id).filter(id=>id.startsWith('p2')||id.startsWith('p5')||id.startsWith('p6')||id.startsWith('p7'))
    };
  });
  console.log('\n=== DOM/Window 상태 ===');
  console.log(JSON.stringify(check, null, 2));

  await browser.close();
})();
