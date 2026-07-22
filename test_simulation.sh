#!/bin/bash
# ================================================================
# 슬림마인드 테스트 시뮬레이션 3명 데이터 주입 스크립트
# B2B: 바바성형외과 (B2B-BAVA1234)
# 통합 질문지 3명
# ================================================================

BASE_URL="https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com"
REF="B2B-BAVA1234"

echo "========================================"
echo "슬림마인드 테스트 시뮬레이션 시작"
echo "B2B 코드: $REF"
echo "========================================"

# ────────────────────────────────────────────
# 케이스 1: 김지현 (45세, 갱년기 요요형, 고강도 선호, 계획형)
# BC 특성: 호르몬 혼합형, 냉증 심함, 복부 집중
# ────────────────────────────────────────────
echo ""
echo "[1/3] 김지현님 데이터 주입 중..."
RESULT1=$(curl -s -X POST "$BASE_URL/api/h/diagnosis" \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "김지현",
    "phone": "010-1111-0001",
    "bc_code_key": "BC-3",
    "bc_primary": "복부인슐린 내장지방형",
    "bc_nickname": "복부인슐린 내장지방형",
    "ohaeng_type": "토",
    "mbti_full": "ISFJ",
    "axis_scores": {"A01":85,"A02":40,"A03":72,"A04":35,"A05":55,"A06":30,"A07":68,"A08":45,"A09":60,"A10":28},
    "goal_weight": 57,
    "weight_loss_pct": 12,
    "ref_code": "B2B-BAVA1234",
    "raw_answers": {
      "userInfo": {"name":"김지현","gender":"여성"},
      "pfProfile": {"saju":"토","mbti":"ISFJ","blood":"A","birthY":1980},
      "stage1": {"1":0,"2":2,"10":1,"11":0},
      "stage2": {
        "1":[0],"2":0,"3":[0],"4":[],"5":0,
        "6":[],"7":1,"8":[0,5],"9":[],"10":{"pattern":"yoyo","amp":12,"cyc":4,"net":8},
        "11":0,"12":0,"13":2,"14":1,"15":"input","16":{"sz":28,"tg":26,"fit":0}
      },
      "stage3": {
        "0":2,"1":2,"2":2,"3":2,"4":1,"5":1,"6":1,
        "7":2,"8":2,"9":2,"10":2,"11":2,
        "12":1,"13":1,"14":2,"15":1,
        "16":0,"17":0,"18":1,"19":0,"20":1,
        "21":0,"22":0,"23":0,
        "24":2,"25":2,"26":2,"27":2,
        "28":1,"29":1,"30":0,"31":1,
        "32":1,"33":1,"34":0,
        "35":0,"36":0
      },
      "desire": {
        "moodIdx":0,"moodLabel":"건강하고 활기차게","who":"이효리","partIdx":[0],"partLabels":["뱃살"],"track":"obesity","zone":"belly"
      },
      "redFlags": ["YOYO"],
      "confidence": {"unknownCount":2,"total3":37}
    },
    "completed_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')
ID1=$(echo $RESULT1 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERROR:'+str(d)))" 2>/dev/null)
echo "→ 결과 ID: $ID1"
echo "→ 결과지: $BASE_URL/result-hospital/$ID1"

# ────────────────────────────────────────────
# 케이스 2: 이수진 (32세, 번아웃 스트레스형, 차분한 운동, 즉흥형)
# BC 특성: 코르티솔 과잉, 냉증 없음, 전체 라인 관심
# ────────────────────────────────────────────
echo ""
echo "[2/3] 이수진님 데이터 주입 중..."
RESULT2=$(curl -s -X POST "$BASE_URL/api/h/diagnosis" \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "이수진",
    "phone": "010-1111-0002",
    "bc_code_key": "BC-7",
    "bc_primary": "코르티솔 내장지방형",
    "bc_nickname": "코르티솔 내장지방형",
    "ohaeng_type": "화",
    "mbti_full": "ENFP",
    "axis_scores": {"A01":45,"A02":55,"A03":50,"A04":40,"A05":60,"A06":35,"A07":90,"A08":78,"A09":42,"A10":55},
    "goal_weight": 52,
    "weight_loss_pct": 8,
    "ref_code": "B2B-BAVA1234",
    "raw_answers": {
      "userInfo": {"name":"이수진","gender":"여성"},
      "pfProfile": {"saju":"화","mbti":"ENFP","blood":"O","birthY":1993},
      "stage1": {"1":4,"2":2,"10":1,"11":4},
      "stage2": {
        "1":[],"2":3,"3":[],"4":[],"5":2,
        "6":[],"7":2,"8":[0,1],"9":[],"10":{"pattern":"creep","amp":5,"cyc":0,"net":8},
        "11":2,"12":4,"13":2,"14":0,"15":"input","16":{"sz":26,"tg":24,"fit":1}
      },
      "stage3": {
        "0":0,"1":0,"2":1,"3":0,"4":0,"5":0,"6":0,
        "7":0,"8":0,"9":0,"10":0,"11":0,
        "12":0,"13":0,"14":0,"15":0,
        "16":1,"17":1,"18":1,"19":1,"20":1,
        "21":1,"22":1,"23":1,
        "24":2,"25":2,"26":2,"27":2,
        "28":2,"29":2,"30":2,"31":2,
        "32":0,"33":0,"34":0,
        "35":1,"36":1
      },
      "desire": {
        "moodIdx":2,"moodLabel":"날씬하고 예쁘게","who":"박보영","partIdx":[4],"partLabels":["전체라인"],"track":"obesity","zone":"belly"
      },
      "redFlags": [],
      "confidence": {"unknownCount":1,"total3":37}
    },
    "completed_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')
ID2=$(echo $RESULT2 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERROR:'+str(d)))" 2>/dev/null)
echo "→ 결과 ID: $ID2"
echo "→ 결과지: $BASE_URL/result-hospital/$ID2"

# ────────────────────────────────────────────
# 케이스 3: 박민서 (38세, 하체비만 림프순환형, 냉증 경미, 하체 집중)
# BC 특성: 림프·순환 저하, 출산 후 체형 변화, 즉흥+차분
# ────────────────────────────────────────────
echo ""
echo "[3/3] 박민서님 데이터 주입 중..."
RESULT3=$(curl -s -X POST "$BASE_URL/api/h/diagnosis" \
  -H "Content-Type: application/json" \
  -d '{
    "user_name": "박민서",
    "phone": "010-1111-0003",
    "bc_code_key": "BC-1",
    "bc_primary": "오후만되면 코끼리다리형",
    "bc_nickname": "오후만되면 코끼리다리형",
    "ohaeng_type": "수",
    "mbti_full": "INFP",
    "axis_scores": {"A01":35,"A02":88,"A03":45,"A04":50,"A05":42,"A06":62,"A07":38,"A08":55,"A09":30,"A10":48},
    "goal_weight": 58,
    "weight_loss_pct": 10,
    "ref_code": "B2B-BAVA1234",
    "raw_answers": {
      "userInfo": {"name":"박민서","gender":"여성"},
      "pfProfile": {"saju":"수","mbti":"INFP","blood":"B","birthY":1987},
      "stage1": {"1":1,"2":0,"10":2,"11":1},
      "stage2": {
        "1":[1],"2":1,"3":[],"4":[],"5":1,
        "6":[],"7":2,"8":[5],"9":[],"10":{"pattern":"jump","amp":8,"cyc":1,"net":8},
        "11":0,"12":3,"13":2,"14":1,"15":"input","16":{"sz":30,"tg":27,"fit":0}
      },
      "stage3": {
        "0":1,"1":1,"2":1,"3":1,"4":2,"5":2,"6":2,
        "7":1,"8":1,"9":1,"10":1,"11":1,
        "12":1,"13":1,"14":1,"15":1,
        "16":1,"17":1,"18":0,"19":1,"20":0,
        "21":2,"22":2,"23":2,
        "24":0,"25":0,"26":1,"27":1,
        "28":1,"29":1,"30":1,"31":0,
        "32":0,"33":1,"34":1,
        "35":1,"36":1
      },
      "desire": {
        "moodIdx":1,"moodLabel":"자신있고 당당하게","who":"전지현","partIdx":[1],"partLabels":["하체"],"track":"obesity","zone":"belly"
      },
      "redFlags": [],
      "confidence": {"unknownCount":3,"total3":37}
    },
    "completed_at": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
  }')
ID3=$(echo $RESULT3 | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id','ERROR:'+str(d)))" 2>/dev/null)
echo "→ 결과 ID: $ID3"
echo "→ 결과지: $BASE_URL/result-hospital/$ID3"

echo ""
echo "========================================"
echo "✅ 3명 테스트 데이터 주입 완료"
echo ""
echo "결과지 확인 URL:"
echo "  1. 김지현: $BASE_URL/result-hospital/$ID1"
echo "  2. 이수진: $BASE_URL/result-hospital/$ID2"
echo "  3. 박민서: $BASE_URL/result-hospital/$ID3"
echo ""
echo "마스터페이지 로그인: $BASE_URL/admin.html"
echo "  코드: MASTER / 비밀번호: admin1234"
echo "========================================"

# 결과 저장
cat > /home/user/webapp/TEST_SIMULATION_RESULTS.txt << EOF
B2B 테스트 시뮬레이션 결과
생성일시: $(date '+%Y-%m-%d %H:%M:%S')
B2B 코드: B2B-BAVA1234 (바바성형외과)
기본 URL: $BASE_URL

=== 통합 질문지 → 병원용 결과지 3명 ===

[1] 김지현 (45세, 토 기질, ISFJ)
 - BC: BC-3 복부인슐린 내장지방형
 - 특성: 요요 이력, 갱년기, 냉증 심함, 고강도+계획형
 - 결과지: $BASE_URL/result-hospital/$ID1
 - ID: $ID1

[2] 이수진 (32세, 화 기질, ENFP)
 - BC: BC-7 코르티솔 내장지방형
 - 특성: 번아웃 스트레스, 음주, 냉증 없음, 차분+즉흥형
 - 결과지: $BASE_URL/result-hospital/$ID2
 - ID: $ID2

[3] 박민서 (38세, 수 기질, INFP)
 - BC: BC-1 오후만되면 코끼리다리형
 - 특성: 출산 후 하체비만, 냉증 경미, 차분+즉흥형
 - 결과지: $BASE_URL/result-hospital/$ID3
 - ID: $ID3

마스터페이지: $BASE_URL/admin.html (MASTER/admin1234)
EOF
echo "→ 결과 파일 저장: /home/user/webapp/TEST_SIMULATION_RESULTS.txt"
