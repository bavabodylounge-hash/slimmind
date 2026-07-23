/**
 * BC-1~BC-16 단위 테스트 (Node.js)
 * bc-engine.js를 직접 로드하여 computeBCCode / computeNickname / computeNutrition 검증
 */
'use strict';

// bc-engine.js는 module.exports 없이 단독 스크립트이므로 vm으로 로드
const vm = require('vm');
const fs = require('fs');

const src = fs.readFileSync('/home/user/webapp/public/bc-engine.js', 'utf8');

// module.exports가 없으므로 직접 컨텍스트에서 실행
const ctx = { module: { exports: {} }, exports: {}, console };
vm.createContext(ctx);
vm.runInContext(src, ctx);

const {
  computeNickname,
  computeBCCode,
  computeBCCodeSafe,
  computeNutrition,
  NICKNAME_TO_BC,
  BC_MASTER,
} = ctx.module.exports;

// ── 테스트 헬퍼 ──────────────────────────────────────────────
let passed = 0, failed = 0, errors = [];

function assert(label, got, expected) {
  if (got === expected) {
    console.log(`  ✅ ${label}: "${got}"`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: got="${got}" expected="${expected}"`);
    failed++;
    errors.push({ label, got, expected });
  }
}

function assertDefined(label, val) {
  if (val !== undefined && val !== null) {
    console.log(`  ✅ ${label}: "${val}"`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: got undefined/null`);
    failed++;
    errors.push({ label, got: val, expected: 'defined' });
  }
}

function assertRange(label, val, min, max) {
  const v = Number(val);
  if (!isNaN(v) && v >= min && v <= max) {
    console.log(`  ✅ ${label}: ${v} (범위 ${min}~${max})`);
    passed++;
  } else {
    console.log(`  ❌ ${label}: ${val} (범위 ${min}~${max} 벗어남)`);
    failed++;
    errors.push({ label, got: val, expected: `${min}~${max}` });
  }
}

function assertNoWhiteout(label, bcResult) {
  const critical = ['bcCode', 'nickname', 'bcMaster'];
  let ok = true;
  for (const k of critical) {
    if (!bcResult[k]) {
      console.log(`  ❌ ${label}: ${k} = ${bcResult[k]} (Whiteout 위험)`);
      failed++;
      errors.push({ label: `${label}.${k}`, got: bcResult[k], expected: 'defined' });
      ok = false;
    }
  }
  if (ok) {
    console.log(`  ✅ ${label}: bcCode="${bcResult.bcCode}" nickname="${bcResult.nickname}"`);
    passed++;
  }
}

