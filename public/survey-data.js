// SlimMind 설문 데이터 v4.0 — axisEffect 직접 채점 방식 전환
// BC코드 완전 제거 (BC-01~BC-10 → A01~A10 원인축 직접 채점)
// Q00(기대값) 추가 / Q36·Q37·Q41·Q44·Q67·Q68·Q70·Q71 삭제 / Q_WAIST 추가
// calculateAxisScores() 신규 / TYPE_NAME_TABLE 16개 유형명 / generateTypeName() fallback
// Q2/Q3/Q8/Q14/Q23/Q34/Q37/Q38/Q42/Q45/Q58/Q62/Q63 수정
// 실시간 피드백 후킹 메시지 포함

const SECTIONS = [
  { id: 'A', name: '몸의 기억', color: '#1A5276', bg: '#F8FBFF',
    hook: '지금부터 나오는 질문들이 당신의 지방 패턴을 결정하는 첫 번째 열쇠입니다.',
    transition: '몸의 역사를 읽었습니다. 이제 지방이 보내는 신호를 들어볼게요.' },
  { id: 'B', name: '지방의 언어', color: '#CA6F1E', bg: '#FFFBF5',
    hook: '다음 6개 질문은 직접 몸을 만지면서 답해야 합니다. 지금 자리에 편하게 앉아주세요.',
    transition: '지방이 보내는 신호를 포착했습니다. 이제 숫자로 더 정밀하게 들어가 볼게요.' },
  { id: 'C', name: '숫자의 비밀', color: '#0E6655', bg: '#F0FDF8',
    hook: '이 섹션에서 입력하는 숫자들이 당신만의 체성분 지도를 완성합니다.',
    transition: '출발점의 좌표를 잡았습니다. 이제 내 몸의 시간 감각을 확인할게요.' },
  { id: 'D', name: '내 몸의 시계', color: '#6C3483', bg: '#FAF5FF',
    hook: '수면·스트레스·습관. 이 세 가지가 지방보다 다이어트 결과에 더 큰 영향을 미칩니다.',
    transition: '생활 리듬을 읽었습니다. 이제 동양 의학이 남긴 신호를 찾아볼게요.' },
  { id: 'E', name: '오행의 신호', color: '#880E4F', bg: '#FFF0F5',
    hook: '한의학 5000년이 발견한 체질 분류. 맛·계절·피부·체온이 모두 연결됩니다.',
    transition: '타고난 체질 신호를 읽었습니다. 이제 행동 패턴을 볼게요.' },
  { id: 'F', name: '행동의 패턴', color: '#1D6A39', bg: '#F0FFF4',
    hook: '같은 식단도 사람마다 결과가 다른 이유, 바로 이 섹션에서 밝혀집니다.',
    transition: '{name}님을 거의 다 알아가고 있어요. 마지막 퍼즐 조각들이 남았습니다.' },
  { id: 'G', name: 'DNA의 언어', color: '#283593', bg: '#EEF2FF',
    hook: '타고난 정보들이 맞춰지는 섹션입니다. MBTI·혈액형·사주를 모두 활용합니다.',
    transition: 'DNA 패턴을 읽었습니다. 이제 심리 패턴을 살펴볼게요.' },
  { id: 'H', name: '마지막 질문', color: '#922B21', bg: '#FFF5F5',
    hook: '분석의 마지막 조각들입니다. 조금만 더 집중해주세요.',
    transition: '거의 다 왔어요! 이제 행동 패턴과 몸의 감각을 탐색할 차례입니다.' },
  { id: 'I', name: '마음의 패턴', color: '#5D4037', bg: '#FFF8F0',
    hook: '다이어트의 70%는 심리전입니다. 내 패턴을 아는 것이 이기는 방법입니다.',
    transition: '마음의 패턴을 읽었습니다. 이제 몸이 보내는 신호를 들어볼게요.' },
  { id: 'J', name: '몸의 신호', color: '#2E7D32', bg: '#F1FFF3',
    hook: '몸은 항상 신호를 보냅니다. 그 신호를 읽을 줄 아는 사람이 결국 성공합니다.',
    transition: '몸의 신호를 다 읽었어요! 마지막으로 움직임 습관을 확인할게요.' },
  { id: 'K', name: '움직임의 습관', color: '#00695C', bg: '#F0FFFE',
    hook: '걸음걸이·앉는 자세·폰 보는 방식. 이것들이 체형을 매일 조금씩 바꿉니다.',
    transition: '움직임 패턴까지 파악했어요. 마지막으로 내 몸의 안전 조건을 확인할게요.' },
  { id: 'L', name: '내 몸의 안전 조건', color: '#AD1457', bg: '#FFF0F8',
    hook: '이 섹션은 당신의 결과지를 더 안전하고 정확하게 만들기 위한 마지막 퍼즐입니다.',
    transition: '' }
];

// 실시간 피드백 메시지 (답변 선택 시 표시되는 공감 문구)
const FEEDBACK_MESSAGES = {
  // 지방 패턴 감지
  hard_fat:    { msg: '💡 이 느낌, 단순 비만이 아닐 수 있어요. 내장지방 패턴이 감지되고 있습니다.', gauge: 'visceral' },
  soft_fat:    { msg: '💧 피하지방 우세 패턴이에요. 운동보다 순환이 먼저입니다.', gauge: 'subcutaneous' },
  cold_body:   { msg: '🧊 차가운 몸. 이게 살이 안 빠지는 진짜 이유일 수 있어요.', gauge: 'circulation' },
  stress_high: { msg: '⚡ 코르티솔이 복부에 지방을 쌓고 있을 가능성이 높습니다.', gauge: 'cortisol' },
  sleep_late:  { msg: '🌙 수면 빚이 쌓이면 지방 분해 호르몬이 멈춥니다.', gauge: 'hormone' },
  yoyo:        { msg: '🔄 요요 패턴이 감지됩니다. 대사 회로 재설계가 필요한 몸이에요.', gauge: 'metabolism' },
  no_effect:   { msg: '🧠 열심히 했는데 안 빠졌다면, 방법의 문제가 아니라 체형 코드의 문제입니다.', gauge: 'type_mismatch' },
  belly_fat:   { msg: '🫃 복부 집중 패턴이에요. 식단보다 코어 회로 복구가 우선입니다.', gauge: 'core' },
  puffy:       { msg: '💧 부종과 지방은 다릅니다. 지금 감지되는 건 림프 정체 신호예요.', gauge: 'lymph' },
  hormone:     { msg: '🌸 호르몬 사이클이 다이어트 결과를 좌우하고 있을 수 있습니다.', gauge: 'hormone' },

  // 알레르기·피부 반응
  allergy_detected: { msg: '⚠️ 해당 식품이 결과지 식단 가이드에서 자동 제외됩니다.', gauge: null },
  skin_acne:        { msg: '🔴 여드름 패턴 — 인슐린·안드로겐 과잉 신호입니다.', gauge: 'visceral' },
  skin_puffy:       { msg: '💧 얼굴 부종 — 림프 순환 정체 패턴이에요.', gauge: 'circulation' },
  skin_rash:        { msg: '🔥 피부 발진 반응 — 음식 과민 가능성, 전문 검사를 권장드려요.', gauge: null },
  skin_reaction:    { msg: '🧴 피부 신호가 내 몸 상태를 말해줍니다.', gauge: null },

  // 갱년기
  menopause_detected: { msg: '🌸 갱년기 모드 활성화 — 일반 공식 대신 맞춤 프로토콜이 적용됩니다.', gauge: 'hormone' },
  menopause_peri:     { msg: '🌸 갱년기 전기 — 지금이 개입 골든타임입니다.', gauge: 'hormone' },
  menopause_meno:     { msg: '🍂 갱년기 중기 — 극저칼로리 대신 소식다회 + 근력 우선 전략이 필요합니다.', gauge: 'hormone' },
  menopause_post:     { msg: '❄️ 폐경 완료 — 대사 시스템 전면 재설계가 필요한 시기입니다.', gauge: 'metabolism' },
  menopause_hrt:      { msg: '💊 HRT 중 — 의료진과 협의된 식이·운동 계획이 결과지에 반영됩니다.', gauge: 'hormone' },

  // 병적요소
  medical_detected:    { msg: '🩺 건강 상태가 결과지 주의사항에 자동 반영됩니다.', gauge: null },
  medical_diabetes:    { msg: '🩸 혈당 조절 최우선 — 저GI·단백질 분산 섭취 전략이 적용됩니다.', gauge: 'visceral' },
  medical_hypertension:{ msg: '💓 고혈압 — 나트륨 제한·마그네슘 보충 전략이 추가됩니다.', gauge: 'visceral' },
  medical_hypothyroid: { msg: '🦋 갑상선 저하 — 기초대사량 저하 반영, 강도 조절이 중요합니다.', gauge: 'metabolism' },
  medical_disc:        { msg: '🦴 디스크 보유 — 충격 없는 운동 + 코어 안정화 전략으로 바뀝니다.', gauge: null },
  medical_cancer:      { msg: '🎗️ 암 완치 후 — 면역 보호 식단 + 점진적 운동 복귀 전략이 적용됩니다.', gauge: 'metabolism' },
  medical_rheumatoid:  { msg: '🔥 만성 염증 — 항염 식품 우선, 고강도 운동 제한이 적용됩니다.', gauge: 'circulation' },
  medical_pcos:        { msg: '🌸 PCOS — 인슐린 저항성 집중 관리 전략이 적용됩니다.', gauge: 'hormone' },
  medical_fattyliver:  { msg: '🫀 지방간 — 내장지방 우선 감소 전략 + 알코올 완전 제한이 적용됩니다.', gauge: 'visceral' },
  medical_steroid:     { msg: '💊 약물 부작용 고려 — 의료진 협진 하에 안전한 식단 설계가 필요합니다.', gauge: 'metabolism' },
};


// ══════════════════════════════════════════════════════
//  10축 메타데이터 (Plan A 통합 — axis/weight/role 시스템)
// ══════════════════════════════════════════════════════
const AXIS_META = {
  A01: { name: '지방 저장',      icon: '🔥', bg: '#FFE3D3', color: '#E8631A',
         hook: '당신의 몸이 들려주는 이야기를 듣는 시간입니다.' },
  A02: { name: '순환·붓기',      icon: '💧', bg: '#E3F1FB', color: '#1A7FC1',
         hook: '붓기인지 살인지, 여기서 갈립니다.' },
  A03: { name: '호르몬·대사',    icon: '🌸', bg: '#FCE4EE', color: '#C0397A',
         hook: '당신이 진 게 아닙니다. 몸이 다른 명령을 받고 있었을 뿐입니다.' },
  A04: { name: '근육·활동',      icon: '💪', bg: '#E8F3DC', color: '#4A8C1C',
         hook: '같은 음식을 먹어도 결과가 다른 이유는 근육에 있습니다.' },
  A05: { name: '소화·흡수·염증', icon: '🌿', bg: '#DEF3EA', color: '#1A8C5B',
         hook: '당신의 몸은 영양을 흡수하고 있을까요, 버티고 있을까요?' },
  A06: { name: '체형 정렬',      icon: '🦴', bg: '#EEEAF7', color: '#6B4EAA',
         hook: '하루 1시간 운동보다 23시간의 자세가 몸을 만듭니다.' },
  A07: { name: '스트레스·회복',  icon: '🌙', bg: '#E8EAF6', color: '#3F51B5',
         hook: '몸은 스트레스를 기억하고, 식욕으로 반응합니다.' },
  A08: { name: '심리·식이 행동', icon: '🧠', bg: '#EDE7F6', color: '#7B1FA2',
         hook: '다이어트의 70%는 심리전입니다.' },
  A09: { name: '성인병 리스크',  icon: '🩺', bg: '#FCE4E0', color: '#C0392B',
         hook: '당신의 건강 위험도를 더 정확하게 읽기 위한 과정입니다.' },
  A10: { name: '기질·해석',      icon: '🔮', bg: '#FFF0DA', color: '#E67E22',
         hook: '의지가 아니라 성향의 문제일 수 있습니다.' }
};

