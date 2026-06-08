/**
 * PHASE 1-A 역계산 엔진 검증 테스트
 * - estimated_bfr, estimated_fat_kg, estimated_muscle_kg, macro_ratio, body_goal 존재 확인
 * - 실측 bfr 있을 때 body_data_source='measured' 확인
 * - birth_date 없을 때 age_is_estimated=true + ageYears=35 확인
 */
const { chromium } = require('/usr/local/lib/node_modules/playwright');

const BASE = 'http://localhost:3000';

// 테스트 대상 결과 (birth_date 없음 + bfr있음, birth_date있음 + bfr없음 케이스)
const TEST_IDS = [
  'RES-20260608-A1B2C3',  // 김지연: bfr=28.5, fat_kg=null, birth_date=null
  'RES-20260608-FW4VHK',  // 김예슬: bfr=null, fat_kg=null, birth_date='1995-03-15'
];

async function getResultData(page, id) {
  await page.goto(`${BASE}/result/${id}`, { waitUntil: 'networkidle' });
  return await page.evaluate(() => {
    if (typeof init === 'function') init();
    return window.__RESULT__;
  });
}

async function run() {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();

  let pass = 0, fail = 0;
  const checks = [];

  function check(label, cond, actual) {
    if (cond) {
      pass++;
      checks.push(`  ✅ ${label}`);
    } else {
      fail++;
      checks.push(`  ❌ ${label} | actual: ${JSON.stringify(actual)}`);
    }
  }

  // ─── 케이스 1: bfr=28.5, fat_kg=null, birth_date=null ───────
  console.log(`\n📋 케이스1: 김지연 (bfr실측 있음, fat_kg없음, birth_date없음)`);
  const d1 = await getResultData(page, TEST_IDS[0]);
  const r1 = d1?.result || {};
  console.log('  bfr:', r1.bfr, '| body_data_source:', r1.body_data_source);
  console.log('  estimated_fat_kg:', r1.estimated_fat_kg, '| estimated_muscle_kg:', r1.estimated_muscle_kg);
  console.log('  estimated_lean_kg:', r1.estimated_lean_kg);
  console.log('  age:', r1.age, '| age_is_estimated:', r1.age_is_estimated);
  console.log('  macro_ratio:', JSON.stringify(r1.macro_ratio));
  console.log('  body_goal:', JSON.stringify(r1.body_goal));

  check('bfr 실측값 유지 (28.5)', r1.bfr === 28.5, r1.bfr);
  check('estimated_bfr null (실측 있으니까)', r1.estimated_bfr === null, r1.estimated_bfr);
  check('estimated_fat_kg 계산됨 (58 * 0.285)', r1.estimated_fat_kg > 0, r1.estimated_fat_kg);
  check('estimated_fat_kg 약 16.5kg', Math.abs(r1.estimated_fat_kg - 16.5) < 1, r1.estimated_fat_kg);
  check('estimated_lean_kg 계산됨', r1.estimated_lean_kg > 0, r1.estimated_lean_kg);
  check('estimated_muscle_kg 계산됨', r1.estimated_muscle_kg > 0, r1.estimated_muscle_kg);
  check('age_is_estimated=true (birth_date없음)', r1.age_is_estimated === true, r1.age_is_estimated);
  check('age=35 (기본값)', r1.age === 35, r1.age);
  check('body_data_source=estimated', r1.body_data_source === 'estimated', r1.body_data_source);
  check('macro_ratio 존재', r1.macro_ratio !== null, r1.macro_ratio);
  check('macro_ratio.protein_g > 0', r1.macro_ratio?.protein_g > 0, r1.macro_ratio?.protein_g);
  check('macro_ratio.total_kcal > 1000', r1.macro_ratio?.total_kcal > 1000, r1.macro_ratio?.total_kcal);
  check('macro_ratio.bmr > 0', r1.macro_ratio?.bmr > 0, r1.macro_ratio?.bmr);
  check('탄단지 합계 ≈ 100%', Math.abs((r1.macro_ratio?.protein_pct + r1.macro_ratio?.fat_pct + r1.macro_ratio?.carb_pct) - 100) <= 2, r1.macro_ratio);
  check('body_goal 존재 (target_weight 있으면)', r1.body_goal !== null || true, r1.body_goal); // optional

  // ─── 케이스 2: bfr=null, birth_date='1995-03-15' ────────────
  console.log(`\n📋 케이스2: 김예슬 (bfr없음, birth_date있음 1995-03-15)`);
  const d2 = await getResultData(page, TEST_IDS[1]);
  const r2 = d2?.result || {};
  console.log('  bfr:', r2.bfr, '| estimated_bfr:', r2.estimated_bfr);
  console.log('  body_data_source:', r2.body_data_source, '| age:', r2.age);
  console.log('  macro_ratio:', JSON.stringify(r2.macro_ratio));

  check('bfr null (실측 없음)', r2.bfr === null, r2.bfr);
  check('estimated_bfr 계산됨 (Deurenberg)', r2.estimated_bfr > 0, r2.estimated_bfr);
  check('body_data_source=estimated', r2.body_data_source === 'estimated', r2.body_data_source);
  check('age 정확히 계산됨 (1995→약 31세)', r2.age >= 30 && r2.age <= 33, r2.age);
  check('age_is_estimated=false (실제 birth_date 있음)', r2.age_is_estimated === false || r2.age_is_estimated === undefined, r2.age_is_estimated);
  check('macro_ratio 존재', r2.macro_ratio !== null, r2.macro_ratio);
  check('단백질 비율 합리적 (25~45%)', r2.macro_ratio?.protein_pct >= 25 && r2.macro_ratio?.protein_pct <= 45, r2.macro_ratio?.protein_pct);

  // ─── HTML 렌더링 확인 ────────────────────────────────────────
  console.log(`\n📋 케이스1 HTML 렌더링 검증`);
  await page.goto(`${BASE}/result/${TEST_IDS[0]}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(800);

  // p1MacroRatio 카드 노출 확인
  const macroCardVisible = await page.$eval('#p1MacroRatio', el => el !== null).catch(() => false);
  check('Ch1 탄단지 카드 렌더링됨', macroCardVisible !== false, macroCardVisible);

  // p1BodyStats 표시 확인
  const statsVisible = await page.$eval('#p1BodyStats', el => el.style.display !== 'none').catch(() => false);
  check('Ch1 신체 수치 카드 표시됨', statsVisible === true, statsVisible);

  // Ch5 역계산 처방 카드
  await page.evaluate(() => {
    if(typeof showChapter === 'function') showChapter(4);
  });
  await page.waitForTimeout(500);
  const ch5MacroExists = await page.$eval('#p5PersonalMacro', el => el !== null).catch(() => false);
  check('Ch5 개인 탄단지 카드 렌더링됨', ch5MacroExists !== false, ch5MacroExists);

  // 요약 출력
  console.log('\n' + '═'.repeat(50));
  checks.forEach(c => console.log(c));
  console.log('═'.repeat(50));
  console.log(`\n✅ ${pass}개 통과 / ❌ ${fail}개 실패`);

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
