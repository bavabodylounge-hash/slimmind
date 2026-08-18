const { chromium } = require('playwright');

(async () => {
  console.log('🚀 브라우저 실측 DOM 검증 시작\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // ── 1. 김예슬 결과지 ──────────────────────────────────────────────
  const URL_YESUL = 'https://slimmind.kr/result-hospital/7c0f51de-deac-4b02-b973-f34c09795edd';
  console.log('🔗 접속:', URL_YESUL);
  await page.goto(URL_YESUL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(4000);

  const BAD = ['수 기질','INFJ','BC-13','갱년기형','호르몬스위치 갱년기형','BC-?'];
  const EXPECTED = { ohaeng:'금', mbti:'ENTP', bc:'BC-3' };

  const targets = [
    ['#p1-full-code',       'P1 풀코드'],
    ['#p1-meta-desc',       'P1 메타설명'],
    ['#p2-bc-code-em',      'P2 BC코드'],
    ['#p3-insight-sub-1',   'P3 인사이트1'],
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
    const notFound = text === 'NOT_FOUND';
    const ok = !hasBad && !notFound;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✅' : '❌'} ${label.padEnd(16)} | ${text.substring(0, 70)}`);
  }

  console.log('──────────────────────────────────────────────────────');
  console.log(`결과: ${pass}개 PASS / ${fail}개 FAIL\n`);

  // 오행/MBTI/BC 키워드 포함 여부
  const p1Text = await page.$eval('#p1-full-code', el => el.textContent).catch(() => '');
  console.log('✔️  금 기질 포함:', p1Text.includes('금'));
  console.log('✔️  ENTP 포함   :', p1Text.includes('ENTP'));
  console.log('✔️  BC-3 포함   :', p1Text.includes('BC-3'));

  await browser.close();
  console.log('\n🏁 검증 완료');
  process.exit(fail > 0 ? 1 : 0);
})();
