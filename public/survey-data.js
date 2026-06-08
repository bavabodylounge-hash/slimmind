// SlimMind 50문항 설문 데이터 + BC코드 점수 계산 로직

const SECTIONS = [
  { id: 'A', name: '몸의 기억', color: '#1A5276', bg: '#F8FBFF', transition: '몸의 기억을 읽었습니다. 이제 지방이 말하는 언어를 들어볼게요.' },
  { id: 'B', name: '지방의 언어', color: '#CA6F1E', bg: '#FFFBF5', transition: '지방이 보내는 신호를 읽었습니다. 이제 숫자로 더 정확히 봐드릴게요.' },
  { id: 'C', name: '숫자의 비밀', color: '#0E6655', bg: '#F0FDF8', transition: '숫자가 당신의 출발점을 알려주었습니다. 이제 내 몸의 시계를 확인할게요.' },
  { id: 'D', name: '내 몸의 시계', color: '#6C3483', bg: '#FAF5FF', transition: '당신의 생활 패턴을 읽었습니다. 이제 동양 의학이 당신 몸에 남긴 신호를 찾아볼게요.' },
  { id: 'E', name: '오행의 신호', color: '#880E4F', bg: '#FFF0F5', transition: '몸의 오행 신호를 읽었습니다. 이제 당신이 움직이는 방식을 볼게요.' },
  { id: 'F', name: '행동의 패턴', color: '#1D6A39', bg: '#F0FFF4', transition: '{name}님을 거의 다 알아가고 있어요. 마지막 퍼즐 조각들이 남아있습니다.' },
  { id: 'G', name: 'DNA의 언어', color: '#283593', bg: '#EEF2FF', transition: '{name}님의 DNA 패턴을 읽었습니다. 이제 마음의 패턴을 살펴볼게요.' },
  { id: 'H', name: '마지막 질문', color: '#922B21', bg: '#FFF5F5', transition: '거의 다 왔어요! 이제 행동 패턴과 몸의 감각을 탐색할 차례입니다.' },
  { id: 'I', name: '마음의 패턴', color: '#5D4037', bg: '#FFF8F0', transition: '마음의 패턴을 읽었습니다. 이제 몸이 보내는 신호를 들어볼게요.' },
  { id: 'J', name: '몸의 신호', color: '#2E7D32', bg: '#F1FFF3', transition: '몸의 신호를 다 읽었어요! 마지막으로 움직임 습관을 확인할게요.' },
  { id: 'K', name: '움직임의 습관', color: '#00695C', bg: '#F0FFFE', transition: '' }
];

