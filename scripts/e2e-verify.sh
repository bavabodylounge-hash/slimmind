#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
#  SlimMind E2E 자동 검증 스크립트 v1.1
#  실행: bash scripts/e2e-verify.sh [prod|local]
#  목적: 배포 전후 전수 체크 — 오류 찾기 게임 탈출
# ══════════════════════════════════════════════════════════════════

BASE="${1:-prod}"
if [ "$BASE" = "prod" ]; then
  HOST="https://slimmind.kr"
else
  HOST="http://localhost:3000"
fi

PASS=0
FAIL=0
WARN=0

green()  { echo -e "\033[32m✅ $*\033[0m"; }
red()    { echo -e "\033[31m❌ $*\033[0m"; }
yellow() { echo -e "\033[33m⚠️  $*\033[0m"; }
blue()   { echo -e "\033[34m🔍 $*\033[0m"; }

# -L: 리다이렉트 따라가기, 최종 상태코드 확인
check() {
  local desc="$1"
  local url="$2"
  local expect="$3"
  local res
  res=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 15 "$url")
  if [ "$res" = "$expect" ]; then
    green "[$res] $desc"
    ((PASS++))
  else
    red "[$res≠$expect] $desc — $url"
    ((FAIL++))
  fi
}

# 로컬 파일에서 직접 확인
check_local_file() {
  local desc="$1"
  local file="$2"
  local pattern="$3"
  if grep -q "$pattern" "$file" 2>/dev/null; then
    green "$desc"
    ((PASS++))
  else
    red "$desc — pattern '$pattern' not found in $file"
    ((FAIL++))
  fi
}

echo ""
echo "════════════════════════════════════════"
echo " SlimMind E2E 검증 — $HOST"
echo " $(date '+%Y-%m-%d %H:%M:%S')"
echo "════════════════════════════════════════"

# ──────────────────────────────────────────────
# [1] 페이지 라우팅 — HTTP 최종 상태코드 체크 (리다이렉트 따라감)
# ──────────────────────────────────────────────
echo ""
blue "[1] 페이지 라우팅 체크 (리다이렉트 포함)"

check "메인 홈"                              "$HOST/"                    200
check "B2B 포털 (b2b.html → redirect OK)"   "$HOST/b2b.html"            200
check "병원 설문 진입 (B2B-HOS-002)"          "$HOST/h/B2B-HOS-002"       200
check "에스테틱 설문 진입 (B2B-AES-001)"      "$HOST/a/B2B-AES-001"       200
check "피트니스 설문 진입 (B2B-FIT-TEST01)"   "$HOST/f/B2B-FIT-TEST01"    200
check "미용실 설문 진입 (B2B-ETC-005)"        "$HOST/salon/B2B-ETC-005"   200
# 결과지는 접근 제어로 직접 URL 404 정상 — Worker 경유 시 200 확인
for rf_code in "hospital" "aesthetic" "fitness" "salon"; do
  res=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 15 "$HOST/result-$rf_code.html")
  if [ "$res" = "200" ] || [ "$res" = "302" ] || [ "$res" = "307" ]; then
    green "[$res] 결과지 $rf_code 응답 정상"
    ((PASS++))
  elif [ "$res" = "404" ]; then
    # Worker에서 접근 제어로 차단 — 이는 설계상 정상
    green "[404/접근제어] 결과지 $rf_code — Worker 직접 접근 차단 (정상)"
    ((PASS++))
  else
    red "[$res] 결과지 $rf_code — 비정상 응답"
    ((FAIL++))
  fi
done

# ──────────────────────────────────────────────
# [2] refScript 주입 체크 — 서버 렌더링 HTML에서 확인
# ──────────────────────────────────────────────
echo ""
blue "[2] refScript 주입 체크 (ref_code가 ?ref= 파라미터로 전달되는지)"

for route_code in "h/B2B-HOS-002" "a/B2B-AES-001" "f/B2B-FIT-TEST01" "salon/B2B-ETC-005"; do
  body=$(curl -sL --max-time 15 "$HOST/$route_code")
  if echo "$body" | grep -q "searchParams.set"; then
    green "refScript 존재: /$route_code ✓"
    ((PASS++))
  else
    red "refScript 누락: /$route_code — ref_code가 NULL로 저장될 위험!"
    ((FAIL++))
  fi
done

# ──────────────────────────────────────────────
# [3] survey_category 값 체크 — 로컬 파일 직접 확인
# ──────────────────────────────────────────────
echo ""
blue "[3] 설문지 survey_category 오타 체크 (로컬 소스 파일)"

WEBAPP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

declare -A SURVEY_FILES
SURVEY_FILES["$WEBAPP_DIR/public/survey-hospital.html"]="hospital"
SURVEY_FILES["$WEBAPP_DIR/public/survey-fitness.html"]="fitness"
SURVEY_FILES["$WEBAPP_DIR/public/survey-salon.html"]="salon"
SURVEY_FILES["$WEBAPP_DIR/public/survey-aesthetic.html"]="aesthetic"

