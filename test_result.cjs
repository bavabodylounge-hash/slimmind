const { chromium } = require('/usr/local/lib/node_modules/playwright');
const BASE_URL = 'http://localhost:3000';
const RESULT_ID = 'RES-20260608-91BNQE';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });

  console.log('결과지 로드:', `${BASE_URL}/result/${RESULT_ID}`);
  await page.goto(`${BASE_URL}/result/${RESULT_ID}`);
  await sleep(5000);

  // 페이지 전체 텍스트
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('\n=== 페이지 텍스트 (처음 2000자) ===\n' + bodyText.substring(0, 2000));

  // 빈 값 / 문제 패턴 확인
  console.log('\n=== 빈 값 / 문제 패턴 ===');
  ['undefined', 'null', 'NaN', '[object Object]', 'BC-??'].forEach(m => {
    const cnt = (bodyText.match(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length;
    console.log(cnt > 0 ? `⚠️  "${m}" ${cnt}회` : `✅ "${m}" 없음`);
  });

  // 스크롤하며 스크린샷
  const totalH = await page.evaluate(() => document.body.scrollHeight);
  console.log('\n총 페이지 높이:', totalH);

  const steps = Math.ceil(totalH / 800);
  for (let i = 0; i < Math.min(steps, 15); i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 800);
    await sleep(300);
    await page.screenshot({ path: `/tmp/result_scroll_${String(i).padStart(2,'0')}.png` });
  }
  console.log(`✅ ${Math.min(steps,15)}개 스크롤 스크린샷 저장`);

  // 전체 풀페이지
  await page.evaluate(() => window.scrollTo(0,0));
  await sleep(500);
  await page.screenshot({ path: '/tmp/result_full.png', fullPage: true });

  console.log('\n=== JS 오류 ===');
  errors.length === 0 ? console.log('✅ 없음') : errors.forEach(e => console.log('❌', e));

  await browser.close();
}
run().catch(e => { console.error(e.message); process.exit(1); });