const QUESTIONS = [
  // ══════════════════════════════════════════════════════
  //  Q00 · 기대값 설정 (점수 미포함 — 완주율 향상용)
  // ══════════════════════════════════════════════════════
  {
    id: 'Q00', section: 'A', num: 0,
    axis: null, role: 'gate', weight: 0,
    question: '{name}님, 이 분석을 통해 가장 얻고 싶은 것은 무엇인가요?',
    hint: '솔직하게 선택해주세요. 이 답변이 결과지의 첫 문장 방향을 결정합니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🔍', label: '내 몸이 왜 안 빠지는지 이유를 알고 싶어요',
        desc: '원인 파악이 우선이에요', value: 'why', axisEffect: {} },
      { emoji: '📋', label: '나에게 맞는 구체적인 방법을 알고 싶어요',
        desc: '지금 당장 실천 가능한 플랜', value: 'plan', axisEffect: {} },
      { emoji: '🏥', label: '건강 문제가 체중과 연결된 건지 확인하고 싶어요',
        desc: '건강이 걱정돼요', value: 'health', axisEffect: {} },
      { emoji: '💪', label: '마지막으로 한 번 제대로 해보고 싶어요',
        desc: '이번엔 진짜로', value: 'final', axisEffect: {} },
    ],
    saveAs: 'expectation'
  },
  // ══════════════════════════════════════════════════════
  //  섹션 A · 몸의 기억
  // ══════════════════════════════════════════════════════
  {
    id: 'Q01', section: 'A', num: 1,
    axis: 'A10', weight: 0, role: 'signal',
    question: '이 결과지에는 당신의 이름이 담깁니다. 어떻게 불리고 싶으신가요?',
    hint: '정식 이름이 아니어도 됩니다. 결과지 첫 줄에 이 이름이 그대로 적힙니다.',
    type: 'TEXT_INPUT',
    placeholder: '예: 지연, 혜진, 민수...',
    maxLength: 10,
    axisEffect: []
  },
  {
    id: 'Q02', section: 'A', num: 2,
    axis: 'A10', weight: 2.0, role: 'gate',
    question: '{name}님의 성별을 알려주세요.',
    hint: '체지방률 계산 공식과 호르몬 처방 방향이 완전히 달라집니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🌸', label: '여성', desc: '', value: 'female', axisEffect: { A02: 25, A04: 10 } },
      { emoji: '⚡', label: '남성', desc: '', value: 'male', axisEffect: { A01: 25 } },
      { emoji: '🌀', label: '기타', desc: '', value: 'other', axisEffect: {} }
    ]
  },
  {
    id: 'Q03', section: 'A', num: 3,
    axis: 'A01', weight: 2.5, role: 'wow',
    question: '거울 앞에 서서 딱 3초. 가장 먼저 눈이 가는 곳 두 군데를 골라주세요.',
    hint: '본능적으로 "여기 좀 빠졌으면..." 하는 그 부위들. 이 답변이 바디코드 방향의 70%를 결정합니다.',
    type: 'MULTI_SELECT',
    maxSelect: 2,
    weight: 2.5,
    options: [
      { emoji: '🫃', label: '윗배·복부', desc: '만지면 딱딱하거나 볼록함', value: 'upper_belly', axisEffect: { A01: 45 } },
      { emoji: '🔻', label: '아랫배·하복부', desc: '물렁하게 늘어진 느낌', value: 'lower_belly', axisEffect: { A02: 20, A04: 15 } },
      { emoji: '🍑', label: '허벅지·엉덩이', desc: '앉으면 더 넓어지는 느낌', value: 'thigh', axisEffect: { A02: 45 } },
      { emoji: '💪', label: '어깨·팔뚝·등', desc: '목이 짧아 보이는 느낌', value: 'shoulder', axisEffect: { A06: 25 } },
      { emoji: '〰️', label: '옆구리·허리', desc: '정면에서 허리 곡선이 없음', value: 'waist', axisEffect: { A06: 25 } },
      { emoji: '🌊', label: '전체적으로', desc: '특정 부위 없이 전반적으로', value: 'whole', axisEffect: { A03: 15, A04: 15, A07: 10 } }
    ],
    feedback: { any: '🎯 가장 신경 쓰이는 부위가 바디코드의 출발점이 됩니다.' }
  },
  {
    id: 'Q04', section: 'A', num: 4,
    axis: 'A08', weight: 1.5, role: 'score',
    question: '솔직하게요. 지금까지 다이어트를 몇 번이나 시작하고 포기했나요?',
    hint: '판단 없습니다. 이 숫자가 높을수록 당신이 그만큼 간절했다는 증거입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🌱', label: '처음 도전이에요', desc: '아직 한 번도 제대로 안 해봤어요', value: 0, axisEffect: {} },
      { emoji: '🔄', label: '2~3번 해봤어요', desc: '조금 빠지다가 다시 돌아왔어요', value: 2, axisEffect: {} },
      { emoji: '🌀', label: '5번 이상이에요', desc: '이제는 뭘 해야 할지 모르겠어요', value: 5, axisEffect: { A08: 20 }, feedbackKey: 'yoyo' },
      { emoji: '💫', label: '셀 수도 없어요', desc: '다이어트가 일상이 된 지 오래됐어요', value: 10, axisEffect: { A08: 30 }, feedbackKey: 'yoyo' }
    ],
    saveAs: 'yoyo_count'
  },
  {
    id: 'Q05', section: 'A', num: 5,
    axis: 'A01', weight: 1.8, role: 'score',
    question: '지금 이 순간 {name}님의 몸 상태와 가장 가까운 것은?',
    hint: '오늘 아침 눈 떴을 때의 몸 감각으로 답해주세요.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🪨', label: '단단하고 탄탄한 편이에요', desc: '근육질은 아닌데 탄탄한 느낌', value: 'hard', axisEffect: { A01: 15, A06: 15 } },
      { emoji: '🍮', label: '전체적으로 말랑말랑해요', desc: '탄력이 없어진 느낌', value: 'soft', axisEffect: { A03: 10, A04: 15 }, feedbackKey: 'soft_fat' },
      { emoji: '💧', label: '붓는 편이에요', desc: '아침저녁 차이가 꽤 큰 편', value: 'puffy', axisEffect: { A02: 15, A07: 10 }, feedbackKey: 'puffy' },
      { emoji: '🎭', label: '부위마다 달라요', desc: '어딘 단단하고 어딘 말랑해요', value: 'mixed', axisEffect: {} }
    ]
  },
  {
    id: 'Q06', section: 'A', num: 6,
    axis: 'A10', weight: 1.3, role: 'score',
    question: '살이 가장 쉽게 찌는 시기가 있다면?',
    hint: '계절·상황별 패턴이 오행 체질과 정확히 연결됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '🌸', label: '봄, 스트레스 받는 시기', desc: '나도 모르게 봄에 쪄요', value: 'spring', ohaengEffect: { '목': 15 } },
      { emoji: '☀️', label: '여름, 더운 시기', desc: '여름에 오히려 더 먹게 돼요', value: 'summer', ohaengEffect: { '화': 15 } },
      { emoji: '🍂', label: '가을, 환절기', desc: '기분이 가라앉으면서 쪄요', value: 'autumn', ohaengEffect: { '금': 15 } },
      { emoji: '❄️', label: '겨울, 추운 시기', desc: '움츠러들고 활동이 줄어요', value: 'winter', ohaengEffect: { '수': 15 } },
      { emoji: '😤', label: '스트레스 받을 때마다', desc: '계절 상관없이 스트레스가 문제예요', value: 'stress', axisEffect: { A07: 15 }, feedbackKey: 'stress_high' },
      { emoji: '📅', label: '딱히 없어요', desc: '꾸준히 조금씩 쪄왔어요', value: 'none', axisEffect: {} }
    ],
    saveAs: 'worst_season'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 B · 지방의 언어
  // ══════════════════════════════════════════════════════
  {
    id: 'Q07', section: 'B', num: 7,
    axis: 'A01', weight: 2.5, role: 'score',
    question: '가장 신경 쓰이는 부위를 손으로 꾹 눌러보세요. 손가락 느낌이 어떤가요?',
    hint: '이 질문 하나가 바디코드를 결정하는 핵심 단서입니다. 정말로 눌러보고 답해주세요.',
    type: 'SINGLE_SELECT',
    weight: 2.5,
    options: [
      { emoji: '🪨', label: '딱딱하고 손가락이 잘 안 들어가요', desc: '내장지방 또는 코어 긴장형', value: 'hard', axisEffect: { A01: 45, A06: 15 }, feedbackKey: 'hard_fat' },
      { emoji: '🍮', label: '말랑말랑, 손가락이 쑥 들어가요', desc: '피하지방 우세형', value: 'soft', axisEffect: { A02: 25, A04: 15 }, feedbackKey: 'soft_fat' },
      { emoji: '🫧', label: '울퉁불퉁, 알갱이 같은 게 느껴져요', desc: '귤껍질 같은 오돌토돌한 느낌', value: 'bumpy', axisEffect: { A02: 25 } },
      { emoji: '💧', label: '누르면 들어갔다가 천천히 올라와요', desc: '부기처럼 눌린 자국이 남아요', value: 'pitting', axisEffect: { A02: 15, A07: 20 }, feedbackKey: 'puffy' }
    ]
  },
  {
    id: 'Q08', section: 'B', num: 8,
    axis: 'A02', weight: 1.8, role: 'score',
    question: '그 손을 그대로 살에 갖다 댔을 때, 온도가 어떻게 느껴지나요?',
    hint: '따뜻한 방 안에서도 차갑다면 이미 중요한 단서를 찾은 겁니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🧊', label: '차갑습니다', desc: '항상 손발이 냉한 편이에요', value: 'cold', axisEffect: { A02: 15, A03: 10 }, ohaengEffect: { '수': 10 }, feedbackKey: 'cold_body' },
      { emoji: '☀️', label: '보통이에요', desc: '딱히 차갑거나 뜨겁지 않아요', value: 'normal', axisEffect: {} },
      { emoji: '🔥', label: '따뜻하거나 열감이 있어요', desc: '오히려 몸이 잘 달아올라요', value: 'warm', axisEffect: { A01: 20 }, ohaengEffect: { '화': 10 } },
      { emoji: '🌓', label: '부위마다 달라요', desc: '상체는 뜨겁고 하체는 차가워요', value: 'mixed', axisEffect: { A02: 20 }, feedbackKey: 'cold_body' }
    ]
  },
  {
    id: 'Q09', section: 'B', num: 9,
    axis: 'A02', weight: 1.8, role: 'score',
    question: '아침과 저녁, {name}님의 몸은 얼마나 달라지나요?',
    hint: '체중계가 아니라 거울과 느낌으로 답해주세요.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🌅', label: '아침이랑 저녁이 완전히 달라요', desc: '저녁엔 반지도 안 껴질 정도', value: 'very_diff', axisEffect: { A02: 20, A07: 15 }, feedbackKey: 'puffy' },
      { emoji: '🌤️', label: '조금 다른 것 같아요', desc: '발이나 얼굴 정도는 붓는 편', value: 'slightly', axisEffect: { A02: 10 } },
      { emoji: '➡️', label: '거의 똑같아요', desc: '아침저녁 차이가 거의 없어요', value: 'same', axisEffect: {} }
    ],
    saveAs: 'morning_evening_diff'
  },
  {
    id: 'Q10', section: 'B', num: 10,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '허벅지 바깥쪽을 양손으로 잡고 살짝 흔들어보세요. 어떤가요?',
    hint: '이 질문에서 셀룰라이트 여부와 지방 밀도가 결정됩니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🫨', label: '흔들리고 파도치는 느낌이에요', desc: '잡히는 살이 많아요', value: 'waves', axisEffect: { A02: 20 } },
      { emoji: '🪨', label: '별로 안 흔들려요', desc: '단단한 편이에요', value: 'solid', axisEffect: { A04: 20 } },
      { emoji: '🌊', label: '흔들리면서 울퉁불퉁해요', desc: '표면이 매끄럽지 않아요', value: 'bumpy_wave', axisEffect: { A02: 25 }, feedbackKey: 'puffy' },
      { emoji: '🤷', label: '잘 모르겠어요', desc: '별로 신경 써본 적 없어요', value: 'unknown', axisEffect: {} }
    ]
  },
  {
    id: 'Q11', section: 'B', num: 11,
    axis: 'A01', weight: 1.8, role: 'score',
    question: '배꼽 아래 아랫배를 손으로 꾹 눌러보세요. 어떤 느낌인가요?',
    hint: '내장지방과 피하지방의 차이가 이 느낌 하나로 드러납니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🛡️', label: '눌러도 잘 안 들어가요', desc: '안에서 뭔가 막는 느낌', value: 'resistant', axisEffect: { A01: 40 }, feedbackKey: 'hard_fat' },
      { emoji: '🍮', label: '부드럽게 쑥 눌려요', desc: '', value: 'soft', axisEffect: { A02: 20 }, feedbackKey: 'soft_fat' },
      { emoji: '💨', label: '가스가 찬 것처럼 빵빵해요', desc: '', value: 'gassy', axisEffect: { A06: 20 } },
      { emoji: '😶', label: '잘 모르겠어요', desc: '', value: 'unknown', axisEffect: {} }
    ]
  },
  {
    id: 'Q12', section: 'B', num: 12,
    axis: 'A01', weight: 1.3, role: 'score',
    question: '허리를 정면에서 보면 어떤 실루엣인가요?',
    hint: '허리 라인의 형태가 처방 운동 종류를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '⌛', label: '잘록한 편이에요', desc: '허리 라인이 보여요', value: 'slim', axisEffect: {} },
      { emoji: '🪣', label: '통짜 일자예요', desc: '정면에서 허리 곡선이 거의 없어요', value: 'straight', axisEffect: { A06: 20 } },
      { emoji: '🫃', label: '허리는 얇은데 아랫배만 튀어나와요', desc: '', value: 'lower_only', axisEffect: { A02: 20 } },
      { emoji: '🍎', label: '상복부부터 하복부까지 전체가 넓어요', desc: '', value: 'whole_belly', axisEffect: { A01: 35 }, feedbackKey: 'belly_fat' }
    ]
  },

  // ══════════════════════════════════════════════════════
  //  섹션 C · 숫자의 비밀
  // ══════════════════════════════════════════════════════
  {
    id: 'Q13', section: 'C', num: 13,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '{name}님의 키를 알려주세요.',
    hint: '체지방률과 BMI 계산의 시작점입니다.',
    type: 'SLIDER',
    min: 140, max: 200, step: 1, unit: 'cm',
    saveAs: 'height',
    autoCalc: 'bmi_preview'
  },
  {
    id: 'Q14', section: 'C', num: 14,
    axis: 'A01', weight: 2.0, role: 'score',
    question: '지금 이 순간의 체중은 어떻게 되나요?',
    hint: '판단하지 않습니다. 이 숫자는 당신의 출발점입니다.',
    type: 'SLIDER',
    min: 35, max: 150, step: 0.5, unit: 'kg',
    saveAs: 'weight',
    autoCalc: 'body_composition',
    subQuestion: {
      id: 'Q14_method',
      question: '어떤 방법으로 확인한 체중인가요?',
      hint: '측정 방법에 따라 정밀도 계산이 달라집니다.',
      type: 'SINGLE_SELECT',
      saveAs: 'weight_measure_method',
      options: [
        { emoji: '⚖️', label: '오늘 아침 체중계 측정', desc: '가장 정확한 값', value: 'scale_today' },
        { emoji: '📅', label: '최근 1~2주 내 측정', desc: '약간의 오차 가능', value: 'scale_recent' },
        { emoji: '🏥', label: '병원·헬스장 인바디 측정', desc: '정밀 측정값', value: 'inbody' },
        { emoji: '🤔', label: '어림잡아서 입력했어요', desc: '추정값으로 계산됩니다', value: 'estimate' }
      ]
    }
  },
  {
    id: 'Q14b', section: 'C', num: 15,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '허리와 엉덩이 사이즈를 알고 계신가요?',
    hint: '줄자로 배꼽 위 2~3cm 허리 가장 잘록한 곳, 엉덩이 가장 넓은 곳을 재주세요. 모르시면 건너뛰어도 됩니다.',
    type: 'WAIST_HIP_INPUT',
    optional: true,
    saveAs: 'waist_hip',
    autoCalc: 'body_composition_navy'
  },
  {
    id: 'Q15', section: 'C', num: 16,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '6개월 후 {name}님이 목표로 하는 체중은요?',
    hint: '숫자가 목표가 아니라, 그 숫자일 때 입고 싶은 옷이 진짜 목표입니다.',
    type: 'SLIDER',
    min: 35, max: 150, step: 0.5, unit: 'kg',
    saveAs: 'target_weight',
    autoCalc: 'goal_calc'
  },
  {
    id: 'Q16', section: 'C', num: 16,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '현재 상의 사이즈는요?',
    hint: '결과지에서 목표 사이즈 변화가 표시됩니다.',
    type: 'SIZE_GRID',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    saveAs: 'top_size'
  },
  {
    id: 'Q17', section: 'C', num: 17,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '현재 하의 사이즈(인치)는요?',
    hint: '허벅지·엉덩이 사이즈 변화 목표와 연결됩니다.',
    type: 'SIZE_GRID',
    options: ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34+'],
    saveAs: 'bottom_size',
    weight: 0.8
  },
  {
    id: 'Q18', section: 'C', num: 18,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '6개월 후 입고 싶은 하의 사이즈는요?',
    hint: '이 목표 사이즈가 결과지 마지막 페이지 약속에 그대로 들어갑니다.',
    type: 'SIZE_GRID',
    options: ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34+'],
    saveAs: 'target_bottom_size'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 D · 내 몸의 시계
  // ══════════════════════════════════════════════════════
  {
    id: 'Q19', section: 'D', num: 19,
    axis: 'A07', weight: 1.5, role: 'score',
    question: '어젯밤 몇 시에 잠들었나요?',
    hint: '왜 다이어트 설문에서 수면을 물어보냐고요? 코르티솔이 복부에 지방을 직접 쌓는 호르몬이기 때문입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🌙', label: '11시 이전', desc: '규칙적인 수면 패턴', value: 'before11', axisEffect: {} },
      { emoji: '🌚', label: '자정~새벽 1시', desc: '약간 늦은 편', value: 'midnight', axisEffect: { A07: 10 } },
      { emoji: '🌑', label: '새벽 2~3시', desc: '야행성에 가까워요', value: 'late', axisEffect: { A07: 20 }, feedbackKey: 'sleep_late' },
      { emoji: '☀️', label: '새벽 4시 이후', desc: '거의 밤을 새우는 수준', value: 'dawn', axisEffect: { A07: 25 }, feedbackKey: 'sleep_late' }
    ],
    saveAs: 'sleep_time'
  },
  {
    id: 'Q20', section: 'D', num: 20,
    axis: 'A07', weight: 1.5, role: 'score',
    question: '하루 평균 수면 시간은요?',
    hint: '수면 6시간 미만은 복부 내장지방을 직접 증가시킨다는 연구가 있습니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '😴', label: '7~8시간', desc: '충분한 수면', value: 7.5, axisEffect: {} },
      { emoji: '😪', label: '6시간 전후', desc: '약간 부족한 편', value: 6, axisEffect: { A07: 10 } },
      { emoji: '😵', label: '5시간 이하', desc: '만성 수면 부족', value: 4.5, axisEffect: { A07: 30 }, feedbackKey: 'sleep_late' },
      { emoji: '🦉', label: '매일 달라요', desc: '불규칙한 수면', value: 0, axisEffect: { A07: 15, A08: 15 } }
    ],
    saveAs: 'sleep_hours'
  },
  {
    id: 'Q21', section: 'D', num: 21,
    axis: 'A07', weight: 1.8, role: 'score',
    question: '최근 한 달, 스트레스 강도는 어느 정도인가요?',
    hint: '스트레스 호르몬 코르티솔은 복부에만 선택적으로 지방을 쌓습니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '😊', label: '별로 없어요', desc: '평온한 편이에요', value: 1, axisEffect: {} },
      { emoji: '😤', label: '중간 정도요', desc: '가끔 힘들어요', value: 2, axisEffect: { A07: 10 } },
      { emoji: '😰', label: '꽤 심한 편이에요', desc: '거의 매일 스트레스를 받아요', value: 3, axisEffect: { A07: 25 }, feedbackKey: 'stress_high' },
      { emoji: '🌋', label: '극심해요', desc: '지금 정말 힘든 시기예요', value: 4, axisEffect: { A07: 40 }, feedbackKey: 'stress_high' }
    ],
    saveAs: 'stress_level'
  },
  {
    id: 'Q23', section: 'D', num: 23,
    axis: 'A04', weight: 1.8, role: 'score',
    question: '지금까지 가장 열심히, 또는 가장 오래 해봤던 운동 방식은? (최대 2개)',
    hint: '이 답변으로 당신에게 지금 당장 금지된 운동이 드러납니다.',
    type: 'MULTI_SELECT',
    maxSelect: 2,
    weight: 2.0,
    options: [
      { emoji: '🏋️', label: '웨이트·근력 위주', desc: '스쿼트 런지 숄더프레스 랫풀다운 등', value: 'weight', axisEffect: { A03: 10 } },
      { emoji: '🏃', label: '유산소 위주', desc: '런닝 산책 자전거 등', value: 'cardio', axisEffect: {} },
      { emoji: '🧘', label: '코어·스트레칭 위주', desc: '요가 필라테스 등', value: 'core', axisEffect: {} },
      { emoji: '🏊', label: '부력 운동 위주', desc: '수영 아쿠아로빅 등', value: 'swim', axisEffect: { A02: 8 } },
      { emoji: '📱', label: '홈트레이닝 위주', desc: '집에서 유튜브 운동 등', value: 'home', axisEffect: {} },
      { emoji: '⚡', label: '고강도 심폐·근력 위주', desc: '크로스핏 하이록스 HIIT 등', value: 'hiit', axisEffect: { A07: 8 } },
      { emoji: '🥊', label: '투기 운동 위주', desc: '복싱 태권도 유도 MMA 등', value: 'martial', axisEffect: {} },
      { emoji: '⚽', label: '구기 종목 위주', desc: '축구 농구 배구 야구 등', value: 'ball', axisEffect: {} },
      { emoji: '💤', label: '운동을 거의 안 했어요', desc: '', value: 'none', axisEffect: { A03: 15 } }
    ],
    saveAs: 'past_exercises'
  },
  {
    id: 'Q24', section: 'D', num: 24,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '지금까지 주로 시도해본 식단은? (최대 3개)',
    hint: '어떤 식단이 당신 체형에 맞지 않았는지 이미 알 수 있습니다.',
    type: 'MULTI_SELECT',
    maxSelect: 3,
    weight: 1.5,
    options: [
      { emoji: '🍗', label: '닭가슴살 + 샐러드 단독', desc: '', value: '닭가슴살샐러드' },
      { emoji: '⏰', label: '간헐적 단식', desc: '', value: '간헐적단식' },
      { emoji: '🌿', label: '채식·비건 식단', desc: '', value: '채식' },
      { emoji: '🥗', label: '저탄고지 (키토)', desc: '', value: '키토' },
      { emoji: '🍚', label: '소식·칼로리 제한', desc: '', value: '소식' },
      { emoji: '💊', label: '다이어트 보조제 위주', desc: '', value: '보조제' },
      { emoji: '🙅', label: '별로 안 해봤어요', desc: '', value: 'none' }
    ],
    saveAs: 'past_diets'
  },
  {
    id: 'Q25', section: 'D', num: 25,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '다이어트를 포기하게 만드는 가장 큰 이유는?',
    hint: '이 이유가 결과지에서 처음으로 정면 돌파됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '😤', label: '의지력이 부족해서', desc: '', value: 'willpower', axisEffect: {} },
      { emoji: '😔', label: '열심히 했는데 효과가 없어서', desc: '', value: 'no_effect', axisEffect: { A03: 15 }, feedbackKey: 'no_effect' },
      { emoji: '🤯', label: '너무 힘들어서 지속이 안 돼서', desc: '', value: 'too_hard', axisEffect: {} },
      { emoji: '😕', label: '뭘 해야 할지 몰라서', desc: '', value: 'no_idea', axisEffect: {} },
      { emoji: '🌀', label: '살 빠져도 요요가 와서', desc: '', value: 'yoyo', axisEffect: { A08: 20 }, feedbackKey: 'yoyo' }
    ],
    saveAs: 'quit_reason'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 E · 오행의 신호
  // ══════════════════════════════════════════════════════
  {
    id: 'Q26', section: 'E', num: 26,
    axis: 'A10', weight: 1.3, role: 'score',
    question: '아무 생각 없이 냉장고를 열었을 때, 가장 먼저 손이 가는 맛은?',
    hint: '한의학에서는 몸이 부족한 에너지를 맛으로 달라고 신호를 보낸다고 봅니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🍋', label: '신맛', desc: '레몬 식초 김치가 당겨요 (간담 신호)', value: 'sour', ohaengEffect: { '목': 20 } },
      { emoji: '☕', label: '쓴맛', desc: '아메리카노 녹차가 좋아요 (심장 신호)', value: 'bitter', ohaengEffect: { '화': 20 } },
      { emoji: '🍰', label: '단맛', desc: '뭔가 달콤한 게 자꾸 당겨요 (비위 신호)', value: 'sweet', ohaengEffect: { '토': 20 } },
      { emoji: '🌶️', label: '매운맛', desc: '마라 불닭을 달고 살아요 (폐 신호)', value: 'spicy', ohaengEffect: { '금': 20 } },
      { emoji: '🧂', label: '짠맛', desc: '짠 과자 라면이 무너뜨려요 (신장 신호)', value: 'salty', ohaengEffect: { '수': 20 } }
    ],
    saveAs: 'taste_preference'
  },
  {
    id: 'Q27', section: 'E', num: 27,
    axis: 'A10', weight: 1.3, role: 'score',
    question: '1년 중 유독 몸이 무겁고 힘든 계절은?',
    hint: '계절별 취약 장기가 오행 체질과 정확히 일치합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🌸', label: '봄', desc: '눈이 충혈되고 옆구리가 불편해요', value: 'spring', ohaengEffect: { '목': 18 } },
      { emoji: '☀️', label: '여름', desc: '더위를 유독 못 견디고 심장이 두근거려요', value: 'summer', ohaengEffect: { '화': 18 } },
      { emoji: '🍂', label: '환절기', desc: '소화가 안 되고 몸이 무거워요', value: 'seasonal', ohaengEffect: { '토': 18 } },
      { emoji: '🍁', label: '가을', desc: '피부가 건조하고 기침이 잦아요', value: 'autumn', ohaengEffect: { '금': 18 } },
      { emoji: '❄️', label: '겨울', desc: '손발이 차갑고 허리가 시려요', value: 'winter', ohaengEffect: { '수': 18 } }
    ],
    saveAs: 'weak_season'
  },
  {
    id: 'Q28', section: 'E', num: 28,
    axis: 'A10', weight: 1.3, role: 'score',
    question: '스트레스를 받거나 피곤하면 가장 먼저 어디서 신호가 오나요?',
    hint: '장기별 피로 반응이 오행 체질을 확정하는 마지막 단서입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '👁️', label: '눈이 충혈되고 옆구리·명치가 불편해요', desc: '간 피로', value: 'liver', ohaengEffect: { '목': 20 } },
      { emoji: '❤️', label: '가슴이 두근거리고 잠이 안 와요', desc: '심장 피로', value: 'heart', ohaengEffect: { '화': 20 } },
      { emoji: '🫃', label: '소화가 안 되고 입이 허전해요', desc: '비위 피로', value: 'spleen', ohaengEffect: { '토': 20 } },
      { emoji: '🤧', label: '코막힘·기침·피부 트러블이 생겨요', desc: '폐 피로', value: 'lung', ohaengEffect: { '금': 20 } },
      { emoji: '💧', label: '허리·무릎이 시리고 손발이 더 차가워져요', desc: '신장 피로', value: 'kidney', ohaengEffect: { '수': 20 } }
    ],
    saveAs: 'organ_stress_signal'
  },
  {
    id: 'Q29', section: 'E', num: 29,
    axis: 'A05', weight: 1.5, role: 'score',
    question: '{name}님의 평소 소화 상태는 어떤가요?',
    hint: '소화 패턴이 비위(토 체질) 여부와 복부 지방을 연결합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '✅', label: '잘 먹고 잘 소화해요', desc: '', value: 'good', axisEffect: {}, ohaengEffect: {} },
      { emoji: '🌀', label: '자주 더부룩하고 가스가 차요', desc: '', value: 'bloated', axisEffect: { A06: 15 }, ohaengEffect: { '토': 15 } },
      { emoji: '😵', label: '먹으면 바로 피곤해지는 식곤증이 심해요', desc: '', value: 'sleepy_after', axisEffect: { A01: 10 }, ohaengEffect: { '토': 10 } },
      { emoji: '🤢', label: '소화가 예민해서 뭘 먹어도 조심해요', desc: '', value: 'sensitive', axisEffect: {}, ohaengEffect: { '토': 10 } }
    ]
  },
  {
    id: 'Q30', section: 'E', num: 30,
    axis: 'A05', weight: 1.3, role: 'score',
    question: '평소 피부 상태는 어떤 편인가요?',
    hint: '피부는 폐의 거울입니다. 금 체질 여부를 알려주는 단서예요.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '💧', label: '건조하고 각질이 잘 생겨요', desc: '', value: 'dry', ohaengEffect: { '금': 12 } },
      { emoji: '🪭', label: '기름지고 모공이 넓은 편이에요', desc: '', value: 'oily', ohaengEffect: {} },
      { emoji: '🌹', label: '예민해서 쉽게 빨개지고 트러블이 나요', desc: '', value: 'sensitive', ohaengEffect: { '화': 10 } },
      { emoji: '✨', label: '별로 민감하지 않아요', desc: '', value: 'normal', ohaengEffect: {} }
    ]
  },
  {
    id: 'Q31', section: 'E', num: 31,
    axis: 'A02', weight: 1.5, role: 'score',
    question: '평소 체온이 어떤 편인가요?',
    hint: '체온 1도 차이가 기초대사량 13%를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🧊', label: '항상 차가운 편이에요', desc: '손발이 냉하고 기초체온이 낮아요', value: 'cold', axisEffect: { A02: 15, A03: 10 }, ohaengEffect: { '수': 18 }, feedbackKey: 'cold_body' },
      { emoji: '☀️', label: '따뜻한 편이에요', desc: '더위를 잘 타고 쉽게 달아올라요', value: 'warm', ohaengEffect: { '화': 15 } },
      { emoji: '🌡️', label: '36.5도 정도, 평균적이에요', desc: '', value: 'normal', ohaengEffect: {} },
      { emoji: '🌓', label: '상체는 뜨겁고 하체는 차가워요', desc: '', value: 'mixed', axisEffect: { A02: 20 }, feedbackKey: 'cold_body' }
    ],
    saveAs: 'body_temp_type'
  },
  {
    id: 'Q32', section: 'E', num: 32,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '아침에 잠에서 깼을 때 {name}님의 상태는?',
    hint: '아침 기상 상태가 부신(코르티솔) 피로도를 알려줍니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '😊', label: '개운하게 잘 일어나요', desc: '', value: 'fresh', axisEffect: {} },
      { emoji: '😪', label: '피곤해서 일어나기 힘들어요', desc: '', value: 'tired', axisEffect: { A07: 10 } },
      { emoji: '🥴', label: '얼굴이 퉁퉁 부어서 일어나요', desc: '', value: 'puffy', axisEffect: { A02: 10, A07: 15 }, feedbackKey: 'puffy' },
      { emoji: '😤', label: '아침에 유독 예민하고 짜증이 나요', desc: '', value: 'irritable', axisEffect: { A07: 15 }, feedbackKey: 'stress_high' }
    ]
  },
  {
    id: 'Q33', section: 'E', num: 33,
    axis: 'A02', weight: 1.3, role: 'score',
    question: '하루에 물을 얼마나 마시나요?',
    hint: '수분 섭취량이 림프 순환과 지방 분해 속도를 직접 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '💧', label: '1L 미만', desc: '물을 잘 안 마셔요', value: 'less1', axisEffect: { A02: 12 } },
      { emoji: '🥤', label: '1~1.5L 정도', desc: '', value: 'normal', axisEffect: {} },
      { emoji: '🌊', label: '2L 이상', desc: '물을 많이 마시는 편이에요', value: 'plenty', axisEffect: {} },
      { emoji: '☕', label: '커피·음료로 대체해요', desc: '물 대신 카페인으로', value: 'caffeine', axisEffect: { A07: 12 } }
    ]
  },
  {
    id: 'Q34', section: 'E', num: 34,
    axis: 'A06', weight: 2.0, role: 'wow',
    question: '평소 불편하거나 자주 결리는 관절 부위가 있나요? (해당하는 곳 모두 선택)',
    hint: '관절 상태가 처방 운동의 강도와 제한 범위를 결정합니다.',
    type: 'MULTI_SELECT',
    maxSelect: 8,
    weight: 1.3,
    options: [
      { emoji: '🦒', label: '목', desc: '', value: 'neck', ohaengEffect: { '금': 6 } },
      { emoji: '💪', label: '어깨', desc: '', value: 'shoulder', axisEffect: { A06: 8 } },
      { emoji: '🦾', label: '팔꿈치', desc: '', value: 'elbow', ohaengEffect: { '금': 6 } },
      { emoji: '🖐️', label: '손목', desc: '', value: 'wrist', ohaengEffect: { '금': 5 } },
      { emoji: '🔙', label: '허리', desc: '', value: 'back', ohaengEffect: { '수': 13 } },
      { emoji: '🍑', label: '골반', desc: '', value: 'pelvis', axisEffect: { A06: 10 } },
      { emoji: '🦵', label: '무릎', desc: '', value: 'knee', ohaengEffect: { '수': 13 } },
      { emoji: '🦶', label: '발목', desc: '', value: 'ankle', ohaengEffect: { '수': 8 } },
      { emoji: '✅', label: '딱히 불편한 곳 없어요', desc: '', value: 'none', exclusive: true, ohaengEffect: {} }
    ],
    saveAs: 'joint_condition'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 F · 행동의 패턴
  // ══════════════════════════════════════════════════════
  {
    id: 'Q35', section: 'F', num: 35,
    axis: 'A04', weight: 1.5, role: 'score',
    question: '운동을 시작했을 때 가장 오래 지속한 기록은요?',
    hint: '이 숫자가 처방의 난이도와 속도를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '🏃', label: '3개월 이상 꾸준히 했어요', desc: '', value: '3months', axisEffect: {} },
      { emoji: '📅', label: '한 달 정도는 했어요', desc: '', value: '1month', axisEffect: {} },
      { emoji: '🌱', label: '2주를 못 넘겨요', desc: '', value: '2weeks', axisEffect: { A08: 13 } },
      { emoji: '💤', label: '시작 자체가 힘들어요', desc: '', value: 'cant_start', axisEffect: { A08: 13 } }
    ],
    saveAs: 'max_exercise_duration'
  },
  {
    id: 'Q38', section: 'F', num: 38,
    axis: 'A10', weight: 1.3, role: 'score',
    question: '다이어트를 시작한 후 "이번엔 진짜 해야겠다"고 불이 붙는 순간은 언제인가요?',
    hint: '이 동기 촉발 포인트를 알면 처방의 언어와 방향이 완전히 달라집니다.',
    type: 'SINGLE_SELECT',
    weight: 0.8,
    options: [
      { emoji: '📉', label: '체중·체지방 숫자가 실제로 줄었을 때', desc: '숫자로 증명되어야 믿어요', value: 'numbers', mbtiHint: 'T' },
      { emoji: '👗', label: '옷이 맞아들거나 주변 반응이 있을 때', desc: '눈에 보이는 변화가 더 와닿아요', value: 'appearance', mbtiHint: 'F' },
      { emoji: '🏆', label: '작은 목표 하나를 달성했을 때', desc: '성취감이 다음 단계를 만들어줘요', value: 'achievement', mbtiHint: 'J' },
      { emoji: '💬', label: '누군가의 한마디나 새로운 정보를 접했을 때', desc: '외부 자극이 스위치가 돼요', value: 'external', mbtiHint: 'P' },
      { emoji: '😰', label: '몸이 이상하다 싶거나 건강 경고를 받았을 때', desc: '위기감이 원동력이 돼요', value: 'health_scare', mbtiHint: null }
    ],
    saveAs: 'motivation_type'
  },
  {
    id: 'Q39', section: 'F', num: 39,
    axis: 'A10', weight: 1.3, role: 'score',
    question: '새로운 다이어트 방법이 생기면 {name}님은 어떻게 하나요?',
    hint: '정보를 처리하는 방식이 처방 전달 형식을 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 0.8,
    options: [
      { emoji: '🔬', label: '근거부터 찾아보고 검증 후 시도해요', desc: '', value: 'research', mbtiHint: 'NT' },
      { emoji: '⚡', label: '일단 해보고 결과를 봐요', desc: '', value: 'just_do', mbtiHint: 'SP' },
      { emoji: '🤝', label: '주변에서 효과 봤다고 하면 해봐요', desc: '', value: 'social', mbtiHint: 'SF' },
      { emoji: '📚', label: '전문가 추천이 있어야 시도해요', desc: '', value: 'expert', mbtiHint: 'SJ' }
    ],
    saveAs: 'info_processing'
  },
  {
    id: 'Q40', section: 'F', num: 40,
    axis: 'A04', weight: 1.3, role: 'score',
    question: '저녁 이후 야식이나 간식을 먹는 빈도는?',
    hint: '야간 섭식 패턴이 코르티솔형·복부비만형 판별의 핵심 데이터입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '✅', label: '거의 안 먹어요', desc: '주 1회 미만', value: 0, axisEffect: {} },
      { emoji: '🌙', label: '주 2~3회 정도 먹어요', desc: '', value: 2, axisEffect: { A07: 10 } },
      { emoji: '😔', label: '거의 매일 야식을 먹어요', desc: '', value: 7, axisEffect: { A07: 30 }, feedbackKey: 'sleep_late' },
      { emoji: '🌑', label: '밤이 되면 도저히 참을 수가 없어요', desc: '', value: 10, axisEffect: { A07: 30 }, feedbackKey: 'stress_high' }
    ],
    saveAs: 'late_night_eating'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 G · DNA의 언어
  // ══════════════════════════════════════════════════════
  {
    id: 'Q42', section: 'G', num: 42,
    axis: 'A10', weight: 1.0, role: 'score',
    question: 'MBTI를 알고 있다면 선택해 주세요. 모르신다면 "유추해드릴게요"를 선택하세요.',
    hint: '처방을 전달하는 언어와 방식이 완전히 달라집니다.',
    type: 'MBTI_GRID',
    options: ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP','유추해드릴게요'],
    saveAs: 'mbti',
    inferIfUnknown: true,
    mbtiInferQuestions: [
      {
        id: 'Q42_A',
        question: '중요한 결정을 내릴 때 {name}님은?',
        options: [
          { label: '논리와 근거로 판단해요', value: 'T', desc: '' },
          { label: '감정과 사람을 먼저 생각해요', value: 'F', desc: '' }
        ]
      },
      {
        id: 'Q42_B',
        question: '계획을 세울 때 {name}님은?',
        options: [
          { label: '미리 다 정해두는 게 편해요', value: 'J', desc: '' },
          { label: '흐름에 맡기는 게 편해요', value: 'P', desc: '' }
        ]
      },
      {
        id: 'Q42_C',
        question: '에너지를 충전하는 방식은?',
        options: [
          { label: '혼자만의 시간이 필요해요', value: 'I', desc: '' },
          { label: '사람들과 함께할 때 충전돼요', value: 'E', desc: '' }
        ]
      },
      {
        id: 'Q42_D',
        question: '새로운 것을 배울 때 {name}님은?',
        options: [
          { label: '직접 경험하고 현실적인 것을 선호해요', value: 'S', desc: '' },
          { label: '아이디어와 가능성을 탐색하는 걸 좋아해요', value: 'N', desc: '' }
        ]
      }
    ]
  },
  {
    id: 'Q43', section: 'G', num: 43,
    axis: 'A10', weight: 1.0, role: 'score',
    question: '생년월일을 알려주세요.',
    hint: '사주 일간(日干) 오행이 자동으로 계산됩니다. 태어난 시간까지 알면 시주(時柱)도 확인할 수 있어요.',
    type: 'DATE_PICKER',
    saveAs: 'birth_date',
    autoCalc: 'saju'
  },
  {
    id: 'Q45', section: 'G', num: 45,
    axis: 'A03', weight: 1.8, role: 'score',
    question: '건강검진이나 인바디 측정을 해본 적 있나요?',
    hint: '실측 데이터가 있다면 바디코드 정확도가 훨씬 높아집니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '✅', label: '있고, 결과도 대충 알고 있어요', desc: '범위로 입력 가능', value: 'has_data' },
      { emoji: '📋', label: '해봤지만 수치는 기억 안 나요', desc: '', value: 'no_data' },
      { emoji: '🙅', label: '해본 적 없어요', desc: '', value: 'never' }
    ],
    saveAs: 'has_inbody'
  },
  {
    id: 'Q46', section: 'G', num: 46,
    axis: 'A09', weight: 1.0, role: 'score',
    question: '인바디 수치를 알려주세요. (선택)',
    hint: '정확한 숫자보다 대략적인 범위면 충분합니다. 입력하면 훨씬 정밀한 결과가 나옵니다.',
    type: 'INBODY_RANGE',
    conditional: { dependsOn: 'Q45', showIf: 'has_data' },
    saveAs: 'inbody_data',
    rangeFields: [
      { key: 'bfr', label: '체지방률', unit: '%', min: 5, max: 60, step: 1, hint: '예: 25~30%' },
      { key: 'muscle_kg', label: '골격근량', unit: 'kg', min: 10, max: 50, step: 0.5, hint: '예: 20~25kg' }
    ]
  },

  // ══════════════════════════════════════════════════════
  //  섹션 H · 마지막 질문
  // ══════════════════════════════════════════════════════
  {
    id: 'Q47', section: 'H', num: 47,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '6개월 후 입고 싶은 상의 사이즈는요?',
    hint: '이 사이즈가 결과지 마지막 페이지 "앞으로의 약속"에 그대로 들어갑니다.',
    type: 'SIZE_GRID',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    saveAs: 'target_top_size'
  },
  {
    id: 'Q48', section: 'H', num: 48,
    axis: 'A08', weight: 1.5, role: 'score',
    question: '살을 빼는 이유 중 {name}님에게 가장 중요한 것은?',
    hint: '이 이유가 결과지 첫 페이지 오프닝 문장의 방향을 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '👗', label: '예쁜 옷을 마음껏 입고 싶어서', desc: '', value: 'clothes' },
      { emoji: '❤️', label: '건강이 걱정되어서', desc: '', value: 'health' },
      { emoji: '💼', label: '자신감과 자존감을 위해서', desc: '', value: 'confidence' },
      { emoji: '👫', label: '누군가에게 매력적으로 보이고 싶어서', desc: '', value: 'attraction' },
      { emoji: '🏃', label: '몸이 가볍고 에너지가 넘치고 싶어서', desc: '', value: 'energy' }
    ],
    saveAs: 'main_goal'
  },
  {
    id: 'Q49', section: 'H', num: 49,
    axis: 'A09', weight: 1.5, role: 'score',
    question: '과거에 다이어트 관련으로 병원이나 의원을 다녀본 적 있나요? (해당 모두 선택)',
    hint: '병원 이력이 있다면 처방에서 중복 추천을 피할 수 있습니다.',
    type: 'MULTI_SELECT',
    maxSelect: 5,
    weight: 0,
    options: [
      { emoji: '💊', label: '내과', desc: '위고비·GLP-1 등 약물 처방', value: '내과' },
      { emoji: '💉', label: '피부과', desc: '지방분해주사·지방흡입 등', value: '피부과' },
      { emoji: '🦴', label: '정형외과', desc: '관절·척추 관련', value: '정형외과' },
      { emoji: '🌿', label: '한의원', desc: '침·한약 다이어트', value: '한의원' },
      { emoji: '🙅', label: '없어요', desc: '', value: 'none', exclusive: true }
    ],
    saveAs: 'hospital_history'
  },
  {
    id: 'Q50', section: 'H', num: 50,
    axis: 'A10', weight: 1.0, role: 'score',
    question: '마지막으로, {name}님에게 가장 중요한 한 가지는?',
    hint: '이 선택이 결과지 마지막 페이지 문장에 담깁니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '⚡', label: '빠른 변화', desc: '최대한 빠르게 결과를 보고 싶어요', value: 'fast' },
      { emoji: '💪', label: '지속 가능함', desc: '요요 없이 오래 유지하고 싶어요', value: 'sustainable' },
      { emoji: '🧘', label: '건강함', desc: '무리하지 않고 건강하게 바꾸고 싶어요', value: 'healthy' },
      { emoji: '✨', label: '자신감', desc: '거울 속 나를 좋아하게 되고 싶어요', value: 'confidence' }
    ],
    saveAs: 'priority_value'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 I · 마음의 패턴
  // ══════════════════════════════════════════════════════
  {
    id: 'Q51', section: 'I', num: 51,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '다이어트를 포기하게 되는 순간은 주로 언제인가요?',
    hint: '포기하는 타이밍을 알면, 딱 그 순간을 막아드릴 수 있어요.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '⚡', label: '시작 1~3일 안에 무너져요', desc: '작심삼일', value: 'day3', axisEffect: { A08: 20 } },
      { emoji: '📅', label: '2주~1달 사이, 변화가 없으면', desc: '결과가 안 보이면 포기해요', value: 'week2', axisEffect: { A03: 15 }, feedbackKey: 'no_effect' },
      { emoji: '🎉', label: '목표를 달성한 직후', desc: '빠지고 나면 다시 먹게 돼요', value: 'after_goal', axisEffect: { A08: 25 }, feedbackKey: 'yoyo' },
      { emoji: '😫', label: '스트레스나 힘든 일이 생기면', desc: '마음이 무너지면 식단도 무너져요', value: 'stress_trigger', axisEffect: { A07: 20 }, feedbackKey: 'stress_high' },
      { emoji: '🤔', label: '딱히 정해진 시점 없이 흐지부지', desc: '', value: 'fade_out', axisEffect: { A08: 15 } }
    ],
    saveAs: 'quit_timing'
  },
  {
    id: 'Q52', section: 'I', num: 52,
    axis: 'A10', weight: 1.0, role: 'score',
    question: '열심히 했는데 결과가 안 나올 때, 가장 먼저 드는 생각은?',
    hint: '이 생각 패턴이 앞으로의 처방 언어를 완전히 바꿉니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🤔', label: '"내 방법이 잘못됐나봐"', desc: '방법을 바꾸려고 해요', value: 'method_wrong', axisEffect: {} },
      { emoji: '😤', label: '"내 의지력이 부족한 거야"', desc: '스스로를 탓하게 돼요', value: 'self_blame', axisEffect: { A08: 15 } },
      { emoji: '😶', label: '"나는 원래 안 되는 체질인가봐"', desc: '포기하고 싶어져요', value: 'helpless', axisEffect: { A08: 30 } },
      { emoji: '⚡', label: '"더 극단적으로 해야겠다"', desc: '더 빡세게 하려고 해요', value: 'extreme', axisEffect: { A03: 20 } },
      { emoji: '💬', label: '"누군가의 도움이 필요해"', desc: '조언을 찾아요', value: 'seek_help', axisEffect: {} }
    ],
    saveAs: 'failure_attribution'
  },
  {
    id: 'Q53', section: 'I', num: 53,
    axis: 'A10', weight: 1.0, role: 'score',
    question: '지금까지 살면서 가장 오래 유지한 좋은 습관이 있나요?',
    hint: '다이어트가 아닌 어떤 습관이든 괜찮아요. 그 패턴이 처방 방식의 열쇠입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '☕', label: '규칙적인 기상·취침 시간', desc: '생활 리듬 루틴형', value: 'sleep_routine', axisEffect: {} },
      { emoji: '🏃', label: '특정 운동이나 활동', desc: '몸으로 하는 루틴형', value: 'exercise_routine', axisEffect: {} },
      { emoji: '📝', label: '기록하기 (일기·가계부·메모 등)', desc: '기록 루틴형', value: 'record_routine', axisEffect: {} },
      { emoji: '🎵', label: '취미 생활 (음악·독서·그림 등)', desc: '즐거움 루틴형', value: 'hobby_routine', axisEffect: {} },
      { emoji: '🙅', label: '딱히 없어요', desc: '루틴 형성이 어려운 편이에요', value: 'no_routine', axisEffect: { A08: 10 } }
    ],
    saveAs: 'best_routine'
  },
  {
    id: 'Q54', section: 'I', num: 54,
    axis: 'A08', weight: 1.5, role: 'score',
    question: '스트레스를 받으면 식욕이 어떻게 변하나요?',
    hint: '같은 스트레스라도 몸마다 반응이 달라요. {name}님의 패턴을 알면 예방이 가능합니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🍕', label: '더 많이, 더 자주 먹게 돼요', desc: '폭식 경향', value: 'more', axisEffect: { A07: 25 }, feedbackKey: 'stress_high' },
      { emoji: '🚫', label: '오히려 입맛이 뚝 떨어져요', desc: '거식 경향', value: 'less', axisEffect: {} },
      { emoji: '🌙', label: '낮엔 괜찮다가 밤에 폭발해요', desc: '야간 폭식 경향', value: 'night', axisEffect: { A07: 30 }, feedbackKey: 'stress_high' },
      { emoji: '🍫', label: '단것·탄수화물만 엄청 당겨요', desc: '당 갈망 경향', value: 'sweets', axisEffect: { A07: 20 }, feedbackKey: 'stress_high' },
      { emoji: '😐', label: '스트레스와 식욕이 별로 연관 없어요', desc: '', value: 'no_change', axisEffect: {} }
    ],
    saveAs: 'stress_appetite'
  },
  {
    id: 'Q55', section: 'I', num: 55,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '다이어트 결심을 하게 만드는 가장 큰 계기는?',
    hint: '이 계기를 알면 {name}님에게 맞는 동기 유지 방법을 찾을 수 있어요.',
    type: 'SINGLE_SELECT',
    weight: 1.0,
    options: [
      { emoji: '📸', label: '사진 속 내 모습을 보고', desc: '', value: 'photo', axisEffect: {} },
      { emoji: '👗', label: '옷이 안 맞을 때', desc: '', value: 'clothes', axisEffect: {} },
      { emoji: '❤️', label: '건강 수치나 의사 말을 듣고', desc: '', value: 'health_warning', axisEffect: {} },
      { emoji: '🏖️', label: '여행·행사·특별한 날이 생겼을 때', desc: '', value: 'event', axisEffect: {} },
      { emoji: '💬', label: '누군가의 말 한마디에', desc: '', value: 'someone_said', axisEffect: {} },
      { emoji: '✨', label: '그냥 갑자기 마음이 생겨요', desc: '', value: 'spontaneous', axisEffect: {} }
    ],
    saveAs: 'motivation_trigger'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 J · 몸의 신호
  // ══════════════════════════════════════════════════════
  {
    id: 'Q56', section: 'J', num: 56,
    axis: 'A08', weight: 1.5, role: 'score',
    question: '밥을 먹고 "배가 부르다"는 신호는 언제 오나요?',
    hint: '포만감 신호가 늦게 오면, 과식이 아니라 신경 반응 속도의 문제입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🍽️', label: '먹는 중에 자연스럽게 느껴요', desc: '포만감 신호 정상', value: 'during', axisEffect: {} },
      { emoji: '⏰', label: '다 먹고 10~20분 뒤에야 느껴요', desc: '포만감 약간 지연', value: 'delayed_20', axisEffect: { A07: 10 } },
      { emoji: '😔', label: '배가 터질 듯 먹어야 부른 느낌이 와요', desc: '포만감 크게 지연', value: 'overfull', axisEffect: { A01: 10, A07: 20 } },
      { emoji: '🤷', label: '배가 부른 느낌을 잘 모르겠어요', desc: '포만감 감각 저하', value: 'no_signal', axisEffect: { A07: 25 } }
    ],
    saveAs: 'fullness_timing'
  },
  {
    id: 'Q57', section: 'J', num: 57,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '야식이나 폭식이 시작되는 가장 흔한 상황은?',
    hint: '방아쇠를 알면 방어할 수 있어요. {name}님의 트리거는 어느 쪽인가요?',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '📺', label: 'TV·유튜브·스마트폰을 보다가', desc: '자극 기반 식욕', value: 'screen', axisEffect: { A07: 15 } },
      { emoji: '😤', label: '짜증나거나 힘든 일이 있었을 때', desc: '감정 기반 식욕', value: 'emotion', axisEffect: { A07: 25 }, feedbackKey: 'stress_high' },
      { emoji: '🌙', label: '밤 10시 이후면 조건반사처럼', desc: '시간 기반 식욕', value: 'time', axisEffect: { A07: 20 } },
      { emoji: '😴', label: '졸리거나 피곤할 때', desc: '에너지 고갈 기반', value: 'tired', axisEffect: { A07: 15 } },
      { emoji: '🏠', label: '집에 혼자 있을 때', desc: '환경 기반 식욕', value: 'alone', axisEffect: { A07: 10 } },
      { emoji: '✅', label: '야식·폭식을 거의 안 해요', desc: '', value: 'rarely', axisEffect: {} }
    ],
    saveAs: 'binge_trigger'
  },
  {
    id: 'Q58', section: 'J', num: 58,
    axis: 'A06', weight: 1.5, role: 'score',
    question: '운동할 때 잘 쓰이지 않는 것 같은 "감각이 없는" 부위가 있나요?',
    hint: '스쿼트를 해도 허벅지보다 허리만 아프다면 → 허벅지 감각 저하. 이게 보상 움직임의 시작입니다.',
    type: 'MULTI_SELECT',
    maxSelect: 5,
    weight: 1.8,
    options: [
      { emoji: '🍑', label: '엉덩이', desc: '스쿼트해도 엉덩이가 뭉치지 않아요', value: 'glute', axisEffect: { A02: 15 } },
      { emoji: '🦵', label: '허벅지 뒤쪽 (햄스트링)', desc: '', value: 'hamstring', axisEffect: { A02: 12 } },
      { emoji: '🤸', label: '복부·코어', desc: '배에 힘이 잘 안 들어가요', value: 'core', axisEffect: { A06: 15 } },
      { emoji: '🔙', label: '등', desc: '등 운동을 해도 등이 뭉치는 느낌이 없어요', value: 'back', axisEffect: { A06: 12 } },
      { emoji: '💪', label: '어깨 바깥쪽', desc: '', value: 'shoulder', axisEffect: { A06: 10 } },
      { emoji: '🦶', label: '종아리', desc: '유산소를 해도 종아리가 안 뭉쳐요', value: 'calf', axisEffect: { A02: 8 } },
      { emoji: '🫁', label: '가슴 (대흉근)', desc: '가슴 운동을 해도 가슴이 안 뭉쳐요', value: 'chest', axisEffect: { A06: 8 } },
      { emoji: '✅', label: '전체적으로 잘 느껴져요', desc: '', value: 'all_fine', axisEffect: {}, exclusive: true }
    ],
    saveAs: 'numb_body_parts'
  },
  {
    id: 'Q59', section: 'J', num: 59,
    axis: 'A06', weight: 1.5, role: 'score',
    question: '오래 앉아 있다가 일어날 때 불편한 부위가 있나요?',
    hint: '앉았다 일어날 때 느끼는 불편함은 자세 보상 패턴의 지도입니다.',
    type: 'MULTI_SELECT',
    maxSelect: 3,
    weight: 1.5,
    options: [
      { emoji: '🦵', label: '무릎이 찌릿하거나 아파요', desc: '', value: 'knee', ohaengEffect: { '수': 12 } },
      { emoji: '🔙', label: '허리가 뻣뻣하게 굳어있어요', desc: '', value: 'lower_back', axisEffect: { A06: 12 } },
      { emoji: '🍑', label: '엉덩이가 저리거나 눌린 느낌이에요', desc: '', value: 'hip', axisEffect: { A02: 10 } },
      { emoji: '🦶', label: '발목이나 종아리가 부어있어요', desc: '', value: 'ankle', axisEffect: { A02: 12 } },
      { emoji: '🤸', label: '어깨·목이 굳어있어요', desc: '', value: 'neck', axisEffect: { A06: 10 } },
      { emoji: '😊', label: '딱히 없어요', desc: '', value: 'none', axisEffect: {} }
    ],
    saveAs: 'sit_rise_pain'
  },
  {
    id: 'Q60', section: 'J', num: 60,
    axis: 'A02', weight: 1.3, role: 'score',
    question: '지금 눈을 감고 3초간 내 몸을 느껴보세요. 가장 먼저 느껴지는 감각은?',
    hint: '실제로 눈을 감아보세요! 몸의 자기인식 능력(고유수용감각)을 확인하는 질문입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '⚖️', label: '긴장되거나 뭉친 부위가 느껴져요', desc: '몸 감각 예민형', value: 'tension', axisEffect: {} },
      { emoji: '💧', label: '어딘가 붓거나 무거운 느낌이에요', desc: '순환 감각형', value: 'heavy', axisEffect: { A02: 12 } },
      { emoji: '🔥', label: '따뜻하거나 열감이 있는 곳이에요', desc: '열 감각형', value: 'heat', ohaengEffect: { '화': 10 } },
      { emoji: '🧊', label: '차갑거나 시린 곳이 있어요', desc: '냉 감각형', value: 'cold', axisEffect: { A02: 12 }, ohaengEffect: { '수': 10 }, feedbackKey: 'cold_body' },
      { emoji: '😶', label: '잘 모르겠어요, 별로 느껴지는 게 없어요', desc: '몸 감각 둔감형', value: 'numb', axisEffect: { A03: 15 } }
    ],
    saveAs: 'body_awareness'
  },
  {
    id: 'Q61', section: 'J', num: 61,
    axis: 'A06', weight: 1.3, role: 'score',
    question: '숨을 쉴 때 배가 움직이나요, 가슴이 움직이나요?',
    hint: '손을 배 위에 올리고 자연스럽게 숨을 쉬어보면 바로 알 수 있어요.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🫃', label: '배가 먼저 나와요 (복식호흡)', desc: '코어 활성화, 이상적인 호흡', value: 'belly', axisEffect: {} },
      { emoji: '🫁', label: '가슴만 올라가요 (흉식호흡)', desc: '코어 약화, 코르티솔 상승과 연관', value: 'chest', axisEffect: { A06: 10, A07: 15 }, feedbackKey: 'stress_high' },
      { emoji: '🤷', label: '잘 모르겠어요', desc: '호흡 인식 저하', value: 'unknown', axisEffect: { A06: 8 } }
    ],
    saveAs: 'breathing_type'
  },
  {
    id: 'Q62', section: 'J', num: 62,
    axis: 'A02', weight: 1.5, role: 'score',
    question: '다른 부위보다 덜 따뜻하거나 유독 시리고 차가운 부위가 있나요?',
    hint: '혈액 순환과 림프 흐름이 막힌 부위를 찾는 질문이에요. 해당하는 곳을 모두 골라주세요.',
    type: 'MULTI_SELECT',
    maxSelect: 4,
    weight: 1.5,
    options: [
      { emoji: '🖐️', label: '손·손가락', desc: '', value: 'hands', axisEffect: { A02: 12 }, ohaengEffect: { '수': 8 } },
      { emoji: '🦶', label: '발·발가락', desc: '', value: 'feet', axisEffect: { A02: 15 }, ohaengEffect: { '수': 10 } },
      { emoji: '🦵', label: '무릎 주변', desc: '', value: 'knee', axisEffect: { A02: 10 }, ohaengEffect: { '수': 8 } },
      { emoji: '🍑', label: '허벅지·엉덩이 바깥', desc: '', value: 'thigh', axisEffect: { A02: 15 } },
      { emoji: '🔙', label: '허리·골반', desc: '', value: 'lower_back', ohaengEffect: { '수': 10 } },
      { emoji: '🫃', label: '아랫배', desc: '', value: 'lower_belly', axisEffect: { A02: 10 } },
      { emoji: '😊', label: '유독 차가운 곳이 없어요', desc: '', value: 'none', axisEffect: {}, exclusive: true }
    ],
    saveAs: 'cold_body_parts'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 K · 움직임의 습관
  // ══════════════════════════════════════════════════════
  {
    id: 'Q63', section: 'K', num: 63,
    axis: 'A06', weight: 1.3, role: 'score',
    question: '지금 잠깐 걸어보고 답해주세요. 걸을 때 발끝이 어느 방향을 향하나요?',
    hint: '발끝 방향이 고관절·골반·무릎의 정렬 상태를 그대로 드러냅니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '⬆️', label: '발끝이 정면을 향해요 (11자)', desc: '자세 정렬 양호', value: 'straight', axisEffect: {} },
      { emoji: '↗️', label: '발끝이 바깥으로 벌어져요 (팔자)', desc: '고관절·골반 외회전 경향', value: 'out', axisEffect: { A02: 15, A06: 10 } },
      { emoji: '↖️', label: '발끝이 안쪽으로 모여요 (안짱)', desc: '무릎·고관절 내회전 경향', value: 'in', axisEffect: { A02: 12 } }
    ],
    saveAs: 'walking_foot_angle'
  },
  {
    id: 'Q64', section: 'K', num: 64,
    axis: 'A06', weight: 1.2, role: 'score',
    question: '오래 서 있을 때 {name}님의 체중은 어디에 더 실리나요?',
    hint: '눈을 감고 지금 서보세요. 어느 발에, 발의 어느 부분에 무게가 더 실리는지 느껴보세요.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🦶', label: '발앞쪽·엄지 방향에 더 실려요', desc: '전방 무게중심, 코어 약화와 연관', value: 'forefoot', axisEffect: { A06: 15 } },
      { emoji: '🔙', label: '발뒤꿈치에 더 실려요', desc: '후방 무게중심, 엉덩이 처짐 경향', value: 'heel', axisEffect: { A02: 12 } },
      { emoji: '➡️', label: '한쪽 발에만 더 실려요 (짝다리)', desc: '골반 틀어짐 경향', value: 'one_side', axisEffect: { A06: 18 } },
      { emoji: '⚖️', label: '양발에 균등하게 실려요', desc: '균형 양호', value: 'balanced', axisEffect: {} }
    ],
    saveAs: 'weight_distribution'
  },
  {
    id: 'Q65', section: 'K', num: 65,
    axis: 'A06', weight: 1.2, role: 'score',
    question: '스마트폰을 볼 때 주로 어떤 자세인가요?',
    hint: '현대인 체형 불균형의 70%가 스마트폰 자세에서 시작됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🤳', label: '폰을 눈 높이로 들어서 봐요', desc: '목·척추 부담 최소', value: 'eye_level', axisEffect: {} },
      { emoji: '⬇️', label: '고개를 숙여서 내려다봐요', desc: '거북목·일자목 경향', value: 'head_down', axisEffect: { A06: 15 } },
      { emoji: '🛋️', label: '누워서 한쪽으로 기대서 봐요', desc: '척추 측만 경향', value: 'lying', axisEffect: { A06: 22 } },
      { emoji: '🦒', label: '턱을 내밀고 앞으로 빼서 봐요', desc: '목 앞쪽 근육 약화', value: 'chin_forward', axisEffect: { A06: 18 } }
    ],
    saveAs: 'phone_posture'
  },
  {
    id: 'Q66', section: 'I', num: 66,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '식사 속도가 어느 편인가요?',
    hint: '식사 속도가 곧 포만감 신호의 속도입니다. 빠른 식사는 과식으로 이어집니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🐢', label: '천천히 꼭꼭 씹어 먹어요', desc: '20분 이상', value: 'slow', axisEffect: {} },
      { emoji: '🚶', label: '보통 정도예요', desc: '10~20분', value: 'normal', axisEffect: {} },
      { emoji: '🏃', label: '빠른 편이에요', desc: '10분 미만', value: 'fast', axisEffect: { A01: 8, A07: 12 } },
      { emoji: '⚡', label: '거의 씹지 않고 삼키는 편이에요', desc: '5분 미만, 위장 부담', value: 'very_fast', axisEffect: { A01: 15, A07: 20 } }
    ],
    saveAs: 'eating_speed'
  },
  {
    id: 'Q69', section: 'J', num: 69,
    axis: 'A04', weight: 1.3, role: 'score',
    question: '운동 다음 날, 몸이 어떻게 느껴지나요?',
    hint: '회복 패턴이 처방 운동 주기와 강도를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '💪', label: '뭉근한 근육통이 오고 개운해요', desc: '정상적 회복 반응', value: 'good_sore', axisEffect: {} },
      { emoji: '😫', label: '너무 아파서 이틀 이상 힘들어요', desc: '회복 속도 저하', value: 'too_sore', axisEffect: { A03: 12 } },
      { emoji: '😴', label: '운동 후 극도로 피곤해요', desc: '부신 기능 저하 가능성', value: 'exhausted', axisEffect: { A07: 15 }, feedbackKey: 'stress_high' },
      { emoji: '⚡', label: '거의 안 아파요, 금방 회복돼요', desc: '회복력 우수', value: 'fast_recovery', axisEffect: {} },
      { emoji: '🤷', label: '운동을 거의 안 해봐서 모르겠어요', desc: '', value: 'no_experience', axisEffect: {} }
    ],
    saveAs: 'exercise_recovery'
  },
  {
    id: 'Q72', section: 'K', num: 72,
    axis: 'A06', weight: 1.3, role: 'score',
    question: '의자에 앉을 때 자세가 주로 어떤가요?',
    hint: '앉는 자세가 하루 8시간 이상 체형을 조금씩 바꿔갑니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🪑', label: '등을 등받이에 붙이고 바르게 앉아요', desc: '척추 정렬 양호', value: 'upright', axisEffect: {} },
      { emoji: '📉', label: '엉덩이를 앞으로 빼고 구부정하게 앉아요', desc: '요추 후만 경향', value: 'slouch', axisEffect: { A06: 18 } },
      { emoji: '↗️', label: '한쪽으로 기울어져 앉아요', desc: '골반 비대칭 경향', value: 'tilted', axisEffect: { A06: 15 } },
      { emoji: '🦵', label: '다리를 꼬고 앉아요', desc: '골반 외회전 경향', value: 'crossed', axisEffect: { A02: 12, A06: 10 } }
    ],
    saveAs: 'sitting_posture'
  },
  {
    id: 'Q73', section: 'K', num: 73,
    axis: 'A04', weight: 1.3, role: 'score',
    question: '하루 평균 얼마나 움직이나요? (걷기 포함)',
    hint: '총 활동량이 기초대사량 계산의 핵심 변수입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🛋️', label: '거의 앉아서 생활해요 (3천 보 미만)', desc: '매우 낮은 활동량', value: 'sedentary', axisEffect: { A03: 20, A04: 15 } },
      { emoji: '🚶', label: '가벼운 이동 정도예요 (3천~6천 보)', desc: '낮은 활동량', value: 'light', axisEffect: { A03: 10 } },
      { emoji: '🏃', label: '어느 정도 걷고 활동해요 (6천~만 보)', desc: '보통 활동량', value: 'moderate', axisEffect: {} },
      { emoji: '⚡', label: '활발하게 움직이는 편이에요 (만 보 이상)', desc: '높은 활동량', value: 'active', axisEffect: {} }
    ],
    saveAs: 'daily_activity'
  },
  {
    id: 'Q74', section: 'K', num: 74,
    axis: 'A01', weight: 1.3, role: 'score',
    question: '팔을 머리 위로 들어올려 보세요. 어떤가요?',
    hint: '양팔을 귀 옆으로 올려보세요. 어깨·흉추 가동성을 확인하는 동작입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🙌', label: '양팔이 귀 옆에 딱 붙어요', desc: '어깨 가동성 정상', value: 'full_range', axisEffect: {} },
      { emoji: '↔️', label: '한쪽이 덜 올라가요', desc: '어깨 불균형 경향', value: 'asymmetric', axisEffect: { A06: 15 } },
      { emoji: '😖', label: '어깨가 아프거나 뻑뻑해서 잘 안 올라가요', desc: '어깨 가동성 저하', value: 'limited', axisEffect: { A06: 18 } },
      { emoji: '🔙', label: '올릴 때 허리가 과하게 젖혀져요', desc: '코어 약화·흉추 가동성 저하', value: 'arched_back', axisEffect: { A06: 25 } }
    ],
    saveAs: 'shoulder_mobility'
  },

  // ══════════════════════════════════════════════════════
  //  보완 문항
  // ══════════════════════════════════════════════════════
  {
    id: 'Q75', section: 'B', num: 75,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '배꼽 주변 살을 양손으로 집어보세요. 두께가 얼마나 되나요?',
    hint: '정말로 한번 집어보세요! 이 두께가 피하지방 vs 내장지방을 구별하는 단서입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🤏', label: '1cm 미만, 거의 안 집혀요', desc: '내장지방 우세 가능성', value: 'thin', axisEffect: { A01: 45 }, feedbackKey: 'hard_fat' },
      { emoji: '✌️', label: '1~3cm 정도 집혀요', desc: '혼합형', value: 'medium', axisEffect: { A02: 10, A04: 10 } },
      { emoji: '🖐️', label: '3cm 이상 두껍게 집혀요', desc: '피하지방 우세 가능성', value: 'thick', axisEffect: { A02: 25 }, feedbackKey: 'soft_fat' }
    ],
    saveAs: 'belly_fat_thickness'
  },
  {
    id: 'Q76', section: 'D', num: 76,
    axis: 'A07', weight: 1.5, role: 'score',
    question: '커피·카페인 음료를 하루 얼마나 마시나요?',
    hint: '카페인이 코르티솔 수치를 높이고, 그게 복부에 지방을 쌓습니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '🚫', label: '거의 안 마셔요', desc: '', value: 'none', axisEffect: {} },
      { emoji: '☕', label: '하루 1~2잔', desc: '', value: 'moderate', axisEffect: {} },
      { emoji: '☕☕', label: '하루 3~4잔', desc: '카페인 과다 경향', value: 'high', axisEffect: { A07: 10 } },
      { emoji: '⚡', label: '하루 5잔 이상 (에너지드링크 포함)', desc: '카페인 의존 경향', value: 'very_high', axisEffect: { A07: 20 }, feedbackKey: 'stress_high' }
    ],
    saveAs: 'caffeine_intake'
  },
  {
    id: 'Q77', section: 'E', num: 77,
    axis: 'A05', weight: 1.3, role: 'score',
    question: '평소 장 상태는 어떤가요?',
    hint: '장 건강이 복부 지방 축적, 면역력, 체중 전반과 직접 연결됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '✅', label: '배변이 규칙적이고 편해요', desc: '', value: 'regular', axisEffect: {} },
      { emoji: '🔒', label: '변비가 자주 있어요 (3일 이상)', desc: '', value: 'constipated', axisEffect: { A06: 12 }, ohaengEffect: { '토': 12 } },
      { emoji: '💨', label: '자주 묽거나 과민성 장 증상이 있어요', desc: '', value: 'ibs', axisEffect: { A06: 10 }, ohaengEffect: { '토': 10 } },
      { emoji: '🌀', label: '변비와 설사가 번갈아 와요', desc: '', value: 'alternating', axisEffect: { A06: 15 }, ohaengEffect: { '토': 15 } }
    ],
    saveAs: 'bowel_health'
  },
  {
    id: 'Q78', section: 'A', num: 78,
    axis: 'A01', weight: 1.5, role: 'score',
    question: '살이 찌기 시작할 때 어느 부위에 제일 먼저 티가 나나요?',
    hint: '지방이 쌓이는 순서가 바디코드 분류의 결정적 단서입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🫃', label: '배·복부가 제일 먼저 나와요', desc: '', value: 'belly_first', axisEffect: { A01: 35 }, feedbackKey: 'belly_fat' },
      { emoji: '🍑', label: '허벅지·엉덩이가 먼저 커져요', desc: '', value: 'hip_first', axisEffect: { A02: 25 } },
      { emoji: '💪', label: '어깨·팔뚝·등이 먼저 두꺼워져요', desc: '', value: 'upper_first', axisEffect: { A06: 22 } },
      { emoji: '🌊', label: '전신에 골고루 쪄요', desc: '', value: 'all_over', axisEffect: { A03: 12, A04: 15 } },
      { emoji: '💧', label: '얼굴·목·손발이 먼저 붓는 것 같아요', desc: '', value: 'face_first', axisEffect: { A02: 25 }, feedbackKey: 'puffy' }
    ],
    saveAs: 'fat_gain_order'
  },
  {
    id: 'Q79', section: 'C', num: 79,
    axis: 'A08', weight: 1.3, role: 'score',
    question: '지금까지 최대로 뺐던 체중과, 그 후 요요로 돌아온 폭은요?',
    hint: '요요 폭이 처방의 핵심 강도를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '✨', label: '요요 경험이 없어요', desc: '', value: 'no_yoyo', axisEffect: {} },
      { emoji: '📉', label: '5kg 이하 빠지고 5kg 이하 돌아왔어요', desc: '소폭 요요', value: 'small_yoyo', axisEffect: { A08: 10 } },
      { emoji: '📊', label: '5~10kg 빠지고 거의 다 돌아왔어요', desc: '중간 요요', value: 'medium_yoyo', axisEffect: { A08: 20 }, feedbackKey: 'yoyo' },
      { emoji: '🌊', label: '10kg 이상 빠졌다 그 이상 돌아온 적 있어요', desc: '대사 정체 경향', value: 'large_yoyo', axisEffect: { A03: 20, A08: 35 }, feedbackKey: 'yoyo' }
    ],
    saveAs: 'yoyo_magnitude'
  },
  // ══════════════════════════════════════════════════════
  //  섹션 L · 내 몸의 안전 조건 (알레르기 / 피부 / 갱년기 / 병적요소)
  // ══════════════════════════════════════════════════════
  {
    id: 'Q_ALLERGY', section: 'L', num: 81,
    axis: 'A05', weight: 1.0, role: 'signal',
    question: '특정 음식을 먹었을 때 피부 트러블·두드러기·소화 불편이 생긴 적 있나요?',
    hint: '결과지 식단 가이드에서 해당 식품이 자동으로 제외됩니다. 선택하지 않아도 됩니다.',
    type: 'MULTI_SELECT',
    maxSelect: 8,
    weight: 0,
    feedbackKey: 'allergy_detected',
    options: [
      { emoji: '🍗', label: '닭가슴살·가금류', desc: '고단백 식품', value: 'chicken',
        axisEffect: {} },
      { emoji: '🥚', label: '달걀', desc: '흰자·노른자 포함', value: 'egg',
        axisEffect: {} },
      { emoji: '🥛', label: '유제품', desc: '우유·치즈·요거트', value: 'dairy',
        axisEffect: {} },
      { emoji: '🥜', label: '견과류', desc: '아몬드·땅콩·호두 등', value: 'nuts',
        axisEffect: {} },
      { emoji: '🦐', label: '해산물·생선', desc: '새우·고등어·조개 등', value: 'seafood',
        axisEffect: {} },
      { emoji: '🌾', label: '밀·글루텐', desc: '빵·파스타·밀가루', value: 'gluten',
        axisEffect: {} },
      { emoji: '🫘', label: '콩류', desc: '두부·두유·콩단백', value: 'legume',
        axisEffect: {} },
      { emoji: '🌶️', label: '자극적인 음식', desc: '맵고 짠 음식 과민 반응', value: 'spicy',
        axisEffect: {} },
      { emoji: '✅', label: '반응 없어요', desc: '해당 없음', value: 'none',
        exclusive: true, axisEffect: {} }
    ],
    saveAs: 'food_allergy'
  },
  {
    id: 'Q_SKIN', section: 'L', num: 82,
    axis: 'A03', weight: 1.0, role: 'signal',
    question: '식단을 갑자기 바꾸거나 단백질을 많이 먹을 때 피부에 어떤 변화가 생기나요?',
    hint: '피부 반응은 장 건강·호르몬 상태와 직결됩니다.',
    type: 'SINGLE_SELECT',
    weight: 0.5,
    feedbackKey: 'skin_reaction',
    options: [
      { emoji: '😊', label: '피부 변화가 거의 없어요', desc: '', value: 'no_reaction',
        axisEffect: {} },
      { emoji: '🔴', label: '여드름·뾰루지가 올라와요', desc: '안드로겐·인슐린 과잉 신호',
        value: 'acne', axisEffect: { A01: 8, A07: 6 }, feedbackKey: 'skin_acne' },
      { emoji: '🌊', label: '얼굴·눈 주변이 붓고 칙칙해져요', desc: '림프·순환 정체',
        value: 'puffiness', axisEffect: { A02: 12 }, feedbackKey: 'skin_puffy' },
      { emoji: '🔥', label: '피부가 가렵거나 발진이 생겨요', desc: '음식 과민 반응 가능성',
        value: 'rash', axisEffect: {}, feedbackKey: 'skin_rash' },
      { emoji: '🏜️', label: '피부가 건조해지고 각질이 생겨요', desc: '필수지방산·수분 부족',
        value: 'dry', axisEffect: { A03: 5 } }
    ],
    saveAs: 'skin_reaction'
  },
  {
    id: 'Q_MENOPAUSE', section: 'L', num: 83,
    axis: 'A03', weight: 1.5, role: 'gate',
    question: '갱년기 증상이 있거나 갱년기 시기에 해당하시나요?',
    hint: '갱년기에는 일반 다이어트 공식이 맞지 않습니다. 맞춤 프로토콜이 별도로 적용됩니다.',
    type: 'SINGLE_SELECT',
    showIf: { field: 'gender', value: 'female' },
    weight: 1.5,
    feedbackKey: 'menopause_detected',
    options: [
      { emoji: '🌱', label: '해당 없어요 (남성 또는 40대 이전)', desc: '',
        value: 'not_applicable', axisEffect: {} },
      { emoji: '🌸', label: '갱년기 전기 (40대 중반~50초 / 생리 불규칙)', desc: '호르몬 변화 시작',
        value: 'peri', axisEffect: { A03: 10, A07: 15 }, feedbackKey: 'menopause_peri' },
      { emoji: '🍂', label: '갱년기 중기 (폐경 전후 / 홍조·수면 장애)', desc: '에스트로겐 급감기',
        value: 'meno', axisEffect: { A02: 10, A03: 15, A07: 20 }, feedbackKey: 'menopause_meno' },
      { emoji: '❄️', label: '폐경 완료 (2년 이상 / 생리 완전 중단)', desc: '대사 재설계 필요',
        value: 'post', axisEffect: { A02: 15, A03: 20, A07: 25 }, feedbackKey: 'menopause_post' },
      { emoji: '💊', label: '호르몬 치료(HRT) 중이에요', desc: '의료진 협진 권고',
        value: 'hrt', axisEffect: { A03: 12, A07: 18 }, feedbackKey: 'menopause_hrt' }
    ],
    saveAs: 'menopause_status'
  },
  {
    id: 'Q_MEDICAL', section: 'L', num: 84,
    axis: 'A09', weight: 1.0, role: 'gate',
    question: '현재 진단받았거나 관리 중인 건강 상태가 있나요?',
    hint: '해당 건강 상태에 맞는 주의사항이 결과지에 자동으로 반영됩니다.',
    type: 'MULTI_SELECT',
    maxSelect: 10,
    weight: 1.0,
    feedbackKey: 'medical_detected',
    options: [
      { emoji: '🩸', label: '당뇨 / 혈당 조절 이상', desc: '공복혈당 100 이상 포함', value: 'diabetes',
        axisEffect: { A01: 35 }, feedbackKey: 'medical_diabetes' },
      { emoji: '💓', label: '고혈압', desc: '수축기 140 이상 또는 약 복용 중', value: 'hypertension',
        axisEffect: { A01: 15, A07: 12 }, feedbackKey: 'medical_hypertension' },
      { emoji: '🦋', label: '갑상선 저하증', desc: '갑상선 기능 저하 / 약 복용 중', value: 'hypothyroid',
        axisEffect: { A02: 15, A03: 25 }, feedbackKey: 'medical_hypothyroid' },
      { emoji: '🦴', label: '디스크 / 척추 질환', desc: '요추·경추 디스크 포함', value: 'disc',
        axisEffect: { A06: 18 }, feedbackKey: 'medical_disc' },
      { emoji: '🎗️', label: '암 완치 후 관리 중', desc: '치료 종료 후 회복기', value: 'cancer_recovery',
        axisEffect: { A03: 20, A04: 15 }, feedbackKey: 'medical_cancer' },
      { emoji: '🔥', label: '류마티스 / 자가면역 질환', desc: '만성 염증 상태', value: 'rheumatoid',
        axisEffect: { A02: 20, A07: 15 }, feedbackKey: 'medical_rheumatoid' },
      { emoji: '🌸', label: 'PCOS (다낭성 난소 증후군)', desc: '인슐린 저항성 연관', value: 'pcos',
        axisEffect: { A01: 22, A02: 12, A07: 18 }, feedbackKey: 'medical_pcos' },
      { emoji: '🫀', label: '지방간', desc: '비알코올성 지방간 포함', value: 'fatty_liver',
        axisEffect: { A01: 35 }, feedbackKey: 'medical_fattyliver' },
      { emoji: '💊', label: '스테로이드 / 항우울제 장기 복용', desc: '체중 증가 부작용 있는 약물',
        value: 'steroid', axisEffect: { A01: 15, A03: 12 }, feedbackKey: 'medical_steroid' },
      { emoji: '✅', label: '해당 없어요', desc: '', value: 'none',
        exclusive: true, axisEffect: {} }
    ],
    saveAs: 'medical_conditions'
  },


  // ══════════════════════════════════════════════════════
  //  18개 신규 특수문항 (Plan A 통합 — 10축 근거 시스템)
  // ══════════════════════════════════════════════════════

  // ── A03 호르몬·대사 축 ──────────────────────────────
  {
    id: 'Q_THYROID', section: 'L', num: 85,
    axis: 'A03', weight: 1.5, role: 'score',
    question: '평소 추위를 잘 타거나 손발이 유독 차가운 편인가요?',
    hint: '갑상선 기능과 기초대사량의 직접적인 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🧊', label: '항상 추워요·손발이 항상 차가워요', desc: '여름에도 긴팔 입어요',
        value: 'always_cold', axisEffect: { A02: 10, A03: 20 } },
      { emoji: '🌡️', label: '추운 편이에요', desc: '다른 사람보다 예민한 편',
        value: 'cold', axisEffect: { A02: 6, A03: 12 } },
      { emoji: '😊', label: '보통이에요', desc: '크게 신경 안 써요',
        value: 'normal', axisEffect: {} },
      { emoji: '🔥', label: '더위를 더 많이 타요', desc: '땀이 잘 나는 편',
        value: 'warm', axisEffect: { A01: 8 } }
    ],
    saveAs: 'thyroid_signal'
  },
  {
    id: 'Q_INSULIN', section: 'L', num: 86,
    axis: 'A03', weight: 1.5, role: 'signal',
    question: '밥을 먹고 나서 30분~1시간 사이에 갑자기 졸리거나 힘이 빠지는 경험이 있나요?',
    hint: '식후 혈당 급등락 — 인슐린 저항성의 대표 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '😴', label: '거의 매일 있어요', desc: '밥 먹으면 졸음이 쏟아져요',
        value: 'always', axisEffect: { A01: 30 } },
      { emoji: '🥱', label: '종종 있어요', desc: '특히 탄수화물 많이 먹을 때',
        value: 'often', axisEffect: { A01: 18 } },
      { emoji: '🤔', label: '가끔 있어요', desc: '과식했을 때 정도',
        value: 'sometimes', axisEffect: { A01: 6 } },
      { emoji: '😊', label: '거의 없어요', desc: '식후에도 괜찮은 편',
        value: 'rarely', axisEffect: {} }
    ],
    saveAs: 'insulin_signal'
  },
  {
    id: 'Q_CYCLE', section: 'L', num: 87,
    axis: 'A03', weight: 1.3, role: 'gate',
    showIf: { field: 'gender', values: ['female', 'mtf', 'nonbinary'] },
    question: '생리주기가 규칙적인가요?',
    hint: '호르몬 균형과 다이어트 효율이 직접 연결됩니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '📅', label: '규칙적이에요 (28~35일)',    desc: '거의 날짜가 일정해요',
        value: 'regular', axisEffect: {} },
      { emoji: '〰️', label: '조금 불규칙해요 (±7일)',   desc: '가끔 앞당겨지거나 늦어져요',
        value: 'slightly_irregular', axisEffect: { A03: 5, A07: 8 } },
      { emoji: '⚡', label: '많이 불규칙해요 (±2주 이상)', desc: '주기를 예측하기 어려워요',
        value: 'irregular', axisEffect: { A02: 8, A03: 12, A07: 18 } },
      { emoji: '⏸️', label: '거의 없거나 없어요',       desc: '빈발·무월경 상태',
        value: 'absent', axisEffect: { A02: 12, A03: 18, A07: 25 } },
      { emoji: '🚫', label: '해당 없어요',               desc: '폐경 완료 또는 남성',
        value: 'not_applicable', axisEffect: {} }
    ],
    saveAs: 'cycle_status'
  },
  {
    id: 'Q_META', section: 'L', num: 88,
    axis: 'A03', weight: 1.3, role: 'score',
    question: '최근 6개월 내에 특별한 이유 없이 체중이 늘었나요?',
    hint: '먹은 것과 운동이 같은데 살이 찐다면 대사 문제의 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '📈', label: '네, 3kg 이상 늘었어요',    desc: '아무것도 안 했는데',
        value: 'gained_3plus', axisEffect: { A03: 20, A07: 10 } },
      { emoji: '↗️', label: '1~3kg 정도 늘었어요',      desc: '살짝 불어난 느낌',
        value: 'gained_1to3', axisEffect: { A03: 10, A07: 5 } },
      { emoji: '➡️', label: '유지되고 있어요',           desc: '크게 변화 없어요',
        value: 'stable', axisEffect: {} },
      { emoji: '📉', label: '오히려 줄었어요',           desc: '자연스럽게 빠졌어요',
        value: 'decreased', axisEffect: {} }
    ],
    saveAs: 'recent_weight_change'
  },

  // ── A04 근육·활동 축 ──────────────────────────────
  {
    id: 'Q_SKINNYFAT', section: 'L', num: 89,
    axis: 'A04', weight: 1.5, role: 'score',
    question: '체중계 숫자는 정상인데 옷이 잘 안 맞거나 체형이 이상한 느낌이 드나요?',
    hint: '마른비만(근감소성 비만) — 체중보다 체성분이 중요한 케이스입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🫣', label: '네, 체중은 괜찮은데 체형이 맘에 안 들어요', desc: '숫자보다 거울이 더 신경 쓰여요',
        value: 'yes', axisEffect: { A03: 10, A04: 25 } },
      { emoji: '🤔', label: '조금 그런 편이에요',                        desc: '부분적으로 그런 것 같아요',
        value: 'somewhat', axisEffect: { A04: 12 } },
      { emoji: '😊', label: '아니요, 체형도 괜찮아요',                   desc: '체중이랑 체형이 비슷해요',
        value: 'no', axisEffect: {} }
    ],
    saveAs: 'skinnyfat_flag'
  },
  {
    id: 'Q_LEGPOWER', section: 'L', num: 90,
    axis: 'A04', weight: 1.3, role: 'score',
    question: '계단을 오르거나 언덕을 걸을 때 다리에 힘이 부족하다고 느끼나요?',
    hint: '하체 근력은 기초대사량과 직결됩니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '😮‍💨', label: '네, 금방 지치고 힘들어요',   desc: '계단 몇 개만 올라도 숨이 차요',
        value: 'weak', axisEffect: { A03: 10, A04: 15 } },
      { emoji: '😅', label: '조금 힘들긴 해요',              desc: '남들보다 더 힘든 것 같아요',
        value: 'somewhat_weak', axisEffect: { A03: 5, A04: 8 } },
      { emoji: '😊', label: '보통이에요',                    desc: '크게 문제 없어요',
        value: 'normal', axisEffect: {} },
      { emoji: '💪', label: '전혀 힘들지 않아요',            desc: '운동을 즐기는 편이에요',
        value: 'strong', axisEffect: {} }
    ],
    saveAs: 'leg_power'
  },
  {
    id: 'Q_MUSCLE', section: 'L', num: 91,
    axis: 'A04', weight: 1.2, role: 'score',
    question: '근력 운동을 하면 근육이 잘 붙는 편인가요?',
    hint: '근육 합성 반응성은 체형 교정 전략에 영향을 줍니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '⚡', label: '네, 운동하면 금방 몸이 바뀌어요',  desc: '근육이 잘 붙는 편',
        value: 'good', axisEffect: {} },
      { emoji: '🤔', label: '보통이에요',                        desc: '꾸준히 하면 조금씩 변해요',
        value: 'average', axisEffect: {} },
      { emoji: '😔', label: '아무리 해도 잘 안 붙어요',         desc: '운동해도 몸이 안 바뀌는 느낌',
        value: 'poor', axisEffect: { A03: 15, A04: 10 } },
      { emoji: '🚫', label: '운동을 거의 안 해서 모르겠어요',   desc: '운동 경험이 거의 없어요',
        value: 'unknown', axisEffect: { A04: 8 } }
    ],
    saveAs: 'muscle_response'
  },

  // ── A05 소화·흡수·염증 축 ────────────────────────
  {
    id: 'Q_GAS', section: 'L', num: 92,
    axis: 'A05', weight: 1.3, role: 'score',
    question: '식사 후 배에 가스가 많이 차거나 복부 팽만감이 있나요?',
    hint: '장내 환경이 영양 흡수와 체중 조절에 직접 영향을 줍니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🫧', label: '매일 있어요',     desc: '거의 항상 배가 빵빵해요',
        value: 'always', axisEffect: { A02: 8, A06: 15 } },
      { emoji: '😮‍💨', label: '자주 있어요',    desc: '식사 후에 특히 심해요',
        value: 'often', axisEffect: { A02: 5, A06: 10 } },
      { emoji: '🤔', label: '가끔 있어요',     desc: '특정 음식 먹을 때',
        value: 'sometimes', axisEffect: { A06: 5 } },
      { emoji: '😊', label: '거의 없어요',     desc: '소화는 잘 되는 편',
        value: 'rarely', axisEffect: {} }
    ],
    saveAs: 'bloating_level'
  },
  {
    id: 'Q_INTOL', section: 'L', num: 93,
    axis: 'A05', weight: 1.3, role: 'signal',
    question: '특정 음식을 먹은 후 복통·설사·가스가 심하게 생긴 적 있나요?',
    hint: '음식 불내증은 장 투과성 문제와 연결됩니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '⚠️', label: '네, 특정 음식이 확실히 있어요', desc: '먹으면 바로 반응이 와요',
        value: 'yes_clear', axisEffect: { A02: 12, A06: 10 } },
      { emoji: '🤔', label: '아마도 있는 것 같아요',         desc: '확신은 없지만 의심돼요',
        value: 'maybe', axisEffect: { A02: 6, A06: 5 } },
      { emoji: '😊', label: '아니요, 뭐든 잘 먹어요',       desc: '소화 트러블이 거의 없어요',
        value: 'no', axisEffect: {} }
    ],
    saveAs: 'food_intolerance'
  },

  // ── A07 스트레스·회복 축 ─────────────────────────
  {
    id: 'Q_WAKE', section: 'L', num: 94,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '자다가 중간에 깨거나 새벽에 눈이 뜨이는 일이 잦나요?',
    hint: '수면 중 각성은 코르티솔 패턴 이상의 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '😳', label: '거의 매일 깨요',    desc: '새벽 2~4시에 눈이 떠져요',
        value: 'always', axisEffect: { A03: 8, A07: 15 } },
      { emoji: '😴', label: '자주 깨요',         desc: '주 3~4회 이상',
        value: 'often', axisEffect: { A03: 5, A07: 10 } },
      { emoji: '😐', label: '가끔 깨요',         desc: '스트레스 심할 때',
        value: 'sometimes', axisEffect: { A07: 5 } },
      { emoji: '😊', label: '잘 안 깨요',        desc: '한번 자면 잘 자는 편',
        value: 'rarely', axisEffect: {} }
    ],
    saveAs: 'sleep_wake'
  },
  {
    id: 'Q_FATIGUE', section: 'L', num: 95,
    axis: 'A07', weight: 1.3, role: 'score',
    question: '충분히 잔 것 같은데도 피로가 만성적으로 남아있나요?',
    hint: '만성피로는 부신 피로와 대사 저하의 신호입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🪫', label: '항상 피곤해요',        desc: '자고 일어나도 개운하지 않아요',
        value: 'always', axisEffect: { A03: 10, A07: 20 } },
      { emoji: '😩', label: '자주 피곤해요',        desc: '오후만 되면 기운이 없어요',
        value: 'often', axisEffect: { A03: 6, A07: 12 } },
      { emoji: '😐', label: '가끔 피곤해요',        desc: '바쁠 때 특히 심해요',
        value: 'sometimes', axisEffect: { A07: 6 } },
      { emoji: '😊', label: '에너지가 충분해요',    desc: '피로감이 거의 없어요',
        value: 'energetic', axisEffect: {} }
    ],
    saveAs: 'fatigue_level'
  },

  // ── A09 성인병 리스크 축 ─────────────────────────
  {
    id: 'Q_GLUCOSE', section: 'L', num: 96,
    axis: 'A09', weight: 1.2, role: 'signal',
    question: '공복혈당 수치를 알고 계신가요? 또는 혈당 관련 증상이 있나요?',
    hint: '혈당 신호는 체지방 저장 패턴을 결정합니다.',
    type: 'MULTI_SELECT',
    maxSelect: 5,
    options: [
      { emoji: '🩸', label: '공복혈당 100~125mg (전당뇨)', desc: '관리가 필요한 구간',
        value: 'prediabetes', axisEffect: { A01: 32 } },
      { emoji: '🔴', label: '공복혈당 126 이상 (당뇨)',    desc: '진단받았거나 의심 중',
        value: 'diabetes', axisEffect: { A01: 50 } },
      { emoji: '🍭', label: '단것 먹으면 금방 배고파요',   desc: '혈당 급등락 패턴',
        value: 'sugar_craving', axisEffect: { A01: 23 } },
      { emoji: '💫', label: '식사 거르면 어지럼증·손떨림', desc: '저혈당 반응 의심',
        value: 'hypoglycemia', axisEffect: { A01: 12 } },
      { emoji: '✅', label: '해당 없어요',                  desc: '혈당은 정상이에요',
        value: 'none', exclusive: true, axisEffect: {} }
    ],
    saveAs: 'glucose_signals'
  },
  {
    id: 'Q_TOXIN', section: 'L', num: 97,
    axis: 'A09', weight: 1.0, role: 'signal',
    question: '다음 중 해당되는 것이 있나요?',
    hint: '독소·위험 습관은 간 해독 능력과 체지방 저장에 영향을 줍니다.',
    type: 'MULTI_SELECT',
    maxSelect: 6,
    options: [
      { emoji: '🍺', label: '음주 주 3회 이상',          desc: '한 번에 2잔 이상',
        value: 'alcohol', axisEffect: { A01: 15, A07: 10 } },
      { emoji: '🚬', label: '흡연 중',                   desc: '전자담배 포함',
        value: 'smoking', axisEffect: { A02: 8, A07: 10 } },
      { emoji: '😴', label: '수면 5시간 이하 지속',      desc: '만성 수면 부족',
        value: 'sleep_deprivation', axisEffect: { A03: 10, A07: 15 } },
      { emoji: '💊', label: '체중 증가 부작용 약물 복용', desc: '스테로이드·항우울제 등',
        value: 'medication', axisEffect: { A01: 8, A03: 12 } },
      { emoji: '🏭', label: '화학물질·환경독소 노출',    desc: '직업적 노출 포함',
        value: 'chemical_exposure', axisEffect: { A07: 10 } },
      { emoji: '✅', label: '해당 없어요',                desc: '',
        value: 'none', exclusive: true, axisEffect: {} }
    ],
    saveAs: 'toxin_factors'
  },
  {
    id: 'Q_SODA', section: 'L', num: 98,
    axis: 'A09', weight: 1.2, role: 'score',
    question: '하루에 가당음료(탄산음료·과일주스·믹스커피·에너지드링크)를 얼마나 마시나요?',
    hint: '가당음료는 액체 칼로리이자 혈당 스파이크의 주범입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '🥤', label: '하루 2캔(500ml) 이상', desc: '거의 습관처럼 마셔요',
        value: 'heavy', axisEffect: { A01: 15, A07: 10 } },
      { emoji: '🧃', label: '하루 1캔 정도',        desc: '매일 한 번씩은 마셔요',
        value: 'moderate', axisEffect: { A01: 10, A07: 5 } },
      { emoji: '🍵', label: '가끔 (주 1~3회)',      desc: '자주는 아니에요',
        value: 'occasional', axisEffect: { A01: 5 } },
      { emoji: '💧', label: '거의 안 마셔요',       desc: '물이나 무가당 음료만',
        value: 'rarely', axisEffect: {} }
    ],
    saveAs: 'soda_intake'
  },


  // ── A09 허리둘레 측정 (성인병 리스크 핵심 지표) ──
  {
    id: 'Q_WAIST', section: 'C', num: 99,
    axis: 'A09', weight: 2.0, role: 'score',
    question: '허리둘레를 알고 계신가요? (배꼽 위 가장 좁은 부위)',
    hint: '허리둘레는 내장지방 위험도의 가장 정확한 단일 지표입니다.',
    type: 'SINGLE_SELECT',
    options: [
      { emoji: '✅', label: '정상이에요 (남 85cm↓ / 여 80cm↓)',
        desc: '복부비만 기준 이하', value: 'normal', axisEffect: {} },
      { emoji: '⚠️', label: '경계예요 (남 85~90cm / 여 80~85cm)',
        desc: '주의가 필요한 구간', value: 'borderline',
        axisEffect: { A01: 15, A09: 12 } },
      { emoji: '🔴', label: '높아요 (남 90cm↑ / 여 85cm↑)',
        desc: '복부비만 기준 초과', value: 'high',
        axisEffect: { A01: 30, A09: 25 } },
      { emoji: '🤷', label: '모르겠어요',
        desc: '측정해본 적 없어요', value: 'unknown', axisEffect: {} },
    ],
    saveAs: 'waist_circumference'
  },

  // ══════════════════════════════════════════════════════
  //  섹션 H · 마무리 드림 질문
  // ══════════════════════════════════════════════════════
  {
    id: 'Q80', section: 'H', num: 80,
    axis: 'A08', weight: 0.8, role: 'signal',
    question: '마지막으로 딱 하나만요. 6개월 후 {name}님이 가장 하고 싶은 것은?',
    hint: '체중이 아닌, 그 몸으로 하고 싶은 일. 이 한 문장이 결과지 마지막 페이지를 완성합니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '👗', label: '그동안 못 입었던 옷을 입고 싶어요', desc: '', value: 'clothes' },
      { emoji: '🏖️', label: '수영복·비키니를 입고 여행 가고 싶어요', desc: '', value: 'travel' },
      { emoji: '📸', label: '사진 찍을 때 당당하고 싶어요', desc: '', value: 'photo' },
      { emoji: '🏃', label: '가볍게 뛰고 계단을 거뜬히 오르고 싶어요', desc: '', value: 'active' },
      { emoji: '🩺', label: '건강 수치가 정상으로 돌아오고 싶어요', desc: '', value: 'health' },
      { emoji: '💑', label: '사랑하는 사람에게 더 매력적으로 보이고 싶어요', desc: '', value: 'love' }
    ],
    saveAs: 'dream_action'
  }
];

