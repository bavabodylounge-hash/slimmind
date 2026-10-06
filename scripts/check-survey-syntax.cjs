/**
 * ★ survey HTML <script> 블록 구문 검사 v2
 *
 * [검사 전략]
 * 1. vm.Script 파싱 — 모든 블록에 적용 (Node.js가 실제로 파싱)
 *    → 이번 버그(if 블록 } 누락)를 정확히 탐지
 * 2. 중괄호 균형 검사 — vm.Script 실패한 블록에만 추가 적용
 *    (대형 블록에서 문자열 내 { } 때문에 false positive 발생 방지)
 * 3. 괄호 균형 경고 — 주석 내 ( ) 로 인한 false positive가 있어 WARNING만
 */
'use strict';
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');

const TARGETS = [
  'public/survey-hospital.html',
  'public/survey-fitness.html',
  'public/survey-salon.html',
  'public/survey-aesthetic.html',
];

const RED    = '\x1b[31m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const NC     = '\x1b[0m';

let totalFail = 0;

// 스크립트 태그 추출 (src 속성 없는 인라인만)
function extractScripts(html) {
  const re = /<script(?:\s[^>]*)?>[\s\S]*?<\/script>/gi;
  const results = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    const tag = m[0];
    const tagOpen = tag.slice(0, tag.indexOf('>') + 1);
    if (/\bsrc\s*=/.test(tagOpen)) continue; // 외부 src 제외
    const js = tag.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    results.push({ js, idx: results.length, tag: tagOpen.slice(0, 60) });
  }
  return results;
}

// vm.Script으로 구문 파싱 (Node.js V8 엔진 — 브라우저와 동일한 파서)
function checkSyntax(code, label) {
  try {
    new vm.Script(code, { filename: label });
    return null; // OK
  } catch (e) {
    return e.message;
  }
}

// 주석·문자열 제거 후 중괄호 균형 검사
// vm.Script 실패한 블록에서 추가 디버깅 정보 제공용
function checkBraceBalance(code) {
  let depth = 0;
  let i = 0;
  const n = code.length;
  while (i < n) {
    const ch = code[i];
    // 단일행 주석
    if (ch === '/' && code[i + 1] === '/') {
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    // 블록 주석
    if (ch === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < n - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    // 문자열 (백틱 포함)
    if (ch === '"' || ch === "'" || ch === '`') {
      const q = ch;
      i++;
      while (i < n) {
        if (code[i] === '\\') { i += 2; continue; }
        if (code[i] === q)    { i++; break; }
        i++;
      }
      continue;
    }
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  return depth;
}

// staged 파일 목록
const staged = (() => {
  try {
    const { execSync } = require('child_process');
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n').filter(Boolean);
  } catch { return []; }
})();

let anyChecked = false;

for (const rel of TARGETS) {
  const abs = path.resolve(rel);
  if (!fs.existsSync(abs)) continue;
  if (!staged.some(s => s === rel || s === rel.replace(/\\/g, '/'))) continue;

  anyChecked = true;
  const html    = fs.readFileSync(abs, 'utf8');
  const scripts = extractScripts(html);
  let fileFail  = 0;

  for (const { js, idx, tag } of scripts) {
    if (!js.trim()) continue;

    // ── vm.Script 구문 검사 (핵심) ──
    const synErr = checkSyntax(js, `${rel}#script${idx}`);
    if (synErr) {
      console.error(`${RED}✗ SYNTAX ERROR${NC} ${rel} script#${idx} [${tag}]: ${synErr}`);
      // 추가: 중괄호 균형으로 힌트 제공
      const braceBalance = checkBraceBalance(js);
      if (braceBalance !== 0) {
        console.error(`  → 중괄호 잔여=${braceBalance} (0이어야 정상) — if/function 블록 닫는 } 누락 의심`);
      }
      fileFail++;
      totalFail++;
    }
    // vm.Script 통과 시: 중괄호 검사 생략 (대형 블록 false positive 방지)
  }

  if (fileFail === 0) {
    console.log(`${GREEN}✓${NC} ${rel} — ${scripts.length}개 블록 vm.Script 구문 OK`);
  }
}

if (!anyChecked) {
  process.exit(0);
}

if (totalFail > 0) {
  console.error(`\n${RED}[survey-syntax] ✗ ${totalFail}개 오류 — 커밋 차단${NC}`);
  process.exit(1);
} else {
  console.log(`${GREEN}[survey-syntax] ✓ 전체 OK${NC}`);
  process.exit(0);
}
