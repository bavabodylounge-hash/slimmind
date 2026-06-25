// ============================================================
// SlimMind BC-ENGINE v3.1
// ※ NICKNAME_TABLE 30개 코드 / Top1×Top2×배경필터
// ※ computeNickname() / generatePrescription() BC×기질 분리
// ※ MBTI 레이블 제거 / 남성·완경 P4 분기
// ============================================================

// ──────────────────────────────────────────────
// 1. BC 마스터 9종 (TB_BC_MASTER)
// ──────────────────────────────────────────────
var BC_MASTER = {
  'BC-1': {
    code: 'BC-1',
    app_nickname: '#오후만되면_코끼리다리형',
    medical_title: '하지 림프·정맥 울혈성 체형',
    color: '#1A7FC1', bg: '#E3F1FB', icon: '🦵',
    failed_type_desc: '하체 순환로가 차단된 상태입니다. 이 상태에서 칼로리를 줄이거나 과도한 하체 근력 운동을 하면 배농되지 못한 체액과 노폐물이 하지에 정체 및 압착되어 다리 라인이 오히려 거대화되고 부종이 고착화되는 경향이 있습니다.',
    axis_top: '관',
  },
  'BC-2': {
    code: 'BC-2',
    app_nickname: '#목짧아지는_거북이형',
    medical_title: '경추·흉추 보상성 림프 차단형 체형',
    color: '#6B4EAA', bg: '#EEEAF7', icon: '🐢',
    failed_type_desc: '거북목, 라운드 숄더로 인해 상체 액와(겨드랑이) 림프절이 물리적으로 찝힌 상태입니다. 척추 정렬 없이 유산소만 과도하게 하면 팔뚝과 쇄골 주변에 노폐물이 갇혀 상체 비대화가 진행될 수 있습니다.',
    axis_top: '형',
  },
  'BC-3': {
    code: 'BC-3',
    app_nickname: '#남산_수박배형',
    medical_title: '인슐린 저항성·내장 비대형 체형',
    color: '#E8631A', bg: '#FFE3D3', icon: '🍉',
    failed_type_desc: '혈당 조절 시스템이 불균형한 상태입니다. 이 상태에서 극단적인 굶기나 1일 1식을 하면 인슐린 롤러코스터(스파이크)가 심해져 내장지방이 더 견고해지고 허리둘레가 늘어나는 경향이 있습니다.',
    axis_top: '식',
  },
  'BC-4': {
    code: 'BC-4',
    app_nickname: '#물만마셔도_요요형',
    medical_title: '갑상선 셧다운·초절전 생존형 체형',
    color: '#C0397A', bg: '#FCE4EE', icon: '🌊',
    failed_type_desc: '반복된 초저칼로리 식이로 인해 뇌가 위기 상황으로 인식하여 갑상선 호르몬을 저하시키고 기초대사량을 낮춘 상태입니다. 조금만 먹어도 살로 전환되는 경향이 나타날 수 있습니다.',
    axis_top: '확',
  },
  'BC-5': {
    code: 'BC-5',
    app_nickname: '#셀룰라이트_귤껍질형',
    medical_title: '바탕질 변성·지방 섬유화 체형',
    color: '#1A8C5B', bg: '#DEF3EA', icon: '🍊',
    failed_type_desc: '지방세포가 만성 염증성 액체 및 콜라겐 섬유와 엉겨 붙어 단단한 결합 조직(Cellulite)을 형성한 상태입니다. 일반적인 다이어트나 단순 굶기로는 이 섬유화 장벽 개선이 어려울 수 있습니다.',
    axis_top: '한',
  },
  'BC-6': {
    code: 'BC-6',
    app_nickname: '#스트레스성_야식부엉이형',
    medical_title: '부신 피로·자율신경 교란형 체형',
    color: '#3F51B5', bg: '#E8EAF6', icon: '🦉',
    failed_type_desc: '극심한 스트레스로 코르티솔/도파민 호르몬 체계가 불균형한 상태입니다. 밤 9시 이후 호르몬 역류로 인해 가짜 허기가 발생하며, 이를 의지력으로만 참으려 하면 보상성 과식을 유발할 수 있습니다.',
    axis_top: '심',
  },
  'BC-7': {
    code: 'BC-7',
    app_nickname: '#출산후_바람빠진풍선형',
    medical_title: '릴랙신 이완·산후 구조 정체형 체형',
    color: '#C0397A', bg: '#FFF0DA', icon: '🎈',
    failed_type_desc: '출산 시 분비된 릴랙신 호르몬으로 인해 골격이 이완되고 복부 코어 압력이 저하된 상태입니다. 장기 처짐과 복직근 이개가 발생하여, 체형 복구 없는 다이어트는 요통과 아랫배 처짐을 악화시킬 수 있습니다.',
    axis_top: '복',
  },
  'BC-8': {
    code: 'BC-8',
    app_nickname: '#운동할수록_말벅지형',
    medical_title: '알파 수용체 우세·하체 과발달형 체형',
    color: '#4A8C1C', bg: '#E8F3DC', icon: '🏋️',
    failed_type_desc: '하체 부위에 지방 분해를 방해하는 알파-2 수용체가 집중된 체형입니다. 고강도 펌핑 운동을 과도하게 하면 지방 밑에 근육만 커져 체형이 거대화되는 경향이 있습니다.',
    axis_top: '관',
  },
  'BC-9': {
    code: 'BC-9',
    app_nickname: '#팔다리거미_올챙이배형',
    medical_title: '근감소성 이화작용·마른 비만형 체형',
    color: '#7B1FA2', bg: '#EDE7F6', icon: '🕷️',
    failed_type_desc: '근육을 에너지로 전환하는 이화작용이 활성화된 상태입니다. 몸무게 숫자에만 집착하여 유산소와 단식을 반복하면 사지는 더 가늘어지고 복부 내장지방만 남는 불균형 체형으로 진행될 수 있습니다.',
    axis_top: '약',
  }
};

// ──────────────────────────────────────────────
// 2. 10대 원인축 정의 (A01~A10)
// ──────────────────────────────────────────────
var AXIS_10_META = {
  'A01': { label: '인슐린·내장', icon: '🍽️', color: '#E8631A', desc: '식후 혈당 반응 + 복부 내장지방 패턴' },
  'A02': { label: '림프순환',   icon: '💧', color: '#1A7FC1', desc: '하체·상체 림프 및 정맥 순환 상태' },
  'A03': { label: '호르몬',     icon: '🌸', color: '#C0397A', desc: '에스트로겐·갑상선·성호르몬 균형' },
  'A04': { label: '근감소',     icon: '🏃', color: '#4A8C1C', desc: '근육량·기초대사량·이화작용 패턴' },
  'A05': { label: '소화·장',    icon: '🌿', color: '#1A8C5B', desc: '장내 환경·소화 기능·가스 팽만' },
  'A06': { label: '골격·복압',  icon: '🦴', color: '#6B4EAA', desc: '골반 정렬·복압·코어 안정성' },
  'A07': { label: '코르티솔',   icon: '🌙', color: '#3F51B5', desc: '부신·스트레스 호르몬·자율신경 상태' },
  'A08': { label: '심리·식이',  icon: '🧠', color: '#7B1FA2', desc: '감정적 섭식·식욕 조절·행동 패턴' },
  'A09': { label: '대사위험',   icon: '⚠️', color: '#E67E22', desc: '대사증후군·혈압·혈당 복합 위험도' },
  'A10': { label: '기질·성향',  icon: '🔮', color: '#607D8B', desc: '오행 기질 + MBTI 행동 패턴 (처방 톤 필터)' },
};

// ──────────────────────────────────────────────
// 3. NICKNAME_TABLE: [Top1축][Top2축][배경필터] = 닉네임
// 30개 바디코드 전체 (문서 기준 22개 대표 + 보완 8개)
// 배경필터 키: '유전'|'모계유전'|'출산'|'갱년기'|'시술'|'약물'|
//              'PCOS'|'번아웃'|'대사증후군'|'default'
// ──────────────────────────────────────────────
var NICKNAME_TABLE = {
  // ── A01 Top1: 인슐린·내장 → BC-3 계열 ──
  'A01': {
    'A10': { 유전: '아빠체형 내장비대형', default: '아빠체형 내장비대형' },
    'A09': { 유전: '아빠체형 내장비대형', default: '식후기절 혈당롤러코스터형' },
    'A08': { 약물: '억제제부작용 배부름마비형', default: '억제제부작용 배부름마비형' },
    'A07': { default: '스트레스성 야식부엉이형' },
    'A05': { default: '식후임산부 가스풍선형' },
    'default': { default: '식후기절 혈당롤러코스터형' },
  },
  // ── A02 Top1: 림프순환 → BC-1 계열 ──
  'A02': {
    'A03': { 모계유전: '엄마체형 하지정체형', default: '오후만되면 코끼리다리형' },
    'A10': { 모계유전: '엄마체형 하지정체형', default: '엄마체형 하지정체형' },
    'A04': { 시술: '지방흡입후 재발형', default: '오후만되면 코끼리다리형' },
    'A06': { 시술: '지방흡입후 재발형', default: '안 쓰는 팔뚝 부종형' },
    'default': { default: '오후만되면 코끼리다리형' },
  },
  // ── A03 Top1: 호르몬 → BC-6 계열 ──
  'A03': {
    'A07': { 갱년기: '호르몬스위치 갱년기형', default: '호르몬스위치 갱년기형' },
    'A01': { PCOS: '털털한 PCOS형', 갱년기: '호르몬스위치 갱년기형', default: '털털한 PCOS형' },
    'A02': { 갱년기: '호르몬스위치 갱년기형', default: '여름에도 시린 얼음장형' },
    'A10': { 갱년기: '호르몬스위치 갱년기형', default: '여름에도 시린 얼음장형' },
    'default': { 갱년기: '호르몬스위치 갱년기형', default: '털털한 PCOS형' },
  },
  // ── A04 Top1: 근감소 → BC-9 계열 ──
  'A04': {
    'A03': { default: '팔다리거미 올챙이배형' },
    'A01': { default: '팔다리거미 올챙이배형' },
    'A02': { default: '운동할수록 말벅지형' },
    'A06': { default: '운동할수록 말벅지형' },
    'default': { default: '팔다리거미 올챙이배형' },
  },
  // ── A05 Top1: 소화·장 → BC-3 소화 계열 ──
  'A05': {
    'A06': { 출산: '출산후 바람빠진 풍선형', default: '식후임산부 가스풍선형' },
    'A02': { default: '식후임산부 가스풍선형' },
    'A01': { default: '식후임산부 가스풍선형' },
    'default': { default: '식후임산부 가스풍선형' },
  },
  // ── A06 Top1: 골격·복압 → BC-7 계열 ──
  'A06': {
    'A04': { 출산: '출산후 바람빠진 풍선형', default: '출산후 바람빠진 풍선형' },
    'A03': { 출산: '출산후 바람빠진 풍선형', default: '겨드랑이 부유방형' },
    'A02': { default: '목짧아지는 거북이형' },
    'A07': { default: '목짧아지는 거북이형' },
    'default': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
  },
  // ── A07 Top1: 코르티솔 → BC-6 계열 ──
  'A07': {
    'A08': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
    'A03': { 갱년기: '호르몬스위치 갱년기형', 번아웃: '스트레스기절 번아웃형', default: '스트레스기절 번아웃형' },
    'A02': { default: '스트레스기절 번아웃형' },
    'A01': { default: '스트레스성 야식부엉이형' },
    'default': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
  },
  // ── A08 Top1: 심리·식이 → BC-6 심리 계열 ──
  'A08': {
    'A05': { 약물: '억제제부작용 배부름마비형', default: '억제제부작용 배부름마비형' },
    'A01': { 약물: '억제제부작용 배부름마비형', default: '스트레스성 야식부엉이형' },
    'A07': { 번아웃: '스트레스기절 번아웃형', default: '스트레스기절 번아웃형' },
    'default': { 약물: '억제제부작용 배부름마비형', default: '스트레스성 야식부엉이형' },
  },
  // ── A09 Top1: 대사위험 → BC-4 계열 ──
  'A09': {
    'A01': { 대사증후군: '대사증후군 종합형', 유전: '아빠체형 내장비대형', default: '대사증후군 종합형' },
    'A03': { 대사증후군: '대사증후군 종합형', 약물: '약물부작용 강제축적형', default: '약물부작용 강제축적형' },
    'A07': { default: '동시다발 다중악순환형' },
    'default': { 약물: '약물부작용 강제축적형', 대사증후군: '대사증후군 종합형', default: '대사증후군 종합형' },
  },
  // ── A10 Top1: 기질·성향 → 기질설문으로 분기 (닉네임은 Top2·Top3 기준) ──
  'A10': {
    // A10이 Top1이면 Top2로 닉네임 결정
    'A01': { default: '식후기절 혈당롤러코스터형' },
    'A02': { 모계유전: '엄마체형 하지정체형', default: '오후만되면 코끼리다리형' },
    'A03': { 갱년기: '호르몬스위치 갱년기형', default: '여름에도 시린 얼음장형' },
    'A07': { default: '스트레스성 야식부엉이형' },
    'default': { default: '동시다발 다중악순환형' },
  },
};

// ──────────────────────────────────────────────
// 4. 배경 필터 감지 함수
// answers: { Q3, Q21, Q22, Q_MENOPAUSE, Q_FAMILY_HISTORY, ... }
// 반환: '유전'|'모계유전'|'출산'|'갱년기'|'시술'|'약물'|'PCOS'|'번아웃'|'대사증후군'|null
// ──────────────────────────────────────────────
function detectBackground(answers) {
  if (!answers) return null;

  // 갱년기·완경
  const meno = answers['Q_MENOPAUSE'] || answers['Q_meno'] || '';
  if (meno && meno !== 'not_applicable' && meno !== 'none' && meno !== '') {
    return '갱년기';
  }

  // PCOS (다낭성 난소 증후군)
  const pcos = answers['Q_PCOS'] || answers['Q_pcos'] || '';
  if (pcos === 'yes' || pcos === 'Y' || pcos === '있음') return 'PCOS';

  // 시술 이력 (지방흡입 등)
  const surgery = answers['Q21'] || answers['Q_surgery'] || '';
  if (surgery && surgery !== 'none' && surgery !== '없음' && surgery !== '') {
    // 지방흡입 키워드 확인
    if (String(surgery).includes('지방흡입') || String(surgery).includes('liposuction')) {
      return '시술';
    }
    return '시술';
  }

  // 약물 복용력 (스테로이드·항우울제·식욕억제제 등)
  const drug = answers['Q22'] || answers['Q_drug'] || '';
  if (drug && drug !== 'none' && drug !== '없음' && drug !== '') {
    // 번아웃/부신 고갈 키워드 우선 확인
    if (String(drug).includes('번아웃') || String(drug).includes('부신')) return '번아웃';
    return '약물';
  }

  // 출산 경험
  const birth = answers['Q3'] || answers['Q_birth'] || '';
  if (birth === 'yes' || birth === 'Y' || birth === '있음' || birth === '경험있음' ||
      (typeof birth === 'string' && birth !== '' && birth !== 'none' && birth !== '없음')) {
    return '출산';
  }

  // 가족력·유전 (부계 vs 모계)
  const family = answers['Q_FAMILY'] || answers['Q_family'] || answers['Q_heredity'] || '';
  if (family) {
    if (String(family).includes('모') || String(family).includes('엄마') || String(family).includes('이모')) {
      return '모계유전';
    }
    if (String(family).includes('부') || String(family).includes('아빠') || String(family).includes('삼촌')) {
      return '유전';
    }
    if (String(family) !== 'none' && String(family) !== '없음' && String(family) !== '') {
      return '유전';
    }
  }

  // 대사증후군 고위험 (복합 수치)
  const diabetesRisk = answers['Q_diabetes'] || answers['Q_metabolic'] || '';
  if (diabetesRisk === 'yes' || diabetesRisk === 'Y' || diabetesRisk === '있음') {
    return '대사증후군';
  }

  // 번아웃 (별도 질문)
  const burnout = answers['Q_burnout'] || answers['Q_stress_level'] || '';
  if (burnout === 'severe' || burnout === '심각' || burnout === '극심') return '번아웃';

  return null; // 배경 필터 없음 → default 코드
}

// ──────────────────────────────────────────────
// 5. computeNickname() — 5단계 퍼널 닉네임 결정
// axisScores: { A01: 75, A02: 60, ... }
// answers: 설문 응답 객체
// ──────────────────────────────────────────────
function computeNickname(axisScores, answers) {
  // ① 10개 원인축 점수 정렬 (Top1, Top2, Top3)
  const sorted = Object.entries(axisScores)
    .filter(([k]) => k.startsWith('A'))
    .sort((a, b) => b[1] - a[1]);

  let top1 = sorted[0] ? sorted[0][0] : 'A07'; // 'A01'~'A10'
  const top2 = sorted[1] ? sorted[1][0] : 'A08';
  const top3 = sorted[2] ? sorted[2][0] : 'A01';

  // ② A10이 Top1이면 → 기질 설문 분기 플래그 + Top2로 닉네임 재결정
  const isDispositionTop1 = (top1 === 'A10');
  if (isDispositionTop1) {
    // A10이 Top1 → Top2를 실질 Top1로 사용
    top1 = top2;
  }

  // ③ 배경 필터 감지
  const background = detectBackground(answers);

  // ④ NICKNAME_TABLE 3단계 룩업
  const t1Entry = NICKNAME_TABLE[top1] || NICKNAME_TABLE['A07'];
  const t2Entry = t1Entry[top2] || t1Entry['default'] || { default: '동시다발 다중악순환형' };

  // 배경 필터 매칭: 정확히 일치하는 키 우선, 없으면 default
  let nickname = t2Entry[background] || t2Entry['default'] || '동시다발 다중악순환형';

  // ⑤ 심층 설문 라우팅 결정 (Top1 축 기반)
  const deepSurveyRoute = getDeepSurveyRoute(isDispositionTop1 ? 'A10' : top1);

  return {
    nickname,
    top1: isDispositionTop1 ? 'A10' : top1, // 원래 Top1 (A10 포함)
    top1Actual: top1,  // 닉네임 결정에 실제 사용한 축
    top2, top3,
    background,
    isDispositionTop1,
    deepSurveyRoute,
    sortedAxes: sorted,
  };
}

// ──────────────────────────────────────────────
// 6. Top1 축 → 심층 설문 라우팅 매핑
// ──────────────────────────────────────────────
function getDeepSurveyRoute(top1Axis) {
  const routeMap = {
    'A01': { bcRef: 'BC-3', routeKey: 'BC3',  label: '혈당·내장지방 심층',   desc: 'BC-3 수박배형 심층 설문' },
    'A02': { bcRef: 'BC-1', routeKey: 'BC1',  label: '림프순환 심층',        desc: 'BC-1 코끼리다리형 심층 설문' },
    'A03': { bcRef: 'BC-6', routeKey: 'BC6',  label: '호르몬 심층',          desc: 'BC-6 야식부엉이형 심층 설문 (호르몬 파트)' },
    'A04': { bcRef: 'BC-9', routeKey: 'BC9',  label: '근감소·마른비만 심층', desc: 'BC-9 올챙이배형 심층 설문' },
    'A05': { bcRef: 'BC-3', routeKey: 'BC3D', label: '소화·장 심층',         desc: 'BC-3 심층 일부 + 소화 특화 추가 5문항' },
    'A06': { bcRef: 'BC-7', routeKey: 'BC7',  label: '골격·복압 심층',       desc: 'BC-7 바람빠진풍선형 심층 설문' },
    'A07': { bcRef: 'BC-6', routeKey: 'BC6',  label: '코르티솔·부신 심층',   desc: 'BC-6 야식부엉이형 심층 설문' },
    'A08': { bcRef: 'BC-6', routeKey: 'BC6P', label: '심리·감정식이 심층',   desc: 'BC-6 심층 설문 (심리 파트)' },
    'A09': { bcRef: 'BC-4', routeKey: 'BC4',  label: '대사위험 심층',        desc: 'BC-4 요요형 심층 설문' },
    'A10': { bcRef: null,   routeKey: 'DISP', label: '기질 설문',            desc: '기질 설문 10문항 (DISP_*)으로 분기' },
  };
  return routeMap[top1Axis] || routeMap['A07'];
}

// ──────────────────────────────────────────────
// 7. 닉네임 → BC코드 역매핑 테이블
// (기존 BC_MASTER와 호환, 결과지·처방 엔진 연결용)
// ──────────────────────────────────────────────
var NICKNAME_TO_BC = {
  // 복부형
  '아빠체형 내장비대형':          'BC-3',
  '식후기절 혈당롤러코스터형':    'BC-3',
  '털털한 PCOS형':                'BC-6',
  '약물부작용 강제축적형':        'BC-4',
  '스트레스성 야식부엉이형':      'BC-6',
  '억제제부작용 배부름마비형':    'BC-6',
  '출산후 바람빠진 풍선형':       'BC-7',
  '식후임산부 가스풍선형':        'BC-3',
  '팔다리거미 올챙이배형':        'BC-9',
  // 하체형
  '오후만되면 코끼리다리형':      'BC-1',
  '엄마체형 하지정체형':          'BC-1',
  '여름에도 시린 얼음장형':       'BC-4',
  '운동할수록 말벅지형':          'BC-8',
  '골반틀어짐 승마살형':          'BC-7',
  '지방흡입후 재발형':            'BC-5',
  // 상체형
  '목짧아지는 거북이형':          'BC-2',
  '안 쓰는 팔뚝 부종형':         'BC-2',
  '상체근육형':                   'BC-8',
  '겨드랑이 부유방형':            'BC-2',
  // 전신·기타형
  '호르몬스위치 갱년기형':        'BC-6',
  '스트레스기절 번아웃형':        'BC-6',
  '대사증후군 종합형':            'BC-9',
  '동시다발 다중악순환형':        'BC-6',
};

// BC코드 → 닉네임 역방향 (기본 대표 닉네임)
var BC_TO_DEFAULT_NICKNAME = {
  'BC-1': '오후만되면 코끼리다리형',
  'BC-2': '목짧아지는 거북이형',
  'BC-3': '식후기절 혈당롤러코스터형',
  'BC-4': '약물부작용 강제축적형',
  'BC-5': '지방흡입후 재발형',
  'BC-6': '스트레스성 야식부엉이형',
  'BC-7': '출산후 바람빠진 풍선형',
  'BC-8': '운동할수록 말벅지형',
  'BC-9': '팔다리거미 올챙이배형',
};

// ──────────────────────────────────────────────
// 8. 8대 원인축 메타 (약·식·복·확·한·심·형·관) — 기존 유지
// ──────────────────────────────────────────────
var CAUSAL_AXIS_META = {
  '약': { label: '약물·식이습관', icon: '💊', color: '#7B1FA2', axisKeys: ['A08','A09'], bcNum: 9 },
  '식': { label: '식단·지방저장', icon: '🍽️', color: '#E8631A', axisKeys: ['A01','A05'], bcNum: 3 },
  '복': { label: '복신·회복',    icon: '🌙', color: '#3F51B5', axisKeys: ['A07'],       bcNum: 7 },
  '확': { label: '호르몬·대사',  icon: '🌸', color: '#C0397A', axisKeys: ['A03'],       bcNum: 4 },
  '한': { label: '한방·순환',    icon: '🌿', color: '#1A8C5B', axisKeys: ['A02','A05'], bcNum: 5 },
  '심': { label: '심리·식이행동',icon: '🧠', color: '#6B4EAA', axisKeys: ['A08','A07'], bcNum: 6 },
  '형': { label: '체형정렬',     icon: '🦴', color: '#6B4EAA', axisKeys: ['A06'],       bcNum: 2 },
  '관': { label: '관·하체순환',  icon: '💧', color: '#1A7FC1', axisKeys: ['A02','A04'], bcNum: 1 },
};

// ──────────────────────────────────────────────
// 3. 11대 전문 진단축
// ──────────────────────────────────────────────
var AXIS_11 = [
  { key: '약물',   label: '약물',   icon: '💊', color: '#7B1FA2', axisRef: 'A08' },
  { key: '식단',   label: '식단',   icon: '🍽️', color: '#E8631A', axisRef: 'A01' },
  { key: '운동',   label: '운동',   icon: '🏃', color: '#4A8C1C', axisRef: 'A04' },
  { key: '회복',   label: '회복',   icon: '🌙', color: '#3F51B5', axisRef: 'A07' },
  { key: '한방',   label: '한방',   icon: '🌿', color: '#1A8C5B', axisRef: 'A02' },
  { key: '심리',   label: '심리',   icon: '🧠', color: '#7B1FA2', axisRef: 'A08' },
  { key: '체형',   label: '체형',   icon: '🦴', color: '#6B4EAA', axisRef: 'A06' },
  { key: '호르몬', label: '호르몬', icon: '🌸', color: '#C0397A', axisRef: 'A03' },
  { key: '시술',   label: '시술',   icon: '✨', color: '#E67E22', axisRef: 'A09' },
  { key: '관리',   label: '관리',   icon: '💆', color: '#3EB8A0', axisRef: 'A04' },
  { key: '철학',   label: '철학',   icon: '🔮', color: '#E67E22', axisRef: 'A10' },
];

// ──────────────────────────────────────────────
// 12. BC_CODE 연산 함수 (V3.1: NICKNAME_TABLE 기반)
// axisScores: { A01~A10 } 직접 사용
// answers: 설문 응답 (배경 필터 감지용) — optional
// ──────────────────────────────────────────────
function computeBCCode(axisScores, answers) {
  // ① 10개 축 점수 직접 정렬
  const sortedAxes = Object.entries(axisScores)
    .filter(([k]) => k.startsWith('A'))
    .sort((a, b) => b[1] - a[1]);

  // ② computeNickname()으로 닉네임 + 배경 필터 + 라우팅 결정
  const nicknameResult = computeNickname(axisScores, answers || {});
  const { nickname, top1Actual, top2, top3, background, deepSurveyRoute } = nicknameResult;

  // ③ 닉네임 → BC코드 역매핑
  const masterKey = NICKNAME_TO_BC[nickname] || 'BC-6';
  const bcCode    = masterKey;
  const bcMaster  = BC_MASTER[masterKey] || BC_MASTER['BC-6'];

  // ④ 기존 causalScores 호환용 (CAUSAL_AXIS_META 기반 8축)
  const causalScores = {};
  causalScores['약'] = Math.round(((axisScores['A08']||0)*0.7 + (axisScores['A09']||0)*0.3));
  causalScores['식'] = Math.round(((axisScores['A01']||0) + (axisScores['A05']||0)) / 2);
  causalScores['복'] = axisScores['A07'] || 0;
  causalScores['확'] = axisScores['A03'] || 0;
  causalScores['한'] = Math.round(((axisScores['A02']||0) + (axisScores['A05']||0)) / 2);
  causalScores['심'] = Math.round(((axisScores['A08']||0) + (axisScores['A07']||0)) / 2);
  causalScores['형'] = axisScores['A06'] || 0;
  causalScores['관'] = Math.round(((axisScores['A02']||0) + (axisScores['A04']||0)) / 2);

  const sorted = Object.entries(causalScores).sort((a, b) => b[1] - a[1]);
  const top1Legacy = sorted[0];
  const top2Legacy = sorted[1];
  const firstDomino = CAUSAL_AXIS_META[top1Legacy[0]]?.label || '스트레스';

  // ⑤ 4대 지표
  const metaAge    = Math.round(40 + (axisScores['A03']||0) * 0.15 + (axisScores['A07']||0) * 0.1);
  const metaBelly  = Math.min(99, Math.round((axisScores['A01']||0) * 0.8 + (axisScores['A05']||0) * 0.2));
  const metaHormone= Math.min(99, Math.round((axisScores['A03']||0) * 0.6 + (axisScores['A07']||0) * 0.4));
  const metaBody   = Math.min(99, Math.round((axisScores['A06']||0) * 0.7 + (axisScores['A02']||0) * 0.3));

  return {
    // V3.1 신규
    nickname,          // '스트레스성 야식부엉이형'
    nicknameResult,    // computeNickname() 전체 결과
    background,        // '갱년기'|'출산'|null ...
    deepSurveyRoute,   // 심층설문 라우팅
    // 기존 호환
    bcCode, masterKey, bcMaster,
    causalScores, sorted, top1: top1Legacy, top2: top2Legacy,
    firstDomino,
    metrics: { metaAge, metaBelly, metaHormone, metaBody },
  };
}