// ═══════════════════════════════════════════════════════════
//  SlimMind 채점 엔진 v4.0 — axisEffect 직접 채점 방식
// ═══════════════════════════════════════════════════════════

// 유형명 16개 매핑 테이블 (1순위+2순위 축 조합)
const TYPE_NAME_TABLE = {
  'A01+A02': { name: '복부순환저하형',   emoji: '🔴', desc: '내장지방이 쌓이면서 림프순환이 막히는 복합 패턴' },
  'A01+A03': { name: '인슐린대사형',     emoji: '🟠', desc: '혈당 조절 이상이 복부에 지방을 축적시키는 패턴' },
  'A01+A07': { name: '코르티솔복부형',   emoji: '🔶', desc: '스트레스 호르몬이 복부지방을 축적시키는 패턴' },
  'A01+A08': { name: '감정섭식복부형',   emoji: '🟡', desc: '감정적 과식이 복부비만으로 이어지는 패턴' },
  'A02+A01': { name: '하체림프형',       emoji: '💜', desc: '림프순환 저하로 하체에 지방과 부종이 쌓이는 패턴' },
  'A02+A07': { name: '냉증부종형',       emoji: '🔵', desc: '몸의 냉증과 스트레스가 결합된 부종·셀룰라이트 패턴' },
  'A03+A01': { name: '호르몬대사형',     emoji: '🌸', desc: '호르몬 불균형이 체중 조절을 방해하는 패턴' },
  'A03+A07': { name: '부신피로형',       emoji: '🟤', desc: '만성 스트레스로 부신이 지쳐 대사가 멈춘 패턴' },
  'A04+A01': { name: '근감소비만형',     emoji: '⚪', desc: '근육이 줄면서 지방이 늘어나는 마른비만 패턴' },
  'A04+A07': { name: '대사정체형',       emoji: '🔘', desc: '기초대사량이 낮아져 아무리 해도 안 빠지는 패턴' },
  'A06+A01': { name: '체형불균형지방형', emoji: '🦴', desc: '골반·척추 불균형이 특정 부위에 지방을 쌓는 패턴' },
  'A06+A02': { name: '자세순환저하형',   emoji: '💛', desc: '잘못된 자세가 순환을 막아 부종과 체형 변형을 만드는 패턴' },
  'A07+A01': { name: '스트레스복부형',   emoji: '🌑', desc: '코르티솔 과잉이 복부를 중심으로 지방을 쌓는 패턴' },
  'A07+A08': { name: '번아웃식이형',     emoji: '🫤', desc: '번아웃과 감정 식이가 결합된 패턴' },
  'A08+A07': { name: '감정식이형',       emoji: '🧠', desc: '심리적 스트레스가 식이 행동을 통제하는 패턴' },
  'A08+A10': { name: '기질식이형',       emoji: '🔮', desc: '타고난 기질과 식이 성향이 결합된 패턴' },
};

