/**
 * SlimMind 종합 테스트 스크립트 v2
 * - 실제 element ID 기반으로 수정
 * - Ch1~Ch8 전체 챕터 + JS오류 + 빈 섹션 검사
 */
const { chromium } = require('/usr/local/lib/node_modules/playwright');

const BASE_URL = 'http://localhost:3000';

const TEST_RESULTS = [
  { id: 'RES-20260608-U91TBU', bc: 'BC-06', label: '냉증셀룰라이트형' },
  { id: 'RES-20260608-00CJK1', bc: 'BC-05', label: '하체지방형' },
  { id: 'RES-20260608-FW4VHK', bc: 'BC-03', label: '상체비대형' },
  { id: 'RES-20260608-OLNMU3', bc: 'BC-01', label: '내장지방형' },
  { id: 'RES-20260605-X9Y8Z7', bc: 'BC-09', label: '코르티솔형' },
];

// 실제 result.html의 ID와 챕터 매핑
const CHAPTER_CHECKS = [
  {
    idx: 0, name: 'Ch1 신체분석',
    checks: [
      { id: 'p1StatsGrid',    label: '신체수치 카드',       minLen: 20 },
      { id: 'p1BcCode',       label: 'BC 코드',             minLen: 2  },
      { id: 'p1BcBrand',      label: 'BC 브랜드명',          minLen: 2  },
      { id: 'p1Checklist',    label: '증상 체크리스트',      minLen: 10 },
    ]
  },
  {
    idx: 1, name: 'Ch2 생활장면',
    checks: [
      { id: 'p2SceneText',    label: '공감 장면 텍스트',    minLen: 10 },
      { id: 'p2SceneResolve', label: '해결 메시지',          minLen: 5  },
    ]
  },
  {
    idx: 2, name: 'Ch3 원인분석',
    checks: [
      { id: 'p3WrongMethods',     label: '잘못된 방법',      minLen: 10 },
      { id: 'p3CorrectPrinciples',label: '올바른 원칙',      minLen: 5  },
    ]
  },
  {
    idx: 3, name: 'Ch4 운동처방',
    checks: [
      { id: 'p4Sports',       label: '추천 운동',            minLen: 5  },
      { id: 'p4Schedule',     label: '주간 운동 스케줄',     minLen: 5  },
    ]
  },
  {
    idx: 4, name: 'Ch4.5 회복처방',
    checks: [
      { id: 'p45Recovery',    label: '회복 처방',            minLen: 5  },
    ]
  },
  {
    idx: 5, name: 'Ch5 식단처방',
    checks: [
      { id: 'p5MealPlan',     label: '1주차 식단 테이블',    minLen: 20 },
      { id: 'p5Foods',        label: '음식 처방 섹션',       minLen: 5  },
    ]
  },
  {
    idx: 6, name: 'Ch6 영양+루틴',
    checks: [
      { id: 'p6Supplements',  label: '영양제 목록',          minLen: 5  },
      { id: 'p6Lifestyle',    label: '생활 수칙',            minLen: 5  },
    ]
  },
  {
    idx: 7, name: 'Ch7 심리+마무리',
    checks: [
      { id: 'p7Closing',      label: '마무리 섹션',          minLen: 5  },
    ]
  },
];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testResult(page, resultInfo) {
  const jsErrors = [];
  const errors   = [];
  const warnings = [];

  page.removeAllListeners('console');
  page.removeAllListeners('pageerror');
  page.on('console', msg => {
    if (msg.type() === 'error') jsErrors.push(msg.text());
  });
  page.on('pageerror', err => jsErrors.push('[PageError] ' + err.message));

  await page.goto(`${BASE_URL}/result/${resultInfo.id}`, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
  await sleep(1200);

  // init 강제 호출
  const initR = await page.evaluate(() => {
    if (typeof init === 'function') {
      try { init(); return 'ok'; } catch(e) { return 'err:' + e.message; }
    }
    return 'not-found';
  });
  if (initR !== 'ok') errors.push(`init() 실패: ${initR}`);
  await sleep(1800);

  // BC 코드 확인
  const actualBc = await page.evaluate(() =>
    window.__RESULT__ ? (window.__RESULT__.result.bc_primary || '?') : 'no-R'
  );
  if (actualBc !== resultInfo.bc) {
    warnings.push(`BC 코드 불일치: 기대=${resultInfo.bc}, 실제=${actualBc}`);
  }

  // 로딩 화면이 여전히 보이는지
  const stillLoading = await page.evaluate(() => {
    const el = document.getElementById('loadingState');
    if (!el) return false;
    const s = window.getComputedStyle(el);
    return s.display !== 'none' && s.visibility !== 'hidden';
  });
  if (stillLoading) errors.push('로딩 화면이 여전히 표시됨 (init 미실행)');

  // 챕터별 검사
  const chapterResults = [];
  for (const ch of CHAPTER_CHECKS) {
    await page.evaluate((idx) => {
      if (typeof showChapter === 'function') showChapter(idx);
    }, ch.idx);
    await sleep(700);

    const chResult = { name: ch.name, items: [] };
    for (const check of ch.checks) {
      const info = await page.evaluate((elId) => {
        const el = document.getElementById(elId);
        if (!el) return { found: false, len: 0, preview: '' };
        const txt = (el.innerText || el.textContent || '').trim();
        return { found: true, len: txt.length, preview: txt.substring(0, 70) };
      }, check.id);

      let status;
      if (!info.found) {
        status = '⚠️ 요소없음';
      } else if (info.len < check.minLen) {
        status = '❌ 내용부족(' + info.len + '자)';
      } else {
        status = '✅';
      }
      chResult.items.push({ label: check.label, status, preview: info.preview });
    }
    chapterResults.push(chResult);
  }

  return { resultInfo, initR, actualBc, jsErrors, errors, warnings, chapterResults };
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  SlimMind 종합 테스트 v2');
  console.log('═══════════════════════════════════════════════════════════\n');

  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page    = await browser.newPage();

  let totalPass = 0, totalFail = 0, totalWarn = 0;
  const failDetails = [];

  for (const ri of TEST_RESULTS) {
    console.log(`\n━━━ [${ri.bc}] ${ri.label} (${ri.id}) ━━━`);
    const r = await testResult(page, ri);

    // JS 오류
    if (r.jsErrors.length > 0) {
      console.log(`  🔴 JS오류 ${r.jsErrors.length}개:`);
      r.jsErrors.slice(0, 5).forEach(e => {
        const short = e.substring(0, 120);
        console.log(`     - ${short}`);
        failDetails.push(`[${ri.bc}] JS오류: ${short}`);
      });
      totalFail += r.jsErrors.length;
    } else {
      console.log(`  ✅ JS오류 없음`);
    }

    // 기타 오류/경고
    r.errors.forEach(e => {
      console.log(`  ❌ ${e}`);
      failDetails.push(`[${ri.bc}] ${e}`);
      totalFail++;
    });
    r.warnings.forEach(w => { console.log(`  ⚠️  ${w}`); totalWarn++; });

    // 챕터별 결과 출력
    for (const ch of r.chapterResults) {
      const hasFail  = ch.items.some(i => i.status.startsWith('❌'));
      const hasWarn  = ch.items.some(i => i.status.startsWith('⚠️'));
      const icon     = hasFail ? '❌' : hasWarn ? '⚠️ ' : '✅';
      console.log(`\n  ${icon} ${ch.name}`);
      for (const item of ch.items) {
        const s = item.status;
        console.log(`    ${s} ${item.label}${s === '✅' ? ': ' + item.preview : ''}`);
        if (s === '✅') totalPass++;
        else if (s.startsWith('❌')) {
          totalFail++;
          failDetails.push(`[${ri.bc}][${ch.name}] ${item.label} - ${s}`);
        } else {
          totalWarn++;
        }
      }
    }
  }

  await browser.close();

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  최종 결과: ✅ ${totalPass}개 통과 / ❌ ${totalFail}개 실패 / ⚠️  ${totalWarn}개 경고`);
  if (failDetails.length > 0) {
    console.log('\n  [실패 목록]');
    failDetails.forEach(d => console.log('  • ' + d));
  }
  console.log('═══════════════════════════════════════════════════════════');

  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