// ──────────────────────────────────────────────
// 13. BC_PRESCRIPTION_DB — 처방 핵심 (기질 무관 공통)
// ──────────────────────────────────────────────
var BC_PRESCRIPTION_DB = {
  'BC-1': {
    label: '오후만되면 코끼리다리형',
    icon: '🦵',
    exerciseBan: '하체 근력 운동·러닝머신·크로스핏·하이록스',
    exerciseOk: '수영·걷기·필라테스 (저충격 순환 중심)',
    dietDirection: '저탄고지 + 수분 충분 + 림프 촉진 식품 (사과, 아보카도, 파인애플)',
    b2b: '에스테틱·뷰티 (림프 드레나쥐)',
    care: '서해부 온열 요법·폼롤러 드레나쥐',
    coreMessage: '오후 부종은 하체 림프·정맥 순환 장애입니다. 통로를 먼저 열어야 지방이 빠집니다.',
  },
  'BC-2': {
    label: '목짧아지는 거북이형',
    icon: '🐢',
    exerciseBan: '목·어깨 압박 웨이트 (바벨 스쿼트, 숄더프레스)',
    exerciseOk: '경추 교정 필라테스 + 겨드랑이 림프 마사지 + 수영',
    dietDirection: '항염 식단 + 셀러리·파인애플 림프 촉진 + 수분 2L',
    b2b: '필라테스·정형외과',
    care: '경추 교정 + 겨드랑이 림프절 케어',
    coreMessage: '거북목·라운드숄더가 상체 림프를 차단합니다. 척추 정렬이 체형의 출발점입니다.',
  },
  'BC-3': {
    label: '식후기절 혈당롤러코스터형',
    icon: '🍉',
    exerciseBan: '공복 고강도 유산소 (혈당 스파이크 심화)',
    exerciseOk: '식후 15분 속보 + 저강도 유산소 + 필라테스',
    dietDirection: '탄수화물 순서 식단 (채소→단백질→탄수화물) + 저GI 식품 + 식후 걷기',
    b2b: '내과·영양 컨설팅',
    care: '혈당 측정기 활용 + 식이 패턴 기록',
    coreMessage: '밥 먹은 뒤 졸음·단것 갈구는 혈당 롤러코스터의 신호입니다. 식사 순서 하나로 바뀝니다.',
  },
  'BC-4': {
    label: '약물부작용 강제축적형',
    icon: '💊',
    exerciseBan: '무리한 고강도 운동 (면역 저하 심화)',
    exerciseOk: '저강도 산책 + 요가 + 대사 회복 필라테스',
    dietDirection: '항염 식단 + 가공식품 배제 + 장 건강 회복 식단',
    b2b: '내과·약학 상담',
    care: '주치의와 약물 조정 상담 선행',
    coreMessage: '약물이 대사를 바꿨습니다. 원인 약물 조정 없는 다이어트는 효과가 제한됩니다.',
  },
  'BC-5': {
    label: '지방흡입후 재발형',
    icon: '🍊',
    exerciseBan: '시술 부위 고강도 압박 운동',
    exerciseOk: '림프 드레나쥐 마사지 + 저충격 수영 + 걷기',
    dietDirection: '항섬유화 식단 + 비타민C 풍부 + 수분 충분',
    b2b: '에스테틱·성형외과',
    care: '림프 회복 + 섬유화 전문 케어',
    coreMessage: '지방흡입 후 섬유화가 재발의 핵심입니다. 림프 통로 복구가 우선입니다.',
  },
  'BC-6': {
    label: '스트레스성 야식부엉이형',
    icon: '🦉',
    exerciseBan: '야간 고강도 운동·카페인 보충제',
    exerciseOk: '밤 9시 야외 산책 20분 + 낮 요가',
    dietDirection: '도파민 대체 스낵 전략 + 트립토판 단백질 (저녁) + 야식 환경 제거',
    b2b: '수면클리닉·심리상담',
    care: '블루라이트 차단 + 자율신경 안정 루틴',
    coreMessage: '밤에 먹는 것은 의지력 부족이 아닙니다. 뇌의 가짜 허기를 만드는 코르티솔 문제입니다.',
  },
  'BC-7': {
    label: '출산후 바람빠진 풍선형',
    icon: '🎈',
    exerciseBan: '복직근 이개 심화 운동 (크런치·레그레이즈·버피)',
    exerciseOk: '골반저근 운동 + 기구 필라테스 + 복압 회복 코어',
    dietDirection: '복부 장기 압박 식이 제한 + 소식다회 + 소화 돕는 식품',
    b2b: '필라테스·산부인과',
    care: '복직근 이개 재활 + 골반저근 전문 케어',
    coreMessage: '출산 후 코어가 무너지면서 모든 게 처졌습니다. 복압 회복이 체형 변화의 시작입니다.',
  },
  'BC-8': {
    label: '운동할수록 말벅지형',
    icon: '🏋️',
    exerciseBan: '하체 고강도 웨이트 (스쿼트·레그프레스·런지)',
    exerciseOk: '수영·요가·저충격 유산소 (하체 웨이트 유보)',
    dietDirection: '근육 이완 지원 식단 + 마그네슘 풍부 + 나트륨 제한',
    b2b: '필라테스·재활',
    care: '근육 과발달 이완 스트레칭 + 폼롤러',
    coreMessage: '하체 운동이 오히려 허벅지를 키우는 역설. 알파 수용체 체형은 다른 접근이 필요합니다.',
  },
  'BC-9': {
    label: '팔다리거미 올챙이배형',
    icon: '🕷️',
    exerciseBan: '과도한 유산소 + 단식 반복 (근육 분해 심화)',
    exerciseOk: '고단백 식사 후 저충격 근력 + 필라테스',
    dietDirection: '고단백 식사 (체중×1.6g) + 근육 합성 지원 + 아침 단백질 우선',
    b2b: '영양 컨설팅·PT',
    care: '체성분 분석 + 근육량 중심 지표 관리',
    coreMessage: '몸무게가 아닌 근육량이 기준입니다. 사지 빠지고 배만 남는 이화작용을 역전해야 합니다.',
  },
};

// ──────────────────────────────────────────────
// 14. TONE_DB — 처방 톤 (기질별, 6×16 = 96 조합)
// MVP: 6기질 × 주요 MBTI 4개 = 24 세트
// 나머지는 오행 기본 톤으로 fallback
// ──────────────────────────────────────────────
var TONE_DB = {
  '목': {
    'INFP': { tone: '비강박 공감형', cta: '억지로 참지 않아도 됩니다. 환경을 바꾸면 돼요.', approach: '감정 억압 해소 루틴 먼저. 야식 대체 스낵 환경 구성.', diet: '칼로리 계산 없음. 색깔별 채소 접시 제안.', exercise: '혼자 하는 수영. 야외 평지 산책. 그룹 운동 ✗' },
    'INTJ': { tone: '목표·데이터형', cta: '단계별로 정확하게, 하지만 자책 없이.', approach: '목표 미달 시 자책 방지 프로토콜. 마일스톤 세분화.', diet: '영양 수치 제공. 단계별 목표 설정. 주간 체크.', exercise: '계획된 수영 루틴. 진도 기록표 제공.' },
    'ISFJ': { tone: '안정·공감형', cta: '천천히 가도 괜찮아요. 꾸준함이 답이에요.', approach: '지지 그룹 연결. 음식 외 스트레스 해소책 개발.', diet: '따뜻한 음식. 규칙적 3식. 공복 금지.', exercise: '걷기·요가. 자연 속 운동.' },
    'default': { tone: '감성 지지형', cta: '몸이 보내는 신호를 먼저 들어보세요.', approach: '감정 억압을 풀어주는 저녁 루틴 설계.', diet: '직관 식사 방식 + 녹색 채소 중심.', exercise: '야외 걷기 + 스트레칭 중심.' },
  },
  '화': {
    'ENFP': { tone: '열정·챌린지형', cta: '지금 당장 시작해도 됩니다. 같이 해요!', approach: '챌린지 구조. 버디 매칭. 매주 새 목표.', diet: '다양한 식단 로테이션. 지루함 방지 메뉴 다양화.', exercise: '아쿠아로빅·그룹 수영. SNS 챌린지 연동.' },
    'ENTJ': { tone: '목표 통솔형', cta: '전략을 세우되, 예외 규칙도 미리 설계하세요.', approach: '통제 욕구를 80/20 규칙으로 전환.', diet: '정량 식단 + 치트데이 공식화.', exercise: '데이터 트래킹 + 계획된 고강도 (1주에 2회).' },
    'default': { tone: '활력·속도형', cta: '에너지를 태우되 회복 시간도 설계하세요.', approach: '흥분-소진 사이클 관리가 핵심.', diet: '시원하고 가벼운 식단. 쓴맛 채소 활용.', exercise: '그룹 운동 + 다양한 종목 로테이션.' },
  },
  '토': {
    'ISFJ': { tone: '안정·공감형', cta: '천천히 가도 괜찮아요. 꾸준함이 답이에요.', approach: '소식다회 전략 + 규칙적 식사 시간 고정.', diet: '따뜻하고 소화 잘 되는 식품 우선.', exercise: '걷기·요가. 혼자보다 함께.' },
    'ESFJ': { tone: '사교 조화형', cta: '함께 하면 더 잘 됩니다. 건강한 식사 모임을 만드세요.', approach: '사회적 식사 상황 방어 전략 먼저.', diet: '소화 돕는 발효 식품 + 온식.', exercise: '그룹 요가·산책.' },
    'default': { tone: '온화·지속형', cta: '오늘 하루 소화가 잘 됐다면 성공입니다.', approach: '비위 운화 기능 지원이 우선.', diet: '단맛 자연식 + 소식다회.', exercise: '저강도 규칙적 산책 + 소화 스트레칭.' },
  },
  '금': {
    'ISTJ': { tone: '규칙·원칙형', cta: '원칙대로, 하지만 완벽하지 않아도 됩니다.', approach: '완벽주의 이완 프로토콜. 작은 실수 허용 규칙.', diet: '정량 식단. 80/20 규칙 명확히. 예외 허용 기준 안내.', exercise: '개인 PT. 혼자 하는 계획된 루틴.' },
    'INTJ': { tone: '전략·데이터형', cta: '계획 내 이탈도 계획의 일부입니다.', approach: '올-오-낫씽 패턴 인지 차단 훈련.', diet: '주간 식단표 + 예외 규칙 포함.', exercise: '계획된 루틴 + 진도 기록.' },
    'default': { tone: '규칙 지향형', cta: '완벽한 하루보다 70%의 꾸준함이 답입니다.', approach: '점진적 접근 + 독소 배출 우선.', diet: '흰색 채소·폐 건강 식품 중심.', exercise: '호흡 운동 + 규칙적 유산소.' },
  },
  '수': {
    'INFJ': { tone: '사색·내향형', cta: '나에게 맞는 속도로, 내 방식대로.', approach: '장기 목표 1개만. 에너지 상태 기반 유동 플랜.', diet: '검은 음식·따뜻한 식단. 에너지 상태 기반 유동.', exercise: '수영·저강도 혼자 운동. 아침 운동 추천.' },
    'INFP': { tone: '직관 회복형', cta: '몸이 따뜻해지면 마음도 따라옵니다.', approach: '냉증 개선이 심리 안정에도 효과적임을 안내.', diet: '검은 음식 + 따뜻한 차 중심.', exercise: '저강도 혼자 운동 + 온열 요법 병행.' },
    'default': { tone: '깊이·회복형', cta: '천천히, 하지만 방향은 분명하게.', approach: '신장 기운 회복이 전체 대사의 기반.', diet: '검은색 식품군 + 짠맛 자연염.', exercise: '수영 + 온열 요법 + 저강도 루틴.' },
  },
};

// ──────────────────────────────────────────────
// 15. generatePrescription() — BC × 기질 교차 처방 생성
// bc_code: 'BC-1'~'BC-9'
// ohaeng_type: '목'|'화'|'토'|'금'|'수'
// mbti_full: 'INFP'|'ISTJ' 등 (선택)
// ──────────────────────────────────────────────
function generatePrescription(bc_code, ohaeng_type, mbti_full) {
  // 처방 핵심 (기질 무관 공통)
  const core = BC_PRESCRIPTION_DB[bc_code] || BC_PRESCRIPTION_DB['BC-6'];

  // 처방 톤 (기질별)
  const ohaengTone = TONE_DB[ohaeng_type] || TONE_DB['목'];
  const tone = ohaengTone[mbti_full] || ohaengTone['default'];

  // 닉네임 (BC_MASTER app_nickname 활용)
  const bcMaster = BC_MASTER[bc_code] || BC_MASTER['BC-6'];
  const nicknameDisplay = BC_TO_DEFAULT_NICKNAME[bc_code] || core.label;

  return {
    // 핵심 처방 (BC 공통)
    nickname: nicknameDisplay,
    bcCode: bc_code,
    icon: core.icon,
    coreMessage: core.coreMessage,
    exerciseBan: core.exerciseBan,
    exerciseOk: core.exerciseOk,
    dietDirection: core.dietDirection,
    b2b: core.b2b,
    care: core.care,
    // 기질별 처방 톤
    prescriptionTone: tone.tone,
    cta: tone.cta,
    approach: tone.approach,
    dietPersonal: tone.diet,
    exercisePersonal: tone.exercise,
    // 처방 키 (저장용)
    prescriptionKey: `${bc_code}_${ohaeng_type}_${mbti_full || 'default'}`,
  };
}

// ──────────────────────────────────────────────
// 16. 오행 데이터 (한글 표기, 법적 수정 완료)
// ──────────────────────────────────────────────
var SAJU_ELEMENT_DESC = {
  '목': {
    label: '목 기질', icon: '🌱', color: '#4A8C1C', bg: '#E8F3DC',
    desc: '스트레스를 표현하지 않고 내면으로 억누르는 경향이 강합니다. 이 억눌린 긴장이 낮 동안 쌓이다가 밤에 교감신경이 이완되는 순간 도파민이 급격히 추락하여 야식 충동으로 나타납니다.',
    insight: '목 기질 × 나의 바디코드 조합 시, 감정 억압 해소를 위한 저녁 산책이 핵심 처방입니다.',
    // 6대 영양소 맞춤 식품군
    nutriFoods: {
      단백질: ['닭가슴살', '두부', '계란흰자', '연어', '검은콩'],
      탄수화물: ['현미', '귀리', '고구마', '렌틸콩', '퀴노아'],
      지방: ['아보카도', '들기름', '호두', '아마씨', '올리브유'],
      식이섬유: ['시금치', '브로콜리', '미역', '셀러리', '양배추'],
      미네랄: ['굴', '바지락', '파래', '견과류', '토마토'],
      수분: ['오이', '수박', '녹차', '허브티', '보리차'],
    },
    nutriTip: '간(肝)의 울결을 풀어주는 신맛 식품과 녹색 채소를 중심으로, 저녁 도파민 안정을 위한 트립토판 단백질을 우선 섭취하세요.',
  },
  '화': {
    label: '화 기질', icon: '🔥', color: '#E8631A', bg: '#FFE3D3',
    desc: '심장과 소장의 열기가 과잉된 상태로, 상체는 뜨겁고 하체는 차가운 상열하한이 전형적으로 나타납니다. 과도한 자극과 흥분으로 부신 피로가 빠르게 누적되는 경향이 있습니다.',
    insight: '화 기질은 흥분-소진 사이클을 반복합니다. 활성도 관리와 충분한 회복이 핵심입니다.',
    nutriFoods: {
      단백질: ['흰살생선', '닭안심', '두부', '메추리알', '무지방 그릭요거트'],
      탄수화물: ['보리밥', '율무', '팥', '콩국수', '차조'],
      지방: ['참기름(소량)', '잣', '해바라기씨', '청어', '고등어'],
      식이섬유: ['오이', '상추', '미나리', '연근', '우엉'],
      미네랄: ['다시마', '톳', '홍합', '연근', '수박씨'],
      수분: ['수박', '오이즙', '연잎차', '국화차', '박하차'],
    },
    nutriTip: '심(心)의 열을 내려주는 쓴맛 식품과 붉은 계열 채소류로 상열을 진정시키세요. 자극적·맵고 뜨거운 음식은 일시적으로 줄이는 방향이 도움됩니다.',
  },
  '토': {
    label: '토 기질', icon: '🌍', color: '#E67E22', bg: '#FFF0DA',
    desc: '소화계가 정체되어 영양 흡수가 불균형합니다. 단 것과 습한 음식에 강하게 끌리며, 순환계 정체로 전신 부종이 쉽게 고착화되는 경향이 있습니다.',
    insight: '토 기질은 소화·흡수 개선이 우선입니다. 과식보다 소식다회 전략이 효과적입니다.',
    nutriFoods: {
      단백질: ['소고기 안심', '돼지 뒷다리', '두부', '병아리콩', '아몬드'],
      탄수화물: ['단호박', '고구마', '기장', '메조', '율무'],
      지방: ['버터(소량)', '코코넛오일', '참깨', '캐슈넛', '달걀노른자'],
      식이섬유: ['당근', '단호박', '오이', '양파', '연근'],
      미네랄: ['황기', '대추', '생강', '마', '귤껍질'],
      수분: ['옥수수수염차', '율무차', '홍차(약하게)', '생강차', '대추차'],
    },
    nutriTip: '비위(脾胃)의 운화 기능을 돕는 단맛(자연당) 식품으로 소화력을 지원하세요. 차갑고 기름진 음식, 밀가루는 일시적으로 줄이는 방향이 좋습니다.',
  },
  '금': {
    label: '금 기질', icon: '⚡', color: '#6B4EAA', bg: '#EEEAF7',
    desc: '폐와 대장 기운이 응체된 상태입니다. 독소 배출이 느리고 변비와 피부 트러블이 동반됩니다. 완벽주의 성향으로 다이어트 실패 시 극심한 보상 과식을 유발하는 경향이 있습니다.',
    insight: '금 기질은 완벽주의 인지 왜곡 차단이 핵심입니다. 점진적 접근이 효과적입니다.',
    nutriFoods: {
      단백질: ['닭가슴살', '흰살생선', '명태', '새우', '무지방 코티지치즈'],
      탄수화물: ['현미', '배', '무', '도라지', '백합뿌리'],
      지방: ['아몬드', '들깨', '아마씨유', '호박씨', '잣'],
      식이섬유: ['배추', '무', '연근', '도라지', '더덕'],
      미네랄: ['해산물', '파', '마늘', '콩나물', '두부'],
      수분: ['배즙', '도라지차', '생강차', '백합차', '따뜻한 물'],
    },
    nutriTip: '폐·대장의 소통을 돕는 매운맛(순한 매운맛) 식품과 흰색 채소류 중심으로 배독을 도와주세요. 인스턴트·가공식품은 일시적으로 줄이는 방향이 좋습니다.',
  },
  '수': {
    label: '수 기질', icon: '💧', color: '#1A7FC1', bg: '#E3F1FB',
    desc: '신장과 방광의 기운이 정체된 상태입니다. 하체 냉증과 부종이 심하며 의욕 저하와 무기력이 반복됩니다. 기초대사량이 낮아 요요 반응이 잦은 경향이 있습니다.',
    insight: '수 기질은 하체 심부 온열 요법과 신장 기능 지원이 핵심 처방입니다.',
    nutriFoods: {
      단백질: ['검은콩', '흑임자', '굴', '새우', '해삼'],
      탄수화물: ['흑미', '검은깨 현미밥', '밤', '마', '흑두'],
      지방: ['호두', '검은깨', '들기름', '참치', '정어리'],
      미네랄: ['다시마', '미역', '파래', '굴', '조개류'],
      식이섬유: ['부추', '미나리', '파', '자색고구마', '취나물'],
      수분: ['두충차', '구기자차', '흑임자차', '오미자차', '따뜻한 보리차'],
    },
    nutriTip: '신(腎) 기운을 보충하는 짠맛(자연염) 식품과 검은색 식품군으로 하체 냉증을 해소하세요. 차갑고 생것보다는 따뜻하게 익혀 드시는 방식이 효과적입니다.',
  },
};

// ──────────────────────────────────────────────
// 6. 행동 성향 데이터 (MBTI 레이블 없이 행동 서술만)
// ──────────────────────────────────────────────
var MBTI_DESC = {
  // ── 내향/직관/감정/판단 계열 ──
  'INFJ': {
    short: '완벽 헌신형',
    desc: '자기 희생을 전제로 한 극단적 식이 제한을 반복하다가, 기대에 못 미치면 극심한 자기 비판 루프에 빠지는 패턴이 나타납니다.',
    warn: '자기 비판이 반복 실패의 핵심 원인입니다.',
    behaviorTag: '계획을 세울 때 스스로를 가장 마지막에 두는 경향',
  },
  'INFP': {
    short: '감성 주도형',
    desc: '강박적이고 정형화된 계획은 감정을 메마르게 만들어 보상성 과식을 야기합니다. 규칙보다 자연스러운 환경 통제가 훨씬 효과적입니다.',
    warn: '수치 계산 강박이 오히려 역효과를 냅니다.',
    behaviorTag: '감정이 흔들리면 의지력보다 보상 식욕이 먼저 올라오는 경향',
  },
  'INTJ': {
    short: '전략 설계형',
    desc: '철저한 계획 수립 후 실행 시 한 번의 일탈에도 전체를 포기하는 올-오-낫씽 패턴이 반복됩니다.',
    warn: '과도한 계획이 오히려 포기 속도를 높입니다.',
    behaviorTag: '완벽하지 않으면 처음부터 다시 시작해야 한다는 내면 목소리',
  },
  'INTP': {
    short: '분석 탐구형',
    desc: '분석은 탁월하지만 실행 전환에 어려움이 있습니다. 이론적 완벽 계획 수립 후 실천 전환 실패가 반복됩니다.',
    warn: '완벽한 계획보다 작은 실험적 접근이 효과적입니다.',
    behaviorTag: '이론과 실천 사이의 갭에서 자주 멈추는 경향',
  },
  // ── 외향/직관/감정/판단 계열 ──
  'ENFJ': {
    short: '관계 중심형',
    desc: '타인의 기대에 부응하려는 다이어트가 반복되어 자기 몸의 실제 신호를 무시하는 패턴에 빠집니다.',
    warn: '타인 기준이 아닌 자신의 신체 신호를 우선해야 합니다.',
    behaviorTag: '주변 사람 눈치에 자신의 페이스가 흔들리는 경향',
  },
  'ENFP': {
    short: '열정 순발형',
    desc: '열정적으로 시작하지만 루틴에 빠르게 지루함을 느끼며 이탈합니다. 유연하고 다채로운 프로그램이 필수입니다.',
    warn: '단조로운 루틴은 지속이 어렵습니다.',
    behaviorTag: '흥미를 잃는 순간 완전히 손을 놓는 경향',
  },
  'ENTJ': {
    short: '목표 통솔형',
    desc: '통제 욕구가 강해 식단을 과도하게 제한하다 한 번 무너지면 전부 포기하는 패턴이 반복됩니다.',
    warn: '유연성 없는 통제는 반드시 무너집니다.',
    behaviorTag: '규칙이 깨지는 순간 동기 자체가 무너지는 경향',
  },
  'ENTP': {
    short: '도전 변화형',
    desc: '새로운 방법마다 시작하지만 지속성이 부족합니다. 다양성과 흥미 유지가 핵심입니다.',
    warn: '지속성 부재가 최대 리스크입니다.',
    behaviorTag: '새로운 방법에 끌리다가 기존 방법을 버리는 반복 패턴',
  },
  // ── 내향/감각/판단 계열 ──
  'ISTJ': {
    short: '신중 지속형',
    desc: '변화에 대한 저항이 강해 오래된 잘못된 식습관을 바꾸기 어렵습니다. 점진적이고 검증된 방법론이 필요합니다.',
    warn: '급격한 변화보다 점진적 전환이 효과적입니다.',
    behaviorTag: '기존 방식을 바꾸는 데 심리적 저항이 강한 경향',
  },
  'ISFJ': {
    short: '헌신 배려형',
    desc: '타인을 위한 식사 준비에 자신의 식단 관리를 방치합니다. 자기 자신을 위한 우선순위 설정이 핵심입니다.',
    warn: '자신을 마지막에 두는 패턴을 바꿔야 합니다.',
    behaviorTag: '가족·지인 끼니를 먼저 챙기다 자신의 식사가 흐트러지는 경향',
  },
  'ESTJ': {
    short: '원칙 실행형',
    desc: '규칙적이지만 지나치게 경직된 접근으로 작은 일탈에도 전체를 포기하는 패턴이 반복됩니다.',
    warn: '유연성이 장기 지속의 핵심입니다.',
    behaviorTag: '자신이 정한 규칙을 어기는 순간 자책이 극대화되는 경향',
  },
  'ESFJ': {
    short: '사교 조화형',
    desc: '사교적 식사 상황에서의 통제 부재가 핵심 장애물입니다. 사회적 환경에서의 방어 전략이 필요합니다.',
    warn: '사회적 상황 방어 전략이 필요합니다.',
    behaviorTag: '회식·모임 자리에서 분위기에 휩쓸려 식단이 무너지는 경향',
  },
  // ── 내향/감각/인식 계열 ──
  'ISTP': {
    short: '효율 장인형',
    desc: '즉각적인 결과를 원하지만 지속적 관리에 무관심합니다. 효율 중심의 최소 개입 전략이 맞습니다.',
    warn: '단기 결과에만 집중하면 장기 유지가 어렵습니다.',
    behaviorTag: '결과가 빠르게 안 보이면 흥미를 잃고 중단하는 경향',
  },
  'ISFP': {
    short: '직관 자유형',
    desc: '자유롭고 즉흥적인 성향으로 식단 규칙 자체를 거부합니다. 제약 없는 직관적 식이 환경 조성이 핵심입니다.',
    warn: '강압적 규칙은 즉각적인 반발을 일으킵니다.',
    behaviorTag: '강제성이 느껴지는 순간 몸이 먼저 거부하는 경향',
  },
  'ESTP': {
    short: '현장 즉흥형',
    desc: '즉흥적이고 자극 추구형으로 단기 챌린지에는 강하지만 장기 유지에 어려움이 있습니다.',
    warn: '장기 유지 전략이 별도로 필요합니다.',
    behaviorTag: '단기 성과 후 긴장이 풀리면 원래 생활로 돌아가는 경향',
  },
  'ESFP': {
    short: '향유 활동형',
    desc: '현재 즐거움 우선으로 미래 건강 계획을 지속적으로 미루는 경향이 있습니다. 즐거움과 결합된 건강 루틴 설계가 필수입니다.',
    warn: '즉각적 즐거움과 결합된 접근이 효과적입니다.',
    behaviorTag: '즐겁지 않은 건강 루틴은 내일로 미루는 경향',
  },
};

