/**
 * PHASE 1-B 설문 데이터 연결 검증
 * Q04 → Ch1 오프닝 뱃지
 * Q24 → Ch3 개인화 실패 카드
 * Q41 → Ch2 감정 공감 레이어 + Ch7 캡처 문장
 * Q50 → Ch7 우선순위 카드 + promise 텍스트
 */
const { chromium } = require('/usr/local/lib/node_modules/playwright');

const BASE = 'http://localhost:3000';
// 김지연: emotional=tired, priority=sustainable, past_diets=['닭가슴살샐러드','간헐적단식'], yoyo=3
const ID1 = 'RES-20260608-A1B2C3';
// 이하은: emotional=anxious, priority=healthy, past_diets=['소식','간헐적단식']
const ID2 = 'RES-20260605-X9Y8Z7';

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let pass = 0, fail = 0;
  const log = [];

  function chk(label, cond, actual) {
    if(cond){ pass++; log.push(`  ✅ ${label}`); }
    else     { fail++; log.push(`  ❌ ${label} | actual: ${JSON.stringify(actual).slice(0,80)}`); }
  }

  async function goAndInit(id) {
    await page.goto(`${BASE}/result/${id}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { if(typeof init==='function') init(); });
    await page.waitForTimeout(800);
  }

  // ══ 케이스1: 김지연 (tired / sustainable / 닭가슴살+간헐적 / yoyo=3) ══
  console.log('\n📋 케이스1: 김지연');
  await goAndInit(ID1);

  // Ch1: Q04 뱃지 확인 (yoyo=3 → "여러 번 도전" 계열)
  const ch1Badge = await page.$eval('#p1OpeningText', el => el.innerHTML).catch(()=>'');
  chk('Ch1 Q04 뱃지 HTML 포함', ch1Badge.includes('도전') || ch1Badge.includes('간절함') || ch1Badge.includes('번의'), ch1Badge.slice(0,100));

  // Ch1: 통계 카드 표시
  const statsVis = await page.$eval('#p1BodyStats', el => el.style.display !== 'none').catch(()=>false);
  chk('Ch1 신체 수치 카드 표시', statsVis, statsVis);

  // Ch2: Q41(tired) 감정 공감 레이어
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(1); });
  await page.waitForTimeout(400);
  const ch2Story = await page.$eval('#p2Story', el => el.innerHTML).catch(()=>'');
  chk('Ch2 Q41 tired 공감 레이어', ch2Story.includes('지쳐있') || ch2Story.includes('소진'), ch2Story.slice(0,120));

  // Ch3: Q24 개인화 실패 카드 (닭가슴살샐러드, 간헐적단식)
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(2); });
  await page.waitForTimeout(400);
  const ch3Fail = await page.$eval('#p3PersonalFail', el => el.innerHTML).catch(()=>'MISSING');
  chk('Ch3 Q24 개인화 카드 존재', ch3Fail !== 'MISSING', ch3Fail.slice(0,80));
  chk('Ch3 닭가슴살 언급', ch3Fail.includes('닭가슴살') || ch3Fail.includes('닭'), ch3Fail.slice(0,120));
  chk('Ch3 간헐적단식 언급', ch3Fail.includes('간헐적'), ch3Fail.slice(0,120));
  chk('Ch3 직접해보심 뱃지', ch3Fail.includes('직접 해보심'), ch3Fail.slice(0,120));

  // Ch7: Q50(sustainable) 우선순위 카드 + Q41 감정 문장
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(6); });
  await page.waitForTimeout(400);
  const ch7Closing = await page.$eval('#p7Closing', el => el.innerHTML).catch(()=>'');
  chk('Ch7 Q50 sustainable 우선순위 카드', ch7Closing.includes('요요') || ch7Closing.includes('오래 유지'), ch7Closing.slice(0,150));
  chk('Ch7 Q50 promise 텍스트 변경', ch7Closing.includes('12주') || ch7Closing.includes('요요 없는'), ch7Closing.slice(0,150));

  const ch7Capture = await page.$eval('#p7CaptureQuote .capture-text', el => el.innerHTML).catch(()=>'');
  chk('Ch7 Q41 tired 감정 문장', ch7Capture.includes('힘드셨') || ch7Capture.includes('지쳐'), ch7Capture.slice(0,120));

  // ══ 케이스2: 이하은 (anxious / healthy / 소식+간헐적) ══
  console.log('\n📋 케이스2: 이하은');
  await goAndInit(ID2);

  // Ch2: Q41(anxious) 감정 레이어
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(1); });
  await page.waitForTimeout(400);
  const ch2Story2 = await page.$eval('#p2Story', el => el.innerHTML).catch(()=>'');
  chk('Ch2 Q41 anxious 공감 레이어', ch2Story2.includes('불안') || ch2Story2.includes('방향'), ch2Story2.slice(0,120));

  // Ch3: Q24 (소식, 간헐적단식)
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(2); });
  await page.waitForTimeout(400);
  const ch3Fail2 = await page.$eval('#p3PersonalFail', el => el.innerHTML).catch(()=>'MISSING');
  chk('Ch3 Q24 소식 언급', ch3Fail2.includes('소식') || ch3Fail2.includes('칼로리 제한'), ch3Fail2.slice(0,150));

  // Ch7: Q50(healthy) 우선순위
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(6); });
  await page.waitForTimeout(400);
  const ch7Closing2 = await page.$eval('#p7Closing', el => el.innerHTML).catch(()=>'');
  chk('Ch7 Q50 healthy 우선순위 카드', ch7Closing2.includes('건강') || ch7Closing2.includes('무리'), ch7Closing2.slice(0,150));

  const ch7Capture2 = await page.$eval('#p7CaptureQuote .capture-text', el => el.innerHTML).catch(()=>'');
  chk('Ch7 Q41 anxious 감정 문장', ch7Capture2.includes('불안') || ch7Capture2.includes('신호'), ch7Capture2.slice(0,120));

  // 최종
  console.log('\n' + '═'.repeat(55));
  log.forEach(l => console.log(l));
  console.log('═'.repeat(55));
  console.log(`\n✅ ${pass}개 통과 / ❌ ${fail}개 실패`);

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}
run().catch(e => { console.error(e); process.exit(1); });
