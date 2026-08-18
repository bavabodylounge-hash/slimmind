const { chromium } = require('playwright');

(async () => {
  console.log('🚀 브라우저 실측 DOM 검증 시작 (전체 렌더 대기)\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const URL = 'https://slimmind.kr/result-hospital/7c0f51de-deac-4b02-b973-f34c09795edd';
  console.log('🔗 접속:', URL);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  // renderAll 완료 대기 — p1-full-code가 채워질 때까지
  await page.waitForFunction(() => {
    const el = document.getElementById('p1-full-code');
    return el && el.textContent.trim().length > 0;
  }, { timeout: 10000 }).catch(() => console.log('⚠️ p1-full-code 대기 타임아웃'));

  await page.waitForTimeout(2000);

  // renderAll이 실행되면 모든 페이지 DOM이 한 번에 생성됨 — 바로 읽기
  const BAD = ['수 기질','INFJ','BC-13','갱년기형','호르몬스위치 갱년기형','BC-?'];

  const targets = [
    ['#p1-full-code',       'P1 풀코드'],
    ['#p1-meta-desc',       'P1 메타설명'],
    ['#p2-bc-code-em',      'P2 BC코드(em)'],
    ['#p2-bc-code-note',    'P2 BC코드(note)'],
    ['#p3-insight-sub-1',   'P3 인사이트1'],
    ['#p3-insight-sub-2',   'P3 인사이트2'],
    ['#p5-bc-code-inline',  'P5 BC코드'],
    ['#p6-fullcode-strong', 'P6 풀코드'],
    ['#p7up-nick',          'P7 닉네임'],
    ['#p7-chip-ohaeng',     'P7 오행칩'],
    ['#p7-chip-mbti',       'P7 MBTI칩'],
    ['#p7-chip-bc',         'P7 BC칩'],
  ];

  let pass = 0, fail = 0;
  console.log('──────────────────────────────────────────────────────');
  for (const [sel, label] of targets) {
    const text = await page.$eval(sel, el => el.textContent.trim()).catch(() => 'NOT_FOUND');
    const hasBad = BAD.some(b => text.includes(b));
    const notFound = text === 'NOT_FOUND' || text === '';
    const ok = !hasBad && !notFound;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✅' : '❌'} ${label.padEnd(18)} | ${text.substring(0, 72)}`);
  }

  console.log('──────────────────────────────────────────────────────');
  console.log(`최종: ${pass}개 PASS / ${fail}개 FAIL`);

  // 핵심 키워드 확인
  const p1 = await page.$eval('#p1-full-code', el => el.textContent).catch(() => '');
  const p2 = await page.$eval('#p2-bc-code-em', el => el.textContent).catch(() => '');
  const p7chip = await page.$eval('#p7-chip-ohaeng', el => el.textContent).catch(() => '');
  console.log('\n📌 핵심 키워드 체크:');
  console.log('  금 기질:', p1.includes('금') || p7chip.includes('금') ? '✅' : '❌');
  console.log('  ENTP   :', p1.includes('ENTP') ? '✅' : '❌');
  console.log('  BC-3   :', p2.includes('BC-3') ? '✅' : '❌', '(P2)');

  await browser.close();
  console.log('\n🏁 검증 완료');
  process.exit(fail > 0 ? 1 : 0);
})();