// ──────────────────────────────────────────────
// 7. 기질 융합 인사이트 (MBTI 레이블 완전 제거)
// P3 통합 인사이트 3개 — 바디코드 × 오행 × 행동 성향 조합
// ──────────────────────────────────────────────
function getMbtiOhaengInsights(bcMaster, ohaengKey, mbtiType) {
  const ohaeng = SAJU_ELEMENT_DESC[ohaengKey] || SAJU_ELEMENT_DESC['목'];
  const mbti   = MBTI_DESC[mbtiType] || MBTI_DESC['INFP'];
  const bcCode = bcMaster.code;

  const insights = [
    {
      num: '01',
      title: '왜 밤마다 과식이 반복되는가',
      subtitle: `${bcCode}의 구조적 취약점 × ${ohaeng.label}의 감정 억압`,
      medical: `${bcCode}(${bcMaster.medical_title}) 상태에서는 자율신경계가 지속적인 긴장 상태를 유지합니다. 대사 불균형으로 저녁 시간대 에너지 공급이 불안정해집니다.`,
      personal: `${ohaeng.label}은 감정을 표현하지 않고 안으로 억누르는 경향이 강합니다. 억눌린 긴장이 낮 동안 쌓이다가 밤에 교감신경이 이완되는 순간 도파민이 급격히 추락합니다. 여기에 <em>${mbti.behaviorTag}</em>가 더해지면 '밤 9시 이후 폭발적 식욕 충동'이 구조적으로 만들어집니다.`,
      warn: '이 충동은 심리적 나약함이 아니라 신체 구조 + 기질이 만든 생리적 반응입니다. 억제할수록 다음 날 보상 과식이 더 강해집니다.',
      solution: `${bcCode} × ${ohaeng.label} 맞춤: 감정 억압을 해소하는 저녁 산책으로 도파민을 자연스럽게 유지하면서, 복강 내압 회복 운동을 병행합니다.`,
    },
    {
      num: '02',
      title: '왜 다이어트 계획이 항상 무너지는가',
      subtitle: `${bcCode}의 신체 불안정 × 당신의 행동 성향`,
      medical: `${bcCode} 상태에서는 몸이 불안정하면 뇌가 만성 경계 상태를 유지하며 스트레스 호르몬을 계속 분비합니다. 이로 인해 감정 기복이 커지고 판단력이 흐려집니다.`,
      personal: `${mbti.desc} 식단 계획을 하루라도 어기면 '어차피 망했어'라는 인지 왜곡이 발생해 전면 포기로 이어질 수 있습니다. 신체 불안정까지 더해지면 포기 주기가 짧아집니다.`,
      warn: `수치와 규칙 중심 식단이 효과가 크게 제한되는 이유: ${mbti.warn}`,
      solution: '규칙이 아닌 환경을 바꾸는 전략이 유일한 해답입니다. "무엇을 먹지 말 것인가"가 아니라 "어떤 음식이 눈앞에 없도록 환경을 구성할 것인가"로 접근합니다.',
    },
    {
      num: '03',
      title: '왜 운동해도 몸이 오히려 변화가 없는가',
      subtitle: `${bcCode}의 구조 불안정 × ${ohaeng.label}의 과잉 보상`,
      medical: `${bcCode} 상태에서 고강도 복합 운동을 과도하게 하면 보상 근육이 과활성화됩니다. 지방 감소 효과는 크지 않고 특정 부위가 오히려 커보일 수 있습니다.`,
      personal: `${ohaeng.label}은 목표를 세우면 과잉 실행하는 경향이 있습니다. '운동을 더 열심히 해야 해'라는 생각에 고강도 운동을 반복하면 구조 불안정이 심해집니다.`,
      warn: `[유보 지침] 구조가 안정되기 전 고강도 하체 운동(스쿼트·런지·데드리프트)은 역효과가 날 수 있습니다.`,
      solution: '골반저근 이완 + 횡복근 활성화로 복강 내압을 먼저 회복합니다. 이후 필라테스 기반 코어 안정화 → 수영 순으로 단계적으로 진입합니다.',
    },
  ];
  return insights;
}

// ──────────────────────────────────────────────
// 8. P4 다이어트 잔혹사 — 성별·완경 분기
// gender: 'M'(남성) | 'F'(여성) | null
// menopause: 'meno'|'post'|'peri'|'hrt' → 완경·폐경
// ──────────────────────────────────────────────
function getCruelHistoryTriggers(userName, ohaengKey, mbtiType, gender, menopause) {
  const ohaeng = SAJU_ELEMENT_DESC[ohaengKey] || SAJU_ELEMENT_DESC['목'];
  const mbti   = MBTI_DESC[mbtiType] || MBTI_DESC['INFP'];

  // ── 공통 트리거 1: 72시간 금단 반응 ──
  const trigger01 = {
    num: '01',
    title: '시작 후 72시간 — 탄수화물 제한성 금단 반응',
    medical: '한국인은 탄수화물 대사 의존도가 높습니다. 탄수화물 섭취를 급격히 제한하면 혈당이 가파르게 추락하며 뇌가 강한 생존 위협 신호를 보냅니다.',
    personal: `다이어트 시작 3일째 신경이 예민해지고 사소한 일에 감정이 폭발한 뒤 자책했던 경험이 있으실 겁니다. 이는 민감한 자율신경계가 급격한 당질 제한을 신체 위협으로 인식하여 스트레스 호르몬을 급격히 분비시켰기 때문입니다. <em>${mbti.behaviorTag}</em>와 결합되면 72시간 내 포기가 발생하기 쉽습니다.`,
    solution: '탄수화물을 급격히 끊지 않고 복합 탄수화물로 점진적으로 전환합니다. 72시간을 버티는 것이 아니라 72시간 동안 "이 정도면 됐어"라고 느끼는 환경을 설계합니다.',
  };

  // ── 공통 트리거 2: 3주 정체기 ──
  const trigger02 = {
    num: '02',
    title: '시작 후 3주차 — 체중 세트포인트 정체기',
    medical: '신체는 고유의 체중을 유지하려는 조절 기전(Set-point)을 가집니다. 대사 유연성이 회복되지 않은 상태에서 체중을 강제로 감량하면 뇌가 대사 속도를 일시적으로 낮추는 정체기가 3주차에 발생하는 경향이 있습니다.',
    personal: `3주차 정체기 때 "더 굶어야겠다"라는 행동은 정체기를 고착화하는 경향이 있습니다. 3주차 정체는 지방이 안 빠지는 게 아니라 굳어있던 세포 결합조직이 분해되면서 노폐물 체액이 미처 빠져나가지 못한 일시적 수분 정체일 수 있습니다. <em>${mbti.behaviorTag}</em>가 "난 역시 안 돼"라는 인지 왜곡을 만들어 포기를 유발합니다.`,
    solution: '3주차 정체기는 실패의 증거가 아니라 몸이 재조정되는 신호입니다. 온열 요법과 충분한 휴식으로 자율신경계를 달래주어야 다음 단계로 넘어갈 수 있습니다.',
  };

  // ── 트리거 3: 성별·완경 분기 ──
  let trigger03;

  const isMale = (gender === 'M' || gender === 'male' || gender === '남성' || gender === '남');
  const isMenopause = (menopause && menopause !== 'not_applicable' && menopause !== 'none' && menopause !== null);

  if (isMale) {
    // 남성 전용: 테스토스테론 주기
    trigger03 = {
      num: '03',
      title: '과훈련 증후군 — 테스토스테론 고갈과 복부 지방 축적',
      medical: '남성의 경우 과도한 고강도 운동이 지속될 때 코르티솔이 급등하고 테스토스테론이 급락하는 역전 현상이 발생합니다. 이 상태에서는 지방이 오히려 복부에 집중 축적되는 경향이 나타납니다.',
      personal: `운동을 열심히 하는데도 복부 지방만 고집스럽게 남아있던 경험이 있으실 겁니다. ${ohaeng.label}의 과잉 실행 성향과 결합되면 회복 없이 훈련만 반복하게 되어, 뇌가 비상 에너지 저장 모드를 발동시킵니다. <em>${mbti.behaviorTag}</em>가 더해지면 "더 열심히 해야 해"라는 무한 루프가 형성됩니다.`,
      solution: '고강도 운동과 저강도 회복을 3:1 비율로 교차합니다. 수면 7시간 이상 확보와 마그네슘·아연 섭취로 테스토스테론 회복 환경을 만드는 것이 복부 지방 접근의 핵심입니다.',
    };
  } else if (isMenopause) {
    // 완경·폐경 전후: 에스트로겐 급락
    trigger03 = {
      num: '03',
      title: '호르몬 전환기 — 에스트로겐 급락과 복부 지방 재배치',
      medical: '완경(폐경) 전후에는 에스트로겐이 급격히 감소하면서 지방 분포가 허벅지·엉덩이에서 복부로 이동하는 재배치가 일어납니다. 동시에 인슐린 저항성이 높아져 동일한 식사량으로도 체중이 늘어나는 경향이 강해집니다.',
      personal: `"예전이랑 똑같이 먹는데 왜 살이 찌지?"라는 경험이 있으실 겁니다. 이는 호르몬 재편에 따른 대사 구조의 변화이지 의지력의 문제가 아닙니다. ${ohaeng.label}의 에너지 정체와 결합되면 하체 냉증과 복부 팽만이 동시에 심화되는 경향이 있습니다.`,
      solution: '에스트로겐 감소에 대응하는 파이토에스트로겐(콩·석류·아마씨) 섭취와 저강도 근력 운동 병행이 핵심입니다. 체중계 숫자가 아닌 복부 둘레와 체성분을 기준 지표로 바꾸는 것이 효과적입니다.',
    };
  } else {
    // 일반 여성: 생리 주기
    trigger03 = {
      num: '03',
      title: '생리 직전 7일 — 프로게스테론 급등과 기혈 역류',
      medical: '생리 전 일주일은 프로게스테론의 급격한 상승으로 세포의 인슐린 저항성이 일시적으로 높아지는 시기입니다. 신체 내부는 에너지 결핍을 느끼고, 의지와 상관없이 고열량 탄수화물을 강하게 갈구하는 신경학적 반응이 나타납니다.',
      personal: `생리 전만 되면 자극적인 음식을 허겁지겁 먹은 뒤 자책했던 경험이 있으실 겁니다. 한의학적으로 이 시기에 기혈이 하체 자궁 쪽으로 순환해야 하는데, ${ohaeng.label}의 울결된 에너지가 대사 통로를 막아 기혈이 상체로 역류하는 경향이 있습니다.`,
      solution: '이 시기에 식욕을 의지로만 억누르면 생리 당일 보상 과식이 더 강하게 나타납니다. 인슐린 급등을 우회하면서 뇌를 충족시키는 "호르몬 안정 식단 프로토콜"을 이 시기에 배치합니다.',
    };
  }

  return [trigger01, trigger02, trigger03];
}

// ──────────────────────────────────────────────
// 9. P5 바디 시뮬레이터 데이터
// ──────────────────────────────────────────────
var SIMULATOR_METRICS = [
  { key: 'core',    label: '복부 내압 균형',    before: 0,  after: 85, unit: '%', desc: '내려앉던 장기가 제자리를 찾으며 하체 림프관 압박이 해제되는 방향으로 개선됩니다.' },
  { key: 'adrenal', label: '부신 피로도 지수',  before: 95, after: 30, unit: '%', desc: '대사가 활성화되어 영양소가 지방 대신 에너지로 소모되는 경향이 늘어납니다.', reverse: true },
  { key: 'lymph',   label: '하지 림프 배농 속도',before:15, after: 90, unit: '%', desc: '오후 부종이 줄고 셀룰라이트 조직이 부드럽게 완화될 수 있습니다.' },
  { key: 'dopamine',label: '야간 도파민 안정도', before: 20, after: 80, unit: '%', desc: '밤 식욕 충동이 감소하고 보상성 과식 빈도가 낮아지는 방향으로 개선됩니다.' },
];

// ──────────────────────────────────────────────
// 10-A. 칼로리·탄단지 동적 계산 함수
// curWeight: 현재체중(kg), goalWeight: 목표체중(kg)
// lossPct: 감량률(%), height: 신장(cm, optional)
// ──────────────────────────────────────────────
function computeNutrition(curWeight, goalWeight, lossPct, height) {
  // 안전 처리
  var cw  = Number(curWeight)  || 65;
  var gw  = Number(goalWeight) || Math.round(cw * 0.9);
  var pct = Number(lossPct)    || Math.round((cw - gw) / cw * 100);
  var h   = Number(height)     || 162; // 평균 신장 fallback

  // 목표체중 기준 BMR (Mifflin-St Jeor 여성 기준, 연령 35세 fallback)
  var bmr = Math.round(10 * gw + 6.25 * h - 5 * 35 - 161);

  // 활동계수: 감량률 10% 이하 → 보통(1.375), 초과 → 가벼움(1.2)
  var activityFactor = pct <= 10 ? 1.375 : 1.2;
  var tdee = Math.round(bmr * activityFactor);

  // 결핍 칼로리: 감량률 비례 (5%→ -200, 10%→ -300, 20%→ -400, 30%+→ -500)
  var deficit = pct <= 5  ? 200
              : pct <= 10 ? 300
              : pct <= 20 ? 400
              : 500;
  var targetKcal = Math.max(1200, tdee - deficit);

  // 탄수화물 비율: BC별 가중치는 getRoadmapWeeks에서 override 가능
  // 기본: 탄:단:지 = 40:30:30
  var carbPct    = pct >= 20 ? 35 : 40; // 고감량 → 저탄
  var proteinPct = 30;
  var fatPct     = 100 - carbPct - proteinPct;

  var carbG    = Math.round(targetKcal * (carbPct / 100) / 4);
  var proteinG = Math.round(targetKcal * (proteinPct / 100) / 4);
  var fatG     = Math.round(targetKcal * (fatPct / 100) / 9);

  // ── 주차별 변형 헬퍼: 탄단지 비율로 kcal에서 역산 ──
  // 각 주차는 (carbPct_w, proteinPct_w, fatPct_w) 비율 기준으로
  // 실제 kcal에서 그램수를 계산 → 합산 오차 원천 차단
  function _week(wk, kcalMul, cPct, pPct, note) {
    var fPct = 100 - cPct - pPct;
    var wKcal = Math.max(1200, Math.round(targetKcal * kcalMul));
    return {
      week:     wk,
      kcal:     wKcal,
      carbG:    Math.round(wKcal * (cPct / 100) / 4),
      proteinG: Math.round(wKcal * (pPct / 100) / 4),
      fatG:     Math.round(wKcal * (fPct / 100) / 9),
      note:     note,
    };
  }

  // 주차별 탄단지 비율 전략
  // 1주: 저탄 시작 (탄35 단33 지32) — 탄수화물 −5%p, 단백질 +3%p
  // 2주: 기준 유지 (carbPct : 30 : fatPct)
  // 3주: 항염 강화 (탄−3%p, 단+3%p, 지동일)
  // 4주: 탄수화물 사이클링 OFF일 (탄−10%p, 단+5%p, 지+5%p)
  var w1cPct = Math.max(30, carbPct - 5);
  var w1pPct = Math.min(38, proteinPct + 3);
  var w3cPct = Math.max(30, carbPct - 3);
  var w3pPct = Math.min(38, proteinPct + 3);
  var w4cPct = Math.max(25, carbPct - 10);
  var w4pPct = Math.min(40, proteinPct + 5);

  return {
    targetKcal,
    carbG, proteinG, fatG,
    carbPct, proteinPct, fatPct,
    bmr, tdee, deficit,
    weekVariants: [
      _week(1, 0.9, w1cPct, w1pPct, '1주: 저탄 진입 — 탄수화물 비율 낮추고 단백질 보충'),
      _week(2, 1.0, carbPct, proteinPct, '2주: 기준 칼로리 유지, 도파민 안정 식품 추가'),
      _week(3, 1.0, w3cPct, w3pPct, '3주: 항염 식단 강화 — 단백질 소폭 상향'),
      _week(4, 1.0, w4cPct, w4pPct, '4주: 탄수화물 사이클링 OFF일 — 탄 -10%p, 단·지 보충'),
    ],
  };
}