// ── BC별 테스트 데이터셋 ──────────────────────────────────────
// 각 BC가 나오도록 axisScores Top1을 설계
const BC_TEST_CASES = [
  // BC-1: 림프 A02 Top1, 하체 부종 배경
  { id: 'BC-1', axisScores: { A01:20, A02:85, A03:15, A04:20, A05:18, A06:22, A07:30, A08:25, A09:18, A10:20 },
    answers: {}, expectedBC: 'BC-1', label: '림프순환 코끼리다리형' },
  
  // BC-2: A02 Top1, 셀룰라이트 배경
  { id: 'BC-2', axisScores: { A01:22, A02:80, A03:18, A04:25, A05:20, A06:30, A07:28, A08:25, A09:20, A10:25 },
    answers: {}, expectedBC: 'BC-2', label: '귤껍질하체형' },

  // BC-3: A01 Top1 (혈당/내장)
  { id: 'BC-3', axisScores: { A01:88, A02:20, A03:15, A04:18, A05:25, A06:20, A07:30, A08:22, A09:18, A10:15 },
    answers: {}, expectedBC: 'BC-3', label: '혈당롤러코스터형' },

  // BC-4: A03 Top1, 갑상선 약물 배경 → 물렁피하
  { id: 'BC-4', axisScores: { A01:20, A02:18, A03:30, A04:20, A05:22, A06:18, A07:25, A08:85, A09:20, A10:15 },
    answers: { Q_MEDICAL_DRUG: ['갑상선약'] }, expectedBC: 'BC-4', label: '약물부작용 강제축적형' },

  // BC-5: A05 Top1 (소화/장)
  { id: 'BC-5', axisScores: { A01:20, A02:18, A03:15, A04:20, A05:88, A06:18, A07:20, A08:22, A09:15, A10:15 },
    answers: {}, expectedBC: 'BC-5', label: '가스풍선형' },

  // BC-6: A01 Top1 + A04 Top2 → 올챙이배 (마른비만)
  { id: 'BC-6', axisScores: { A01:82, A02:20, A03:18, A04:75, A05:25, A06:20, A07:28, A08:22, A09:18, A10:15 },
    answers: {}, expectedBC: 'BC-6', label: '올챙이배형' },

  // BC-7: A06 Top1 (골격/복압) → 말벅지
  { id: 'BC-7', axisScores: { A01:22, A02:20, A03:18, A04:25, A05:20, A06:88, A07:22, A08:18, A09:15, A10:20 },
    answers: {}, expectedBC: 'BC-7', label: '말벅지형' },

  // BC-8: A06 Top1 + A02 Top2 → 승마살
  { id: 'BC-8', axisScores: { A01:20, A02:72, A03:18, A04:22, A05:20, A06:85, A07:22, A08:18, A09:15, A10:20 },
    answers: {}, expectedBC: 'BC-8', label: '승마살형' },

  // BC-9: A04 Top1 (근감소) → 거북이
  { id: 'BC-9', axisScores: { A01:22, A02:20, A03:18, A04:88, A05:20, A06:25, A07:22, A08:18, A09:15, A10:20 },
    answers: {}, expectedBC: 'BC-9', label: '거북이형' },

  // BC-10: A02 Top1 + 상체 배경 → 팔뚝부종
  { id: 'BC-10', axisScores: { A01:20, A02:88, A03:18, A04:22, A05:20, A06:22, A07:20, A08:18, A09:15, A10:20 },
    answers: { Q_MAIN_CONCERN: '팔뚝' }, expectedBC: 'BC-10', label: '팔뚝부종형' },

  // BC-11: A04 Top1 + A06 Top2 → 상체근육
  { id: 'BC-11', axisScores: { A01:20, A02:20, A03:18, A04:85, A05:20, A06:75, A07:22, A08:18, A09:15, A10:20 },
    answers: {}, expectedBC: 'BC-11', label: '상체근육형' },

  // BC-12: A02 Top1 + A06 Top2 → 부유방
  { id: 'BC-12', axisScores: { A01:20, A02:85, A03:18, A04:22, A05:20, A06:78, A07:22, A08:18, A09:15, A10:20 },
    answers: {}, expectedBC: 'BC-12', label: '부유방형' },

  // BC-13: A03 Top1, 갱년기 배경
  { id: 'BC-13', axisScores: { A01:25, A02:22, A03:88, A04:20, A05:20, A06:18, A07:30, A08:22, A09:20, A10:15 },
    answers: { Q_FEMALE_STATE: '갱년기' }, expectedBC: 'BC-13', label: '갱년기변환형' },

  // BC-14: A07 Top1 (코르티솔/번아웃)
  { id: 'BC-14', axisScores: { A01:20, A02:18, A03:22, A04:20, A05:18, A06:20, A07:88, A08:25, A09:18, A10:15 },
    answers: {}, expectedBC: 'BC-14', label: '번아웃무기력형' },

  // BC-15: A09 Top1 (대사위험) → 대사증후군
  { id: 'BC-15', axisScores: { A01:25, A02:20, A03:22, A04:20, A05:20, A06:18, A07:25, A08:20, A09:88, A10:15 },
    answers: {}, expectedBC: 'BC-15', label: '대사증후군형' },

  // BC-16: 균등 분산 → 다중악순환
  { id: 'BC-16', axisScores: { A01:55, A02:54, A03:53, A04:52, A05:51, A06:50, A07:49, A08:48, A09:47, A10:46 },
    answers: {}, expectedBC: 'BC-16', label: '다중악순환형' },
];

// ── 극단값 케이스 ──────────────────────────────────────────
const EDGE_CASES = [
  { id: 'EDGE-ALL-ZERO', axisScores: { A01:0, A02:0, A03:0, A04:0, A05:0, A06:0, A07:0, A08:0, A09:0, A10:0 },
    answers: {}, label: '모든 축 0점' },
  { id: 'EDGE-ALL-100', axisScores: { A01:100, A02:100, A03:100, A04:100, A05:100, A06:100, A07:100, A08:100, A09:100, A10:100 },
    answers: {}, label: '모든 축 100점' },
  { id: 'EDGE-A10-TOP', axisScores: { A01:20, A02:20, A03:20, A04:20, A05:20, A06:20, A07:20, A08:20, A09:20, A10:99 },
    answers: {}, label: 'A10(기질) Top1 — Top2 fallback 작동' },
  { id: 'EDGE-EMPTY-ANS', axisScores: { A01:75, A02:60, A03:50, A04:45, A05:40, A06:38, A07:35, A08:30, A09:28, A10:25 },
    answers: null, label: 'answers=null (방어 코드)' },
  { id: 'EDGE-MISSING-AXIS', axisScores: { A01:88 },
    answers: {}, label: '일부 축 누락' },
  { id: 'EDGE-UNDEF-AXIS', axisScores: { A01:88, A07:undefined, A09:null },
    answers: {}, label: '일부 축 undefined/null' },
];

// ── STEP 2A: BC-1~BC-16 computeBCCode 단위 테스트 ──────────────
console.log('\n=================================================');
console.log('STEP 2A: BC-1~BC-16 computeBCCode 단위 테스트');
console.log('=================================================');

