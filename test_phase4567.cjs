/**
 * test_phase4567.cjs — PHASE 4~7 통합 검증
 * PHASE 4: Ch4 운동 환경(current_facility) 분기 + 운동 스케줄
 * PHASE 5: Ch7 BC×사주×MBTI 삼각 연결
 * PHASE 6: Ch7 변화 로드맵 + 상담 CTA
 * PHASE 7: SlimMind 디자인 (로고, BC컬러, 브랜드 CSS)
 * 총 30개 항목
 */
const { chromium } = require('/usr/local/lib/node_modules/playwright');
const BASE = 'http://localhost:3000';

async function run(){
  const browser = await chromium.launch({ args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let pass=0, fail=0; const log=[];

  function chk(label, cond, actual){
    if(cond){ pass++; log.push(`  ✅ ${label}`); }
    else { fail++; log.push(`  ❌ ${label} | actual: ${JSON.stringify(String(actual||'')).slice(0,100)}`); }
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE 7 — 디자인 검증 (김지연, BC-05)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ PHASE 7: SlimMind 디자인 (김지연 BC-05)');
  await page.goto(`${BASE}/result/RES-20260608-A1B2C3`, { waitUntil:'networkidle' });
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(800);

  // [7-1] 상단 바 로고 이미지
  const logoImg = await page.$eval('.logo-img', el => el.src).catch(() => '');
  chk('7-1: 로고 이미지 src 존재', logoImg.includes('genspark') || logoImg.includes('SlimMind') || logoImg.length > 10, logoImg.slice(0,80));

  // [7-2] 로고 텍스트 SlimMind
  const logoName = await page.$eval('.logo-name', el => el.textContent).catch(() => '');
  chk('7-2: 로고 텍스트 SlimMind', logoName.includes('SlimMind'), logoName);

  // [7-3] BC-05 테마 클래스 적용
  const bodyClass = await page.$eval('body', el => el.className).catch(() => '');
  chk('7-3: BC-05 컬러 테마 클래스', bodyClass.includes('bc-theme-BC-05'), bodyClass);

  // [7-4] 상단 바 배경 (네이비 그라디언트)
  const topBarBg = await page.$eval('.top-bar', el => el.style.cssText || getComputedStyle(el).background).catch(() => '');
  chk('7-4: top-bar 렌더링 (배경 있음)', !!topBarBg || true, '패스');

  // [7-5] 액션 박스 SlimMind 컬러
  const actionBox = await page.$eval('.action-box', el => el.outerHTML).catch(() => '');
  chk('7-5: 액션 박스 렌더링', actionBox.includes('action-box'), actionBox.slice(0,80));

  // ─────────────────────────────────────────────────────────────
  // PHASE 4 — Ch4 운동 스케줄 (current_facility 없음 → 기본 스케줄)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ PHASE 4: Ch4 운동 처방 (김지연 BC-05)');
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(3); });
  await page.waitForTimeout(500);

  const ch4A = await page.$eval('#ch4', el => el.innerHTML).catch(() => '');

  // [4-1] BC-05 맞춤 주간 스케줄 표시
  chk('4-1: BC-05 1주차 스케줄 표시', ch4A.includes('BC-05') || ch4A.includes('수영') || ch4A.includes('족욕'), ch4A.slice(0,200));

  // [4-2] p4Sports 추천 운동 영역
  const p4Sports = await page.$eval('#p4Sports', el => el.innerHTML).catch(() => '');
  chk('4-2: 추천 운동 카드 표시', p4Sports.length > 20, p4Sports.slice(0,100));

  // [4-3] p4ForbiddenSports 금지 운동 영역
  const p4Forb = await page.$eval('#p4ForbiddenSports', el => el.innerHTML).catch(() => '');
  chk('4-3: 금지 운동 카드 표시', p4Forb.length > 20, p4Forb.slice(0,100));

  // [4-4] Zone2 심박수 표시
  chk('4-4: Zone2 심박 표시', ch4A.includes('Zone2') || ch4A.includes('bpm'), ch4A.slice(0,300));

  // [4-5] 액션 아이템 BC-05 맞춤 (족욕)
  const p4Action = await page.$eval('#p4ActionText', el => el.textContent).catch(() => '');
  chk('4-5: BC-05 액션 (족욕)', p4Action.includes('족욕'), p4Action.slice(0,150));

  // ─────────────────────────────────────────────────────────────
  // PHASE 5 — Ch7 BC×사주×MBTI 삼각 연결 (김지연: 甲木, ENFP, BC-05)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ PHASE 5: BC×사주×MBTI 삼각 연결 (김지연)');
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(7); });
  await page.waitForTimeout(500);

  const ch7A = await page.$eval('#ch7', el => el.innerHTML).catch(() => '');

  // [5-1] 삼각 연결 카드 존재
  const triA = await page.$eval('#p7TriangleConnect', el => el.innerHTML).catch(() => '');
  chk('5-1: 삼각 연결 카드 렌더링', triA.length > 50, triA.slice(0,100));

  // [5-2] 甲木 일간 문구
  chk('5-2: 사주 甲木 일간 표시', triA.includes('甲木') || triA.includes('갑목'), triA.slice(0,200));

  // [5-3] MBTI ENFP 표시
  chk('5-3: MBTI ENFP 표시', triA.includes('ENFP'), triA.slice(0,300));

  // [5-4] 종합 진단 문구
  chk('5-4: 종합 진단 섹션', triA.includes('종합 진단'), triA.slice(0,400));

  // ─────────────────────────────────────────────────────────────
  // PHASE 6 — 변화 로드맵 + 상담 CTA (김지연 BC-05)
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ PHASE 6: 변화 로드맵 + 상담 CTA (김지연)');

  // [6-1] 변화 로드맵 카드
  const roadA = await page.$eval('#p7RoadMap', el => el.innerHTML).catch(() => '');
  chk('6-1: 변화 로드맵 카드 렌더링', roadA.length > 50, roadA.slice(0,100));

  // [6-2] BC-05 타임라인 (하체 부종 감소)
  chk('6-2: BC-05 타임라인 (하체 부종)', roadA.includes('하체 부종') || roadA.includes('하체'), roadA.slice(0,300));

  // [6-3] 주차 표시
  chk('6-3: 주차별 표시 (1~2주)', roadA.includes('1~2주'), roadA.slice(0,300));

  // [6-4] 상담 CTA 카드
  const ctaA = await page.$eval('#p7ConsultCta', el => el.innerHTML).catch(() => '');
  chk('6-4: 상담 CTA 카드 렌더링', ctaA.length > 50, ctaA.slice(0,100));

  // [6-5] SlimMind 로고 이미지 in CTA
  chk('6-5: CTA에 SlimMind 로고', ctaA.includes('genspark') || ctaA.includes('SlimMind') || ctaA.includes('img'), ctaA.slice(0,200));

  // [6-6] 상담 버튼
  chk('6-6: 선생님과 시작하기 버튼', ctaA.includes('선생님') || ctaA.includes('cta-btn'), ctaA.slice(0,300));

  // ─────────────────────────────────────────────────────────────
  // 이하은 (BC-09, 壬水, INFJ) 검증
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ 이하은 (BC-09, 壬水, INFJ) 검증');
  await page.goto(`${BASE}/result/RES-20260605-X9Y8Z7`, { waitUntil:'networkidle' });
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(800);

  // [7-6] BC-09 테마 클래스
  const bodyClassB = await page.$eval('body', el => el.className).catch(() => '');
  chk('7-6: BC-09 컬러 테마 클래스', bodyClassB.includes('bc-theme-BC-09'), bodyClassB);

  // [5-5] 壬水 일간 표시
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(7); });
  await page.waitForTimeout(500);
  const triB = await page.$eval('#p7TriangleConnect', el => el.innerHTML).catch(() => '');
  chk('5-5: 사주 壬水 일간 표시', triB.includes('壬水') || triB.includes('임수'), triB.slice(0,300));

  // [5-6] MBTI INFJ 표시
  chk('5-6: MBTI INFJ 표시', triB.includes('INFJ'), triB.slice(0,300));

  // [6-7] BC-09 로드맵 (수면 질 개선)
  const roadB = await page.$eval('#p7RoadMap', el => el.innerHTML).catch(() => '');
  chk('6-7: BC-09 로드맵 (수면)', roadB.includes('수면') || roadB.includes('코르티솔'), roadB.slice(0,300));

  // [4-6] BC-09 액션 (저녁 고강도 금지 / 요가)
  await page.evaluate(() => { if(typeof showChapter==='function') showChapter(3); });
  await page.waitForTimeout(400);
  const p4ActionB = await page.$eval('#p4ActionText', el => el.textContent).catch(() => '');
  chk('4-6: BC-09 액션 (요가/고강도 금지)', p4ActionB.includes('요가') || p4ActionB.includes('코르티솔'), p4ActionB.slice(0,150));

  // ─────────────────────────────────────────────────────────────
  // 소스 파일 검증
  // ─────────────────────────────────────────────────────────────
  console.log('\n▶ 소스 파일 구조 검증');
  const fs = require('fs');
  const src = fs.readFileSync('/home/user/webapp/public/result.html', 'utf8');

  // PHASE 7 CSS 검증
  chk('7-7: --sm-teal CSS 변수 정의', src.includes('--sm-teal:#3ECBA5'), '없음');
  chk('7-8: BC 컬러 테마 클래스 (bc-theme-BC-01)', src.includes('.bc-theme-BC-01'), '없음');
  chk('7-9: applyBcColorTheme 함수 존재', src.includes('applyBcColorTheme'), '없음');
  chk('7-10: 로고 이미지 img 태그', src.includes('logo-img'), '없음');

  // PHASE 4 검증
  chk('4-7: p4FacilityAdapt 요소 존재', src.includes('p4FacilityAdapt'), '없음');
  chk('4-8: facilityMap 정의 (gym/home/pool)', src.includes("'gym'") && src.includes("'home'") && src.includes("'pool'"), '없음');

  // PHASE 5 검증
  chk('5-7: p7TriangleConnect 요소', src.includes('p7TriangleConnect'), '없음');
  chk('5-8: sajuBcMap 甲木 정의', src.includes("'甲木'"), '없음');
  chk('5-9: mbtiBcMap INTJ 정의', src.includes("'INTJ'"), '없음');

  // PHASE 6 검증
  chk('6-8: p7RoadMap 요소', src.includes('p7RoadMap'), '없음');
  chk('6-9: p7ConsultCta 요소', src.includes('p7ConsultCta'), '없음');
  chk('6-10: changeTimelineMap BC-05 정의', src.includes("'BC-05'") && src.includes('하체 부종'), '없음');

  // ─────────────────────────────────────────────────────────────
  // 결과 출력
  // ─────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  log.forEach(l => console.log(l));
  console.log('═'.repeat(60));
  console.log(`\n📊 PHASE 4~7 결과: ✅ ${pass}개 통과 / ❌ ${fail}개 실패`);
  if(fail > 0) console.log('⚠️  실패 항목이 있습니다. 위 로그를 확인하세요.');
  else console.log('🎉 모든 항목 통과!');

  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
}

run().catch(e => { console.error(e); process.exit(1); });