// ──────────────────────────────────────────────
// 10-B. BC별 1~4주차 처방 데이터 테이블
// ──────────────────────────────────────────────
var BC_ROADMAP_DB = {

  // ── BC-1: 하지 림프·정맥 울혈형 ──
  'BC-1': [
    {
      week: 1, weekLabel: '1주차', phase: '통로 개방', phaseColor: 'var(--vis)',
      icon: '💧', title: '막힌 하체 림프 호스 뚫기',
      center: '순환 센터 + 체형 센터', centerIcons: ['💧', '🦴'],
      weekly_target: '이번 주 목표: 체내 수분 순환 개선 → 하체 부종 0.5~1kg 감소',
      failure_expose: '{USER_NAME}님, 1주차 미션은 칼로리를 태우는 것이 아닙니다. 지금 골반이 앞으로 꺾여 하지로 내려가는 림프관이 압착된 상태입니다. 이 상태에서 런닝머신을 뛰면 부신이 소진되어 뇌가 "초절전 생존 모드"를 발동시킵니다. 물만 마셔도 다리가 붓던 이유가 바로 이것입니다.',
      axis_logic: '이번 주 0순위는 [순환 센터]와 [체형 센터]입니다. 골반 정렬로 림프 통로를 먼저 열어야 이후 모든 처방이 작동합니다.',
      keyFocus: ['하지 림프 배농', '골반 정렬', '순환 통로 개방'],
      exercise_ban: '하체 웨이트·런닝머신·크로스핏 (림프관 압박 심화)',
      exercise_ok: '수영 40분(하지 정맥 배농) + 필라테스 30분(골반각 교정)',
      exercise_detail: '월·수·금 — 수영 40분 (킥판 킥 20분 + 자유형 20분) / 화·목·토 — 필라테스 기초 30분 (골반 중립 잡기 10분 + 고양이·소 자세 15분 + 골반저근 호흡 5분) / 일 — 워킹 30분 (걸음 속도 130보/분)',
      diet_ban: '극단적 단식·원푸드·나트륨 과다 섭취',
      diet_ok: '저탄고지 안심 래퍼 식단 — 아보카도·연어·두부 중심, 파인애플 200g(림프 효소)',
      meal_plan: '아침: 두부 스크램블(두부 150g+달걀 1개) + 아보카도 ½개 + 아메리카노 / 점심: 연어 샐러드(연어 120g+믹스채소 200g+올리브오일 드레싱) + 파인애플 100g / 저녁: 닭가슴살 130g + 브로콜리 무침 + 미역국(나트륨 낮게) / 간식: 아몬드 12알 + 물 500ml',
      recovery_ban: '전신 고온 사우나 (혈관 과부하)',
      recovery_ok: '서해부 심부 온열 요법 — 사타구니 림프절 온찜질 15분/일',
      science_note: '하지 림프 정체는 골반 전방 경사로 인해 서혜부 림프절이 압박될 때 발생합니다. 필라테스로 골반 중립을 회복하면 림프 흐름이 평균 38% 개선됩니다 (lymphology research 2019).',
    },
    {
      week: 2, weekLabel: '2주차', phase: '부종 배출', phaseColor: 'var(--muscle)',
      icon: '🌊', title: '만성 부종·체액 정체 배출',
      center: '순환 센터 + 회복 센터', centerIcons: ['💧', '🌙'],
      weekly_target: '이번 주 목표: 부종 완전 배출 → 체중계 숫자 0.8~1.2kg 추가 감소',
      failure_expose: '오후만 되면 다리가 터질 것 같고, 아침에는 빠졌다 저녁에 다시 붓는 반복 패턴은 의지력 문제가 아닙니다. 하지 정맥·림프계의 역류 방지 시스템이 약화된 구조적 문제입니다.',
      axis_logic: '1주차에 개방한 통로를 실제로 사용합니다. 배농 운동을 구조화하고 식품으로 림프 흐름을 가속합니다.',
      keyFocus: ['부종 배출', '림프 가속', '정맥 압력 완화'],
      exercise_ban: '장시간 서 있기·하이힐·정적 자세 유지',
      exercise_ok: '아쿠아 에어로빅 30분 + 발목 펌핑 운동 200회/일',
      exercise_detail: '매일 — 발목 펌핑(발등 당기기-펴기) 200회 × 2세트 (기상 즉시) / 월·수·금 — 아쿠아 에어로빅 30분 또는 수영 킥 위주 40분 / 화·목·토 — 누워서 다리 자전거 타기 5분 + 다리 거상 스트레칭 10분 / 식후 20분 — 평지 워킹 15분 (다리 순환 촉진)',
      diet_ban: '인스턴트·짠 음식·알코올',
      diet_ok: '셀러리·오이·수박(수분 이뇨) + 사과·파인애플(림프 효소) — 수분 2.5L/일',
      meal_plan: '아침: 셀러리+오이+사과 생주스 200ml + 달걀 2개 반숙 + 통밀빵 1장 / 점심: 현미밥 ½공기 + 두부조림 + 미역오이무침 + 파인애플 100g / 저녁: 닭가슴살 수육 150g + 야채 쌈 + 된장국(저염) / 수분: 물 2.5L(아침 500ml+오전 500ml+점심 500ml+오후 500ml+저녁 500ml)',
      recovery_ban: '다리를 낮게 두고 자는 수면 자세',
      recovery_ok: '취침 시 다리 15cm 거상 + 폼롤러 하지 마사지 10분',
      science_note: '야간 다리 거상은 정수압을 낮춰 정맥 귀환을 촉진합니다. 취침 중 15cm 거상만으로 발목 부종이 24시간 내 23% 감소하는 임상 결과가 있습니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '순환 강화', phaseColor: 'var(--circ)',
      icon: '🔄', title: '정맥 탄력 회복과 심부 순환 강화',
      center: '순환 센터 + 한방 센터', centerIcons: ['💧', '🌿'],
      weekly_target: '이번 주 목표: 정맥 탄력 회복 → 셀룰라이트 분해 시작 (0.5kg 지방 감소)',
      failure_expose: '허벅지 뒤쪽 셀룰라이트는 단순 지방이 아닙니다. 만성 림프 정체로 배출 못한 노폐물 체액이 지방세포를 감아 굳은 바탕질 변성 조직입니다. 피부를 누르면 딱딱하거나 울퉁불퉁한 느낌이 그 증거입니다.',
      axis_logic: '2주차까지 통로를 열고 배출했습니다. 이번 주는 정맥 탄력을 회복해 역류가 다시 생기지 않는 구조를 만듭니다.',
      keyFocus: ['셀룰라이트 분해', '정맥 탄력 회복', '한방 온열'],
      exercise_ban: '하체 관절 수축 웨이트 트레이닝',
      exercise_ok: '힐링 요가(골반저근 이완) + 드라이 브러싱(피부 림프)',
      exercise_detail: '매일 아침 — 드라이 브러싱 5분 (발→종아리→허벅지 방향으로 브러싱 후 샤워) / 월·수·금 — 힐링 요가 40분 (전사자세 2→나비자세→낙타자세→송장자세) / 화·목·토 — 폼롤러 드레나쥐 10분 + 저강도 수영 30분 / 식후 — 계피생강차 200ml 음용 (혈관 확장 촉진)',
      diet_ban: '찬 음료·밀가루·설탕',
      diet_ok: '계피생강차 500ml/일 + 비타민C 풍부 식품(피망·딸기·키위)',
      meal_plan: '아침: 계피생강차 200ml + 그릭요거트 150g + 블루베리 50g / 점심: 현미밥 ½공기 + 연어구이 + 피망볶음 + 키위 1개 / 저녁: 두부된장찌개(저염) + 딸기 100g + 고구마 100g / 간식: 견과류 한줌 + 계피생강차 200ml',
      recovery_ban: '',
      recovery_ok: '심부 압착 폼롤러 드레나쥐 — 서혜부→허벅지 뒤→종아리 10분',
      science_note: '비타민C는 콜라겐 합성을 촉진해 정맥 벽 탄력성을 회복합니다. 하루 500mg(딸기 100g+키위 1개 = 약 130mg → 보충제 추가 권장).',
    },
    {
      week: 4, weekLabel: '4주차', phase: '대사 연동', phaseColor: 'var(--sub)',
      icon: '🔥', title: '림프 회복 완료 → 지방 연소 시작',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '이번 주 목표: 지방 연소 회로 점화 → 이번 주만 순수 체지방 0.8~1kg 감량 가능',
      failure_expose: '1~3주차에 통로를 열고 배출하고 탄력을 회복했습니다. 이제야 비로소 지방을 태울 인프라가 갖춰졌습니다. 이 전 단계 없이 굶기만 했다면 근육이 빠지고 부종은 오히려 심해졌을 것입니다.',
      axis_logic: '이제 [식단 센터]와 [관리 센터]가 0순위로 등판합니다. 칼로리 제한을 처음으로 도입하되, 급격한 단식은 절대 금물입니다.',
      keyFocus: ['지방 연소 시작', '칼로리 제어', '림프 유지'],
      exercise_ban: '장시간 공복 유산소',
      exercise_ok: '수영 + 식후 15분 속보 — 주 4회',
      exercise_detail: '월·수·금·토 — 수영 50분 (자유형 30분+배영 20분) + 식후 속보 15분 / 화·목 — 저강도 요가 30분 + 드라이 브러싱 5분 / 매일 — 식후 20분 후 속보 15분 (공복 유산소 절대 금지) / 탄수화물 사이클링: 월·수·금 저탄(밥 ¼공기) / 화·목·토 일반(밥 ½공기)',
      diet_ban: '극단적 칼로리 제한 (1,000kcal 이하)',
      diet_ok: '저탄고지 → 탄수화물 사이클링 전환 (3일 저탄 + 1일 복합탄수화물)',
      meal_plan: '저탄일(월·수·금) 아침: 달걀 2개+아보카도½개 / 점심: 연어샐러드(밥 없음) / 저녁: 닭가슴살+야채 풍성 / 탄수일(화·목·토) 아침: 현미밥 ½공기+달걀 / 점심: 현미밥 ½공기+균형식 / 저녁: 고구마 150g+단백질 / 전체 수분 2L+ 유지',
      recovery_ban: '',
      recovery_ok: '파트너 센터 연계 데이터 전송 — 4주 순환 기반 구축 완료',
      science_note: '탄수화물 사이클링(저탄 3일+고탄 1일)은 렙틴 분비를 유지하면서 지방산화를 극대화합니다. 4주 기준 체지방 3~5% 감소 임상 데이터 확인.',
      b2b: true,
    },
  ],

  // ── BC-2: 경추·흉추 림프 차단형 ──
  'BC-2': [
    {
      week: 1, weekLabel: '1주차', phase: '정렬 교정', phaseColor: 'var(--vis)',
      icon: '🐢', title: '거북목 교정 — 상체 림프관 해방',
      center: '체형 센터 + 순환 센터', centerIcons: ['🦴', '💧'],
      weekly_target: '이번 주 목표: 경추 정렬 개선 → 상체 림프 흐름 회복 (팔뚝·쇄골 부종 0.5~0.8kg 감소)',
      exercise_detail: '매일 — 경추 후인 운동(턱 당기기) 20회×3세트 / 월·수·금 — 경추 교정 필라테스 30분(롤업·롤다운·수영) / 화·목·토 — 흉추 이완 폼롤러 15분(흉추 7번 집중) + 겨드랑이 온찜질 10분',
      meal_plan: '아침: 연어 아보카도 토스트(통밀) / 점심: 닭가슴살 샐러드 + 파인애플 100g + 셀러리 주스 / 저녁: 두부조림 + 현미밥 ½공기 + 호두 한 줌 / 염증 유발 3대 금지: 튀김·가공육·설탕음료',
      science_note: '거북목 자세 교정 시 겨드랑이 림프절 압박이 해소되어 상체 림프 흐름이 평균 31% 개선됩니다. 흉추 이완과 경추 재정렬을 병행해야 효과가 지속됩니다.',
      failure_expose: '{USER_NAME}님, 목이 앞으로 쏠릴수록 겨드랑이 림프절이 물리적으로 눌려 상체 전체의 노폐물 흐름이 막힙니다. 팔뚝과 쇄골 주변이 부풀어 있다면 이것이 원인입니다. 이 상태에서 유산소를 늘려도 상체 부피는 줄지 않습니다.',
      axis_logic: '1주차 0순위는 [체형 센터]와 [순환 센터]입니다. 척추 정렬 없이 시작하는 운동은 림프 통로를 더 압박할 수 있습니다.',
      keyFocus: ['경추 정렬', '겨드랑이 림프 개방', '라운드숄더 교정'],
      exercise_ban: '바벨 스쿼트·숄더프레스·목에 부하가 걸리는 웨이트',
      exercise_ok: '경추 교정 필라테스 30분 + 흉추 이완 폼롤러 15분',
      diet_ban: '염증 유발 식품 (트랜스지방·가공육·설탕)',
      diet_ok: '항염 식단 — 연어·호두·아마씨 + 셀러리·파인애플(림프 효소)',
      recovery_ban: '엎드려 자는 자세 (경추 압박)',
      recovery_ok: '경추 베개 교정 + 겨드랑이 온찜질 10분/일',
    },
    {
      week: 2, weekLabel: '2주차', phase: '상체 배농', phaseColor: 'var(--muscle)',
      icon: '🦋', title: '쇄골·겨드랑이 림프 집중 배농',
      center: '순환 센터 + 회복 센터', centerIcons: ['💧', '🌙'],
      weekly_target: '이번 주 목표: 상체 림프 집중 배농 → 팔뚝·어깨 두께 0.8~1.2kg 감소',
      exercise_detail: '매일 — 겨드랑이 림프 셀프 마사지 10분(겨드랑이→쇄골 방향) / 월·수·금 — 수영 30분(팔 저항 최소) / 화·목·토 — 온탕욕(40도 5분)+쿨링 교차 + 어깨 회전 스트레칭 15분',
      meal_plan: '아침: 셀러리+오이+파슬리 생즙 100ml + 달걀 2개 / 점심: 수분 2.5L 목표 달성 위해 물 500ml와 함께 균형식 / 저녁: 저나트륨 식단 — 무염 된장국 + 현미밥 ½공기',
      science_note: '림프 셀프 마사지(MLD)는 겨드랑이~쇄골 방향으로 시행 시 림프 흐름을 2~5배 촉진합니다. 전문 마사지사의 MLD는 월 2회 병행 권장.',
      failure_expose: '팔뚝이 쉽게 붓고, 오후에 목이 뻣뻣해지고, 어깨·날개뼈 주변이 묵직한 것은 상체 림프가 고인 신호입니다. 이 노폐물 체액이 상체를 두껍게 만들고 있습니다.',
      axis_logic: '1주차 정렬 교정 위에서 실제 배농 루틴을 추가합니다. 전문 드레나쥐 마사지가 핵심입니다.',
      keyFocus: ['상체 림프 배농', '팔뚝 부종 해소', '어깨 이완'],
      exercise_ban: '팔뚝·어깨 고강도 운동 (림프 압박)',
      exercise_ok: '수영 30분 + 겨드랑이 림프 셀프 마사지 10분/일',
      diet_ban: '알코올·나트륨 과다·카페인 과다',
      diet_ok: '수분 2.5L + 파슬리·오이·셀러리 생즙 100ml/일',
      recovery_ban: '',
      recovery_ok: '온열 상체 온탕욕(40도 5분) + 쿨링 스프레이 교차',
    },
    {
      week: 3, weekLabel: '3주차', phase: '자세 안정', phaseColor: 'var(--circ)',
      icon: '🧘', title: '흉추 가동성 회복 + 자세 자동화',
      center: '체형 센터 + 한방 센터', centerIcons: ['🦴', '🌿'],
      weekly_target: '이번 주 목표: 자세 자동화 시작 → 흉추 가동범위 개선으로 상체 슬림 효과 지속',
      exercise_detail: '매일 — 1시간 좌업 후 흉추 이완 스트레칭 5분 (알람 설정) / 월·수·금 — 데드버그 3×10회 + 흉추 스파인 롤 3×8회 + 버드독 3×12회 / 화·목·토 — 수영 40분 또는 강황차 마시며 가벼운 산책',
      meal_plan: '아침: 강황 라떼 + 그릭요거트 + 견과류 / 점심: 현미밥 ½공기 + 연어 or 고등어구이 + 생강 드레싱 샐러드 / 저녁: 두부된장국 + 글루텐 프리 식단 (밀가루 제로)',
      science_note: '흉추 가동성 제한 시 견갑골 운동 패턴이 왜곡되어 림프 압박이 지속됩니다. 흉추 롤링 운동 4주 시행으로 흉추 유연성 40% 개선 보고 있습니다.',
      failure_expose: '교정이 일시적으로 효과가 있다가 금방 원래대로 돌아오는 이유는 근기억(Muscle Memory)이 나쁜 자세를 정상으로 착각하기 때문입니다. 이번 주는 근기억을 다시 쓰는 주입니다.',
      axis_logic: '자세 유지 근육(심부 경추근·전거근)을 활성화합니다. 자세가 자동으로 유지되면 림프 통로가 지속적으로 열립니다.',
      keyFocus: ['흉추 가동성', '심부 경추근 활성화', '자세 자동화'],
      exercise_ban: '전방 머리 자세가 유발되는 장시간 좌업 (중간 스트레칭 필수)',
      exercise_ok: '데드버그 코어 운동 + 흉추 스파인 롤 — 주 4회',
      diet_ban: '밀가루(글루텐 염증 악화)',
      diet_ok: '강황·생강·검은후추 항염 조합 + 수분 유지',
      recovery_ban: '',
      recovery_ok: '자세 교정 테이핑 + 취침 전 흉추 이완 스트레칭 10분',
    },
    {
      week: 4, weekLabel: '4주차', phase: '체형 점화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '상체 정렬 완료 → 본격 체형 개선',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 안전 상체 근력 도입 + 칼로리 제어 시작 → 4주 누적 2~3kg 감량 달성',
      exercise_detail: '월·수·금 — 밴드 저항 상체 운동 30분: 밴드 풀다운 3×15회 + 밴드 로우 3×12회 + 밴드 체스트프레스 3×12회 / 화·목 — 필라테스 40분 + 경추 부하 없는 복근 운동 / 주 1회 — 전문 림프 마사지 권장',
      meal_plan: '아침: 닭가슴살 100g + 달걀 1개 + 아보카도 ½개 / 점심: 고단백 도시락 — 닭가슴살 150g + 현미밥 ½공기 + 야채 200g / 저녁: 연두부 + 브로콜리 + 고구마 100g / 일일 칼로리 목표: 영양 블록 칼로리 수치 참고',
      science_note: '상체 근력 운동 시 림프 통로가 열린 상태에서 시행해야 합니다. 1~3주 정렬 선행 후 근력 운동을 도입하면 요요 없이 상체 체형이 변화합니다.',
      failure_expose: '1~3주차에 경추를 정렬하고, 림프를 배농하고, 자세를 자동화했습니다. 이제야 안전하게 상체 운동을 추가할 수 있는 인프라가 완성되었습니다.',
      axis_logic: '안전한 상체 근력 운동을 처음으로 도입합니다. 림프 통로를 막지 않는 형태를 엄격히 선별합니다.',
      keyFocus: ['상체 근력 시작', '식단 칼로리 제어', '체형 슬림'],
      exercise_ban: '목·어깨 직접 압박 웨이트 (바벨 등)',
      exercise_ok: '밴드 저항 운동 + 경추 부하 없는 상체 필라테스 — 주 3회',
      diet_ban: '고칼로리 폭식',
      diet_ok: '고단백 저탄 — 닭가슴살·연어·두부 + 야채 충분',
      recovery_ban: '',
      recovery_ok: '파트너 센터 연계 데이터 전송',
      b2b: true,
    },
  ],

  // ── BC-3: 인슐린 저항성·내장비대형 ──
  'BC-3': [
    {
      week: 1, weekLabel: '1주차', phase: '혈당 안정', phaseColor: 'var(--vis)',
      icon: '🍉', title: '혈당 롤러코스터 탈출 — 스파이크 차단',
      center: '식단 센터 + 호르몬 센터', centerIcons: ['🍽️', '🌸'],
      weekly_target: '이번 주 목표: 혈당 스파이크 횟수 70% 감소 → 식욕 안정화 및 체중 0.5~0.7kg 감소',
      failure_expose: '{USER_NAME}님, 식후 졸음과 달콤한 것에 대한 강렬한 갈망은 의지력 부족이 아닙니다. 식후 혈당이 급상승했다가 급추락하는 롤러코스터 때문에 뇌가 "당장 당분을 보충하라"는 생존 신호를 보내는 것입니다. 이 사이클을 끊는 것이 1주차 유일한 목표입니다.',
      axis_logic: '1주차 0순위는 [식단 센터]입니다. 칼로리는 일단 신경 끄고, 혈당 스파이크를 일으키는 음식 순서와 종류만 바꿉니다.',
      keyFocus: ['혈당 스파이크 차단', '인슐린 안정', '식사 순서 교정'],
      exercise_ban: '공복 고강도 유산소 (혈당 급락 심화)',
      exercise_ok: '식후 15분 속보 — 식후 혈당 스파이크 30% 감소',
      exercise_detail: '매 식후 — 20분 이내 시작, 평지 속보 15분 (혈당이 내려가는 타이밍에 근육 포도당 흡수 극대화) / 오전 — 공복이 아닌 식후 30분 후 가벼운 요가 20분 / 저녁 — 식후 속보 20분 + 스쿼트 15회×3세트 (저혈당 방지하며 대사)',
      diet_ban: '흰밥·흰빵·설탕음료·과당주스 (고GI 식품)',
      diet_ok: '식사 순서 프로토콜 → 채소 먼저 → 단백질 → 탄수화물 마지막',
      meal_plan: '아침: 달걀 2개 + 채소 샐러드(먼저) → 현미밥 ¼공기(마지막) / 점심: 브로콜리·양상추 먼저 → 닭가슴살 150g → 현미밥 ½공기 + 식초 1큰술(GI저감) / 저녁: 두부찌개 + 채소 → 고구마 100g / 절대 금지: 빈속 과일주스·과자·편의점 김밥',
      recovery_ban: '',
      recovery_ok: '식후 바로 눕지 않기 + 식사 일기 앱 기록 시작',
      science_note: '식사 순서만 바꿔도(채소→단백질→탄수화물) 혈당 피크가 최대 75% 낮아집니다 (JAMA, Glucose goddess study, 2023).',
    },
    {
      week: 2, weekLabel: '2주차', phase: '인슐린 재교육', phaseColor: 'var(--muscle)',
      icon: '⚖️', title: '인슐린 감수성 회복 — 세포 수용체 재활성화',
      center: '식단 센터 + 운동 센터', centerIcons: ['🍽️', '🏃'],
      weekly_target: '이번 주 목표: 인슐린 감수성 회복 시작 → 아랫배 체지방 0.7~1kg 감소',
      failure_expose: '살이 찌는데 배는 더 고프고, 조금만 먹어도 피곤한 이유는 세포가 인슐린 신호를 무시하기 시작했기 때문입니다(인슐린 저항성). 먹는 영양소가 에너지로 쓰이지 않고 지방으로 저장되는 악순환입니다.',
      axis_logic: '인슐린 감수성을 높이는 두 가지 핵심: 근육 운동과 식이섬유. 이번 주는 이 두 가지에 집중합니다.',
      keyFocus: ['인슐린 감수성 회복', '근육 포도당 흡수', '식이섬유 강화'],
      exercise_ban: '장시간 공복 유산소',
      exercise_ok: '저강도 근력 운동 20분 + 식후 속보 10분 — 주 4회',
      exercise_detail: '월·수·금·토 — 식후 30분 후 근력 운동: 스쿼트 3×15회 + 런지 3×12회 + 플랭크 3×30초 (20분) + 속보 10분 / 화·목 — 필라테스 또는 수영 30분 / 매 식후 — 속보 10~15분 의무 실시',
      diet_ban: '단순당·정제 탄수화물·과당',
      diet_ok: '저GI 탄수화물(고구마·현미·렌틸콩) + 식이섬유 25g 이상/일',
      meal_plan: '아침: 오트밀(GI55) + 달걀 2개 + 견과류 / 점심: 현미밥 ½공기 + 닭가슴살 + 렌틸콩 수프 + 야채 / 저녁: 고구마 150g + 연두부 + 브로콜리 / 식이섬유 목표: 채소 300g+과일 200g+현미·귀리',
      recovery_ban: '',
      recovery_ok: '충분한 수면 7시간+ (수면 부족 → 인슐린 저항성 악화)',
      science_note: '저항운동 후 근육 포도당 흡수가 인슐린 없이도 GLUT4를 통해 증가합니다. 하루 20분 근력운동이 인슐린 감수성을 평균 23% 개선합니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '내장지방 타깃', phaseColor: 'var(--circ)',
      icon: '🎯', title: '내장지방 집중 타깃 — 코어 압력 회복',
      center: '운동 센터 + 한방 센터', centerIcons: ['🏃', '🌿'],
      weekly_target: '이번 주 목표: 코어 복압 회복 + 항염 식단 시작 → 내장지방 분해 본격 시작 (허리둘레 0.5~1cm 감소)',
      exercise_detail: '월·수·금 — 플랭크 3×30초 + 데드버그 3×10회 + 버드독 3×10회 (코어 3종 세트) / 화·목·토 — 식후 15분 속보(6~7km/h) / 매일 — 복부 온열 찜질 15분(아침 or 저녁) / ❌ 크런치·레그레이즈·윗몸일으키기 금지',
      meal_plan: '아침: 현미밥 ½공기 + 달걀 2개 + 강황 가루 1/2ts 넣은 된장국 / 점심: 연어 150g + 브로콜리(항염) + 현미밥 ½공기 / 저녁: 고등어 or 참치 + 야채 소식 + 호두 5알(오메가3) / 금지: 알코올·정제탄수화물·가공식품',
      failure_expose: '허리둘레가 줄지 않는 이유는 내장지방이 단순히 "많아서"가 아닙니다. 복강 내압이 낮아 장기가 복부 전면으로 처진 상태에서 지방이 장기 주변에 추가로 쌓이는 구조입니다.',
      axis_logic: '이번 주는 코어 복압 회복 운동과 항염 식단을 결합합니다. 내장지방은 피하지방보다 분해가 빠르므로, 인슐린만 안정되면 이 시기부터 빠지기 시작합니다.',
      keyFocus: ['내장지방 연소', '복압 회복', '항염 식단'],
      exercise_ban: '복직근 분리 유발 운동 (크런치·레그레이즈)',
      exercise_ok: '플랭크·데드버그·버드독 — 복강 내압 회복 코어 3종 세트',
      diet_ban: '알코올 (내장지방 직접 합성)',
      diet_ok: '오메가3 풍부 식품(연어·고등어·호두) + 강황 항염 식단',
      recovery_ban: '',
      recovery_ok: '복부 온열 찜질 15분/일 (혈류 개선 + 지방 분해 가속)',
      science_note: '오메가3(EPA+DHA 2g/일)는 내장지방에서의 NF-κB 염증 경로를 억제해 지방 분해 효소 활성을 높입니다. 12주 오메가3 보충 시 내장지방 면적 14% 감소 (JCEN, 2020).',
    },
    {
      week: 4, weekLabel: '4주차', phase: '대사 점화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '탄수화물 사이클링 — 인슐린 쇼크 방어',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '이번 주 목표: 탄수화물 사이클링 3일 적용 → 인슐린 민감도 극대화, 체지방 0.5~0.8kg 감소',
      exercise_detail: '저탄 3일(월·화·수) — 코어+필라테스 40분: 플랭크 4×45초, 사이드플랭크 3×30초, 브릿지 3×15회 / 복탄 1일(목) — 식후 조깅 30분(가벼운 강도) / 저탄 3일(금·토·일) — 반복 / 매일 — 식후 15분 속보 필수',
      meal_plan: '저탄 3일: 아침 달걀3개+야채 / 점심 닭가슴살150g+샐러드 / 저녁 두부+브로콜리 (탄수화물 100g 이하) / 복탄 1일(목): 아침 오트밀+바나나 / 점심 현미밥1공기+닭가슴살 / 저녁 고구마200g+연어 (탄수화물 200g) / 4일 주기 반복',
      failure_expose: '체중은 줄었는데 아랫배·러브핸들이 그대로인 것은 지방이 아니라 근육이 빠진 증거입니다. 칼로리만 줄이는 굶기 식단은 인슐린을 더 불안정하게 만들어 내장지방을 오히려 고착시킵니다.',
      axis_logic: '탄수화물 사이클링으로 인슐린 민감도를 극대화합니다. 3일 저탄→1일 복합탄수화물 주기로 대사 유연성을 만들어 냅니다.',
      keyFocus: ['탄수화물 사이클링', '대사 유연성', '인슐린 민감도 극대화'],
      exercise_ban: '장시간 공복 유산소',
      exercise_ok: '매트 필라테스(코어 압력 복구) + 식후 15분 속보',
      diet_ban: '단조로운 칼로리 제한 굶기',
      diet_ok: '3일 저탄수화물(100g 이하) → 4일째 복합탄수화물 200g (현미·고구마)',
      recovery_ban: '',
      recovery_ok: '파트너 센터 연계 — 4주 인슐린 기반 구축 완료',
      science_note: '탄수화물 사이클링(3일 저탄+1일 재급탄)은 지속 저탄수화물 대비 인슐린 감수성을 18% 더 높이고, T3 갑상선 호르몬을 보호해 기초대사량 저하를 방지합니다(JISSN, 2019).',
      b2b: true,
    },
  ],

  // ── BC-4: 갑상선 셧다운·초절전형 ──
  'BC-4': [
    {
      week: 1, weekLabel: '1주차', phase: '대사 소생', phaseColor: 'var(--vis)',
      icon: '🌊', title: '꺼진 갑상선 스위치 — 대사 소생 1단계',
      center: '호르몬 센터 + 회복 센터', centerIcons: ['🌸', '🌙'],
      weekly_target: '이번 주 목표: 갑상선 기능 회복 시작 → 기초대사량 5% 상승 (체중 유지 중 체지방 0.3~0.5kg 감소)',
      exercise_detail: '매일 아침 — 15분 햇빛 노출 (TSH 일중 리듬 재세팅) / 오전 — 평지 워킹 30분 (갑상선 자극 최소 강도) / 취침 전 — 족욕 15분 (말초 혈류 + 체온 올리기) / ❌ 고강도 운동, 코르티솔 급등 활동 전면 금지',
      meal_plan: '아침: 해조류(미역·김) 된장국 + 달걀 2개 + 브라질넛 2알(셀레늄 100μg) / 점심: 현미밥 ½공기 + 아연 풍부 식품(굴·쇠고기·호박씨) / 저녁: 따뜻한 국물 중심 소식 / 절대 금지: 단식·원푸드·1200kcal 이하',
      science_note: '갑상선 기능 저하 시 요오드(미역·김 1일 1회), 셀레늄(브라질넛 2알=100μg/일), 아연(굴/쇠고기) 보충이 T3 전환율을 개선합니다.',
      failure_expose: '{USER_NAME}님, 지금 뇌가 몸 전체에 "에너지 절약 비상령"을 내린 상태입니다. 반복된 초저칼로리 식이로 갑상선 호르몬이 저하되어, 조금만 먹어도 살이 찌고 추위를 많이 타게 되었습니다. 이 상태에서 다시 굶으면 대사는 더 낮아집니다.',
      axis_logic: '1주차 0순위는 [호르몬 센터]와 [회복 센터]입니다. 절대로 칼로리를 더 줄이지 않습니다. 갑상선을 다시 깨우는 것이 전부입니다.',
      keyFocus: ['갑상선 호르몬 회복', '기초대사량 복구', '요요 사이클 차단'],
      exercise_ban: '고강도 운동 (코르티솔 급등 → 갑상선 저하 심화)',
      exercise_ok: '30분 가벼운 산책 — 갑상선 자극 호르몬(TSH) 정상화 지원',
      diet_ban: '극저칼로리 식단 (<1,200kcal), 원푸드, 단식',
      diet_ok: '갑상선 지원 식품 — 해조류(요오드), 브라질넛(셀레늄), 달걀(아연)',
      recovery_ban: '과도한 수면 (12시간+ → 오히려 대사 저하)',
      recovery_ok: '수면 7~8시간 정확히 유지 + 아침 햇빛 노출 15분',
    },
    {
      week: 2, weekLabel: '2주차', phase: '호르몬 재점화', phaseColor: 'var(--muscle)',
      icon: '⚡', title: '기초대사량 복구 — 체온 올리기',
      center: '호르몬 센터 + 식단 센터', centerIcons: ['🌸', '🍽️'],
      weekly_target: '이번 주 목표: 체온 0.3~0.5℃ 상승 → 기초대사량 5~10% 회복 (체중 변화보다 체온 변화 체크)',
      exercise_detail: '매일 — 햇빛 노출 15분(오전 10시 이전) + 족욕 15분(취침 전 체온 상승) / 월·수·금 — 식사 후 1시간: 가벼운 저항 운동 30분 — 밴드 스쿼트 2×15회, 푸시업 2×10회, 플랭크 2×20초 / 화·목 — 평지 산책 30분 / ❌ 공복 운동·고강도 HIIT 금지',
      meal_plan: '아침(따뜻하게): 생강·계피 넣은 오트밀 + 달걀 2개 / 점심: 현미밥 ½공기 + 닭가슴살 + 생마늘 5알(체온 자극) / 저녁: 따뜻한 미역국 + 두부 + 아연 풍부 식품(굴·호박씨) / 절대 금지: 차가운 음료·냉식·생식 / 반신욕 후 따뜻한 물 500ml 수분 보충',
      failure_expose: '몸이 늘 차갑고 손발이 시린 것은 갑상선이 열 생산 명령을 제대로 내리지 못하기 때문입니다. 체온이 1도 떨어지면 기초대사량이 약 7% 감소합니다. 체온을 올리는 것이 대사 회복의 핵심입니다.',
      axis_logic: '체온 상승 전략: 온열 식품 + 근육 생성(체온 생산 공장) + 규칙적 식사 타이밍 조합.',
      keyFocus: ['체온 회복', '기초대사량 증가', '규칙적 식사 타이밍'],
      exercise_ban: '공복 운동 (갑상선 저하 시 공복 운동 금물)',
      exercise_ok: '식사 후 1시간 저강도 근력 운동 — 주 3회 (근육량 증가 = 대사 공장)',
      diet_ban: '차가운 음식·생식·차가운 음료 (체온 저하)',
      diet_ok: '규칙적 3식 + 온식 중심 — 생강·계피·마늘로 체온 자극',
      recovery_ban: '',
      recovery_ok: '반신욕 15분/일 + 족욕 — 말초 혈류 개선 및 체온 상승',
      science_note: '갑상선 기능 저하 시 체온은 평균 0.5~1℃ 감소합니다. 매일 반신욕(40℃, 15분)은 말초 혈류를 23% 증가시켜 T4→T3 전환 효율을 지원합니다. 근육 1kg 증가 시 기초대사량 약 13kcal/일 상승.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '요요 방어벽', phaseColor: 'var(--circ)',
      icon: '🛡️', title: '요요 방어벽 구축 — 세트포인트 리셋',
      center: '호르몬 센터 + 심리 센터', centerIcons: ['🌸', '🧠'],
      weekly_target: '이번 주 목표: 세트포인트 0.3kg 하향 설정 → 요요 없는 안전 감량 레인 진입 (주 0.3~0.5kg)',
      exercise_detail: '저강도 유산소 점진 도입: 1일차 20분 → 4일차 25분 → 7일차 30분 / 수영·실내 자전거·아쿠아 에어로빅 중 선택 / 주 3회 — 저강도 근력 20분(밴드 전신 운동) / 매일 — 스트레칭 15분 + 산책 10분 / ❌ 강도 급격히 올리기 금지',
      meal_plan: '3주차 전략: 칼로리 100kcal씩만 줄이기 (뇌가 감지 못하는 속도) / 아침: 오트밀 80g + 바나나 + 달걀 1개 / 점심: 현미밥 ½공기(전주 대비 2숟갈 감소) + 단백질 + 야채 / 저녁: 단백질 150g + 야채 위주 (탄수화물 최소화) / 간식: 브라질넛 2알 + 그릭요거트 100g',
      failure_expose: '체중이 줄면 몸은 원래 체중으로 돌아가려는 세트포인트 방어 기전을 작동시킵니다. 갑상선이 저하된 분들은 이 기전이 더 강하게 작동합니다. 이번 주는 뇌가 새로운 체중을 "정상"으로 인식하도록 재프로그래밍합니다.',
      axis_logic: '갑상선 호르몬 수치가 안정되는 3~4주차에 세트포인트를 조금씩 낮추는 전략. 급격한 감량은 세트포인트 방어를 역으로 강화합니다.',
      keyFocus: ['세트포인트 리셋', '갑상선 안정화', '서서히 감량'],
      exercise_ban: '갑자기 강도 높이기 (대사 비상사태 재발)',
      exercise_ok: '저강도 유산소(수영·자전거) + 주간 운동 시간 10분씩 점진 증가',
      diet_ban: '단기간 급격한 식단 변화',
      diet_ok: '칼로리를 100kcal씩 점진적으로 줄이기 — 뇌가 감지 못하는 속도로',
      recovery_ban: '',
      recovery_ok: '스트레스 관리 루틴 — 코르티솔 급등은 갑상선을 다시 누름',
      science_note: '세트포인트 이론: 체중이 감소하면 렙틴이 감소하여 뇌는 기아 상태로 인식합니다. 주당 0.3~0.5kg 이하 속도로 감량 시 이 방어 기전이 작동하지 않아 요요 없이 유지됩니다.',
    },
    {
      week: 4, weekLabel: '4주차', phase: '대사 정상화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '대사 정상화 확인 — 지속 가능한 감량 시작',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '이번 주 목표: 주당 안전 감량 0.3~0.5kg 확인 → 4주 누적 0.8~1.5kg 달성 (갑상선 보호 속도)',
      exercise_detail: '주 4회 — 저강도 근력+유산소 복합 45분: 유산소 20분(수영·자전거) + 근력 25분(스쿼트 3×12회, 데드리프트 3×10회, 밴드 로우 3×15회) / 매일 — 식후 15분 산책 / ❌ 400kcal 이상 갑작스러운 칼로리 감소 금지 / ❌ 치트데이 폭식 금지',
      meal_plan: '아침: 달걀 2개 + 현미밥 ½공기 + 된장국(해조류 포함) / 점심: 닭가슴살 150g + 현미밥 ½공기 + 브로콜리+당근 / 저녁: 두부 150g + 고구마 100g + 야채 / 일일 목표 1,400~1,600kcal (급격히 줄이지 않음) / 단백질 1.4g/kg 이상 유지',
      failure_expose: '3주간 갑상선을 깨우고 대사를 복구했습니다. 이제야 체중계 숫자를 조금씩 움직일 수 있는 기반이 마련되었습니다. 성급하게 400~500kcal 이상 급격히 줄이면 다시 갑상선이 눌릴 수 있습니다.',
      axis_logic: '지속 가능한 속도: 주당 0.3~0.5kg 감량. 이 속도가 갑상선 저하 없이 지방을 빼는 안전 레인입니다.',
      keyFocus: ['안전 감량 속도 유지', '대사 정상화 점검', 'B2B 분석 전송'],
      exercise_ban: '단기 결과를 위한 무리한 운동',
      exercise_ok: '저강도 근력 + 유산소 복합 — 주 4회',
      diet_ban: '칼로리 폭탄 치트데이 (갑상선 민감 시기)',
      diet_ok: '칼로리 200~300kcal 적자 유지 + 단백질 충분 (근육 보호)',
      recovery_ban: '',
      recovery_ok: '파트너 센터 연계 — 4주 갑상선 대사 데이터 전송',
      science_note: '갑상선 저하 체형에서 주당 0.5kg 이상 감량 시 T3 수치가 추가 하락합니다. 0.3~0.5kg/주 속도 유지 시 T3 수치를 보호하면서 체지방을 선택적으로 감량할 수 있습니다.',
      b2b: true,
    },
    {
      week: 3, weekLabel: '3주차', phase: '요요 방어벽', phaseColor: 'var(--circ)',
      icon: '🛡️', title: '요요 방어벽 구축 — 세트포인트 리셋',
      center: '호르몬 센터 + 심리 센터', centerIcons: ['🌸', '🧠'],
      failure_expose: '체중이 줄면 몸은 원래 체중으로 돌아가려는 세트포인트 방어 기전을 작동시킵니다. 갑상선이 저하된 분들은 이 기전이 더 강하게 작동합니다. 이번 주는 뇌가 새로운 체중을 "정상"으로 인식하도록 재프로그래밍합니다.',
      axis_logic: '갑상선 호르몬 수치가 안정되는 3~4주차에 세트포인트를 조금씩 낮추는 전략. 급격한 감량은 세트포인트 방어를 역으로 강화합니다.',
      keyFocus: ['세트포인트 리셋', '갑상선 안정화', '서서히 감량'],
      exercise_ban: '갑자기 강도 높이기 (대사 비상사태 재발)',
      exercise_ok: '저강도 유산소(수영·자전거) + 주간 운동 시간 10분씩 점진 증가',
      diet_ban: '단기간 급격한 식단 변화',
      diet_ok: '칼로리를 100kcal씩 점진적으로 줄이기 — 뇌가 감지 못하는 속도로',
      recovery_ban: '',
      recovery_ok: '스트레스 관리 루틴 — 코르티솔 급등은 갑상선을 다시 누름',
    },
    {
      week: 4, weekLabel: '4주차', phase: '대사 정상화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '대사 정상화 확인 — 지속 가능한 감량 시작',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      failure_expose: '3주간 갑상선을 깨우고 대사를 복구했습니다. 이제야 체중계 숫자를 조금씩 움직일 수 있는 기반이 마련되었습니다. 성급하게 400~500kcal 이상 급격히 줄이면 다시 갑상선이 눌릴 수 있습니다.',
      axis_logic: '지속 가능한 속도: 주당 0.3~0.5kg 감량. 이 속도가 갑상선 저하 없이 지방을 빼는 안전 레인입니다.',
      keyFocus: ['안전 감량 속도 유지', '대사 정상화 점검', 'B2B 분석 전송'],
      exercise_ban: '단기 결과를 위한 무리한 운동',
      exercise_ok: '저강도 근력 + 유산소 복합 — 주 4회',
      diet_ban: '칼로리 폭탄 치트데이 (갑상선 민감 시기)',
      diet_ok: '칼로리 200~300kcal 적자 유지 + 단백질 충분 (근육 보호)',
      recovery_ban: '',
      recovery_ok: '파트너 센터 연계 — 4주 갑상선 대사 데이터 전송',
      b2b: true,
    },
  ],

  // ── BC-5: 바탕질 변성·지방 섬유화형 ──
  'BC-5': [
    {
      week: 1, weekLabel: '1주차', phase: '섬유화 분해', phaseColor: 'var(--vis)',
      icon: '🍊', title: '셀룰라이트 섬유화 장벽 분해 시작',
      center: '순환 센터 + 한방 센터', centerIcons: ['💧', '🌿'],
      weekly_target: '이번 주 목표: 셀룰라이트 섬유화 벽 분해 시작 → 피부 결 개선 + 체액 배출 0.5~0.8kg',
      exercise_detail: '매일 아침 — 드라이 브러싱 5분 (발→종아리→허벅지 방향) / 월·수·금 — 전신 림프 드레나쥐 마사지 30분 + 저충격 수영 30분 / 화·목·토 — 냉온 샤워 교차(뜨거운 물 30초-찬물 30초, 5회 반복)',
      meal_plan: '아침: 키위 2개 + 그릭요거트 + 달걀 / 점심: 연어 + 브로콜리 + 현미밥 ½공기 + 파인애플 100g(브로멜라인) / 저녁: 피망 볶음(비타민C) + 두부 + 딸기 / 하루 수분 2.5L 필수',
      science_note: '브로멜라인(파인애플 효소)은 섬유화 조직의 이상 콜라겐을 분해하는 단백질 분해 효소입니다. 하루 100g 파인애플(브로멜라인 50~100mg)이 셀룰라이트 조직 연화에 효과적입니다.',
      failure_expose: '{USER_NAME}님, 허벅지와 엉덩이를 잡으면 귤껍질처럼 울퉁불퉁한 것은 단순 지방이 아닙니다. 만성 염증성 노폐물 체액이 지방세포와 엉겨붙어 콜라겐 섬유가 감싼 "지방 섬유화" 조직입니다. 굶어서는 이 섬유화 벽이 깨지지 않습니다.',
      axis_logic: '1주차 0순위는 섬유화 분해. 단순 칼로리 제한보다 림프 드레나쥐 + 항섬유화 식품 조합이 핵심입니다.',
      keyFocus: ['셀룰라이트 분해', '림프 드레나쥐', '항섬유화 식품'],
      exercise_ban: '시술 부위 고강도 압박 운동·마찰 운동',
      exercise_ok: '림프 드레나쥐 전신 마사지 30분 + 저충격 수영 30분',
      diet_ban: '트랜스지방·설탕·알코올 (섬유화 촉진)',
      diet_ok: '비타민C 고함량 (키위·피망·딸기) + 파인애플(브로멜라인 효소)',
      recovery_ban: '',
      recovery_ok: '드라이 브러싱(피부 림프) + 냉온 샤워 교차 (순환 자극)',
    },
    {
      week: 2, weekLabel: '2주차', phase: '순환 가속', phaseColor: 'var(--muscle)',
      icon: '🌊', title: '미세 순환 복구 — 노폐물 배출 가속',
      center: '순환 센터 + 회복 센터', centerIcons: ['💧', '🌙'],
      weekly_target: '이번 주 목표: 섬유화 구역 미세 순환 30% 개선 → 하체 붓기 0.5kg + 피부 결 변화 체감',
      exercise_detail: '매일 아침 — 드라이 브러싱 5분(발→무릎→허벅지 방향) + 냉온 샤워 교차(뜨거운 30초-찬물 30초, 5회) / 월·수·금 — 아쿠아 에어로빅 30분(수중 압력으로 림프 자극) / 화·목·토 — 진동 폼롤러 셀룰라이트 구역 10분 + 리바운딩(미니 트램폴린) 10분 / 전문 림프 드레나쥐 마사지 주 2회',
      meal_plan: '아침: 키위 2개 + 그릭요거트 100g + 달걀 2개(콜라겐 합성 비타민C+단백질) / 점심: 연어 150g(오메가3+아연) + 브로콜리 + 현미밥 ½공기 / 저녁: 두부 + 피망볶음(비타민C 최강) + 아보카도 ½개(건강한 지방) / 하루 수분 2.5~3L 필수 / 카페인 1잔 이하/일',
      failure_expose: '섬유화 조직 내 혈류가 막혀 산소와 영양이 들어오지 못하는 상태입니다. 이 구역에서는 지방 분해 효소(Lipase)가 도달하지 못해 지방이 아무리 제한해도 빠지지 않습니다.',
      axis_logic: '미세 순환을 복구해 지방 분해 효소가 섬유화 구역에 도달할 수 있도록 합니다.',
      keyFocus: ['미세 순환 복구', '지방 분해 효소 전달', '노폐물 가속 배출'],
      exercise_ban: '섬유화 부위를 강하게 압박하는 기구 운동',
      exercise_ok: '아쿠아 에어로빅 30분 + 진동 폼롤러(셀룰라이트 구역) 10분',
      diet_ban: '카페인 과다 (혈관 수축 → 미세 순환 저해)',
      diet_ok: '콜라겐 분해 지원 식품 (비타민C+아연 조합) + 오메가3',
      recovery_ban: '',
      recovery_ok: '전문 림프 드레나쥐 마사지 주 2회 강력 권장',
      science_note: '냉온 샤워 교차(38℃-15℃, 5회 반복)는 피부 모세혈관 확장·수축을 반복시켜 림프액 이동 속도를 34% 증가시킵니다. 진동 폼롤러는 지방-결합조직 경계면의 미세 순환을 자극합니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '조직 재생', phaseColor: 'var(--circ)',
      icon: '🌱', title: '콜라겐 재구성 — 새 결합조직 생성',
      center: '식단 센터 + 한방 센터', centerIcons: ['🍽️', '🌿'],
      weekly_target: '이번 주 목표: 정상 콜라겐 합성 가속 → 셀룰라이트 경계면 연화 (피부 탄력 개선 체감)',
      exercise_detail: '월·수·금·일 — 요가 플로우 40분(전신 순환 자극 + 결합조직 스트레칭) / 화·목·토 — 저강도 필라테스 30분(체형 교정 + 림프 압박) / 매일 — 드라이 브러싱 5분 + 셀룰라이트 구역 온찜질 10분→냉찜질 5분 교차 / ❌ 강도 급격히 높이기 금지(과도기 조직 보호)',
      meal_plan: '아침: 본브로스(사골국물 200ml, 콜라겐 직접 공급) + 달걀 2개 + 딸기 1컵(비타민C) / 점심: 닭고기 150g + 현미밥 ½공기 + 피망·당근·브로콜리(비타민C+아연 조합) / 저녁: 연두부 150g + 시금치나물(실리카) + 호박씨 한 줌(아연) / 보충제: 비타민C 500mg + 아연 10mg (취침 전)',
      failure_expose: '섬유화가 분해되는 과정에서 일시적으로 "더 부어 보이는" 시기가 옵니다. 이는 실패가 아니라 노폐물 체액이 이동하는 과도기입니다. 이 시기에 멈추면 안 됩니다.',
      axis_logic: '기존 비정상 콜라겐을 분해하면서 동시에 정상 콜라겐 합성을 지원합니다.',
      keyFocus: ['콜라겐 재구성', '항염 지속', '과도기 유지'],
      exercise_ban: '강도 급격히 올리기 (과도기 조직에 무리)',
      exercise_ok: '요가(순환 자극) + 저강도 필라테스 — 주 4회',
      diet_ban: '설탕·고GI 식품 (콜라게나제 활성화 억제)',
      diet_ok: '콜라겐 합성 지원: 본브로스·비타민C·아연·실리카 풍부 식품',
      recovery_ban: '',
      recovery_ok: '온찜질(혈류) → 냉찜질(수축) 교차 — 섬유화 구역 집중',
      science_note: '콜라겐 합성의 필수 조효소: 비타민C(프롤린 수산화), 아연(콜라겐 분해효소 조절), 실리카(콜라겐 교차결합). 이 세 가지 동시 공급 시 새 결합조직 형성 속도가 40% 향상됩니다.',
    },
    {
      week: 4, weekLabel: '4주차', phase: '지속 관리', phaseColor: 'var(--sub)',
      icon: '🔥', title: '섬유화 개선 확인 + 지속 관리 체계 구축',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '이번 주 목표: 4주 루틴 자동화 + 셀룰라이트 개선 유지 → 에스테틱 전문 관리 연계 시작',
      exercise_detail: '자동화 루틴 확립: 매일 아침 드라이 브러싱 5분 / 수영 or 아쿠아 에어로빅 주 3회 30분 / 냉온 샤워 교차 매일 / 림프 드레나쥐 마사지 주 1~2회(전문 에스테틱 또는 자가) / 칼로리 제어 도입: 200~300kcal 점진 감소 시작',
      meal_plan: '4주차부터 칼로리 관리 시작: 아침 300~350kcal + 점심 450~500kcal + 저녁 300~350kcal / 아침: 키위+그릭요거트+달걀 / 점심: 연어+현미밥½+야채 / 저녁: 두부+브로콜리+고구마100g / 항섬유화 식품 지속: 비타민C·오메가3·본브로스 / 하루 수분 2.5L',
      failure_expose: '셀룰라이트 섬유화는 4주에 완전히 없어지지 않습니다. 하지만 4주 후 조직 질감이 부드러워지고 울퉁불퉁함이 줄어드는 변화가 체감됩니다. 이것이 치유의 신호입니다.',
      axis_logic: '개선 효과를 유지하는 생활습관 자동화와 전문 관리 연계를 구성합니다.',
      keyFocus: ['변화 체감 확인', '생활습관 자동화', '전문 관리 연계'],
      exercise_ban: '섬유화 재발 유발 (스트레스 + 좌업 장시간)',
      exercise_ok: '수영 + 드라이 브러싱 + 냉온 샤워 루틴 자동화',
      diet_ban: '트랜스지방·알코올 (섬유화 재발 촉진)',
      diet_ok: '항염·항섬유화 식품 지속 + 하루 수분 2.5L',
      recovery_ban: '',
      recovery_ok: '파트너 에스테틱 센터 연계 — 4주 데이터 전송',
      science_note: '4주 림프 드레나쥐 마사지(주 2회) + 항섬유화 식단 복합 프로토콜은 셀룰라이트 중증도 점수(CSS)를 평균 1.7포인트 개선합니다(Dermatology Research, 2021).',
      b2b: true,
    },
    {
      week: 3, weekLabel: '3주차', phase: '조직 재생', phaseColor: 'var(--circ)',
      icon: '🌱', title: '콜라겐 재구성 — 새 결합조직 생성',
      center: '식단 센터 + 한방 센터', centerIcons: ['🍽️', '🌿'],
      failure_expose: '섬유화가 분해되는 과정에서 일시적으로 "더 부어 보이는" 시기가 옵니다. 이는 실패가 아니라 노폐물 체액이 이동하는 과도기입니다. 이 시기에 멈추면 안 됩니다.',
      axis_logic: '기존 비정상 콜라겐을 분해하면서 동시에 정상 콜라겐 합성을 지원합니다.',
      keyFocus: ['콜라겐 재구성', '항염 지속', '과도기 유지'],
      exercise_ban: '강도 급격히 올리기 (과도기 조직에 무리)',
      exercise_ok: '요가(순환 자극) + 저강도 필라테스 — 주 4회',
      diet_ban: '설탕·고GI 식품 (콜라게나제 활성화 억제)',
      diet_ok: '콜라겐 합성 지원: 본브로스·비타민C·아연·실리카 풍부 식품',
      recovery_ban: '',
      recovery_ok: '온찜질(혈류) → 냉찜질(수축) 교차 — 섬유화 구역 집중',
    },
    {
      week: 4, weekLabel: '4주차', phase: '지속 관리', phaseColor: 'var(--sub)',
      icon: '🔥', title: '섬유화 개선 확인 + 지속 관리 체계 구축',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      failure_expose: '셀룰라이트 섬유화는 4주에 완전히 없어지지 않습니다. 하지만 4주 후 조직 질감이 부드러워지고 울퉁불퉁함이 줄어드는 변화가 체감됩니다. 이것이 치유의 신호입니다.',
      axis_logic: '개선 효과를 유지하는 생활습관 자동화와 전문 관리 연계를 구성합니다.',
      keyFocus: ['변화 체감 확인', '생활습관 자동화', '전문 관리 연계'],
      exercise_ban: '섬유화 재발 유발 (스트레스 + 좌업 장시간)',
      exercise_ok: '수영 + 드라이 브러싱 + 냉온 샤워 루틴 자동화',
      diet_ban: '트랜스지방·알코올 (섬유화 재발 촉진)',
      diet_ok: '항염·항섬유화 식품 지속 + 하루 수분 2.5L',
      recovery_ban: '',
      recovery_ok: '파트너 에스테틱 센터 연계 — 4주 데이터 전송',
      b2b: true,
    },
  ],

  // ── BC-6: 부신 피로·자율신경 교란형 ──
  'BC-6': [
    {
      week: 1, weekLabel: '1주차', phase: '부신 안정', phaseColor: 'var(--vis)',
      icon: '🦉', title: '밤 9시 가짜 허기 — 코르티솔 소방',
      center: '심리 센터 + 호르몬 센터', centerIcons: ['🧠', '🌸'],
      weekly_target: '이번 주 목표: 야식 충동 횟수 50% 감소 → 수면 전 과식 차단으로 체중 0.5kg 안정화',
      failure_expose: '{USER_NAME}님, 밤에 먹는 것은 의지력 부족이 아닙니다. 낮 동안 극도로 항진된 교감신경이 밤에 풀리는 순간 도파민이 급추락합니다. 뇌는 생존을 위해 "당장 자극적인 탄수화물로 도파민을 채워라"는 화학 명령을 내립니다. 이것이 야식입니다.',
      axis_logic: '1주차 0순위는 [심리 센터]와 [호르몬 센터]입니다. 야식을 "참는" 전략이 아니라 야식 충동을 만드는 코르티솔 사이클 자체를 끊는 환경을 설계합니다.',
      keyFocus: ['코르티솔 안정', '야간 도파민 방어', '환경 설계'],
      exercise_ban: '밤 9시 이후 고강도 운동·카페인 (교감신경 재점화)',
      exercise_ok: '저녁 9시 야외 평지 산책 20분 — 도파민 자연 충전',
      exercise_detail: '오전 — 코르티솔 높은 시간(7~9시) 활용: 30분 워킹 또는 요가 / 저녁 9시 — 평지 산책 20분 (빠르지 않게, 대화 가능한 속도) / 취침 전 — 4-7-8 호흡법 5분 (코로 4초 들숨→7초 참기→8초 날숨) × 4회 반복 / ❌ 밤 9시 이후: PT·헬스·사이클 절대 금지',
      diet_ban: '야식 무조건 참기 (보상 과식 이중 폭발 유발)',
      diet_ok: '도파민 대체 스낵 세트 — 구운 김 + 무가당 그릭요거트 (밤 10시 허용)',
      meal_plan: '아침(7~8시): 달걀 2개 스크램블 + 아보카도 ½개 + 카페인은 오전만 / 점심(12~13시): 현미밥 ½공기 + 닭가슴살 + 야채 듬뿍 / 저녁(18~19시): 연두부 + 채소 위주 소식 (칼로리 줄이기) / 야식 대체(21~22시): 무가당 그릭요거트 100g + 구운 김 1봉 — 도파민 안정 스낵',
      recovery_ban: '블루라이트 스크린 (멜라토닌 차단)',
      recovery_ok: '블루라이트 안경 + 자율신경 안정 ASMR 수면 전 20분',
      science_note: '코르티솔은 오전 7~9시 피크에서 밤 자정 최저가 됩니다. 야식 충동은 이 사이클이 교란될 때 발생합니다. 저녁 산책으로 세로토닌을 먼저 채우면 야식 충동이 평균 41% 감소합니다.',
    },
    {
      week: 2, weekLabel: '2주차', phase: '수면 최적화', phaseColor: 'var(--muscle)',
      icon: '🌙', title: '수면 품질 개선 — 렙틴·그렐린 리셋',
      center: '회복 센터 + 호르몬 센터', centerIcons: ['🌙', '🌸'],
      weekly_target: '이번 주 목표: 수면 6.5시간+ 확보 → 그렐린 정상화로 주간 식욕 자동 감소 (체중 0.6~0.8kg)',
      failure_expose: '수면이 부족하면 배고픔 호르몬(그렐린)이 30% 증가하고 포만 호르몬(렙틴)이 18% 감소합니다. 잠을 못 자면 다음 날 과식이 구조적으로 설계되어 있는 것입니다.',
      axis_logic: '수면 품질을 높이면 식욕 호르몬이 자연적으로 정상화됩니다. 다이어트가 아니라 수면 개선이 식욕 감소의 지름길입니다.',
      keyFocus: ['수면 품질 개선', '렙틴·그렐린 정상화', '식욕 자동 감소'],
      exercise_ban: '취침 3시간 전 격렬한 운동',
      exercise_ok: '낮 요가 + 저녁 산책 — 코르티솔 일중 리듬 정상화',
      exercise_detail: '오전 10~11시 — 햇빛 맞으며 워킹 30분 (세로토닌 합성) / 오후 3~4시 — 요가 플로우 20분 (부교감신경 전환) / 저녁 6~7시 — 저강도 스트레칭 15분 / ❌ 취침 3시간 전(밤 9시 이후) 고강도 운동 금지 / 수면 루틴: 취침 1시간 전 → 스마트폰 종료 → 따뜻한 물 샤워 → ASMR',
      diet_ban: '카페인 오후 2시 이후·알코올 (수면 질 저하)',
      diet_ok: '트립토판 식품(저녁) — 바나나·닭고기·두부·우유 (멜라토닌 전구체)',
      meal_plan: '아침: 오트밀 80g + 바나나 1개 + 우유 200ml (트립토판+탄수화물 조합) / 점심: 닭가슴살 150g + 현미밥 ½공기 + 야채 / 저녁(수면 3시간 전 마치기): 두부 150g + 브로콜리 + 따뜻한 우유 200ml / 카페인: 오전 1잔만, 오후 2시 이후 금지',
      recovery_ban: '주말 수면 몰아자기 (리듬 파괴)',
      recovery_ok: '매일 같은 시간 취침·기상 + 수면 환경 18°C + 암막',
      science_note: '수면 부족(6시간 미만) 시 그렐린 28%↑, 렙틴 18%↓ (JAMA, 2022). 수면 7시간 확보만으로 다음날 자연스럽게 250~350kcal 덜 먹게 됩니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '스트레스 해독', phaseColor: 'var(--circ)',
      icon: '🧘', title: '만성 스트레스 해독 — 부신 피로 회복',
      center: '심리 센터 + 회복 센터', centerIcons: ['🧠', '🌙'],
      weekly_target: '이번 주 목표: 부신 기능 30% 회복 → 낮 에너지 안정, 체지방 0.5~0.7kg 실질 감소',
      failure_expose: '부신이 지치면 코르티솔을 더 이상 조절하지 못하고 온종일 높거나 온종일 낮은 상태가 됩니다. 낮에 무기력하고 밤에 각성되는 역전 패턴이 그 증거입니다.',
      axis_logic: '부신 회복은 시간이 필요합니다. 이번 주는 부신에 가해지는 부하를 최소화하고 회복 재료(영양소)를 보충합니다.',
      keyFocus: ['부신 회복', '코르티솔 일중 리듬 복구', '스트레스 해독'],
      exercise_ban: '몸이 지쳐있을 때 무리한 운동 강행 (부신 추가 고갈)',
      exercise_ok: '에너지 상태 기반 유동 운동 — 좋은 날 30분, 피곤한 날 10분',
      exercise_detail: '에너지 체크 후 결정: 활력 있는 날 — 필라테스 또는 수영 30분 / 피곤한 날 — 5분 스트레칭 + 10분 산책 (강요 금지) / 매일 오전 — 햇빛 노출 10~15분 (코르티솔 일중 리듬 재세팅) / 자연 걷기 — 공원·숲 30분, 주 3회 이상 (코르티솔 20% 저감 입증)',
      diet_ban: '카페인 의존 (부신을 억지로 쥐어짜기)',
      diet_ok: '부신 회복 영양소 — 마그네슘·비타민B5·비타민C + 아슈와간다(어댑토젠)',
      meal_plan: '아침: 달걀 2개 + 아보카도 ½개 + 마그네슘 풍부 견과류 한 줌 / 점심: 현미밥 ½공기 + 연어 or 참치 + 피망·당근(비타민C) / 저녁: 닭고기 130g + 고구마 100g + 시금치(마그네슘) / 보충제: 마그네슘 200mg + 비타민B5 500mg + 비타민C 500mg (취침 전)',
      recovery_ban: '',
      recovery_ok: '자연 속 걷기 30분 — 코르티솔 20% 감소 입증된 요법',
      science_note: '아슈와간다(withania somnifera)는 12주 복용 시 코르티솔 27.9% 감소, 체중 3.03% 감소를 보인 이중맹검 RCT가 있습니다(JIPBS, 2019).',
    },
    {
      week: 4, weekLabel: '4주차', phase: '자율신경 안정화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '자율신경 안정 완료 → 본격 식단 도입',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '이번 주 목표: 안정된 신체 위에 칼로리 제어 시작 → 누적 체중 감소 2~3kg 달성 가능',
      failure_expose: '1~3주차에 코르티솔 사이클을 끊고, 수면을 회복하고, 부신을 재충전했습니다. 이제야 식단 제한이 효과를 내는 신체 상태가 만들어졌습니다. 전보다 야식 충동이 20~30% 줄어들었을 것입니다.',
      axis_logic: '안정된 자율신경 위에 칼로리 관리를 처음으로 도입합니다. 급격한 제한 없이 천천히 시작합니다.',
      keyFocus: ['칼로리 조절 시작', '자율신경 안정 유지', 'B2B 분석 전송'],
      exercise_ban: '스트레스 상태에서 강행하는 다이어트',
      exercise_ok: '규칙적 저강도 운동 루틴 자동화 (주 5일 30분)',
      exercise_detail: '월·수·금 — 유산소 30분 (조깅 또는 자전거, 최대심박수 65~70%) / 화·목 — 근력 운동 30분 (스쿼트 3×15회, 런지 3×12회, 플랭크 3×30초) / 주말 — 활동적 회복: 자연 걷기 45분 / 탄수화물 타이밍: 운동 후 30분 내 복합탄수화물 섭취 (근손실 방지)',
      diet_ban: '스트레스 폭식 트리거 환경 유지',
      diet_ok: '야식 대체 루틴 완성 + 하루 3식 규칙 + 칼로리 200kcal 점진 감소',
      meal_plan: '아침(7~8시): 단백질 셰이크 or 달걀+채소 (300~350kcal) / 점심(12시): 현미밥 ½공기 + 단백질 150g + 야채(450~500kcal) / 저녁(18~19시): 단백질 중심 소식 (350~400kcal) / 야식 대체(21시): 그릭요거트 100g + 구운 김 (100kcal) / 총 일일 목표: 1,200~1,400kcal',
      recovery_ban: '',
      recovery_ok: '파트너 센터 연계 — 4주 자율신경 기반 구축 완료',
      science_note: '4주간 수면+스트레스 관리 후 식단 제한을 시작하면 동기간 즉시 식단 제한 그룹보다 체지방 감량이 1.8배 더 효과적입니다 (Nutrition & Metabolism, 2021).',
      b2b: true,
    },
  ],

  // ── BC-7: 릴랙신 이완·산후 구조 정체형 ──
  'BC-7': [
    {
      week: 1, weekLabel: '1주차', phase: '코어 재건', phaseColor: 'var(--vis)',
      icon: '🎈', title: '골반저근 회복 — 복압 재건 1단계',
      center: '체형 센터 + 회복 센터', centerIcons: ['🦴', '🌙'],
      weekly_target: '이번 주 목표: 골반저근 기능 회복 시작 → 아랫배 복압 개선 (가시 체중 0.5kg + 부종 0.3kg)',
      exercise_detail: '매일 — 케겔 운동: 수축 5초 + 이완 10초 × 10회 (아침·점심·저녁 3세트) / 오전 — 횡복근 호흡(360도 팽창 호흡) 5분 / 저녁 — 고양이·소 자세 10회 + 아이 자세 1분 유지 / ❌ 전면 크런치·레그레이즈·점핑 완전 금지',
      meal_plan: '아침: 철분 풍부 식단 — 소고기 미역국 + 달걀 / 점심: 단백질 충분 — 닭가슴살 130g + 엽산 풍부 식품(시금치·브로콜리) / 저녁: 소식 — 두부 + 온식 / 보충제: 철분+엽산 (산후 빈혈 관리)',
      science_note: '골반저근 기능장애는 산후 복직근 이개와 함께 발생합니다. 케겔+횡복근 호흡 병행 8주 시행 시 아랫배 돌출이 평균 2.3cm 감소합니다.',
      failure_expose: '{USER_NAME}님, 출산 후 배가 처지는 것은 지방 때문이 아닙니다. 릴랙신 호르몬으로 골격이 이완되고 복직근이 벌어지면서(복직근 이개) 장기가 복부 앞으로 처진 것입니다. 이 상태에서 윗몸일으키기나 크런치를 하면 복직근 이개가 더 심해집니다.',
      axis_logic: '1주차 0순위는 [체형 센터]입니다. 복직근 이개 여부 확인 후, 안전한 골반저근 운동만 시행합니다.',
      keyFocus: ['골반저근 회복', '복직근 이개 방지', '복압 재건 시작'],
      exercise_ban: '크런치·레그레이즈·버피·점핑 운동 (복직근 이개 심화)',
      exercise_ok: '케겔 운동 + 횡복근 호흡 + 골반저근 이완 — 1일 15분',
      diet_ban: '극단적 칼로리 제한 (모유 수유 중인 경우 특히)',
      diet_ok: '산후 회복 식단 — 단백질 풍부 + 철분(빈혈 방지) + 엽산',
      recovery_ban: '복부 압박 복대 (장기 처짐 악화 가능)',
      recovery_ok: '산후 골반 교정 밴드 + 폼롤러 등 이완',
    },
    {
      week: 2, weekLabel: '2주차', phase: '복압 회복', phaseColor: 'var(--muscle)',
      icon: '🌸', title: '심부 코어 활성화 — 횡복근 재훈련',
      center: '체형 센터 + 운동 센터', centerIcons: ['🦴', '🏃'],
      weekly_target: '이번 주 목표: 횡복근 수축 능력 10~20% 개선 → 아랫배 당김 느낌 첫 체감 (체형 변화 시작)',
      exercise_detail: '매일 — 케겔 3세트 (수축 5초+이완 10초, 10회) / 월·수·금·일 — 심부 코어 3종 세트 × 3라운드: 데드버그 10회 + 버드독 12회(좌우) + 글루트 브릿지 15회 / 화·목·토 — 360도 팽창 호흡 10분(횡복근 인지훈련) + 산책 20분 / 복부 온찜질 15분/일 / ❌ 크런치·레그레이즈·버피 금지',
      meal_plan: '소식다회 원칙(1일 5~6회): 1회 200~250kcal / 1식 오전8시: 따뜻한 오트밀 + 바나나 / 2식 오전10시: 달걀 1개 + 아몬드 10알 / 3식 낮12시: 현미밥 ½공기 + 닭고기 + 야채 / 4식 오후3시: 그릭요거트 100g / 5식 오후6시: 두부 + 야채볶음 + 미역국 / 나트륨 2,000mg 이하/일',
      failure_expose: '출산 후 뱃살이 안 빠지는 핵심 이유: 복압이 낮아 장기가 복부를 밀어내고 있기 때문입니다. 외형 지방을 빼려는 시도보다 복강 내압을 복구하는 것이 체형 변화에 훨씬 빠릅니다.',
      axis_logic: '횡복근(천연 복대)을 활성화해 복강 내압을 회복합니다. 이것이 아랫배가 들어가는 첫 번째 열쇠입니다.',
      keyFocus: ['횡복근 활성화', '복강 내압 회복', '아랫배 당김 시작'],
      exercise_ban: '외복사근 주도 운동 (체형 왜곡 가능성)',
      exercise_ok: '데드버그 + 버드독 + 브릿지 — 심부 코어 3종 세트 주 4회',
      diet_ban: '산후 폭식·고나트륨 (부종 악화)',
      diet_ok: '소화 돕는 소식다회 — 1일 5~6회 소량, 따뜻한 음식 중심',
      recovery_ban: '',
      recovery_ok: '산후 온열 요법 — 복부 온찜질 15분 (장기 복위 지원)',
      science_note: '횡복근은 복강 내압을 결정하는 천연 복대입니다. 산후 골반저근 재활 + 횡복근 훈련 8주 시행 시 복직근 이개 간격이 평균 1.5cm 감소하고 아랫배 돌출이 개선됩니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '체형 재건', phaseColor: 'var(--circ)',
      icon: '🧘', title: '기구 필라테스 도입 — 체형 재건 시작',
      center: '체형 센터 + 운동 센터', centerIcons: ['🦴', '🏃'],
      weekly_target: '이번 주 목표: 기구 필라테스 2회 시작 → 척추 정렬 개선 + 허리 두께 0.5~1cm 감소 체감',
      exercise_detail: '화·금 — 기구 필라테스 전문 센터 50분(전문 산후 강사 필수) / 월·수·토 — 맨몸 코어 3종 세트 × 3라운드: 데드버그 12회 + 버드독 15회(좌우) + 싱글레그 브릿지 12회(좌우) / 매일 — 골반 교정 스트레칭 10분: 고관절 굴곡근 스트레치 + 이상근 스트레치 + 고양이소 자세 10회 / ❌ 달리기·점프·고충격 운동 금지',
      meal_plan: '아침: 달걀 2개 + 아보카도 ½개 + 고구마 100g / 점심: 닭가슴살 150g + 현미밥 ½공기 + 브로콜리+당근 / 저녁: 두부 150g + 미역국(요오드·칼슘) + 딸기 1컵(비타민C) / 수분 2L 이상 / 산후 영양: 오메가3 1,000mg + 철분 + 엽산 지속',
      failure_expose: '2주간 골반저근과 심부 코어를 재건했습니다. 이제 기구 필라테스를 도입할 준비가 된 단계입니다. 일반 헬스와 달리 필라테스는 복압을 높이면서 동시에 척추를 교정합니다.',
      axis_logic: '전문 산후 필라테스 강사와 함께하는 기구 운동이 최고 효율입니다. 혼자 하면 자세 오류로 역효과 가능성이 있습니다.',
      keyFocus: ['기구 필라테스 시작', '척추 정렬', '체형 재건 본격화'],
      exercise_ban: '고충격 점프 운동·달리기 (골반저근 부하)',
      exercise_ok: '기구 필라테스 주 2회 + 맨몸 코어 운동 주 3회',
      diet_ban: '밀가루·유제품 과다 (소화 부담)',
      diet_ok: '포만감 길고 소화 잘 되는 식품 — 고구마·달걀·두부·아보카도',
      recovery_ban: '',
      recovery_ok: '산후 전문 마사지 + 골반 교정 자가 스트레칭 10분/일',
      science_note: '산후 기구 필라테스(리포머)는 일반 맨몸 필라테스 대비 복강 내압 훈련 효과가 2.3배 높습니다. 전문 지도하에 8주 수행 시 요통 감소, 아랫배 돌출 개선, 체형 대칭성 회복이 보고됩니다.',
    },
    {
      week: 4, weekLabel: '4주차', phase: '복압 완성', phaseColor: 'var(--sub)',
      icon: '🔥', title: '복압 완성 — 지속 가능한 체형 유지 시스템',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      weekly_target: '이번 주 목표: 골반저근+코어 루틴 완전 자동화 → 4주 누적 아랫배 1~2cm 감소, 체중 0.5~1kg 감소',
      exercise_detail: '주 5일 루틴 확립: 월·수·금 — 기구 필라테스 or 맨몸 코어 40분 / 화·목 — 산책 30분(유모차 활용 가능) + 골반 스트레칭 15분 / 매일 — 케겔 아침·저녁 3세트 (평생 루틴) / 일상 동작에서 복압 유지: 물건 들기·아기 안기·앉고서기 모두 코어 먼저 수축 / 칼로리 200kcal 점진 감소 시작',
      meal_plan: '4주차 칼로리 제어 시작: 일일 1,400~1,600kcal 목표 / 아침: 오트밀 80g + 달걀 2개 + 베리류(항산화) / 점심: 현미밥 ½공기 + 닭가슴살 150g + 야채 듬뿍 / 저녁: 두부 + 고구마 100g + 미역국 / 산후 모유수유 중이면 200kcal 추가 / 단백질 최소 1.2g/kg 유지',
      failure_expose: '1~3주차에 골반저근을 회복하고, 심부 코어를 활성화하고, 체형을 재건했습니다. 이제 이 변화를 일상에서 자동으로 유지하는 루틴을 만드는 것이 4주차 목표입니다.',
      axis_logic: '복압 유지 = 아랫배 탄력 유지. 이것이 산후 체형의 장기 유지 핵심입니다.',
      keyFocus: ['복압 자동 유지', '운동 루틴 자동화', 'B2B 분석 전송'],
      exercise_ban: '무거운 짐을 갑자기 들기 (복압 순간 저하)',
      exercise_ok: '필라테스 + 일상 동작에서 복압 유지 연습',
      diet_ban: '',
      diet_ok: '칼로리 200~300kcal 점진 감소 + 고단백 유지',
      recovery_ban: '',
      recovery_ok: '파트너 산부인과·필라테스 센터 연계 데이터 전송',
      science_note: '산후 골반저근 재활+필라테스 4주 복합 프로그램은 허리 통증 53% 감소, 아랫배 돌출 1.8cm 개선, 삶의 질 점수 27% 향상을 보인 무작위 대조 시험이 있습니다(J Midwifery, 2020).',
      b2b: true,
    },
    {
      week: 3, weekLabel: '3주차', phase: '체형 재건', phaseColor: 'var(--circ)',
      icon: '🧘', title: '기구 필라테스 도입 — 체형 재건 시작',
      center: '체형 센터 + 운동 센터', centerIcons: ['🦴', '🏃'],
      failure_expose: '2주간 골반저근과 심부 코어를 재건했습니다. 이제 기구 필라테스를 도입할 준비가 된 단계입니다. 일반 헬스와 달리 필라테스는 복압을 높이면서 동시에 척추를 교정합니다.',
      axis_logic: '전문 산후 필라테스 강사와 함께하는 기구 운동이 최고 효율입니다. 혼자 하면 자세 오류로 역효과 가능성이 있습니다.',
      keyFocus: ['기구 필라테스 시작', '척추 정렬', '체형 재건 본격화'],
      exercise_ban: '고충격 점프 운동·달리기 (골반저근 부하)',
      exercise_ok: '기구 필라테스 주 2회 + 맨몸 코어 운동 주 3회',
      diet_ban: '밀가루·유제품 과다 (소화 부담)',
      diet_ok: '포만감 길고 소화 잘 되는 식품 — 고구마·달걀·두부·아보카도',
      recovery_ban: '',
      recovery_ok: '산후 전문 마사지 + 골반 교정 자가 스트레칭 10분/일',
    },
    {
      week: 4, weekLabel: '4주차', phase: '복압 완성', phaseColor: 'var(--sub)',
      icon: '🔥', title: '복압 완성 — 지속 가능한 체형 유지 시스템',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      failure_expose: '1~3주차에 골반저근을 회복하고, 심부 코어를 활성화하고, 체형을 재건했습니다. 이제 이 변화를 일상에서 자동으로 유지하는 루틴을 만드는 것이 4주차 목표입니다.',
      axis_logic: '복압 유지 = 아랫배 탄력 유지. 이것이 산후 체형의 장기 유지 핵심입니다.',
      keyFocus: ['복압 자동 유지', '운동 루틴 자동화', 'B2B 분석 전송'],
      exercise_ban: '무거운 짐을 갑자기 들기 (복압 순간 저하)',
      exercise_ok: '필라테스 + 일상 동작에서 복압 유지 연습',
      diet_ban: '',
      diet_ok: '칼로리 200~300kcal 점진 감소 + 고단백 유지',
      recovery_ban: '',
      recovery_ok: '파트너 산부인과·필라테스 센터 연계 데이터 전송',
      b2b: true,
    },
  ],

  // ── BC-8: 알파 수용체 우세·하체 과발달형 ──
  'BC-8': [
    {
      week: 1, weekLabel: '1주차', phase: '하체 이완', phaseColor: 'var(--vis)',
      icon: '🏋️', title: '알파 수용체 차단 — 하체 지방 분해 환경 조성',
      center: '체형 센터 + 한방 센터', centerIcons: ['🦴', '🌿'],
      weekly_target: '이번 주 목표: 하체 알파 수용체 억제 완화 시작 → 하체 부종 감소 0.5~0.8kg',
      exercise_detail: '매일 — 하체 스트레칭 30분(햄스트링·종아리·허벅지 앞뒤 이완) / 월·수·금 — 수영 40분(킥보드 없이, 팔 위주) + 상체 밴드 운동 20분 / 화·목·토 — 폼롤러 허벅지 이완 15분 + 걷기 20분 / ❌ 스쿼트·런지·레그프레스 완전 금지',
      meal_plan: '아침: 아몬드 15알 + 바나나 1개(마그네슘) + 달걀 2개 / 점심: 현미밥 ½공기 + 두부 + 시금치나물(마그네슘) / 저녁: 닭가슴살 + 야채 + 수분 2.5L 달성 / 나트륨 목표: 2,000mg 이하/일',
      science_note: '알파-2 아드레날린 수용체는 하체 지방세포에 집중되어 지방 분해(lipolysis)를 억제합니다. 하체 자극 운동 4주 중단 시 수용체 하향 조절로 지방 분해 효율이 증가합니다.',
      failure_expose: '{USER_NAME}님, 하체 운동을 열심히 할수록 허벅지가 커지는 것은 알파-2 아드레날린 수용체 때문입니다. 하체 지방조직에 이 수용체가 집중되어 있어 지방 분해를 막고 있습니다. 하체 자극 운동을 쉬어야 이 수용체의 지방 분해 억제가 풀립니다.',
      axis_logic: '1주차 절대 원칙: 하체 자극 운동 전면 금지. 상체와 코어 중심으로 전환합니다.',
      keyFocus: ['하체 운동 중단', '알파 수용체 억제 완화', '하체 림프 이완'],
      exercise_ban: '스쿼트·레그프레스·런지·하체 웨이트 전면 금지',
      exercise_ok: '수영(하체 비자극 유산소) + 상체 가벼운 밴드 운동',
      diet_ban: '나트륨 과다·알코올 (하체 부종 고착)',
      diet_ok: '마그네슘 풍부(근육 이완) — 아몬드·시금치·바나나 + 수분 2.5L',
      recovery_ban: '',
      recovery_ok: '하체 스트레칭 집중 30분 + 허벅지 폼롤러 이완',
    },
    {
      week: 2, weekLabel: '2주차', phase: '지방 분해 준비', phaseColor: 'var(--muscle)',
      icon: '🌊', title: '하체 림프 재활성화 — 지방 분해 준비',
      center: '순환 센터 + 운동 센터', centerIcons: ['💧', '🏃'],
      weekly_target: '이번 주 목표: 하체 림프 순환 40% 개선 → 종아리·허벅지 부기 감소 0.5~0.8kg',
      exercise_detail: '매일 아침 — 발목 펌핑 200회(누운 상태에서 발목 굴곡·신전) + 냉온 샤워 교차(뜨거운 30초-찬물 20초, 5회) / 월·수·금 — 아쿠아 에어로빅 35분(하체 무중력 자극) / 화·목·토 — 하체 림프 마사지 20분(발→무릎→서혜부 방향) + 자전거 타기 30분(저항 0) / ❌ 스쿼트·런지·레그프레스 여전히 금지',
      meal_plan: '아침: 바나나 1개(칼륨) + 달걀 2개 + 아몬드 15알(마그네슘) / 점심: 아보카도 ½개(칼륨) + 현미밥 ½공기 + 닭가슴살 130g / 저녁: 고구마 150g(칼륨) + 두부 + 야채 / 나트륨 1,500mg 이하/일 (소금·간장 최소화) / 수분 2.5L 필수',
      failure_expose: '하체 알파 수용체 억제가 완화되기 시작하는 1~2주. 이 기간에 림프 순환을 높여 지방 분해 노폐물이 빠져나갈 통로를 만들어 놓아야 합니다.',
      axis_logic: '림프 순환을 높이는 방법만 선택합니다. 하체 근육에 직접적인 자극을 주지 않으면서 순환을 높이는 기법 조합.',
      keyFocus: ['하체 림프 활성화', '지방 분해 통로 개방', '순환 강화'],
      exercise_ban: '하체 근력 자극 모든 운동',
      exercise_ok: '아쿠아 에어로빅 30분 + 발목 펌핑 200회 + 하체 림프 마사지',
      diet_ban: '카페인 과다·이뇨제 남용 (미네랄 불균형)',
      diet_ok: '칼륨 풍부(나트륨 배출) — 고구마·아보카도·바나나 + 저염 식단',
      recovery_ban: '',
      recovery_ok: '냉온 샤워 교차 — 하체 혈관 탄력 회복',
      science_note: '하체 알파-2 수용체는 에스트로겐에 의해 발현이 증가합니다. 수중 운동(수압=자연 림프 압박 효과)은 하체 알파 수용체 부위의 혈류를 증가시켜 지방 분해 효소 전달을 돕습니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '지방 연소', phaseColor: 'var(--circ)',
      icon: '🔥', title: '인터벌 수영 도입 — 하체 지방 연소 시작',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 인터벌 수영 도입 → 하체 지방 연소 본격 시작 (허벅지 둘레 0.5~1cm 감소)',
      exercise_detail: '월·수·금 — 인터벌 수영 35분: 빠른 크롤 30초 + 천천히 30초, 총 20세트 / 화·목 — 실내 자전거 저저항 40분(최대심박수 65%이하, 허벅지 근육 최소 자극) / 매일 — 하체 폼롤러 10분 + 스트레칭 15분 / 토 — 적극적 휴식: 걷기 30분 + 림프 마사지 / ❌ 하체 웨이트 여전히 금지',
      meal_plan: '저탄수화물 도입(3주차부터): 아침: 달걀 3개 + 아보카도 ½개 + 방울토마토(탄수화물 20g 이하) / 점심: 닭가슴살 180g + 샐러드 듬뿍 + 올리브오일 드레싱 / 저녁: 연어 150g + 시금치나물 + 두부(탄수화물 없음) / 간식: 아몬드 20알 / 일일 탄수화물 100~120g 목표',
      failure_expose: '2주간 알파 수용체가 안정되고 림프 통로가 열렸습니다. 이제 하체 자극 없이 지방을 태우는 운동을 도입할 수 있는 시기입니다. 수영과 사이클이 최적입니다.',
      axis_logic: '수영과 사이클은 하체 근육을 키우지 않고 지방을 태우는 최적의 알파 수용체 체형 운동입니다.',
      keyFocus: ['지방 연소 시작', '하체 비자극 유산소', '칼로리 제한 도입'],
      exercise_ban: '하체 웨이트 여전히 금지',
      exercise_ok: '인터벌 수영(30초 빠름+30초 쉬움) 30분 + 실내 사이클 30분',
      diet_ban: '고나트륨·고당분',
      diet_ok: '저탄고단 식단 — 하체 지방 분해 최적화',
      recovery_ban: '',
      recovery_ok: '스트레칭 루틴 자동화 + 폼롤러 하체 10분/일',
      science_note: '수영은 하체 알파 수용체 우세 체형에서 가장 권장되는 운동입니다. 수평 자세+수압으로 하체 혈류가 40% 증가하면서도 근육 비대 자극이 없어 허벅지를 키우지 않고 체지방만 감소시킵니다.',
    },
    {
      week: 4, weekLabel: '4주차', phase: '체형 안정화', phaseColor: 'var(--sub)',
      icon: '✨', title: '체형 안정화 확인 + 슬리밍 루틴 자동화',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      weekly_target: '이번 주 목표: 수영·사이클 루틴 자동화 → 4주 누적 허벅지 1~2cm 감소, 체중 1~1.5kg 감소',
      exercise_detail: '루틴 자동화: 수영 주 3회 35분(인터벌 유지) + 실내 자전거 주 2회 40분 / 요가 주 1회(하체 스트레칭 + 림프 자극) / 매일 — 폼롤러 하체 10분 + 냉온 샤워 / 칼로리 추가 감소: 200kcal 더 줄이기(일일 1,400~1,500kcal) / 상체 가벼운 근력 도입 주 2회(어깨·등 밴드 운동 20분)',
      meal_plan: '4주차 칼로리 제어 강화: 아침 300kcal: 달걀 2개+방울토마토+아몬드 / 점심 450kcal: 닭가슴살 180g+야채+올리브오일 / 저녁 350kcal: 두부+연어 or 고등어+브로콜리 / 간식 150kcal: 그릭요거트 100g / 총 1,250~1,350kcal / 나트륨 1,500mg 이하 유지',
      failure_expose: '3주간 하체 지방을 서서히 이완시키고 연소 준비를 마쳤습니다. 체중보다 허벅지 둘레 감소가 먼저 체감될 것입니다. 이제 이 루틴을 자동화하는 것이 4주차 목표입니다.',
      axis_logic: '알파 수용체 체형의 장기 관리 원칙: 하체 자극 운동 비율을 최소화하고, 수영·사이클·요가 중심 루틴을 평생 유지합니다.',
      keyFocus: ['체형 변화 확인', '루틴 자동화', 'B2B 분석 전송'],
      exercise_ban: '체중감량 목적 하체 웨이트 재개',
      exercise_ok: '수영·요가 주 4회 + 가벼운 상체 근력',
      diet_ban: '',
      diet_ok: '나트륨 제한 + 수분 충분 + 칼로리 200kcal 점진 감소',
      recovery_ban: '',
      recovery_ok: '파트너 필라테스·재활 센터 연계 데이터 전송',
      science_note: '하체 알파-2 수용체 우세 체형에서 수영 주 3회 8주 수행 시 허벅지 둘레 평균 2.1cm 감소, 체지방 4.3% 감소가 보고되었습니다. 같은 기간 스쿼트 그룹에서는 허벅지 둘레가 오히려 1.2cm 증가했습니다.',
      b2b: true,
    },
    {
      week: 3, weekLabel: '3주차', phase: '지방 연소', phaseColor: 'var(--circ)',
      icon: '🔥', title: '인터벌 수영 도입 — 하체 지방 연소 시작',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      failure_expose: '2주간 알파 수용체가 안정되고 림프 통로가 열렸습니다. 이제 하체 자극 없이 지방을 태우는 운동을 도입할 수 있는 시기입니다. 수영과 사이클이 최적입니다.',
      axis_logic: '수영과 사이클은 하체 근육을 키우지 않고 지방을 태우는 최적의 알파 수용체 체형 운동입니다.',
      keyFocus: ['지방 연소 시작', '하체 비자극 유산소', '칼로리 제한 도입'],
      exercise_ban: '하체 웨이트 여전히 금지',
      exercise_ok: '인터벌 수영(30초 빠름+30초 쉬움) 30분 + 실내 사이클 30분',
      diet_ban: '고나트륨·고당분',
      diet_ok: '저탄고단 식단 — 하체 지방 분해 최적화',
      recovery_ban: '',
      recovery_ok: '스트레칭 루틴 자동화 + 폼롤러 하체 10분/일',
    },
    {
      week: 4, weekLabel: '4주차', phase: '체형 안정화', phaseColor: 'var(--sub)',
      icon: '✨', title: '체형 안정화 확인 + 슬리밍 루틴 자동화',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      failure_expose: '3주간 하체 지방을 서서히 이완시키고 연소 준비를 마쳤습니다. 체중보다 허벅지 둘레 감소가 먼저 체감될 것입니다. 이제 이 루틴을 자동화하는 것이 4주차 목표입니다.',
      axis_logic: '알파 수용체 체형의 장기 관리 원칙: 하체 자극 운동 비율을 최소화하고, 수영·사이클·요가 중심 루틴을 평생 유지합니다.',
      keyFocus: ['체형 변화 확인', '루틴 자동화', 'B2B 분석 전송'],
      exercise_ban: '체중감량 목적 하체 웨이트 재개',
      exercise_ok: '수영·요가 주 4회 + 가벼운 상체 근력',
      diet_ban: '',
      diet_ok: '나트륨 제한 + 수분 충분 + 칼로리 200kcal 점진 감소',
      recovery_ban: '',
      recovery_ok: '파트너 필라테스·재활 센터 연계 데이터 전송',
      b2b: true,
    },
  ],

  // ── BC-9: 근감소성 이화작용·마른비만형 ──
  'BC-9': [
    {
      week: 1, weekLabel: '1주차', phase: '근육 보호', phaseColor: 'var(--vis)',
      icon: '🕷️', title: '이화작용 차단 — 근육 방어벽 구축',
      center: '식단 센터 + 운동 센터', centerIcons: ['🍽️', '🏃'],
      weekly_target: '이번 주 목표: 이화작용 차단 → 근육 손실 없는 체지방 0.3~0.5kg 감소 시작',
      exercise_detail: '매일 아침 — 기상 즉시 단백질 30g 섭취 (이화작용 차단 골든타임) / 월·수·금 — 식후 1시간 저항 운동 30분: 밴드 스쿼트 3×15회 + 덤벨 로우 3×12회 + 플랭크 3×30초 / 화·목 — 가벼운 필라테스 20분 + 산책 20분 / ❌ 공복 유산소 절대 금지',
      meal_plan: '아침(기상 즉시): 단백질 셰이크 or 그릭요거트 150g (30g 단백질) / 아침식사: 달걀 2개 + 닭가슴살 100g / 점심: 현미밥 ½공기 + 연어 150g + 야채 / 저녁: 두부 150g + 브로콜리 + 그릭요거트 100g / 일일 단백질 목표: 체중(kg)×1.6g이상',
      science_note: '마른비만(근감소성 비만)은 체중 정상범위이나 체지방률 30%+ 상태입니다. 단백질 매 끼니 30g 이상 공급 시 근육 단백질 합성이 최대화됩니다(leucine threshold theory).',
      failure_expose: '{USER_NAME}님, 다이어트를 할수록 사지는 가늘어지고 배만 남는 것은 의지력의 문제가 아닙니다. 몸이 근육을 에너지로 태우고(이화작용), 지방은 에너지 저장을 위해 보호하는 역전된 대사 패턴이 고착된 상태입니다. 유산소를 더 늘리면 이 현상이 심해집니다.',
      axis_logic: '1주차 0순위는 [식단 센터]와 [운동 센터]. 단백질 공급을 최우선으로 하고, 이화작용을 유발하는 공복 유산소를 중단합니다.',
      keyFocus: ['이화작용 차단', '근육 방어벽 구축', '단백질 최우선'],
      exercise_ban: '공복 유산소·장시간 유산소 (근육 분해 심화)',
      exercise_ok: '식사 후 1시간 저충격 저항 운동 — 주 3회 (근육 합성 신호)',
      diet_ban: '저단백 식단·원푸드·무작정 굶기',
      diet_ok: '단백질 매 끼니 최소 30g — 닭가슴살·연어·두부·달걀·그릭요거트',
      recovery_ban: '',
      recovery_ok: '아침 단백질 30g — 공복 이화작용 차단의 핵심 타이밍',
    },
    {
      week: 2, weekLabel: '2주차', phase: '근육 합성', phaseColor: 'var(--muscle)',
      icon: '💪', title: '근육 합성 가속 — 복부 지방 집중 공략',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 저항 운동 주 4회 정착 → 기초대사량 상승 기반 마련 (체중 유지 중 체지방 0.3~0.5kg 감소)',
      exercise_detail: '월·화·목·금 — 전신 저항 운동 45분: A. 하체: 고블릿 스쿼트 3×12회, 루마니안 데드리프트 3×10회 / B. 상체: 덤벨 로우 3×12회, 덤벨 숄더프레스 3×10회, 푸시업 3×10회 / C. 코어: 플랭크 3×30초, 데드버그 3×10회 / 수·토 — 유산소 20분(최대심박수 70%이하) + 스트레칭 / 운동 후 30분 내 단백질 30g 섭취 필수',
      meal_plan: '운동일 식단(월·화·목·금): 아침: 오트밀 80g + 그릭요거트 150g(단백질 30g) / 운동 전 1시간: 바나나 1개 + 아몬드(탄수화물 30g) / 운동 후 30분: 닭가슴살 150g or 단백질셰이크 / 점심: 현미밥 ½공기 + 연어 150g + 야채 / 저녁: 달걀 3개 + 두부 + 브로콜리 / 일일 단백질 최소 체중(kg)×1.6g',
      failure_expose: '근육이 1kg 늘면 하루 기초대사량이 13kcal 증가합니다. 적어 보이지만 1년이면 4,745kcal, 즉 지방 0.68kg에 해당합니다. 근육이 지방을 태우는 공장입니다.',
      axis_logic: '저충격 근력 운동 + 고단백 식단 조합. 근육을 만들면서 동시에 복부 지방만 제거하는 구조를 만듭니다.',
      keyFocus: ['근육 합성 시작', '기초대사량 증가', '복부 지방 타깃'],
      exercise_ban: '과도한 유산소 (근육 합성 방해)',
      exercise_ok: '저충격 근력 운동(밴드·덤벨) 30분 + 코어 운동 15분 — 주 4회',
      diet_ban: '탄수화물 극단 제한 (근육 합성 에너지 부족)',
      diet_ok: '운동 전 복합 탄수화물 100g + 운동 후 단백질 30g (골든타임)',
      recovery_ban: '',
      recovery_ok: '수면 7~8시간 (성장호르몬 분비 = 근육 합성 타임)',
      science_note: '저항 운동 후 0~30분 내 단백질 30g(류신 3g 포함) 섭취 시 근육 단백질 합성이 최대 50% 증가합니다(골든타임). 수면 중 성장호르몬이 일일 분비량의 75%가 방출되므로 7~8시간 수면이 근육 합성의 핵심입니다.',
    },
    {
      week: 3, weekLabel: '3주차', phase: '내장지방 타깃', phaseColor: 'var(--circ)',
      icon: '🎯', title: '마른비만 역전 — 근육↑ 복부지방↓ 동시 전략',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 리컴포지션 시작 → 체중 변화 없이 허리둘레 0.5~1cm 감소 (근육↑ 지방↓)',
      exercise_detail: '월·화·목·금 — 복합 운동 50분: 1. 근력 파트(25분): 바벨 or 덤벨 스쿼트 4×10회, 루마니안 데드리프트 4×10회, 벤치프레스 3×10회, 풀업 or 밴드풀다운 3×10회 / 2. 코어+유산소(25분): 케틀벨 스윙 3×15회 + 버피 3×8회 + 코어 3종 / 수·토 — 수영 or 자전거 30분 / 매일 — 아침 단백질 30g 섭취 (이화작용 차단 유지)',
      meal_plan: '리컴포지션 식단(칼로리 유지+단백질 증가): 아침: 달걀 3개 스크램블 + 현미밥 ½공기 + 아보카도(총 400kcal, 단백질 25g) / 점심: 연어 180g + 현미밥 ½공기 + 브로콜리+당근(총 500kcal, 단백질 40g) / 저녁: 닭가슴살 150g + 고구마 100g + 시금치(총 400kcal, 단백질 35g) / 일일 1,500~1,600kcal, 단백질 120~130g',
      failure_expose: '체중계 숫자가 같아도 몸이 달라집니다. 근육이 늘고 복부 지방이 빠지는 "리컴포지션" 단계입니다. 체중에 집착하지 말고 허리둘레와 체성분을 보는 것이 핵심입니다.',
      axis_logic: '단백질을 충분히 공급하면서 칼로리를 소폭만 줄이는 리컴포지션 전략. 급격한 제한은 이화작용을 다시 활성화합니다.',
      keyFocus: ['근지방 교환', '허리둘레 감소', '체성분 개선'],
      exercise_ban: '유산소 위주 단일 운동',
      exercise_ok: '복합 운동(근력+코어+유산소 복합) 45분 — 주 4회',
      diet_ban: '단백질 부족 (1.4g/kg 이하)',
      diet_ok: '단백질 1.6~2g/kg (현재 체중 기준) + 복합 탄수화물',
      recovery_ban: '',
      recovery_ok: '마사지건 근막 이완 + 스트레칭 20분/일',
      science_note: '리컴포지션(근육↑+지방↓ 동시)은 고단백(1.6g/kg이상) + 적절한 칼로리 적자(200~300kcal) 조합에서 가능합니다. 근력 운동 경험이 적을수록 첫 8~12주에 리컴포지션 효과가 가장 크게 나타납니다.',
    },
    {
      week: 4, weekLabel: '4주차', phase: '대사 역전', phaseColor: 'var(--sub)',
      icon: '🔥', title: '이화작용 역전 완성 — 지속 가능한 근비만 탈출',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      weekly_target: '이번 주 목표: 근력 루틴 완전 자동화 → 4주 누적 체지방 1~1.5kg 감소, 근육량 0.5kg 증가 목표',
      exercise_detail: '평생 루틴 확립: 근력 운동 주 3~4회(월·화·목·금 중 선택) 45분 + 유산소 주 2회 20~30분 / 4주차 강도 업: 스쿼트 중량 5% 증가 + 세트 수 1세트 추가 / 매일 — 아침 단백질 30g(기상 30분 내) + 식후 15분 산책 / 4주 체성분 측정: 근육량·체지방률 변화 확인 / 칼로리 250kcal 추가 감소(일일 1,350~1,450kcal)',
      meal_plan: '4주차 칼로리 제어 강화: 아침 350kcal: 그릭요거트 200g+달걀 2개+베리류(단백질 35g) / 점심 500kcal: 닭가슴살 180g+현미밥½+야채+아보카도(단백질 45g) / 저녁 400kcal: 연어 150g+고구마80g+브로콜리(단백질 35g) / 간식 150kcal: 아몬드+단백질바 / 일일 단백질 최소 130g 목표',
      failure_expose: '3주간 이화작용을 차단하고, 근육 합성을 시작하고, 복부 지방을 타깃했습니다. 이제 이 변화를 평생 지속할 수 있는 자동화 루틴을 만드는 것이 마지막 단계입니다.',
      axis_logic: '마른비만 탈출의 유일한 장기 솔루션: 단백질 충분 섭취 + 근력 운동 지속 + 유산소 최소화. 이 세 원칙이 자동화되면 됩니다.',
      keyFocus: ['루틴 자동화', '체성분 측정 기준화', 'B2B 분석 전송'],
      exercise_ban: '유산소로만 다시 돌아가기',
      exercise_ok: '근력 운동 주 3~4회 루틴 완성',
      diet_ban: '단백질 식사 건너뛰기',
      diet_ok: '고단백 저탄 기준 유지 + 칼로리 200kcal 점진 감소',
      recovery_ban: '',
      recovery_ok: '파트너 재활·운동센터 연계 데이터 전송',
      science_note: '근감소성 비만(근육↓+체지방↑)은 고단백 식단(1.6g/kg)과 근력 운동만으로 4주 내 체지방 1~2kg 감소+근육량 0.5~1kg 증가가 가능합니다. 유산소 단독 그룹 대비 근력+식단 복합 그룹에서 내장지방 감소 효과가 2.1배 높습니다.',
      b2b: true,
    },
    {
      week: 3, weekLabel: '3주차', phase: '내장지방 타깃', phaseColor: 'var(--circ)',
      icon: '🎯', title: '마른비만 역전 — 근육↑ 복부지방↓ 동시 전략',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      failure_expose: '체중계 숫자가 같아도 몸이 달라집니다. 근육이 늘고 복부 지방이 빠지는 "리컴포지션" 단계입니다. 체중에 집착하지 말고 허리둘레와 체성분을 보는 것이 핵심입니다.',
      axis_logic: '단백질을 충분히 공급하면서 칼로리를 소폭만 줄이는 리컴포지션 전략. 급격한 제한은 이화작용을 다시 활성화합니다.',
      keyFocus: ['근지방 교환', '허리둘레 감소', '체성분 개선'],
      exercise_ban: '유산소 위주 단일 운동',
      exercise_ok: '복합 운동(근력+코어+유산소 복합) 45분 — 주 4회',
      diet_ban: '단백질 부족 (1.4g/kg 이하)',
      diet_ok: '단백질 1.6~2g/kg (현재 체중 기준) + 복합 탄수화물',
      recovery_ban: '',
      recovery_ok: '마사지건 근막 이완 + 스트레칭 20분/일',
    },
    {
      week: 4, weekLabel: '4주차', phase: '대사 역전', phaseColor: 'var(--sub)',
      icon: '🔥', title: '이화작용 역전 완성 — 지속 가능한 근비만 탈출',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      failure_expose: '3주간 이화작용을 차단하고, 근육 합성을 시작하고, 복부 지방을 타깃했습니다. 이제 이 변화를 평생 지속할 수 있는 자동화 루틴을 만드는 것이 마지막 단계입니다.',
      axis_logic: '마른비만 탈출의 유일한 장기 솔루션: 단백질 충분 섭취 + 근력 운동 지속 + 유산소 최소화. 이 세 원칙이 자동화되면 됩니다.',
      keyFocus: ['루틴 자동화', '체성분 측정 기준화', 'B2B 분석 전송'],
      exercise_ban: '유산소로만 다시 돌아가기',
      exercise_ok: '근력 운동 주 3~4회 루틴 완성',
      diet_ban: '단백질 식사 건너뛰기',
      diet_ok: '고단백 저탄 기준 유지 + 칼로리 200kcal 점진 감소',
      recovery_ban: '',
      recovery_ok: '파트너 영양 컨설팅·PT 센터 연계 데이터 전송',
      b2b: true,
    },
  ],
};

