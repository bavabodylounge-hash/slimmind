const { chromium } = require('/usr/local/lib/node_modules/playwright');
const BASE = 'http://localhost:3000';

async function run(){
  const browser = await chromium.launch({ args:['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  let pass=0, fail=0; const log=[];

  function chk(label,cond,actual){
    if(cond){pass++;log.push(`  ✅ ${label}`);}
    else{fail++;log.push(`  ❌ ${label} | ${JSON.stringify(actual).slice(0,80)}`);}
  }

  // 김지연: BC-05(78) + BC-06(64), bfr=28.5
  await page.goto(`${BASE}/result/RES-20260608-A1B2C3`, {waitUntil:'networkidle'});
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(900);

  // ① 복합체형 점수 바 표시
  const scoreBar = await page.$eval('#p1BcScoreBar', el => ({
    visible: el.style.display !== 'none',
    html: el.innerHTML
  })).catch(()=>({visible:false,html:''}));
  chk('복합체형 바 표시됨', scoreBar.visible, scoreBar.visible);
  chk('BC-05 표시', scoreBar.html.includes('BC-05'), scoreBar.html.slice(0,100));
  chk('BC-06 표시', scoreBar.html.includes('BC-06'), scoreBar.html.slice(0,100));
  chk('복합 체형 감지 문구', scoreBar.html.includes('복합'), scoreBar.html.slice(0,150));
  chk('주 체형 뱃지', scoreBar.html.includes('주'), scoreBar.html.slice(0,100));
  chk('점수 숫자(78) 표시', scoreBar.html.includes('78'), scoreBar.html.slice(0,150));

  // ② 인포그래픽 표시
  const infog = await page.$eval('#p1Infographic', el => ({
    visible: el.style.display !== 'none',
    html: el.innerHTML
  })).catch(()=>({visible:false,html:''}));
  chk('인포그래픽 섹션 표시됨', infog.visible, infog.visible);
  chk('BMI 바 포함 (BMI 텍스트)', infog.html.includes('BMI'), infog.html.slice(0,150));
  chk('체지방 도넛 SVG 포함', infog.html.includes('<svg'), infog.html.slice(0,200));
  chk('체지방% 도넛 수치(28.5) 표시', infog.html.includes('28.5'), infog.html.slice(0,300));
  chk('제지방 표시', infog.html.includes('제지방'), infog.html.slice(0,300));
  chk('근육량 게이지 표시', infog.html.includes('근육량'), infog.html.slice(0,300));

  // ③ BMI 값 확인 (58kg/163cm → BMI≈21.8)
  const bmiText = await page.$eval('#p1Infographic', el => el.textContent).catch(()=>'');
  chk('BMI 수치 텍스트 포함', /\d+\.\d/.test(bmiText), bmiText.slice(0,80));

  // ④ 이하은: BC-09만 있음 (단일 체형) → 복합 표시 없어야
  await page.goto(`${BASE}/result/RES-20260605-X9Y8Z7`, {waitUntil:'networkidle'});
  await page.evaluate(() => { if(typeof init==='function') init(); });
  await page.waitForTimeout(800);
  const scoreBar2 = await page.$eval('#p1BcScoreBar', el => el.innerHTML).catch(()=>'');
  chk('단일 체형 - 복합 감지 없음', !scoreBar2.includes('복합 체형 감지:'), scoreBar2.slice(0,150));
  chk('단일 체형 - BC-09 표시', scoreBar2.includes('BC-09'), scoreBar2.slice(0,150));

  console.log('\n'+'═'.repeat(55));
  log.forEach(l=>console.log(l));
  console.log('═'.repeat(55));
  console.log(`\n✅ ${pass}개 통과 / ❌ ${fail}개 실패`);
  await browser.close();
  process.exit(fail>0?1:0);
}
run().catch(e=>{console.error(e);process.exit(1);});