// 동적 유형명 생성 (테이블 미등록 조합 fallback)
function generateTypeName(topAxes) {
  if (!topAxes || topAxes.length === 0) return { name: '복합형', emoji: '🌀', desc: '다양한 원인이 복합적으로 작용하는 패턴' };
  
  const primary   = topAxes[0]?.axis || 'A01';
  const secondary = topAxes[1]?.axis || 'A07';
  const key = `${primary}+${secondary}`;
  
  if (TYPE_NAME_TABLE[key]) return TYPE_NAME_TABLE[key];
  
  // fallback: 1순위 축 이름 기반 동적 생성
  const axisNames = {
    A01: '지방저장', A02: '순환부종', A03: '호르몬대사', A04: '근육활동',
    A05: '소화염증', A06: '체형정렬', A07: '스트레스회복', A08: '심리식이',
    A09: '성인병리스크', A10: '기질성향'
  };
  const p = axisNames[primary] || '복합';
  const s = axisNames[secondary] || '';
  return { name: `${p}·${s}형`, emoji: '🌀', desc: `${p} 문제가 주원인인 복합 패턴` };
}

// 도파민 기질 카드 분류
function getDopamineType(answers) {
  const mbti = answers['Q42']?.toUpperCase() || '';
  const motivation = answers['Q38'] || '';
  const compliance = answers['Q37b'] || answers['Q38'] || '';
  
  if (mbti.includes('E') && mbti.includes('P')) return 'explorer';   // 탐색형
  if (mbti.includes('I') && mbti.includes('J')) return 'stable';     // 안정형
  if (motivation === 'achievement' || mbti.includes('J')) return 'achiever'; // 성취형
  if (motivation === 'health_scare') return 'survivor';              // 생존형
  return 'achiever';
}