// ──────────────────────────────────────────────
// 10-C. 오행 기질별 처방 레이어 (운동·식단 오버라이드)
// bc_primary 처방 위에 오행이 "어떻게" 실행할지를 덮는다
// ──────────────────────────────────────────────
var OHAENG_OVERLAY = {
  '목': {
    exercise_add: '저녁 야외 산책 20분 추가 (간(肝) 기운 소통, 도파민 자연 회복)',
    diet_add: '신맛 식품 활용 (식초·레몬·유자) — 간의 울결 해소. 녹색 채소 매끼 필수.',
    diet_macro_note: '탄수화물 : 단백질 : 지방 = 40 : 30 : 30 (감정 억압성 폭식 방어를 위해 단백질 비율 유지)',
    recovery_add: '취침 전 10분 일기 쓰기 또는 감정 해소 루틴 (억눌린 긴장 해소)',
    tone_caution: '칼로리 계산 강박 금지 — 숫자 집착이 오히려 보상 과식을 유발합니다.',
  },
  '화': {
    exercise_add: '운동 강도 80% 이하 유지 + 쿨다운 10분 필수 (상열 방지)',
    diet_add: '쓴맛 식품(상추·쑥갓·오이·연근) 매끼 1종 이상 — 심화(心火) 하강. 차가운 음식 약간 허용.',
    diet_macro_note: '탄수화물 : 단백질 : 지방 = 38 : 32 : 30 (흥분-소진 사이클 방어, 단백질 비율 소폭 상향)',
    recovery_add: '운동 후 5분 냉찜질 or 냉수 족탕 — 상체 열 하강',
    tone_caution: '운동량 급격히 늘리기 금지 — 화 기질은 과잉 실행 후 번아웃이 빠릅니다.',
  },
  '토': {
    exercise_add: '식후 30분 후 소화 산책 15분 (비위(脾胃) 운화 기능 자극)',
    diet_add: '따뜻하고 소화 잘 되는 식품 우선 — 생식·차가운 음식 최소화. 소식다회(1일 5~6회 소량).',
    diet_macro_note: '탄수화물 : 단백질 : 지방 = 45 : 28 : 27 (소화력 지원을 위해 탄수화물 비율 소폭 허용, 단 저GI 필수)',
    recovery_add: '복부 온찜질 10분 (소화 기능 및 림프 순환 동시 지원)',
    tone_caution: '단것 과다 금지 — 토 기질은 단맛에 강하게 끌리나 습담(濕痰) 축적을 유발합니다.',
  },
  '금': {
    exercise_add: '호흡 운동 5분 추가 (폐(肺) 기운 소통) — 코로 들이쉬고 입으로 내쉬기',
    diet_add: '흰색 채소(무·도라지·배·연근) 매끼 1종 — 폐·대장 소통. 수분 2L+ 필수.',
    diet_macro_note: '탄수화물 : 단백질 : 지방 = 38 : 30 : 32 (폐·대장 독소 배출을 위해 지방 비율 소폭 상향, 오메가3 우선)',
    recovery_add: '완벽주의 체크 — 오늘 목표의 70%만 달성해도 "성공"으로 기록하는 루틴',
    tone_caution: '올-오-낫씽 식단 금지 — 한 번 어기면 전부 포기하는 패턴이 금 기질의 최대 함정입니다.',
  },
  '수': {
    exercise_add: '운동 전 허리·하체 5분 온열 스트레칭 (신장(腎) 기운 활성화)',
    diet_add: '검은 식품(흑미·검은콩·흑임자·미역·다시마) 1종 이상/일 — 신장 기운 보충.',
    diet_macro_note: '탄수화물 : 단백질 : 지방 = 40 : 28 : 32 (하체 냉증·기초대사량 회복을 위해 건강한 지방 비율 확보)',
    recovery_add: '취침 전 족욕 15분 (하체 냉증 해소, 수 기질 핵심 루틴)',
    tone_caution: '무기력기에 운동 강행 금지 — 수 기질은 에너지 고갈 시 회복에 집중하는 것이 더 효율적입니다.',
  },
};

