const { chromium } = require('playwright');

(async () => {
  console.log('🚀 최종 DOM 검증 — 실제 표시되는 텍스트 기준\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://slimmind.kr/result-hospital/7c0f51de-deac-4b02-b973-f34c09795edd', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForFunction(() => { const el = document.getElementById('p1-full-code'); return el && el.textContent.trim().length > 0; }, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const BAD = ['수 기질','INFJ','BC-13','갱년기형','호르몬스위치 갱년기형'];

  // 실제 표시되는 요소로 검증 (innerHTML 교체된 부모 요소 기준)
  const targets = [
    // P1
    ['#p1-full-code',      'P1 풀코드'],
    ['#p1-meta-desc',      'P1 메타설명'],
    // P2 — innerHTML 교체된 p2-title과 p2-story
    ['#p2-title',          'P2 제목(BC코드 포함)'],
    ['#p2-story',          'P2 설명'],
    // P3
    ['#p3-insight-sub-1',  'P3 인사이트1'],
    ['#p3-insight-sub-2',  'P3 인사이트2'],
    // P5 — sSub.innerHTML로 직접 BC 삽입
    ['#p5-strong-sub',     'P5 섹션부제(BC코드)'],
    // P6 — fullCode 포함 code-display
    ['#p6-code-display',   'P6 코드설명'],
    // P7 — prev-tags, p7sum-nick
    ['#p7-prev-tags',      'P7 태그칩들'],
    ['#p7sum-nick',        'P7 닉네임'],
    ['#p7up-sub',          'P7 업셀문구'],
  ];

  let pass = 0, fail = 0;
  console.log('──────────────────────────────────────────────────────');
  for (const [sel, label] of targets) {
    const text = await page.$eval(sel, el => el.textContent.trim()).catch(() => 'NOT_FOUND');
    const hasBad = BAD.some(b => text.includes(b));
    const notFound = text === 'NOT_FOUND' || text === '';
    const ok = !hasBad && !notFound;
    if (ok) pass++; else fail++;
    console.log(`${ok ? '✅' : '❌'} ${label.padEnd(20)} | ${text.substring(0, 70)}`);
  }

  console.log('──────────────────────────────────────────────────────');
  console.log(`최종: ${pass}개 PASS / ${fail}개 FAIL\n`);

  // 핵심 키워드 직접 확인
  const p1 = await page.$eval('#p1-full-code', el => el.textContent).catch(() => '');
  const p2 = await page.$eval('#p2-title', el => el.textContent).catch(() => '');
  const p5 = await page.$eval('#p5-strong-sub', el => el.textContent).catch(() => '');
  const p6 = await page.$eval('#p6-code-display', el => el.textContent).catch(() => '');
  const p7tags = await page.$eval('#p7-prev-tags', el => el.textContent).catch(() => '');

  console.log('📌 핵심 키워드:');
  console.log('  P1 금 기질 :', p1.includes('금') ? '✅' : '❌', '|', p1.substring(0,50));
  console.log('  P1 ENTP    :', p1.includes('ENTP') ? '✅' : '❌');
  console.log('  P2 BC-3    :', p2.includes('BC-3') ? '✅' : '❌', '|', p2.substring(0,40));
  console.log('  P5 BC-3    :', p5.includes('BC-3') ? '✅' : '❌', '|', p5.substring(0,40));
  console.log('  P6 fullCode:', p6.includes('금') || p6.includes('ENTP') ? '✅' : '❌', '|', p6.substring(0,60));
  console.log('  P7 칩 금   :', p7tags.includes('금') ? '✅' : '❌', '|', p7tags.substring(0,40));
  console.log('  P7 칩 ENTP :', p7tags.includes('ENTP') ? '✅' : '❌');

  await browser.close();
  console.log('\n🏁 검증 완료');
})();