// 상위 3개 축 추출 유틸
function getTop3Axes(axisScores) {
  return Object.entries(axisScores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([axis, score]) => ({ axis, score }));
}

// ── 신규 채점 함수: calculateAxisScores ──────────────────────
function calculateAxisScores(answers) {
  // 10축 점수 초기화
  const axisScores = { A01:0, A02:0, A03:0, A04:0, A05:0, A06:0, A07:0, A08:0, A09:0, A10:0 };
  const ohaengScores = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

  QUESTIONS.forEach(q => {
    const answer = answers[q.id];
    if (!answer) return;
    const weight = q.weight || 1.0;

    if (q.type === 'SINGLE_SELECT') {
      const opt = q.options?.find(o => o.value === answer);
      if (opt?.axisEffect) {
        Object.entries(opt.axisEffect).forEach(([ax, pts]) => {
          if (axisScores.hasOwnProperty(ax)) axisScores[ax] += pts * weight;
        });
      }
      if (opt?.ohaengEffect) {
        Object.entries(opt.ohaengEffect).forEach(([type, pts]) => {
          ohaengScores[type] = (ohaengScores[type] || 0) + pts * weight;
        });
      }
    } else if (q.type === 'MULTI_SELECT') {
      (Array.isArray(answer) ? answer : []).forEach(val => {
        const opt = q.options?.find(o => o.value === val);
        if (opt?.axisEffect) {
          Object.entries(opt.axisEffect).forEach(([ax, pts]) => {
            if (axisScores.hasOwnProperty(ax)) axisScores[ax] += pts * weight;
          });
        }
        if (opt?.ohaengEffect) {
          Object.entries(opt.ohaengEffect).forEach(([type, pts]) => {
            ohaengScores[type] = (ohaengScores[type] || 0) + pts * weight;
          });
        }
      });
    }
  });

  // 갱년기 → A03(호르몬), A07(스트레스) 가중치
  const menoAnswer = answers['Q_MENOPAUSE'];
  if (menoAnswer && menoAnswer !== 'not_applicable' && menoAnswer !== 'none') {
    const menoBoost = { meno: 1.2, post: 1.3, peri: 1.1, hrt: 1.1 };
    const factor = menoBoost[menoAnswer] || 1.0;
    axisScores['A03'] = Math.round(axisScores['A03'] * factor);
    axisScores['A07'] = Math.round(axisScores['A07'] * factor);
  }

  // 스트레스 낮음 보호 로직 (A07 과다 배정 방지)
  const stressLevel = answers['Q21'];
  if (stressLevel === 1 || stressLevel === '1') {
    axisScores['A07'] = Math.round(axisScores['A07'] * 0.70);
  } else if (stressLevel === 2 || stressLevel === '2') {
    axisScores['A07'] = Math.round(axisScores['A07'] * 0.85);
  }

  // 정규화 (0~100)
  const maxAxis = Math.max(...Object.values(axisScores), 1);
  const axisNorm = {};
  Object.entries(axisScores).forEach(([ax, val]) => {
    const ratio = val / maxAxis;
    axisNorm[ax] = Math.min(100, Math.round(Math.sqrt(ratio) * 100));
  });

  const maxOH = Math.max(...Object.values(ohaengScores), 1);
  Object.keys(ohaengScores).forEach(k => {
    ohaengScores[k] = Math.min(100, Math.round((ohaengScores[k] / maxOH) * 100));
  });

  // 상위 3개 축
  const topAxes = getTop3Axes(axisNorm);

  // 유형명 결정
  const typeInfo = generateTypeName(topAxes);

  // 도파민 기질
  const dopamineType = getDopamineType(answers);

  // 섹션 L 특수 필드
  const foodAllergy        = answers['Q_ALLERGY'] || [];
  const skinReaction       = answers['Q_SKIN'] || null;
  const menopauseStatus    = answers['Q_MENOPAUSE'] || null;
  const medicalConditions  = (answers['Q_MEDICAL'] || []).filter(v => v !== 'none');
  const allergyExclude     = foodAllergy.filter(v => v !== 'none');
  const isMenopause        = menopauseStatus && !['not_applicable', 'none', null].includes(menopauseStatus);
  const hasMedicalConditions = medicalConditions.length > 0;
  const ohaengType         = Object.entries(ohaengScores).sort((a, b) => b[1] - a[1])[0][0];

  // E코드 감정 유형 분류
  const eCode = classifyECode(answers);

  return {
    // 핵심 결과
    axisScores: axisNorm,
    topAxes,
    typeInfo,          // { name, emoji, desc }
    dopamineType,      // 'achiever' | 'explorer' | 'stable' | 'survivor'
    ohaengScores,
    ohaengType,
    eCode,             // 'E01'~'E07'
    // 섹션 L
    allergyExclude,
    skinReaction,
    menopauseStatus,
    isMenopause,
    medicalConditions,
    hasMedicalConditions,
  };
}

