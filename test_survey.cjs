// SlimMind 설문 자동화 테스트 v3
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const BASE_URL = 'http://localhost:3000';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));

  console.log('=== SlimMind 설문 자동화 테스트 v3 ===');
  await page.goto(`${BASE_URL}/?ref=SC-0003`);
  await sleep(2000);
  await page.evaluate(() => localStorage.removeItem('sm_answers'));

  // 시작
  await page.click('#start-btn');
  await sleep(1000);

  // Q01 이름
  console.log('[Q01] 이름');
  const inp = await page.$('input[type="text"]');
  if (inp) await inp.fill('김테스트');
  await clickNext(page); await sleep(700);

  // Q02~Q06 SINGLE_SELECT
  const q0206Choices = [0, 1, 2, 2, 4]; // 여성, 아랫배, 5번이상, 붓는편, 스트레스
  for (let i = 0; i < q0206Choices.length; i++) {
    console.log(`[Q0${i+2}]`);
    await clickOptionCard(page, q0206Choices[i]); await sleep(700);
  }

  // 전환 A→B
  await handleTransition(page, 'A_B');

  // Q07~Q12
  for (let q = 7; q <= 12; q++) {
    console.log(`[Q${q}]`);
    await clickOptionCard(page, 0); await sleep(700);
  }

  // 전환 B→C
  await handleTransition(page, 'B_C');

  // Q13~Q15 SLIDER
  for (let q = 13; q <= 15; q++) {
    console.log(`[Q${q}] SLIDER`);
    await page.screenshot({ path: `/tmp/q${q}.png` });
    await clickNext(page); await sleep(700);
  }

  // Q16 SIZE_GRID (상의사이즈)
  console.log('[Q16] SIZE_GRID 상의');
  await page.screenshot({ path: '/tmp/q16.png' });
  await clickSizeBtn(page, 2); // M
  await clickNext(page); await sleep(700);

  // Q17 SIZE_GRID (하의사이즈)
  console.log('[Q17] SIZE_GRID 하의');
  await clickSizeBtn(page, 3); // 26
  await clickNext(page); await sleep(700);

  // Q18 SIZE_GRID (목표하의)
  console.log('[Q18] SIZE_GRID 목표하의');
  await clickSizeBtn(page, 1); // 24
  await clickNext(page); await sleep(700);

  // 전환 C→D
  await handleTransition(page, 'C_D');

  // Q19~Q22 SINGLE
  for (let q = 19; q <= 22; q++) {
    console.log(`[Q${q}]`);
    await page.screenshot({ path: `/tmp/q${q}.png` });
    await clickOptionCard(page, 0); await sleep(700);
  }

  // Q23 MULTI_SELECT
  console.log('[Q23] MULTI 운동');
  await page.screenshot({ path: '/tmp/q23.png' });
  await clickMultiCard(page, 0);
  await sleep(400); await clickNext(page); await sleep(700);

  // Q24 MULTI_SELECT
  console.log('[Q24] MULTI 식단');
  await clickMultiCard(page, 0);
  await sleep(400); await clickNext(page); await sleep(700);

  // Q25
  console.log('[Q25]');
  await clickOptionCard(page, 0); await sleep(700);

  // 전환 D→E
  await handleTransition(page, 'D_E');

  // Q26~Q34
  for (let q = 26; q <= 34; q++) {
    console.log(`[Q${q}]`);
    await clickOptionCard(page, 0); await sleep(700);
  }

  // 전환 E→F
  await handleTransition(page, 'E_F');

  // Q35~Q40
  for (let q = 35; q <= 40; q++) {
    console.log(`[Q${q}]`);
    await clickOptionCard(page, 0); await sleep(700);
  }

  // Q41 emotional_state
  console.log('[Q41] emotional_state');
  await page.screenshot({ path: '/tmp/q41.png' });
  await clickOptionCard(page, 2); await sleep(700); // determined

  // 전환 F→G
  await handleTransition(page, 'F_G');

  // Q42 MBTI_GRID
  console.log('[Q42] MBTI');
  await page.screenshot({ path: '/tmp/q42.png' });
  const mbtiBtns = await page.$$('.mbti-btn');
  if (mbtiBtns.length > 0) { await mbtiBtns[0].click(); await sleep(300); }
  await clickNext(page); await sleep(700);

  // Q43 DATE_PICKER
  console.log('[Q43] DATE_PICKER');
  await page.screenshot({ path: '/tmp/q43.png' });
  await page.selectOption('#dp-year', '1990');
  await sleep(200);
  await page.selectOption('#dp-month', '05');
  await sleep(200);
  await page.selectOption('#dp-day', '15');
  await sleep(500);
  await clickNext(page); await sleep(700);

  // Q44~Q45 SINGLE_SELECT
  for (let q = 44; q <= 45; q++) {
    console.log(`[Q${q}]`);
    await page.screenshot({ path: `/tmp/q${q}.png` });
    await clickOptionCard(page, 0); await sleep(700);
  }

  // Q46 INBODY_INPUT (기본값 그대로 다음)
  console.log('[Q46] INBODY');
  await page.screenshot({ path: '/tmp/q46.png' });
  // 슬라이더 움직여서 활성화
  await page.evaluate(() => {
    const bfr = document.getElementById('ib-bfr');
    if (bfr) { bfr.value = 28; bfr.dispatchEvent(new Event('input')); }
  });
  await sleep(300);
  await clickNext(page); await sleep(700);

  // 전환 G→H
  await handleTransition(page, 'G_H');

  // Q47 SIZE_GRID (목표상의)
  console.log('[Q47] SIZE_GRID 목표상의');
  await page.screenshot({ path: '/tmp/q47.png' });
  await clickSizeBtn(page, 1);
  await clickNext(page); await sleep(700);

  // Q48 main_goal
  console.log('[Q48]');
  await clickOptionCard(page, 0); await sleep(700);

  // Q49 MULTI (병원이력)
  console.log('[Q49] MULTI 병원이력');
  await page.screenshot({ path: '/tmp/q49.png' });
  await clickMultiCard(page, 4); // 없어요
  await sleep(400); await clickNext(page); await sleep(700);

  // Q50
  console.log('[Q50]');
  await page.screenshot({ path: '/tmp/q50.png' });
  await clickOptionCard(page, 1); await sleep(700);

  // 로딩 대기
  console.log('[로딩] 대기...');
  await page.screenshot({ path: '/tmp/loading.png' });
  await sleep(2000);

  // 결과 URL 대기 (최대 15초)
  let resultUrl = '';
  for (let i = 0; i < 15; i++) {
    await sleep(1000);
    const url = page.url();
    if (url.includes('/result/')) { resultUrl = url; break; }
  }

  console.log('[최종 URL]', page.url());

  if (resultUrl) {
    const resultId = resultUrl.split('/result/')[1];
    console.log('✅ 결과지 성공! ID:', resultId);
    await sleep(3000);
    await page.screenshot({ path: '/tmp/result_full.png', fullPage: true });
    const resultData = await page.evaluate(() => window.__RESULT__ ? JSON.stringify(window.__RESULT__).substring(0,300) : 'NO DATA');
    console.log('[결과 데이터]', resultData);
  } else {
    console.log('❌ 결과지 이동 실패');
    await page.screenshot({ path: '/tmp/final_state.png', fullPage: true });
    const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 300));
    console.log('[현재 화면]', bodyText);
  }

  console.log('\n=== JS 오류 ===');
  errors.length === 0 ? console.log('✅ 없음') : errors.forEach(e => console.log('❌', e));

  await browser.close();
}

