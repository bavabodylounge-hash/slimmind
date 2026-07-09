#!/bin/bash
# ══════════════════════════════════════════════════════════════
# watch-build.sh — public/ 파일 변경 감지 → 자동 빌드+서버 재시작
# 
# 대상 파일:
#   public/result-v4.html  → 모든 /result/:id 결과지 자동 반영
#   public/index.html      → 설문지 자동 반영
#   public/admin.html      → 마스터 관리자 페이지
#   public/consultant.html → 컨설턴트 페이지
#   public/b2b.html        → B2B 파트너 페이지
#   src/index.tsx          → 백엔드 라우터
#
# 사용법:
#   bash scripts/watch-build.sh          # 포그라운드 실행
#   pm2 start scripts/watch-build.sh --name watch-build  # 백그라운드
# ══════════════════════════════════════════════════════════════

WEBAPP_DIR="/home/user/webapp"
LOG_FILE="$WEBAPP_DIR/logs/watch-build.log"
mkdir -p "$WEBAPP_DIR/logs"

echo "[watch-build] 시작 — 파일 변경 감시 중..." | tee -a "$LOG_FILE"
echo "[watch-build] 감시 대상: public/*.html, src/index.tsx" | tee -a "$LOG_FILE"

# 마지막 빌드 시각 추적 (연속 중복 빌드 방지)
LAST_BUILD=0

do_build() {
  local NOW=$(date +%s)
  # 3초 내 중복 이벤트 무시
  if [ $((NOW - LAST_BUILD)) -lt 3 ]; then
    return
  fi
  LAST_BUILD=$NOW

  echo "" | tee -a "$LOG_FILE"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "$LOG_FILE"
  echo "[$(date '+%H:%M:%S')] 파일 변경 감지 → 빌드 시작..." | tee -a "$LOG_FILE"

  cd "$WEBAPP_DIR"
  if npm run build >> "$LOG_FILE" 2>&1; then
    echo "[$(date '+%H:%M:%S')] ✅ 빌드 성공 → 서버 재시작" | tee -a "$LOG_FILE"
    pm2 restart slimmind >> "$LOG_FILE" 2>&1
    echo "[$(date '+%H:%M:%S')] ✅ 서버 재시작 완료 — 모든 결과지/설문지 업데이트됨" | tee -a "$LOG_FILE"
  else
    echo "[$(date '+%H:%M:%S')] ❌ 빌드 실패 — 로그 확인: $LOG_FILE" | tee -a "$LOG_FILE"
  fi
}

# inotifywait로 파일 변경 감시
# (없으면 폴링 방식으로 fallback)
if command -v inotifywait &>/dev/null; then
  echo "[watch-build] inotifywait 사용 (실시간 감지)" | tee -a "$LOG_FILE"
  inotifywait -m -r -e close_write,moved_to \
    --include '\.(html|tsx|ts|js|css)$' \
    "$WEBAPP_DIR/public/" \
    "$WEBAPP_DIR/src/" \
    2>/dev/null | while read -r dir events file; do
      echo "[watch-build] 변경: $file ($events)" | tee -a "$LOG_FILE"
      do_build
    done
else
  # 폴링 방식 (2초 간격)
  echo "[watch-build] 폴링 방식 사용 (2초 간격)" | tee -a "$LOG_FILE"
  declare -A FILE_TIMES

  # 감시할 파일 목록
  WATCH_FILES=(
    "$WEBAPP_DIR/public/result-v4.html"
    "$WEBAPP_DIR/public/index.html"
    "$WEBAPP_DIR/public/admin.html"
    "$WEBAPP_DIR/public/consultant.html"
    "$WEBAPP_DIR/public/b2b.html"
    "$WEBAPP_DIR/public/survey-data.js"
    "$WEBAPP_DIR/public/bc-engine.js"
    "$WEBAPP_DIR/src/index.tsx"
  )

  # 초기 타임스탬프 저장
  for f in "${WATCH_FILES[@]}"; do
    if [ -f "$f" ]; then
      FILE_TIMES["$f"]=$(stat -c %Y "$f" 2>/dev/null || echo 0)
    fi
  done

  while true; do
    CHANGED=false
    for f in "${WATCH_FILES[@]}"; do
      if [ -f "$f" ]; then
        CURRENT=$(stat -c %Y "$f" 2>/dev/null || echo 0)
        PREV="${FILE_TIMES[$f]:-0}"
        if [ "$CURRENT" != "$PREV" ]; then
          FILE_TIMES["$f"]=$CURRENT
          echo "[watch-build] 변경 감지: $(basename $f)" | tee -a "$LOG_FILE"
          CHANGED=true
        fi
      fi
    done
    if [ "$CHANGED" = true ]; then
      do_build
    fi
    sleep 2
  done
fi