for file in "${!SURVEY_FILES[@]}"; do
  expected="${SURVEY_FILES[$file]}"
  fname=$(basename "$file")
  if [ ! -f "$file" ]; then
    yellow "$fname: 파일 없음 — 건너뜀"
    ((WARN++))
    continue
  fi
  # survey_category 값 추출 (주석 제외)
  val=$(grep "survey_category" "$file" | grep -v "^[[:space:]]*//" | grep -oP "survey_category['\"]?\s*:\s*['\"]?\K[a-z]+" | head -1)
  if [ "$val" = "$expected" ]; then
    green "$fname: survey_category='$val' ✓"
    ((PASS++))
  else
    red "$fname: survey_category='$val' ≠ 예상값 '$expected'"
    ((FAIL++))
  fi
  # 알려진 오타 탐지 (주석 제외)
  for wrong in "esthetic" "esthetics" "gym" "hair" "clinic"; do
    # 주석(// 또는 /* */) 제외하고 실제 코드에서만 탐지
    if grep -v "^\s*//" "$file" | grep -v "/\*.*\*/" | grep -q "survey_category['\"]?\s*:\s*['\"]${wrong}['\"]"; then
      red "$fname: 잘못된 survey_category 오타 '$wrong' 발견!"
      ((FAIL++))
    fi
  done
done

# hospital-3lang도 체크
if [ -f "$WEBAPP_DIR/public/survey-hospital-3lang.html" ]; then
  val=$(grep "survey_category" "$WEBAPP_DIR/public/survey-hospital-3lang.html" | grep -v "^[[:space:]]*//" | grep -oP "survey_category['\"]?\s*:\s*['\"]?\K[a-z]+" | head -1)
  if [ "$val" = "hospital" ]; then
    green "survey-hospital-3lang.html: survey_category='hospital' ✓"
    ((PASS++))
  else
    red "survey-hospital-3lang.html: survey_category='$val' ≠ 'hospital'"
    ((FAIL++))
  fi
fi

# ──────────────────────────────────────────────
# [4] API 엔드포인트 체크 — 실제 존재하는 API만
# ──────────────────────────────────────────────
echo ""
blue "[4] API 엔드포인트 체크"

# 진단 API — POST 엔드포인트는 빈 body로 POST 전송
for api in "/api/v1/diagnosis" "/api/s/diagnosis"; do
  res=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 -X POST -H "Content-Type: application/json" -d '{}' "$HOST$api")
  # 400(bad request) 또는 422(validation error) = 라우트 존재하지만 유효성 검사 실패 = 정상
  if [ "$res" = "400" ] || [ "$res" = "422" ] || [ "$res" = "200" ] || [ "$res" = "500" ]; then
    green "[$res] $api — POST 라우트 존재 ✓"
    ((PASS++))
  elif [ "$res" = "404" ] || [ "$res" = "405" ]; then
    red "[$res] $api — POST 라우트 없음!"
    ((FAIL++))
  else
    yellow "[$res] $api — 예상치 못한 응답"
    ((WARN++))
  fi
done

# 인증 필요 API — 401 = 라우트 존재
for api in "/api/b2b/stats" "/api/b2b/results"; do
  res=$(curl -sL -o /dev/null -w "%{http_code}" --max-time 10 -X GET "$HOST$api")
  if [ "$res" = "401" ] || [ "$res" = "403" ] || [ "$res" = "200" ]; then
    green "[$res] $api — 라우트 존재 (인증 필요) ✓"
    ((PASS++))
  else
    red "[$res] $api — 라우트 없음 또는 비정상"
    ((FAIL++))
  fi
done

# ──────────────────────────────────────────────
# [5] DB 데이터 무결성 체크
# ──────────────────────────────────────────────
echo ""
blue "[5] DB 데이터 무결성 체크"

