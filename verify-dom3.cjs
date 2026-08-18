const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://slimmind.kr/result-hospital/7c0f51de-deac-4b02-b973-f34c09795edd', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => { const el = document.getElementById('p1-full-code'); return el && el.textContent.trim().length > 0; }, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  // ID 존재 여부 + visibility + textContent 모두 확인
  const ids = ['p2-bc-code-em','p5-bc-code-inline','p6-fullcode-strong','p7up-nick','p7-chip-ohaeng'];
  for (const id of ids) {
    const info = await page.evaluate((id) => {
      const el = document.getElementById(id);
      if (!el) return { found: false };
      const rect = el.getBoundingClientRect();
      const style = window.getComputedStyle(el);
      return {
        found: true,
        text: el.textContent.trim().substring(0, 60),
        display: style.display,
        visibility: style.visibility,
        offsetParentNull: el.offsetParent === null,
        inViewport: rect.width > 0 && rect.height > 0,
        parentDisplay: el.parentElement ? window.getComputedStyle(el.parentElement).display : 'n/a',
        closest_page: (() => { let p = el; while(p) { if(p.classList && (p.classList.contains('page')||p.id&&p.id.startsWith('page'))) return p.id||p.className; p=p.parentElement; } return 'none'; })()
      };
    }, id);
    console.log(`[${id}]`);
    console.log('  ', JSON.stringify(info));
  }

  await browser.close();
})();