async function clickOptionCard(page, index) {
  const cards = await page.$$('.option-card:not(.multi-check)');
  if (cards.length > index && await cards[index].isVisible()) {
    await cards[index].click(); return true;
  }
  const all = await page.$$('.option-card');
  if (all.length > index) { await all[index].click(); return true; }
  console.log(`⚠️ option-card[${index}] 못찾음 (총 ${all.length}개)`);
  return false;
}

async function clickMultiCard(page, index) {
  const cards = await page.$$('.option-card.multi-check');
  if (cards.length > index && await cards[index].isVisible()) {
    await cards[index].click(); return true;
  }
  console.log(`⚠️ multi-card[${index}] 못찾음 (총 ${cards.length}개)`); return false;
}

async function clickSizeBtn(page, index) {
  const btns = await page.$$('.size-btn');
  if (btns.length > index && await btns[index].isVisible()) {
    await btns[index].click(); return true;
  }
  console.log(`⚠️ size-btn[${index}] 못찾음 (총 ${btns.length}개)`); return false;
}

async function clickNext(page) {
  for (const sel of ['#btn-next','#next-btn','button:has-text("다음")','button:has-text("완료")']) {
    try {
      const el = await page.$(sel);
      if (el && await el.isVisible() && !await el.isDisabled()) { await el.click(); return true; }
    } catch(e) {}
  }
  console.log('⚠️ next 버튼 없음'); return false;
}

async function handleTransition(page, label) {
  await sleep(600);
  const ts = await page.$('#transition-screen');
  if (ts && await ts.isVisible()) {
    console.log(`[전환] ${label}`);
    await page.screenshot({ path: `/tmp/trans_${label}.png` });
    await ts.click(); await sleep(1200);
  }
}

run().catch(err => { console.error('실패:', err.message); process.exit(1); });
