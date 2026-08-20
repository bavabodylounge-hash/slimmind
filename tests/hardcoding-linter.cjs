#!/usr/bin/env node
/**
 * Task 9: 정적 하드코딩 자동 검출 CI/Linter
 * 
 * 실행: node tests/hardcoding-linter.js
 */
'use strict';
const fs = require('fs');
const path = require('path');

const TARGET = path.join(__dirname, '../public/result-hospital.html');

const PATTERNS = [
  { id: 'HC-01', regex: /함께한 지 3일째(?!<\/span>)/, desc: 'N일째 하드코딩 — id=together-days-span 없이 노출' },
  // HC-02: id="w12-golden-time-div" 없이 골든타임 문구가 노출되는 경우만 검출
  // (id 포함된 원본 div 또는 GOLDEN_TIME_MAP 내부는 정상)
  { id: 'HC-02', regex: /골든타임 — 운동은 저녁 식후 90분[^'"]/, desc: 'A08 골든타임 하드코딩 — w12-golden-time-div 없이 노출 여부 확인 필요' },
  { id: 'HC-03', regex: /SUBTYPE_NARR\s*=\s*\{\s*\}/, desc: 'SUBTYPE_NARR 빈 사전' },
  { id: 'HC-04', regex: /exOptions:\s*\[\s*\]/, desc: 'exOptions 빈 배열' },
  { id: 'HC-05', regex: /exercise_response.*undefined/, desc: 'exercise_response undefined 접근' },
];

const html = fs.readFileSync(TARGET, 'utf8');
const lines = html.split('\n');
let found = 0;

PATTERNS.forEach(({ id, regex, desc }) => {
  lines.forEach((line, i) => {
    if (regex.test(line)) {
      console.error(`[${id}] L${i+1}: ${desc}`);
      found++;
    }
  });
});

// 긍정 검증
const checks = [
  { id: 'CHK-01', pattern: /id="together-days-span"/, desc: 'together-days-span id 존재' },
  { id: 'CHK-02', pattern: /id="w12-golden-time-div"/, desc: 'w12-golden-time-div id 존재' },
  { id: 'CHK-03', pattern: /EXERCISE_RESPONSE_OPTIONS/, desc: 'EXERCISE_RESPONSE_OPTIONS 사전 존재' },
  { id: 'CHK-04', pattern: /GOLDEN_TIME_MAP/, desc: 'GOLDEN_TIME_MAP 존재' },
  { id: 'CHK-05', pattern: /_p3AnswersSrc/, desc: 'P3 단일 소스 선언 존재' },
  { id: 'CHK-06', pattern: /no:17.*운동반응|17:.*일시반응/, desc: 'S2_TEXT_MAP no:17 존재' },
  { id: 'CHK-07', pattern: /no:18.*통증부위|18:.*목·어깨/, desc: 'S2_TEXT_MAP no:18 존재' },
];

let pass = 0;
checks.forEach(({ id, pattern, desc }) => {
  if (pattern.test(html)) { console.log(`✅ [${id}] ${desc}`); pass++; }
  else { console.error(`❌ [${id}] ${desc} — 미발견`); found++; }
});

console.log(`\n결과: 오류 ${found}건 / 검증 통과 ${pass}/${checks.length}`);
process.exit(found > 0 ? 1 : 0);
