// ============================================================
// SlimMind BC-ENGINE v3.1
// ※ NICKNAME_TABLE 30개 코드 / Top1×Top2×배경필터
// ※ computeNickname() / generatePrescription() BC×기질 분리
// ※ MBTI 레이블 제거 / 남성·완경 P4 분기
// ============================================================

// ──────────────────────────────────────────────
// 1. BC 마스터 9종 (TB_BC_MASTER)
// ──────────────────────────────────────────────
const BC_MASTER = {
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
const AXIS_10_META = {
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
const NICKNAME_TABLE = {
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
const NICKNAME_TO_BC = {
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
const BC_TO_DEFAULT_NICKNAME = {
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
const CAUSAL_AXIS_META = {
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
const AXIS_11 = [
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
const BC_PRESCRIPTION_DB = {
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
const TONE_DB = {
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
const SAJU_ELEMENT_DESC = {
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
const MBTI_DESC = {
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
const SIMULATOR_METRICS = [
  { key: 'core',    label: '복부 내압 균형',    before: 0,  after: 85, unit: '%', desc: '내려앉던 장기가 제자리를 찾으며 하체 림프관 압박이 해제되는 방향으로 개선됩니다.' },
  { key: 'adrenal', label: '부신 피로도 지수',  before: 95, after: 30, unit: '%', desc: '대사가 활성화되어 영양소가 지방 대신 에너지로 소모되는 경향이 늘어납니다.', reverse: true },
  { key: 'lymph',   label: '하지 림프 배농 속도',before:15, after: 90, unit: '%', desc: '오후 부종이 줄고 셀룰라이트 조직이 부드럽게 완화될 수 있습니다.' },
  { key: 'dopamine',label: '야간 도파민 안정도', before: 20, after: 80, unit: '%', desc: '밤 식욕 충동이 감소하고 보상성 과식 빈도가 낮아지는 방향으로 개선됩니다.' },
];

// ──────────────────────────────────────────────
// 10. 12주 로드맵 — 1~4주차 상세 데이터
// ──────────────────────────────────────────────
const ROADMAP_WEEKS = [
  {
    week: 1,
    weekLabel: '1주차',
    phase: '기반 구축',
    phaseColor: '#3EB8A0',
    icon: '🔓',
    title: '막힌 하체 연료 호스 뚫기',
    center: '체형 센터 + 회복 센터',
    centerIcons: ['🦴', '🌙'],
    failure_expose: `{USER_NAME}님, 1주차의 미션은 칼로리를 태우는 것이 아닙니다. 현재 골반이 앞으로 꺾여 하지로 내려가는 순환로와 림프관이 압착된 상태입니다. 이 상태에서 런닝머신을 뛰거나 무작정 굶는 행위는 부신 시스템을 지치게 합니다. 뇌는 이를 기아 비상사태로 인식해 대사율을 낮추고 '초절전 생존 모드'를 발동시킵니다. 이것이 물만 마셔도 다리가 붓던 원인이었습니다.`,
    axis_logic: `11개 진단축 중 이번 주 0순위는 [체형 센터]와 [회복 센터]입니다. 식단 센터는 잠시 OFF합니다. 꺾여 있는 골반의 림프 통로를 먼저 펴주는 것이 우선입니다.`,
    exercise_ban: '고강도 무산소 운동(크로스핏, 하이록스, 하체 웨이트)',
    exercise_ok: '수영(하지 정맥 배농) + 필라테스(골반각 교정, 순환로 개방)',
    diet_ban: '극단적 단식, 원푸드, 덴마크 식단',
    diet_ok: '저탄고지 안심 래퍼 식단 — 칼로리 강박 없이 고단백·고지방 중심',
    recovery_ban: '전신 땀을 빼는 고온 사우나',
    recovery_ok: '서해부 심부 온열 요법 — 사타구니 림프절 집중 관리, 밤마다 15분',
    keyFocus: ['골반 정렬', '림프 배농', '부신 회복'],
  },
  {
    week: 2,
    weekLabel: '2주차',
    phase: '신호 교정',
    phaseColor: '#6B4EAA',
    icon: '🔓',
    title: '밤 9시, 뇌의 가짜 명령 해제',
    center: '심리 센터 + 호르몬 센터',
    centerIcons: ['🧠', '🌸'],
    failure_expose: `낮에 입맛이 없다가 퇴근 후 해만 지면 야식 식욕이 폭발하는 것은 의지력 문제가 아닙니다. 낮 동안 억눌린 긴장감으로 교감신경이 극도로 항진되어 있다가 밤에 긴장이 풀리는 순간 뇌의 도파민 수치가 급격히 추락합니다. 지친 뇌는 생존을 위해 '당장 자극적인 탄수화물을 섭취해 도파민을 채워라!'라는 호르몬 명령을 내리는 것입니다.`,
    axis_logic: `이번 주 0순위는 [심리 센터]와 [호르몬 센터]입니다. 식욕 억제 약물은 자율신경계를 자극하여 불면증과 과식 주기를 유발할 수 있습니다. 뇌의 착각을 교정하는 자율신경 안정화가 최우선입니다.`,
    exercise_ban: '야간 고강도 러닝 및 헬스',
    exercise_ok: '밤 9시 가벼운 야외 평지 산책 20분',
    diet_ban: '무조건적인 야식 참기(보상 과식 유발 가능)',
    diet_ok: '도파민 대체 스낵 가이드(구운 김, 천연 버터 팝콘) — 밤 10시 교체 투입',
    recovery_ban: '',
    recovery_ok: '블루라이트 차단 + 자율신경 안정 오디오 테라피 — 치유 사운드 수면 전 재생',
    keyFocus: ['야간 도파민', '자율신경 안정', '호르몬 리셋'],
  },
  {
    week: 3,
    weekLabel: '3주차',
    phase: '조직 용해',
    phaseColor: '#1A8C5B',
    icon: '🔓',
    title: '세포 결합조직 용해와 상열하한 개선',
    center: '순환 센터 + 한방 센터',
    centerIcons: ['💧', '🌿'],
    failure_expose: `{USER_NAME}님의 허벅지 뒤쪽과 엉덩이 밑에 단단하게 자리 잡은 살들은 단순한 지방이 아닙니다. 순환계 정체로 인해 배출되지 못한 만성 염증성 노폐물 체액이 지방세포를 감아 굳어버린 '바탕질 변성 세포 결합조직(Cellulite)'입니다. 현재 머리와 가슴은 뜨겁고 하체는 차가운 '상열하한'의 경향을 보이고 있습니다.`,
    axis_logic: `이번 주 0순위는 [순환 센터]와 [한방 센터]입니다. 이 시점에 하체 근력 운동을 결합하면 단단한 결합조직 위에 근육막이 두껍게 덮여 다리가 더 굵어지는 역효과가 나타날 수 있습니다.`,
    exercise_ban: '하체 관절을 수축시키는 웨이트 트레이닝',
    exercise_ok: '힐링 요가 + 골반저근 이완 트레이닝',
    diet_ban: '아이스 아메리카노, 찬 음료, 밀가루 과다 섭취',
    diet_ok: '심부 온열 한방 차(계피생강차) 하루 500ml 이상 음용',
    recovery_ban: '',
    recovery_ok: '심부 압착 폼롤러 드레나쥐 테라피 — 허벅지 뒤쪽·서해부 라인 이완',
    keyFocus: ['셀룰라이트 용해', '상열하한 개선', '순환 회복'],
  },
  {
    week: 4,
    weekLabel: '4주차',
    phase: '대사 점화',
    phaseColor: '#E8631A',
    icon: '🔓',
    title: '인슐린 저항성 개선과 대사 사슬 해제',
    center: '식단 센터 + 관리 센터',
    centerIcons: ['🍽️', '💆'],
    failure_expose: `체중계 숫자는 줄었는데 왜 아랫배와 러브핸들은 그대로였을까요? 지방이 빠진 게 아니라 근육이 줄어든 비극의 증거입니다. 지속된 야식과 스트레스성 당류 과식은 췌장을 지치게 만들어, 세포가 영양소를 흡수하지 못하는 '인슐린 저항성'을 유발했습니다. 먹는 족족 인슐린이 발동해 아랫배에 지방을 집중 적치하는 악순환의 사슬이 완성된 것입니다.`,
    axis_logic: `1~3주차에 통로를 열고, 호르몬을 달래고, 세포 결합조직을 이완해 놓았습니다. 이제야 진짜 지방을 태울 준비가 끝났습니다. [식단 센터]와 [관리 센터]가 드디어 0순위로 전면 등판합니다.`,
    exercise_ban: '장시간 공복 유산소(근육 분해 가능)',
    exercise_ok: '매트 필라테스(복부 코어 압력 복구) + 식후 15분 속보',
    diet_ban: '칼로리만 줄이는 굶기 식단',
    diet_ok: '간헐적 탄수화물 제한 + 사이클링 식단 — 3일 탄수화물 배제 후 4일째 깨끗한 탄수화물 공급',
    recovery_ban: '',
    recovery_ok: '파트너 센터 연계 — 4주 대사 기반 구축 완료, 분석 데이터 전송',
    keyFocus: ['인슐린 리셋', '내장지방 연소', '대사 활성화'],
    b2b: true,
  },
];

// ──────────────────────────────────────────────
// 11. 면책 고지문 (전 페이지 공통)
// ──────────────────────────────────────────────
const DISCLAIMER = '본 결과지는 설문 응답을 기반으로 한 라이프스타일 참고 가이드이며, 의료 진단·처방·치료를 대체하지 않습니다. 제시된 수치는 통계적 참고 지표이며 개인에 따라 차이가 있습니다. 건강 문제는 반드시 자격을 갖춘 의료 전문가와 상담하시기 바랍니다.';

// ──────────────────────────────────────────────
// 12. export
// ──────────────────────────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // V3.1 신규
    AXIS_10_META, NICKNAME_TABLE, NICKNAME_TO_BC, BC_TO_DEFAULT_NICKNAME,
    BC_PRESCRIPTION_DB, TONE_DB,
    computeNickname, detectBackground, getDeepSurveyRoute, generatePrescription,
    // 기존 유지
    BC_MASTER, CAUSAL_AXIS_META, AXIS_11,
    SAJU_ELEMENT_DESC, MBTI_DESC,
    SIMULATOR_METRICS, ROADMAP_WEEKS, DISCLAIMER,
    computeBCCode, getMbtiOhaengInsights, getCruelHistoryTriggers,
  };
}