const QUESTIONS = [
  // ── 섹션 A ─────────────────────────────────────────────
  {
    id: 'Q01', section: 'A', num: 1,
    question: '이 결과지에는 당신의 이름이 담깁니다. 어떻게 불리고 싶으신가요?',
    hint: '정식 이름이 아니어도 됩니다. 결과지 첫 줄에 이 이름이 그대로 적힙니다.',
    type: 'TEXT_INPUT',
    placeholder: '예: 지연, 혜진, 민수...',
    maxLength: 10,
    bcEffect: []
  },
  {
    id: 'Q02', section: 'A', num: 2,
    question: '{name}님의 몸은 어떤 방식으로 설계되어 있나요?',
    hint: '이 선택에 따라 체지방률 계산 공식과 처방 방향이 완전히 달라집니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🌸', label: '여성의 몸', desc: '에스트로겐 기반 설계', value: 'female', bcEffect: { 'BC-05': 15, 'BC-06': 10, 'BC-07': 10 } },
      { emoji: '⚡', label: '남성의 몸', desc: '테스토스테론 기반 설계', value: 'male', bcEffect: { 'BC-01': 15, 'BC-02': 10 } }
    ]
  },
  {
    id: 'Q03', section: 'A', num: 3,
    question: '거울 앞에 서서 딱 3초. 가장 먼저 눈이 가는 곳은 어디인가요?',
    hint: '본능적으로 "여기 좀 빠졌으면..." 하는 그 부위. 이 답변 하나가 바디코드 방향을 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 2.5,
    options: [
      { emoji: '🫃', label: '윗배·복부', desc: '만지면 딱딱하거나 볼록함', value: 'upper_belly', bcEffect: { 'BC-01': 25, 'BC-02': 20 } },
      { emoji: '🔻', label: '아랫배·하복부', desc: '물렁하게 늘어진 느낌', value: 'lower_belly', bcEffect: { 'BC-05': 20, 'BC-07': 15 } },
      { emoji: '🍑', label: '허벅지·엉덩이', desc: '앉으면 더 넓어지는 느낌', value: 'thigh', bcEffect: { 'BC-05': 25, 'BC-06': 20 } },
      { emoji: '💪', label: '어깨·팔뚝·등', desc: '목이 짧아 보이는 느낌', value: 'shoulder', bcEffect: { 'BC-03': 25 } },
      { emoji: '〰️', label: '옆구리·허리', desc: '정면에서 허리 곡선이 없음', value: 'waist', bcEffect: { 'BC-04': 25 } },
      { emoji: '🌊', label: '전체적으로', desc: '특정 부위 없이 전반적으로', value: 'whole', bcEffect: { 'BC-07': 15, 'BC-08': 15, 'BC-09': 10 } }
    ]
  },
  {
    id: 'Q04', section: 'A', num: 4,
    question: '솔직하게요. 지금까지 다이어트를 몇 번이나 시작하고 포기했나요?',
    hint: '판단 없습니다. 이 숫자가 높을수록 당신이 그만큼 간절했다는 증거입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🌱', label: '처음 도전', desc: '아직 한 번도 제대로 안 해봤어요', value: 0, bcEffect: {} },
      { emoji: '🔄', label: '2~3번', desc: '조금 빠지다가 다시 돌아왔어요', value: 2, bcEffect: {} },
      { emoji: '🌀', label: '5번 이상', desc: '이제는 뭘 해야 할지 모르겠어요', value: 5, bcEffect: { 'BC-10': 20 } },
      { emoji: '💫', label: '셀 수 없음', desc: '다이어트가 일상이 된 지 오래됐어요', value: 10, bcEffect: { 'BC-10': 30 } }
    ],
    saveAs: 'yoyo_count'
  },
  {
    id: 'Q05', section: 'A', num: 5,
    question: '지금 이 순간 {name}님의 몸 상태가 가장 가까운 것은?',
    hint: '지금 이 순간의 몸 상태가 바디코드의 현재 위치를 알려줍니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🪨', label: '단단하고 탄탄한 편', desc: '근육질 느낌은 아닌데 단단함', value: 'hard', bcEffect: { 'BC-01': 15, 'BC-03': 15 } },
      { emoji: '🍮', label: '전체적으로 말랑말랑함', desc: '탄력이 없는 느낌', value: 'soft', bcEffect: { 'BC-07': 15, 'BC-08': 10 } },
      { emoji: '💧', label: '붓는 편', desc: '아침저녁 차이가 큰 편', value: 'puffy', bcEffect: { 'BC-06': 15, 'BC-09': 10 } },
      { emoji: '🎭', label: '부위마다 달라요', desc: '어딘 단단하고 어딘 말랑함', value: 'mixed', bcEffect: {} }
    ]
  },
  {
    id: 'Q06', section: 'A', num: 6,
    question: '가장 살이 잘 찌는 시기가 있다면?',
    hint: '계절·상황별 패턴이 오행 체질과 연결됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '🌸', label: '봄 (스트레스 받는 시기)', desc: '나도 모르게 봄에 쪄요', value: 'spring', ohaengEffect: { '목': 15 } },
      { emoji: '☀️', label: '여름 (더운 시기)', desc: '여름에 오히려 더 먹게 돼요', value: 'summer', ohaengEffect: { '화': 15 } },
      { emoji: '🍂', label: '가을 (환절기)', desc: '기분이 가라앉으면서 쪄요', value: 'autumn', ohaengEffect: { '금': 15 } },
      { emoji: '❄️', label: '겨울 (추운 시기)', desc: '움츠러들고 활동이 줄어요', value: 'winter', ohaengEffect: { '수': 15 } },
      { emoji: '😤', label: '스트레스 받을 때마다', desc: '계절 상관없이 스트레스가 문제', value: 'stress', bcEffect: { 'BC-09': 15 } },
      { emoji: '📅', label: '특별히 없어요', desc: '꾸준히 조금씩 쪄왔어요', value: 'none', bcEffect: {} }
    ],
    saveAs: 'worst_season'
  },
  // ── 섹션 B ─────────────────────────────────────────────
  {
    id: 'Q07', section: 'B', num: 7,
    question: '지금 가장 신경 쓰이는 부위를 손으로 꾹 눌러보세요. 그 느낌이 어떤가요?',
    hint: '이 질문이 가장 중요합니다. 촉감이 체형 코드를 결정하는 핵심 단서입니다. 정말로 눌러보세요.',
    type: 'SINGLE_SELECT',
    weight: 2.5,
    options: [
      { emoji: '🪨', label: '딱딱하고 단단해요', desc: '손가락이 잘 안 들어가는 느낌', value: 'hard', bcEffect: { 'BC-01': 25, 'BC-02': 20, 'BC-03': 15 } },
      { emoji: '🍮', label: '말랑말랑 물렁해요', desc: '손가락이 쑥 들어가는 느낌', value: 'soft', bcEffect: { 'BC-05': 25, 'BC-07': 15 } },
      { emoji: '🫧', label: '울퉁불퉁 알갱이가 느껴져요', desc: '귤껍질처럼 오돌토돌', value: 'bumpy', bcEffect: { 'BC-06': 25 } },
      { emoji: '💧', label: '누르면 들어갔다 천천히 올라와요', desc: '부기 같은 느낌', value: 'pitting', bcEffect: { 'BC-09': 20, 'BC-06': 15 } }
    ]
  },
  {
    id: 'Q08', section: 'B', num: 8,
    question: '가장 신경 쓰이는 부위를 손바닥으로 잡았을 때 온도가 어떤가요?',
    hint: '여름에도, 따뜻한 방 안에서도 차갑다면 이미 중요한 단서를 찾은 겁니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🧊', label: '차갑습니다', desc: '항상 손발이 냉한 편이에요', value: 'cold', bcEffect: { 'BC-06': 15, 'BC-08': 10 }, ohaengEffect: { '수': 10 } },
      { emoji: '☀️', label: '보통이에요', desc: '딱히 차갑거나 뜨겁지 않아요', value: 'normal', bcEffect: {} },
      { emoji: '🔥', label: '따뜻해요', desc: '오히려 몸이 잘 달아올라요', value: 'warm', bcEffect: { 'BC-01': 10, 'BC-02': 10 }, ohaengEffect: { '화': 10 } },
      { emoji: '🌓', label: '부위마다 달라요', desc: '상체는 뜨겁고 하체는 차가워요', value: 'mixed', bcEffect: { 'BC-06': 20 } }
    ]
  },
  {
    id: 'Q09', section: 'B', num: 9,
    question: '아침과 저녁, {name}님의 몸은 얼마나 다른가요?',
    hint: '체중계가 아니라 거울과 느낌으로 답해주세요.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🌅', label: '아침이랑 저녁이 완전히 달라요', desc: '저녁엔 반지도 안 껴질 정도', value: 'very_diff', bcEffect: { 'BC-06': 20, 'BC-09': 15 } },
      { emoji: '🌤️', label: '조금 다른 것 같아요', desc: '발이나 얼굴 정도는 붓는 편', value: 'slightly', bcEffect: { 'BC-06': 10 } },
      { emoji: '➡️', label: '거의 똑같아요', desc: '아침저녁 차이 거의 없음', value: 'same', bcEffect: {} }
    ],
    saveAs: 'morning_evening_diff'
  },
  {
    id: 'Q10', section: 'B', num: 10,
    question: '허벅지 바깥쪽을 양손으로 잡아 흔들어보세요. 어떤가요?',
    hint: '이 질문에서 셀룰라이트 여부가 결정됩니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🫨', label: '흔들리고 파도치는 느낌', desc: '잡히는 살이 많아요', value: 'waves', bcEffect: { 'BC-05': 20 } },
      { emoji: '🪨', label: '별로 안 흔들려요', desc: '단단한 편이에요', value: 'solid', bcEffect: { 'BC-07': 20 } },
      { emoji: '🌊', label: '흔들리면서 울퉁불퉁한 느낌', desc: '표면이 매끄럽지 않아요', value: 'bumpy_wave', bcEffect: { 'BC-06': 25 } },
      { emoji: '🤷', label: '잘 모르겠어요', desc: '별로 신경 써본 적 없어요', value: 'unknown', bcEffect: {} }
    ]
  },
  {
    id: 'Q11', section: 'B', num: 11,
    question: '배꼽 아래 아랫배를 손으로 꾹 눌러보세요. 어떤 느낌인가요?',
    hint: '내장지방과 피하지방의 차이가 이 느낌으로 드러납니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🛡️', label: '눌러도 잘 안 들어가요', desc: '안에서 막는 느낌', value: 'resistant', bcEffect: { 'BC-01': 20, 'BC-02': 20 } },
      { emoji: '🍮', label: '쑥 눌려요', desc: '부드럽게 들어가요', value: 'soft', bcEffect: { 'BC-05': 20 } },
      { emoji: '💨', label: '가스가 찬 것 같아요', desc: '빵빵한 느낌', value: 'gassy', bcEffect: { 'BC-04': 20 } },
      { emoji: '😶', label: '잘 모르겠어요', desc: '', value: 'unknown', bcEffect: {} }
    ]
  },
  {
    id: 'Q12', section: 'B', num: 12,
    question: '허리를 앞에서 봤을 때 어떤 모양인가요?',
    hint: '허리 라인의 형태가 처방 운동 종류를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '⌛', label: '잘록한 편', desc: '허리 라인이 있어요', value: 'slim', bcEffect: {} },
      { emoji: '🪣', label: '통짜인 편', desc: '앞에서 보면 허리 곡선이 없어요', value: 'straight', bcEffect: { 'BC-04': 20 } },
      { emoji: '🫃', label: '아랫배만 튀어나와요', desc: '허리는 얇은데 아랫배만', value: 'lower_only', bcEffect: { 'BC-05': 20 } },
      { emoji: '🍎', label: '복부 전체가 넓어요', desc: '상복부부터 하복부까지', value: 'whole_belly', bcEffect: { 'BC-01': 20, 'BC-02': 15 } }
    ]
  },
  // ── 섹션 C ─────────────────────────────────────────────
  {
    id: 'Q13', section: 'C', num: 13,
    question: '{name}님의 키를 알려주세요.',
    hint: '체지방률과 BMI 계산의 시작점입니다.',
    type: 'SLIDER',
    min: 140, max: 200, step: 1, unit: 'cm',
    saveAs: 'height',
    autoCalc: 'bmi_preview'
  },
  {
    id: 'Q14', section: 'C', num: 14,
    question: '지금 이 순간의 체중은요?',
    hint: '판단하지 않습니다. 이 숫자는 당신의 출발점입니다.',
    type: 'SLIDER',
    min: 35, max: 150, step: 0.5, unit: 'kg',
    saveAs: 'weight',
    autoCalc: 'body_composition'
  },
  {
    id: 'Q15', section: 'C', num: 15,
    question: '6개월 후 {name}님이 꿈꾸는 체중은요?',
    hint: '숫자가 목표가 아니라, 그 숫자일 때 입고 싶은 옷이 진짜 목표입니다.',
    type: 'SLIDER',
    min: 35, max: 150, step: 0.5, unit: 'kg',
    saveAs: 'target_weight',
    autoCalc: 'goal_calc'
  },
  {
    id: 'Q16', section: 'C', num: 16,
    question: '현재 상의 사이즈는요?',
    hint: '결과지에서 목표 사이즈 변화가 표시됩니다.',
    type: 'SIZE_GRID',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    saveAs: 'top_size'
  },
  {
    id: 'Q17', section: 'C', num: 17,
    question: '현재 하의 사이즈(인치)는요?',
    hint: '허벅지·엉덩이 사이즈 변화 목표와 연결됩니다.',
    type: 'SIZE_GRID',
    options: ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34+'],
    saveAs: 'bottom_size',
    weight: 0.8
  },
  {
    id: 'Q18', section: 'C', num: 18,
    question: '6개월 후 입고 싶은 하의 사이즈는요?',
    hint: '이 목표 사이즈가 결과지 7페이지 약속에 그대로 들어갑니다.',
    type: 'SIZE_GRID',
    options: ['23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34+'],
    saveAs: 'target_bottom_size'
  },
  // ── 섹션 D ─────────────────────────────────────────────
  {
    id: 'Q19', section: 'D', num: 19,
    question: '어젯밤 몇 시에 잠들었나요?',
    hint: '이 질문이 왜 다이어트와 관련 있냐고요? 코르티솔이 지방을 쌓는 스위치이기 때문입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🌙', label: '11시 이전', desc: '규칙적인 수면 패턴', value: 'before11', bcEffect: {} },
      { emoji: '🌚', label: '자정~1시', desc: '약간 늦은 편', value: 'midnight', bcEffect: { 'BC-09': 10 } },
      { emoji: '🌑', label: '새벽 2~3시', desc: '야행성에 가까워요', value: 'late', bcEffect: { 'BC-09': 20 } },
      { emoji: '☀️', label: '새벽 4시 이후', desc: '거의 밤을 새우는 수준', value: 'dawn', bcEffect: { 'BC-09': 25 } }
    ],
    saveAs: 'sleep_time'
  },
  {
    id: 'Q20', section: 'D', num: 20,
    question: '평균 수면 시간은 얼마나 되나요?',
    hint: '수면 부족이 복부 내장지방을 직접 증가시킵니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '😴', label: '7~8시간', desc: '충분한 수면', value: 7.5, bcEffect: {} },
      { emoji: '😪', label: '6시간 전후', desc: '약간 부족한 편', value: 6, bcEffect: { 'BC-09': 10 } },
      { emoji: '😵', label: '5시간 이하', desc: '만성 수면 부족', value: 4.5, bcEffect: { 'BC-09': 30 } },
      { emoji: '🦉', label: '매일 달라요', desc: '불규칙한 수면', value: 0, bcEffect: { 'BC-09': 15, 'BC-10': 15 } }
    ],
    saveAs: 'sleep_hours'
  },
  {
    id: 'Q21', section: 'D', num: 21,
    question: '최근 한 달, 스트레스 강도는?',
    hint: '스트레스 호르몬이 복부에 직접 지방을 쌓습니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '😊', label: '별로 없어요', desc: '평온한 편', value: 1, bcEffect: {} },
      { emoji: '😤', label: '중간 정도', desc: '가끔 힘들어요', value: 2, bcEffect: { 'BC-09': 10 } },
      { emoji: '😰', label: '꽤 심한 편', desc: '거의 매일 스트레스', value: 3, bcEffect: { 'BC-09': 25 } },
      { emoji: '🌋', label: '극심해요', desc: '지금 정말 힘든 시기', value: 4, bcEffect: { 'BC-09': 40 } }
    ],
    saveAs: 'stress_level'
  },
  {
    id: 'Q22', section: 'D', num: 22,
    question: '스트레스를 받으면 {name}님의 몸은 어떻게 반응하나요?',
    hint: '이 반응 패턴이 처방 식이 타이밍을 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🍕', label: '배가 고파지고 폭식하게 돼요', desc: '', value: 'binge', bcEffect: { 'BC-09': 20 } },
      { emoji: '🫥', label: '오히려 식욕이 사라져요', desc: '', value: 'no_appetite', bcEffect: {} },
      { emoji: '🌙', label: '밤에 야식을 찾게 돼요', desc: '', value: 'night_eating', bcEffect: { 'BC-09': 20 } },
      { emoji: '🍫', label: '특히 단것·탄수화물이 당겨요', desc: '', value: 'sweets', bcEffect: { 'BC-09': 20 } }
    ],
    saveAs: 'stress_type'
  },
  {
    id: 'Q23', section: 'D', num: 23,
    question: '지금까지 가장 열심히 해봤던 운동은?',
    hint: '이 답변으로 당신에게 절대 금지인 운동이 드러납니다. (충격적일 수도 있어요)',
    type: 'MULTI_SELECT',
    maxSelect: 3,
    weight: 2.0,
    options: [
      { emoji: '🏋️', label: '스쿼트·런지·레그프레스', desc: '하체 근력', value: '스쿼트' },
      { emoji: '🏃', label: '러닝·트레드밀·스피닝', desc: '유산소', value: '러닝' },
      { emoji: '🔄', label: '크런치·싯업·복근운동', desc: '복부', value: '크런치' },
      { emoji: '⚡', label: '크로스핏·HIIT·타바타', desc: '고강도', value: 'HIIT' },
      { emoji: '🧘', label: '필라테스·요가', desc: '코어·유연성', value: '필라테스' },
      { emoji: '🏊', label: '수영·아쿠아', desc: '저충격 유산소', value: '수영' },
      { emoji: '💤', label: '운동을 거의 안 했어요', desc: '', value: 'none' }
    ],
    saveAs: 'past_exercises'
  },
  {
    id: 'Q24', section: 'D', num: 24,
    question: '지금까지 주로 시도해본 식단은?',
    hint: '어떤 식단이 당신 체형에 맞지 않았는지 이미 알 수 있습니다.',
    type: 'MULTI_SELECT',
    maxSelect: 3,
    weight: 1.5,
    options: [
      { emoji: '🍗', label: '닭가슴살+샐러드 단독', desc: '', value: '닭가슴살샐러드' },
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
    question: '다이어트를 포기하게 되는 가장 큰 이유는?',
    hint: '이 이유가 결과지에서 처음으로 정면 돌파됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '😤', label: '의지력이 부족해서', desc: '', value: 'willpower', bcEffect: {} },
      { emoji: '😔', label: '효과가 없어서', desc: '열심히 했는데 결과가 없음', value: 'no_effect', bcEffect: { 'BC-08': 15 } },
      { emoji: '🤯', label: '너무 힘들어서', desc: '지속 불가', value: 'too_hard', bcEffect: {} },
      { emoji: '😕', label: '뭘 해야 할지 몰라서', desc: '', value: 'no_idea', bcEffect: {} },
      { emoji: '🌀', label: '살 빠져도 요요가 와서', desc: '', value: 'yoyo', bcEffect: { 'BC-10': 20 } }
    ],
    saveAs: 'quit_reason'
  },
  // ── 섹션 E ─────────────────────────────────────────────
  {
    id: 'Q26', section: 'E', num: 26,
    question: '아무 생각 없이 냉장고를 열었을 때 가장 먼저 손이 가는 맛은?',
    hint: '이게 한의학에서 말하는 오행 체질의 신호입니다. 몸이 부족한 에너지를 맛으로 달라고 신호를 보냅니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🍋', label: '신맛', desc: '레몬·식초·김치가 당겨요 (간담 신호)', value: 'sour', ohaengEffect: { '목': 20 } },
      { emoji: '☕', label: '쓴맛', desc: '아메리카노·녹차가 좋아요 (심장 신호)', value: 'bitter', ohaengEffect: { '화': 20 } },
      { emoji: '🍰', label: '단맛', desc: '뭔가 달콤한 게 자꾸 땡겨요 (비위 신호)', value: 'sweet', ohaengEffect: { '토': 20 } },
      { emoji: '🌶️', label: '매운맛', desc: '마라·불닭을 달고 살아요 (폐 신호)', value: 'spicy', ohaengEffect: { '금': 20 } },
      { emoji: '🧂', label: '짠맛', desc: '짠 과자·라면이 무너뜨려요 (신장 신호)', value: 'salty', ohaengEffect: { '수': 20 } }
    ],
    saveAs: 'taste_preference'
  },
  {
    id: 'Q27', section: 'E', num: 27,
    question: '1년 중 몸이 가장 힘든 계절은?',
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
    question: '스트레스를 받거나 피곤하면 가장 먼저 나타나는 신체 반응은?',
    hint: '장기별 피로 반응이 오행 체질을 확정합니다.',
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
    question: '평소 소화 상태는 어떤가요?',
    hint: '소화 패턴이 비위(토체질) 여부와 복부 지방을 연결합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '✅', label: '잘 먹고 잘 소화해요', desc: '', value: 'good', bcEffect: {}, ohaengEffect: {} },
      { emoji: '🌀', label: '자주 더부룩하고 가스가 차요', desc: '', value: 'bloated', bcEffect: { 'BC-04': 15 }, ohaengEffect: { '토': 15 } },
      { emoji: '😵', label: '먹으면 바로 피곤해요', desc: '식곤증 심함', value: 'sleepy_after', bcEffect: { 'BC-01': 10 }, ohaengEffect: { '토': 10 } },
      { emoji: '🤢', label: '소화가 예민해서 뭘 먹어도 조심해요', desc: '', value: 'sensitive', bcEffect: {}, ohaengEffect: { '토': 10 } }
    ]
  },
  {
    id: 'Q30', section: 'E', num: 30,
    question: '피부 상태가 평소 어떤 편인가요?',
    hint: '피부는 폐의 거울입니다. 금체질 여부를 알려줍니다.',
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
    question: '평소 체온이 어떤 편인가요?',
    hint: '체온이 대사율을 결정하고, 오행 체질을 확인하는 마지막 단서입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🧊', label: '항상 차가운 편', desc: '손발이 냉하고 기초체온이 낮아요', value: 'cold', bcEffect: { 'BC-06': 15, 'BC-08': 10 }, ohaengEffect: { '수': 18 } },
      { emoji: '☀️', label: '따뜻한 편', desc: '더위를 잘 타고 쉽게 달아올라요', value: 'warm', ohaengEffect: { '화': 15 } },
      { emoji: '🌡️', label: '36.5도 정도', desc: '평균적인 체온', value: 'normal', ohaengEffect: {} },
      { emoji: '🌓', label: '상체는 뜨겁고 하체는 차가워요', desc: '', value: 'mixed', bcEffect: { 'BC-06': 20 } }
    ],
    saveAs: 'body_temp_type'
  },
  {
    id: 'Q32', section: 'E', num: 32,
    question: '잠에서 깨어날 때 상태가 어떤가요?',
    hint: '아침 기상 상태가 부신(코르티솔) 피로도를 알려줍니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '😊', label: '개운하게 잘 일어나요', desc: '', value: 'fresh', bcEffect: {} },
      { emoji: '😪', label: '피곤해서 일어나기 힘들어요', desc: '', value: 'tired', bcEffect: { 'BC-09': 10 } },
      { emoji: '🥴', label: '얼굴이 퉁퉁 부어서 일어나요', desc: '', value: 'puffy', bcEffect: { 'BC-09': 15, 'BC-06': 10 } },
      { emoji: '😤', label: '아침에 유독 예민하고 짜증이 나요', desc: '', value: 'irritable', bcEffect: { 'BC-09': 15 } }
    ]
  },
  {
    id: 'Q33', section: 'E', num: 33,
    question: '물을 하루 얼마나 마시나요?',
    hint: '수분 섭취가 림프 순환과 직결됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '💧', label: '1L 미만', desc: '물을 잘 안 마셔요', value: 'less1', bcEffect: { 'BC-06': 12 } },
      { emoji: '🥤', label: '1~1.5L 정도', desc: '', value: 'normal', bcEffect: {} },
      { emoji: '🌊', label: '2L 이상', desc: '물을 많이 마시는 편', value: 'plenty', bcEffect: {} },
      { emoji: '☕', label: '커피·음료로 대체', desc: '물 대신 카페인', value: 'caffeine', bcEffect: { 'BC-09': 12 } }
    ]
  },
  {
    id: 'Q34', section: 'E', num: 34,
    question: '평소 허리·무릎·관절 상태는?',
    hint: '관절 상태가 수체질 여부와 BC-06·07 처방 강도를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '✅', label: '딱히 불편한 곳 없어요', desc: '', value: 'good', ohaengEffect: {} },
      { emoji: '🦴', label: '허리가 자주 아파요', desc: '', value: 'back', ohaengEffect: { '수': 13 } },
      { emoji: '🦵', label: '무릎이 시리거나 아파요', desc: '', value: 'knee', ohaengEffect: { '수': 13 } },
      { emoji: '🤸', label: '전반적으로 관절이 약한 편이에요', desc: '', value: 'weak', ohaengEffect: { '수': 13 } }
    ],
    saveAs: 'joint_condition'
  },
  // ── 섹션 F ─────────────────────────────────────────────
  {
    id: 'Q35', section: 'F', num: 35,
    question: '운동을 시작했을 때 가장 오래 지속한 경험이 얼마나 됐나요?',
    hint: '이 숫자가 처방의 난이도와 속도를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '🏃', label: '3개월 이상 지속한 적 있어요', desc: '', value: '3months', bcEffect: {} },
      { emoji: '📅', label: '한 달 정도는 했어요', desc: '', value: '1month', bcEffect: {} },
      { emoji: '🌱', label: '2주를 못 넘겨요', desc: '', value: '2weeks', bcEffect: { 'BC-10': 13 } },
      { emoji: '💤', label: '시작 자체가 힘들어요', desc: '', value: 'cant_start', bcEffect: { 'BC-10': 13 } }
    ],
    saveAs: 'max_exercise_duration'
  },
  {
    id: 'Q36', section: 'F', num: 36,
    question: '혼자 운동하는 게 편한가요, 아니면 같이 해야 하나요?',
    hint: '이 성향이 처방 운동의 형태를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 0.8,
    options: [
      { emoji: '🙋', label: '혼자가 더 집중 잘 돼요', desc: 'I 성향', value: 'alone', mbtiHint: 'I' },
      { emoji: '👥', label: '같이 해야 더 힘이 나요', desc: 'E 성향', value: 'together', mbtiHint: 'E' },
      { emoji: '🤝', label: 'PT·코칭이 있어야 해요', desc: '', value: 'coaching', mbtiHint: 'E' },
      { emoji: '💻', label: '영상 보면서 혼자 해요', desc: '', value: 'video', mbtiHint: 'I' }
    ],
    saveAs: 'exercise_social_type'
  },
  {
    id: 'Q37', section: 'F', num: 37,
    question: '식단 계획을 세웠을 때 어느 정도 지키는 편인가요?',
    hint: '이 패턴이 식단 처방 설계의 자유도를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 0.8,
    options: [
      { emoji: '📋', label: '계획대로 정확히 지켜요', desc: 'J형', value: 'strict', mbtiHint: 'J' },
      { emoji: '🌊', label: '대략적으로는 지키는 편이에요', desc: '', value: 'roughly', mbtiHint: null },
      { emoji: '🎲', label: '그날그날 즉흥적으로 먹어요', desc: 'P형', value: 'impulsive', mbtiHint: 'P' },
      { emoji: '😤', label: '계획은 세우지만 항상 무너져요', desc: '', value: 'fails', mbtiHint: 'P' }
    ],
    saveAs: 'diet_compliance'
  },
  {
    id: 'Q38', section: 'F', num: 38,
    question: '다이어트 동기가 생기는 순간은 언제인가요?',
    hint: '동기의 원천이 처방 언어의 방향을 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 0.8,
    options: [
      { emoji: '📏', label: '체중이나 체지방 숫자가 줄었을 때', desc: 'T형', value: 'numbers', mbtiHint: 'T' },
      { emoji: '👗', label: '옷이 맞아들 때, 주변 반응이 있을 때', desc: 'F형', value: 'appearance', mbtiHint: 'F' },
      { emoji: '🏆', label: '목표를 달성했을 때', desc: 'J형', value: 'achievement', mbtiHint: 'J' },
      { emoji: '🆕', label: '새로운 방법을 시도하고 싶을 때', desc: 'N/P형', value: 'novelty', mbtiHint: 'P' }
    ],
    saveAs: 'motivation_type'
  },
  {
    id: 'Q39', section: 'F', num: 39,
    question: '새로운 다이어트 방법이 생기면 어떻게 하나요?',
    hint: '정보 처리 방식이 MBTI S/N 성향을 드러냅니다.',
    type: 'SINGLE_SELECT',
    weight: 0.8,
    options: [
      { emoji: '🔬', label: '근거를 먼저 찾아보고 시도해요', desc: 'NT형', value: 'research', mbtiHint: 'NT' },
      { emoji: '⚡', label: '일단 해보고 결과를 봐요', desc: 'SP형', value: 'just_do', mbtiHint: 'SP' },
      { emoji: '🤝', label: '주변에서 효과 봤다고 하면 해봐요', desc: 'SF형', value: 'social', mbtiHint: 'SF' },
      { emoji: '📚', label: '전문가 추천이 있어야 시도해요', desc: 'SJ형', value: 'expert', mbtiHint: 'SJ' }
    ],
    saveAs: 'info_processing'
  },
  {
    id: 'Q40', section: 'F', num: 40,
    question: '저녁 이후 야식이나 간식을 먹는 빈도는?',
    hint: '야간 섭식 패턴이 BC-09(코르티솔형) 판별의 핵심 데이터입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '✅', label: '거의 안 먹어요', desc: '주 1회 미만', value: 0, bcEffect: {} },
      { emoji: '🌙', label: '주 2~3회 정도 먹어요', desc: '', value: 2, bcEffect: { 'BC-09': 10 } },
      { emoji: '😔', label: '거의 매일 야식을 먹어요', desc: '', value: 7, bcEffect: { 'BC-09': 30 } },
      { emoji: '🌑', label: '밤이 되면 참을 수가 없어요', desc: '', value: 10, bcEffect: { 'BC-09': 30 } }
    ],
    saveAs: 'late_night_eating'
  },
  {
    id: 'Q41', section: 'F', num: 41,
    question: '지금 이 순간 가장 솔직한 감정은?',
    hint: '이 감정이 결과지 오프닝 카피의 톤을 결정합니다. 완전히 솔직해도 됩니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '😤', label: '지쳐있어요', desc: '열심히 해도 안 돼서 지쳤어요', value: 'tired' },
      { emoji: '😰', label: '불안해요', desc: '이대로 가면 안 될 것 같아요', value: 'anxious' },
      { emoji: '🤔', label: '궁금해요', desc: '내 체형이 뭔지 정말 궁금해요', value: 'curious' },
      { emoji: '💪', label: '결심했어요', desc: '이번엔 진짜 바꿀 거예요', value: 'determined' },
      { emoji: '😊', label: '기대돼요', desc: '결과가 궁금하고 설레요', value: 'excited' }
    ],
    saveAs: 'emotional_state'
  },
  // ── 섹션 G ─────────────────────────────────────────────
  {
    id: 'Q42', section: 'G', num: 42,
    question: 'MBTI를 알고 있다면 선택해 주세요.',
    hint: '처방을 전달하는 언어와 방식이 완전히 달라집니다. 모르셔도 괜찮습니다.',
    type: 'MBTI_GRID',
    options: ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP','잘 모르겠어요'],
    saveAs: 'mbti'
  },
  {
    id: 'Q43', section: 'G', num: 43,
    question: '생년월일을 알려주세요.',
    hint: '사주 일간 오행이 자동으로 계산됩니다. 타고난 에너지의 취약점을 알게 됩니다.',
    type: 'DATE_PICKER',
    saveAs: 'birth_date',
    autoCalc: 'saju'
  },
  {
    id: 'Q44', section: 'G', num: 44,
    question: '혈액형은요?',
    hint: '처방의 언어 톤이 혈액형에 따라 달라집니다. 같은 처방도 읽는 느낌이 달라집니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '🔴', label: 'A형', desc: '안정적인 루틴을 좋아해요', value: 'A' },
      { emoji: '🟡', label: 'B형', desc: '자유롭고 즉흥적인 편이에요', value: 'B' },
      { emoji: '🟢', label: 'O형', desc: '목표를 향해 강하게 달려요', value: 'O' },
      { emoji: '🔵', label: 'AB형', desc: '분석하고 이해해야 움직여요', value: 'AB' },
      { emoji: '⬜', label: '모르겠어요', desc: '추정으로 진행', value: 'unknown' }
    ],
    saveAs: 'blood_type'
  },
  {
    id: 'Q45', section: 'G', num: 45,
    question: '지금까지 건강검진이나 인바디 측정을 해본 적 있나요?',
    hint: '실측 데이터가 있다면 결과의 정확도가 훨씬 높아집니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '✅', label: '있고, 결과도 알고 있어요', desc: '입력 가능', value: 'has_data' },
      { emoji: '📋', label: '해봤지만 수치는 기억 안 나요', desc: '', value: 'no_data' },
      { emoji: '🙅', label: '해본 적 없어요', desc: '', value: 'never' }
    ],
    saveAs: 'has_inbody'
  },
  {
    id: 'Q46', section: 'G', num: 46,
    question: '인바디 수치를 알려주세요. (선택)',
    hint: '실측값을 입력하면 추정 계산보다 2배 정확한 결과가 나옵니다.',
    type: 'INBODY_INPUT',
    conditional: { dependsOn: 'Q45', showIf: 'has_data' },
    saveAs: 'inbody_data'
  },
  // ── 섹션 H ─────────────────────────────────────────────
  {
    id: 'Q47', section: 'H', num: 47,
    question: '6개월 후 입고 싶은 상의 사이즈는요?',
    hint: '이 사이즈가 결과지 7페이지 "앞으로의 약속"에 그대로 들어갑니다.',
    type: 'SIZE_GRID',
    options: ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'],
    saveAs: 'target_top_size'
  },
  {
    id: 'Q48', section: 'H', num: 48,
    question: '살을 빼는 이유 중 가장 중요한 것은?',
    hint: '이 이유가 결과지 첫 페이지 오프닝 문장의 방향을 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '👗', label: '예쁜 옷을 입고 싶어서', desc: '', value: 'clothes' },
      { emoji: '❤️', label: '건강이 걱정되어서', desc: '', value: 'health' },
      { emoji: '💼', label: '자신감과 자존감을 위해서', desc: '', value: 'confidence' },
      { emoji: '👫', label: '누군가에게 매력적으로 보이고 싶어서', desc: '', value: 'attraction' },
      { emoji: '🏃', label: '몸이 가볍고 에너지가 넘치고 싶어서', desc: '', value: 'energy' }
    ],
    saveAs: 'main_goal'
  },
  {
    id: 'Q49', section: 'H', num: 49,
    question: '과거에 다이어트 관련으로 병원을 다녀본 적 있나요?',
    hint: '병원 이력이 있다면 처방에서 중복 추천을 피할 수 있습니다.',
    type: 'MULTI_SELECT',
    maxSelect: 5,
    weight: 0,
    options: [
      { emoji: '💊', label: '내과', desc: '위고비·GLP-1 등 약물', value: '내과' },
      { emoji: '💉', label: '피부과', desc: '지방분해주사·지방흡입 등', value: '피부과' },
      { emoji: '🦴', label: '정형외과', desc: '관절·척추 관련', value: '정형외과' },
      { emoji: '🌿', label: '한의원', desc: '침·한약 다이어트', value: '한의원' },
      { emoji: '🙅', label: '없어요', desc: '', value: 'none', exclusive: true }
    ],
    saveAs: 'hospital_history'
  },
  {
    id: 'Q50', section: 'H', num: 50,
    question: '마지막으로, {name}님에게 가장 중요한 한 가지는?',
    hint: '이 선택이 결과지 7페이지 마지막 문장에 담깁니다.',
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

  // ── 섹션 I : 마음의 패턴 (행동 축) ──────────────────────
  {
    id: 'Q51', section: 'I', num: 51,
    question: '다이어트를 시작했다가 포기하게 되는 순간은 주로 언제인가요?',
    hint: '포기하는 시점을 알면, 딱 그 순간을 막아드릴 수 있어요. 솔직하게 골라주세요.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '⚡', label: '시작 1~3일 안에', desc: '작심삼일이라 불러요', value: 'day3', bcEffect: { 'BC-10': 20 } },
      { emoji: '📅', label: '2주~1달 사이', desc: '눈에 띄는 변화가 없어서', value: 'week2', bcEffect: { 'BC-08': 15 } },
      { emoji: '🎉', label: '목표를 달성한 직후', desc: '빠지면 다시 먹게 돼요', value: 'after_goal', bcEffect: { 'BC-10': 25 } },
      { emoji: '😫', label: '스트레스나 힘든 일이 생기면', desc: '마음이 무너지면 식단도 무너져요', value: 'stress_trigger', bcEffect: { 'BC-09': 20 } },
      { emoji: '🤔', label: '딱히 정해진 시점 없이 흐지부지', desc: '', value: 'fade_out', bcEffect: { 'BC-10': 15 } }
    ],
    saveAs: 'quit_timing'
  },
  {
    id: 'Q52', section: 'I', num: 52,
    question: '열심히 했는데 결과가 안 나올 때, 가장 먼저 드는 생각은?',
    hint: '이 생각이 앞으로의 처방 언어를 완전히 바꿉니다. 가장 솔직한 속마음을 골라주세요.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🤔', label: '"내 방법이 잘못됐나봐"', desc: '방법을 바꾸려고 해요', value: 'method_wrong', bcEffect: {} },
      { emoji: '😤', label: '"내 의지력이 부족한 거야"', desc: '스스로를 탓하게 돼요', value: 'self_blame', bcEffect: { 'BC-10': 15 } },
      { emoji: '😶', label: '"나는 원래 안 되는 체질인가봐"', desc: '포기하고 싶어져요', value: 'helpless', bcEffect: { 'BC-10': 30 } },
      { emoji: '⚡', label: '"더 극단적으로 해야겠다"', desc: '더 빡세게 하려고 해요', value: 'extreme', bcEffect: { 'BC-08': 20 } },
      { emoji: '💬', label: '"누군가 도움을 구해야겠다"', desc: '조언을 찾아요', value: 'seek_help', bcEffect: {} }
    ],
    saveAs: 'failure_attribution'
  },
  {
    id: 'Q53', section: 'I', num: 53,
    question: '지금까지 살면서 가장 오래 꾸준히 유지한 좋은 습관이 있나요?',
    hint: '다이어트가 아닌 어떤 습관이든 괜찮아요. 그 습관이 처방 방식의 열쇠입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '☕', label: '규칙적인 기상·취침 시간', desc: '생활 리듬 루틴형', value: 'sleep_routine', bcEffect: {} },
      { emoji: '🏃', label: '특정 운동이나 활동', desc: '몸으로 하는 루틴형', value: 'exercise_routine', bcEffect: {} },
      { emoji: '📝', label: '기록하기 (일기·가계부·메모 등)', desc: '기록 루틴형', value: 'record_routine', bcEffect: {} },
      { emoji: '🎵', label: '취미 생활 (음악·독서·그림 등)', desc: '즐거움 루틴형', value: 'hobby_routine', bcEffect: {} },
      { emoji: '🙅', label: '딱히 없어요', desc: '루틴 형성이 어려운 편', value: 'no_routine', bcEffect: { 'BC-10': 10 } }
    ],
    saveAs: 'best_routine'
  },
  {
    id: 'Q54', section: 'I', num: 54,
    question: '스트레스를 받으면 식욕이 어떻게 변하나요?',
    hint: '같은 스트레스라도 몸마다 반응이 달라요. {name}님의 패턴을 알면 예방이 가능합니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🍕', label: '더 많이, 더 자주 먹게 돼요', desc: '폭식 경향', value: 'more', bcEffect: { 'BC-09': 25 } },
      { emoji: '🚫', label: '오히려 입맛이 뚝 떨어져요', desc: '거식 경향', value: 'less', bcEffect: {} },
      { emoji: '🌙', label: '낮엔 괜찮다가 밤에 폭발해요', desc: '야간 폭식 경향', value: 'night', bcEffect: { 'BC-09': 30 } },
      { emoji: '🍫', label: '단 것·탄수화물만 엄청 당겨요', desc: '당 갈망 경향', value: 'sweets', bcEffect: { 'BC-09': 20 } },
      { emoji: '😐', label: '스트레스와 식욕이 별로 연관 없어요', desc: '', value: 'no_change', bcEffect: {} }
    ],
    saveAs: 'stress_appetite'
  },
  {
    id: 'Q55', section: 'I', num: 55,
    question: '다이어트 결심을 하게 만드는 가장 큰 계기는 무엇인가요?',
    hint: '이 계기를 알면 {name}님에게 맞는 동기 유지 방법을 찾을 수 있어요.',
    type: 'SINGLE_SELECT',
    weight: 1.0,
    options: [
      { emoji: '📸', label: '사진 속 내 모습을 보고', desc: '', value: 'photo', bcEffect: {} },
      { emoji: '👗', label: '옷이 안 맞을 때', desc: '', value: 'clothes', bcEffect: {} },
      { emoji: '❤️', label: '건강 수치나 의사 말을 듣고', desc: '', value: 'health_warning', bcEffect: {} },
      { emoji: '🏖️', label: '여행·행사·특별한 날이 생겼을 때', desc: '', value: 'event', bcEffect: {} },
      { emoji: '💬', label: '누군가의 말 한마디에', desc: '', value: 'someone_said', bcEffect: {} },
      { emoji: '✨', label: '그냥 갑자기 마음이 생겨요', desc: '', value: 'spontaneous', bcEffect: {} }
    ],
    saveAs: 'motivation_trigger'
  },

  // ── 섹션 J : 몸의 신호 (감각 축) ──────────────────────
  {
    id: 'Q56', section: 'J', num: 56,
    question: '밥을 먹고 "배가 부르다"는 느낌은 언제 오나요?',
    hint: '포만감 신호가 늦게 오면, 과식이 아니라 신경 반응 속도의 문제입니다. 정말 중요한 질문이에요.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🍽️', label: '먹는 중에 자연스럽게 느껴요', desc: '포만감 신호 정상', value: 'during', bcEffect: {} },
      { emoji: '⏰', label: '다 먹고 10~20분 뒤에 느껴요', desc: '포만감 약간 지연', value: 'delayed_20', bcEffect: { 'BC-09': 10 } },
      { emoji: '😔', label: '배가 터질 듯 먹어야 부른 느낌이 와요', desc: '포만감 크게 지연', value: 'overfull', bcEffect: { 'BC-09': 20, 'BC-01': 10 } },
      { emoji: '🤷', label: '배가 부른 느낌을 잘 모르겠어요', desc: '포만감 감각 저하', value: 'no_signal', bcEffect: { 'BC-09': 25 } }
    ],
    saveAs: 'fullness_timing'
  },
  {
    id: 'Q57', section: 'J', num: 57,
    question: '야식이나 폭식이 시작되는 가장 흔한 상황은?',
    hint: '트리거(방아쇠)를 알면 방어할 수 있어요. {name}님의 패턴은 어느 쪽인가요?',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '📺', label: 'TV·유튜브·스마트폰을 보다가', desc: '자극 기반 식욕', value: 'screen', bcEffect: { 'BC-09': 15 } },
      { emoji: '😤', label: '짜증나거나 힘든 일이 있었을 때', desc: '감정 기반 식욕', value: 'emotion', bcEffect: { 'BC-09': 25 } },
      { emoji: '🌙', label: '밤 10시 이후면 조건반사처럼', desc: '시간 기반 식욕', value: 'time', bcEffect: { 'BC-09': 20 } },
      { emoji: '😴', label: '졸리거나 피곤할 때', desc: '에너지 고갈 기반', value: 'tired', bcEffect: { 'BC-09': 15 } },
      { emoji: '🏠', label: '집에 혼자 있을 때', desc: '환경 기반 식욕', value: 'alone', bcEffect: { 'BC-09': 10 } },
      { emoji: '✅', label: '야식·폭식을 거의 안 해요', desc: '', value: 'rarely', bcEffect: {} }
    ],
    saveAs: 'binge_trigger'
  },
  {
    id: 'Q58', section: 'J', num: 58,
    question: '운동할 때 잘 쓰이지 않는 것 같은, "감각이 없는" 부위가 있나요?',
    hint: '예: 스쿼트를 해도 허벅지보다 허리만 아프다면 → 허벅지 감각 저하. 이게 보상움직임의 시작입니다.',
    type: 'MULTI_SELECT',
    maxSelect: 3,
    weight: 1.8,
    options: [
      { emoji: '🍑', label: '엉덩이 (스쿼트해도 엉덩이가 안 뭉쳐요)', desc: '', value: 'glute', bcEffect: { 'BC-05': 15 } },
      { emoji: '🦵', label: '허벅지 뒤쪽 (햄스트링)', desc: '', value: 'hamstring', bcEffect: { 'BC-05': 12 } },
      { emoji: '🤸', label: '복부 코어 (배에 힘이 잘 안 들어가요)', desc: '', value: 'core', bcEffect: { 'BC-04': 15 } },
      { emoji: '🔙', label: '등 (운동해도 등이 뭉치는 느낌 없음)', desc: '', value: 'back', bcEffect: { 'BC-03': 12 } },
      { emoji: '💪', label: '어깨 바깥쪽', desc: '', value: 'shoulder', bcEffect: { 'BC-03': 10 } },
      { emoji: '✅', label: '전체적으로 잘 느껴져요', desc: '', value: 'all_fine', bcEffect: {} }
    ],
    saveAs: 'numb_body_parts'
  },
  {
    id: 'Q59', section: 'J', num: 59,
    question: '오래 앉아 있다가 일어날 때 어느 부위가 불편한가요?',
    hint: '앉았다 일어날 때 느끼는 불편함은 자세 보상 패턴의 지도입니다.',
    type: 'MULTI_SELECT',
    maxSelect: 3,
    weight: 1.5,
    options: [
      { emoji: '🦵', label: '무릎이 찌릿하거나 아파요', desc: '', value: 'knee', ohaengEffect: { '수': 12 } },
      { emoji: '🔙', label: '허리가 뻣뻣하게 굳어있어요', desc: '', value: 'lower_back', bcEffect: { 'BC-04': 12 } },
      { emoji: '🍑', label: '엉덩이가 저리거나 눌린 느낌', desc: '', value: 'hip', bcEffect: { 'BC-05': 10 } },
      { emoji: '🦶', label: '발목이나 종아리가 부어있어요', desc: '', value: 'ankle', bcEffect: { 'BC-06': 12 } },
      { emoji: '🤸', label: '어깨·목이 굳어있어요', desc: '', value: 'neck', bcEffect: { 'BC-03': 10 } },
      { emoji: '😊', label: '딱히 없어요', desc: '', value: 'none', bcEffect: {} }
    ],
    saveAs: 'sit_rise_pain'
  },
  {
    id: 'Q60', section: 'J', num: 60,
    question: '지금 이 순간, 눈을 감고 3초간 내 몸을 느껴보세요. 가장 먼저 느껴지는 감각은?',
    hint: '실제로 눈을 감아보세요! 몸의 자기인식 능력(고유수용감각)을 확인하는 질문입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '⚖️', label: '긴장되거나 뭉친 부위가 느껴져요', desc: '몸 감각 예민형', value: 'tension', bcEffect: {} },
      { emoji: '💧', label: '어딘가 붓거나 무거운 느낌이 있어요', desc: '순환 감각형', value: 'heavy', bcEffect: { 'BC-06': 12 } },
      { emoji: '🔥', label: '따뜻하거나 열감이 있는 곳이 있어요', desc: '열 감각형', value: 'heat', ohaengEffect: { '화': 10 } },
      { emoji: '🧊', label: '차갑거나 시린 곳이 있어요', desc: '냉 감각형', value: 'cold', bcEffect: { 'BC-06': 12 }, ohaengEffect: { '수': 10 } },
      { emoji: '😶', label: '잘 모르겠어요, 별로 느껴지는 게 없어요', desc: '몸 감각 둔감형', value: 'numb', bcEffect: { 'BC-08': 15 } }
    ],
    saveAs: 'body_awareness'
  },
  {
    id: 'Q61', section: 'J', num: 61,
    question: '숨을 쉴 때 배가 움직이나요, 아니면 가슴이 움직이나요?',
    hint: '지금 한 번 해보세요! 손을 배 위에 올리고 자연스럽게 숨을 쉬어보면 알 수 있어요.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🫃', label: '배가 먼저 나와요 (복식호흡)', desc: '코어 활성화, 이상적인 호흡', value: 'belly', bcEffect: {} },
      { emoji: '🫁', label: '가슴만 올라가요 (흉식호흡)', desc: '코어 약화, 코르티솔 상승과 연관', value: 'chest', bcEffect: { 'BC-09': 15, 'BC-04': 10 } },
      { emoji: '🤷', label: '잘 모르겠어요', desc: '호흡 인식 저하', value: 'unknown', bcEffect: { 'BC-04': 8 } }
    ],
    saveAs: 'breathing_type'
  },
  {
    id: 'Q62', section: 'J', num: 62,
    question: '몸의 어느 부위를 손으로 만졌을 때 유독 시리거나 차가운 곳이 있나요?',
    hint: '혈액 순환과 림프 흐름이 막힌 부위를 찾는 질문이에요. 해당하는 곳을 모두 골라주세요.',
    type: 'MULTI_SELECT',
    maxSelect: 4,
    weight: 1.5,
    options: [
      { emoji: '🖐️', label: '손·손가락', desc: '', value: 'hands', bcEffect: { 'BC-06': 12 }, ohaengEffect: { '수': 8 } },
      { emoji: '🦶', label: '발·발가락', desc: '', value: 'feet', bcEffect: { 'BC-06': 15 }, ohaengEffect: { '수': 10 } },
      { emoji: '🦵', label: '무릎 주변', desc: '', value: 'knee', bcEffect: { 'BC-06': 10 }, ohaengEffect: { '수': 8 } },
      { emoji: '🍑', label: '허벅지·엉덩이 바깥', desc: '', value: 'thigh', bcEffect: { 'BC-06': 15 } },
      { emoji: '🔙', label: '허리·골반', desc: '', value: 'lower_back', ohaengEffect: { '수': 10 } },
      { emoji: '😊', label: '딱히 차가운 곳이 없어요', desc: '', value: 'none', bcEffect: {} }
    ],
    saveAs: 'cold_body_parts'
  },

  // ── 섹션 K : 움직임의 습관 ──────────────────────────────
  {
    id: 'Q63', section: 'K', num: 63,
    question: '걸을 때 내 발이 어떤 방향을 향하고 있는지 아시나요?',
    hint: '지금 바로 걸어보세요! 발끝이 어디를 향하는지 보면 자세 패턴이 드러납니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '⬆️', label: '발끝이 정면을 향해요 (11자 걸음)', desc: '자세 정렬 양호', value: 'straight', bcEffect: {} },
      { emoji: '↗️', label: '발끝이 바깥으로 벌어져요 (팔자 걸음)', desc: '고관절·골반 외회전 경향', value: 'out', bcEffect: { 'BC-05': 15, 'BC-04': 10 } },
      { emoji: '↖️', label: '발끝이 안쪽으로 모여요 (안짱걸음)', desc: '무릎·고관절 내회전 경향', value: 'in', bcEffect: { 'BC-05': 12 } },
      { emoji: '🤷', label: '신경 써본 적 없어요, 잘 모르겠어요', desc: '', value: 'unknown', bcEffect: {} }
    ],
    saveAs: 'walking_foot_angle'
  },
  {
    id: 'Q64', section: 'K', num: 64,
    question: '오래 서 있을 때 {name}님의 체중은 어디에 더 실리나요?',
    hint: '눈을 감고 지금 서보세요. 어느 발에, 발의 어느 부분에 무게가 더 실리는지 느껴보세요.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🦶', label: '발앞쪽(발볼·엄지 방향)에 더 실려요', desc: '전방 무게중심, 코어 약화와 연관', value: 'forefoot', bcEffect: { 'BC-04': 15 } },
      { emoji: '🔙', label: '발뒤꿈치에 더 실려요', desc: '후방 무게중심, 엉덩이 쳐짐 경향', value: 'heel', bcEffect: { 'BC-05': 12 } },
      { emoji: '➡️', label: '한쪽 발에 더 실려요 (짝다리 습관)', desc: '골반 틀어짐 경향', value: 'one_side', bcEffect: { 'BC-04': 18 } },
      { emoji: '⚖️', label: '양발 균등하게 실려요', desc: '균형 양호', value: 'balanced', bcEffect: {} }
    ],
    saveAs: 'weight_distribution'
  },
  {
    id: 'Q65', section: 'K', num: 65,
    question: '스마트폰을 볼 때 주로 어떤 자세인가요?',
    hint: '현대인 체형 불균형의 70%가 스마트폰 자세에서 시작됩니다. {name}님은 어느 쪽인가요?',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🤳', label: '폰을 눈 높이로 들어서 봐요', desc: '목·척추 부담 최소', value: 'eye_level', bcEffect: {} },
      { emoji: '⬇️', label: '고개를 숙여서 내려다봐요', desc: '거북목·일자목 경향', value: 'head_down', bcEffect: { 'BC-03': 15 } },
      { emoji: '🛋️', label: '누워서 한쪽으로 기대서 봐요', desc: '척추 측만 경향', value: 'lying', bcEffect: { 'BC-03': 12, 'BC-04': 10 } },
      { emoji: '🦒', label: '턱을 내밀고 앞으로 쭉 빼서 봐요', desc: '목 앞쪽 근육 약화', value: 'chin_forward', bcEffect: { 'BC-03': 18 } }
    ],
    saveAs: 'phone_posture'
  },

  // ── 섹션 I 보완 : 추가 행동·심리 질문 ──────────────────
  {
    id: 'Q66', section: 'I', num: 66,
    question: '식사 속도가 어느 편인가요?',
    hint: '식사 속도가 곧 포만감 신호의 속도입니다. 빠른 식사는 과식으로 이어집니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🐢', label: '천천히 꼭꼭 씹어 먹어요', desc: '20분 이상', value: 'slow', bcEffect: {} },
      { emoji: '🚶', label: '보통 정도예요', desc: '10~20분', value: 'normal', bcEffect: {} },
      { emoji: '🏃', label: '빠른 편이에요', desc: '10분 미만', value: 'fast', bcEffect: { 'BC-09': 12, 'BC-01': 8 } },
      { emoji: '⚡', label: '거의 씹지 않고 삼키는 편이에요', desc: '5분 미만, 위장 부담', value: 'very_fast', bcEffect: { 'BC-09': 20, 'BC-01': 15 } }
    ],
    saveAs: 'eating_speed'
  },
  {
    id: 'Q67', section: 'I', num: 67,
    question: '하루 중 식욕이 가장 강해지는 시간대는?',
    hint: '이 시간대에 맞춰 미리 건강한 간식을 준비해두는 것이 핵심 전략이 됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🌅', label: '오전 (아침~점심 사이)', desc: '', value: 'morning', bcEffect: {} },
      { emoji: '🌤️', label: '오후 3~5시 사이', desc: '혈당 저하 시간대', value: 'afternoon', bcEffect: { 'BC-01': 10 } },
      { emoji: '🌆', label: '저녁 식사 직후', desc: '디저트 욕구', value: 'after_dinner', bcEffect: { 'BC-09': 10 } },
      { emoji: '🌙', label: '밤 10시 이후', desc: '야식 욕구', value: 'late_night', bcEffect: { 'BC-09': 20 } },
      { emoji: '😐', label: '딱히 정해진 시간이 없어요', desc: '', value: 'no_pattern', bcEffect: {} }
    ],
    saveAs: 'peak_appetite_time'
  },
  {
    id: 'Q68', section: 'I', num: 68,
    question: '음식 사진을 보거나 음식 얘기를 들으면 어떻게 되나요?',
    hint: '시각·청각 자극에 의한 식욕 반응을 확인하는 질문입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '😋', label: '바로 먹고 싶어져요', desc: '자극 반응성 높음', value: 'instant', bcEffect: { 'BC-09': 15 } },
      { emoji: '🤔', label: '조금 당기긴 해도 참을 수 있어요', desc: '자극 반응성 보통', value: 'mild', bcEffect: {} },
      { emoji: '😐', label: '별로 영향을 안 받아요', desc: '자극 반응성 낮음', value: 'not_affected', bcEffect: {} }
    ],
    saveAs: 'visual_food_response'
  },

  // ── 섹션 J 보완 : 추가 감각 질문 ────────────────────────
  {
    id: 'Q69', section: 'J', num: 69,
    question: '운동 다음 날, 몸이 어떻게 느껴지나요?',
    hint: '회복 패턴이 처방 운동 주기를 결정합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '💪', label: '뭉근한 근육통이 오고 개운해요', desc: '정상적 회복 반응', value: 'good_sore', bcEffect: {} },
      { emoji: '😫', label: '너무 아파서 이틀 이상 힘들어요', desc: '회복 속도 저하', value: 'too_sore', bcEffect: { 'BC-08': 12 } },
      { emoji: '😴', label: '운동 후 극도로 피곤해요', desc: '부신 기능 저하 가능성', value: 'exhausted', bcEffect: { 'BC-09': 15 } },
      { emoji: '⚡', label: '거의 안 아파요, 금방 회복돼요', desc: '회복력 우수', value: 'fast_recovery', bcEffect: {} },
      { emoji: '🤷', label: '운동을 거의 안 해봐서 모르겠어요', desc: '', value: 'no_experience', bcEffect: {} }
    ],
    saveAs: 'exercise_recovery'
  },
  {
    id: 'Q70', section: 'J', num: 70,
    question: '피부가 꼬집히거나 압박받을 때 어떤 느낌인가요?',
    hint: '피부 감각 민감도는 신경계와 림프 상태를 반영합니다.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '😖', label: '약간만 닿아도 많이 아파요', desc: '감각 과민형', value: 'hypersensitive', bcEffect: { 'BC-06': 10 } },
      { emoji: '😊', label: '보통 정도 느껴요', desc: '감각 정상', value: 'normal', bcEffect: {} },
      { emoji: '😶', label: '꽤 세게 해야 느껴져요', desc: '감각 둔화형', value: 'hyposensitive', bcEffect: { 'BC-08': 12 } },
      { emoji: '🤷', label: '부위마다 다양해요', desc: '', value: 'varies', bcEffect: {} }
    ],
    saveAs: 'skin_sensitivity'
  },

  // ── 섹션 K 보완 : 추가 움직임 질문 ─────────────────────
  {
    id: 'Q71', section: 'K', num: 71,
    question: '계단을 오를 때 주로 어느 쪽 발이 먼저 나가나요?',
    hint: '편한 쪽 발이 먼저 나가는 건 근육 불균형의 신호일 수 있습니다.',
    type: 'SINGLE_SELECT',
    weight: 1.2,
    options: [
      { emoji: '➡️', label: '오른발이 항상 먼저 나가요', desc: '', value: 'right_first', bcEffect: { 'BC-04': 8 } },
      { emoji: '⬅️', label: '왼발이 항상 먼저 나가요', desc: '', value: 'left_first', bcEffect: { 'BC-04': 8 } },
      { emoji: '⚖️', label: '번갈아가며 자연스럽게 나가요', desc: '', value: 'alternating', bcEffect: {} },
      { emoji: '🤷', label: '신경 써본 적 없어요', desc: '', value: 'unknown', bcEffect: {} }
    ],
    saveAs: 'stair_lead_foot'
  },
  {
    id: 'Q72', section: 'K', num: 72,
    question: '의자에 앉을 때 자세는 주로 어떤가요?',
    hint: '앉는 자세가 하루 8시간 이상 체형에 영향을 미칩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🪑', label: '등을 등받이에 붙이고 바르게 앉아요', desc: '척추 정렬 양호', value: 'upright', bcEffect: {} },
      { emoji: '📉', label: '엉덩이를 앞으로 빼고 구부정하게 앉아요', desc: '요추 후만 경향', value: 'slouch', bcEffect: { 'BC-04': 18 } },
      { emoji: '↗️', label: '한쪽으로 기울어져 앉아요', desc: '골반 비대칭 경향', value: 'tilted', bcEffect: { 'BC-04': 15 } },
      { emoji: '🦵', label: '다리를 꼬고 앉아요', desc: '골반 외회전 경향', value: 'crossed', bcEffect: { 'BC-05': 12, 'BC-04': 10 } }
    ],
    saveAs: 'sitting_posture'
  },
  {
    id: 'Q73', section: 'K', num: 73,
    question: '하루 평균 얼마나 움직이나요? (걷기 포함)',
    hint: '총 활동량이 기초대사량 계산의 핵심 변수입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '🛋️', label: '거의 앉아서 생활해요 (3천 보 미만)', desc: '매우 낮은 활동량', value: 'sedentary', bcEffect: { 'BC-08': 20, 'BC-07': 15 } },
      { emoji: '🚶', label: '가벼운 이동 정도 (3천~6천 보)', desc: '낮은 활동량', value: 'light', bcEffect: { 'BC-08': 10 } },
      { emoji: '🏃', label: '어느 정도 걷고 활동해요 (6천~만 보)', desc: '보통 활동량', value: 'moderate', bcEffect: {} },
      { emoji: '⚡', label: '활발하게 움직이는 편 (만 보 이상)', desc: '높은 활동량', value: 'active', bcEffect: {} }
    ],
    saveAs: 'daily_activity'
  },
  {
    id: 'Q74', section: 'K', num: 74,
    question: '팔을 머리 위로 들어올릴 때 어떤가요?',
    hint: '양팔을 동시에 귀 옆으로 올려보세요. 어깨·흉추 가동성을 확인하는 동작입니다.',
    type: 'SINGLE_SELECT',
    weight: 1.5,
    options: [
      { emoji: '🙌', label: '양팔이 귀 옆에 딱 붙어요', desc: '어깨 가동성 정상', value: 'full_range', bcEffect: {} },
      { emoji: '↔️', label: '한쪽이 덜 올라가요', desc: '어깨 불균형 경향', value: 'asymmetric', bcEffect: { 'BC-03': 15 } },
      { emoji: '😖', label: '어깨가 아프거나 뻑뻑해서 잘 안 올라가요', desc: '어깨 가동성 저하', value: 'limited', bcEffect: { 'BC-03': 18 } },
      { emoji: '🔙', label: '올릴 때 허리가 과하게 젖혀져요', desc: '코어 약화·흉추 가동성 저하', value: 'arched_back', bcEffect: { 'BC-04': 15, 'BC-03': 10 } }
    ],
    saveAs: 'shoulder_mobility'
  },

  // ── 섹션 A/B/D 보완 : 정확도 강화 질문 ─────────────────
  {
    id: 'Q75', section: 'B', num: 75,
    question: '배꼽 주변 살을 양손으로 집어보세요. 두께가 얼마나 되나요?',
    hint: '정말로 한번 집어보세요! 이 두께가 피하지방 vs 내장지방을 구별하는 단서입니다.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🤏', label: '1cm 미만, 거의 안 집혀요', desc: '내장지방 우세 가능성', value: 'thin', bcEffect: { 'BC-01': 25, 'BC-02': 20 } },
      { emoji: '✌️', label: '1~3cm 정도 집혀요', desc: '혼합형', value: 'medium', bcEffect: { 'BC-05': 10, 'BC-07': 10 } },
      { emoji: '🖐️', label: '3cm 이상 두껍게 집혀요', desc: '피하지방 우세 가능성', value: 'thick', bcEffect: { 'BC-05': 25 } }
    ],
    saveAs: 'belly_fat_thickness'
  },
  {
    id: 'Q76', section: 'D', num: 76,
    question: '커피·카페인 음료를 하루 얼마나 마시나요?',
    hint: '카페인은 코르티솔과 직접 연결됩니다. 처방의 방향이 달라질 수 있어요.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '🚫', label: '거의 안 마셔요', desc: '', value: 'none', bcEffect: {} },
      { emoji: '☕', label: '하루 1~2잔', desc: '', value: 'moderate', bcEffect: {} },
      { emoji: '☕☕', label: '하루 3~4잔', desc: '카페인 과다 경향', value: 'high', bcEffect: { 'BC-09': 10 } },
      { emoji: '⚡', label: '하루 5잔 이상 (에너지드링크 포함)', desc: '카페인 의존 경향', value: 'very_high', bcEffect: { 'BC-09': 20 } }
    ],
    saveAs: 'caffeine_intake'
  },
  {
    id: 'Q77', section: 'E', num: 77,
    question: '평소 변비 또는 과민성 장 증상이 있나요?',
    hint: '장 건강이 복부 지방 및 체중과 직접 연결됩니다.',
    type: 'SINGLE_SELECT',
    weight: 1.3,
    options: [
      { emoji: '✅', label: '배변이 규칙적이고 편해요', desc: '', value: 'regular', bcEffect: {} },
      { emoji: '🔒', label: '변비가 자주 있어요 (3일 이상)', desc: '', value: 'constipated', bcEffect: { 'BC-04': 12 }, ohaengEffect: { '토': 12 } },
      { emoji: '💨', label: '자주 묽거나 과민성 장 증상이 있어요', desc: '', value: 'ibs', bcEffect: { 'BC-04': 10 }, ohaengEffect: { '토': 10 } },
      { emoji: '🌀', label: '변비와 설사가 번갈아 와요', desc: '', value: 'alternating', bcEffect: { 'BC-04': 15 }, ohaengEffect: { '토': 15 } }
    ],
    saveAs: 'bowel_health'
  },
  {
    id: 'Q78', section: 'A', num: 78,
    question: '살이 찌는 부위의 순서가 어떻게 되나요?',
    hint: '살이 찌기 시작할 때 어느 부위에 제일 먼저 티가 나는지 생각해보세요.',
    type: 'SINGLE_SELECT',
    weight: 2.0,
    options: [
      { emoji: '🫃', label: '배·복부가 제일 먼저 나와요', desc: '', value: 'belly_first', bcEffect: { 'BC-01': 20, 'BC-02': 15 } },
      { emoji: '🍑', label: '허벅지·엉덩이가 먼저 커져요', desc: '', value: 'hip_first', bcEffect: { 'BC-05': 25 } },
      { emoji: '💪', label: '어깨·팔뚝·등이 먼저 두꺼워져요', desc: '', value: 'upper_first', bcEffect: { 'BC-03': 22 } },
      { emoji: '🌊', label: '전신에 골고루 쪄요', desc: '', value: 'all_over', bcEffect: { 'BC-07': 15, 'BC-08': 12 } },
      { emoji: '💧', label: '얼굴·목·손발이 먼저 붓는 것 같아요', desc: '', value: 'face_first', bcEffect: { 'BC-06': 25 } }
    ],
    saveAs: 'fat_gain_order'
  },
  {
    id: 'Q79', section: 'C', num: 79,
    question: '지금까지 가장 많이 빠진 체중과, 그 후 요요로 돌아온 체중은요?',
    hint: '요요 폭이 처방의 핵심 강도를 결정합니다. 대략적인 수치면 충분해요.',
    type: 'SINGLE_SELECT',
    weight: 1.8,
    options: [
      { emoji: '✨', label: '요요 경험이 없어요', desc: '', value: 'no_yoyo', bcEffect: {} },
      { emoji: '📉', label: '5kg 이하 빠지고 5kg 이하 돌아왔어요', desc: '소폭 요요', value: 'small_yoyo', bcEffect: { 'BC-10': 10 } },
      { emoji: '📊', label: '5~10kg 빠지고 거의 다 돌아왔어요', desc: '중간 요요', value: 'medium_yoyo', bcEffect: { 'BC-10': 20 } },
      { emoji: '🌊', label: '10kg 이상 빠졌다 그 이상 돌아온 적 있어요', desc: '대폭 요요, 대사 정체 경향', value: 'large_yoyo', bcEffect: { 'BC-10': 35, 'BC-08': 20 } }
    ],
    saveAs: 'yoyo_magnitude'
  },
  {
    id: 'Q80', section: 'H', num: 80,
    question: '마지막으로 딱 한 가지만 물어볼게요. 6개월 후 {name}님이 가장 하고 싶은 것은?',
    hint: '체중이 아닌, 그 몸으로 하고 싶은 일. 이 한 문장이 결과지 마지막 페이지를 완성합니다.',
    type: 'SINGLE_SELECT',
    weight: 0,
    options: [
      { emoji: '👗', label: '그동안 못 입었던 옷을 입고 싶어요', desc: '', value: 'clothes' },
      { emoji: '🏖️', label: '수영복·비키니를 입고 여행 가고 싶어요', desc: '', value: 'travel' },
      { emoji: '📸', label: '사진 찍을 때 당당하고 싶어요', desc: '', value: 'photo' },
      { emoji: '🏃', label: '가볍게 뛰고 계단 오르고 싶어요', desc: '', value: 'active' },
      { emoji: '🩺', label: '건강 수치가 정상으로 돌아오고 싶어요', desc: '', value: 'health' },
      { emoji: '💑', label: '사랑하는 사람에게 더 매력적으로 보이고 싶어요', desc: '', value: 'love' }
    ],
    saveAs: 'dream_action'
  }
];

