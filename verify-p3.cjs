const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://slimmind.kr/result-hospital/7c0f51de-deac-4b02-b973-f34c09795edd', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => { const el = document.getElementById('p1-full-code'); return el && el.textContent.trim().length > 0; }, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(3000);

  const BAD = ['수 기질','INFJ','BC-13','갱년기형'];

  // P3 mentalrx 칩 텍스트 전체
  const chipTexts = await page.$$eval('.p3-rx-chip-v', els => els.map(e => e.textContent.trim()));
  console.log('=== P3 기질 카드 칩 ===');
  chipTexts.forEach((t, i) => {
    const bad = BAD.some(b => t.includes(b));
    console.log(`${bad ? '❌' : '✅'} 칩[${i}]: ${t}`);
  });

  // insight-block-text 본문 BC-13 / 수 기질 / INFJ 잔존 여부
  const blockTexts = await page.$$eval('.insight-block-text', els => els.map(e => e.textContent.trim().substring(0, 80)));
  console.log('\n=== P3 인사이트 본문 ===');
  blockTexts.forEach((t, i) => {
    const bad = BAD.some(b => t.includes(b));
    console.log(`${bad ? '❌' : '✅'} 본문[${i}]: ${t}`);
  });

  // p3-mentalrx-mount 내 전체 텍스트에 BC-13 있는지
  const mrxText = await page.$eval('#p3-mentalrx-mount', el => el.textContent).catch(() => '');
  const mrxBad = BAD.some(b => mrxText.includes(b));
  console.log(`\n=== mentalrx-mount 전체 ===`);
  console.log(mrxBad ? '❌ 구버전 잔재 있음' : '✅ 구버전 없음');
  if (mrxBad) BAD.forEach(b => { if (mrxText.includes(b)) console.log('  발견:', b); });

  await browser.close();
})();