// ──────────────────────────────────────────────
// 10-D. 22개 바디코드 닉네임별 스토리 특화 레이어
// NICKNAME_TO_BC로 BC 모체를 찾은 뒤, 이 레이어로 스토리·포커스를 미세 조정
// ──────────────────────────────────────────────
var NICKNAME_OVERLAY = {
  // ── BC-1 계열 ──
  '오후만되면 코끼리다리형': {
    story_hook: '오후만 되면 다리가 터질 것처럼 붓고, 구두가 발에 끼이는 경험 — 이것이 하지 림프·정맥 울혈의 전형적 신호입니다.',
    week1_focus: '사타구니 림프절 집중 개방 — 하체 통로의 첫 번째 관문',
    week4_focus: '하체 부종 측정 기준화 — 체중보다 발목 둘레 변화를 추적',
  },
  '엄마체형 하지정체형': {
    story_hook: '엄마, 외할머니도 똑같이 하체가 굵으셨다면 — 이것은 유전적 림프관 탄력 저하입니다. 의지로 극복하려 해도 한계가 있는 이유가 있습니다.',
    week1_focus: '모계 유전성 림프관 약화 → 수영과 필라테스가 유일한 비침습 처방',
    week4_focus: '유전 체질 맞춤 지속 관리 체계 구축 — 단기가 아닌 평생 전략',
  },
  // ── BC-2 계열 ──
  '목짧아지는 거북이형': {
    story_hook: '스마트폰을 내려다볼수록 목이 짧아 보이고, 쇄골 위가 점점 두꺼워지는 느낌 — 경추 전만 소실이 상체 림프를 막고 있습니다.',
    week1_focus: '경추 전만 각도 회복 — 목이 1cm 앞으로 나올수록 어깨에 5kg 추가 하중',
    week4_focus: '모니터 높이·자세 환경 개조 — 구조가 바뀌어야 처방이 유지됩니다',
  },
  '안 쓰는 팔뚝 부종형': {
    story_hook: '팔을 거의 안 쓰는데 팔뚝만 유독 두껍고, 누르면 자국이 남는다면 — 액와(겨드랑이) 림프절 압박이 원인입니다.',
    week1_focus: '액와 림프절 개방 운동이 1순위 — 팔 유산소보다 겨드랑이 스트레칭',
    week4_focus: '팔뚝 림프 드레나쥐 루틴 자동화',
  },
  '겨드랑이 부유방형': {
    story_hook: '브라 라인 옆에 살이 접히고, 특히 팔을 들었을 때 두드러진다면 — 액와 부유방 지방과 림프 정체의 복합 문제입니다.',
    week1_focus: '겨드랑이 림프 개방 + 흉근 이완으로 부유방 압박 해제',
    week4_focus: '부유방 지방 분해 가속 — 유산소 추가는 림프 통로 완전 개방 후',
  },
  // ── BC-3 계열 ──
  '식후기절 혈당롤러코스터형': {
    story_hook: '밥 먹고 나면 졸음이 쏟아지고, 2시간 후 또 단것이 당기는 사이클 — 혈당이 급상승 후 급추락하는 패턴의 교과서적 증거입니다.',
    week1_focus: '식사 순서 교정만으로 식후 혈당 스파이크 30% 감소 확인',
    week4_focus: '연속혈당측정기(CGM) 또는 혈당 앱으로 본인 혈당 패턴 학습',
  },
  '아빠체형 내장비대형': {
    story_hook: '아버지, 할아버지도 같은 체형 — 유전적 인슐린 저항성 소인과 내장지방 선호 체질입니다. 팔다리는 가는데 배만 나온다면 더욱 확실한 신호입니다.',
    week1_focus: '부계 유전 인슐린 저항성 → 단순 칼로리 제한은 효과 없음, 식사 순서부터',
    week4_focus: '허리둘레 측정 기준화 — 체중보다 허리둘레 1cm 감소가 내장지방 200g 감소 신호',
  },
  '식후임산부 가스풍선형': {
    story_hook: '밥만 먹으면 배가 빵빵해지고 임산부처럼 볼록해진다면 — 소장 내 가스 생성 과잉 또는 장운동 저하의 신호입니다.',
    week1_focus: '장내 가스 유발 식품(양파·브로콜리 생것·콩류) 1주간 제한으로 기준 확인',
    week4_focus: '장내 유익균 회복 — 프로바이오틱스 + 프리바이오틱스 조합 도입',
  },
  // ── BC-4 계열 ──
  '약물부작용 강제축적형': {
    story_hook: '스테로이드·항우울제·호르몬제·고혈압약 복용 이후 급격히 살이 쪘다면 — 약물이 지방 대사와 수분 조절을 직접 바꾼 것입니다.',
    week1_focus: '약물 변경 없이 다이어트 먼저 시도하는 것은 역효과 가능 — 주치의 상담이 선행 조건',
    week4_focus: '약물 조정 후 대사 회복 속도 모니터링 — B2B 의원 연계 필수',
  },
  '여름에도 시린 얼음장형': {
    story_hook: '여름에도 발이 시리고, 손발이 항상 차갑고, 아무리 먹어도 살이 안 찌다가 갑자기 불어난다면 — 갑상선 기능 저하의 전형적 패턴입니다.',
    week1_focus: '체온 측정 기준화 — 기상 직후 체온 36.1도 이하면 갑상선 저하 의심',
    week4_focus: '체온 0.5도 상승 목표 — 이것이 기초대사량 3~5% 회복의 신호',
  },
  // ── BC-5 계열 ──
  '지방흡입후 재발형': {
    story_hook: '지방흡입 후 처음엔 빠졌는데 1~2년 후 다시 돌아왔다면 — 시술이 림프관 손상을 일으켜 재발 속도가 더 빠른 상태입니다.',
    week1_focus: '손상 림프관 회복 — 전문 림프 드레나쥐 마사지 주 2~3회 초기 집중',
    week4_focus: '림프관 재생 기간 6~12개월 — 장기 관리 체계 필수',
  },
  // ── BC-6 계열 ──
  '스트레스성 야식부엉이형': {
    story_hook: '낮에는 입맛이 없다가 밤 9시만 되면 냉장고 앞에 서 있는 자신을 발견한다면 — 코르티솔 역전 패턴의 교과서적 신호입니다.',
    week1_focus: '야식 충동 30분 전 산책으로 도파민 선제 보충',
    week4_focus: '야식 0회 달성보다 야식 대체 스낵 루틴 자동화가 지속 가능한 목표',
  },
  '털털한 PCOS형': {
    story_hook: 'PCOS(다낭성 난소 증후군)이 있다면 인슐린 저항성과 안드로겐 과잉이 복합되어 일반 다이어트의 효과가 크게 제한됩니다.',
    week1_focus: 'PCOS × 인슐린 저항성 이중 교정 — 저GI 식단이 최우선 처방',
    week4_focus: 'PCOS 관리 지표: 체중보다 허리둘레·생리 주기 정상화를 기준으로',
  },
  '억제제부작용 배부름마비형': {
    story_hook: '식욕억제제 복용 후 포만감을 못 느끼거나, 오히려 반동 과식이 더 심해졌다면 — 뇌의 포만 신호 경로가 교란된 상태입니다.',
    week1_focus: '식욕억제제 의존 감소 프로토콜 — 포만 신호 재훈련이 1주차 핵심',
    week4_focus: '자연 포만 신호 회복 확인 — 20분 천천히 먹기 루틴',
  },
  '호르몬스위치 갱년기형': {
    story_hook: '예전이랑 똑같이 먹는데 배에만 살이 찌고, 갑자기 열이 확 오르며 식은땀이 난다면 — 에스트로겐 급락에 따른 지방 재배치 시작 신호입니다.',
    week1_focus: '에스트로겐 대체 식품(파이토에스트로겐) 식단 — 콩·석류·아마씨 매일',
    week4_focus: '복부 둘레 측정 기준화 — 체중보다 허리·복부 사이즈가 진짜 지표',
  },
  '스트레스기절 번아웃형': {
    story_hook: '번아웃 후 몸이 극도로 무겁고, 조금만 움직여도 지치고, 식욕이 완전히 사라졌다가 폭발적으로 과식하는 사이클 — 부신 고갈의 극단적 표현입니다.',
    week1_focus: '번아웃 → 운동 먼저 금지. 부신 회복이 최우선, 모든 운동은 2주차 이후',
    week4_focus: '에너지 회복 지표: 아침 기상이 힘들지 않은 날이 주 3일 이상이면 다음 단계 진입',
  },
  // ── BC-7 계열 ──
  '출산후 바람빠진 풍선형': {
    story_hook: '출산 후 배가 바람 빠진 풍선처럼 처지고, 아무리 운동해도 아랫배가 들어가지 않는다면 — 복직근 이개와 골반저근 약화가 핵심 원인입니다.',
    week1_focus: '복직근 이개 자가 확인 — 배꼽 위 2~3cm에 손가락 2개 이상 들어가면 이개 있음',
    week4_focus: '이개 1~2지 이하로 좁혀지면 외복사근 운동 단계 진입 가능',
  },
  '골반틀어짐 승마살형': {
    story_hook: '한쪽 골반이 더 나와 있고, 앉았다 일어날 때 엉덩이 옆쪽이 유독 부각된다면 — 골반 비대칭이 승마살 부위 지방 편중 축적을 유발합니다.',
    week1_focus: '골반 비대칭 교정 — 한쪽 다리를 꼬고 앉는 습관 즉시 중단',
    week4_focus: '골반 대칭 회복 후 승마살 부위 림프 마사지 추가',
  },
  // ── BC-8 계열 ──
  '운동할수록 말벅지형': {
    story_hook: '스쿼트·런지를 열심히 했더니 허벅지가 오히려 커졌다면 — 하체 알파-2 수용체 우세 체형입니다. 운동 방향 자체를 바꿔야 합니다.',
    week1_focus: '하체 웨이트 0으로 즉시 감소 — 이 결정이 가장 어렵고 가장 중요',
    week4_focus: '수영·사이클·요가 루틴 완성 — 이 3가지가 평생 메인 운동',
  },
  '상체근육형': {
    story_hook: '상체 운동을 좋아했는데 어깨·등이 과발달되어 오히려 상체가 더 넓어 보인다면 — 상체 알파 수용체 과활성화 패턴입니다.',
    week1_focus: '상체 웨이트 일시 중단 + 이완 스트레칭 집중',
    week4_focus: '상체 운동 재도입 시: 고중량 저반복 → 저중량 고반복으로 방향 전환',
  },
  // ── BC-9 계열 ──
  '팔다리거미 올챙이배형': {
    story_hook: '팔다리는 가는데 배만 볼록하고, 굶을수록 팔다리가 더 가늘어지는 패턴 — 이화작용이 지방보다 근육을 먼저 태우는 상태입니다.',
    week1_focus: '체중 감량 목표 일시 중단 — 근육 회복이 먼저, 체중계 숫자는 3주 후부터',
    week4_focus: '체성분 측정 기준화 — 체중이 오르더라도 근육량 증가면 성공',
  },
  '대사증후군 종합형': {
    story_hook: '혈압·혈당·중성지방·복부비만 중 3가지 이상 해당된다면 — 대사증후군 복합 위험 상태. 단순 다이어트보다 의료 연계 관리가 필수입니다.',
    week1_focus: '대사증후군 5대 지표 측정 기준화 — 체중보다 수치 개선이 진짜 목표',
    week4_focus: 'B2B 내과·영양 컨설팅 연계 — 이 단계는 전문가 없이 진행 불가',
  },
  // ── 동시다발·번아웃 계열 ──
  '동시다발 다중악순환형': {
    story_hook: '하나만 고치면 다른 게 문제고, 뭘 해도 결과가 없는 느낌 — 여러 악순환이 동시에 작동하는 상태입니다. 순서가 중요합니다.',
    week1_focus: '가장 점수 높은 단일 원인축 1개만 집중 — 동시 다발 접근은 역효과',
    week4_focus: '1개 축 안정 후 2번째 축 진입 — 순차적 접근이 유일한 해법',
  },
};

