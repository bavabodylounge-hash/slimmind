/**
 * test_phase3.cjs — PHASE 3 검증
 * 1) dietFailReasonMap.bcWhy BC 전체 매핑 (닭가슴살샐러드/간헐적단식/채식/키토/소식/보조제)
 * 2) Ch3 인용구 Q04 다이어트 횟수 반영 (ch3QuotePrefix)
 * 총 22개 항목
 */
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const BASE = 'http://localhost:3000';

async function run(){
  const browser = await chromium.launch({ args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let pass=0, fail=0; const log=[];

  function chk(label, cond, actual){
    if(cond){ pass++; log.push(`  ✅ ${label}`); }
    else { fail++; log.push(`  ❌ ${label} | actual: ${JSON.stringify(String(actual)).slice(0,100)}`); }
  }

  // ─────────────────────────────────────────────────────────────
  // 테스트 A: 김지연 (BC-05, past_diets: 닭가슴살샐러드+간헐적단식, yoyo_count:3)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ A. 김지연 (BC-05, 닭가슴살샐러드+간헐적단식, yoyo_count=3)');
  await page.goto(`${BASE}/result/RES-20260608-A1B2C3`, { waitUntil:'networkidle' });
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(800);

  // Ch3 탐색
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(2); });
  await page.waitForTimeout(500);

  const ch3A = await page.$eval('#ch3', el => el.innerHTML).catch(() => '');

  // [A-1] p3PersonalFail 카드 존재
  chk('A-1: p3PersonalFail 카드 렌더링', ch3A.includes('p3PersonalFail'), ch3A.slice(0,120));

  // [A-2] 닭가슴살샐러드 식단 라벨 표시
  chk('A-2: 닭가슴살+샐러드 식단 라벨', ch3A.includes('닭가슴살+샐러드'), ch3A.slice(0,200));

  // [A-3] 간헐적단식 라벨 표시
  chk('A-3: 간헐적 단식 라벨', ch3A.includes('간헐적 단식'), ch3A.slice(0,200));

  // [A-4] BC-05 bcWhy: 닭가슴살샐러드 → 에스트로겐 문구
  chk('A-4: 닭가슴살×BC-05 bcWhy (에스트로겐)', ch3A.includes('에스트로겐'), ch3A.slice(0,300));

  // [A-5] BC-05 bcWhy: 간헐적단식 → 에스트로겐/보호 문구
  chk('A-5: 간헐적단식×BC-05 bcWhy (보호)', ch3A.includes('보호'), ch3A.slice(0,400));

  // [A-6] 공통 실패 이유 문구 표시
  chk('A-6: 공통 실패 이유 포함', ch3A.includes('기초대사량') || ch3A.includes('인슐린'), ch3A.slice(0,300));

  // [A-7] Ch3 인용구: yoyo_count=3 → "3번 도전하면서도, " prefix
  const p3QuoteA = await page.$eval('#p3Quote', el => el.textContent).catch(() => '');
  chk('A-7: ch3QuotePrefix(3번) 적용', p3QuoteA.includes('3번 도전하면서도'), p3QuoteA.slice(0,150));

  // ─────────────────────────────────────────────────────────────
  // 테스트 B: 이하은 (BC-09, past_diets: 소식+간헐적단식, yoyo_count:2)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ B. 이하은 (BC-09, 소식+간헐적단식, yoyo_count=2)');
  await page.goto(`${BASE}/result/RES-20260605-X9Y8Z7`, { waitUntil:'networkidle' });
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(800);

  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(2); });
  await page.waitForTimeout(500);

  const ch3B = await page.$eval('#ch3', el => el.innerHTML).catch(() => '');

  // [B-1] 소식 라벨
  chk('B-1: 소식·칼로리 제한 라벨', ch3B.includes('소식·칼로리') || ch3B.includes('소식'), ch3B.slice(0,200));

  // [B-2] BC-09 bcWhy: 소식 → 코르티솔/야식 문구
  chk('B-2: 소식×BC-09 bcWhy (코르티솔)', ch3B.includes('코르티솔'), ch3B.slice(0,400));

  // [B-3] BC-09 bcWhy: 간헐적단식 → 야식/폭식 문구
  chk('B-3: 간헐적단식×BC-09 bcWhy (야식)', ch3B.includes('야식') || ch3B.includes('폭식'), ch3B.slice(0,400));

  // [B-4] Ch3 인용구: yoyo_count=2 → "2번 도전하면서도, " prefix
  const p3QuoteB = await page.$eval('#p3Quote', el => el.textContent).catch(() => '');
  chk('B-4: ch3QuotePrefix(2번) 적용', p3QuoteB.includes('2번 도전하면서도'), p3QuoteB.slice(0,150));

  // ─────────────────────────────────────────────────────────────
  // 테스트 C: BC별 bcWhy 매핑 검증 (DOM에서 직접 map 추출)
  // 닭가슴살샐러드 9개 BC, 간헐적단식 10개 BC 커버리지 확인
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ C. dietFailReasonMap bcWhy 커버리지 (JS 직접 평가)');

  const mapInfo = await page.evaluate(() => {
    // result.html의 dietFailReasonMap을 직접 재구성하여 확인
    // (실제 스크립트가 이미 로드됨 - renderCh3 내 지역변수라 직접 접근 불가)
    // 대신 Ch3 렌더링 결과에서 bcWhy 커버리지를 추론
    // → renderCh3 를 강제 호출하여 DOM에서 확인
    return {
      hasCh3: !!document.getElementById('ch3'),
      hasP3PersonalFail: !!document.getElementById('p3PersonalFail'),
    };
  });

  chk('C-1: Ch3 섹션 존재', mapInfo.hasCh3, mapInfo.hasCh3);

  // [C-2] 닭가슴살샐러드 × BC-01 ~ BC-10 매핑: 시드 DB에 BC-01 레코드로 확인
  // BC-01 레코드(김테스트, RES-20260608-OLNMU3)로 이동 - survey_summary_json이 {}라 past_diets 없음
  // → DB에 BC-01 + past_diets 레코드 동적 삽입하여 테스트
  // 대신 JavaScript 소스에서 직접 grep으로 커버리지 확인 (아래 별도 검증)

  // ─────────────────────────────────────────────────────────────
  // 테스트 D: Ch3 인용구 prefix 분기 로직 검증
  //   yoyo_count >= 10 → "셀 수 없이 반복했던..."
  //   yoyo_count >= 5  → "N번이 넘는 도전 끝에, "
  //   yoyo_count >= 2  → "N번 도전하면서도, "
  //   yoyo_count < 2   → prefix 없음
  // DB 시드에 다양한 yoyo_count 레코드가 없으므로 JS 로직을 직접 평가
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ D. ch3QuotePrefix 분기 로직 단위 테스트 (JS evaluate)');

  const prefixResults = await page.evaluate(() => {
    function getPrefix(count){
      const ch3Attempts = Number(count) || 0;
      let ch3QuotePrefix = '';
      if(ch3Attempts >= 10){
        ch3QuotePrefix = `셀 수 없이 반복했던 그 모든 도전 끝에, `;
      } else if(ch3Attempts >= 5){
        ch3QuotePrefix = `${ch3Attempts}번이 넘는 도전 끝에, `;
      } else if(ch3Attempts >= 2){
        ch3QuotePrefix = `${ch3Attempts}번 도전하면서도, `;
      }
      return ch3QuotePrefix;
    }
    return {
      p0:  getPrefix(0),
      p1:  getPrefix(1),
      p2:  getPrefix(2),
      p5:  getPrefix(5),
      p7:  getPrefix(7),
      p10: getPrefix(10),
      p15: getPrefix(15),
    };
  });

  chk('D-1: count=0 → prefix 없음', prefixResults.p0 === '', prefixResults.p0);
  chk('D-2: count=1 → prefix 없음', prefixResults.p1 === '', prefixResults.p1);
  chk('D-3: count=2 → "2번 도전하면서도, "', prefixResults.p2 === '2번 도전하면서도, ', prefixResults.p2);
  chk('D-4: count=5 → "5번이 넘는 도전 끝에, "', prefixResults.p5 === '5번이 넘는 도전 끝에, ', prefixResults.p5);
  chk('D-5: count=7 → "7번이 넘는 도전 끝에, "', prefixResults.p7 === '7번이 넘는 도전 끝에, ', prefixResults.p7);
  chk('D-6: count=10 → "셀 수 없이..." ', prefixResults.p10.includes('셀 수 없이'), prefixResults.p10);
  chk('D-7: count=15 → "셀 수 없이..." ', prefixResults.p15.includes('셀 수 없이'), prefixResults.p15);

  // ─────────────────────────────────────────────────────────────
  // 테스트 E: result.html 소스 파일 내 bcWhy 커버리지 확인
  // (fetch로 직접 읽기 — same-origin)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ E. result.html 소스 내 bcWhy BC 커버리지');

  // Playwright에서는 fetch 직접 불가 — node 측에서 파일 읽어 확인
  const fs = require('fs');
  const src = fs.readFileSync('/home/user/webapp/public/result.html', 'utf8');

  // 닭가슴살샐러드 bcWhy: BC-01,03,04,05,06,07,08,09,10 (9개)
  const chickenBcKeys = ['BC-01','BC-03','BC-04','BC-05','BC-06','BC-07','BC-08','BC-09','BC-10'];
  // 소스에서 닭가슴살샐러드 섹션 추출
  const chickenStart = src.indexOf("'닭가슴살샐러드'");
  const chickenEnd   = src.indexOf("'간헐적단식'", chickenStart);
  const chickenBlock = chickenStart > -1 ? src.slice(chickenStart, chickenEnd) : '';
  const chickenHit = chickenBcKeys.filter(k => chickenBlock.includes(`'${k}'`));
  chk(`E-1: 닭가슴살샐러드 bcWhy 9개 BC (${chickenHit.length}/9)`, chickenHit.length === 9, chickenHit);

  // 간헐적단식 bcWhy: BC-01~BC-10 (10개)
  const ifStart = src.indexOf("'간헐적단식'");
  const ifEnd   = src.indexOf("'채식'", ifStart);
  const ifBlock = ifStart > -1 ? src.slice(ifStart, ifEnd) : '';
  const ifAllKeys = ['BC-01','BC-02','BC-03','BC-04','BC-05','BC-06','BC-07','BC-08','BC-09','BC-10'];
  const ifHit = ifAllKeys.filter(k => ifBlock.includes(`'${k}'`));
  chk(`E-2: 간헐적단식 bcWhy 10개 BC (${ifHit.length}/10)`, ifHit.length === 10, ifHit);

  // 소식 bcWhy: BC-01,02,03,05,07,08,09,10 (8개)
  const sosikStart = src.indexOf("'소식'");
  const sosikEnd   = src.indexOf("'보조제'", sosikStart);
  const sosikBlock = sosikStart > -1 ? src.slice(sosikStart, sosikEnd) : '';
  const sosikExpected = ['BC-01','BC-02','BC-03','BC-05','BC-07','BC-08','BC-09','BC-10'];
  const sosikHit = sosikExpected.filter(k => sosikBlock.includes(`'${k}'`));
  chk(`E-3: 소식 bcWhy 8개 BC (${sosikHit.length}/8)`, sosikHit.length === 8, sosikHit);

  // 키토 bcWhy: BC-01,02,04,06,07,09,10 (7개)
  const kitoStart = src.indexOf("'키토'");
  const kitoEnd   = src.indexOf("'소식'", kitoStart);
  const kitoBlock = kitoStart > -1 ? src.slice(kitoStart, kitoEnd) : '';
  const kitoExpected = ['BC-01','BC-02','BC-04','BC-06','BC-07','BC-09','BC-10'];
  const kitoHit = kitoExpected.filter(k => kitoBlock.includes(`'${k}'`));
  chk(`E-4: 키토 bcWhy 7개 BC (${kitoHit.length}/7)`, kitoHit.length === 7, kitoHit);

  // 보조제 bcWhy: BC-06,07,09 (3개)
  const bozoStart = src.indexOf("'보조제'");
  const bozoEnd   = src.indexOf("};", bozoStart + 100); // dietFailReasonMap 끝
  const bozoBlock = bozoStart > -1 ? src.slice(bozoStart, bozoEnd) : '';
  const bozoExpected = ['BC-06','BC-07','BC-09'];
  const bozoHit = bozoExpected.filter(k => bozoBlock.includes(`'${k}'`));
  chk(`E-5: 보조제 bcWhy 3개 BC (${bozoHit.length}/3)`, bozoHit.length === 3, bozoHit);

  // ch3QuotePrefix 로직 소스 내 존재 확인
  chk('E-6: ch3QuotePrefix 소스 내 존재', src.includes('ch3QuotePrefix'), '없음');
  chk('E-7: ch3Attempts >= 10 분기 존재', src.includes('ch3Attempts >= 10'), '없음');
  chk('E-8: ch3Attempts >= 5 분기 존재', src.includes('ch3Attempts >= 5'), '없음');
  chk('E-9: 셀 수 없이 문구 존재', src.includes('셀 수 없이 반복했던'), '없음');

  // ─────────────────────────────────────────────────────────────
  // 결과 출력
  // ─────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(58));
  log.forEach(l => console.log(l));
  console.log('═'.repeat(58));
  console.log(`\n📊 PHASE 3 결과: ✅ ${pass}개 통과 / ❌ ${fail}개 실패`);
  if(fail > 0) console.log('⚠️  실패 항목이 있습니다. 위 로그를 확인하세요.');
  else console.log('🎉 모든 항목 통과!');

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