// ══════════════════════════════════════════════════════
//  E코드 감정 유형 분류 (설문 패턴 → E-01~E-07)
//  설문 응답을 직접 언급하지 않고 종합 패턴으로 추론
// ══════════════════════════════════════════════════════
function classifyECode(answers) {
  const scores = { E01:0, E02:0, E03:0, E04:0, E05:0, E06:0, E07:0 };

  // E-01: 늘 실패하는 사람 — 시도 3회+ / 요요 2회+
  const yoyo = answers['Q04'];
  if (yoyo === 5 || yoyo === 10) scores.E01 += 40;
  if (yoyo === 2)                 scores.E01 += 15;
  const expectation = answers['Q00'] || answers['expectation'];
  if (expectation === 'final')    scores.E01 += 20;

  // E-02: 아무도 몰라주는 사람 — 혼자 다이어트 / 지지 없음
  const support = answers['Q_SUPPORT'] || answers['Q38'] || '';
  if (String(support).includes('alone') || String(support).includes('solo')) scores.E02 += 30;
  const stressLevel = parseInt(answers['Q21']) || 0;
  if (stressLevel >= 4)           scores.E02 += 20;
  const gender = answers['Q02'];
  if (gender === 'female' && stressLevel >= 3) scores.E02 += 10;

  // E-03: 돈 걱정형 — 저비용 선호 / 경제적 압박 스트레스
  const costPref = answers['Q_COST'] || answers['Q_BUDGET'] || '';
  if (String(costPref).includes('low') || String(costPref).includes('cheap')) scores.E03 += 30;
  if (stressLevel >= 3 && expectation === 'health') scores.E03 += 10;

  // E-04: 냉혈한·무관심 — 감정 질문 최소 응답 / 수치 응답 적극
  const mbti = answers['Q_MBTI'] || answers['Q45'] || '';
  if (mbti.includes('T')) scores.E04 += 25;
  if (mbti.includes('J')) scores.E04 += 10;
  if (expectation === 'plan') scores.E04 += 15;

  // E-05: 폭식·야식형 — 저녁 충동 / 스트레스→단것
  const lateEat  = answers['Q_LATEEATING'] || answers['Q28'] || '';
  const sweeting = answers['Q_SWEET'] || answers['Q29'] || '';
  if (String(lateEat).includes('often') || String(lateEat).includes('daily')) scores.E05 += 35;
  if (String(sweeting).includes('stress') || String(sweeting).includes('often')) scores.E05 += 25;
  // Q04 심리·식이행동 축 높은 경우 반영
  const eatBehavior = answers['Q35'] || answers['Q36'] || '';
  if (String(eatBehavior).includes('binge') || String(eatBehavior).includes('night')) scores.E05 += 15;

  // E-06: 아픈 사람 — 질환 보유 / 통증
  const medical = answers['Q_MEDICAL'] || [];
  const medArr = Array.isArray(medical) ? medical : [medical];
  if (medArr.length > 0 && !medArr.includes('none')) scores.E06 += 50;
  const pain = answers['Q_PAIN'] || answers['Q47'] || '';
  if (String(pain).includes('chronic') || String(pain).includes('pain')) scores.E06 += 20;

  // E-07: 은둔·대인공포 — 사회 활동 없음 / 혼자 식사
  const social   = answers['Q_SOCIAL'] || answers['Q_ACTIVITY'] || '';
  const eatAlone = answers['Q_EATALONE'] || answers['Q30'] || '';
  if (String(social).includes('none') || String(social).includes('rarely')) scores.E07 += 30;
  if (String(eatAlone).includes('always') || String(eatAlone).includes('often')) scores.E07 += 25;
  if (mbti.includes('I') && stressLevel >= 3) scores.E07 += 15;

  // 최고 점수 E코드 선택 (동점 시 앞 번호 우선)
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];

  // E코드가 모두 0점이면(응답 데이터 부족) 축 점수로 2차 추론
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  if (total < 10) {
    // 기본 fallback: yoyo 없으면 E04, 있으면 E01
    return yoyo >= 5 ? 'E01' : 'E04';
  }

  return best;
}

if (typeof module !== 'undefined') {
  module.exports = { SECTIONS, QUESTIONS, FEEDBACK_MESSAGES, AXIS_META, TYPE_NAME_TABLE, calculateAxisScores, generateTypeName, getDopamineType, classifyECode };
}