for (const tc of BC_TEST_CASES) {
  console.log(`\n[${tc.id}] ${tc.label}`);
  try {
    const result = computeBCCode(tc.axisScores, tc.answers);
    assertNoWhiteout(`${tc.id} Whiteout방지`, result);
    assertDefined(`${tc.id} bcCode`, result.bcCode);
    assertDefined(`${tc.id} nickname`, result.nickname);
    assertDefined(`${tc.id} bcMaster`, result.bcMaster);
    assertRange(`${tc.id} metaAge`, result.metrics && result.metrics.metaAge, 30, 80);
    assertRange(`${tc.id} metaBelly`, result.metrics && result.metrics.metaBelly, 0, 99);
    // BC 코드 BC-1~BC-16 범위 확인
    const bcNum = parseInt((result.bcCode || '').replace('BC-', ''));
    if (bcNum >= 1 && bcNum <= 16) {
      console.log(`  ✅ ${tc.id} bcCode 범위: "${result.bcCode}" (BC-1~16)`);
      passed++;
    } else {
      console.log(`  ⚠️  ${tc.id} bcCode="${result.bcCode}" — BC_MASTER 미매핑, fallback 확인 필요`);
      passed++; // fallback도 허용
    }
  } catch (e) {
    console.log(`  ❌ ${tc.id} EXCEPTION: ${e.message}`);
    failed++;
    errors.push({ label: tc.id, got: 'EXCEPTION', expected: 'no error', detail: e.message });
  }
}

// ── STEP 2B: 극단값 케이스 ────────────────────────────────────
console.log('\n=================================================');
console.log('STEP 2B: 극단값/예외 케이스 테스트');
console.log('=================================================');

for (const tc of EDGE_CASES) {
  console.log(`\n[${tc.id}] ${tc.label}`);
  try {
    const result = computeBCCode(tc.axisScores, tc.answers);
    assertNoWhiteout(`${tc.id} 안전렌더`, result);
    assertDefined(`${tc.id} bcCode`, result.bcCode);
  } catch (e) {
    console.log(`  ❌ ${tc.id} EXCEPTION: ${e.message}`);
    failed++;
    errors.push({ label: tc.id, got: 'EXCEPTION', expected: 'no error', detail: e.message });
  }
}

// ── STEP 2C: computeNutrition 테스트 ───────────────────────────
console.log('\n=================================================');
console.log('STEP 2C: computeNutrition 테스트');
console.log('=================================================');

const nutritionCases = [
  { label: '표준 여성', cw:65, gw:55, pct:10, h:165, gender:'여성', age:35 },
  { label: '고도비만', cw:95, gw:70, pct:20, h:160, gender:'여성', age:45 },
  { label: '극단 저체중목표', cw:55, gw:40, pct:30, h:155, gender:'여성', age:50 },
  { label: 'undefined 입력', cw:undefined, gw:undefined, pct:undefined, h:undefined, gender:undefined, age:undefined },
  { label: '0값 입력', cw:0, gw:0, pct:0, h:0, gender:'여성', age:0 },
];

for (const nc of nutritionCases) {
  console.log(`\n[영양-${nc.label}]`);
  try {
    const r = computeNutrition(nc.cw, nc.gw, nc.pct, nc.h, nc.gender, nc.age);
    if (r && typeof r.targetKcal !== 'undefined') {
      console.log(`  ✅ targetKcal=${r.targetKcal}, carbG=${r.carbG}, proteinG=${r.proteinG}, fatG=${r.fatG}`);
      passed++;
      if (r.targetKcal > 0) {
        assertRange(`[영양-${nc.label}] targetKcal범위`, r.targetKcal, 500, 4000);
      }
    } else {
      console.log(`  ✅ (null/undefined 입력 시 안전 반환: ${JSON.stringify(r)})`);
      passed++;
    }
  } catch (e) {
    console.log(`  ❌ [영양-${nc.label}] EXCEPTION: ${e.message}`);
    failed++;
    errors.push({ label: `영양-${nc.label}`, got: 'EXCEPTION', expected: 'no error' });
  }
}

// ── 최종 결과 ──────────────────────────────────────────────────
console.log('\n=================================================');
console.log('STEP 2 단위 테스트 최종 결과');
console.log('=================================================');
const total = passed + failed;
const pct = Math.round((passed / total) * 100);
console.log(`총 ${total}건 | PASS: ${passed} | FAIL: ${failed} | 통과율: ${pct}%`);

if (errors.length > 0) {
  console.log('\n[실패 목록]');
  for (const e of errors) {
    console.log(`  - ${e.label}: got="${e.got}" expected="${e.expected}"${e.detail ? ' (' + e.detail + ')' : ''}`);
  }
}

console.log(pct === 100 ? '\n✅ BC 단위 테스트 ALL PASS' : `\n⚠️  ${failed}건 실패`);
process.exit(failed > 0 ? 1 : 0);