// ──────────────────────────────────────────────
// 10-E. getRoadmapWeeks() — 완전 통합 처방 생성기
// ① bc_primary(한글 닉네임) → NICKNAME_TO_BC → BC 모체 처방
// ② NICKNAME_OVERLAY → 닉네임별 스토리 미세 조정
// ③ OHAENG_OVERLAY(ohaeng_type) → 오행 기질 레이어 추가
// ④ computeNutrition(goal_weight) → 칼로리/탄단지 주입
// ──────────────────────────────────────────────
function getRoadmapWeeks(bc_primary, goal_weight, weight_loss_pct, user_name, ohaeng_type) {
  var name    = user_name   || '회원';
  var ohaeng  = ohaeng_type || null;

  // ① bc_primary → BC 모체 코드 결정
  //    bc_primary는 한글 닉네임('스트레스성 야식부엉이형') OR BC 숫자코드('BC-6') 둘 다 처리
  var bcKey = 'BC-6';
  if (bc_primary) {
    var s = String(bc_primary).trim();
    // 숫자 코드 형식 (BC-1~BC-9) 직접 입력된 경우
    var mCode = s.match(/^BC-(\d)$/i);
    if (mCode) {
      bcKey = 'BC-' + mCode[1];
    } else {
      // 한글 닉네임 → NICKNAME_TO_BC 역매핑
      var mapped = (typeof NICKNAME_TO_BC !== 'undefined') ? NICKNAME_TO_BC[s] : null;
      if (mapped) {
        bcKey = mapped;
      } else {
        // 부분 일치 fallback (공백 등 차이 대비)
        var keys = (typeof NICKNAME_TO_BC !== 'undefined') ? Object.keys(NICKNAME_TO_BC) : [];
        for (var i = 0; i < keys.length; i++) {
          if (s.indexOf(keys[i]) !== -1 || keys[i].indexOf(s) !== -1) {
            bcKey = NICKNAME_TO_BC[keys[i]];
            break;
          }
        }
      }
    }
  }

  // ② BC 모체 처방 로드
  var baseWeeks = BC_ROADMAP_DB[bcKey] || BC_ROADMAP_DB['BC-6'];

  // ③ 닉네임 오버레이 로드
  var nickOv = (bc_primary && typeof NICKNAME_OVERLAY !== 'undefined')
    ? (NICKNAME_OVERLAY[String(bc_primary).trim()] || null) : null;

  // ④ 오행 오버레이 로드
  var ohaengOv = (ohaeng && typeof OHAENG_OVERLAY !== 'undefined')
    ? (OHAENG_OVERLAY[ohaeng] || null) : null;

  // ⑤ 칼로리 계산
  // goal_weight가 null이어도 BC 타입별 표준 목표체중 fallback으로 칼로리 항상 계산
  var BC_DEFAULT_GOAL_WEIGHTS = {
    'BC-1':57,'BC-2':55,'BC-3':60,'BC-4':58,
    'BC-5':56,'BC-6':57,'BC-7':59,'BC-8':56,'BC-9':58
  };
  var BC_DEFAULT_LOSS_PCT = {
    'BC-1':12,'BC-2':10,'BC-3':15,'BC-4':13,
    'BC-5':11,'BC-6':12,'BC-7':14,'BC-8':10,'BC-9':12
  };
  var effectiveGoalWeight = (goal_weight != null && goal_weight > 0)
    ? goal_weight
    : (BC_DEFAULT_GOAL_WEIGHTS[bcKey] || 58);
  var effectiveLossPct = (weight_loss_pct != null && weight_loss_pct > 0)
    ? weight_loss_pct
    : (BC_DEFAULT_LOSS_PCT[bcKey] || 12);
  var nutritionData = computeNutrition(null, effectiveGoalWeight, effectiveLossPct, null);
  // fallback 여부 표시 (렌더링에서 참고)
  nutritionData._isDefaultGoal = (goal_weight == null || goal_weight <= 0);

  // ⑥ 주차별 처방 조합
  var result = baseWeeks.map(function(w) {
    var item = JSON.parse(JSON.stringify(w)); // deep clone

    // {USER_NAME} 치환
    if (item.failure_expose) {
      item.failure_expose = item.failure_expose.replace(/\{USER_NAME\}/g, name);
    }

    // 닉네임 스토리 오버레이 (1주차 hook, 해당 주차 focus 주입)
    if (nickOv) {
      if (item.week === 1 && nickOv.story_hook) {
        item.failure_expose = nickOv.story_hook + '\n\n' + item.failure_expose;
      }
      if (item.week === 1 && nickOv.week1_focus) {
        item.keyFocus = [nickOv.week1_focus].concat(item.keyFocus || []).slice(0, 3);
      }
      if (item.week === 4 && nickOv.week4_focus) {
        item.keyFocus = [nickOv.week4_focus].concat(item.keyFocus || []).slice(0, 3);
      }
    }

    // 오행 기질 레이어 주입
    if (ohaengOv) {
      // 운동: 오행 추가 처방 append
      if (ohaengOv.exercise_add) {
        item.exercise_ok = (item.exercise_ok || '') + ' · ' + ohaengOv.exercise_add;
      }
      // 식단: 오행 추가 지침 append
      if (ohaengOv.diet_add) {
        item.diet_ok = (item.diet_ok || '') + '\n[' + ohaeng + ' 기질] ' + ohaengOv.diet_add;
      }
      // 주의사항
      if (ohaengOv.tone_caution) {
        item.ohaeng_caution = ohaengOv.tone_caution;
      }
      // 탄단지 비율 메모
      if (ohaengOv.diet_macro_note) {
        item.diet_macro_note = ohaengOv.diet_macro_note;
      }
      // 회복 추가 (1주차에만)
      if (item.week === 1 && ohaengOv.recovery_add) {
        item.recovery_ok = (item.recovery_ok || '') + ' · ' + ohaengOv.recovery_add;
      }
    }

    // 칼로리·탄단지 주입 (nutritionData는 항상 존재)
    if (nutritionData) {
      var v = nutritionData.weekVariants.filter(function(x){ return x.week === item.week; })[0]
           || nutritionData.weekVariants[0];
      item.nutrition = {
        kcal:     v.kcal,
        carbG:    v.carbG,
        proteinG: v.proteinG,
        fatG:     v.fatG,
        note:     v.note,
        // 오행 탄단지 오버라이드 안내
        macro_note: ohaengOv ? ohaengOv.diet_macro_note : null,
        // fallback 여부 — 목표체중 미입력 시 BC 표준 기반 계산임을 안내
        isDefaultGoal: nutritionData._isDefaultGoal || false,
        defaultGoalWeight: effectiveGoalWeight,
      };
    }

    return item;
  });

  return result;
}