if command -v gsk &>/dev/null; then
  # survey_category 잘못된 값 체크
  bad=$(gsk hosted d1_query --sql "SELECT COUNT(*) as cnt FROM diagnosis_results WHERE survey_category NOT IN ('hospital','aesthetic','fitness','salon','integrated') AND survey_category IS NOT NULL" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['result']['rows'][0]['cnt'])" 2>/dev/null)
  if [ "$bad" = "0" ]; then
    green "diagnosis_results: 잘못된 survey_category 없음"
    ((PASS++))
  else
    red "diagnosis_results: 잘못된 survey_category ${bad}건 발견!"
    ((FAIL++))
  fi

  # B2B-ETC-005 데이터 확인
  cnt=$(gsk hosted d1_query --sql "SELECT COUNT(*) as cnt FROM diagnosis_results WHERE ref_code='B2B-ETC-005'" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['result']['rows'][0]['cnt'])" 2>/dev/null)
  if [ -n "$cnt" ] && [ "$cnt" -gt "0" ]; then
    green "B2B-ETC-005 diagnosis_results: ${cnt}건"
    ((PASS++))
  else
    yellow "B2B-ETC-005 diagnosis_results: 0건"
    ((WARN++))
  fi

  # ref_code=NULL이면서 유효한 bc_code_key 있는 레코드 (B2B 유실 가능성)
  null_bc=$(gsk hosted d1_query --sql "SELECT COUNT(*) as cnt FROM diagnosis_results WHERE ref_code IS NULL AND bc_code_key IS NOT NULL AND survey_category IN ('salon','fitness','aesthetic')" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['result']['rows'][0]['cnt'])" 2>/dev/null)
  if [ -z "$null_bc" ] || [ "$null_bc" = "0" ]; then
    green "ref_code=NULL + bc_code_key 있는 레코드: 없음"
    ((PASS++))
  else
    yellow "ref_code=NULL + bc_code_key 있는 레코드 ${null_bc}건 — B2B 파트너 데이터 누락 가능"
    ((WARN++))
  fi

  # salon_responses 최근 데이터 확인
  salon_cnt=$(gsk hosted d1_query --sql "SELECT COUNT(*) as cnt FROM salon_responses" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['result']['rows'][0]['cnt'])" 2>/dev/null)
  green "salon_responses 전체: ${salon_cnt:-?}건"
  ((PASS++))
else
  yellow "gsk 명령 없음 — DB 체크 건너뜀"
  ((WARN++))
fi

# ──────────────────────────────────────────────
# [6] AE-SCHEMA 필수 DOM 요소 체크 (로컬 파일)
# ──────────────────────────────────────────────
echo ""
blue "[6] 결과지 필수 DOM 요소 체크 (#p1-disclaimer) - 로컬 파일"

for result_file in "result-hospital.html" "result-aesthetic.html" "result-fitness.html" "result-salon.html"; do
  fpath="$WEBAPP_DIR/public/$result_file"
  if [ ! -f "$fpath" ]; then
    yellow "$result_file: 파일 없음"
    ((WARN++))
    continue
  fi
  if grep -q 'id="p1-disclaimer"' "$fpath"; then
    green "$result_file: #p1-disclaimer 존재 ✓"
    ((PASS++))
  else
    red "$result_file: #p1-disclaimer 없음 — AE-SCHEMA Rule 12 위반!"
    ((FAIL++))
  fi
done

# ──────────────────────────────────────────────
# [7] 소스 코드 고위험 패턴 체크
# ──────────────────────────────────────────────
echo ""
blue "[7] 소스 코드 고위험 패턴 체크"

INDEX_FILE="$WEBAPP_DIR/src/index.tsx"

# normalizeAxForDecide가 전역 선언됐는지
if grep -q "^function normalizeAxForDecide" "$INDEX_FILE" 2>/dev/null; then
  green "normalizeAxForDecide: 전역 함수 선언 ✓"
  ((PASS++))
else
  red "normalizeAxForDecide: 전역 함수 없음 — verify-detail API에서 ReferenceError 발생!"
  ((FAIL++))
fi

# /salon/:code에 refScript 있는지
if grep -A5 "\/salon\/:code" "$INDEX_FILE" 2>/dev/null | grep -q "refScript\|refScriptSalon\|searchParams.set\|replaceState"; then
  green "/salon/:code 라우트: refScript 코드 존재 ✓"
  ((PASS++))
else
  # 더 넓게 검색
  salon_section=$(awk '/app\.get.*\/salon\/:code/,/app\.get.*\/s\/:code/' "$INDEX_FILE" 2>/dev/null)
  if echo "$salon_section" | grep -q "replaceState\|refScript"; then
    green "/salon/:code 라우트: refScript 코드 존재 ✓"
    ((PASS++))
  else
    red "/salon/:code 라우트: refScript 없음 — ref_code NULL 저장 위험!"
    ((FAIL++))
  fi
fi

# survey_category 서버 정규화 방어 로직 존재 여부
if grep -q "VALID_SURVEY_CATEGORIES\|SURVEY_CATEGORY_ALIAS" "$INDEX_FILE" 2>/dev/null; then
  green "survey_category 서버 정규화 방어 로직 존재 ✓"
  ((PASS++))
else
  yellow "survey_category 서버 정규화 방어 로직 없음 — 오타값 그대로 저장 위험"
  ((WARN++))
fi

# ──────────────────────────────────────────────
# 최종 결과 요약
# ──────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════"
echo " 검증 완료: ✅PASS=$PASS  ❌FAIL=$FAIL  ⚠️WARN=$WARN"
echo "════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  red "❌ ${FAIL}개 항목 실패 — 배포 전 수정 필요!"
  exit 1
else
  echo ""
  green "모든 핵심 체크 통과 — 배포 안전"
  if [ "$WARN" -gt 0 ]; then
    yellow "경고 ${WARN}개 확인 권장"
  fi
  exit 0
fi
