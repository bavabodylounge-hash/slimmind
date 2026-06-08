const { chromium } = require('/usr/local/lib/node_modules/playwright');
const BASE_URL = 'http://localhost:3000';
const RESULT_ID = 'RES-20260608-U91TBU';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
  const page = await context.newPage();

  const errors = [];
  const logs = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'log') logs.push(msg.text().substring(0,200));
  });
  page.on('pageerror', err => errors.push('PageError: ' + err.message));

  console.log('📂 결과지 로드 중...');
  await page.goto(`${BASE_URL}/result/${RESULT_ID}`, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // readyState 대기
  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 });
  await sleep(2000);

  // init() 강제 실행 (headless 환경에서 DOMContentLoaded 타이밍 이슈 대응)
  const initResult = await page.evaluate(() => {
    if (typeof init === 'function') {
      try { init(); return 'called'; } catch(e) { return 'error: ' + e.message; }
    }
    return 'not-found';
  });
  console.log('🔧 init() 강제 호출:', initResult);
  await sleep(1500);

  // loadingState 사라졌는지 확인
  const loadingHidden = await page.evaluate(() => {
    const el = document.getElementById('loadingState');
    if (!el) return 'element-not-found';
    return el.style.display === 'none' ? 'hidden' : `visible(display=${el.style.display}, height=${el.offsetHeight})`;
  });
  console.log('📊 loadingState:', loadingHidden);

  // R 객체 확인
  const rCheck = await page.evaluate(() => {
    const R = window.__RESULT__;
    if (!R) return 'R is null';
    return `R ok: bc_primary=${R.result?.bc_primary}, emotional_state=${R.result?.emotional_state}`;
  });
  console.log('📋 데이터:', rCheck);

  // 챕터 1 스크린샷 및 내용 확인
  await page.screenshot({ path: '/tmp/ch01.png', fullPage: true });
  const ch1Text = await page.evaluate(() => document.body.innerText);
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📖 챕터 1 (${ch1Text.length}자)`);
  console.log('='.repeat(60));
  ch1Text.split('\n').filter(l=>l.trim()).slice(0,20).forEach(l => console.log('  ' + l));

  // 챕터별 상세 내용 확인 함수
  async function checkChapter(chIdx, chName) {
    // showChapter 함수 호출
    const moved = await page.evaluate((idx) => {
      if (typeof showChapter === 'function') {
        try { showChapter(idx); return true; } catch(e) { return false; }
      }
      return false;
    }, chIdx);

    await sleep(800);
    await page.screenshot({ path: `/tmp/ch${String(chIdx+1).padStart(2,'0')}.png`, fullPage: true });

    // 현재 표시 중인 챕터의 내용 추출
    const chData = await page.evaluate((idx) => {
      const CHAPTERS = ['ch1','ch2','ch3','ch4','ch45','ch5','ch6','ch7'];
      const chId = CHAPTERS[idx];
      const el = document.getElementById(chId);
      if (!el) return { text: 'element not found: ' + chId, sections: [] };
      const text = el.innerText;
      // 섹션별 내용 확인
      const sections = [];
      el.querySelectorAll('[id]').forEach(sec => {
        const secText = sec.innerText?.trim();
        if (secText && secText.length > 5) {
          sections.push({ id: sec.id, len: secText.length, preview: secText.substring(0, 80) });
        }
      });
      return { text, sections };
    }, chIdx);

    console.log(`\n${'='.repeat(60)}`);
    console.log(`📖 챕터 ${chIdx+1}: ${chName} (${moved?'✅':'❌'} moved, ${chData.text.length}자)`);
    console.log('='.repeat(60));
    chData.text.split('\n').filter(l=>l.trim()).slice(0,20).forEach(l => console.log('  ' + l));

    if (chData.sections.length > 0) {
      console.log('\n  📌 섹션별 내용:');
      chData.sections.slice(0,10).forEach(s => {
        console.log(`    [${s.id}] (${s.len}자) ${s.preview}`);
      });
    }
  }

  const CHAPTER_NAMES = [
    '감정 오프닝 + 바디코드',
    '생활 장면 + 스토리',
    '왜 안됐나 + 올바른 원리',
    '운동 처방',
    '회복 처방 + 타임라인',
    '식단 처방',
    '영양제 + 루틴',
    '마지막 처방 + 클로징'
  ];

  for (let i = 1; i < 8; i++) {
    await checkChapter(i, CHAPTER_NAMES[i]);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 JS 오류 목록:');
  if (errors.length === 0) {
    console.log('  ✅ 오류 없음');
  } else {
    errors.slice(0,10).forEach(e => console.log('  ❌', e));
  }

  if (logs.length > 0) {
    console.log('\n📝 콘솔 로그:');
    logs.slice(0,10).forEach(l => console.log('  [log]', l));
  }

  await browser.close();
  console.log('\n✅ 테스트 완료. 스크린샷: /tmp/ch01.png ~ /tmp/ch08.png');
}

run().catch(e => { console.error('❌ 오류:', e.message); process.exit(1); });