// BC 코드 점수 계산 함수
function calculateBCScores(answers) {
  const bcScores = {
    'BC-01': 0, 'BC-02': 0, 'BC-03': 0, 'BC-04': 0, 'BC-05': 0,
    'BC-06': 0, 'BC-07': 0, 'BC-08': 0, 'BC-09': 0, 'BC-10': 0
  };
  const ohaengScores = { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };

  QUESTIONS.forEach(q => {
    const answer = answers[q.id];
    if (!answer) return;

    const weight = q.weight || 1.0;

    if (q.type === 'SINGLE_SELECT') {
      const opt = q.options?.find(o => o.value === answer);
      if (opt?.bcEffect) {
        Object.entries(opt.bcEffect).forEach(([code, pts]) => {
          bcScores[code] = (bcScores[code] || 0) + pts * weight;
        });
      }
      if (opt?.ohaengEffect) {
        Object.entries(opt.ohaengEffect).forEach(([type, pts]) => {
          ohaengScores[type] = (ohaengScores[type] || 0) + pts * weight;
        });
      }
    } else if (q.type === 'MULTI_SELECT') {
      (answer || []).forEach(val => {
        const opt = q.options?.find(o => o.value === val);
        if (opt?.bcEffect) {
          Object.entries(opt.bcEffect).forEach(([code, pts]) => {
            bcScores[code] = (bcScores[code] || 0) + pts * weight;
          });
        }
      });
    }
  });

  // 100점 상한 정규화
  const maxBC = Math.max(...Object.values(bcScores));
  if (maxBC > 0) {
    Object.keys(bcScores).forEach(k => {
      bcScores[k] = Math.min(100, Math.round((bcScores[k] / maxBC) * 100));
    });
  }
  const maxOH = Math.max(...Object.values(ohaengScores));
  if (maxOH > 0) {
    Object.keys(ohaengScores).forEach(k => {
      ohaengScores[k] = Math.min(100, Math.round((ohaengScores[k] / maxOH) * 100));
    });
  }

  // Primary / Secondary
  const sortedBC = Object.entries(bcScores).sort((a, b) => b[1] - a[1]);
  const bcPrimary = sortedBC[0][0];
  const bcSecondary = sortedBC[1][1] >= 60 ? sortedBC[1][0] : null;
  const ohaengType = Object.entries(ohaengScores).sort((a, b) => b[1] - a[1])[0][0];

  return { bcScores, ohaengScores, bcPrimary, bcSecondary, ohaengType };
}