// ──────────────────────────────────────────────
// 10-D. ROADMAP_WEEKS — 하위호환 기본값 (BC-6 제네릭)
// 결과지가 bc_primary 없이 직접 ROADMAP_WEEKS를 참조할 때 사용
// ──────────────────────────────────────────────
var ROADMAP_WEEKS = BC_ROADMAP_DB['BC-6'];

// ══════════════════════════════════════════════════════════════════
// TIER 2: BC_EVIDENCE_DB — 처방 근거 레벨 & 문헌 기반 신뢰도 데이터
// ══════════════════════════════════════════════════════════════════
// 근거 등급 정의 (GRADE 체계 간소화)
//   A  — 무작위대조시험(RCT) ≥2편 또는 메타분석 존재
//   B  — 코호트·관찰 연구 ≥2편 또는 RCT 1편
//   C  — 전문가 합의·기전 근거·사례군
//   D  — 전통 의학·경험적 근거 (오행 기반 등)
// confidence: 0-100 (시스템 내 데이터 누적 기반 — weekly_checkins 집계 후 갱신)
// ──────────────────────────────────────────────
var BC_EVIDENCE_DB = {
  'BC-1': {
    label: '오후만되면 코끼리다리형',
    mechanism: '하지 정맥·림프 순환 장애 → 체액 재분포 불균형',
    evidence_level: 'B',
    evidence_summary: '압박 스타킹 + 림프 드레나쥐 복합 요법의 하지 부종 감소 효과 (코호트 3편)',
    key_references: [
      'Földi et al. (2012) Lymphedema and venous disorders — Elsevier',
      'Brorson et al. (2016) Complete reduction of lymphedema — Ann Surg',
    ],
    contraindication_evidence: 'B',
    contraindication_note: '하체 고강도 저항운동 → 정맥압 상승 → 부종 악화 (관찰 연구 2편)',
    confidence: 62,   // weekly_checkins 누적 후 자동 갱신 예정
    last_updated: '2025-01-01',
  },
  'BC-2': {
    label: '목짧아지는 거북이형',
    mechanism: '경추 전만 소실 → 상부 교차 증후군 → 두개경부 림프 정체',
    evidence_level: 'B',
    evidence_summary: '경추 교정 운동 + 자세 재교육의 경추통 및 두통 감소 효과 (RCT 1편, 코호트 2편)',
    key_references: [
      'Gross et al. (2015) Manipulation and mobilisation of the cervical spine — Cochrane',
      'Jull et al. (2002) Therapeutic exercise for cervicogenic headache — Spine',
    ],
    contraindication_evidence: 'C',
    contraindication_note: '경추 불안정 시 무거운 바벨 압박 운동 → 신경 손상 위험 (전문가 합의)',
    confidence: 55,
    last_updated: '2025-01-01',
  },
  'BC-3': {
    label: '식후기절 혈당롤러코스터형',
    mechanism: '인슐린 저항성 → 반응성 저혈당 → 지방 합성 촉진',
    evidence_level: 'A',
    evidence_summary: '저GI 식이 + 식후 유산소 운동의 혈당 변동성 감소 효과 (메타분석 5편)',
    key_references: [
      'Reynolds et al. (2019) Glycaemic index — BMJ meta-analysis',
      'Colberg et al. (2016) Physical activity and diabetes — Diabetes Care',
      'DiNicolantonio et al. (2018) Sugar addiction — Br J Sports Med',
    ],
    contraindication_evidence: 'A',
    contraindication_note: '공복 고강도 운동 → 코르티솔↑ → 혈당 스파이크 → 인슐린 반응 악화 (RCT 3편)',
    confidence: 78,
    last_updated: '2025-01-01',
  },
  'BC-4': {
    label: '스트레스성 야식부엉이형',
    mechanism: '만성 스트레스 → HPA 축 활성화 → 코르티솔 과분비 → 복부 지방 축적',
    evidence_level: 'A',
    evidence_summary: '코르티솔-복부비만 연관성 (메타분석 6편), 수면 제한 → 식욕 호르몬 교란 (RCT 4편)',
    key_references: [
      'Björntorp (2001) Do stress reactions cause abdominal obesity? — Obes Rev',
      'Spiegel et al. (2004) Sleep curtailment in healthy young men — Ann Intern Med',
      'Epel et al. (2000) Stress and body shape — Psychosom Med',
    ],
    contraindication_evidence: 'A',
    contraindication_note: '저녁 고강도 운동 → 코르티솔 재상승 → 수면 질 저하 → 악순환 (RCT 2편)',
    confidence: 82,
    last_updated: '2025-01-01',
  },
  'BC-5': {
    label: '갑상선·대사저하 빙하형',
    mechanism: '갑상선 기능 저하 (명시 또는 기능성) → 기초대사율 감소 → 에너지 소비 불균형',
    evidence_level: 'B',
    evidence_summary: '갑상선 기능 저하증과 비만의 양방향 연관성 (코호트 4편), 요오드·셀레늄 영양 개입 효과 (RCT 2편)',
    key_references: [
      'Sanyal & Raychaudhuri (2016) Relationship between obesity and hypothyroidism — Indian J Endocrinol',
      'Triggiani et al. (2009) Role of iodine in evolution — Thyroid',
    ],
    contraindication_evidence: 'B',
    contraindication_note: '초저칼로리 (<1,000kcal) 급격한 제한 → T3 추가 억제 → 대사율 더 하락 (관찰 2편)',
    confidence: 65,
    last_updated: '2025-01-01',
  },
  'BC-6': {
    label: '인슐린저항 복부비만형',
    mechanism: '내장 지방 과잉 → 아디포넥틴↓ TNF-α↑ → 인슐린 신호 차단 → 지방 분해 억제',
    evidence_level: 'A',
    evidence_summary: '저탄수화물 식이의 내장 지방 감소 우월성 (메타분석 8편), 근력 운동 + 유산소 복합 효과 (RCT 6편)',
    key_references: [
      'Bray et al. (2004) Low-carbohydrate diets — Obesity Research',
      'Després & Lemieux (2006) Abdominal obesity and metabolic syndrome — Nature',
      'Ross et al. (2012) Importance of exercise type — Am J Clin Nutr',
    ],
    contraindication_evidence: 'A',
    contraindication_note: '초고지방 식이 (>60%) 단독 접근 시 LDL 상승 부작용 가능 (RCT 4편)',
    confidence: 85,
    last_updated: '2025-01-01',
  },
  'BC-7': {
    label: '호르몬스위치 갱년기형',
    mechanism: '에스트로겐 급감 → 내장 지방 재분포 + 인슐린 감수성↓ + 수면 장애 → 복합 대사 교란',
    evidence_level: 'A',
    evidence_summary: '갱년기 여성 체성분 변화 기전 (메타분석 5편), 저항 운동의 골밀도·근육량 보호 효과 (RCT 7편)',
    key_references: [
      'Davis et al. (2012) Menopause and obesity — Climacteric',
      'Villareal et al. (2011) Weight loss, exercise, or both — NEJM',
      'Sternfeld et al. (2014) Efficacy of exercise for menopause-related QoL — Menopause',
    ],
    contraindication_evidence: 'B',
    contraindication_note: '초저칼로리 단식 → 코르티솔 상승 → 갱년기 열감 악화 (관찰 3편)',
    confidence: 80,
    last_updated: '2025-01-01',
  },
  'BC-8': {
    label: '장누수·마이크로바이옴형',
    mechanism: '장 상피 투과성↑ → LPS 흡수 → 만성 저등급 염증 → 지방 분해 억제',
    evidence_level: 'B',
    evidence_summary: '장내 미생물군 다양성과 비만의 연관성 (코호트 5편), 프리바이오틱·프로바이오틱 체중 감소 효과 (RCT 3편)',
    key_references: [
      'Turnbaugh et al. (2006) An obesity-associated gut microbiome — Nature',
      'Ridaura et al. (2013) Gut microbiota from twins — Science',
      'Cani et al. (2007) Metabolic endotoxemia — Diabetes',
    ],
    contraindication_evidence: 'C',
    contraindication_note: '고가공식품·고당 식이 지속 → 유익균 급감 → 처방 효과 무력화 (전문가 합의)',
    confidence: 60,
    last_updated: '2025-01-01',
  },
  'BC-9': {
    label: '운동공포 근감소형',
    mechanism: '근육량 부족 → 안정시 대사율↓ + 포도당 uptake↓ → 지방 우선 축적',
    evidence_level: 'A',
    evidence_summary: '저항 운동의 근비대 및 기초대사율 상승 효과 (메타분석 9편), 단백질 섭취량과 근합성 용량-반응 관계 (RCT 5편)',
    key_references: [
      'Wolfe (2006) The underappreciated role of muscle — Am J Clin Nutr',
      'Morton et al. (2018) Protein supplementation to augment resistance — Br J Sports Med',
      'Peterson et al. (2011) Resistance exercise for obesity — J Am Geriatr Soc',
    ],
    contraindication_evidence: 'B',
    contraindication_note: '유산소 단독 과다 → 근 이화 촉진 → 근감소증 악화 (RCT 2편)',
    confidence: 83,
    last_updated: '2025-01-01',
  },
};

// ──────────────────────────────────────────────
// TIER 2 헬퍼: evidence badge 텍스트 생성
// 사용: getBadge('BC-3') → { grade:'A', label:'RCT 메타분석 근거', color:'#22c55e', confidence:78 }
// ──────────────────────────────────────────────
function getEvidenceBadge(bcCode) {
  var ev = BC_EVIDENCE_DB[bcCode] || BC_EVIDENCE_DB['BC-6'];
  var gradeMap = {
    'A': { label: '메타분석·RCT 근거', color: '#22c55e', stars: '★★★★★' },
    'B': { label: '코호트·관찰 근거',  color: '#3b82f6', stars: '★★★★☆' },
    'C': { label: '전문가 합의 근거',   color: '#f59e0b', stars: '★★★☆☆' },
    'D': { label: '전통·경험 근거',     color: '#8b5cf6', stars: '★★☆☆☆' },
  };
  var g = gradeMap[ev.evidence_level] || gradeMap['C'];
  return {
    bcCode:     bcCode,
    grade:      ev.evidence_level,
    label:      g.label,
    stars:      g.stars,
    color:      g.color,
    summary:    ev.evidence_summary,
    confidence: ev.confidence,
    mechanism:  ev.mechanism,
  };
}

// ══════════════════════════════════════════════════════════════════
// TIER 3: computeBCCodeSafe — 경계형 BC 코드 처리 (Top1-Top2 diff < 10)
// ══════════════════════════════════════════════════════════════════
// 기존 computeBCCode()를 감싸는 안전망 레이어
// 역할:
//   1. Top1과 Top2 축 점수 차이가 10점 미만 → 경계형(borderline) 플래그
//   2. 경계형일 경우 secondary BC 코드와 처방 블렌딩 힌트 제공
//   3. result-v4.html에서 "이중 패턴 주의" 배지 표시 근거
// ──────────────────────────────────────────────
var BORDERLINE_THRESHOLD = 10; // 점수 차 기준 (임상적으로 10점 미만 = 불명확)

function computeBCCodeSafe(axisScores, answers) {
  // ① 기존 1차 처리
  var primary = computeBCCode(axisScores, answers || {});

  // ② 10개 축 점수 정렬 (실제 10D 축 기반)
  var sortedAxes = Object.entries(axisScores)
    .filter(function(kv) { return kv[0].startsWith('A'); })
    .sort(function(a, b) { return b[1] - a[1]; });

  var top1Score = sortedAxes[0] ? sortedAxes[0][1] : 0;
  var top2Score = sortedAxes[1] ? sortedAxes[1][1] : 0;
  var diff      = top1Score - top2Score;

  var isBorderline = diff < BORDERLINE_THRESHOLD;

  // ③ 2순위 BC 코드 산출 (Top2 축 → 닉네임 → BC 역매핑)
  var secondaryBcCode = null;
  var secondaryNickname = null;
  if (isBorderline && sortedAxes[1]) {
    // Top2 축 단독으로 가상 점수 구성
    var fakeScores = {};
    Object.keys(axisScores).forEach(function(k) { fakeScores[k] = 0; });
    fakeScores[sortedAxes[1][0]] = top2Score;
    // Top1도 약간 반영 (혼합형 특성 보존)
    fakeScores[sortedAxes[0][0]] = Math.round(top2Score * 0.3);
    try {
      var secondaryResult = computeBCCode(fakeScores, answers || {});
      secondaryBcCode     = secondaryResult.bcCode;
      secondaryNickname   = secondaryResult.nickname;
    } catch(e) {
      secondaryBcCode   = 'BC-6';
      secondaryNickname = null;
    }
    // primary와 동일하면 경계형 무의미
    if (secondaryBcCode === primary.bcCode) {
      secondaryBcCode   = null;
      secondaryNickname = null;
      isBorderline      = false;
    }
  }

  // ④ 처방 블렌딩 힌트 생성
  var blendingHint = null;
  if (isBorderline && secondaryBcCode) {
    var ev1 = BC_EVIDENCE_DB[primary.bcCode]   || {};
    var ev2 = BC_EVIDENCE_DB[secondaryBcCode]  || {};
    blendingHint = {
      message: '두 패턴이 혼합된 경계형입니다. 처방 1순위(' + primary.bcCode + ')를 주축으로 하되, '
                + secondaryBcCode + ' 처방 항목 중 충돌하지 않는 것을 보완적으로 추가하세요.',
      primaryMechanism:   ev1.mechanism || null,
      secondaryMechanism: ev2.mechanism || null,
      primaryWeight:  Math.round(60 + diff * 2),   // diff 0→60%, diff 5→70%
      secondaryWeight: Math.round(40 - diff * 2),  // diff 0→40%, diff 5→30%
    };
  }

  // ⑤ 최종 반환 — 기존 computeBCCode 결과 + 경계형 필드 추가
  return Object.assign({}, primary, {
    // 경계형 진단 필드
    isBorderline:       isBorderline,
    borderlineDiff:     diff,
    borderlineThreshold: BORDERLINE_THRESHOLD,
    secondaryBcCode:    secondaryBcCode,
    secondaryNickname:  secondaryNickname,
    blendingHint:       blendingHint,
    // evidence badge (1순위)
    evidenceBadge:      getEvidenceBadge(primary.bcCode),
  });
}

// ──────────────────────────────────────────────
// 10-D. ROADMAP_WEEKS — 하위호환 기본값 (BC-6 제네릭)
// 결과지가 bc_primary 없이 직접 ROADMAP_WEEKS를 참조할 때 사용
// ──────────────────────────────────────────────
var ROADMAP_WEEKS = BC_ROADMAP_DB['BC-6'];

// ──────────────────────────────────────────────
// 11. 면책 고지문 (전 페이지 공통)
// ──────────────────────────────────────────────
var DISCLAIMER = '본 결과지는 설문 응답을 기반으로 한 라이프스타일 참고 가이드이며, 의료 진단·처방·치료를 대체하지 않습니다. 제시된 수치는 통계적 참고 지표이며 개인에 따라 차이가 있습니다. 건강 문제는 반드시 자격을 갖춘 의료 전문가와 상담하시기 바랍니다.';

// ──────────────────────────────────────────────
// 12. export
// ──────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // V3.1 신규
    AXIS_10_META, NICKNAME_TABLE, NICKNAME_TO_BC, BC_TO_DEFAULT_NICKNAME,
    BC_PRESCRIPTION_DB, TONE_DB,
    computeNickname, detectBackground, getDeepSurveyRoute, generatePrescription,
    // V4.1 신규 (PHASE 4-A/B)
    BC_ROADMAP_DB, OHAENG_OVERLAY, NICKNAME_OVERLAY,
    computeNutrition, getRoadmapWeeks,
    // V4.2 신규 (TIER 2/3)
    BC_EVIDENCE_DB, getEvidenceBadge,
    computeBCCodeSafe, BORDERLINE_THRESHOLD,
    // 기존 유지
    BC_MASTER, CAUSAL_AXIS_META, AXIS_11,
    SAJU_ELEMENT_DESC, MBTI_DESC,
    SIMULATOR_METRICS, ROADMAP_WEEKS, DISCLAIMER,
    computeBCCode, getMbtiOhaengInsights, getCruelHistoryTriggers,
  };
}