// BC 코드 정보
const BC_INFO = {
  'BC-01': { name: '내장지방형', emoji: '🔴', color: '#E74C3C', desc: '복부 중심 단단한 지방' },
  'BC-02': { name: '복부비만형', emoji: '🟠', color: '#E67E22', desc: '인슐린 저항성 기반 복부 집중' },
  'BC-03': { name: '상체비대형', emoji: '🟡', color: '#F39C12', desc: '어깨·팔뚝·등 집중' },
  'BC-04': { name: '복압형', emoji: '🟤', color: '#795548', desc: '허리 골반 균형 문제' },
  'BC-05': { name: '하체지방형', emoji: '🟣', color: '#9B59B6', desc: '피하지방 하체 집중' },
  'BC-06': { name: '냉증셀룰라이트형', emoji: '🔵', color: '#2980B9', desc: '림프 순환 저하 + 셀룰라이트' },
  'BC-07': { name: '마른비만형', emoji: '🔷', color: '#1ABC9C', desc: '체중 정상·체지방 과잉' },
  'BC-08': { name: '대사정체형', emoji: '⬜', color: '#7F8C8D', desc: '기초대사량 저하·정체기 반복' },
  'BC-09': { name: '코르티솔형', emoji: '🌑', color: '#2C3E50', desc: '스트레스·수면 부족 기반' },
  'BC-10': { name: '요요반복형', emoji: '🌀', color: '#8E44AD', desc: '다이어트 반복·요요 패턴' }
};

if (typeof module !== 'undefined') {
  module.exports = { SECTIONS, QUESTIONS, calculateBCScores, BC_INFO };
}
