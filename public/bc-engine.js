// ============================================================
// SlimMind BC-ENGINE v3.1
// ※ NICKNAME_TABLE 30개 코드 / Top1×Top2×배경필터
// ※ computeNickname() / generatePrescription() BC×기질 분리
// ※ MBTI 레이블 제거 / 남성·완경 P4 분기
// ============================================================

// ──────────────────────────────────────────────
// 1. BC 마스터 16종 (TB_BC_MASTER)
// ★ BC-1~BC-16 = 1차 외형 카드 기준 처방 모체
// 외형카드 → BC번호 매핑:
//   복부형: BC-3(단단내장) BC-4(물렁피하) BC-5(가스팽만) BC-6(올챙이배)
//   하체형: BC-1(코끼리다리) BC-2(귤껍질하체) BC-7(말벅지) BC-8(승마살)
//   상체형: BC-9(거북이) BC-10(팔뚝부종) BC-11(상체근육) BC-12(부유방)
//   전신형: BC-13(갱년기변환) BC-14(번아웃무기력) BC-15(대사증후군) BC-16(다중악순환)
// ──────────────────────────────────────────────
var BC_MASTER = {
  // ── 하체형 ──
  'BC-1': {
    code: 'BC-1',
    outline_card: '코끼리다리형',
    app_nickname: '#코끼리다리형',
    medical_title: '하지 림프·정맥 울혈성 체형',
    color: '#1A7FC1', bg: '#E3F1FB', icon: '🐘',
    failed_type_desc: '하체 순환로가 차단된 상태입니다. 이 상태에서 칼로리를 줄이거나 과도한 하체 근력 운동을 하면 배농되지 못한 체액과 노폐물이 하지에 정체 및 압착되어 다리 라인이 오히려 거대화되고 부종이 고착화되는 경향이 있습니다.',
    axis_top: '관',
  },
  'BC-2': {
    code: 'BC-2',
    outline_card: '귤껍질 하체형',
    app_nickname: '#귤껍질하체형',
    medical_title: '하체 셀룰라이트·지방 섬유화 체형',
    color: '#c98a3c', bg: '#FFF0DA', icon: '🍊',
    failed_type_desc: '하체 피하지방층이 만성 림프 정체로 섬유화되어 셀룰라이트가 굳은 상태입니다. 일반적인 유산소나 단순 굶기로는 이 섬유화된 지방 구조를 개선하기 어렵습니다.',
    axis_top: '한',
  },
  'BC-3': {
    code: 'BC-3',
    outline_card: '단단 내장형',
    app_nickname: '#단단내장형',
    medical_title: '인슐린 저항성·내장 비대형 체형',
    color: '#C0392B', bg: '#FFE3D3', icon: '🍉',
    failed_type_desc: '혈당 조절 시스템이 불균형한 상태입니다. 이 상태에서 극단적인 굶기나 1일 1식을 하면 인슐린 롤러코스터(스파이크)가 심해져 내장지방이 더 견고해지고 허리둘레가 늘어나는 경향이 있습니다.',
    axis_top: '식',
  },
  'BC-4': {
    code: 'BC-4',
    outline_card: '물렁 피하형',
    app_nickname: '#물렁피하형',
    medical_title: '피하지방 과축적·대사 저하형 체형',
    color: '#2e7d32', bg: '#EDE7F6', icon: '🫧',
    failed_type_desc: '복부 피하지방이 물렁하게 축적된 상태로, 약물·호르몬·스트레스 복합 원인으로 대사가 저하되어 지방 분해 속도가 현저히 낮아진 체형입니다. 같은 식사량에도 지방이 우선 저장되는 경향이 있습니다.',
    axis_top: '심',
  },
  'BC-5': {
    code: 'BC-5',
    outline_card: '가스 팽만형',
    app_nickname: '#가스팽만형',
    medical_title: '장내 가스·소화 기능 장애형 체형',
    color: '#00695c', bg: '#DEF3EA', icon: '🎈',
    failed_type_desc: '장내 발효·부패 가스로 인해 복부가 팽창된 상태입니다. 이 상태에서 식이섬유를 무조건 늘리거나 유산균만 보충하면 오히려 가스 생성이 촉진되어 복부가 더 팽창될 수 있습니다.',
    axis_top: '식',
  },
  'BC-6': {
    code: 'BC-6',
    outline_card: '올챙이배형',
    app_nickname: '#올챙이배형',
    medical_title: '근감소성 이화작용·마른 비만형 체형',
    color: '#00acc1', bg: '#EEEAF7', icon: '🐸',
    failed_type_desc: '근육을 에너지로 전환하는 이화작용이 활성화된 상태입니다. 몸무게 숫자에만 집착하여 유산소와 단식을 반복하면 사지는 더 가늘어지고 복부 내장지방만 남는 불균형 체형으로 진행됩니다.',
    axis_top: '약',
  },
  // ── 하체형 ──
  'BC-7': {
    code: 'BC-7',
    outline_card: '말벅지형',
    app_nickname: '#말벅지형',
    medical_title: '알파 수용체 우세·하체 과발달형 체형',
    color: '#ef6c00', bg: '#E8F3DC', icon: '🐎',
    failed_type_desc: '하체 부위에 지방 분해를 방해하는 알파-2 수용체가 집중된 체형입니다. 고강도 펌핑 운동을 과도하게 하면 지방 밑에 근육만 커져 체형이 거대화되는 경향이 있습니다.',
    axis_top: '관',
  },
  'BC-8': {
    code: 'BC-8',
    outline_card: '승마살형',
    app_nickname: '#승마살형',
    medical_title: '골반 구조 이완·측면 지방 축적형 체형',
    color: '#795548', bg: '#EFEBE9', icon: '🏇',
    failed_type_desc: '골반이 틀어지고 벌어지면서 대퇴 외측에 지방이 측면 파지 형태로 축적된 상태입니다. 스쿼트·런지 등 일반 하체 운동을 하면 골반 불안정이 오히려 심화될 수 있습니다.',
    axis_top: '형',
  },
  // ── 상체형 ──
  'BC-9': {
    code: 'BC-9',
    outline_card: '거북이형',
    app_nickname: '#거북이형',
    medical_title: '경추·흉추 보상성 림프 차단형 체형',
    color: '#607d8b', bg: '#ECEFF1', icon: '🐢',
    failed_type_desc: '거북목, 라운드 숄더로 인해 상체 액와(겨드랑이) 림프절이 물리적으로 찝힌 상태입니다. 척추 정렬 없이 유산소만 과도하게 하면 팔뚝과 쇄골 주변에 노폐물이 갇혀 상체 비대화가 진행될 수 있습니다.',
    axis_top: '형',
  },
  'BC-10': {
    code: 'BC-10',
    outline_card: '팔뚝부종형',
    app_nickname: '#팔뚝부종형',
    medical_title: '상체 액와 림프 정체·팔뚝 부종형 체형',
    color: '#1A7FC1', bg: '#E3F1FB', icon: '💪',
    failed_type_desc: '겨드랑이 림프절이 압박되어 팔뚝에 체액이 정체된 상태입니다. 팔 유산소나 팔뚝 운동을 강화하면 림프 압박이 심화되어 오히려 팔뚝이 더 붓고 두꺼워지는 역효과가 납니다.',
    axis_top: '관',
  },
  'BC-11': {
    code: 'BC-11',
    outline_card: '상체근육형',
    app_nickname: '#상체근육형',
    medical_title: '상체 과발달·승모근 긴장 과적재형 체형',
    color: '#ef6c00', bg: '#E8F3DC', icon: '🏋️',
    failed_type_desc: '팔·어깨·승모근이 과사용으로 과발달된 상태입니다. 추가적인 상체 웨이트 트레이닝은 승모근 비대와 어깨선 확대로 이어지며, 몸통이 더 넓어 보이는 역효과를 냅니다.',
    axis_top: '형',
  },
  'BC-12': {
    code: 'BC-12',
    outline_card: '부유방형',
    app_nickname: '#부유방형',
    medical_title: '흉추 이완·브라라인 피하지방 축적형 체형',
    color: '#C0397A', bg: '#FCE4EE', icon: '👙',
    failed_type_desc: '흉추가 무너지고 라운드 숄더가 되면서 겨드랑이·브라라인에 피하지방이 집중된 상태입니다. 단순 유산소나 식이 제한만으로는 흉추 구조 변화 없이 이 부위 개선이 어렵습니다.',
    axis_top: '형',
  },
  // ── 전신형 ──
  'BC-13': {
    code: 'BC-13',
    outline_card: '갱년기 변환형',
    app_nickname: '#갱년기변환형',
    medical_title: '완경 호르몬 전환·지방 재배치형 체형',
    color: '#1565c0', bg: '#FEF3E2', icon: '🔄',
    failed_type_desc: '완경 전후 에스트로겐 급감으로 지방이 하체에서 복부·전신으로 강제 재배치되는 체형입니다. 기존에 효과 있던 다이어트법이 갑자기 안 통하는 이유가 호르몬 전환 때문입니다.',
    axis_top: '확',
  },
  'BC-14': {
    code: 'BC-14',
    outline_card: '번아웃 무기력형',
    app_nickname: '#번아웃무기력형',
    medical_title: '부신 피로·자율신경 교란형 체형',
    color: '#6a4fb0', bg: '#E8EAF6', icon: '🔋',
    failed_type_desc: '극심한 스트레스로 코르티솔/도파민 호르몬 체계가 불균형한 상태입니다. 밤 9시 이후 호르몬 역류로 인해 가짜 허기가 발생하며, 의지력으로만 참으려 하면 보상성 과식을 유발합니다.',
    axis_top: '심',
  },
  'BC-15': {
    code: 'BC-15',
    outline_card: '대사증후군형',
    app_nickname: '#대사증후군형',
    medical_title: '대사증후군 복합 고위험 체형',
    color: '#C0392B', bg: '#FADBD8', icon: '🚨',
    failed_type_desc: '당뇨·고혈압·고지혈증 등 대사위험 지표가 복합적으로 얽힌 상태입니다. 의학적 개입 없이 단독 식이·운동 다이어트를 강행하면 심혈관 부담이 심화될 수 있습니다.',
    axis_top: '확',
  },
  'BC-16': {
    code: 'BC-16',
    outline_card: '다중악순환형',
    app_nickname: '#다중악순환형',
    medical_title: '다중 원인 복합 악순환형 체형',
    color: '#455A64', bg: '#ECEFF1', icon: '🌪️',
    failed_type_desc: '하나의 원인이 아닌 여러 원인이 동시에 얽혀 악순환을 만들고 있는 상태입니다. 단일 처방으로 접근하면 다른 원인이 보상 반응을 일으켜 효과가 상쇄됩니다. 다축 동시 개입이 필요합니다.',
    axis_top: '복',
  },
};

// ──────────────────────────────────────────────
// 2. 10대 원인축 정의 (A01~A10)
// ──────────────────────────────────────────────
var AXIS_10_META = {
  'A01': { label: '인슐린·내장', icon: '🍽️', color: '#c98a3c', desc: '식후 혈당 반응 + 복부 내장지방 패턴' },
  'A02': { label: '림프순환',   icon: '💧', color: '#1A7FC1', desc: '하체·상체 림프 및 정맥 순환 상태' },
  'A03': { label: '호르몬',     icon: '🌸', color: '#C0397A', desc: '에스트로겐·갑상선·성호르몬 균형' },
  'A04': { label: '근감소',     icon: '🏃', color: '#ef6c00', desc: '근육량·기초대사량·이화작용 패턴' },
  'A05': { label: '소화·장',    icon: '🌿', color: '#00695c', desc: '장내 환경·소화 기능·가스 팽만' },
  'A06': { label: '골격·복압',  icon: '🦴', color: '#00acc1', desc: '골반 정렬·복압·코어 안정성' },
  'A07': { label: '코르티솔',   icon: '🌙', color: '#6a4fb0', desc: '부신·스트레스 호르몬·자율신경 상태' },
  'A08': { label: '심리·식이',  icon: '🧠', color: '#2e7d32', desc: '감정적 섭식·식욕 조절·행동 패턴' },
  'A09': { label: '대사위험',   icon: '⚠️', color: '#1565c0', desc: '대사증후군·혈압·혈당 복합 위험도' },
  'A10': { label: '기질·성향',  icon: '🔮', color: '#607d8b', desc: '오행 기질 + MBTI 행동 패턴 (처방 톤 필터)' },
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
    'A02': { default: '식후기절 혈당롤러코스터형' },
    'A03': { PCOS: '털털한 PCOS형', 갱년기: '호르몬스위치 갱년기형', default: '동시다발 다중악순환형' },
    'A04': { default: '팔다리거미 올챙이배형' },
    'A05': { default: '식후임산부 가스풍선형' },
    'A06': { default: '식후기절 혈당롤러코스터형' },
    'A07': { 번아웃: '스트레스성 야식부엉이형', default: '동시다발 다중악순환형' },
    'A08': { 약물: '억제제부작용 배부름마비형', default: '억제제부작용 배부름마비형' },
    'A09': { 유전: '아빠체형 내장비대형', 대사증후군: '대사증후군 종합형', default: '식후기절 혈당롤러코스터형' },
    'A10': { 유전: '아빠체형 내장비대형', default: '아빠체형 내장비대형' },
    'default': { default: '식후기절 혈당롤러코스터형' },
  },
  // ── A02 Top1: 림프순환 → BC-1 계열 ──
  'A02': {
    'A01': { default: '오후만되면 코끼리다리형' },
    'A03': { 모계유전: '엄마체형 하지정체형', 갱년기: '호르몬스위치 갱년기형', default: '오후만되면 코끼리다리형' },
    'A04': { 시술: '지방흡입후 재발형', default: '오후만되면 코끼리다리형' },
    'A05': { default: '오후만되면 코끼리다리형' },
    'A06': { 시술: '지방흡입후 재발형', default: '안 쓰는 팔뚝 부종형' },
    'A07': { default: '스트레스기절 번아웃형' },
    'A08': { default: '오후만되면 코끼리다리형' },
    'A09': { default: '대사증후군 종합형' },
    'A10': { 모계유전: '엄마체형 하지정체형', default: '엄마체형 하지정체형' },
    'default': { default: '오후만되면 코끼리다리형' },
  },
  // ── A03 Top1: 호르몬 → BC-6 계열 ──
  'A03': {
    'A01': { PCOS: '털털한 PCOS형', 갱년기: '호르몬스위치 갱년기형', default: '털털한 PCOS형' },
    'A02': { 갱년기: '호르몬스위치 갱년기형', default: '여름에도 시린 얼음장형' },
    'A04': { 갱년기: '호르몬스위치 갱년기형', default: '팔다리거미 올챙이배형' },
    'A05': { 갱년기: '호르몬스위치 갱년기형', default: '털털한 PCOS형' },
    'A06': { 출산: '출산후 바람빠진 풍선형', 갱년기: '호르몬스위치 갱년기형', default: '겨드랑이 부유방형' },
    'A07': { 갱년기: '호르몬스위치 갱년기형', default: '호르몬스위치 갱년기형' },
    'A08': { 갱년기: '호르몬스위치 갱년기형', default: '스트레스성 야식부엉이형' },
    'A09': { 약물: '약물부작용 강제축적형', 갱년기: '호르몬스위치 갱년기형', default: '약물부작용 강제축적형' },
    'A10': { 갱년기: '호르몬스위치 갱년기형', default: '여름에도 시린 얼음장형' },
    'default': { 갱년기: '호르몬스위치 갱년기형', default: '털털한 PCOS형' },
  },
  // ── A04 Top1: 근감소 → BC-8/BC-9 계열 ──
  'A04': {
    'A01': { default: '팔다리거미 올챙이배형' },
    'A02': { default: '운동할수록 말벅지형' },
    'A03': { default: '팔다리거미 올챙이배형' },
    'A05': { default: '팔다리거미 올챙이배형' },
    'A06': { 출산: '출산후 바람빠진 풍선형', default: '운동할수록 말벅지형' },
    'A07': { default: '상체근육형' },
    'A08': { default: '팔다리거미 올챙이배형' },
    'A09': { default: '상체근육형' },
    'A10': { default: '팔다리거미 올챙이배형' },
    'default': { default: '팔다리거미 올챙이배형' },
  },
  // ── A05 Top1: 소화·장 → BC-3 소화 계열 ──
  'A05': {
    'A01': { default: '식후임산부 가스풍선형' },
    'A02': { default: '식후임산부 가스풍선형' },
    'A03': { default: '식후임산부 가스풍선형' },
    'A04': { default: '팔다리거미 올챙이배형' },
    'A06': { 출산: '출산후 바람빠진 풍선형', default: '식후임산부 가스풍선형' },
    'A07': { 번아웃: '스트레스성 야식부엉이형', default: '식후임산부 가스풍선형' },
    'A08': { default: '억제제부작용 배부름마비형' },
    'A09': { default: '식후임산부 가스풍선형' },
    'A10': { default: '식후임산부 가스풍선형' },
    'default': { default: '식후임산부 가스풍선형' },
  },
  // ── A06 Top1: 골격·복압 → BC-7 계열 ──
  'A06': {
    'A01': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
    'A02': { 시술: '지방흡입후 재발형', default: '목짧아지는 거북이형' },
    'A03': { 출산: '출산후 바람빠진 풍선형', default: '겨드랑이 부유방형' },
    'A04': { 출산: '출산후 바람빠진 풍선형', default: '출산후 바람빠진 풍선형' },
    'A05': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
    'A07': { 출산: '출산후 바람빠진 풍선형', default: '목짧아지는 거북이형' },
    'A08': { default: '골반틀어짐 승마살형' },
    'A09': { default: '골반틀어짐 승마살형' },
    'A10': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
    'default': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
  },
  // ── A07 Top1: 코르티솔 → BC-6 계열 ──
  'A07': {
    'A01': { default: '스트레스성 야식부엉이형' },
    'A02': { default: '스트레스기절 번아웃형' },
    'A03': { 갱년기: '호르몬스위치 갱년기형', 번아웃: '스트레스기절 번아웃형', default: '스트레스기절 번아웃형' },
    'A04': { default: '팔다리거미 올챙이배형' },
    'A05': { 번아웃: '스트레스기절 번아웃형', default: '식후임산부 가스풍선형' },
    'A06': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
    'A08': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
    'A09': { 대사증후군: '대사증후군 종합형', default: '동시다발 다중악순환형' },
    'A10': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
    'default': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
  },
  // ── A08 Top1: 심리·식이 → BC-6 심리 계열 ──
  'A08': {
    'A01': { 약물: '억제제부작용 배부름마비형', default: '스트레스성 야식부엉이형' },
    'A02': { default: '스트레스성 야식부엉이형' },
    'A03': { 갱년기: '호르몬스위치 갱년기형', default: '스트레스성 야식부엉이형' },
    'A04': { default: '팔다리거미 올챙이배형' },
    'A05': { 약물: '억제제부작용 배부름마비형', default: '억제제부작용 배부름마비형' },
    'A06': { default: '골반틀어짐 승마살형' },
    'A07': { 번아웃: '스트레스기절 번아웃형', default: '스트레스기절 번아웃형' },
    'A09': { 대사증후군: '대사증후군 종합형', default: '동시다발 다중악순환형' },
    'A10': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
    'default': { 약물: '억제제부작용 배부름마비형', default: '스트레스성 야식부엉이형' },
  },
  // ── A09 Top1: 대사위험 → BC-4 계열 ──
  'A09': {
    'A01': { 대사증후군: '대사증후군 종합형', 유전: '아빠체형 내장비대형', default: '대사증후군 종합형' },
    'A02': { 대사증후군: '대사증후군 종합형', default: '대사증후군 종합형' },
    'A03': { 대사증후군: '대사증후군 종합형', 약물: '약물부작용 강제축적형', default: '약물부작용 강제축적형' },
    'A04': { default: '대사증후군 종합형' },
    'A05': { default: '대사증후군 종합형' },
    'A06': { default: '대사증후군 종합형' },
    'A07': { 대사증후군: '대사증후군 종합형', default: '동시다발 다중악순환형' },
    'A08': { 약물: '약물부작용 강제축적형', default: '동시다발 다중악순환형' },
    'A10': { 대사증후군: '대사증후군 종합형', default: '약물부작용 강제축적형' },
    'default': { 약물: '약물부작용 강제축적형', 대사증후군: '대사증후군 종합형', default: '대사증후군 종합형' },
  },
  // ── A10 Top1: 기질·성향 → 기질설문으로 분기 (닉네임은 Top2 기준) ──
  'A10': {
    'A01': { 유전: '아빠체형 내장비대형', default: '식후기절 혈당롤러코스터형' },
    'A02': { 모계유전: '엄마체형 하지정체형', default: '오후만되면 코끼리다리형' },
    'A03': { 갱년기: '호르몬스위치 갱년기형', default: '여름에도 시린 얼음장형' },
    'A04': { default: '팔다리거미 올챙이배형' },
    'A05': { default: '식후임산부 가스풍선형' },
    'A06': { 출산: '출산후 바람빠진 풍선형', default: '골반틀어짐 승마살형' },
    'A07': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
    'A08': { 번아웃: '스트레스기절 번아웃형', default: '스트레스성 야식부엉이형' },
    'A09': { 대사증후군: '대사증후군 종합형', default: '약물부작용 강제축적형' },
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

  // ──────────────────────────────────────────────────────────────────
  // 멀티 소스 키 통합 버전 (2026-07)
  //
  // [에스테틱/통합 survey-data.js 키]
  //   Q_MENOPAUSE / menopause_status  → 갱년기
  //   medical_conditions / Q_MEDICAL  → PCOS·대사증후군 (배열, 문자열)
  //   procedure                        → 시술 ('none'이면 제외)
  //   meds                             → 약물 ('none'이면 제외)
  //   birth_history                    → 출산 ('none'이면 제외)
  //   stress_level / Q_burnout         → 번아웃
  //
  // [병원 survey-hospital.html (slimmind_baba_KO) 키]
  //   q12_menopause(숫자0~4) / Q_MENOPAUSE(문자, result-hospital에서 매핑됨)
  //   disease (배열, 인덱스: 0=PCOS,1=당뇨,2=고혈압,3=갑상선,4=지방간)
  //   past_procedures (배열, 5=없음)
  //   long_term_drugs (배열, 6=없음)
  //   appetite_suppressant (숫자: 0=여러번,1=한두번,2=없음)
  //   q11_event (숫자: 여성 0=출산 후)
  //   q1_family / q2_parent           → 유전·모계유전
  //   q8_trigger (배열, 1=이별충격)    → 번아웃
  //
  // 우선순위: 갱년기 > PCOS > 시술 > 약물 > 출산 > 유전 > 대사증후군 > 번아웃
  // ──────────────────────────────────────────────────────────────────

  // 공통 헬퍼: 배열 또는 단일숫자에서 인덱스 포함 여부
  const hasIdx = (val, idx) => {
    if (val === undefined || val === null) return false;
    if (Array.isArray(val)) return val.indexOf(idx) > -1;
    if (typeof val === 'number') return val === idx;
    return false;
  };

  // ── 1. 갱년기 ──
  // [에스테틱] Q_MENOPAUSE 문자값 / menopause_status
  const meno = answers['Q_MENOPAUSE'] || answers['menopause_status'] || answers['Q_meno'] || '';
  if (meno && meno !== 'not_applicable' && meno !== 'none' && meno !== '') {
    return '갱년기';
  }
  // [병원] q12_menopause 숫자 0(갱년기 변환형)·1(호르몬 치료형)·2(완경 후) → 갱년기
  const q12 = answers['q12_menopause'];
  if (q12 === 0 || q12 === 1 || q12 === 2 || q12 === '0' || q12 === '1' || q12 === '2') {
    return '갱년기';
  }

  // ── 2. PCOS ──
  // [에스테틱] medical_conditions 배열에 'pcos' 포함
  const medCondRaw = answers['medical_conditions'] || answers['Q_MEDICAL'] || null;
  const medCondArr = Array.isArray(medCondRaw) ? medCondRaw
    : (typeof medCondRaw === 'string' && medCondRaw !== '' ? [medCondRaw] : []);
  if (medCondArr.some(v => String(v).toLowerCase().includes('pcos'))) return 'PCOS';
  if (answers['Q_PCOS'] === 'yes' || answers['Q_PCOS'] === 'Y') return 'PCOS';
  // [병원] disease 배열 인덱스 0 = PCOS
  const disease = answers['disease'];
  if (hasIdx(disease, 0)) return 'PCOS';

  // ── 3. 시술 ──
  // [에스테틱] procedure 문자값 ('none' 제외)
  const surgery = answers['procedure'] || answers['Q_surgery'] || '';
  if (surgery && surgery !== 'none' && surgery !== '없음' && surgery !== '') {
    return '시술';
  }
  // [병원] past_procedures 배열 (5=없음 제외)
  const proc = answers['past_procedures'];
  if (proc !== undefined && proc !== null) {
    if (Array.isArray(proc) && proc.some(i => i !== 5 && i !== '5')) return '시술';
    if (typeof proc === 'number' && proc !== 5) return '시술';
  }

  // ── 4. 약물 ──
  // [에스테틱] meds 문자값 ('none' 제외)
  const drug = answers['meds'] || answers['Q_drug'] || '';
  if (drug && drug !== 'none' && drug !== '없음' && drug !== '') {
    return '약물';
  }
  // [병원] long_term_drugs 배열 (6=없음 제외)
  //   단, 항우울제(1) + q8_trigger[1](이별충격) 동시 → 번아웃으로 상향 (아래에서 처리)
  const drugs = answers['long_term_drugs'];
  if (drugs !== undefined && drugs !== null) {
    if (Array.isArray(drugs)) {
      const hasBurnoutDrug = drugs.indexOf(1) > -1;        // 항우울제
      const trigger = answers['q8_trigger'] || [];
      const hasBurnoutTrigger = hasIdx(trigger, 1);        // 이별·충격
      if (hasBurnoutDrug && hasBurnoutTrigger) return '번아웃';
      if (drugs.some(i => i !== 6 && i !== '6')) return '약물';
    } else if (typeof drugs === 'number' && drugs !== 6) return '약물';
  }
  // [병원] appetite_suppressant 0=여러번 / 1=한두번 → 약물 계열
  const appetite = answers['appetite_suppressant'];
  if (appetite === 0 || appetite === 1 || appetite === '0' || appetite === '1') return '약물';

  // ── 5. 출산 ──
  // [에스테틱] birth_history 문자값 ('none' 제외)
  const birth = answers['birth_history'] || answers['Q_birth'] || answers['Q3'] || '';
  if (birth && birth !== 'none' && birth !== '없음' && birth !== '') {
    return '출산';
  }
  // [병원] q11_event === 0 (여성만)
  const q11 = answers['q11_event'];
  if (q11 === 0 || q11 === '0') {
    const gender = String(answers['Q02'] || '').toLowerCase();
    const isMale = gender === '남' || gender === '남성' || gender === 'male' || gender === 'm';
    if (!isMale) return '출산';
  }

  // ── 6. 유전·모계유전 ──
  // [병원] q1_family 배열 (3=없음 제외)
  const fam = answers['q1_family'];
  if (fam !== undefined && fam !== null && Array.isArray(fam)) {
    const noFamily = fam.length === 0 || (fam.length === 1 && (fam[0] === 3 || fam[0] === '3'));
    if (!noFamily) {
      const hasMom = fam.indexOf(1) > -1;
      const hasDad = fam.indexOf(0) > -1;
      if (hasMom && !hasDad) return '모계유전';
      return '유전';
    }
  }
  // [병원] q2_parent: 1=엄마 닮아 하체 → 모계유전, 0=아빠 닮아/2=둘다 → 유전
  const parent = answers['q2_parent'];
  if (parent === 1 || parent === '1') return '모계유전';
  if (parent === 0 || parent === '0' || parent === 2 || parent === '2') return '유전';

  // ── 7. 대사증후군 ──
  // [에스테틱] medical_conditions 배열에 당뇨/고혈압/지방간 포함
  const metabolicFlags = ['diabetes', 'hypertension', 'fatty_liver'];
  if (medCondArr.some(v => metabolicFlags.includes(String(v).toLowerCase()))) return '대사증후군';
  const diabetesRisk = answers['Q_diabetes'] || answers['Q_metabolic'] || '';
  if (diabetesRisk === 'yes' || diabetesRisk === 'Y' || diabetesRisk === '있음') return '대사증후군';
  // [병원] disease 배열: 1=당뇨, 2=고혈압
  if (disease && Array.isArray(disease)) {
    if (disease.indexOf(1) > -1 || disease.indexOf(2) > -1) return '대사증후군';
  }

  // ── 8. 번아웃 ──
  // [에스테틱] stress_level >= 4
  const stressVal = Number(answers['stress_level'] || answers['Q21'] || 0);
  if (stressVal >= 4) return '번아웃';
  const burnout = answers['Q_burnout'] || '';
  if (burnout === 'severe' || burnout === '심각' || burnout === '극심') return '번아웃';
  // [병원] q8_trigger 배열 인덱스 1 (이별·충격) 단독
  const trigger = answers['q8_trigger'];
  if (hasIdx(trigger, 1)) return '번아웃';

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

// ──────────────────────────────────────────────────────────────────
// 7. 닉네임 → BC코드 역매핑 테이블
// ★ v2.0 BC독립 구조:
//   BC코드는 1차 외형 응답(survey-hospital.html determineOutlineBC())으로 직접 결정.
//   이 테이블은 getRoadmapWeeks(bc_primary=한글닉네임) 직접 호출 시 fallback 용도로만 유지.
//   22개 닉네임은 1~5단계 전체 점수로 독립 결정 — BC코드와 1:1 연결 불필요.
// ──────────────────────────────────────────────────────────────────
// ★ GAP-01~03 수정 (2026-08-18): 설계도 슬림마인드_결과지_설계도.html 아형 25벌 테이블 1:1 매핑
// 변경 내용:
//   [GAP-02] 오매핑 9건 수정: 목짧아지는거북이형 BC-9→BC-2, 아빠체형내장비대형 BC-4→BC-3,
//             털털한PCOS형 BC-14→BC-3, 억제제부작용배부름마비형 BC-3→BC-4,
//             여름에도시린얼음장형 BC-15→BC-5, 스트레스성야식부엉이형 BC-3→BC-6,
//             식후임산부가스풍선형 BC-5→BC-7, 운동할수록말벅지형 BC-7→BC-8,
//             팔다리거미올챙이배형 BC-6→BC-9
//   [GAP-01] 누락 4건 추가: 남산수박배기본형→BC-3, 물만마셔도요요기본형→BC-4,
//             셀룰라이트귤껍질기본형→BC-5, 출산후바람빠진풍선형→BC-7
//   [GAP-02] 이름 통일: 혈당롤러코스터형 → 혈당롤러형 (설계도 기준)
//   [GAP-03] 삭제: 지방흡입후재발형 (설계 외 항목, BC-2는 목짧아지는거북이형 단독)
var NICKNAME_TO_BC = {
  // ── BC-1: 하지정체·부종형 ─────────────────────────────
  '엄마체형 하지정체형':            'BC-1',  // 설계도 ✅ BC-1
  '오후만되면 코끼리다리형':        'BC-1',  // 설계도 ✅ BC-1
  // ── BC-2: 자세·거북목형 ──────────────────────────────
  '목짧아지는 거북이형':            'BC-2',  // 설계도 ✅ BC-2 (구:BC-9 → 수정)
  // ── BC-3: 내장·인슐린저항형 ─────────────────────────
  '남산수박배 기본형':              'BC-3',  // 설계도 ✅ BC-3 (신규 추가)
  '식후기절 혈당롤러형':            'BC-3',  // 설계도 ✅ BC-3 (이름 통일: 코스터형→롤러형)
  '아빠체형 내장비대형':            'BC-3',  // 설계도 ✅ BC-3 (구:BC-4 → 수정)
  '털털한 PCOS형':                  'BC-3',  // 설계도 ✅ BC-3 (구:BC-14 → 수정)
  // ── BC-4: 대사저하·약물형 ────────────────────────────
  '물만마셔도요요 기본형':          'BC-4',  // 설계도 ✅ BC-4 (신규 추가)
  '약물부작용 강제축적형':          'BC-4',  // 설계도 ✅ BC-4
  '억제제부작용 배부름마비형':      'BC-4',  // 설계도 ✅ BC-4 (구:BC-3 → 수정)
  // ── BC-5: 순환저하·냉체형 ────────────────────────────
  '셀룰라이트귤껍질 기본형':        'BC-5',  // 설계도 ✅ BC-5 (신규 추가)
  '여름에도 시린 얼음장형':         'BC-5',  // 설계도 ✅ BC-5 (구:BC-15 → 수정)
  // ── BC-6: 코르티솔·야식형 ────────────────────────────
  '스트레스성 야식부엉이형':        'BC-6',  // 설계도 ✅ BC-6 (구:BC-3 → 수정)
  // ── BC-6: 코르티솔·야식형 (팔다리거미 추가) ─────────
  '팔다리거미 올챙이배형':          'BC-6',  // 설계도 ✅ BC-6 (구:BC-9 → 수정)
  // ── BC-7: 호르몬·출산형 ──────────────────────────────
  '식후임산부 가스풍선형':          'BC-5',  // 설계도 ✅ BC-5 (구:BC-7 → 수정)
  '출산후 바람빠진 풍선형':         'BC-7',  // 설계도 ✅ BC-7
  '운동할수록 말벅지형':            'BC-7',  // 설계도 ✅ BC-7 (구:BC-8 → 수정)
  // ── BC-2: 지방흡입재발형 (bc-engine 누락분 추가) ─────
  '지방흡입후 재발형':              'BC-2',  // 설계도 ✅ BC-2 (누락 추가)
  // ── BC-8: 골반·체형형 ────────────────────────────────
  '골반틀어짐 승마살형':            'BC-8',  // 설계도 ✅ BC-8
  // ── BC-10: 팔뚝부종형 ────────────────────────────────
  '안 쓰는 팔뚝 부종형':           'BC-10', // 설계도 ✅ BC-10
  // ── BC-11: 상체근육형 ────────────────────────────────
  '상체근육형':                     'BC-11', // 설계도 ✅ BC-11
  // ── BC-12: 부유방형 ──────────────────────────────────
  '겨드랑이 부유방형':              'BC-12', // 설계도 ✅ BC-12
  // ── BC-13: 갱년기변환형 ──────────────────────────────
  '호르몬스위치 갱년기형':          'BC-13', // 설계도 ✅ BC-13
  // ── BC-14: 번아웃·무기력형 ──────────────────────────
  '스트레스기절 번아웃형':          'BC-14', // 설계도 ✅ BC-14
  // ── BC-15: 대사증후군형 ──────────────────────────────
  '대사증후군 종합형':              'BC-15', // 설계도 ✅ BC-15
  // ── BC-16: 다중악순환형 ──────────────────────────────
  '동시다발 다중악순환형':          'BC-16', // 설계도 ✅ BC-16
  // ── 하위 호환: 구 이름 별칭 (혈당롤러코스터형 검색 대응) ──
  '식후기절 혈당롤러코스터형':      'BC-3',  // 구버전 호환 (설계명: 혈당롤러형)
  // ── v3.3 신설 24아형 (2026-08-20 추가) ──────────────────────
  // 복부 신설 3종
  '배만 붓는 복부 정체형':               'BC-7',
  '배부터 무너지는 남성 호르몬 저하형':  'BC-3',
  '복압 빠진 맥주배형':                  'BC-7',
  // 하체 신설 5종
  '당이 하체로 가는 저장형':             'BC-3',
  '장이 막혀 다리가 무거운 형':          'BC-1',
  '밤에 굳는 하체 정체형':               'BC-14',
  '습관이 하체에 쌓인 형':               'BC-4',
  '다리부터 신호 오는 대사 경고형':      'BC-15',
  // 상체 신설 7종
  '등살부터 차오르는 저장형':            'BC-3',
  '어깨 뒤부터 바뀌는 호르몬 전환형':   'BC-13',
  '장이 눌러 상체가 굳는 형':            'BC-7',
  '어깨에 얹힌 긴장 축적형':             'BC-14',
  '습관이 팔뚝에 쌓인 형':               'BC-4',
  '목 뒤부터 신호 오는 대사 경고형':     'BC-15',
  '가슴 아래 접히는 흉부 정체형':        'BC-12',
  // 전신 신설 4종
  '온몸이 무거운 전신 정체형':           'BC-13',
  '장에서 시작된 전신 염증형':           'BC-15',
  '축이 무너진 전신 불균형형':           'BC-16',
  '습관이 온몸에 쌓인 형':               'BC-4',
  // 기본형·남성전용·기본형5 신설 5종
  '짊어진어깨형':                        'BC-2',
  '전체적으로둔해진형':                  'BC-16',
  '남산수박배형':                        'BC-3',
  '셀룰라이트귤껍질형':                  'BC-5',
  '물만마셔도요요형':                    'BC-4',
};

// BC코드 → 대표 한글 닉네임 (getRoadmapWeeks fallback·결과지 표시용)
// ★ BC-1~BC-16 전체 커버 — 설계도 기준 대표 아형 (GAP-01~03 반영, 2026-08-18)
var BC_TO_DEFAULT_NICKNAME = {
  // 하체형
  'BC-1': '오후만되면 코끼리다리형',
  'BC-2': '목짧아지는 거북이형',      // 설계도 기준: BC-2 = 목짧아지는 거북이형
  'BC-7': '출산후 바람빠진 풍선형',    // 설계도 기준: BC-7 대표 (구:식후임산부→출산후)
  'BC-8': '골반틀어짐 승마살형',
  // 복부형
  'BC-3': '식후기절 혈당롤러코스터형', // 설계도 기준 대표
  'BC-4': '약물부작용 강제축적형',
  'BC-5': '식후임산부 가스풍선형',     // 설계도 기준: BC-5 대표 (구:셀룰라이트귤껍질→식후임산부)
  'BC-6': '스트레스성 야식부엉이형',   // 설계도 기준: BC-6 대표
  // 상체형
  'BC-9':  '목짧아지는 거북이형',      // 설계도 기준: BC-9 fallback (구:팔다리거미→거북이형)
  'BC-10': '안 쓰는 팔뚝 부종형',
  'BC-11': '상체근육형',
  'BC-12': '겨드랑이 부유방형',
  // 전신형
  'BC-13': '호르몬스위치 갱년기형',
  'BC-14': '스트레스기절 번아웃형',
  'BC-15': '대사증후군 종합형',
  'BC-16': '동시다발 다중악순환형',
};

// ──────────────────────────────────────────────
// 8. 8대 원인축 메타 (약·식·복·확·한·심·형·관) — 기존 유지
// ──────────────────────────────────────────────
var CAUSAL_AXIS_META = {
  '약': { label: '약물·식이습관', icon: '💊', color: '#d32f2f', axisKeys: ['A08','A09'], bcNum: 9 },
  '식': { label: '식단·지방저장', icon: '🍽️', color: '#c98a3c', axisKeys: ['A01','A05'], bcNum: 3 },
  '복': { label: '복신·회복',    icon: '🌙', color: '#6a4fb0', axisKeys: ['A07'],       bcNum: 7 },
  '확': { label: '호르몬·대사',  icon: '🌸', color: '#C0397A', axisKeys: ['A03'],       bcNum: 4 },
  '한': { label: '한방·순환',    icon: '🌿', color: '#00695c', axisKeys: ['A02','A05'], bcNum: 5 },
  '심': { label: '심리·식이행동',icon: '🧠', color: '#00acc1', axisKeys: ['A08','A07'], bcNum: 6 },
  '형': { label: '체형정렬',     icon: '🦴', color: '#00acc1', axisKeys: ['A06'],       bcNum: 2 },
  '관': { label: '관·하체순환',  icon: '💧', color: '#1A7FC1', axisKeys: ['A02','A04'], bcNum: 1 },
};

// ──────────────────────────────────────────────
// 3. 11대 전문 진단축
// ──────────────────────────────────────────────
var AXIS_11 = [
  { key: '약물',   label: '약물',   icon: '💊', color: '#d32f2f', axisRef: 'A08' },
  { key: '식단',   label: '식단',   icon: '🍽️', color: '#c98a3c', axisRef: 'A01' },
  { key: '운동',   label: '운동',   icon: '🏃', color: '#ef6c00', axisRef: 'A04' },
  { key: '회복',   label: '회복',   icon: '🌙', color: '#6a4fb0', axisRef: 'A07' },
  { key: '한방',   label: '한방',   icon: '🌿', color: '#00695c', axisRef: 'A02' },
  { key: '심리',   label: '심리',   icon: '🧠', color: '#2e7d32', axisRef: 'A08' },
  { key: '체형',   label: '체형',   icon: '🦴', color: '#00acc1', axisRef: 'A06' },
  { key: '호르몬', label: '호르몬', icon: '🌸', color: '#C0397A', axisRef: 'A03' },
  { key: '시술',   label: '시술',   icon: '✨', color: '#1565c0', axisRef: 'A09' },
  { key: '관리',   label: '관리',   icon: '💆', color: '#795548', axisRef: 'A04' },
  { key: '철학',   label: '철학',   icon: '🔮', color: '#607d8b', axisRef: 'A10' },
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
  // ★ BC독립 구조: survey-hospital.html determineOutlineBC()가 우선.
  //   computeBCCode()는 bc-engine.js 내부 계산·결과지 렌더 보조용 fallback.
  const masterKey = NICKNAME_TO_BC[nickname] || 'BC-16';
  const bcCode    = masterKey;
  const bcMaster  = BC_MASTER[masterKey] || BC_MASTER['BC-3'] || BC_MASTER['BC-6'];

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
  const firstDomino = (CAUSAL_AXIS_META[top1Legacy[0]] && CAUSAL_AXIS_META[top1Legacy[0]].label) || '스트레스';

  // ⑤ 4대 지표 — GAP-04 수정: 설계도 공식 100% 적용 (2026-08-18)
  // 대사효율나이: 실나이 + (10축 평균부담 − 0.5) × 20, clamp 상한+12/하한-4
  const _realAge4 = (function() {
    var ans = answers || {};
    if (ans.birth_date) {
      var y = parseInt((ans.birth_date||'').split('-')[0]);
      if (y > 1900 && y < 2020) return new Date().getFullYear() - y;
    }
    if (ans.age) return Number(ans.age) || 42;
    return 42;
  })();
  const _allAxes4 = ['A01','A02','A03','A04','A05','A06','A07','A08','A09','A10'];
  const _axSum4   = _allAxes4.reduce((s,k) => s + (axisScores[k]||0), 0);
  const _axAvg4   = _axSum4 / 10;  // 0~12 스케일 평균
  const _ageDelta = (_axAvg4 / 12 - 0.5) * 20;  // 정규화(0~1) 후 공식 적용
  const metaAge    = Math.min(_realAge4 + 12, Math.max(_realAge4 - 4, Math.round(_realAge4 + _ageDelta)));
  // 복부위험도: (A01×45% + A09×25% + A07×15% + A05×15%) × 75 + 8
  const metaBelly  = Math.min(99, Math.max(8, Math.round(
    ((axisScores['A01']||0)*0.45 + (axisScores['A09']||0)*0.25 +
     (axisScores['A07']||0)*0.15 + (axisScores['A05']||0)*0.15) / 12 * 75 + 8
  )));
  // 호르몬부하: (A03×45% + A07×30% + A02×25%) × 75 + 8
  const metaHormone= Math.min(99, Math.max(8, Math.round(
    ((axisScores['A03']||0)*0.45 + (axisScores['A07']||0)*0.30 +
     (axisScores['A02']||0)*0.25) / 12 * 75 + 8
  )));
  // 체형불균형: (A06×50% + A02×30% + A04×20%) × 75 + 8
  const metaBody   = Math.min(99, Math.max(8, Math.round(
    ((axisScores['A06']||0)*0.50 + (axisScores['A02']||0)*0.30 +
     (axisScores['A04']||0)*0.20) / 12 * 75 + 8
  )));

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
  // ── 목(木) — 간·담, 감정 억압·야식·스트레스 식욕 패턴 ──
  '목': {
    'INFP': { tone: '비강박 공감형', cta: '억지로 참지 않아도 됩니다. 환경을 바꾸면 돼요.', approach: '감정 억압 해소 루틴 먼저. 야식 대체 스낵 환경 구성.', diet: '칼로리 계산 없음. 색깔별 채소 접시 제안.', exercise: '혼자 하는 수영. 야외 평지 산책. 그룹 운동 ✗' },
    'INFJ': { tone: '통찰·내향형', cta: '왜 먹는지 이해하면, 안 먹는 게 편해집니다.', approach: '식욕 트리거 분석 다이어리. 감정→식욕 연결고리 인식 훈련.', diet: '녹색 채소 + 간 부담 없는 담백식. 소량 자주.', exercise: '혼자 하는 명상 걷기. 숲 트레킹 1회/주.' },
    'INTJ': { tone: '목표·데이터형', cta: '단계별로 정확하게, 하지만 자책 없이.', approach: '목표 미달 시 자책 방지 프로토콜. 마일스톤 세분화.', diet: '영양 수치 제공. 단계별 목표 설정. 주간 체크.', exercise: '계획된 수영 루틴. 진도 기록표 제공.' },
    'INTP': { tone: '분석·독자형', cta: '데이터가 답을 줄 겁니다. 먼저 기록하세요.', approach: '식사 로그·체중 그래프 자동화. 패턴 분석 피드백 제공.', diet: '영양 비율 수치화. 간편 조리 레시피 선호.', exercise: '혼자 계획한 루틴. 운동 앱 데이터 연동.' },
    'ISFJ': { tone: '안정·공감형', cta: '천천히 가도 괜찮아요. 꾸준함이 답이에요.', approach: '지지 그룹 연결. 음식 외 스트레스 해소책 개발.', diet: '따뜻한 음식. 규칙적 3식. 공복 금지.', exercise: '걷기·요가. 자연 속 운동.' },
    'ISFP': { tone: '감각·자유형', cta: '맛있는 것을 먹되, 몸이 좋아하는 맛을 찾아가세요.', approach: '맛 기반 다이어트. 억압보다 대체 식품 발굴.', diet: '신선한 제철 식재료. 쓴맛 채소로 간 해독 지원.', exercise: '즐거운 신체 활동. 댄스·등산·맨발 걷기.' },
    'ISTJ': { tone: '원칙·내향형', cta: '정해진 규칙을 지키면 몸이 따라옵니다.', approach: '규칙적 식사 시간 고정. 일탈 시 회복 프로토콜 명시.', diet: '정해진 메뉴 로테이션. 간 해독 지원 식품 포함.', exercise: '매일 같은 시간 걷기. 계획표 작성 후 실행.' },
    'ISTP': { tone: '실용·독립형', cta: '복잡하게 생각 마세요. 딱 한 가지만 바꾸면 됩니다.', approach: '가장 쉬운 행동 변화 1가지만 제시. 도구·앱 활용.', diet: '간편식 위주. 불필요한 규칙 최소화. 실용 식단.', exercise: '실외 활동. 자전거·등산. 반복 없는 변화 있는 루틴.' },
    'ENFJ': { tone: '공감·리더형', cta: '주변을 챙기듯 나 자신도 챙겨주세요.', approach: '가족·지인 건강 함께 관리 프레임. 책임감 활용.', diet: '가족과 함께 하는 건강식. 소셜 식사 전략.', exercise: '그룹 운동. 파트너 워킹·러닝.' },
    'ENFP': { tone: '열정·탐구형', cta: '새로운 방법을 찾아가는 게 곧 다이어트예요.', approach: '다양한 식이 실험 허용. 지루하면 변경 OK.', diet: '채식·채소 위주 챌린지. 컬러풀 플레이트.', exercise: '새로운 운동 탐색. 댄스·요가·클라이밍 로테이션.' },
    'ENTJ': { tone: '전략·추진형', cta: '지금 가장 효율적인 루트로 바로 실행하세요.', approach: '최단 경로 전략 제시. 불필요한 과정 제거.', diet: '식단 시스템화. 간편 준비 + 효율 극대화.', exercise: '고효율 인터벌. 시간 대비 효과 중심.' },
    'ENTP': { tone: '논쟁·아이디어형', cta: '기존 다이어트가 왜 틀렸는지 알고 나면 답이 보여요.', approach: '상식 깨기 접근. 자신만의 실험 설계 유도.', diet: '식이 제한보다 타이밍 최적화. 간헐적 단식 탐색.', exercise: '남들이 안 하는 운동. 크로스핏·복합 운동.' },
    'ESFJ': { tone: '사교·배려형', cta: '함께할 때 더 잘 됩니다. 건강 모임을 만들어보세요.', approach: '소셜 다이어트. 주변 인정·지지 시스템 활용.', diet: '함께 먹는 건강식. 모임에서도 지킬 수 있는 전략.', exercise: '그룹 운동. 가족 걷기. 건강 소모임.' },
    'ESFP': { tone: '흥미·즉흥형', cta: '즐거워야 꾸준해집니다. 재미있는 것부터 시작하세요.', approach: '즉각 피드백 시스템. 소소한 보상 설계.', diet: '맛있는 건강식 레시피 탐색. 색깔 다양성.', exercise: '신나는 그룹 운동. 아쿠아로빅·줌바.' },
    'ESTJ': { tone: '원칙·실행형', cta: '계획을 세웠으면 반드시 실행합니다. 예외 없이.', approach: '체크리스트 기반 실행. 주간 결과 평가.', diet: '정해진 식단표 고수. 간 해독 식품 정기 섭취.', exercise: '매일 정해진 시간 운동. 기록 필수.' },
    'ESTP': { tone: '행동·현실형', cta: '생각보다 실행이 먼저입니다. 지금 당장 움직이세요.', approach: '즉각 행동 유도. 결과 빠른 피드백.', diet: '간편하고 맛있는 단백질 식단. 복잡함 최소화.', exercise: '역동적 운동. 스포츠·서킷 트레이닝.' },
    'default': { tone: '감성 지지형', cta: '몸이 보내는 신호를 먼저 들어보세요.', approach: '감정 억압을 풀어주는 저녁 루틴 설계.', diet: '직관 식사 방식 + 녹색 채소 중심.', exercise: '야외 걷기 + 스트레칭 중심.' },
  },
  // ── 화(火) — 심·소장, 흥분·충동·빠른 소진 패턴 ──
  '화': {
    'INFP': { tone: '감성·회복형', cta: '감정이 진정되면 몸도 따라옵니다.', approach: '충동 식욕 전 1분 호흡 루틴. 감정 일기 활용.', diet: '쓴맛 채소·녹황색 채소. 흥분 낮추는 식품.', exercise: '혼자 하는 요가·수영. 격렬한 단체 운동 ✗.' },
    'INFJ': { tone: '통찰·절제형', cta: '충동이 올 때 패턴을 먼저 보세요. 이미 알고 있잖아요.', approach: '식욕 충동 패턴 인식 훈련. 트리거 사전 차단.', diet: '자극적 음식 의식적 대체. 담백·쓴맛 식단.', exercise: '명상 걷기. 혼자 하는 수영. 규칙적 루틴.' },
    'INTJ': { tone: '전략·자제형', cta: '충동도 전략으로 관리할 수 있습니다.', approach: '충동 대응 프로토콜 사전 설계. 예외 시나리오 대비.', diet: '계획된 식단. 쓴맛·녹황색 채소 정기 섭취.', exercise: '계획된 유산소. 과도한 고강도 조절 필요.' },
    'INTP': { tone: '분석·냉정형', cta: '충동의 원인을 분석하면 해결책이 나옵니다.', approach: '충동 발생 데이터 수집. 패턴 분석 → 환경 수정.', diet: '영양 성분 분석 식단. 자극 요소 제거.', exercise: '혼자 계획한 저강도 루틴. 과도한 고강도 ✗.' },
    'ISFJ': { tone: '안정·온화형', cta: '천천히 몸 온도를 낮추듯 진행하면 됩니다.', approach: '규칙적 식사로 충동 최소화. 과식 후 죄책감 차단.', diet: '소화 잘 되는 온식. 쓴맛 채소 포함.', exercise: '걷기·스트레칭. 과격한 운동 ✗.' },
    'ISFP': { tone: '감각·균형형', cta: '맛있으면서도 몸을 식혀주는 음식을 찾아보세요.', approach: '식이 대체 탐색. 감각 자극 다양화로 식욕 전환.', diet: '시원하고 신선한 채소·과일. 쓴맛 식품 활용.', exercise: '즐거운 신체 활동. 댄스·수영·야외 스포츠.' },
    'ISTJ': { tone: '원칙·절제형', cta: '규칙을 지키면 충동도 수그러듭니다.', approach: '식사 시간·양 규칙화. 충동 일지 기록.', diet: '정해진 식단 고수. 쓴맛 채소 정기 섭취.', exercise: '매일 같은 시간 유산소. 과도한 운동 ✗.' },
    'ISTP': { tone: '실용·현실형', cta: '복잡하게 생각 말고, 딱 지금 할 수 있는 것 하나만.', approach: '즉각 행동 변화 유도. 단순하고 실용적 전략.', diet: '간편식. 불필요한 규칙 최소화.', exercise: '실외 활동. 자전거·등산. 과격함 ✗.' },
    'ENFJ': { tone: '공감·리더형', cta: '에너지를 나누는 만큼 회복도 설계하세요.', approach: '소진 방지 회복 루틴 설계. 자기 돌봄 우선화.', diet: '쓴맛·균형 식단. 빠른 식사 습관 교정.', exercise: '그룹 운동 + 규칙적 회복 스트레칭.' },
    'ENFP': { tone: '열정·챌린지형', cta: '지금 당장 시작해도 됩니다. 같이 해요!', approach: '챌린지 구조. 버디 매칭. 매주 새 목표.', diet: '다양한 식단 로테이션. 지루함 방지 메뉴 다양화.', exercise: '아쿠아로빅·그룹 수영. SNS 챌린지 연동.' },
    'ENTJ': { tone: '목표 통솔형', cta: '전략을 세우되, 예외 규칙도 미리 설계하세요.', approach: '통제 욕구를 80/20 규칙으로 전환.', diet: '정량 식단 + 치트데이 공식화.', exercise: '데이터 트래킹 + 계획된 고강도 (1주에 2회).' },
    'ENTP': { tone: '도전·실험형', cta: '새로운 다이어트 실험을 지금 설계해보세요.', approach: '자신만의 실험 설계. 빠른 결과 피드백 제공.', diet: '색다른 식이 접근. 간헐적 단식·타이밍 최적화.', exercise: '다양한 고강도 스포츠. 루틴 변화 필수.' },
    'ESFJ': { tone: '사교·배려형', cta: '함께 할 때 더 잘 됩니다. 건강 모임을 만들어보세요.', approach: '소셜 식사 전략. 모임에서도 지킬 수 있는 규칙.', diet: '함께 하는 건강식. 쓴맛 채소 포함 식단.', exercise: '그룹 운동. 소모임 걷기.' },
    'ESFP': { tone: '흥미·즉흥형', cta: '즐거워야 꾸준해집니다!', approach: '즉각 보상 시스템. 소소한 성취 축하.', diet: '맛있는 건강식. 새로운 레시피 탐색.', exercise: '신나는 그룹 운동. 줌바·아쿠아로빅.' },
    'ESTJ': { tone: '원칙·속도형', cta: '빠른 실행, 하지만 회복 시간도 포함하세요.', approach: '체크리스트 기반. 소진 방지 회복 일정 포함.', diet: '정해진 식단 고수. 쓴맛 채소 정기 섭취.', exercise: '매일 운동, 주 1회 회복의 날 필수.' },
    'ESTP': { tone: '행동·속도형', cta: '지금 당장 움직이세요. 결과는 바로 느낄 겁니다.', approach: '즉각 행동 유도. 빠른 결과 피드백.', diet: '단백질 중심 간편식. 자극적 음식 점진적 대체.', exercise: '역동적 스포츠. 서킷 트레이닝.' },
    'default': { tone: '활력·속도형', cta: '에너지를 태우되 회복 시간도 설계하세요.', approach: '흥분-소진 사이클 관리가 핵심.', diet: '시원하고 가벼운 식단. 쓴맛 채소 활용.', exercise: '그룹 운동 + 다양한 종목 로테이션.' },
  },
  // ── 토(土) — 비·위, 소화 기능 약화·단맛 욕구·습담 패턴 ──
  '토': {
    'INFP': { tone: '감성·소화형', cta: '마음이 편해야 위도 편합니다.', approach: '스트레스 식욕 대체 루틴. 소식다회로 위 부담 최소화.', diet: '따뜻하고 소화 잘 되는 식품. 단맛 자연식 허용.', exercise: '혼자 하는 요가·걷기. 소화 돕는 스트레칭.' },
    'INFJ': { tone: '통찰·내향형', cta: '소화가 잘 되는 날이 몸 전체가 좋은 날입니다.', approach: '소화 패턴 관찰 일지. 트리거 식품 파악 후 교체.', diet: '발효 식품 + 소화 효소 식품. 소식다회.', exercise: '명상 걷기. 소화 후 10분 가벼운 산책.' },
    'INTJ': { tone: '전략·관리형', cta: '소화 시스템을 재설계한다는 관점으로 접근하세요.', approach: '식사 패턴 분석·개선 로드맵. 단계별 식이 교정.', diet: '정해진 식사 시간 + 소화 지원 식품.', exercise: '규칙적 유산소. 소화 후 걷기.' },
    'INTP': { tone: '분석·논리형', cta: '소화 메커니즘을 이해하면 식이 선택이 달라집니다.', approach: '소화 관련 데이터 제공. 원인 파악 후 식단 수정.', diet: '소화 효소 풍부한 식품. 불필요한 보충제 정리.', exercise: '혼자 하는 저강도 루틴. 소화 스트레칭 포함.' },
    'ISFJ': { tone: '안정·공감형', cta: '천천히 가도 괜찮아요. 꾸준함이 답이에요.', approach: '소식다회 전략 + 규칙적 식사 시간 고정.', diet: '따뜻하고 소화 잘 되는 식품 우선.', exercise: '걷기·요가. 혼자보다 함께.' },
    'ISFP': { tone: '감각·온화형', cta: '맛있으면서도 위가 편한 음식을 찾아가세요.', approach: '맛 기반 소화 식품 탐색. 강요 없이 자연스럽게.', diet: '따뜻한 발효 식품. 색깔 다양한 소화 채소.', exercise: '가벼운 신체 활동. 식후 산책 습관화.' },
    'ISTJ': { tone: '원칙·지속형', cta: '소화도 습관입니다. 규칙적으로 관리하면 됩니다.', approach: '식사 시간·양 엄수. 소화 돕는 루틴 체크리스트.', diet: '정해진 소화 식단. 단맛 자연식 + 발효 식품.', exercise: '매일 같은 시간 소화 걷기.' },
    'ISTP': { tone: '실용·단순형', cta: '복잡하게 생각 말고 위가 편한 음식만 먹으세요.', approach: '단순한 식이 원칙. 실용적 소화 루틴.', diet: '간편 소화식. 불필요한 규칙 최소화.', exercise: '실외 가벼운 활동. 식후 짧은 걷기.' },
    'ENFJ': { tone: '공감·배려형', cta: '나를 챙기는 것이 주변을 챙기는 시작입니다.', approach: '소화 건강 중요성 인식 → 자기 돌봄 우선화.', diet: '함께 먹는 건강식. 소화 돕는 온식.', exercise: '그룹 걷기. 소화 후 함께 하는 스트레칭.' },
    'ENFP': { tone: '탐구·다양형', cta: '새로운 건강식을 탐험하는 게 다이어트예요!', approach: '다양한 소화 식품 탐색 허용. 지루하면 변경 OK.', diet: '다양한 발효·소화 식품 탐색. 단맛 자연식.', exercise: '다양한 활동 로테이션. 소화 돕는 요가 포함.' },
    'ENTJ': { tone: '전략·실행형', cta: '소화 시스템 개선 프로젝트를 시작하세요.', approach: '식이 개선 로드맵. 단계별 소화 강화 전략.', diet: '정량 식단 + 소화 지원 식품.', exercise: '규칙적 중강도 유산소. 소화 후 걷기 의무화.' },
    'ENTP': { tone: '아이디어·실험형', cta: '소화 개선을 나만의 실험으로 접근해보세요.', approach: '자신만의 소화 개선 실험 설계.', diet: '다양한 발효·소화 식품 실험. 단맛 대체 탐색.', exercise: '다양한 신체 활동 탐색. 소화 스트레칭 포함.' },
    'ESFJ': { tone: '사교 조화형', cta: '함께 하면 더 잘 됩니다. 건강한 식사 모임을 만드세요.', approach: '사회적 식사 상황 방어 전략 먼저.', diet: '소화 돕는 발효 식품 + 온식.', exercise: '그룹 요가·산책.' },
    'ESFP': { tone: '흥미·활동형', cta: '맛있고 소화 잘 되는 음식 찾는 게 즐거운 일이에요.', approach: '소화 식품 탐색을 즐거운 도전으로 프레이밍.', diet: '맛있는 소화식 레시피 탐색. 발효 식품.', exercise: '신나는 가벼운 운동. 식후 댄스·걷기.' },
    'ESTJ': { tone: '원칙·실행형', cta: '소화도 계획입니다. 체계적으로 관리하세요.', approach: '소화 관리 체크리스트. 주간 평가.', diet: '정해진 소화 식단표. 발효 식품 정기 섭취.', exercise: '매일 정해진 소화 운동. 기록 필수.' },
    'ESTP': { tone: '행동·즉각형', cta: '지금 당장 위에 좋은 것 하나만 드세요.', approach: '즉각 행동 유도. 단순 소화 루틴.', diet: '간편하고 소화 잘 되는 단백질식.', exercise: '역동적 활동 후 소화 걷기 필수.' },
    'default': { tone: '온화·지속형', cta: '오늘 하루 소화가 잘 됐다면 성공입니다.', approach: '비위 운화 기능 지원이 우선.', diet: '단맛 자연식 + 소식다회.', exercise: '저강도 규칙적 산책 + 소화 스트레칭.' },
  },
  // ── 금(金) — 폐·대장, 완벽주의·독소 축적·호흡 패턴 ──
  '금': {
    'INFP': { tone: '감성·정화형', cta: '완벽하지 않아도 됩니다. 몸을 정화하는 것부터요.', approach: '완벽주의 이완 + 독소 배출 루틴.', diet: '흰색 채소·폐 건강 식품. 자연식 위주.', exercise: '혼자 하는 호흡 요가. 맑은 공기 속 걷기.' },
    'INFJ': { tone: '통찰·정화형', cta: '몸속 노폐물을 비워야 새로운 에너지가 들어옵니다.', approach: '독소 배출 루틴 중심. 완벽주의 이완 훈련.', diet: '폐 건강 식품 + 흰색 채소.', exercise: '명상 호흡 + 저강도 걷기.' },
    'INTJ': { tone: '전략·데이터형', cta: '계획 내 이탈도 계획의 일부입니다.', approach: '올-오-낫씽 패턴 인지 차단 훈련.', diet: '주간 식단표 + 예외 규칙 포함.', exercise: '계획된 루틴 + 진도 기록.' },
    'INTP': { tone: '분석·독립형', cta: '완벽한 식단 대신 최적화된 식단을 설계하세요.', approach: '식이 시스템 최적화. 독소 배출 과학적 접근.', diet: '영양 성분 분석 + 폐 건강 식품.', exercise: '혼자 계획한 호흡 운동 루틴.' },
    'ISFJ': { tone: '안정·꾸준형', cta: '천천히 독소를 빼가면 몸이 달라집니다.', approach: '점진적 독소 배출 루틴. 규칙적 식사 유지.', diet: '흰색 채소·발효 식품. 따뜻한 온식.', exercise: '규칙적 걷기·스트레칭. 호흡 운동 포함.' },
    'ISFP': { tone: '감각·자연형', cta: '자연스럽게 몸을 정화하는 방법을 찾아보세요.', approach: '자연 친화적 독소 배출 방법 탐색.', diet: '흰색 자연식. 폐 건강 채소 위주.', exercise: '맑은 공기 속 걷기·등산. 호흡 요가.' },
    'ISTJ': { tone: '규칙·원칙형', cta: '원칙대로, 하지만 완벽하지 않아도 됩니다.', approach: '완벽주의 이완 프로토콜. 작은 실수 허용 규칙.', diet: '정량 식단. 80/20 규칙 명확히. 예외 허용 기준 안내.', exercise: '개인 PT. 혼자 하는 계획된 루틴.' },
    'ISTP': { tone: '실용·단순형', cta: '복잡하지 않게, 지금 몸에 필요한 것만요.', approach: '단순 독소 배출 루틴. 실용적 접근.', diet: '간편 자연식. 폐 건강 식품 포함.', exercise: '실외 호흡 운동. 등산·자전거.' },
    'ENFJ': { tone: '공감·리더형', cta: '몸이 깨끗해져야 주변을 더 잘 돌볼 수 있어요.', approach: '자기 돌봄 우선화 프레임. 독소 배출 루틴.', diet: '폐 건강 식품 + 함께 하는 건강식.', exercise: '그룹 호흡 운동. 함께 하는 걷기·등산.' },
    'ENFP': { tone: '탐구·자유형', cta: '몸을 정화하는 새로운 방법을 탐험해보세요.', approach: '독소 배출 다양한 방법 탐색 허용.', diet: '다양한 정화 식품 탐색. 흰색 채소 챌린지.', exercise: '새로운 호흡 운동 탐색. 요가·등산 로테이션.' },
    'ENTJ': { tone: '전략·실행형', cta: '독소 배출 시스템을 지금 설계하고 실행하세요.', approach: '독소 배출 로드맵. 단계별 실행 + 기록.', diet: '식단 시스템화. 폐 건강 식품 정기 섭취.', exercise: '계획된 고강도 유산소. 호흡 훈련 포함.' },
    'ENTP': { tone: '도전·아이디어형', cta: '독소 배출에 대한 상식을 깨는 실험을 해보세요.', approach: '자신만의 독소 배출 실험 설계.', diet: '색다른 폐 건강 식품 탐색. 타이밍 최적화.', exercise: '다양한 호흡·유산소 운동 탐색.' },
    'ESFJ': { tone: '사교·배려형', cta: '함께 독소를 빼는 건강 모임을 만들어보세요.', approach: '소셜 독소 배출 챌린지. 지지 시스템 구축.', diet: '함께 하는 폐 건강식. 정화 식품 공유.', exercise: '그룹 호흡 운동. 함께 하는 등산·걷기.' },
    'ESFP': { tone: '흥미·활동형', cta: '몸을 정화하는 것도 즐겁게 할 수 있어요.', approach: '즐거운 독소 배출 방법 탐색. 즉각 보상.', diet: '맛있는 정화식 레시피. 흰색 채소 활용.', exercise: '신나는 야외 운동. 호흡 요가·등산.' },
    'ESTJ': { tone: '원칙·실행형', cta: '독소 배출도 계획입니다. 체계적으로 실행하세요.', approach: '독소 배출 체크리스트. 주간 평가 필수.', diet: '정해진 정화 식단표. 폐 건강 식품 정기 섭취.', exercise: '매일 정해진 시간 호흡 운동 + 유산소.' },
    'ESTP': { tone: '행동·즉각형', cta: '지금 당장 몸을 움직이세요. 독소는 땀으로 나갑니다.', approach: '즉각 행동 유도. 빠른 독소 배출.', diet: '간편 정화식. 폐 건강 식품 포함.', exercise: '역동적 야외 운동. 서킷 + 호흡 훈련.' },
    'default': { tone: '규칙 지속형', cta: '완벽한 하루보다 70%의 꾸준함이 답입니다.', approach: '점진적 접근 + 독소 배출 우선.', diet: '흰색 채소·폐 건강 식품 중심.', exercise: '호흡 운동 + 규칙적 유산소.' },
  },
  // ── 수(水) — 신·방광, 냉증·에너지 저하·내향 회복 패턴 ──
  '수': {
    'INFP': { tone: '직관 회복형', cta: '몸이 따뜻해지면 마음도 따라옵니다.', approach: '냉증 개선이 심리 안정에도 효과적임을 안내.', diet: '검은 음식 + 따뜻한 차 중심.', exercise: '저강도 혼자 운동 + 온열 요법 병행.' },
    'INFJ': { tone: '사색·내향형', cta: '나에게 맞는 속도로, 내 방식대로.', approach: '장기 목표 1개만. 에너지 상태 기반 유동 플랜.', diet: '검은 음식·따뜻한 식단. 에너지 상태 기반 유동.', exercise: '수영·저강도 혼자 운동. 아침 운동 추천.' },
    'INTJ': { tone: '전략·심층형', cta: '신장 기운 회복이 전체 대사의 기반입니다. 단계적으로 접근하세요.', approach: '신장 강화 단계별 로드맵. 에너지 소비 최적화.', diet: '검은색 식품군 정기 섭취. 따뜻한 식단.', exercise: '계획된 저강도 루틴. 수영 + 온열 요법.' },
    'INTP': { tone: '분석·회복형', cta: '신장 기능 회복 메커니즘을 이해하면 전략이 보입니다.', approach: '냉증·에너지 저하 원인 분석. 데이터 기반 식이 조정.', diet: '검은색 식품군 영양 분석. 따뜻한 식단 설계.', exercise: '혼자 계획한 저강도 루틴. 온열 요법 병행.' },
    'ISFJ': { tone: '안정·온화형', cta: '천천히 몸을 따뜻하게 하면 됩니다.', approach: '냉증 개선 + 규칙적 식사 유지. 과도한 변화 ✗.', diet: '따뜻한 검은색 식품. 소화 잘 되는 온식.', exercise: '규칙적 걷기. 온열 스트레칭. 수영.' },
    'ISFP': { tone: '감각·온열형', cta: '몸이 따뜻해지는 것을 느끼면서 식사해보세요.', approach: '온열 식품 감각적 탐색. 냉증 개선 자연스럽게.', diet: '따뜻하고 검은 식품. 짠맛 자연염 활용.', exercise: '온열 요법 + 가벼운 수영·걷기.' },
    'ISTJ': { tone: '원칙·회복형', cta: '신장 관리도 규칙입니다. 꾸준히 지키면 됩니다.', approach: '냉증 개선 루틴 체계화. 규칙적 온열 식품 섭취.', diet: '정해진 검은색 식품 섭취 루틴. 따뜻한 식단.', exercise: '매일 같은 시간 저강도 운동 + 온열 요법.' },
    'ISTP': { tone: '실용·단순형', cta: '복잡하지 않게, 따뜻한 것 먹고 가볍게 움직이세요.', approach: '단순 냉증 개선 루틴. 실용적 접근.', diet: '간편 온열식. 검은색 식품 포함.', exercise: '실외 가벼운 운동. 수영·온열 스트레칭.' },
    'ENFJ': { tone: '공감·리더형', cta: '몸이 따뜻해져야 주변을 더 잘 돌볼 수 있어요.', approach: '자기 돌봄 우선화. 냉증 개선 루틴 설계.', diet: '따뜻한 검은색 식품. 함께 하는 건강 식사.', exercise: '그룹 수영·걷기. 온열 요법 포함.' },
    'ENFP': { tone: '탐구·활력형', cta: '몸을 따뜻하게 하는 새로운 방법을 탐험해보세요.', approach: '냉증 개선 다양한 방법 탐색 허용.', diet: '다양한 온열 식품 탐색. 검은색 식품 챌린지.', exercise: '새로운 온열 운동 탐색. 수영·온천·핫요가.' },
    'ENTJ': { tone: '전략·에너지형', cta: '신장 기운 회복 프로젝트를 시작하세요.', approach: '냉증 개선 + 에너지 회복 로드맵. 단계별 실행.', diet: '검은색 식품군 정기 섭취 시스템화.', exercise: '계획된 저강도 루틴 + 온열 요법. 기록 필수.' },
    'ENTP': { tone: '아이디어·회복형', cta: '신장 기운 회복에 대한 새로운 실험을 해보세요.', approach: '자신만의 냉증 개선 실험 설계.', diet: '색다른 온열 식품 탐색. 검은색 식품 활용.', exercise: '다양한 온열 운동 탐색. 수영·핫요가·온천.' },
    'ESFJ': { tone: '사교·온열형', cta: '함께 따뜻해지는 건강 모임을 만들어보세요.', approach: '소셜 냉증 개선 챌린지. 지지 시스템 구축.', diet: '함께 하는 따뜻한 검은색 식품 식사.', exercise: '그룹 수영·걷기. 온열 요법 함께.' },
    'ESFP': { tone: '흥미·온기형', cta: '따뜻하고 맛있는 것 먹으면서 즐겁게 관리해요.', approach: '온열 식품 탐색을 즐거운 도전으로.', diet: '맛있는 온열식 레시피. 검은색 식품 활용.', exercise: '신나는 수영·온열 운동. 즉각 보상.' },
    'ESTJ': { tone: '원칙·실행형', cta: '신장 관리도 계획입니다. 체계적으로 실행하세요.', approach: '냉증 개선 체크리스트. 주간 평가 필수.', diet: '정해진 온열 식단표. 검은색 식품 정기 섭취.', exercise: '매일 정해진 시간 저강도 운동 + 온열 요법.' },
    'ESTP': { tone: '행동·온기형', cta: '지금 당장 따뜻한 것 먹고 움직이세요.', approach: '즉각 행동 유도. 단순 냉증 개선 루틴.', diet: '간편 온열식. 검은색 식품 포함.', exercise: '역동적 수영·온열 운동. 즉각 실행.' },
    'default': { tone: '깊이·회복형', cta: '천천히, 하지만 방향은 분명하게.', approach: '신장 기운 회복이 전체 대사의 기반.', diet: '검은색 식품군 + 짠맛 자연염.', exercise: '수영 + 온열 요법 + 저강도 루틴.' },
  },
};

// ──────────────────────────────────────────────
// 15. generatePrescription() — BC × 기질 교차 처방 생성
// bc_code: 'BC-1'~'BC-16'
// ohaeng_type: '목'|'화'|'토'|'금'|'수'
// mbti_full: 'INFP'|'ISTJ' 등 (선택)
// ──────────────────────────────────────────────
function generatePrescription(bc_code, ohaeng_type, mbti_full) {
  // 처방 핵심 (기질 무관 공통) — BC-1~BC-16 지원, fallback BC-3
  const core = BC_PRESCRIPTION_DB[bc_code] || BC_PRESCRIPTION_DB['BC-3'] || BC_PRESCRIPTION_DB['BC-6'];

  // 처방 톤 (기질별)
  const ohaengTone = TONE_DB[ohaeng_type] || TONE_DB['목'];
  const tone = ohaengTone[mbti_full] || ohaengTone['default'];

  // 닉네임 (BC_MASTER app_nickname 활용) — BC-1~BC-16 지원
  const bcMaster = BC_MASTER[bc_code] || BC_MASTER['BC-3'] || BC_MASTER['BC-6'];
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
    label: '목 기질', icon: '🌱', color: '#ef6c00', bg: '#E8F3DC',
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
    label: '화 기질', icon: '🔥', color: '#c98a3c', bg: '#FFE3D3',
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
    label: '토 기질', icon: '🌍', color: '#1565c0', bg: '#FFF0DA',
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
    label: '금 기질', icon: '⚡', color: '#00acc1', bg: '#EEEAF7',
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
// 8. P4 다이어트 잔혹사 — V7.0: BC코드 1차 분기 + 오행/성별/완경 보조 분기
// gender: 'M'(남성) | 'F'(여성) | null
// menopause: 'meno'|'post'|'peri'|'hrt' → 완경·폐경
// ★ V7.0: bcCode로 1차 분기 → BC-1~16 각각 맞춤 3개 트리거 텍스트
// ──────────────────────────────────────────────
function getCruelHistoryTriggers(userName, ohaengKey, mbtiType, gender, menopause, axisScores, bcCode, redFlags, answers) {
  var _axs = axisScores || {};
  var _ans = answers || {};
  var _wtPattern = _ans['Q_WT_PATTERN'] || null;
  var _q8Trigger = _ans['q8_trigger'];
  var _a01 = Number(_axs['A01']||0);
  var _a02 = Number(_axs['A02']||0);
  var _a03 = Number(_axs['A03']||0);
  var _a04 = Number(_axs['A04']||0);
  var _a05 = Number(_axs['A05']||0);
  var _a07 = Number(_axs['A07']||0);
  var _a08 = Number(_axs['A08']||0);
  var _bc  = (bcCode || '').replace(/\s/g,'').toUpperCase();
  if (!_bc.startsWith('BC-')) _bc = 'BC-6';
  var _rfl = Array.isArray(redFlags) ? redFlags : (redFlags ? [redFlags] : []);
  var hasYOYO     = _rfl.indexOf('YOYO')        >= 0;
  var hasDIABETES = _rfl.indexOf('DIABETES')    >= 0;
  var hasTHYROID  = _rfl.indexOf('THYROID')     >= 0;
  var hasPCOS     = _rfl.indexOf('PCOS')        >= 0;
  var hasSTEROID  = _rfl.indexOf('STEROID')     >= 0;
  var hasFATTY    = _rfl.indexOf('FATTY_LIVER') >= 0;

  var ohaeng = SAJU_ELEMENT_DESC[ohaengKey] || SAJU_ELEMENT_DESC['목'];
  var mbti   = MBTI_DESC[mbtiType] || MBTI_DESC['INFP'];
  var nm = (userName && userName.length >= 3) ? userName.slice(1) : (userName || '회원');

  var BC_TRIGGER_MAP = {
    'BC-1': {
      t01: { title: '하체 운동 강화 함정 — 다리가 더 굵어진 진짜 이유', hook: '열심히 하체 운동을 했는데 다리가 오히려 커졌다면, 배농이 막혔기 때문입니다.', medical: nm + ' 님은 <b>하지 림프·정맥 울혈형(BC-1)</b>으로 하체 순환로가 차단된 상태입니다. 고강도 스쿼트·런지를 반복하면 배농되지 못한 체액이 압착되어 다리 라인이 거대화됩니다.', comfort: '열심히 했는데 다리는 그대로인 억울함. 방법이 잘못된 게 아니라 몸이 먼저 해결해야 할 문제가 있었던 겁니다. <em>' + mbti.behaviorTag + '</em> 성향과 만나면 더 열심히 해서 해결하려는 루프가 만들어집니다.', reframe: '하체 운동 강도를 낮추고 림프 배농부터 시작합니다. 하체 온열 + 림프 마사지 + 압박 스타킹으로 정체된 순환로를 먼저 열어드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '하체 부종 정체기 — 수분이 갇혀 체중계가 안 움직이는 이유', hook: '지방이 안 빠진 게 아닙니다. 림프 정체로 수분이 하체에 쌓인 겁니다.', medical: nm + ' 님의 림프·순환 축(A02)이 <b>' + _a02.toFixed(1) + '/10</b>입니다. BC-1 순환 차단 상태에서 세포 분해 노폐물이 하체에 고입니다.', comfort: '분명히 잘 하고 있는데 숫자가 그대로라 억울하셨을 겁니다. <em>' + ohaeng.label + ' 기질</em>은 하체 냉증과 수분 정체가 특히 심하게 나타납니다.', reframe: '족욕·반신욕으로 혈관을 열고, 칼륨·마그네슘으로 수분 균형을 맞추면 숫자가 다시 움직입니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-2': {
      t01: { title: '셀룰라이트 굳어짐 — 유산소를 늘릴수록 심해지는 함정', hook: '셀룰라이트는 지방이 아닙니다. 섬유화된 조직이라 칼로리로는 절대 안 빠집니다.', medical: nm + ' 님은 <b>귤껍질 하체형(BC-2)</b>으로 피하지방층이 섬유화된 상태입니다. 강도 높은 유산소는 섬유화 조직에 자극만 가고 배농은 더 느려집니다.', comfort: '허벅지 울퉁불퉁함만 고집스럽게 남아있던 경험. 섬유화된 조직이라 방법 자체가 달라야 했습니다. <em>' + mbti.behaviorTag + '</em> 성향은 결과가 보이지 않으면 더 강하게 자책합니다.', reframe: '진동 마사지·드라이브러싱으로 섬유 결합조직을 물리적으로 풀고 림프 배농로를 열어야 변화가 생깁니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '하체 셀룰라이트 정체기 — 3주가 지나도 안 빠지는 이유', hook: '셀룰라이트 부위가 3주째 그대로라면, 아직 섬유화 조직의 빗장이 열리지 않은 겁니다.', medical: '셀룰라이트 섬유화 조직 분해는 일반 지방 감량보다 2~3배 오래 걸립니다. 3주차는 표면 부종이 빠지면서 오히려 울퉁불퉁함이 더 도드라져 보이는 정상 과정입니다.', comfort: '3주를 버텼는데 오히려 더 울퉁불퉁해 보이는 좌절감. <em>' + ohaeng.label + ' 기질</em>은 이 변화 과도기에 특히 예민하게 반응합니다.', reframe: '섬유화 조직이 이완되는 4~6주차에 비로소 부드러워지는 변화가 나타납니다. 지금은 한 단계를 통과하는 중입니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-3': {
      t01: { title: '1일 1식·단식 함정 — 인슐린을 더 망가뜨리는 역효과', hook: '굶을수록 혈당이 더 요동치고, 인슐린 저항성이 더 높아집니다.', medical: nm + ' 님은 <b>단단 내장형(BC-3)</b>으로 혈당 조절 시스템이 불균형한 상태입니다. 극단적 굶기는 인슐린 스파이크를 폭발적으로 심화시켜 내장지방이 더 견고해집니다.' + (hasDIABETES ? ' 당뇨 위험 인자까지 겹쳐 혈당 변동폭이 더욱 큽니다.' : ''), comfort: '밥도 줄이고 끼니도 거르는데 오히려 배가 더 나오는 억울함. <em>' + mbti.behaviorTag + '</em> 성향은 결과가 보이지 않으면 더 극단적인 방법을 시도합니다.', reframe: '굶는 게 아니라 혈당 곡선을 평탄하게 만드는 것부터 시작합니다. 저GI 복합 탄수화물 + 베르베린·크롬으로 저항성을 낮춰드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '혈당 정체기 — 배가 줄지 않는 내장지방의 비밀', hook: '3주가 지나도 허리가 안 줄어든다면, 내장지방은 인슐린으로 접근해야 합니다.', medical: nm + ' 님의 인슐린·내장지방 축(A01)이 <b>' + _a01.toFixed(1) + '/10</b>입니다. 내장지방은 인슐린 저항성이 개선되지 않으면 지방 분해 효소가 활성화되지 않습니다.', comfort: '몸무게는 빠지는데 배만 그대로라 얼마나 힘드셨나요. <em>' + ohaeng.label + ' 기질</em>은 소화·흡수 불균형이 내장지방을 가속화시킵니다.', reframe: '식사 순서(채소→단백질→탄수화물)로 인슐린 곡선을 낮추고, 베르베린·알파리포산으로 인슐린 감수성을 회복합니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-4': {
      t01: { title: '칼로리 제한 함정 — 물렁살이 더 무너지는 이유', hook: '물렁살은 에너지 부족이 아닙니다. 대사 시스템 자체가 저하된 겁니다.', medical: nm + ' 님은 <b>물렁 피하형(BC-4)</b>으로 복합 원인으로 대사가 저하된 상태입니다. 칼로리를 더 줄이면 이미 저하된 대사가 추가로 억제됩니다.' + (hasSTEROID ? ' 스테로이드 복용 이력으로 약물 유도 대사 저하 가능성이 높습니다.' : ''), comfort: '먹는 것도 줄였는데 살이 찌는 당혹스러운 경험. <em>' + mbti.behaviorTag + '</em> 성향은 이럴 때 더 강하게 자신을 몰아붙입니다.', reframe: '칼로리를 더 줄이는 게 아니라 대사 속도를 먼저 올립니다. 코엔자임Q10·마그네슘과 온열 요법으로 꺼진 대사 엔진에 시동을 걸어드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '대사 저하 정체기 — 먹는 것도 줄였는데 왜 안 빠지나', hook: '대사가 저하된 상태에서는 덜 먹어도 살이 빠지지 않는 게 정상입니다.', medical: '물렁 피하형의 3주차 정체기는 단순 수분 정체가 아닙니다. 기초대사량이 감소한 상태에서 칼로리를 제한하면 몸이 에너지 소비를 더 줄이는 대사 적응이 일어납니다.', comfort: '뭘 해도 안 된다는 절망감. <em>' + ohaeng.label + ' 기질</em>은 이 시기에 무기력과 에너지 저하가 강하게 옵니다.', reframe: '칼로리를 줄이는 게 아니라 대사 속도를 올리는 데 집중합니다. 충분한 수면 + 온열 요법 + 갑상선 기능 지원으로 대사 엔진을 회복합니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-5': {
      t01: { title: '식이섬유 과잉 함정 — 먹을수록 배가 더 부풀어오르는 이유', hook: '속이 더부룩하고 배가 더 나온다면, 좋은 음식도 독이 될 수 있습니다.', medical: nm + ' 님은 <b>가스 팽만형(BC-5)</b>으로 장내 발효 가스로 복부가 팽창된 상태입니다. 식이섬유를 무조건 늘리면 장내 발효가 증가해 가스 생성이 폭발적으로 늘어납니다.', comfort: '채소와 유산균을 늘렸는데 배가 더 나오는 황당한 경험. <em>' + mbti.behaviorTag + '</em> 성향은 더 열심히 하면 될 거라는 생각으로 더 많이 먹게 됩니다.', reframe: '저FODMAP 식단으로 가스 생성을 줄이고, 소화 효소와 함께 장내 환경을 먼저 정돈해드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '장 가스 정체기 — 배가 줄지 않는 보이지 않는 원인', hook: '3주가 지나도 배가 그대로라면, 지방이 아니라 가스가 복부를 채우고 있는 겁니다.', medical: nm + ' 님의 소화·장 축(A05)이 <b>' + _a05.toFixed(1) + '/10</b>입니다. 장내 미생물 재구성 3주차에 가스 생성이 일시적으로 늘어나는 시기가 있습니다.', comfort: '배가 더 불룩해 보이는 황당함. <em>' + ohaeng.label + ' 기질</em>은 소화기 예민도가 높아 이 과도기를 더 힘들게 느낍니다.', reframe: '식이섬유를 더 늘리지 않고 소화 효소 + 저FODMAP으로 가스를 줄이면 4~5주차부터 복부가 줄기 시작합니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-6': {
      t01: { title: '유산소·단식 반복 함정 — 사지는 빠지고 배만 남는 역설', hook: '체중계 숫자가 줄어도 복부가 더 튀어나온다면, 근육이 먼저 빠진 겁니다.', medical: nm + ' 님은 <b>올챙이배형(BC-6)</b>으로 근육을 에너지로 전환하는 이화작용이 활성화된 상태입니다. 유산소와 단식을 반복하면 사지는 더 가늘어지고 복부 내장지방만 남습니다.', comfort: '살이 빠지고 있는데 배만 더 나와 보이는 당혹스러움. <em>' + mbti.behaviorTag + '</em> 성향은 결과가 보이지 않으면 더 극단적인 방법을 찾게 됩니다.', reframe: '저항성 운동으로 근육을 보호하는 것부터 시작합니다. 단백질을 체중×1.6g 이상 확보하면 이화작용이 억제됩니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '마른비만 정체기 — 체중은 줄어도 배가 안 빠지는 이유', hook: '체중계 숫자가 줄었는데 배가 그대로라면, 근육이 빠지고 내장지방이 남은 겁니다.', medical: nm + ' 님의 근감소 위험(A04)이 <b>' + _a04.toFixed(1) + '/10</b>입니다. 단식과 유산소를 반복하면 3주차에 근육량 감소가 가속화되어 기초대사가 더 낮아집니다.', comfort: '살이 빠지는 것 같은데 몸이 오히려 나빠 보이는 혼란. <em>' + ohaeng.label + ' 기질</em>은 이 과도기에 무기력이 동반됩니다.', reframe: '유산소를 줄이고 주 2~3회 저항 운동을 배치합니다. 근육이 살아있어야 복부 내장지방도 분해됩니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-7': {
      t01: { title: '하체 펌핑 운동 함정 — 허벅지가 더 굵어지는 진짜 이유', hook: '허벅지를 빼려고 더 강한 운동을 했는데 더 굵어졌다면, 알파 수용체가 문제입니다.', medical: nm + ' 님은 <b>말벅지형(BC-7)</b>으로 하체에 지방 분해를 방해하는 알파-2 수용체가 집중된 체형입니다. 고강도 하체 운동은 지방 밑에 근육만 비대해져 허벅지가 더 굵어집니다.', comfort: '열심히 운동했는데 다리가 더 굵어진 황당하고 억울한 경험. <em>' + mbti.behaviorTag + '</em> 성향은 더 강하게 밀어붙이면 된다는 믿음으로 악순환을 만들었을 겁니다.', reframe: '하체 고강도 펌핑 운동을 멈추고, 저강도 유산소(걷기·수영)와 림프 배농 루틴으로 전환합니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '하체 지방 정체기 — 알파 수용체가 허벅지 지방을 잠근 겁니다', hook: '허벅지 지방이 3주째 그대로라면, 알파 수용체가 지방 분해 신호를 차단하고 있는 겁니다.', medical: '하체 알파-2 수용체 우세 체형에서 3주차 정체기는 특히 길고 뚜렷합니다. 전신 체중은 조금 줄어도 허벅지 둘레는 거의 변화가 없습니다.', comfort: '전신은 홀쭉해지는데 허벅지만 남는 억울함. <em>' + ohaeng.label + ' 기질</em>은 이 정체 시기에 특히 좌절감이 큽니다.', reframe: '인터벌 트레이닝과 냉온 교대 요법을 배치합니다. 카페인 + 요힘빈 성분이 알파 수용체를 일시적으로 차단해 하체 지방 분해를 돕습니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-8': {
      t01: { title: '스쿼트·런지 함정 — 승마살이 더 심해지는 골반 불안정', hook: '승마살을 빼려고 스쿼트를 더 열심히 했는데 오히려 심해졌다면, 골반이 먼저입니다.', medical: nm + ' 님은 <b>승마살형(BC-8)</b>으로 골반이 틀어지며 대퇴 외측에 지방이 집중된 상태입니다. 스쿼트·런지는 불안정한 골반에 비정상적 부하를 더해 골반 불안정을 심화시킵니다.', comfort: '열심히 했는데 그 부위만 고집스럽게 남아있는 허탈함. <em>' + mbti.behaviorTag + '</em> 성향은 눈에 보이는 결과가 없으면 더 열심히 하게 됩니다.', reframe: '골반 안정화 운동(클램쉘·사이드 라이잉)으로 구조를 바로잡으면, 승마살 부위 지방이 비로소 반응합니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '측면 지방 정체기 — 골반이 잡히지 않으면 이 부위는 안 빠집니다', hook: '측면 허벅지가 3주째 그대로라면, 골반 구조를 먼저 잡아야 합니다.', medical: '골반이 틀어진 상태에서는 이 부위 근육과 림프 순환이 제대로 작동하지 않아 지방 분해 신호가 전달되지 않습니다.', comfort: '다른 곳은 빠지는데 그 부위만 남아있는 억울함. <em>' + ohaeng.label + ' 기질</em>은 구조적 문제가 대사 정체로 이어집니다.', reframe: '골반 안정화 운동 + 고관절 유연성 확보를 3주 이상 지속하면 골반이 중립 위치로 돌아오면서 이 부위도 반응합니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-9': {
      t01: { title: '상체 유산소 함정 — 팔뚝·등이 더 두꺼워지는 이유', hook: '줄넘기·수영을 열심히 했는데 상체가 더 두꺼워졌다면, 림프가 막힌 겁니다.', medical: nm + ' 님은 <b>거북이형(BC-9)</b>으로 거북목·라운드숄더로 상체 액와 림프절이 찝힌 상태입니다. 과도한 유산소는 팔뚝과 쇄골 주변에 노폐물이 갇혀 상체 비대화를 유발합니다.', comfort: '열심히 운동했는데 상체가 더 커 보이는 황당하고 답답한 경험. <em>' + mbti.behaviorTag + '</em> 성향은 더 열심히 하면 될 거라는 생각으로 악순환에 빠집니다.', reframe: '유산소 강도를 낮추고 척추 정렬 교정과 흉추 이완을 먼저 합니다. 겨드랑이 림프를 열어주는 스트레칭으로 막힌 통로를 열어야 변화가 시작됩니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '상체 림프 정체기 — 자세 교정 없이는 이 정체가 풀리지 않습니다', hook: '3주가 지나도 상체가 그대로라면, 척추 정렬이 림프 순환을 막고 있는 겁니다.', medical: '거북목·라운드숄더 체형에서 운동을 지속하면 겨드랑이 림프절 압박이 심해져 상체 노폐물 배출이 더 느려집니다.', comfort: '상체가 꿈쩍도 않는 답답함. <em>' + ohaeng.label + ' 기질</em>은 구조적 불균형이 전신 순환 저하로 이어집니다.', reframe: '흉추 이완 + 겨드랑이 림프 마사지에 집중합니다. 자세가 개선되면서 림프 통로가 열리면 멈춰있던 변화가 시작됩니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-10': {
      t01: { title: '팔 운동 강화 함정 — 팔뚝이 더 굵어지는 역효과', hook: '팔뚝을 빼겠다고 팔 운동을 늘렸는데 더 부었다면, 겨드랑이 림프가 더 막힌 겁니다.', medical: nm + ' 님은 <b>팔뚝부종형(BC-10)</b>으로 겨드랑이 림프절이 압박되어 팔뚝에 체액이 정체된 상태입니다. 팔 운동 강화는 림프 압박을 심화시켜 팔뚝이 더 부습니다.', comfort: '팔뚝을 빼려고 열심히 했는데 오히려 더 부은 황당하고 억울한 경험. <em>' + mbti.behaviorTag + '</em> 성향은 결과가 보이지 않으면 더 강하게 밀어붙입니다.', reframe: '팔 운동을 멈추고 겨드랑이 림프를 여는 것부터 시작합니다. 팔뚝→겨드랑이 방향 림프 드레나지로 부종이 빠집니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '상체 림프 정체기 — 팔뚝 부종이 빠지지 않는 이유', hook: '3주가 지나도 팔뚝이 그대로라면, 림프 배출 경로가 아직 열리지 않은 겁니다.', medical: nm + ' 님의 림프·순환 축(A02)이 <b>' + _a02.toFixed(1) + '/10</b>입니다. 팔뚝 부종은 지방이 아니라 정체된 체액이라 림프 배출 경로를 열지 않으면 빠지지 않습니다.', comfort: '팔뚝이 그대로인 답답함. <em>' + ohaeng.label + ' 기질</em>은 상체 순환이 느려지는 경향이 있습니다.', reframe: '겨드랑이 림프 스트레칭 + 드라이브러싱으로 배출 경로를 만들어줍니다. 부종이 빠지면 그 아래 팔뚝 라인이 나타납니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-11': {
      t01: { title: '상체 웨이트 트레이닝 함정 — 승모근·어깨가 더 넓어지는 역효과', hook: '어깨선을 줄이겠다고 상체 운동을 더 했는데 오히려 넓어졌다면, 방향을 바꿔야 합니다.', medical: nm + ' 님은 <b>상체근육형(BC-11)</b>으로 승모근이 이미 과발달된 상태입니다. 추가 상체 웨이트는 승모근 비대와 어깨선 확대로 이어집니다.', comfort: '운동을 열심히 했는데 어깨·승모근만 더 커진 황당함. <em>' + mbti.behaviorTag + '</em> 성향은 노력하면 결과가 나올 거라는 믿음으로 악순환을 만들었을 겁니다.', reframe: '상체 웨이트를 전면 중단하고 승모근 이완 스트레칭에 집중합니다. 하체·코어 중심으로 전환하면 어깨선이 자연스럽게 내려옵니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '상체 긴장 정체기 — 승모근을 풀지 않으면 이 정체는 계속됩니다', hook: '3주가 지나도 상체 윤곽이 그대로라면, 긴장된 상체 근육이 순환을 막고 있는 겁니다.', medical: '승모근·어깨 근막이 긴장된 상태에서는 상체 혈류와 림프 순환이 느려지고 지방 분해 신호도 전달되지 않습니다.', comfort: '상체가 꿈쩍도 않는 답답함. <em>' + ohaeng.label + ' 기질</em>은 상체 긴장을 내면화하는 경향이 있어 더 심해집니다.', reframe: '마사지건·폼롤러로 승모근·어깨 근막을 이완합니다. 긴장이 풀리면서 순환이 회복되면 멈춰있던 변화가 시작됩니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-12': {
      t01: { title: '유산소·식이 제한 함정 — 브라라인이 안 빠지는 구조적 원인', hook: '식이도 줄이고 운동도 했는데 브라라인만 남아있다면, 흉추 구조가 문제입니다.', medical: nm + ' 님은 <b>부유방형(BC-12)</b>으로 흉추가 무너지며 브라라인에 피하지방이 집중된 상태입니다. 단순 유산소나 식이 제한만으로는 흉추 구조 변화 없이 이 부위 개선이 어렵습니다.', comfort: '다른 곳은 빠지는데 그 부위만 남아있는 억울함. <em>' + mbti.behaviorTag + '</em> 성향은 보이지 않는 변화에 쉽게 포기하게 됩니다.', reframe: '흉추 이완 스트레칭과 어깨 후인 운동으로 구조부터 바로잡습니다. 흉추가 펴지면 겨드랑이 림프가 열리고 브라라인도 반응합니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '브라라인 정체기 — 흉추 정렬 없이는 이 부위가 빠지지 않습니다', hook: '3주가 지나도 브라라인이 그대로라면, 흉추 구조를 먼저 바로잡아야 합니다.', medical: '흉추가 굽어있으면 겨드랑이 림프절이 지속적으로 압박되어 이 부위 지방 분해가 매우 느립니다.', comfort: '열심히 하는데 그 부위만 꿈쩍도 않는 답답함. <em>' + ohaeng.label + ' 기질</em>은 상체 구조 불균형이 전신 순환 저하로 이어집니다.', reframe: '폼롤러로 흉추를 풀고 어깨 후인 동작을 하루 3~5회 반복하면 4~6주차부터 브라라인이 변화합니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-13': {
      t01: { title: '예전 방식 고수 함정 — 갑자기 안 통하는 다이어트의 비밀', hook: '효과 있던 방법이 갑자기 안 통하는 건 호르몬 지형이 바뀐 겁니다.', medical: nm + ' 님은 <b>갱년기 변환형(BC-13)</b>으로 에스트로겐 급감으로 지방이 복부·전신으로 강제 재배치되는 상태입니다. 이전 다이어트법을 고수하면 새로운 대사 구조에서 역효과가 납니다.', comfort: '예전엔 조금만 노력해도 빠졌는데 지금은 아무리 해도 안 빠지는 서러움. 호르몬 지형 자체가 달라진 겁니다. ' + nm + ' 님 탓이 전혀 아닙니다.', reframe: '파이토에스트로겐(콩·석류·아마씨)과 저강도 근력 운동 조합으로 새로운 대사 시스템을 설계해드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '갱년기 정체기 — 호르몬 전환 과정의 불가피한 시간', hook: '갱년기 체형 변화는 한 달 만에 해결되지 않습니다. 3~6개월의 재편 시간이 필요합니다.', medical: nm + ' 님의 호르몬·대사 축(A03)이 <b>' + _a03.toFixed(1) + '/10</b>입니다. 완경 후 지방 재배치는 2~3년에 걸쳐 진행됩니다. 서두르면 코르티솔이 높아져 복부 지방이 더 고착됩니다.', comfort: '변화가 더디게 느껴지는 답답함. <em>' + ohaeng.label + ' 기질</em>은 이 시기에 에너지 정체와 무기력이 특히 강하게 옵니다.', reframe: '3~6개월 관점으로 접근합니다. 코르티솔을 낮추는 수면·온열 요법과 파이토에스트로겐으로 새로운 호르몬 균형을 잡아드릴게요.', dayStart: 18, dayEnd: 26 }
    },
    'BC-14': {
      t01: { title: '코르티솔 과부하 — 노력할수록 살이 찌는 번아웃의 역설', hook: '열심히 다이어트할수록 살이 찌는 건 코르티솔이 지방 저장 모드를 켠 겁니다.', medical: nm + ' 님은 <b>번아웃 무기력형(BC-14)</b>으로 코르티솔/도파민 체계가 불균형한 상태입니다. 더 열심히 다이어트하면 코르티솔이 추가 분비되어 복부 지방이 더 쌓입니다.', comfort: '열심히 하는데 오히려 살이 찌는 황당하고 지친 경험. <em>' + mbti.behaviorTag + '</em> 성향은 번아웃 상태에서도 더 열심히 하려는 내면 목소리를 만들어냅니다.', reframe: '다이어트 강도를 낮추고 코르티솔을 줄이는 것부터 시작합니다. 아슈와간다·L-테아닌으로 HPA 축을 안정시키고 수면 7시간을 확보합니다.', dayStart: 0, dayEnd: 7 },
      t02: { title: '도파민 고갈 정체기 — 의지가 작동하지 않는 신경학적 이유', hook: '3주차에 의지가 완전히 꺾이는 건 도파민이 고갈된 신호입니다.', medical: nm + ' 님의 코르티솔 축(A07)이 <b>' + _a07.toFixed(1) + '/10</b>입니다. 번아웃 상태에서 3주를 버티면 도파민 회로가 고갈됩니다. 이건 의지 부족이 아니라 뇌의 보상 시스템이 방전된 상태입니다.', comfort: '3주를 버텼는데 갑자기 아무것도 하기 싫어지는 공허함. <em>' + ohaeng.label + ' 기질</em>은 번아웃 후 회복이 더 느린 성향입니다.', reframe: '도파민 전구체(타이로신)와 충분한 수면으로 보상 회로를 재충전하면 자연스럽게 의지가 생깁니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-15': {
      t01: { title: '단독 다이어트 시도 함정 — 대사증후군 상태에서 혼자 하면 위험한 이유', hook: '대사증후군이 있는 상태에서 무리한 다이어트는 심혈관에 추가 부담이 됩니다.', medical: nm + ' 님은 <b>대사증후군형(BC-15)</b>으로 당뇨·고혈압·고지혈증 등이 복합적으로 얽힌 상태입니다. 의학적 개입 없이 강도 높은 식이 제한이나 고강도 운동을 하면 심혈관 부담이 심화됩니다.' + (hasDIABETES ? ' 당뇨 위험이 확인되어 혈당 모니터링이 필수입니다.' : '') + (hasFATTY ? ' 지방간 소견이 있어 식이 접근에 주의가 필요합니다.' : ''), comfort: '몸이 아프면서까지 다이어트를 시도했던 간절함. <em>' + mbti.behaviorTag + '</em> 성향은 건강 위협에 더 강한 불안을 느낍니다.', reframe: '대사증후군 상태에서는 감량 속도보다 대사 지표 안정이 우선입니다. 혈당·혈압 모니터링과 병행하면서 안전한 속도로 접근해드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '대사 복합 정체기 — 여러 지표가 얽혀 쉽게 풀리지 않는 구조', hook: '3주째 변화가 없다면, 여러 대사 문제가 동시에 발목을 잡고 있는 겁니다.', medical: '대사증후군 복합형의 정체기는 단순 칼로리 문제가 아닙니다. 인슐린 저항성·호르몬 불균형 등 여러 대사 문제가 서로 얽혀 단일 접근이 상쇄됩니다.', comfort: '이렇게도 해보고 저렇게도 해봤는데 안 된다는 지침. <em>' + ohaeng.label + ' 기질</em>은 복합 문제에서 에너지가 더 빠르게 소진됩니다.', reframe: '혈당·혈압·지질 지표를 동시에 모니터링하면서 각각에 맞는 처방을 설계합니다. 느리지만 안전한 방향으로 가겠습니다.', dayStart: 18, dayEnd: 26 }
    },
    'BC-16': {
      t01: { title: '단일 처방 함정 — 하나를 고치면 다른 곳이 터지는 악순환', hook: '한 가지 방법으로 해결하려 할수록 다른 문제가 커지는 건 여러 원인이 동시에 얽혀있기 때문입니다.', medical: nm + ' 님은 <b>다중악순환형(BC-16)</b>으로 여러 원인이 동시에 얽혀 악순환을 만드는 상태입니다. 칼로리를 줄이면 대사가 적응하고, 운동을 늘리면 코르티솔이 오르는 식의 연쇄 반응이 일어납니다.', comfort: '뭘 해도 어딘가가 무너지는 끝없는 싸움. <em>' + mbti.behaviorTag + '</em> 성향은 복잡한 상황에서 더 강한 압박을 느낍니다.', reframe: '가장 영향력이 큰 한 가지 축부터 안정시키고 순서대로 접근하는 단계적 전략을 설계해드릴게요.', dayStart: 0, dayEnd: 7 },
      t02: { title: '복합 악순환 정체기 — 여러 원인이 서로 버텨주는 구조', hook: '3주째 변화가 없는 건 하나가 해결되어도 다른 원인이 그 자리를 채우기 때문입니다.', medical: '다중악순환형의 3주차 정체기는 가장 길고 힘든 정체기입니다. 여러 축이 맞물려 하나가 개선되면 다른 축에서 역효과가 나타납니다. 이 복잡한 상호작용을 풀어내는 데는 4~8주의 시간이 필요합니다.', comfort: '열심히 하는데 아무것도 안 변하는 무력감. 이건 가장 어려운 유형입니다. <em>' + ohaeng.label + ' 기질</em>은 복합 문제에서 에너지가 더 빠르게 소진됩니다.', reframe: '포기하지 않는 것 자체가 전략입니다. 가장 핵심 축 하나에 집중하면 전체가 조금씩 풀리기 시작합니다.', dayStart: 18, dayEnd: 26 }
    }
  };

  var bcData = BC_TRIGGER_MAP[_bc] || BC_TRIGGER_MAP['BC-6'];

  var t01Title   = bcData.t01.title;
  var t01Hook    = bcData.t01.hook;
  var t01Medical = bcData.t01.medical;
  var t01Comfort = bcData.t01.comfort;
  var t01Reframe = bcData.t01.reframe;

  if (hasYOYO && _a01 >= 7) {
    t01Title   = '반복 실패 + 혈당 불안정 — ' + _bc + ' 유형에서 더 강한 악순환';
    t01Hook    = '매번 실패한 게 아닙니다. 혈당 불안정이 ' + _bc + ' 특성과 맞물려 반복 루프를 만든 겁니다.';
    t01Medical = nm + ' 님은 <b>요요 이력 + 인슐린 저항성(A01 ' + _a01.toFixed(1) + '/10)</b>이 ' + _bc + ' 유형과 동시에 확인됩니다. 반복적인 극단 식이 → 혈당 급락 → 폭식 → 요요의 악순환이 ' + _bc + ' 체형 특성을 더욱 고착화시킵니다.';
    t01Comfort = '몇 번이나 다시 시작했는데 번번이 무너진 그 경험. <em>' + ohaeng.label + ' 기질</em>은 에너지 급락에 더 예민하게 반응합니다.';
    t01Reframe = _bc + ' 체형에 맞는 접근법으로 혈당 곡선을 평탄하게 만드는 것부터 시작합니다. GI 낮은 복합 탄수화물 + 베르베린·크롬으로 인슐린 저항성을 낮춰드립니다.';
  }

  if (_wtPattern) {
    var _wtNote = '';
    var _p = (typeof _wtPattern === 'object' && _wtPattern && _wtPattern.pattern) ? _wtPattern.pattern : String(_wtPattern);
    if (_p === 'yoyo') _wtNote = ' 체중 궤적을 보면 요요형 — ' + _bc + ' 체형에서 반복될수록 해당 부위 지방이 더 고착됩니다.';
    else if (_p === 'jump') _wtNote = ' 특정 시기를 기점으로 급증한 패턴 — 그 계기가 ' + _bc + ' 체형 형성의 중요한 단서입니다.';
    else if (_p === 'gradual') _wtNote = ' 서서히 늘어온 패턴 — ' + _bc + ' 체형 특성이 서서히 고착된 만큼 근본 원인부터 접근해야 합니다.';
    if (_wtNote) t01Medical = t01Medical + _wtNote;
  }

  if (_q8Trigger && Array.isArray(_q8Trigger) && _q8Trigger.length > 0) {
    var _trigLabels = ['이직·과로', '이별·충격', '수술·입원', '잦은 음주', '금연', '서서히'];
    var _trigPrimary = _q8Trigger[0];
    var _trigLabel = _trigLabels[Number(_trigPrimary)] || null;
    if (_trigLabel && _trigPrimary != 5) t01Title = _trigLabel + ' 이후 — ' + t01Title;
  }

  var trigger01 = { num: '01', title: t01Title, hook: t01Hook, medical: t01Medical, comfort: t01Comfort, reframe: t01Reframe, dayStart: bcData.t01.dayStart, dayEnd: bcData.t01.dayEnd };

  var t02Title   = bcData.t02.title;
  var t02Hook    = bcData.t02.hook;
  var t02Medical = bcData.t02.medical;
  var t02Comfort = bcData.t02.comfort;
  var t02Reframe = bcData.t02.reframe;

  if (_a07 >= 9) {
    t02Title   = '극단적 코르티솔 과부하 — 지방 분해 스위치가 완전히 꺼진 상태';
    t02Hook    = '스트레스가 임계점을 넘으면 어떤 다이어트도 작동하지 않습니다.';
    t02Medical = nm + ' 님의 코르티솔 축(A07)이 <b>' + _a07.toFixed(1) + '/10</b>으로 극단적 고위험입니다. 이 수준에서는 지방 분해 효소(HSL)가 거의 완전히 억제됩니다.';
    t02Comfort = '열심히 했는데 아무것도 안 움직이는 무력감. <em>' + ohaeng.label + ' 기질</em>은 스트레스를 내면화해 코르티솔이 더 오래 높게 유지됩니다.';
    t02Reframe = '지금 당장 다이어트 강도를 낮추고 코르티솔 완화에만 집중합니다. 아슈와간다·마그네슘·수면 8시간이 지금 가장 중요한 처방입니다.';
  }

  var trigger02 = { num: '02', title: t02Title, hook: t02Hook, medical: t02Medical, comfort: t02Comfort, reframe: t02Reframe, dayStart: bcData.t02.dayStart, dayEnd: bcData.t02.dayEnd };

  var trigger03;
  var isMale = (gender === 'M' || gender === 'male' || gender === '남성' || gender === '남');
  var isMenopause = (menopause && menopause !== 'not_applicable' && menopause !== 'none' && menopause !== null);

  var _bcT03Note = {
    'BC-1': '하체 림프 정체가 호르몬 변화와 만나면 하체 부종이 더욱 고착됩니다.',
    'BC-2': '셀룰라이트 섬유화가 호르몬 변화와 맞물리면 분해가 더욱 느려집니다.',
    'BC-3': '혈당 불안정이 호르몬 변화로 더욱 심해지는 시기입니다.',
    'BC-4': '대사 저하가 호르몬 변화와 겹쳐 이중으로 대사가 느려지는 시기입니다.',
    'BC-5': '장내 환경이 호르몬 변화에 예민하게 반응해 복부 팽만이 더 심해집니다.',
    'BC-6': '이화작용이 호르몬 변화로 가속화되어 근육 보호가 더욱 중요해지는 시기입니다.',
    'BC-7': '알파 수용체 우세 체형에서 호르몬 변화는 하체 지방 분해를 더 어렵게 합니다.',
    'BC-8': '골반 불안정이 호르몬 변화와 만나면 측면 지방 고착이 심화됩니다.',
    'BC-9': '척추 구조 불균형이 호르몬 변화와 겹쳐 전신 림프 순환이 더 느려집니다.',
    'BC-10': '상체 림프 정체가 호르몬 변화와 만나면 팔뚝 부종이 더욱 심해집니다.',
    'BC-11': '상체 근육 긴장이 호르몬 변화와 겹쳐 상체 순환이 더 느려지는 시기입니다.',
    'BC-12': '흉추 구조 불균형이 호르몬 변화와 맞물려 브라라인 지방이 더 고착됩니다.',
    'BC-13': '갱년기 체형 자체가 이 호르몬 변화의 직접적인 결과입니다.',
    'BC-14': '번아웃 상태에서 호르몬 변화가 겹치면 피로와 의욕 저하가 극단적으로 심해집니다.',
    'BC-15': '대사증후군 복합 위험이 호르몬 변화로 더욱 악화될 수 있어 의학적 모니터링이 필수입니다.',
    'BC-16': '다중 악순환 상태에서 호르몬 변화는 또 하나의 불안정 요인을 추가합니다.',
  };
  var _bcNote = _bcT03Note[_bc] || '';

  if (isMale) {
    var t03Title_m = '과훈련 구간 — 열심히 할수록 빠지는 함정';
    var t03Hook_m  = '게을러서 안 빠진 게 아닙니다. 몸이 비상 저장 모드에 들어간 겁니다.';
    var t03Medical_m = '고강도 운동을 회복 없이 계속 밀어붙이면 코르티솔이 급등하고 테스토스테론이 급락합니다. 지방이 복부에 집중 축적됩니다.' + (_bcNote ? ' ' + _bcNote : '');
    var t03Comfort_m = '열심히 했는데 배는 그대로라 억울하고 답답하셨나요. <em>' + mbti.behaviorTag + '</em>가 더해지면 "더 열심히 해야 해"라는 무한 루프에 갇힙니다.';
    var t03Reframe_m = '고강도와 저강도 회복을 3:1로 교차합니다. 수면 7시간과 마그네슘·아연으로 테스토스테론 회복 환경을 만들어드릴게요.';
    if (_a04 >= 7 && _a07 >= 7) {
      t03Title_m   = '근감소 + 코르티솔 — 운동할수록 근육 먹고 지방 남기는 역설';
      t03Hook_m    = '더 열심히 운동할수록 복부만 남는 건 코르티솔이 근육을 분해하고 지방을 저장한 겁니다.';
      t03Medical_m = nm + ' 님은 근감소 위험(A04 ' + _a04.toFixed(1) + '/10)과 코르티솔 과부하(A07 ' + _a07.toFixed(1) + '/10)가 동시에 나타납니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_m = '땀 흘리며 운동했는데 배만 남은 억울함. <em>' + ohaeng.label + ' 기질</em>은 몸을 한계까지 밀어붙이는 성향입니다.';
      t03Reframe_m = '고강도 운동 빈도를 줄이고 저강도 저항 운동 + 회복을 배치합니다.';
    } else if (_a04 >= 7) {
      t03Title_m   = '근감소 구간 — 살은 안 빠지고 근육만 빠지는 함정';
      t03Hook_m    = '체중계 숫자가 줄어도 근육이 빠지면 대사가 더 느려집니다.';
      t03Medical_m = nm + ' 님의 근감소 위험(A04 ' + _a04.toFixed(1) + '/10)이 높습니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_m = '체중계는 줄었는데 몸이 더 처지는 이유입니다. <em>' + mbti.behaviorTag + '</em> 성향은 결과가 없을 때 더 강하게 자책합니다.';
      t03Reframe_m = '단백질을 체중×1.6g 이상 확보하고 주 2~3회 저항 운동을 배치합니다.';
    } else if (_a07 >= 7) {
      t03Title_m   = '코르티솔 복부 지방 — 열심히 했는데 배만 남는 이유';
      t03Hook_m    = '복부 지방이 버티는 건 코르티솔이 복부에 지방을 잠근 겁니다.';
      t03Medical_m = nm + ' 님의 코르티솔 축(A07)이 <b>' + _a07.toFixed(1) + '/10</b>입니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_m = '다른 곳은 빠지는데 배만 남아있는 억울함. <em>' + ohaeng.label + ' 기질</em>은 스트레스 내면화로 코르티솔 기저치가 높아집니다.';
      t03Reframe_m = '수면 개선 + 아슈와간다 + 온열 요법으로 HPA 축을 안정시킵니다.';
    }
    trigger03 = { num: '03', title: t03Title_m, hook: t03Hook_m, medical: t03Medical_m, comfort: t03Comfort_m, reframe: t03Reframe_m, dayStart: 35, dayEnd: 56 };

  } else if (isMenopause) {
    var t03Title_w = '호르몬 전환기 — 똑같이 먹어도 찌는 서러움';
    var t03Hook_w  = '먹는 양이 늘어난 게 아닙니다. 대사 구조 자체가 바뀐 겁니다.';
    var t03Medical_w = '에스트로겐이 급격히 줄고 인슐린 저항성이 높아지면 지방이 복부로 강제 재배치됩니다.' + (_bcNote ? ' ' + _bcNote : '');
    var t03Comfort_w = '손발은 차가워지고 배만 자꾸 불러오는 서러운 감각을 데이터가 증명합니다. ' + ohaeng.label + '의 에너지 정체와 만나 더 심해진 것뿐입니다.';
    var t03Reframe_w = '파이토에스트로겐(콩·석류·아마씨)과 저강도 근력을 함께 배치합니다. 체중계 숫자가 아닌 복부 둘레와 체성분으로 기준을 바꿔드릴게요.';
    if (hasTHYROID && _a03 >= 7) {
      t03Title_w   = '갑상선 + 호르몬 이중 저하 — 대사가 두 겹으로 막힌 겁니다';
      t03Hook_w    = '갑상선과 에스트로겐이 동시에 떨어지면 어떤 다이어트도 벽에 막힙니다.';
      t03Medical_w = nm + ' 님은 갑상선 위험 + 호르몬·대사 축(A03 ' + _a03.toFixed(1) + '/10)이 동시에 나타납니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_w = '덜 먹는데 살이 찌는 당혹스러운 경험. 두 개의 호르몬 시스템이 동시에 무너진 겁니다.';
      t03Reframe_w = '갑상선 지원 영양소(셀레늄·요오드·L-티로신)와 파이토에스트로겐을 함께 처방합니다.';
    } else if (hasPCOS && _a03 >= 6) {
      t03Title_w   = 'PCOS + 호르몬 전환기 — 인슐린·에스트로겐 이중 교란';
      t03Hook_w    = 'PCOS와 완경이 겹치면 인슐린과 에스트로겐이 동시에 교란됩니다.';
      t03Medical_w = nm + ' 님은 PCOS 이력과 호르몬·대사 축(A03 ' + _a03.toFixed(1) + '/10)이 함께 확인됩니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_w = '평생 몸과 싸워온 ' + nm + ' 님. 두 개의 시스템이 모두 교란된 상태에서 일반인과 같은 방법으로 시도하셨으니까요.';
      t03Reframe_w = '이노시톨(4:1 비율) + 파이토에스트로겐 + 저GI 식단으로 두 축을 동시에 안정시킵니다.';
    } else if (_a03 >= 7) {
      t03Title_w   = '호르몬 대사 저하 — 에너지 생산 공장이 절반으로 줄어든 겁니다';
      t03Hook_w    = '덜 먹어도 살이 찌는 건 호르몬 대사 시스템이 절반 속도로 돌고 있는 겁니다.';
      t03Medical_w = nm + ' 님의 호르몬·대사 축(A03)이 <b>' + _a03.toFixed(1) + '/10</b>입니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_w = '아무리 노력해도 옛날 같지 않다는 서러움. <em>' + ohaeng.label + ' 기질</em>의 에너지 정체 성향이 더해져 회복도 더 느립니다.';
      t03Reframe_w = '코엔자임Q10 + 마그네슘 + 파이토에스트로겐으로 에너지 효율을 높이고 근력 운동으로 기초대사를 회복합니다.';
    }
    trigger03 = { num: '03', title: t03Title_w, hook: t03Hook_w, medical: t03Medical_w, comfort: t03Comfort_w, reframe: t03Reframe_w, dayStart: 28, dayEnd: 56 };

  } else {
    var t03Title_f = '생리 직전 7일 — 의지로 못 이기는 식욕';
    var t03Hook_f  = '식탐이 터진 게 아닙니다. 호르몬이 뇌에 명령을 내린 겁니다.';
    var t03Medical_f = '생리 전 일주일은 프로게스테론이 급등해 인슐린 저항성이 일시적으로 높아집니다.' + (_bcNote ? ' ' + _bcNote : '');
    var t03Comfort_f = '생리 전만 되면 자극적인 걸 먹은 뒤 자책하지 않으셨나요. ' + ohaeng.label + '의 울결된 에너지가 기혈 통로를 막아 기혈이 상체로 역류하는 것뿐입니다.';
    var t03Reframe_f = '억지로 누르면 생리 당일 보상 과식이 더 크게 옵니다. 호르몬 안정 식단을 이 주간에 배치해드릴게요.';
    if (hasPCOS && _a01 >= 6) {
      t03Title_f   = 'PCOS + 혈당 불안정 — 생리 주기 내내 식욕이 폭발하는 이유';
      t03Hook_f    = 'PCOS는 매일 혈당과 식욕이 요동치게 만듭니다.';
      t03Medical_f = nm + ' 님은 PCOS 이력과 인슐린 저항성(A01 ' + _a01.toFixed(1) + '/10)이 함께 확인됩니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_f = '머릿속이 음식 생각으로 가득 찬 경험. PCOS는 신체적 질환이지 의지 부족이 아닙니다.';
      t03Reframe_f = '이노시톨(40:1) + 베르베린으로 인슐린 감수성을 높이고 저GI 식단으로 혈당을 안정시킵니다.';
    } else if (_a03 >= 7) {
      t03Title_f   = '호르몬 주기 교란 — 생리 주기마다 반복되는 무너짐';
      t03Hook_f    = '생리 주기마다 무너지는 건 호르몬·대사 시스템 문제입니다.';
      t03Medical_f = nm + ' 님의 호르몬·대사 축(A03)이 <b>' + _a03.toFixed(1) + '/10</b>입니다.' + (_bcNote ? ' ' + _bcNote : '');
      t03Comfort_f = '매달 같은 시기에 무너지면서 자책하셨을 마음. <em>' + ohaeng.label + ' 기질</em>은 이 주기적 변동에 취약합니다.';
      t03Reframe_f = '생리 주기를 4단계로 나눠 맞춤 식단과 보충제를 설계합니다. 마그네슘 + 비타민B6로 PMS 강도부터 낮춥니다.';
    }
    trigger03 = { num: '03', title: t03Title_f, hook: t03Hook_f, medical: t03Medical_f, comfort: t03Comfort_f, reframe: t03Reframe_f, cycle: 28 };
  }

  var extraTriggers = [];

  if (hasYOYO) {
    extraTriggers.push({
      num: '04',
      title: '요요 대사 적응 — 몸이 기억하는 가장 무거운 체중',
      hook: '몸은 가장 오래 머문 체중을 정상으로 기억하고 되돌아가려 합니다.',
      medical: '요요를 반복할수록 방어 체중이 설정됩니다. ' + _bc + ' 체형에서는 이 저항이 해당 부위에 더 집중적으로 나타납니다.',
      comfort: '번번이 제자리로 돌아온 그 경험. <em>' + ohaeng.label + ' 기질</em>은 변화 적응 속도가 느린 성향입니다.',
      reframe: '8~12주 완만한 감량 → 4~6주 유지 → 재감량의 3단계 리셋으로 시상하부를 재프로그래밍합니다.',
      dayStart: 7, dayEnd: 84,
    });
  }

  if (hasSTEROID) {
    extraTriggers.push({
      num: String(extraTriggers.length + 4).padStart(2,'0'),
      title: '스테로이드 후 체중 — 약물이 바꾼 대사 구조',
      hook: '약물 복용 후 찐 살은 일반 비만과 기전이 완전히 다릅니다.',
      medical: '스테로이드는 인슐린 저항성을 높이고 식욕 중추를 자극하며 수분 저류를 유발합니다. 종료 후에도 HPA 축 교란이 3~6개월 지속됩니다.',
      comfort: '치료하느라 먹은 약이 살을 찌웠다는 억울함. 약리 작용의 결과이지 의지 문제가 아닙니다.',
      reframe: 'HPA 축 안정화(아슈와간다+마그네슘)와 인슐린 저항성 개선(베르베린+크롬)을 우선 처방합니다.',
      dayStart: 0, dayEnd: 84,
    });
  }

  var finalExtras = extraTriggers.slice(0, 2);
  finalExtras.forEach(function(t, i) { t.num = String(i + 4).padStart(2, '0'); });

  return [trigger01, trigger02, trigger03].concat(finalExtras);
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
function computeNutrition(curWeight, goalWeight, lossPct, height, gender, age) {
  // 안전 처리
  var cw  = Number(curWeight)  || 65;
  var gw  = Number(goalWeight) || Math.round(cw * 0.9);
  var pct = Number(lossPct)    || Math.round((cw - gw) / cw * 100);
  var h   = Number(height)     || 162;  // 평균 신장 fallback
  var ag  = Number(age)        || 35;   // 나이 fallback (35세)
  // gender: 'M'|'male'|'남성'|'남' → 남성, 그 외 → 여성
  var isMale = (gender === 'M' || gender === 'male' || gender === '남성' || gender === '남');

  // 목표체중 기준 BMR (Mifflin-St Jeor — 성별·나이 반영)
  // 남성: 10W + 6.25H − 5A + 5   / 여성: 10W + 6.25H − 5A − 161
  var bmr = isMale
    ? Math.round(10 * gw + 6.25 * h - 5 * ag + 5)
    : Math.round(10 * gw + 6.25 * h - 5 * ag - 161);

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

  // ── 12주 탄단지 전략 (4Phase 구조) ──────────────────────────
  // Phase1 (1~3주): 독소·부종·혈당 안정화 — 저탄·고단백 진입
  // Phase2 (4~6주): 대사 점화 — 탄수화물 사이클링 도입
  // Phase3 (7~9주): 지방 연소 가속 — 간헐적 단식 연계
  // Phase4 (10~12주): 체형 완성 — 근육 보존·유지 전략
  // ─────────────────────────────────────────────────────────────

  // Phase1 (1~3주)
  var w1cPct = Math.max(30, carbPct - 5);   var w1pPct = Math.min(38, proteinPct + 3);
  var w2cPct = carbPct;                      var w2pPct = proteinPct;
  var w3cPct = Math.max(30, carbPct - 3);   var w3pPct = Math.min(38, proteinPct + 3);

  // Phase2 (4~6주) — 탄수화물 사이클링 본격화
  var w4cPct = Math.max(25, carbPct - 10);  var w4pPct = Math.min(40, proteinPct + 5);
  var w5cPct = carbPct;                      var w5pPct = proteinPct;                      // 재급탄일
  var w6cPct = Math.max(28, carbPct - 7);   var w6pPct = Math.min(40, proteinPct + 4);

  // Phase3 (7~9주) — 저탄·고단백 강화 + 지방 연소
  var w7cPct = Math.max(25, carbPct - 12);  var w7pPct = Math.min(42, proteinPct + 7);
  var w8cPct = Math.max(28, carbPct - 8);   var w8pPct = Math.min(40, proteinPct + 5);
  var w9cPct = Math.max(25, carbPct - 10);  var w9pPct = Math.min(42, proteinPct + 7);

  // Phase4 (10~12주) — 근육 보존·유지 칼로리 회복
  var w10cPct = Math.max(30, carbPct - 5);  var w10pPct = Math.min(40, proteinPct + 5);
  var w11cPct = Math.max(33, carbPct - 3);  var w11pPct = Math.min(38, proteinPct + 3);
  var w12cPct = carbPct;                     var w12pPct = proteinPct;                     // 유지칼로리 복귀

  return {
    targetKcal,
    carbG, proteinG, fatG,
    carbPct, proteinPct, fatPct,
    bmr, tdee, deficit,
    weekVariants: [
      // Phase1
      _week(1,  0.88, w1cPct,  w1pPct,  '1주(Phase1): 독소 배출 시작 — 저탄 진입, 단백질 확보'),
      _week(2,  0.95, w2cPct,  w2pPct,  '2주(Phase1): 기준 칼로리 유지 — 도파민 안정 식품 추가'),
      _week(3,  0.95, w3cPct,  w3pPct,  '3주(Phase1): 항염 강화 — 단백질 소폭 상향, 식이섬유 극대화'),
      // Phase2
      _week(4,  0.97, w4cPct,  w4pPct,  '4주(Phase2): 대사 점화 — 탄수화물 사이클링 OFF일 기준'),
      _week(5,  1.00, w5cPct,  w5pPct,  '5주(Phase2): 재급탄일(Refeed) — 렙틴 리셋·대사 방어'),
      _week(6,  0.97, w6cPct,  w6pPct,  '6주(Phase2): 탄사이클 안정화 — 저탄+고지방 지방산화'),
      // Phase3
      _week(7,  0.93, w7cPct,  w7pPct,  '7주(Phase3): 지방 연소 가속 — 케토 진입 준비'),
      _week(8,  0.93, w8cPct,  w8pPct,  '8주(Phase3): 지방산화 극대화 — 공복 유산소 연계'),
      _week(9,  0.95, w9cPct,  w9pPct,  '9주(Phase3): 체형 조각 — 핀포인트 식단 타이밍'),
      // Phase4
      _week(10, 0.98, w10cPct, w10pPct, '10주(Phase4): 근육 보존 — 칼로리 소폭 회복'),
      _week(11, 1.00, w11cPct, w11pPct, '11주(Phase4): 체형 완성 단계 — 유지 칼로리 전환'),
      _week(12, 1.02, w12cPct, w12pPct, '12주(Phase4): 유지 전략 확립 — 재요요 방지 구조 완성'),
    ],
  };
}

// ══════════════════════════════════════════════════════════════════
// 10-A-2. computeWeekRatios() — 개인 맞춤 12주 운동:회복:식단 비율 계산
// ──────────────────────────────────────────────────────────────────
// 입력: bc_code('BC-1'~'BC-9'), axis_scores(A01~A10, 0~100),
//       ohaeng_type('목'|'화'|'토'|'금'|'수'), nickname(한글),
//       goal_pct(감량%, 숫자)
//
// 반환: 12주 배열 [{week, workout, recovery, diet, phase, focus_label}]
//   workout  : 0~100 (운동 강도 비중)
//   recovery : 0~100 (회복/관리 비중)
//   diet     : 0~100 (식단/영양 비중)
//   합계는 항상 300 아님 — 각 축은 독립적 강도 0~100
//
// 설계 원칙
//  1. BC코드별 기본 비율 (BC_BASE_RATIO)
//  2. axis_scores 상위 2축이 해당 도메인 비율을 +N점 가중
//  3. 오행 기질이 운동 강도·회복 선호 조정
//  4. 닉네임(특수 배경) 보정
//  5. 감량% 클수록 초기 식단 비율 상향, 후반 운동 비율 상향
//  6. Phase별 (1~3/4~6/7~9/10~12) 비율 곡선 적용
// ══════════════════════════════════════════════════════════════════

// BC코드별 기본 전략 비율 (week1~3 기준 베이스)
// [workout, recovery, diet] : 0~100 독립 강도
var BC_BASE_RATIO = {
  'BC-1': { workout:35, recovery:70, diet:55, focus:'순환·배농 우선 — 운동 부하 낮게, 회복·관리 최우선' },
  'BC-2': { workout:30, recovery:65, diet:50, focus:'척추 정렬 선행 — 자세 교정이 운동보다 우선' },
  'BC-3': { workout:50, recovery:45, diet:80, focus:'혈당 식단 최우선 — 식후 유산소 연계' },
  'BC-4': { workout:35, recovery:60, diet:70, focus:'대사 회복 식단 — 과도한 운동이 역효과' },
  'BC-5': { workout:40, recovery:75, diet:60, focus:'섬유화 분해 — 관리·회복 집중, 고강도 금지' },
  'BC-6': { workout:45, recovery:65, diet:65, focus:'부신 회복 — 스트레스 운동 금지, 야식 차단 식단' },
  'BC-7': { workout:30, recovery:70, diet:55, focus:'코어·골반 재건 — 회복 프로토콜 선행' },
  'BC-8': { workout:40, recovery:55, diet:65, focus:'운동 방향 전환 — 저충격 유산소·저탄식단' },
  'BC-9': { workout:50, recovery:55, diet:70, focus:'근육 먼저 — 체중이 아닌 근육량 증가 목표' },
};

// 축별 도메인 매핑 — 해당 축 점수가 높으면 어느 비율이 올라가는가
var AXIS_DOMAIN_MAP = {
  'A01': 'diet',     // 인슐린·내장 → 식단이 핵심
  'A02': 'recovery', // 림프순환 → 회복·관리
  'A03': 'diet',     // 호르몬 → 식단·영양
  'A04': 'workout',  // 근감소 → 운동
  'A05': 'diet',     // 소화·장 → 식단
  'A06': 'recovery', // 골격·복압 → 자세교정·회복
  'A07': 'recovery', // 코르티솔 → 회복·수면
  'A08': 'recovery', // 심리·식이 → 회복·심리 관리
  'A09': 'diet',     // 대사위험 → 식단 관리
  'A10': 'workout',  // 기질·성향 → 운동 성향 반영
};

// 오행별 비율 보정치 [workout_delta, recovery_delta, diet_delta]
var OHAENG_RATIO_DELTA = {
  '목': { workout: +5,  recovery: +5,  diet: -3 },  // 저녁 유산소 좋아함, 감정 해소 루틴
  '화': { workout: -5,  recovery: +10, diet: 0  },  // 과잉 운동 → 번아웃, 회복 강화
  '토': { workout: 0,   recovery: +5,  diet: +5 },  // 소화 중심, 식단 섬세하게
  '금': { workout: +5,  recovery: 0,   diet: +3 },  // 완벽주의, 식단 구조화 선호
  '수': { workout: -5,  recovery: +10, diet: +5 },  // 기력 저하, 회복·보양 우선
};

// 닉네임별 특수 보정 (특수 배경 감지)
var NICKNAME_RATIO_PATCH = {
  '스트레스기절 번아웃형': { workout: -15, recovery: +20, diet: +5  },
  '약물부작용 강제축적형': { workout: -10, recovery: +15, diet: +10 },
  '호르몬스위치 갱년기형': { workout: -5,  recovery: +15, diet: +10 },
  '털털한 PCOS형':         { workout: +5,  recovery: +5,  diet: +15 },
  '여름에도 시린 얼음장형': { workout: -10, recovery: +15, diet: +10 },
  '지방흡입후 재발형':      { workout: -10, recovery: +20, diet: 0  },
  '출산후 바람빠진 풍선형': { workout: -15, recovery: +20, diet: +5  },
  '대사증후군 종합형':      { workout: +5,  recovery: +5,  diet: +15 },
};

// 12주 Phase 곡선 — 각 주차별 [workout_mul, recovery_mul, diet_mul]
// 베이스 × 이 계수로 최종 비율 결정
var WEEK_PHASE_CURVE = [
  // week1~3 Phase1: 통로 개방·독소 배출 (운동↓, 회복↑, 식단↑)
  { w:1,  workout:0.60, recovery:1.20, diet:1.10 },
  { w:2,  workout:0.70, recovery:1.15, diet:1.10 },
  { w:3,  workout:0.80, recovery:1.10, diet:1.05 },
  // week4~6 Phase2: 대사 점화 (운동↑ 시작, 식단 사이클링)
  { w:4,  workout:0.90, recovery:1.05, diet:1.05 },
  { w:5,  workout:1.00, recovery:1.00, diet:1.00 },
  { w:6,  workout:1.05, recovery:0.95, diet:0.98 },
  // week7~9 Phase3: 지방 연소 가속 (운동↑↑, 식단 정밀화)
  { w:7,  workout:1.15, recovery:0.90, diet:1.05 },
  { w:8,  workout:1.20, recovery:0.85, diet:1.05 },
  { w:9,  workout:1.15, recovery:0.90, diet:1.00 },
  // week10~12 Phase4: 체형 완성·유지 (운동 안정, 식단 유지 전략)
  { w:10, workout:1.10, recovery:0.95, diet:0.95 },
  { w:11, workout:1.05, recovery:1.00, diet:0.90 },
  { w:12, workout:1.00, recovery:1.05, diet:0.88 },
];

function computeWeekRatios(bc_code, axis_scores, ohaeng_type, nickname, goal_pct) {
  var bcKey    = (bc_code && BC_BASE_RATIO[bc_code]) ? bc_code : 'BC-6';
  var base     = BC_BASE_RATIO[bcKey];
  var ohaeng   = ohaeng_type || '목';
  var lossPct  = Number(goal_pct) || 12;

  // ① axis_scores 상위 2축 가중치
  var axisBoost = { workout: 0, recovery: 0, diet: 0 };
  if (axis_scores && typeof axis_scores === 'object') {
    var axPairs = Object.entries(axis_scores)
      .filter(function(e){ return String(e[0]).match(/^A\d/); })
      .map(function(e){ return [e[0], Number(e[1])]; })
      .filter(function(e){ return !isNaN(e[1]); })
      .sort(function(a,b){ return b[1]-a[1]; })
      .slice(0, 3);  // 상위 3축
    axPairs.forEach(function(pair, idx) {
      var domain = AXIS_DOMAIN_MAP[pair[0]];
      if (!domain) return;
      var weight = idx === 0 ? 12 : (idx === 1 ? 8 : 4);  // 1위+12, 2위+8, 3위+4
      axisBoost[domain] += weight;
    });
  }

  // ② 오행 보정
  var ohDelta = OHAENG_RATIO_DELTA[ohaeng] || { workout:0, recovery:0, diet:0 };

  // ③ 닉네임 특수 보정
  var nickPatch = (nickname && NICKNAME_RATIO_PATCH[nickname])
    ? NICKNAME_RATIO_PATCH[nickname]
    : { workout:0, recovery:0, diet:0 };

  // ④ 감량% 보정 — 고감량일수록 초기 식단 강화
  var lossBoost = { workout: 0, recovery: 0, diet: 0 };
  if (lossPct >= 20) { lossBoost.diet += 10; lossBoost.workout -= 5; }
  else if (lossPct >= 15) { lossBoost.diet += 5; }
  else if (lossPct <= 8) { lossBoost.workout += 5; lossBoost.diet -= 5; }

  // ⑤ 기준값 합산
  var baseW = Math.min(100, Math.max(10, base.workout + axisBoost.workout + ohDelta.workout + nickPatch.workout + lossBoost.workout));
  var baseR = Math.min(100, Math.max(10, base.recovery + axisBoost.recovery + ohDelta.recovery + nickPatch.recovery + lossBoost.recovery));
  var baseD = Math.min(100, Math.max(10, base.diet + axisBoost.diet + ohDelta.diet + nickPatch.diet + lossBoost.diet));

  // ⑥ Phase 곡선 적용 → 12주 배열 생성
  var result = WEEK_PHASE_CURVE.map(function(curve) {
    var w = Math.min(100, Math.max(5, Math.round(baseW * curve.workout)));
    var r = Math.min(100, Math.max(5, Math.round(baseR * curve.recovery)));
    var d = Math.min(100, Math.max(5, Math.round(baseD * curve.diet)));

    // Phase명
    var phase = curve.w <= 3  ? 'Phase1 통로개방'
              : curve.w <= 6  ? 'Phase2 대사점화'
              : curve.w <= 9  ? 'Phase3 연소가속'
              : 'Phase4 체형완성';

    // 포커스 레이블 (가장 높은 도메인 명시)
    var maxVal = Math.max(w, r, d);
    var focusDomain = maxVal === w ? '운동 집중' : (maxVal === r ? '회복·관리 집중' : '식단 집중');

    return {
      week:        curve.w,
      workout:     w,
      recovery:    r,
      diet:        d,
      phase:       phase,
      focus_label: focusDomain,
      bc_base_focus: base.focus,
    };
  });

  return result;
}

// ──────────────────────────────────────────────
// 10-B. BC별 1~12주차 처방 데이터 테이블
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
    // ── Phase2 (5~6주): 대사 점화 ──
    {
      week: 5, weekLabel: '5주차', phase: '지방 연소 점화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '하체 지방세포 활성화 — 연소 회로 개통',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 지방 연소 회로 안정화 → 순수 체지방 0.8~1.2kg 추가 감소',
      failure_expose: '4주간 통로를 열고 대사를 준비했습니다. 이제 지방을 태울 수 있는 인프라가 완성됐습니다. 이번 주부터 운동 강도를 단계적으로 높입니다.',
      axis_logic: '림프 통로가 확보된 상태에서 처음으로 [운동 센터]와 [식단 센터]를 전면에 배치합니다.',
      keyFocus: ['지방 연소 점화', '탄수화물 사이클링 심화', '하체 저충격 운동 확대'],
      exercise_ban: '고강도 하체 웨이트 (여전히 금지)',
      exercise_ok: '수영 60분 + 인터벌 워킹(속보 3분·일반 2분 반복) 30분 — 주 4회',
      exercise_detail: '월·수·금·토 — 수영 60분 (자유형 40분+배영 20분) + 인터벌 워킹 30분 / 화·목 — 힐링 요가 40분 + 드라이 브러싱 5분 / 매 식후 — 속보 15분 필수 / 저탄일(월·수·금): 탄수화물 ¼공기 / 재급탄일(토): ½공기',
      diet_ban: '재급탄일 과식, 야간 탄수화물',
      diet_ok: '탄수화물 사이클링 심화 (4일 저탄+1일 재급탄) + 단백질 1.5g/체중kg 유지',
      meal_plan: '저탄일 아침: 달걀 3개 오믈렛 + 아보카도 1개 / 점심: 연어 180g + 야채 300g / 저녁: 닭가슴살 150g + 브로콜리 무침 / 재급탄일: 현미밥 ½공기+고구마 100g+단백질 충분히',
      recovery_ban: '과도한 마사지 압력 (림프관 손상 주의)',
      recovery_ok: '주 2회 전문 림프 드레나쥐 + 매일 다리 거상 15분',
      science_note: '탄수화물 사이클링 4일 저탄+1일 재급탄 프로토콜은 렙틴 수치를 유지하면서 체지방 산화율을 23% 높입니다 (JISSN 2021).',
    },
    {
      week: 6, weekLabel: '6주차', phase: '순환·연소 시너지', phaseColor: 'var(--sub)',
      icon: '💫', title: '림프 회복력 + 지방 연소 동시 가동',
      center: '순환 센터 + 운동 센터', centerIcons: ['💧', '🏃'],
      weekly_target: '이번 주 목표: 6주 누적 체중 감소 4~6kg 달성 확인, 셀룰라이트 눈에 띄게 감소',
      failure_expose: '6주차 시점에 체중이 기대보다 적게 빠졌다면 수분 배출이 덜 됐거나 근육이 붙은 것입니다. 체중보다 발목·허벅지 둘레 변화를 측정하세요.',
      axis_logic: '순환과 지방 연소가 동시에 작동하는 첫 번째 주입니다. 두 센터의 시너지를 최대화합니다.',
      keyFocus: ['셀룰라이트 분해 가속', '림프 유지', '유산소 강도 증가'],
      exercise_ban: '런닝머신 고속 달리기 (충격 하지 압박)',
      exercise_ok: '아쿠아 인터벌 40분 + 자전거 에르고미터 30분 — 주 4회',
      exercise_detail: '월·수·금·토 — 아쿠아 인터벌 40분(빠르게 2분·천천히 1분 교차) / 화·목 — 저강도 실내 자전거 30분 + 서혜부 스트레칭 15분 / 매일 — 발목 펌핑 200회',
      diet_ban: '염분 과다 (부종 재발 방지)',
      diet_ok: '저나트륨 고단백 식단 유지 + 파인애플·파파야(림프 효소 식품) 매일 100g',
      meal_plan: '아침: 그릭요거트 150g + 베리류 + 호두 / 점심: 닭가슴살 샐러드(연어 대체 가능) + 파파야 100g / 저녁: 두부 스테이크 + 현미밥 ¼공기 + 야채국 / 간식: 파인애플 100g + 물 500ml',
      recovery_ban: '',
      recovery_ok: '온냉 교차 족욕(뜨거운 물 3분→찬물 1분 교차 5회) — 정맥 탄력 강화',
      science_note: '온냉 교차 수치료법(Contrast Hydrotherapy)은 정맥 수축·이완 반복으로 하지 순환 효율을 최대 40% 향상합니다.',
    },
    // ── Phase3 (7~9주): 지방 연소 가속 ──
    {
      week: 7, weekLabel: '7주차', phase: '심부 지방 분해', phaseColor: 'var(--circ)',
      icon: '🎯', title: '셀룰라이트 타깃 — 심부 지방 층 집중 분해',
      center: '운동 센터 + 회복 센터', centerIcons: ['🏃', '🌙'],
      weekly_target: '이번 주 목표: 허벅지·종아리 셀룰라이트 분해 심화 → 체지방률 2% 추가 감소',
      failure_expose: '허벅지를 잡아당겼을 때 딱딱한 느낌이 줄어들고 있다면 셀룰라이트가 풀리는 신호입니다. 이 주차에 전문 케어를 병행하면 효과가 2배 빠릅니다.',
      axis_logic: '지방 분해 효소가 활성화된 상태입니다. 운동 강도를 높이되 림프 관리를 반드시 병행합니다.',
      keyFocus: ['셀룰라이트 섬유화 분해', '심부 림프 마사지', '케토 진입 준비'],
      exercise_ban: '과도한 스트레칭 없이 고강도 진입 금지',
      exercise_ok: '수영 인터벌 60분 + 저강도 순환 근력(밴드 운동) 30분 — 주 5회',
      exercise_detail: '월·수·금 — 수영 인터벌 60분(빠르게 100m·쉬엄 50m 교차) + 서킷 밴드운동 30분 / 화·목·토 — 필라테스 심화 50분 (전사자세3·까마귀자세·삼각자세) / 매일 — 드라이 브러싱 5분(발→허벅지)',
      diet_ban: '재급탄일 없는 7일 연속 저탄 (렙틴 저하 위험)',
      diet_ok: '저탄·고단백 강화 (탄수 100g 이하/일) + 5일 후 1회 재급탄',
      meal_plan: '저탄일: 아침 달걀 2개+샐러드 / 점심 연어 200g+야채 / 저녁 닭가슴살+두부 / 재급탄일: 현미밥 ½공기+고구마 150g+단백질 풍부하게',
      recovery_ban: '격렬한 마사지 즉시 후 운동',
      recovery_ok: '주 3회 전문 LPG·압박 림프 드레나쥐 + 취침 전 다리 20cm 거상',
      science_note: 'LPG 엔더몰로지는 섬유화된 셀룰라이트 결합조직을 기계적으로 분해하여 림프 배액을 3배 촉진합니다 (ASDS 2020).',
    },
    {
      week: 8, weekLabel: '8주차', phase: '지방산화 극대화', phaseColor: 'var(--circ)',
      icon: '⚡', title: '공복 유산소 연계 — 지방산화율 극대화',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 8주 누적 6~8kg 감소 달성, 하체 두께 3~5cm 감소 확인',
      failure_expose: '공복 유산소는 이 시점에 처음으로 안전합니다. 1~4주차에 림프 통로를 열지 않고 공복 운동을 했다면 근육만 타고 부종은 심해졌을 것입니다.',
      axis_logic: '7주간의 준비 위에서 처음으로 공복 유산소를 도입합니다. 타이밍이 핵심입니다.',
      keyFocus: ['공복 유산소 도입', '지방산화 극대화', '근육 손실 방지 식단'],
      exercise_ban: '공복 고강도 웨이트 (근육 이화 위험)',
      exercise_ok: '기상 직후 공복 수영 40분(저강도) + 오후 밴드 근력 30분 — 주 4회',
      exercise_detail: '월·수·금·토 — 기상 후 30분 공복 수영 40분(심박 120~130bpm 유지) / 아침식사 후 2시간 — 밴드 저항 하체 운동 30분 / 화·목 — 힐링 요가 50분 / 매일 — 드라이 브러싱+발목 펌핑',
      diet_ban: '공복 운동 전 탄수화물 섭취',
      diet_ok: '공복 운동 후 단백질 우선 섭취 (30분 내 단백질 30g) + 하루 단백질 1.6g/kg',
      meal_plan: '공복 운동 후(아침): 달걀 3개+닭가슴살 100g 즉시 / 점심: 연어+현미밥 ¼공기+야채 300g / 저녁: 두부+브로콜리+아보카도 / 저녁 탄수화물 0',
      recovery_ban: '',
      recovery_ok: '운동 후 냉압박 하지 마사지 15분 + 주 2회 전문 케어',
      science_note: '공복 저강도 유산소(심박 60~70%)는 지방 산화 비율이 식후 대비 1.5~2배 높습니다. 단 림프 회로가 열린 상태에서만 안전하게 작동합니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '핀포인트 식단 타이밍 + 하체 라인 완성',
      center: '식단 센터 + 체형 센터', centerIcons: ['🍽️', '🦴'],
      weekly_target: '이번 주 목표: 하체 라인 가시화 — 허벅지 앞쪽 지방 분해 마무리',
      failure_expose: '9주 시점에서 하체가 확실히 달라졌다는 피드백이 가장 많이 나옵니다. 이때 방심하면 안 됩니다. 식단 타이밍 정밀화가 마지막 핀포인트 단계입니다.',
      axis_logic: '식단 타이밍(카보백로딩 vs 공복)을 정밀화하여 남은 지방을 핀포인트로 제거합니다.',
      keyFocus: ['식사 타이밍 정밀화', '하체 라인 완성', '재요요 방지 준비'],
      exercise_ban: '급격한 운동량 증가',
      exercise_ok: '기존 루틴 유지 + 식후 인터벌 워킹 심화(30분)',
      exercise_detail: '기존 루틴 유지 / 추가: 식후 30분 인터벌 워킹 강화 (속보 4분·조깅 1분 교차 30분) / 매일 — 드라이 브러싱 + 서혜부 림프 셀프 마사지 10분',
      diet_ban: '저녁 탄수화물, 야간 간식',
      diet_ok: '탄수화물 오전 집중 섭취 전략 — 아침에만 복합탄수화물, 오후 단백질+지방만',
      meal_plan: '아침: 현미밥 ½공기+달걀 2개+야채 / 점심: 닭가슴살 180g+야채+올리브오일 / 저녁: 연어 150g+두부+브로콜리(탄수 0) / 간식: 아몬드 15알+차',
      recovery_ban: '',
      recovery_ok: '9주 체성분 재측정 — 근육량·체지방률 변화 데이터 기록 (전후 비교)',
      science_note: '탄수화물 아침 집중 전략(Carb Front-Loading)은 인슐린 감수성이 높은 오전에 탄수화물을 배치하여 지방 전환을 최소화합니다 (Cell Metabolism 2018).',
    },
    // ── Phase4 (10~12주): 체형 완성·유지 ──
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '10주 체형 완성 — 근육 보존 전략 도입',
      center: '운동 센터 + 회복 센터', centerIcons: ['🏃', '🌙'],
      weekly_target: '이번 주 목표: 체지방률 안정화 + 하체 근력 안전 증가 시작',
      failure_expose: '10주 시점은 지방은 빠지고 근육이 아직 덜 붙은 전환점입니다. 칼로리를 너무 낮게 유지하면 오히려 근육이 빠져 기초대사량이 낮아집니다.',
      axis_logic: '이제 칼로리를 소폭 올리면서 근육 보존에 집중합니다. 림프 관리는 유지 차원으로 줄어듭니다.',
      keyFocus: ['근육 보존', '칼로리 소폭 회복', '유지 패턴 설계'],
      exercise_ban: '급격한 운동 중단',
      exercise_ok: '수영 50분 + 하체 저충격 근력(밴드 스쿼트·힙힌지) — 주 4회',
      exercise_detail: '월·수·금 — 수영 50분 + 밴드 하체 운동 3종 세트 (밴드 스쿼트 3×15·밴드 힙힌지 3×12·사이드워크 3×20) / 화·목·토 — 필라테스 40분 / 매일 — 드라이 브러싱 5분',
      diet_ban: '단백질 과다 보충제 의존 (신장 부담)',
      diet_ok: '유지 칼로리 +100kcal 증가 — 단백질 1.6g/kg 유지, 복합탄수화물 소폭 추가',
      meal_plan: '아침: 달걀 3개+현미밥 ¼공기+아보카도 / 점심: 닭가슴살 150g+현미밥 ¼공기+야채 / 저녁: 연어 130g+고구마 80g+브로콜리 / 간식: 그릭요거트 100g+견과류',
      recovery_ban: '',
      recovery_ok: '월 1~2회 전문 림프 드레나쥐 유지 + 주 3회 다리 거상 수면',
      science_note: '감량 후 유지 단계에서 단백질 1.6g/kg 섭취는 근육 재합성을 극대화하고 재요요를 방지하는 가장 효과적인 전략입니다 (ISSN 2017).',
    },
    {
      week: 11, weekLabel: '11주차', phase: '체형 유지 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '평생 유지 가능한 패턴 설계',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '이번 주 목표: 유지 식단 패턴 자동화 — 12주 루틴이 생활이 되도록',
      failure_expose: '다이어트가 끝나면 원래대로 돌아가는 이유는 "다이어트 모드"와 "일상 모드"가 분리되어 있기 때문입니다. 이번 주는 두 모드를 통합합니다.',
      axis_logic: '11주차는 수치 감소보다 습관화가 목표입니다. 루틴이 자동화되어야 12주 이후에도 유지됩니다.',
      keyFocus: ['습관 자동화', '유지 식단 설계', '재요요 방지 구조'],
      exercise_ban: '모든 특별 운동 중단 (일상 통합 필요)',
      exercise_ok: '주 4회 수영 40분 + 매일 걷기 30분 (일상 통합)',
      exercise_detail: '일상화 목표: 수영은 취미로 주 4회 / 매일 30분 걷기(출퇴근·쇼핑 등으로 달성) / 드라이 브러싱은 매일 샤워 전 5분 생활화',
      diet_ban: '특별 다이어트 식단으로 되돌아가기',
      diet_ok: '80:20 원칙 — 주 5일 유지 식단 + 주 2일 자유식 (과식 없이)',
      meal_plan: '유지 식단 기준: 아침 단백질+복합탄수화물 / 점심 균형식 / 저녁 단백질+야채 / 80:20 적용으로 주 2회 외식 가능 (폭식 없이)',
      recovery_ban: '',
      recovery_ok: '11주 전후 사진 비교 + 발목·허벅지 둘레 측정 — 데이터로 동기부여',
      science_note: '80:20 유지 원칙은 완벽한 식단보다 80%만 지켜도 요요 없이 유지되는 가장 현실적인 전략입니다 (Ann Nutr Metab 2019).',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 프로그램 완성 — 새로운 나의 기준 확립',
      center: '전체 센터', centerIcons: ['💧', '🏃', '🍽️'],
      weekly_target: '12주 총합목표: 체중 감소 8~12kg + 하체 부종 완전 해소 + 유지 가능한 라이프스타일 완성',
      failure_expose: '12주를 완주한 것만으로도 상위 5%입니다. 숫자보다 몸의 변화, 에너지 수준, 수면의 질이 달라진 것을 기억하세요.',
      axis_logic: '12주 전체 처방 완료. 이제 이 패턴이 일상이 되어야 합니다.',
      keyFocus: ['12주 성과 측정', '새로운 기준값 확립', '유지 플랜 수립'],
      exercise_ban: '',
      exercise_ok: '유지 루틴: 수영 주 3~4회 + 걷기 매일 30분 + 드라이 브러싱 매일',
      exercise_detail: '유지 루틴 확정: 수영 주 3~4회(40~50분) + 매일 걷기 30분 + 드라이 브러싱 5분 + 월 1회 전문 케어',
      diet_ban: '극단적 재도전 단식',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용 — 이제 이것이 당신의 일상 식단입니다',
      meal_plan: '12주 완성 기준 일상식: 아침 단백질+복합탄수화물+과일 / 점심 균형식 / 저녁 고단백+야채 / 주 2회 자유식 (과식 없이)',
      recovery_ban: '',
      recovery_ok: '12주 체성분 측정 + 파트너 센터 최종 리포트 공유',
      science_note: '12주 지속적 운동·식단 개입은 하지 림프·정맥 순환 개선 효과가 6개월 이상 유지됩니다. 이제 유지가 시작입니다.',
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
    // Phase2 (5~6주)
    {
      week: 5, weekLabel: '5주차', phase: '상체 슬림 가속', phaseColor: 'var(--sub)',
      icon: '✨', title: '상체 부피 감소 가속 — 안전 근력 확대',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 팔뚝·어깨 두께 추가 감소 + 목선 선명화',
      failure_expose: '4주간 경추를 정렬하고 림프를 열었습니다. 이제 안전하게 상체 운동량을 올릴 수 있는 시점입니다.',
      axis_logic: '[운동 센터] 비중을 높입니다. 단 경추에 부하가 없는 형태만 허용합니다.',
      keyFocus: ['상체 근력 강화', '팔뚝 슬림', '항염 식단 유지'],
      exercise_ban: '목·어깨 직접 압박 바벨 운동',
      exercise_ok: '밴드 상체 서킷 40분(주 4회) + 경추 필라테스 30분(주 3회)',
      exercise_detail: '월·수·금·토 — 밴드 서킷: 풀다운 3×15+로우 3×12+체스트프레스 3×12+사이드레이즈 3×15 / 화·목 — 경추 필라테스 30분 + 겨드랑이 림프 마사지 10분 / 매일 — 경추 후인 운동 20회',
      diet_ban: '글루텐(밀가루) 과다 (상체 염증 악화)',
      diet_ok: '항염 강화: 강황+생강+블랙커민씨드 + 오메가3 (연어·고등어·아마씨)',
      meal_plan: '아침: 강황 계란 스크램블+아보카도 / 점심: 고등어구이+현미밥 ¼공기+생강 드레싱 샐러드 / 저녁: 닭가슴살+브로콜리+연두부 / 간식: 호두+블루베리',
      recovery_ban: '',
      recovery_ok: '주 2회 전문 상체 림프 드레나쥐 + 자세 교정 테이핑',
      science_note: '오메가3(EPA·DHA)는 림프 내 염증성 사이토카인을 억제하여 상체 부종 재발을 방지합니다 (Nutrients 2020).',
    },
    {
      week: 6, weekLabel: '6주차', phase: '경추 완성', phaseColor: 'var(--sub)',
      icon: '💫', title: '경추 정렬 자동화 완성 + 상체 라인 가시화',
      center: '체형 센터 + 운동 센터', centerIcons: ['🦴', '🏃'],
      weekly_target: '6주 누적: 팔뚝·어깨 슬림 + 목선 길어보이는 효과 확인',
      failure_expose: '6주 시점에 목이 길어 보이고 쇄골이 드러나기 시작하면 정렬이 올바르게 되고 있는 신호입니다.',
      axis_logic: '체형 교정 효과가 가시화되는 주입니다. 경추 안정화 운동으로 재발 방지 구조를 만듭니다.',
      keyFocus: ['경추 안정화', '상체 라인 완성', '항염 유지'],
      exercise_ban: '',
      exercise_ok: '밴드 상체 서킷 심화 + 수영 50분 — 주 4회',
      exercise_detail: '월·수·금·토 — 수영 50분(접영 금지, 자유형·평영) + 밴드 서킷 심화 3라운드 / 화·목 — 딥스트레칭 요가 40분 / 매일 — 경추 스트레칭 5분+겨드랑이 마사지 5분',
      diet_ban: '탄산음료·설탕',
      diet_ok: '콜라겐 부스터 식단: 비타민C 풍부(파프리카·딸기)+뼈국물(국물) 주 2회',
      meal_plan: '아침: 딸기+오렌지+그릭요거트 / 점심: 사골국+닭가슴살샐러드 / 저녁: 연어구이+고구마80g+파프리카볶음',
      recovery_ban: '',
      recovery_ok: '6주 상체 사진 비교 — 목선·어깨 라인 변화 데이터 기록',
      science_note: '경추 교정 6주 시점에서 상부 승모근 긴장이 평균 42% 감소하고 겨드랑이 림프절 기능이 정상화됩니다 (Journal of Bodywork 2021).',
    },
    // Phase3 (7~9주)
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '🔥', title: '상체 지방 연소 본격화',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 상체 체지방률 2% 추가 감소, 팔 둘레 측정',
      failure_expose: '7주 시점은 상체 지방이 가장 빠르게 빠지는 구간입니다. 운동 강도를 최적화하세요.',
      axis_logic: '경추 안정화 완료 후 처음으로 유산소 강도를 올립니다.',
      keyFocus: ['유산소 강도 증가', '상체 지방 연소', '칼로리 정밀화'],
      exercise_ban: '목 압박 장비 사용 고강도 운동',
      exercise_ok: '수영 인터벌 60분 + 밴드 상체 근력 40분 — 주 5회',
      exercise_detail: '월·수·금 — 수영 인터벌 60분(빠른 100m·회복 50m 교차) / 화·목·토 — 밴드 상체 서킷 40분+코어 운동(플랭크3×45초·데드버그3×10) / 매일 — 경추 후인+겨드랑이 마사지',
      diet_ban: '고GI 탄수화물',
      diet_ok: '저탄·고단백 강화 (단백질 체중×1.6g) + 저녁 탄수화물 제로',
      meal_plan: '아침: 달걀 3개+아보카도+아메리카노 / 점심: 닭가슴살 180g+현미¼공기+야채 / 저녁: 연어 150g+두부+브로콜리(탄수 0)',
      recovery_ban: '',
      recovery_ok: '주 2회 림프 드레나쥐 유지 + 상체 온냉 교차 샤워',
      science_note: '수영 인터벌은 상체 지방산화를 육상 달리기 대비 35% 높입니다. 경추 정렬 완성 후 수영은 BC-2의 최적 유산소입니다.',
    },
    {
      week: 8, weekLabel: '8주차', phase: '슬림 가속', phaseColor: 'var(--circ)',
      icon: '⚡', title: '공복 수영 도입 + 상체 슬림 극대화',
      center: '운동 센터 + 회복 센터', centerIcons: ['🏃', '🌙'],
      weekly_target: '8주 누적: 상체 8~10cm 둘레 감소 확인',
      failure_expose: '공복 수영은 이 시점에 처음으로 안전합니다. 경추 정렬이 완성된 상태에서만 공복 유산소가 효과적입니다.',
      axis_logic: '공복 상태에서 수영하면 지방산화율이 극대화됩니다.',
      keyFocus: ['공복 수영 도입', '상체 슬림 극대화', '근육 보존'],
      exercise_ban: '공복 고강도 웨이트',
      exercise_ok: '기상 직후 공복 수영 40분(저강도) — 주 4회',
      exercise_detail: '월·수·금·토 — 기상 직후 공복 수영 40분(심박 115~125bpm) + 오후 밴드운동 30분 / 화·목 — 필라테스 심화 50분',
      diet_ban: '공복 수영 전 탄수화물',
      diet_ok: '공복 수영 후 단백질 30g 즉시 섭취 + 하루 단백질 총 1.6g/kg',
      meal_plan: '공복 수영 후: 닭가슴살 100g+달걀 2개 즉시 / 점심: 현미¼공기+균형식 / 저녁: 고단백+야채(탄수 최소화)',
      recovery_ban: '',
      recovery_ok: '8주 상체 체성분 측정 + 월 1~2회 전문 상체 림프 케어',
      science_note: '공복 저강도 유산소는 지방산화율 1.8배. 단 수영은 관절 부담이 없어 BC-2에 가장 적합한 공복 운동입니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '상체 핀포인트 — 목선·팔뚝·어깨 라인 완성',
      center: '식단 센터 + 체형 센터', centerIcons: ['🍽️', '🦴'],
      weekly_target: '이번 주 목표: 팔뚝 둘레 최종 측정 — 목표치 달성 여부 확인',
      failure_expose: '9주 시점에서 상체 라인이 확실히 달라집니다. 마지막 핀포인트 단계입니다.',
      axis_logic: '식단 타이밍 정밀화 + 경추 유지 운동으로 마무리합니다.',
      keyFocus: ['식단 타이밍 정밀화', '상체 라인 완성', '재발 방지 구조'],
      exercise_ban: '',
      exercise_ok: '기존 루틴 유지 + 어깨·목 스트레칭 강화',
      exercise_detail: '기존 루틴 유지 / 추가: 어깨·목 이완 루틴 15분(수면 전 매일)',
      diet_ban: '저녁 탄수화물',
      diet_ok: '탄수화물 오전 집중 — 오후 단백질+건강 지방만',
      meal_plan: '아침: 현미밥¼공기+달걀2개+아보카도 / 점심: 연어+야채(탄수¼공기) / 저녁: 닭가슴살+두부+브로콜리(탄수0)',
      recovery_ban: '',
      recovery_ok: '9주 상체 전후 사진 비교 + 목선 길이 측정',
      science_note: '9주간 경추 교정+림프 케어 복합 프로토콜 완료 시 상체 부피가 평균 12~18% 감소합니다.',
    },
    // Phase4 (10~12주)
    {
      week: 10, weekLabel: '10주차', phase: '상체 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '상체 체형 완성 — 근육 보존 전략',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '10주 목표: 상체 근육량 유지 + 체지방 안정화',
      failure_expose: '10주 시점은 체지방과 근육량이 균형 잡히는 전환점입니다. 이제 감량보다 형태 유지가 목표입니다.',
      axis_logic: '칼로리를 소폭 올려 근육 보존에 집중합니다.',
      keyFocus: ['근육 보존', '유지 칼로리 전환', '경추 유지'],
      exercise_ban: '',
      exercise_ok: '주 4회 수영 50분 + 밴드 상체 근력(유지 강도)',
      exercise_detail: '수영 주 4회 50분 + 밴드 상체 유지 운동 주 3회 30분 / 매일 경추 스트레칭 5분',
      diet_ban: '단백질 보충제 과다',
      diet_ok: '유지 칼로리 +100kcal + 단백질 1.5g/kg 유지',
      meal_plan: '아침: 달걀3개+현미¼공기+과일 / 점심: 고단백 균형식 / 저녁: 연어+야채+고구마80g',
      recovery_ban: '',
      recovery_ok: '월 1~2회 전문 상체 림프 케어 유지',
      science_note: '유지 칼로리 전환 후 단백질 유지 시 근육량 손실을 95% 방지합니다.',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '상체 유지 루틴 자동화',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '11주 목표: 유지 식단·운동 패턴 자동화',
      failure_expose: '경추 교정이 완성된 이후에도 스마트폰 자세로 돌아가면 재발합니다. 이번 주에 환경 교정을 마무리하세요.',
      axis_logic: '습관화가 목표. 경추 유지 환경 세팅과 80:20 식단을 확정합니다.',
      keyFocus: ['습관 자동화', '경추 환경 교정', '80:20 식단'],
      exercise_ban: '',
      exercise_ok: '주 4회 수영+걷기 매일 30분 (일상 통합)',
      exercise_detail: '일상화: 수영 주 4회(취미로)+걷기 매일 30분+경추 스트레칭 매일 5분',
      diet_ban: '특별 다이어트 모드 재진입',
      diet_ok: '80:20 원칙 — 주 5일 유지식 + 주 2일 자유식',
      meal_plan: '유지식: 아침 단백질+복합탄수 / 점심 균형식 / 저녁 단백질+야채 / 주 2회 외식 가능',
      recovery_ban: '',
      recovery_ok: '11주 전후 어깨·팔뚝 사진 비교',
      science_note: '80:20 유지 원칙은 경추 교정 유지와 함께 요요 없는 장기 체형 관리의 핵심입니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 경추·상체 슬림 프로그램 완성',
      center: '전체 센터', centerIcons: ['🦴', '💧', '🏃'],
      weekly_target: '12주 총합: 팔뚝·어깨 슬림 + 목선 길어짐 + 경추 정렬 유지 체계 완성',
      failure_expose: '12주를 완주한 것만으로도 상위 5%입니다. 목이 길어지고 쇄골이 드러나고 팔뚝이 얇아진 것을 축하합니다.',
      axis_logic: '12주 전체 처방 완료. 이제 경추 유지 환경과 80:20 식단이 당신의 새로운 기준입니다.',
      keyFocus: ['12주 성과 측정', '새로운 기준 확립', '유지 플랜'],
      exercise_ban: '',
      exercise_ok: '유지 루틴: 수영 주 3~4회 + 매일 걷기 30분 + 경추 스트레칭 매일',
      exercise_detail: '유지 루틴: 수영 주 3~4회 + 걷기 매일 + 경추 스트레칭 + 월 1회 림프 케어',
      diet_ban: '',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용',
      meal_plan: '일상식: 아침 단백질+복합탄수 / 점심 균형식 / 저녁 단백질+야채 / 주 2회 자유식',
      recovery_ban: '',
      recovery_ok: '12주 체성분 측정 + 파트너 센터 최종 리포트',
      science_note: '12주 경추 교정+림프 복합 프로그램은 상체 부피 감소 효과가 6개월 이상 유지됩니다.',
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
    // ── BC-3 5~12주차: 혈당 안정화 → 인슐린 저항성 역전 → 내장지방 완전 공략 ──
    {
      week: 5, weekLabel: '5주차', phase: '대사 점화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '인슐린 저항성 역전 가속 — 혈당 안정 2.0',
      center: '식단 센터 + 운동 센터', centerIcons: ['🍽️', '🏃'],
      weekly_target: '이번 주 목표: 인슐린 민감도 추가 상승 → 식후 혈당 스파이크 90% 이상 차단, 체지방 0.5~0.7kg 감소',
      exercise_detail: '월·화·목·금 — 혈당 조절 복합 운동 50분: 1.근력 20분(스쿼트 3×15회·밴드로우 3×12회·플랭크 3×45초) / 2.유산소 30분(빠른 속보 or 자전거 — 최대심박수 65~70%) / 매 식후 — 속보 20분 필수 / 수·토 — 수영 or 실내 자전거 40분',
      meal_plan: '5주차 혈당 관리 식단: 아침 달걀3개+야채볶음(먼저)+현미밥¼(마지막)+식초1큰술 / 점심 닭가슴살200g+채소샐러드+현미밥½(마지막) / 저녁 두부200g+브로콜리+고구마100g / 간식(허용): 아몬드15알+치즈1조각 / 절대 금지: 흰밥·빵·설탕음료·과일주스',
      failure_expose: '혈당이 안정되면 식욕이 먼저 줄어듭니다. 폭식 충동이 사라진다면 혈당 안정화가 성공하고 있는 증거입니다.',
      axis_logic: '4주차까지 구축된 인슐린 민감도 기반 위에 운동 강도를 올려 혈당 조절 능력을 완전히 역전시킵니다.',
      keyFocus: ['인슐린 저항성 역전', '식후 혈당 90% 차단', '식욕 안정화'],
      exercise_ban: '식전 공복 고강도 유산소',
      exercise_ok: '식후 20분 속보 매 끼니 + 근력 운동 주 4회',
      diet_ban: '고GI 탄수화물 (흰밥·빵·과자)',
      diet_ok: '채소→단백질→저GI탄수화물 순서 + 식초·레몬 활용',
      recovery_ban: '',
      recovery_ok: '식후 바로 눕지 않기 + 식사 일기 앱 기록 지속',
      science_note: '식후 속보 15~20분은 GLUT4 수용체 활성화로 근육의 포도당 흡수를 최대 30% 높입니다. 4주 복합 운동 후 인슐린 감수성은 25~30% 개선됩니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '중간 점검', phaseColor: 'var(--sub)',
      icon: '📊', title: '6주 인슐린·체성분 점검 — 혈당 안정도 측정',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '이번 주 목표: 공복혈당·식후혈당 기록 분석 + 6주 체중·허리둘레 측정 → 식단 전략 재보정',
      exercise_detail: '6주차 회복 주간: 월·수·금 — 유지 강도 운동 35분 (근력 20분 + 식후 속보 15분) / 화·목·토 — 야외 산책 30분 (가벼운 활동) / 점검 미션: 월요일 공복혈당 측정, 식후 1시간 혈당 측정 가능하면 기록 / 6주 체성분 측정 후 목표 재설정',
      meal_plan: '6주차 재급탄 & 점검: 월·화 — 평상시 식단 / 수(재급탄일): 현미밥1공기+고구마200g+바나나1개(탄수화물 250g, 단백질 충분) / 목~일 — 다시 저GI 기반 식단 / 점검 지표: 6주 전후 허리둘레·배꼽둘레 차이',
      failure_expose: '6주째 같은 패턴으로 먹고 있는데 혈당이 안정되지 않는다면, 숨겨진 고GI 식품을 찾아야 합니다 — 소스, 드레싱, 가공식품이 주범일 수 있습니다.',
      axis_logic: '재급탄으로 렙틴을 리셋하고, 6주 식사 일기 데이터로 개인별 혈당 트리거 음식을 파악해 7~12주 식단을 최적화합니다.',
      keyFocus: ['혈당 트리거 음식 파악', '렙틴 리셋', '6주 성과 측정'],
      exercise_ban: '측정 정확도 왜곡을 위한 극단적 운동',
      exercise_ok: '유지 강도 운동 + 야외 산책',
      diet_ban: '재급탄일 폭식',
      diet_ok: '재급탄일 복합 탄수화물 250g → 이후 저GI 식단 복귀',
      recovery_ban: '',
      recovery_ok: '수면 8시간 + 스트레스 관리 (코르티솔 = 혈당 적)',
      science_note: '수면 부족(6시간 이하)은 공복혈당을 14% 높이고 인슐린 저항성을 악화시킵니다. 충분한 수면이 혈당 관리의 숨겨진 핵심입니다.',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '🔥', title: '내장지방 연소 가속 — 간헐적 단식 + 유산소 복합',
      center: '식단 센터 + 운동 센터', centerIcons: ['🍽️', '🏃'],
      weekly_target: '이번 주 목표: 간헐적 단식 도입 + 식후 HIIT — 내장지방 타깃 연소 시작',
      exercise_detail: '월·화·목·금 — 혈당 조절 HIIT 복합 55분: 근력 30분(데드리프트3×10+스쿼트3×12+풀다운3×10) + HIIT 유산소 25분(트레드밀 or 자전거 인터벌: 45초 빠름+90초 보통×8세트) / 수·토 — 식후 속보 40분 / 매 식후 — 속보 15분 유지',
      meal_plan: '7주차 16:8 간헐적 단식 도입: 식사 윈도우: 오전 11시~오후 7시 / 오전 11시 첫 식사: 달걀3개+닭가슴살150g+채소샐러드+식초드레싱 / 오후 2시: 현미밥½+생선(고등어or연어)150g+나물2가지 / 오후 6시: 두부150g+고구마80g+브로콜리 / 단식 중: 물·블랙커피·무가당 차만 허용',
      failure_expose: '아침을 거르는 것이 아닙니다. 첫 식사 시간을 오전 11시로 당겨서 공복 시간에 지방을 태우는 것입니다. 혈당이 안정된 지금이 간헐적 단식 최적의 타이밍입니다.',
      axis_logic: '6주간 안정된 혈당 기반 위에 간헐적 단식(16:8)을 도입합니다. 공복 상태에서 지방 산화가 극대화됩니다.',
      keyFocus: ['간헐적 단식 16:8 도입', '내장지방 연소 가속', 'HIIT 복합 운동'],
      exercise_ban: '단식 중 고강도 운동 (혈당 급락 위험)',
      exercise_ok: 'HIIT 25분 + 근력 30분 복합 — 주 4회',
      diet_ban: '단식 시간 중 과일주스·단음료 (혈당 스파이크)',
      diet_ok: '식사 윈도우 8시간 안에 고단백 저GI 3끼',
      recovery_ban: '',
      recovery_ok: '단식 중 미지근한 물 2.5L + 전해질 (소금 소량)',
      science_note: '16:8 간헐적 단식은 12주간 내장지방 7~9% 감소, 인슐린 저항성 35% 개선, 공복혈당 8~12mg/dL 감소를 보입니다(Cell Metabolism, 2020).',
    },
    {
      week: 8, weekLabel: '8주차', phase: '체온·대사 극대화', phaseColor: 'var(--circ)',
      icon: '🌡️', title: '대사 온도 끌어올리기 — 갈색지방 활성화',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 기초체온 0.3~0.5℃ 상승 + 혈당 공복 100mg/dL 이하 달성',
      exercise_detail: '월·화·목·금 — 대사 활성화 복합 60분: 1.근력 30분(전신 대근육군 위주) / 2.유산소 20분(빠른 속보 or 수영) / 3.HIIT 10분(버피3×8+마운틴클라이머3×20) / 매일 — 기상 후 아침 체온 측정 + 10분 가벼운 스트레칭 / 매 식후 — 속보 20분 지속',
      meal_plan: '8주차 갈색지방 활성화 식단: 아침 브라질넛2알+달걀3개+시금치볶음+현미밥¼ / 점심 고등어 or 삼치 구이+현미밥½+나물3가지 / 저녁 닭가슴살180g+채소+고구마80g / 매일 추가: 생강차 1~2잔(체온 상승·갈색지방 활성), 고추(캡사이신) 소량 / 단식 지속: 11시~19시 식사 윈도우',
      failure_expose: '체중계 숫자가 같아도 옷이 헐렁해진다면? 내장지방이 빠지면서 근육이 채워지는 리컴포지션의 증거입니다. 체중계를 믿지 말고 허리 사이즈를 믿으세요.',
      axis_logic: '갈색지방 활성화(체온 상승)로 기초대사량을 추가 상승시키고, 간헐적 단식 + 복합 운동으로 내장지방 연소를 극대화합니다.',
      keyFocus: ['갈색지방 활성화', '기초체온 상승', '내장지방 연소 극대화'],
      exercise_ban: '추운 환경에서 장시간 운동 (체온 저하)',
      exercise_ok: '전신 복합 근력 30분 + 유산소 20분 + HIIT 10분',
      diet_ban: '찬 음식·아이스커피 과다 (갈색지방 억제)',
      diet_ok: '생강·고추·계피 등 체온 상승 식품 + 따뜻한 음료',
      recovery_ban: '',
      recovery_ok: '취침 전 족욕 10분 + 수면 중 체온 유지 (얇은 이불)',
      science_note: '생강(6-진저롤)과 고추(캡사이신) 복합 섭취는 갈색지방 활성화로 기초대사량을 4~5% 높입니다. 기초체온 0.5℃ 상승은 하루 100~150kcal 추가 소비에 해당합니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '🗿', title: '수박배→납작배 전환 — 복부 집중 최종 공략',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 9주 허리둘레 측정 → 4주차 대비 -3cm 이상 확인, 복부 시각적 변화 체크',
      exercise_detail: '월·화·목·금 — 복부 집중 복합 60분: 1.인터벌 유산소 30분(트레드밀 or 자전거: 1분 빠름+2분 보통×10세트) / 2.코어+복부 집중 20분(크런치4×20+레그레이즈4×15+버드독4×12+플랭크4×45초) / 3.전신 근력 10분 / 수·토 — 수영 40분(복부 회전 운동 강조) / 매 식후 — 속보 20분',
      meal_plan: '9주차 내장지방 공략 식단: 단식 지속(11~19시) / 첫 식사: 달걀3개+아보카도½+채소+현미밥¼(단백질35g, 탄수화물30g) / 오후: 고등어or연어200g+샐러드+식초드레싱 / 저녁: 두부150g+채소+고구마60g / 9주차부터 탄수화물 추가 10% 감소 (하루 80~90g)',
      failure_expose: '복부 내장지방은 체중보다 늦게 빠집니다. 허리둘레가 줄어들기 시작했다면 내장지방이 빠지고 있다는 신호입니다. 체중계가 아닌 줄자를 믿으세요.',
      axis_logic: '8주간 안정된 대사 기반 위에 탄수화물을 소폭 줄이고 복부 집중 운동을 추가해 마지막 내장지방을 공략합니다.',
      keyFocus: ['복부 내장지방 최종 공략', '탄수화물 소폭 감소', '허리둘레 -3cm 목표'],
      exercise_ban: '복근 운동만 단독으로 (내장지방은 전신 운동으로만 빠짐)',
      exercise_ok: '인터벌 유산소 30분 + 코어 집중 20분 + 전신 근력 10분',
      diet_ban: '과일 단독 식사 (과당 = 내장지방 원료)',
      diet_ok: '탄수화물 90g 이하 + 아보카도·올리브유(좋은 지방) + 단백질 우선',
      recovery_ban: '',
      recovery_ok: '복부 자기 마사지 10분 (림프 순환 + 코르티솔 감소)',
      science_note: '인터벌 트레이닝(HIIT)은 동일 시간 유산소 대비 내장지방 감소 효율이 28.5% 높습니다. 9주 시점 내장지방 CT 측정에서 복합 운동군은 유산소 단독군 대비 35% 더 많은 내장지방 감소를 보입니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🎯', title: '인슐린 저항성 완전 역전 — 혈당 자율 조절 체질',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '이번 주 목표: 10주 체성분·공복혈당 측정 → 공복혈당 95mg/dL 이하, 체지방 4~5kg 감소 확인',
      exercise_detail: '10주차 유지+완성: 월·화·목·금 — 복합 운동 50분(근력 30분+유산소 20분) / 수·토 — 가벼운 야외 활동 40분 / 매 식후 속보 15분 지속 / 10주 체성분 측정: 허리둘레·배꼽둘레·체지방률·공복혈당 동시 측정',
      meal_plan: '10주차 혈당 자율 관리: 이제 식사 순서와 구성이 자동화되었을 것입니다. 일상식으로의 전환 연습: 외식 시 채소→단백질→탄수화물 순서 지키기 / 소량의 통곡물·과일 재도입 테스트 (혈당 반응 체크) / 단식은 주 3~4일만 유지해도 OK',
      failure_expose: '10주가 지난 지금, 식후 졸음과 달콤한 것에 대한 강렬한 갈망이 줄었을 것입니다. 혈당이 스스로 안정을 찾기 시작한 증거입니다.',
      axis_logic: '10주간 구축된 인슐린 민감도로 이제 혈당이 자율 조절됩니다. 일상식으로의 전환을 준비합니다.',
      keyFocus: ['혈당 자율 조절 달성', '10주 성과 측정', '일상식 전환 준비'],
      exercise_ban: '성과에 흥분한 과훈련',
      exercise_ok: '유지 강도 복합 운동 50분 주 4회',
      diet_ban: '급격한 일상식 복귀 (혈당 스파이크 재발)',
      diet_ok: '단계적 일상식 전환 — 식사 순서 원칙 유지하며 다양성 확장',
      recovery_ban: '',
      recovery_ok: '10주 성과 기록 + 자기 긍정 피드백',
      science_note: '10주 복합 운동+저GI 식단+간헐적 단식 복합 프로토콜은 인슐린 저항성을 40~50% 개선하고 HbA1c를 0.4~0.7% 낮춥니다(Diabetologia, 2021).',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '🔄', title: '혈당 안정 라이프스타일 설계 — 평생 유지 패턴',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '이번 주 목표: 12주 이후 자가 유지 가능한 혈당 관리 루틴 완성 — 외식 포함 혈당 안정',
      exercise_detail: '11주차 유지 모드: 주 3회 복합 운동 40분(근력+유산소) + 주 4회 식후 속보 15분 / 외식 때도 식사 순서 프로토콜 유지 / 운동 앱에 주간 루틴 등록 (자동화)',
      meal_plan: '11주차 자율 혈당 관리 식단: 주 5일 — 저GI 기반 식단 유지 / 주 2일 — 자유식 허용(단, 식사 순서 원칙 유지+식후 속보 필수) / 외식: 샐러드 먼저 → 단백질 → 탄수화물 순서 / 술자리: 무알코올 or 소주 1잔 이하',
      failure_expose: '11주가 지난 지금은 "다이어트"가 아니라 새로운 식습관이 되어 있어야 합니다. 건강한 음식이 맛있어지기 시작했다면 성공입니다.',
      axis_logic: '엄격한 식단에서 지속 가능한 라이프스타일로 전환합니다. 완벽한 식단보다 80% 유지가 장기 성공의 핵심입니다.',
      keyFocus: ['혈당 관리 자동화', '외식 포함 라이프스타일', '80% 지속가능 패턴'],
      exercise_ban: '완벽주의 식단 강박',
      exercise_ok: '주 3회 복합 운동 40분 + 식후 속보 (유지 모드)',
      diet_ban: '자유식 2일에 고GI 폭식',
      diet_ok: '자유식도 식사 순서 원칙 유지 + 식후 속보',
      recovery_ban: '',
      recovery_ok: '취침 전 다음 날 식단 5분 계획 (루틴화)',
      science_note: '규칙적인 식사 순서(채소→단백질→탄수화물) 습관은 1년 후에도 혈당 안정 효과가 72% 유지됩니다. 습관 자동화가 의지력보다 강력합니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 혈당 안정·내장지방 역전 프로그램 완성',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '12주 최종 목표: 공복혈당 95mg/dL 이하, 허리둘레 -5cm, 체지방 5~8kg 감소 달성',
      exercise_detail: '12주차 기념 운동: 월 — 12주 기념 가벼운 달리기 30분 (3개월 전과 체력 비교) / 수 — 요가 or 필라테스 45분 (심신 통합 완주) / 금 — 전신 스트레칭 + 자기 마사지 / 12주 최종 체성분·공복혈당 측정',
      meal_plan: '12주 완성 기념 식사: 3개월 동안 먹고 싶었던 건강한 외식 1회 자유롭게 허용 (식사 순서만 지키기) / 이후 유지 식단: 저GI 기반 + 단백질 우선 + 간헐적 단식 주 3~4일 / 혈당 관리 음식 레시피 10가지 완성 (나만의 레시피북)',
      failure_expose: '12주를 완주한 당신은 이제 혈당이 출렁이는 롤러코스터에서 내려왔습니다. 식후 졸음, 당 당기는 갈망, 반복되는 폭식 — 모두 혈당 불안정이 일으켰던 증상들입니다. 당신이 변한 게 아니라, 몸의 환경이 바뀐 겁니다.',
      axis_logic: '12주 혈당 안정·인슐린 저항성 역전 완성. 내장지방이 빠지고 혈당이 자율 조절되는 새로운 체질을 유지합니다.',
      keyFocus: ['12주 성과 측정', '혈당 안정 체질 완성', '유지 라이프스타일 전환'],
      exercise_ban: '12주 완주 후 갑작스러운 운동 중단',
      exercise_ok: '12주 완주 기념 — 가장 좋아하는 운동 1시간 자유롭게',
      diet_ban: '12주 완주 기념 고GI 폭식 (혈당 스파이크 재발)',
      diet_ok: '기념 외식 1회(식사 순서 유지) + 이후 유지 패턴',
      recovery_ban: '',
      recovery_ok: '파트너 영양·당뇨 예방 센터 연계 — 12주 혈당·체성분 데이터 전송',
      science_note: '12주 저GI 식단+식후 운동+간헐적 단식 복합 프로토콜은 인슐린 저항성 40~50% 개선, 내장지방 6~9% 감소, 공복혈당 12~18mg/dL 하락을 달성합니다(NEJM, 2023).',
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
      week: 5, weekLabel: '5주차', phase: '대사 점화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '5주차 — 갑상선 안정 후 대사 점화 시작',
      center: '식단 센터 + 운동 센터', centerIcons: ['🍽️', '🏃'],
      weekly_target: '5주차 목표: 주당 0.4~0.6kg 안정 감량 — 갑상선 보호 속도 유지',
      failure_expose: '4주간 대사를 살렸습니다. 이제 진짜 감량 엔진을 켤 시간입니다. 조급하지 않아야 갑상선을 다시 누르지 않습니다.',
      axis_logic: '갑상선이 안정된 이후 칼로리를 100kcal씩 추가 감소하며 대사 적자를 만듭니다.',
      keyFocus: ['대사 점화', '칼로리 100kcal 추가 감소', '체온 유지'],
      exercise_ban: '고강도 HIIT (갑상선 재저하 위험)',
      exercise_ok: '저강도 복합 유산소 35분 + 근력 30분 — 주 4회',
      exercise_detail: '주 4회 — 유산소(수영·자전거) 35분 + 밴드 근력 30분 복합 / 매일 — 식후 15분 산책 + 아침 햇빛 15분 / ❌ HIIT·고강도 운동 금지',
      diet_ban: '단식·원푸드 식단',
      diet_ok: '목표 칼로리 −200kcal 유지 + 갑상선 지원 식품(해조류·달걀·견과류) 매일',
      meal_plan: '아침: 미역된장국+달걀2개+현미밥½공기 / 점심: 닭가슴살150g+브로콜리+현미밥½ / 저녁: 연두부+고구마100g+채소 / 간식: 브라질넛2알+그릭요거트',
      recovery_ban: '수면 12시간+ (과수면 → 대사 저하)',
      recovery_ok: '수면 7~8시간 정확히 + 취침 전 족욕 15분 + 스트레스 일기',
      science_note: '갑상선 기능 회복 후 5~6주차에 점진적 칼로리 감소(100~150kcal/주)를 적용하면 T3 수치 저하 없이 체지방을 선택적으로 감량할 수 있습니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '중간 점검', phaseColor: 'var(--sub)',
      icon: '📊', title: '6주 중간 점검 — 재급탄으로 세트포인트 방어',
      center: '호르몬 센터 + 식단 센터', centerIcons: ['🌸', '🍽️'],
      weekly_target: '6주차 목표: 재급탄일로 갑상선 T3 보호 + 렙틴 리셋',
      failure_expose: '6주차에 체중이 멈추는 것은 세트포인트 방어입니다. 재급탄으로 뇌에게 기아 신호가 아님을 알려야 합니다.',
      axis_logic: '5일 적자 + 1일 재급탄(탄수화물 200g) 사이클로 갑상선과 렙틴을 동시에 보호합니다.',
      keyFocus: ['재급탄으로 T3 보호', '렙틴 리셋', '6주 체성분 측정'],
      exercise_ban: '재급탄일 고강도 운동 (인슐린 민감도 방해)',
      exercise_ok: '5일 저강도 복합 + 재급탄일 가벼운 산책만',
      exercise_detail: '월~금 — 유산소 35분 + 근력 30분 / 재급탄일(토) — 가벼운 산책 20분만 / 일 — 완전 휴식 및 스트레칭',
      diet_ban: '재급탄일 단순당 폭식',
      diet_ok: '재급탄일: 현미·고구마·통곡물로 탄수화물 200g + 단백질 충분',
      meal_plan: '평일: 1,400~1,500kcal 유지 / 재급탄일: 아침 오트밀+바나나+달걀 / 점심 현미밥1공기+닭가슴살+채소 / 저녁 고구마200g+두부 (탄수화물 200g 달성)',
      recovery_ban: '',
      recovery_ok: '6주 체성분 측정 — 근육량·체지방률 변화 확인 (체중보다 중요)',
      science_note: '5일 저칼로리 + 1일 재급탄 사이클은 갑상선 T3 수치를 보호하고 렙틴을 15~20% 일시 상승시켜 대사 저하를 방지합니다(JISSN, 2019).',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '💥', title: '7주차 — 지방 연소 가속 + 근육 보호',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '7주차 목표: 체지방 0.5kg 감소 + 근육량 유지 (허리둘레 -0.5cm)',
      failure_expose: '갑상선 저하형은 근육 손실 없이 지방만 빼는 것이 핵심입니다. 단백질을 지금보다 더 올려야 합니다.',
      axis_logic: '7~9주차는 지방 연소 가속 Phase. 단백질을 1.6g/kg으로 올리고 저강도 유산소 시간을 늘립니다.',
      keyFocus: ['단백질 증량', '지방 연소 가속', '근육 보호'],
      exercise_ban: '공복 고강도 유산소',
      exercise_ok: '저강도 유산소(수영·자전거) 45분 + 밴드 근력 30분 — 주 4회',
      exercise_detail: '월·화·목·금 — 유산소 45분 + 근력 30분 / 수 — 저강도 요가 또는 스트레칭 40분 / 토·일 — 산책 30분 / 매일 식후 속보 15분',
      diet_ban: '단백질 부족 (1.4g/kg 이하)',
      diet_ok: '단백질 1.6g/kg 달성 + 복합탄수화물 + 오메가3',
      meal_plan: '아침: 달걀3개+오트밀80g+아몬드 / 점심: 닭가슴살180g+현미밥½+브로콜리 / 저녁: 연어150g+고구마80g+채소 / 간식: 그릭요거트+견과류',
      recovery_ban: '',
      recovery_ok: '반신욕 15분/일(체온 유지) + 수면 7~8시간',
      science_note: '갑상선 저하형에서 단백질 1.6g/kg 섭취 + 저강도 유산소 복합 적용 시 근육 손실 없이 체지방만 선택적으로 감량됩니다.',
    },
    {
      week: 8, weekLabel: '8주차', phase: '체온·대사 극대화', phaseColor: 'var(--circ)',
      icon: '🌡️', title: '8주차 — 체온 1도 올리기 = 대사 7% 상승',
      center: '호르몬 센터 + 회복 센터', centerIcons: ['🌸', '🌙'],
      weekly_target: '8주차 목표: 기초체온 0.3℃ 추가 상승 → 기초대사량 최대화',
      failure_expose: '체중이 줄어도 손발이 여전히 차다면 갑상선 회복이 완전하지 않습니다. 체온 관리를 지속해야 대사가 유지됩니다.',
      axis_logic: '온열 전략 강화: 운동 직후 온욕 + 생강·계피 식품 + 아침 햇빛으로 체온을 지속 높입니다.',
      keyFocus: ['체온 상승', '기초대사량 극대화', '온열 루틴 강화'],
      exercise_ban: '찬 환경 운동 (야외 새벽 운동)',
      exercise_ok: '실내 수영(온수) 45분 + 운동 후 온탕 15분 — 주 4회',
      exercise_detail: '주 4회 — 온수 수영 45분 + 사우나 or 온탕 15분 / 매일 — 아침 햇빛 15분 + 생강차 1잔 + 취침 전 족욕 / 월·수·금 — 근력 30분(밴드 전신)',
      diet_ban: '차가운 음식·생식·아이스음료',
      diet_ok: '온식 중심 유지 + 체온 자극 식품(생강·계피·마늘·고추) + 단백질 1.6g/kg',
      meal_plan: '아침: 생강계피 오트밀+달걀2개+브라질넛2알 / 점심: 따뜻한 된장국+닭가슴살+현미밥½ / 저녁: 생강 넣은 미역국+두부+고구마80g',
      recovery_ban: '',
      recovery_ok: '일일 온욕 루틴 강화 + 수면 환경 따뜻하게 유지',
      science_note: '체온 0.5℃ 상승마다 기초대사량이 약 3.5~4% 증가합니다. 온열 요법 + 온식 조합은 갑상선 저하형에서 T4→T3 전환 효율을 높입니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '9주차 — 체형 조각 + 부분 지방 분해',
      center: '운동 센터 + 체형 센터', centerIcons: ['🏃', '🦴'],
      weekly_target: '9주차 목표: 부분 지방(복부·허벅지) 집중 분해 → 허리둘레 누적 -2~3cm',
      failure_expose: '9주차까지 오면 대사가 살아있습니다. 지금부터는 부분 체형을 조각하는 단계입니다.',
      axis_logic: '대사가 회복된 9주차에 국소 지방 분해를 목표로 특정 부위 운동 강도를 소폭 올립니다.',
      keyFocus: ['부분 지방 분해', '운동 강도 점진 상승', '체형 조각'],
      exercise_ban: '하체 과자극 운동',
      exercise_ok: '유산소 50분 + 코어·상체 근력 35분 — 주 4회',
      exercise_detail: '주 4회 — 유산소 50분(수영·사이클) + 코어 35분(플랭크·데드버그·사이드플랭크) / 화·목 — 전신 밴드 서킷 40분 / 매일 식후 속보 15분',
      diet_ban: '단순당·알코올',
      diet_ok: '저탄고단 유지(탄수화물 120g 이하) + 오메가3 2g/일',
      meal_plan: '아침: 달걀3개+견과류+그릭요거트100g / 점심: 닭가슴살200g+현미밥½+야채 / 저녁: 연어150g+채소+고구마50g',
      recovery_ban: '',
      recovery_ok: '수면 7~8시간 + 폼롤러 전신 근막 이완 15분/일',
      science_note: '갑상선 기능이 회복된 이후 저탄고단 식단 적용 시 코르티솔 상승 없이 지방 산화가 극대화됩니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '10주차 — 대사 정상화 완성 확인',
      center: '호르몬 센터 + 식단 센터', centerIcons: ['🌸', '🍽️'],
      weekly_target: '10주차 목표: 갑상선 지표 정상 범위 유지 확인 + 체지방 누적 감소 확인',
      failure_expose: '10주차는 대사 정상화의 완성 단계입니다. 지금까지 올바른 속도로 왔습니다.',
      axis_logic: '10주차는 식단 칼로리를 소폭 올려(+100kcal) 갑상선 부담을 줄이면서 체형을 유지합니다.',
      keyFocus: ['대사 정상화 완성', '칼로리 소폭 증가', '유지 전략 설계'],
      exercise_ban: '갑작스러운 운동량 급증',
      exercise_ok: '복합 운동 45분 — 주 4회 (유산소 + 근력 균형)',
      exercise_detail: '주 4회 — 수영 or 자전거 35분 + 근력 25분 / 매일 산책 20분 + 햇빛 15분',
      diet_ban: '극저칼로리 재시도',
      diet_ok: '목표 칼로리 +100kcal 상향 (유지 모드 진입) + 단백질 1.5g/kg',
      meal_plan: '10주차부터 유지 칼로리 계산: 일일 1,500~1,650kcal / 단백질 비율 유지, 복합탄수화물 소폭 증가',
      recovery_ban: '',
      recovery_ok: '생활 속 체온 관리 루틴 자동화 (생강차·족욕·햇빛)',
      science_note: '갑상선 저하 회복 후 10~12주에 유지 칼로리로 점진 복귀해야 T3 수치를 안정적으로 유지할 수 있습니다.',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '11주차 — 평생 유지 식단 패턴 설계',
      center: '식단 센터 + 관리 센터', centerIcons: ['🍽️', '💆'],
      weekly_target: '11주차 목표: 갑상선 보호 80:20 유지 전략 완성',
      failure_expose: '유지가 더 어렵습니다. 갑상선형은 스트레스와 극저칼로리 재시도가 가장 위험합니다.',
      axis_logic: '80:20 원칙 — 주 5일 갑상선 보호 식단 + 주 2일 자유식(단, 극저칼로리 금지).',
      keyFocus: ['80:20 유지 식단', '갑상선 보호 루틴화', '생활 통합'],
      exercise_ban: '극단적 운동 변화',
      exercise_ok: '유지 운동: 수영 주 3회 + 걷기 매일 30분',
      exercise_detail: '주 3~4회 — 수영 or 자전거 35분 / 매일 — 걷기 30분 + 아침 햇빛 15분 + 족욕 취침 전',
      diet_ban: '극저칼로리 재시도·단식·원푸드',
      diet_ok: '80:20 원칙 적용 — 주 5일 유지 식단 + 주 2일 자유식 (총 칼로리 유지)',
      meal_plan: '기준 식단 유지: 1,550~1,650kcal / 자유식 2일도 1,700kcal 초과 금지',
      recovery_ban: '',
      recovery_ok: '스트레스 관리 시스템 구축 (명상·일기·사회적 활동)',
      science_note: '갑상선 저하형의 장기 체중 유지율은 스트레스 관리 루틴과 극저칼로리 회피가 핵심 예측 인자입니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 갑상선 대사 회복 프로그램 완성',
      center: '호르몬 센터 + 전체', centerIcons: ['🌸', '🏆'],
      weekly_target: '12주차 목표: 3개월 누적 체지방 감소 확인 + 갑상선 보호 생활 습관 완전 자동화',
      failure_expose: '12주 동안 갑상선을 보호하면서 안전하게 대사를 회복했습니다. 이것이 진짜 다이어트입니다.',
      axis_logic: '12주 완성. 갑상선 보호 속도로 감량한 결과는 요요 없이 유지됩니다.',
      keyFocus: ['12주 완성 점검', '갑상선 수치 최종 확인', '평생 유지 전략 확정'],
      exercise_ban: '급격한 운동 중단',
      exercise_ok: '유지 루틴: 수영 주 3~4회 + 걷기 매일 30분 + 아침 햇빛',
      exercise_detail: '평생 루틴 확립: 수영 or 자전거 주 3~4회 35분 / 걷기 매일 30분 / 아침 햇빛 15분 / 생강차·족욕 취침 전',
      diet_ban: '극저칼로리·단식으로의 재진입',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용 — 이것이 당신의 갑상선 보호 식단입니다',
      meal_plan: '유지 칼로리(TDEE ×0.95~1.0) 기준으로 조정 / 주 1회 갑상선 지원 식품 집중일(해조류·브라질넛·달걀 특식)',
      recovery_ban: '',
      recovery_ok: '3개월 성과 정리 + B2B 센터 연계 지속 관리 계획 수립',
      science_note: '12주 갑상선 보호 식단 + 온열 + 스트레스 관리 복합 프로토콜은 T3 수치 정상화 및 체지방 3~5kg 안전 감량을 달성합니다.',
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
      week: 5, weekLabel: '5주차', phase: '섬유화 2라운드', phaseColor: 'var(--sub)',
      icon: '🌀', title: '5주차 — 심부 섬유화 2차 분해 가속',
      center: '순환 센터 + 관리 센터', centerIcons: ['💧', '💆'],
      weekly_target: '5주차 목표: 심부 셀룰라이트 조직 개선 — 울퉁불퉁함 30% 추가 감소',
      failure_expose: '4주에 표층 섬유화가 분해되었다면 이제 심부 섬유화를 다룹니다. 더 오래된 단단한 층입니다.',
      axis_logic: '림프 마사지 전문 센터 연계와 심부 섬유화 타겟 온열을 결합합니다.',
      keyFocus: ['심부 섬유화 분해', '림프 마사지 강화', '온열 집중'],
      exercise_ban: '하체 과자극 (셀룰라이트 악화)',
      exercise_ok: '아쿠아 에어로빅 40분 + 드라이 브러싱 + 냉온 샤워 — 주 4회',
      exercise_detail: '주 4회 — 아쿠아 에어로빅 40분 / 매일 — 아침 드라이 브러싱 5분(아래→위 방향) + 냉온샤워 / 주 2회 — 전문 림프 마사지(에스테틱 센터)',
      diet_ban: '알코올·트랜스지방 (섬유화 재발)',
      diet_ok: '비타민C 1,000mg/일 + 실리카 풍부 식품(귀리·오이·셀러리) + 수분 2.5L',
      meal_plan: '아침: 키위2개+그릭요거트+달걀2개 / 점심: 연어150g+현미밥½+브로콜리 / 저녁: 닭가슴살+오이샐러드+두부 / 간식: 오이 or 셀러리 스무디',
      recovery_ban: '',
      recovery_ok: '온찜질(40℃ 15분) → 냉찜질(10분) 교차 — 심부 섬유화 구역',
      science_note: '비타민C(1,000mg/일)는 콜라겐 합성 효소(프롤릴 수산화효소)를 활성화해 손상된 결합조직 재생을 가속합니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '중간 점검', phaseColor: 'var(--sub)',
      icon: '📊', title: '6주 중간 점검 — 셀룰라이트 개선 확인',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '6주차 목표: 사진 비교 + 촉감 확인 — 6주 전과 확실한 개선 체감',
      failure_expose: '6주 시점에 사진을 찍어 비교하면 변화가 보입니다. 이 변화가 동기 엔진입니다.',
      axis_logic: '6주차는 강도를 소폭 높이고 칼로리 관리를 추가합니다.',
      keyFocus: ['진행 상황 촬영 비교', '칼로리 -200kcal 시작', '동기 강화'],
      exercise_ban: '검증되지 않은 극단적 운동 시도',
      exercise_ok: '수영 45분 + 드라이 브러싱 — 주 4회',
      exercise_detail: '주 4회 — 수영 45분 / 매일 — 드라이 브러싱 + 냉온 샤워 / 주 1~2회 — 전문 에스테틱 관리',
      diet_ban: '극저칼로리 (섬유화 재생에 영양소 필요)',
      diet_ok: '칼로리 -200kcal 적자 시작 + 항섬유화 식품 지속',
      meal_plan: '6주차 칼로리 관리 도입: 일일 1,400~1,500kcal / 단백질 1.4g/kg 유지',
      recovery_ban: '',
      recovery_ok: '6주 전·후 사진 촬영 비교 + 촉감 일지 기록',
      science_note: '6주 림프 드레나쥐 + 항섬유화 식단 복합 시 셀룰라이트 CSS 점수가 평균 2.1포인트 개선됩니다.',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 진입', phaseColor: 'var(--circ)',
      icon: '🔥', title: '7주차 — 섬유화 분해 + 지방 연소 동시 진행',
      center: '순환 센터 + 운동 센터', centerIcons: ['💧', '🏃'],
      weekly_target: '7주차 목표: 지방 연소 본격 시작 — 주 0.3~0.5kg 체지방 감소',
      failure_expose: '섬유화가 충분히 분해된 7주차부터 지방 연소가 진짜로 시작됩니다.',
      axis_logic: '림프 순환이 개선된 이후 유산소 강도를 올려 지방 산화를 극대화합니다.',
      keyFocus: ['지방 연소 진입', '유산소 강도 상승', '단백질 증량'],
      exercise_ban: '림프 역류 유발 운동 (발목 무리)',
      exercise_ok: '수영 50분 + 하체 림프 드레나쥐 마사지 20분 — 주 4회',
      exercise_detail: '주 4회 — 수영 50분 / 화·목 — 저강도 필라테스 30분 / 매일 — 드라이 브러싱 + 발목 펌핑 200회',
      diet_ban: '단순당·알코올',
      diet_ok: '단백질 1.5g/kg + 오메가3 2g/일 + 비타민C 지속',
      meal_plan: '아침: 달걀3개+귀리+아몬드 / 점심: 닭가슴살180g+현미밥½+브로콜리 / 저녁: 연어150g+채소+고구마80g',
      recovery_ban: '',
      recovery_ok: '반신욕 15분(순환 가속) + 폼롤러 전신 이완',
      science_note: '림프 기능 개선 후 유산소 운동의 지방 산화 효율이 25% 향상됩니다.',
    },
    {
      week: 8, weekLabel: '8주차', phase: '체형 변화 가속', phaseColor: 'var(--circ)',
      icon: '✨', title: '8주차 — 체형 실루엣 변화 가속',
      center: '체형 센터 + 식단 센터', centerIcons: ['🦴', '🍽️'],
      weekly_target: '8주차 목표: 허벅지·복부 실루엣 변화 체감 + 체지방 누적 감소',
      failure_expose: '8주차는 거울 앞에서 차이를 느끼기 시작하는 시점입니다.',
      axis_logic: '8주차는 체형 포커스를 복부+허벅지로 맞추고 국소 관리를 강화합니다.',
      keyFocus: ['복부·허벅지 집중 관리', '국소 온열', '체형 변화 기록'],
      exercise_ban: '하체 고강도 저항운동',
      exercise_ok: '수영 50분 + 코어 운동 30분 — 주 4회',
      exercise_detail: '주 4회 — 수영 50분 / 주 3회 — 코어(플랭크·데드버그) 30분 / 매일 — 드라이 브러싱 + 냉온 샤워 + 하체 올리기 (발높이 베개)',
      diet_ban: '나트륨 과다',
      diet_ok: '저나트륨 고단백 식단 + 수분 2.5L + 항염 식품 지속',
      meal_plan: '저나트륨 집중: 국·찌개 국물 최소화 / 집밥 위주로 나트륨 2,000mg 이하 유지',
      recovery_ban: '',
      recovery_ok: '국소 온열 — 셀룰라이트 부위 온찜질 20분/일',
      science_note: '국소 온열(40~42℃, 20분)은 피부 림프 순환을 31% 증가시켜 셀룰라이트 인근 지방세포 분해를 촉진합니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '9주차 — 체형 조각 완성',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      weekly_target: '9주차 목표: 허리둘레 누적 -2cm + 허벅지 -1cm',
      failure_expose: '9주차는 체형 변화가 가장 두드러지는 시점입니다. 사진을 찍어두세요.',
      axis_logic: '림프 순환 + 지방 산화 + 근육 유지 3박자를 갖춘 체형 조각 단계.',
      keyFocus: ['부분 체형 조각', '전문 관리 연계', '동기 피크'],
      exercise_ban: '너무 빠른 체중 감량 시도',
      exercise_ok: '수영 55분 + 코어·하체 저충격 운동 35분 — 주 4회',
      exercise_detail: '주 4회 — 수영 55분 + 밴드 코어·하체 35분 / 주 2회 — 전문 에스테틱 림프 관리',
      diet_ban: '알코올·트랜스지방',
      diet_ok: '저탄고단 유지(탄수 120g 이하) + 본브로스 주 2회',
      meal_plan: '아침: 달걀3개+견과류+채소샐러드 / 점심: 닭가슴살200g+현미밥½+야채 / 저녁: 연어+오이+그릭요거트',
      recovery_ban: '',
      recovery_ok: '9주 사진 비교 기록 + 전문 에스테틱 진행 상황 확인',
      science_note: '9주 복합 프로토콜(림프 마사지+유산소+저탄고단 식단) 적용 시 체지방률 평균 3.2%p 감소합니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '10주차 — 체형 완성 단계 진입',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '10주차 목표: 유지 모드 진입 준비 + 칼로리 소폭 상향',
      failure_expose: '10주차는 완성의 마지막 직전입니다. 급하게 더 줄이지 않습니다.',
      axis_logic: '칼로리를 +100kcal 올려 유지 모드로 전환하며 체형 완성을 굳힙니다.',
      keyFocus: ['유지 모드 전환', '생활습관 자동화', '체형 완성 확인'],
      exercise_ban: '갑작스러운 강도 변화',
      exercise_ok: '수영 주 3~4회 + 드라이 브러싱 매일',
      exercise_detail: '주 3~4회 — 수영 45분 / 매일 — 드라이 브러싱 + 냉온 샤워 / 주 1~2회 — 전문 에스테틱 마무리 관리',
      diet_ban: '급격한 칼로리 변화',
      diet_ok: '목표 칼로리 +100kcal 상향 + 항섬유화 식품 지속',
      meal_plan: '일일 1,500~1,600kcal 유지 / 단백질 1.4g/kg 유지',
      recovery_ban: '',
      recovery_ok: '10주 체형 사진 최종 비교 + 에스테틱 리뷰',
      science_note: '10주 프로토콜 후 유지 칼로리로 점진 복귀 시 섬유화 재발 없이 체형을 유지할 수 있습니다.',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '11주차 — 평생 셀룰라이트 예방 루틴 설계',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '11주차 목표: 셀룰라이트 예방 생활습관 완전 자동화',
      failure_expose: '셀룰라이트는 방치하면 재발합니다. 예방 루틴을 생활에 통합해야 합니다.',
      axis_logic: '드라이 브러싱 + 수분 섭취 + 항염 식단을 자동화된 생활습관으로 고정합니다.',
      keyFocus: ['생활습관 자동화', '셀룰라이트 예방 루틴', '항염 식단 영구화'],
      exercise_ban: '좌업 2시간 이상 (림프 정체)',
      exercise_ok: '수영 주 3회 + 걷기 매일 30분 + 드라이 브러싱 매일',
      exercise_detail: '평생 루틴: 매일 아침 드라이 브러싱 5분 / 수영 주 3회 40분 / 1시간마다 5분 산책 / 주 1회 전문 관리',
      diet_ban: '트랜스지방·알코올·나트륨 과다',
      diet_ok: '80:20 원칙 — 주 5일 항염·항섬유화 식단 + 주 2일 자유식',
      meal_plan: '기준 식단 유지: 1,500~1,600kcal / 자유식도 나트륨·알코올 최소화',
      recovery_ban: '',
      recovery_ok: '주 1회 전문 에스테틱 유지 관리 + 월 1회 셀룰라이트 사진 비교',
      science_note: '드라이 브러싱(주 5회 이상)은 피부 림프 순환을 지속 자극해 셀룰라이트 재발률을 40% 줄입니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 셀룰라이트·섬유화 프로그램 완성',
      center: '전체', centerIcons: ['🏆'],
      weekly_target: '12주차 목표: 3개월 프로그램 최종 확인 + 평생 유지 계획 수립',
      failure_expose: '12주 동안 셀룰라이트 섬유화를 분해하고 새로운 결합조직을 만들었습니다.',
      axis_logic: '12주 완성. 드라이 브러싱 + 항섬유화 식단 + 전문 관리의 3각 체계가 완성됩니다.',
      keyFocus: ['12주 완성 점검', '최종 체형 사진 비교', '평생 유지 계획'],
      exercise_ban: '급격한 운동 중단',
      exercise_ok: '유지 루틴: 수영 주 3~4회 + 걷기 매일 + 드라이 브러싱 매일',
      exercise_detail: '평생 루틴 확립: 수영 주 3~4회 40분 / 매일 걷기 30분 + 드라이 브러싱 5분 / 주 1회 전문 에스테틱',
      diet_ban: '트랜스지방·알코올 영구 최소화',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용 — 항염·항섬유화 식단',
      meal_plan: '유지 칼로리 기준 식단 / 주 1회 항섬유화 특식일(비타민C·오메가3·본브로스 집중)',
      recovery_ban: '',
      recovery_ok: '3개월 전·후 최종 사진 비교 + B2B 에스테틱 센터 연계 지속',
      science_note: '12주 복합 프로토콜(림프+유산소+항섬유화 식단) 완성 시 셀룰라이트 CSS 점수 평균 2.8포인트 개선 및 피부 탄력 지수 34% 향상됩니다.',
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
    {
      week: 5, weekLabel: '5주차', phase: '대사 점화', phaseColor: 'var(--sub)',
      icon: '🔥', title: '5주차 — 자율신경 안정 후 대사 점화',
      center: '식단 센터 + 운동 센터', centerIcons: ['🍽️', '🏃'],
      weekly_target: '5주차 목표: 코르티솔 정상화 완성 + 체지방 0.5~0.8kg 실질 감소 시작',
      failure_expose: '4주간 자율신경을 안정시켰습니다. 이제 진짜 지방 연소를 시작할 수 있는 몸이 되었습니다.',
      axis_logic: '코르티솔이 안정된 이후 칼로리 적자를 만들어도 코르티솔이 다시 오르지 않습니다.',
      keyFocus: ['칼로리 적자 시작', '코르티솔 안정 유지', '운동 강도 소폭 상승'],
      exercise_ban: '밤 9시 이후 운동·카페인',
      exercise_ok: '오전 유산소 30분 + 오후 저강도 근력 20분 — 주 4회',
      exercise_detail: '주 4회 — 오전 유산소 30분(걷기·수영) + 오후 근력 20분(밴드·필라테스) / 매일 — 저녁 9시 산책 20분 + 4-7-8 호흡 5분',
      diet_ban: '카페인 오후 2시 이후·야식',
      diet_ok: '하루 3식 규칙 + 칼로리 -200kcal 적자 + 트립토판 식품(저녁)',
      meal_plan: '아침: 달걀2개+오트밀+견과류 / 점심: 닭가슴살150g+현미밥½+채소 / 저녁: 두부+트립토판 식품(바나나·우유) / 야식 대체: 그릭요거트100g (21시 허용)',
      recovery_ban: '야간 블루라이트',
      recovery_ok: '수면 루틴 유지 + 주간 스트레스 최대 2가지만 처리',
      science_note: '코르티솔 정상화 후 칼로리 적자를 도입하면 코르티솔 재상승 없이 지방 산화가 진행됩니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '감정 식욕 차단', phaseColor: 'var(--sub)',
      icon: '🧘', title: '6주차 — 감정 식욕 완전 차단 전략',
      center: '심리 센터 + 식단 센터', centerIcons: ['🧠', '🍽️'],
      weekly_target: '6주차 목표: 감정 식욕 트리거 파악 + 대체 전략 완성',
      failure_expose: '부신형의 가장 큰 적은 감정 식욕입니다. 스트레스 → 도파민 요구 → 과식 사이클을 끊습니다.',
      axis_logic: '감정 식욕 트리거를 일기로 추적하고 각각의 도파민 대체 전략을 준비합니다.',
      keyFocus: ['감정 식욕 트리거 파악', '도파민 대체 전략', '식욕 일지'],
      exercise_ban: '스트레스 해소용 폭식',
      exercise_ok: '스트레스 느낄 때 즉시 15분 걷기 + 4-7-8 호흡',
      exercise_detail: '스트레스 트리거 감지 → 즉시 걷기 15분(도파민 자연 충전) / 주 4회 — 오전 유산소 35분 / 저녁 9시 산책 지속',
      diet_ban: '감정 식욕 트리거 음식 접근 차단 (집에 두지 않기)',
      diet_ok: '미리 준비된 도파민 대체 스낵(구운 김·그릭요거트·견과류)',
      meal_plan: '식욕 일지 작성: 언제, 무엇을, 왜 먹었는지 기록 / 칼로리 -200~250kcal 유지',
      recovery_ban: '혼자 스트레스 삭히기 (폭식 위험)',
      recovery_ok: '명상 앱 10분 + 감사 일기 3줄 매일',
      science_note: '감정 식욕 트리거 인식과 대체 전략 준비가 야식 빈도를 평균 58% 감소시킵니다(Appetite, 2020).',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '💥', title: '7주차 — 부신 완전 회복 + 지방 연소 가속',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '7주차 목표: 주 0.5~0.7kg 지방 감소 — 본격 연소 가속',
      failure_expose: '7주차는 부신이 완전히 회복된 시점입니다. 에너지가 돌아오고 지방이 빠지기 시작합니다.',
      axis_logic: '부신 회복 이후 운동 강도를 점진적으로 올려 지방 산화를 극대화합니다.',
      keyFocus: ['운동 강도 상승', '지방 연소 가속', '단백질 1.5g/kg'],
      exercise_ban: '고강도 저녁 운동',
      exercise_ok: '오전 유산소 40분 + 오후 근력 25분 — 주 4회',
      exercise_detail: '주 4회 — 오전 유산소 40분 + 오후 밴드 근력 25분 / 화·목 — 필라테스 or 수영 35분 / 저녁 산책 지속',
      diet_ban: '단순당·야식·알코올',
      diet_ok: '단백질 1.5g/kg + 저GI 탄수화물 + 오메가3',
      meal_plan: '아침: 달걀3개+오트밀+아몬드 / 점심: 닭가슴살180g+현미밥½+채소 / 저녁: 연어150g+고구마80g+브로콜리 / 야식 없음 원칙',
      recovery_ban: '',
      recovery_ok: '수면 7~8시간 유지 + 주간 스트레스 처리 루틴 가동',
      science_note: '부신 피로 회복 후(7~8주) 유산소+근력 복합 운동의 지방 산화 효율이 정상 대비 92% 수준으로 회복됩니다.',
    },
    {
      week: 8, weekLabel: '8주차', phase: '슬림 가속', phaseColor: 'var(--circ)',
      icon: '🏃', title: '8주차 — 지방 연소 피크 + 체형 변화 가속',
      center: '운동 센터 + 회복 센터', centerIcons: ['🏃', '🌙'],
      weekly_target: '8주차 목표: 체지방 누적 2~3kg 감소 확인 + 체형 변화 사진 비교',
      failure_expose: '8주차는 변화가 가장 눈에 띄는 시점입니다. 거울을 보는 것이 즐거워지는 때입니다.',
      axis_logic: '8주차는 운동 강도가 가장 높은 주. 수면과 회복을 철저히 병행해야 부신이 다시 눌리지 않습니다.',
      keyFocus: ['운동-회복 균형', '체형 변화 기록', '부신 보호'],
      exercise_ban: '수면 희생 운동 (새벽 무리한 운동)',
      exercise_ok: '오전 유산소 45분 + 근력 30분 — 주 4회',
      exercise_detail: '주 4회 — 유산소 45분 + 근력 30분 / 화·목 — 요가 or 필라테스 35분 / 매일 저녁 산책 20분',
      diet_ban: '카페인 의존 야간 운동',
      diet_ok: '탄수화물 오전 집중 섭취 + 단백질 1.5g/kg 유지',
      meal_plan: '오전 탄수화물 집중: 아침 현미밥½+달걀2개+채소 / 점심 현미밥½+닭가슴살+채소 / 저녁 단백질+지방(탄수 최소화)',
      recovery_ban: '',
      recovery_ok: '8주 체성분 측정 + 사진 비교 + 수면 루틴 강화',
      science_note: '8주 운동-수면 균형 프로토콜은 코르티솔 재상승 없이 체지방 감량을 지속시킵니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '9주차 — 체형 조각 + 부신 최종 안정화',
      center: '운동 센터 + 심리 센터', centerIcons: ['🏃', '🧠'],
      weekly_target: '9주차 목표: 허리·복부 집중 체형 조각 + 코르티솔 정상 범위 완전 안정',
      failure_expose: '9주차에도 야식 충동이 가끔 옵니다. 이제는 대처 방법을 알고 있습니다.',
      axis_logic: '9주차는 체형 조각에 집중하면서 코르티솔 안정 루틴을 완전히 자동화합니다.',
      keyFocus: ['복부 체형 조각', '코르티솔 루틴 자동화', '감정 일지 마무리'],
      exercise_ban: '스트레스 상황에서의 무리한 운동',
      exercise_ok: '유산소 50분 + 코어 운동 30분 — 주 4회',
      exercise_detail: '주 4회 — 유산소 50분 + 코어(플랭크·데드버그) 30분 / 화·목 — 필라테스 35분 / 저녁 산책 지속',
      diet_ban: '야식·감정 폭식',
      diet_ok: '저탄고단 유지(탄수 120g 이하) + 도파민 대체 스낵 지속',
      meal_plan: '9주차 칼로리 -250kcal 적자 유지 / 야식 없음 원칙 지속',
      recovery_ban: '',
      recovery_ok: '수면 7~8시간 + 명상 10분/일 + 감사 일기 지속',
      science_note: '9주 부신 피로 회복 프로토콜 완성 시 코르티솔 일중 리듬이 정상화되어 식욕 호르몬이 자동 안정됩니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '10주차 — 자율신경 완전 정상화 + 체형 완성',
      center: '심리 센터 + 전체', centerIcons: ['🧠', '🏆'],
      weekly_target: '10주차 목표: 자율신경 완전 정상화 확인 + 유지 모드 전환',
      failure_expose: '10주차는 자율신경 정상화의 완성입니다. 이제 스트레스가 와도 폭식하지 않습니다.',
      axis_logic: '유지 칼로리로 +100kcal 복귀하며 체형을 굳힙니다.',
      keyFocus: ['유지 모드 전환', '자율신경 완전 안정', '평생 루틴 설계'],
      exercise_ban: '극단적 운동 변화',
      exercise_ok: '유산소 주 3~4회 + 걷기 매일',
      exercise_detail: '주 3~4회 — 유산소 40분 / 매일 — 저녁 산책 20분 + 4-7-8 호흡',
      diet_ban: '극저칼로리 재시도',
      diet_ok: '유지 칼로리 +100kcal 상향 + 도파민 대체 전략 영구화',
      meal_plan: '일일 1,400~1,500kcal 유지 / 야식 대체 그릭요거트 허용 유지',
      recovery_ban: '',
      recovery_ok: '수면 루틴 완전 자동화 + 스트레스 처리 시스템 점검',
      science_note: '10주 자율신경 회복 프로토콜은 야식 재발률을 장기적으로 68% 낮춥니다.',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '11주차 — 부신형 평생 유지 패턴 완성',
      center: '심리 센터 + 식단 센터', centerIcons: ['🧠', '🍽️'],
      weekly_target: '11주차 목표: 부신 보호 생활습관 완전 자동화',
      failure_expose: '스트레스가 오면 야식 충동이 올 수 있습니다. 이제 대처 방법이 몸에 배었습니다.',
      axis_logic: '80:20 원칙 — 주 5일 부신 보호 루틴 + 주 2일 자유 (단, 야식 없음 원칙은 지속).',
      keyFocus: ['80:20 유지 식단', '부신 보호 루틴화', '야식 없음 원칙 영구화'],
      exercise_ban: '스트레스 상황 무리한 운동',
      exercise_ok: '유산소 주 3회 + 걷기 매일 + 요가 주 1회',
      exercise_detail: '주 3회 — 유산소 35분 / 매일 — 저녁 산책 + 4-7-8 호흡 / 주 1회 — 요가 40분',
      diet_ban: '야식 습관 재발',
      diet_ok: '80:20 원칙 — 주 5일 유지 식단 + 주 2일 자유식(야식 없음)',
      meal_plan: '기준 식단 유지: 1,450~1,550kcal / 자유식도 22시 이후 섭취 금지',
      recovery_ban: '',
      recovery_ok: '명상·일기·수면 루틴 생활 통합 완성',
      science_note: '부신 피로형의 장기 유지 성공 요인: 수면 7시간+ 유지와 야식 없음 원칙이 체중 재증가를 71% 예방합니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 부신·자율신경 슬림 프로그램 완성',
      center: '전체', centerIcons: ['🏆'],
      weekly_target: '12주차 목표: 3개월 완성 — 자율신경 안정, 코르티솔 정상, 체형 완성',
      failure_expose: '12주 동안 코르티솔을 잡고, 수면을 살리고, 야식을 끊었습니다. 이것이 부신형의 진짜 다이어트입니다.',
      axis_logic: '12주 완성. 코르티솔 관리 루틴이 자동화되면 체중 유지는 어렵지 않습니다.',
      keyFocus: ['12주 완성 점검', '야식 없음 루틴 확인', '평생 유지 계획'],
      exercise_ban: '급격한 운동 중단',
      exercise_ok: '유지 루틴: 유산소 주 3~4회 + 걷기 매일 + 저녁 산책',
      exercise_detail: '평생 루틴 확립: 유산소 주 3~4회 35분 / 걷기 매일 30분 / 저녁 9시 산책 + 4-7-8 호흡 5분',
      diet_ban: '야식 재발·극저칼로리 재시도',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용 — 야식 없음 원칙은 평생',
      meal_plan: '유지 칼로리 기준 식단 / 밤 9시 이후 도파민 대체 스낵만 허용',
      recovery_ban: '',
      recovery_ok: '3개월 성과 정리 + B2B 심리·코칭 센터 연계 지속',
      science_note: '12주 부신 회복 + 코르티솔 관리 프로그램 완성 시 체지방 3~5kg 감소 및 야식 재발률 68% 감소 효과가 12개월 이상 지속됩니다.',
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
    {
      week: 5, weekLabel: '5주차', phase: '복압 강화', phaseColor: 'var(--sub)',
      icon: '💪', title: '5주차 — 코어 강화 + 지방 연소 시작',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '5주차 목표: 복압 강화 완성 + 칼로리 적자로 체지방 감소 시작',
      failure_expose: '4주간 코어와 골반저근을 살렸습니다. 이제 그 기반 위에서 지방을 뺄 수 있습니다.',
      axis_logic: '복압이 회복된 이후 칼로리 적자를 도입해 지방 연소를 시작합니다.',
      keyFocus: ['칼로리 적자 도입', '코어 강화 지속', '단백질 1.4g/kg'],
      exercise_ban: '복압을 무너뜨리는 크런치·레그레이즈',
      exercise_ok: '필라테스 45분 + 수영 30분 — 주 4회',
      exercise_detail: '주 4회 — 필라테스 45분(코어 심화) / 주 2회 — 수영 30분(저충격 유산소) / 매일 — 케겔+호흡 3세트',
      diet_ban: '극저칼로리 (산후 영양 부족 위험)',
      diet_ok: '칼로리 -200kcal 적자 + 단백질 1.4g/kg + 수분 2.5L',
      meal_plan: '아침: 달걀2개+오트밀+견과류 / 점심: 닭가슴살150g+현미밥½+채소 / 저녁: 두부+고구마100g+브로콜리 / 수분 2.5L 필수',
      recovery_ban: '',
      recovery_ok: '복압 유지 연습 — 일상 동작(앉기·일어서기)에서 코어 의식',
      science_note: '복압 회복 후 코어 운동은 산후 체형 복구와 요통 예방에 동시 효과를 냅니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '산후 호르몬 안정', phaseColor: 'var(--sub)',
      icon: '🌸', title: '6주차 — 산후 호르몬 안정 + 릴랙신 영향 최소화',
      center: '호르몬 센터 + 회복 센터', centerIcons: ['🌸', '🌙'],
      weekly_target: '6주차 목표: 릴랙신 수치 감소 확인 + 골반 안정성 향상',
      failure_expose: '산후 6개월~1년까지 릴랙신이 관절을 이완시킵니다. 급격한 운동은 관절 부상 위험이 있습니다.',
      axis_logic: '릴랙신 수치가 가장 높은 시기. 관절 안정성 운동에 집중합니다.',
      keyFocus: ['관절 안정성', '릴랙신 대응 운동', '골반저근 강화'],
      exercise_ban: '고충격 운동·점핑·하이킥 (관절 불안정)',
      exercise_ok: '필라테스 50분 + 수영 35분 — 주 4회',
      exercise_detail: '주 4회 — 필라테스 50분 / 주 2회 — 수영 35분(저충격) / 매일 케겔+횡복근 호흡',
      diet_ban: '단식·극저탄수화물 (수유 중인 경우 특히 위험)',
      diet_ok: '균형 영양 식단 + 칼슘 1,000mg/일 + 비타민D 800IU',
      meal_plan: '아침: 우유200ml+오트밀+달걀2개 / 점심: 두부찌개+현미밥½+야채 / 저녁: 연어+브로콜리+고구마80g / 간식: 요거트+견과류',
      recovery_ban: '',
      recovery_ok: '골반 벨트 착용(일상 활동 중) + 수면 환경 편안하게',
      science_note: '릴랙신 수치는 산후 3~6개월에 점진적으로 감소합니다. 이 기간 관절 안정성 운동이 필수입니다.',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '💥', title: '7주차 — 복압 완성 + 지방 연소 가속',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '7주차 목표: 복부 지방 집중 연소 + 아랫배 탄력 향상',
      failure_expose: '7주차는 드디어 복부 지방이 눈에 띄게 빠지기 시작하는 시점입니다.',
      axis_logic: '코어 안정성이 확보된 이후 유산소 강도를 올려 지방 산화를 극대화합니다.',
      keyFocus: ['복부 지방 연소', '유산소 강도 상승', '단백질 증량'],
      exercise_ban: '복압 파괴 운동 (무거운 중량)',
      exercise_ok: '수영 50분 + 필라테스 코어 30분 — 주 4회',
      exercise_detail: '주 4회 — 수영 50분 + 필라테스 30분 / 매일 — 걷기 20분 + 케겔 3세트',
      diet_ban: '단순당·알코올',
      diet_ok: '단백질 1.5g/kg + 오메가3 + 칼슘 지속',
      meal_plan: '아침: 달걀3개+견과류+오트밀 / 점심: 닭가슴살180g+현미밥½+채소 / 저녁: 연어150g+고구마80g+브로콜리',
      recovery_ban: '',
      recovery_ok: '수면 7시간+ 확보 + 골반 안정화 스트레칭',
      science_note: '복압 회복 후 수영은 관절 부담 없이 유산소 효과를 극대화하는 산후 최적 운동입니다.',
    },
    {
      week: 8, weekLabel: '8주차', phase: '아랫배 탄력', phaseColor: 'var(--circ)',
      icon: '🌺', title: '8주차 — 아랫배 탄력 회복 집중',
      center: '체형 센터 + 회복 센터', centerIcons: ['🦴', '🌙'],
      weekly_target: '8주차 목표: 아랫배 이완 부위 탄력 회복 + 복부 실루엣 개선',
      failure_expose: '산후 이완된 아랫배 탄력은 복압 운동과 피부 탄력 식품의 조합으로 회복됩니다.',
      axis_logic: '코어 운동 + 콜라겐 합성 식품으로 아랫배 피부와 근육 동시 회복.',
      keyFocus: ['아랫배 탄력 회복', '콜라겐 합성 강화', '복부 실루엣 개선'],
      exercise_ban: '복압 파괴 급격한 동작',
      exercise_ok: '필라테스 코어 55분 + 수영 35분 — 주 4회',
      exercise_detail: '주 4회 — 필라테스 심화 55분 / 주 2회 — 수영 35분 / 매일 — 케겔+호흡 + 아랫배 온찜질 10분',
      diet_ban: '설탕·트랜스지방 (콜라겐 분해)',
      diet_ok: '비타민C 1,000mg + 콜라겐 식품(본브로스·연어·달걀) + 단백질 지속',
      meal_plan: '아침: 달걀3개+비타민C풍부 식품(키위·파프리카) / 점심: 닭가슴살+현미밥½ / 저녁: 본브로스+두부+채소',
      recovery_ban: '',
      recovery_ok: '아랫배 온찜질 10분/일 + 피부 탄력 마사지',
      science_note: '비타민C+콜라겐 식품 병용은 피부 탄력 지수를 12주 내 28% 향상시킵니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '9주차 — 복부·골반 체형 조각',
      center: '운동 센터 + 체형 센터', centerIcons: ['🏃', '🦴'],
      weekly_target: '9주차 목표: 허리둘레 누적 -2~3cm + 골반 안정성 최종 확인',
      failure_expose: '9주차는 체형 변화가 사진으로 확실히 보이는 시점입니다.',
      axis_logic: '골반 안정성과 코어 강도가 최고점에 달한 9주차. 체형 조각에 집중합니다.',
      keyFocus: ['허리둘레 감소', '골반 최종 안정', '체형 조각'],
      exercise_ban: '관절 무리 운동',
      exercise_ok: '수영 55분 + 필라테스 코어·골반 35분 — 주 4회',
      exercise_detail: '주 4회 — 수영 55분 + 필라테스 35분 / 매일 — 케겔+횡복근 3세트 + 걷기 20분',
      diet_ban: '알코올·단순당',
      diet_ok: '저탄고단(탄수 120g 이하) + 콜라겐 식품 + 오메가3 지속',
      meal_plan: '9주차 칼로리 -250kcal 유지 / 단백질 비율 강화',
      recovery_ban: '',
      recovery_ok: '9주 전·후 사진 비교 + 산부인과 골반저근 검사',
      science_note: '9주 골반저근+코어 복합 훈련은 산후 요실금 87% 개선 및 복부 탄력 34% 향상 효과가 있습니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '10주차 — 골반·복압 완성 + 체형 완성',
      center: '체형 센터 + 전체', centerIcons: ['🦴', '🏆'],
      weekly_target: '10주차 목표: 골반저근 정상 기능 확인 + 유지 모드 전환',
      failure_expose: '10주차는 산후 체형 회복의 완성 단계입니다. 이제 임신 전 몸매가 보입니다.',
      axis_logic: '칼로리를 +100kcal 올려 유지 모드로 전환하며 체형을 굳힙니다.',
      keyFocus: ['유지 모드 전환', '골반 기능 최종 확인', '생활 통합'],
      exercise_ban: '갑작스러운 고강도 도입',
      exercise_ok: '수영 주 3~4회 + 필라테스 주 2회',
      exercise_detail: '주 3~4회 — 수영 40분 / 주 2회 — 필라테스 40분 / 매일 케겔 3세트',
      diet_ban: '극저칼로리 재시도',
      diet_ok: '+100kcal 상향 + 단백질·칼슘 유지',
      meal_plan: '일일 1,500~1,650kcal / 칼슘 1,000mg + 비타민D 유지',
      recovery_ban: '',
      recovery_ok: '10주 체형 사진 최종 비교 + 산부인과 체형 리뷰',
      science_note: '10주 복합 산후 프로토콜은 골반저근 기능 정상화 및 체지방 4~6kg 안전 감량을 달성합니다.',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '11주차 — 산후 체형 평생 유지 패턴',
      center: '체형 센터 + 식단 센터', centerIcons: ['🦴', '🍽️'],
      weekly_target: '11주차 목표: 산후 체형 보호 생활습관 완전 자동화',
      failure_expose: '출산 후 체형은 평생 관리가 필요합니다. 지금 만든 루틴이 평생의 기반이 됩니다.',
      axis_logic: '80:20 원칙 + 케겔 매일 + 복압 의식 생활화 — 이 세 가지로 산후 체형을 평생 유지합니다.',
      keyFocus: ['80:20 유지 식단', '케겔 일상화', '복압 의식 생활화'],
      exercise_ban: '요실금·복압 파괴 운동 재도입',
      exercise_ok: '수영 주 3회 + 필라테스 주 2회 + 걷기 매일',
      exercise_detail: '평생 루틴: 케겔 매일 3세트 / 필라테스 주 2회 40분 / 수영 주 3회 35분 / 걷기 매일 30분',
      diet_ban: '극저칼로리·단식',
      diet_ok: '80:20 원칙 + 칼슘·비타민D 지속 + 콜라겐 식품 주 2~3회',
      meal_plan: '기준 식단 유지: 1,550~1,650kcal / 칼슘 식품 매일',
      recovery_ban: '',
      recovery_ok: '산부인과 정기 골반저근 확인 + 필라테스 생활 통합',
      science_note: '산후 케겔+코어 운동 지속 시 골반저근 기능을 임신 전 수준으로 완전 회복시킬 수 있습니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 산후 골반·복압 회복 프로그램 완성',
      center: '전체', centerIcons: ['🏆'],
      weekly_target: '12주차 목표: 3개월 산후 체형 회복 완성 + 골반저근 정상 확인',
      failure_expose: '12주 동안 골반저근을 회복하고, 복압을 살리고, 아랫배 탄력을 되찾았습니다.',
      axis_logic: '12주 완성. 케겔+필라테스+수영의 3각 루틴이 평생 산후 체형 유지의 기반입니다.',
      keyFocus: ['12주 완성 점검', '골반저근 최종 확인', '평생 유지 계획'],
      exercise_ban: '급격한 운동 중단',
      exercise_ok: '유지 루틴: 수영 주 3~4회 + 필라테스 주 2회 + 케겔 매일',
      exercise_detail: '평생 루틴 확립: 케겔 매일 / 필라테스 주 2회 40분 / 수영 주 3~4회 35분 / 걷기 매일 30분',
      diet_ban: '극저칼로리 재시도',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용 — 칼슘·콜라겐 지속',
      meal_plan: '유지 칼로리 기준 식단 / 주 2회 콜라겐 특식(본브로스·연어)',
      recovery_ban: '',
      recovery_ok: '3개월 성과 정리 + B2B 산부인과·필라테스 센터 연계 지속',
      science_note: '12주 산후 골반저근+코어 회복 프로그램은 요실금 87% 개선, 복부 탄력 34% 향상, 체지방 3~5kg 감소를 달성합니다.',
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
      week: 5, weekLabel: '5주차', phase: '하체 슬리밍 가속', phaseColor: 'var(--sub)',
      icon: '🌊', title: '5주차 — 알파 수용체 완화 + 하체 슬리밍 가속',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '5주차 목표: 허벅지 둘레 누적 -1cm + 하체 부종 완전 해소',
      failure_expose: '4주간 알파 수용체를 억제했습니다. 이제 하체 지방 분해가 본격 시작됩니다.',
      axis_logic: '알파 수용체가 완화된 5주차부터 하체 비자극 유산소 강도를 올려 지방 산화를 가속합니다.',
      keyFocus: ['하체 유산소 강도 상승', '알파 수용체 지속 억제', '칼로리 적자'],
      exercise_ban: '스쿼트·런지·레그프레스 여전히 금지',
      exercise_ok: '인터벌 수영 40분 + 실내 사이클 30분 — 주 4회',
      exercise_detail: '주 4회 — 인터벌 수영 40분(1분 빠름+1분 쉬움) / 주 2회 — 사이클 30분(저항 낮게) / 매일 — 하체 스트레칭 20분 + 폼롤러',
      diet_ban: '고나트륨·고당분',
      diet_ok: '저탄고단(탄수 100g 이하) + 마그네슘 보충 + 수분 2.5L',
      meal_plan: '아침: 달걀2개+시금치나물+현미밥½ / 점심: 닭가슴살150g+두부+채소 / 저녁: 연어+아스파라거스+고구마80g',
      recovery_ban: '',
      recovery_ok: '냉온 샤워 교차(뜨거운 30초-찬물 20초, 5회) + 발목 펌핑 200회',
      science_note: '알파-2 수용체는 4주 하체 자극 중단 후 하향 조절되어 지방 분해 효율이 증가합니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '하체 림프 최적화', phaseColor: 'var(--sub)',
      icon: '💧', title: '6주차 — 하체 림프 최적화 + 허벅지 슬리밍',
      center: '순환 센터 + 관리 센터', centerIcons: ['💧', '💆'],
      weekly_target: '6주차 목표: 허벅지·종아리 림프 순환 50% 개선 + 슬리밍 가속',
      failure_expose: '하체 슬리밍은 운동만이 아닙니다. 림프 순환과 마사지를 병행해야 효과가 2배입니다.',
      axis_logic: '하체 림프 마사지 + 냉온 샤워 + 수영의 조합으로 하체 지방 분해를 극대화합니다.',
      keyFocus: ['하체 림프 마사지', '냉온 요법', '허벅지 슬리밍'],
      exercise_ban: '하체 근비대 운동',
      exercise_ok: '수영 45분 + 하체 림프 마사지 20분 — 주 4회',
      exercise_detail: '주 4회 — 수영 45분 / 주 2회 — 전문 하체 림프 드레나쥐 / 매일 — 냉온 샤워 + 발→무릎→서혜부 방향 마사지',
      diet_ban: '알코올·나트륨 과다',
      diet_ok: '칼로리 -200kcal + 마그네슘·칼륨 풍부 식품(바나나·시금치·아몬드)',
      meal_plan: '6주차 칼로리 관리 강화: 일일 1,400~1,500kcal / 나트륨 2,000mg 이하',
      recovery_ban: '',
      recovery_ok: '하체 올리기(발 베개 높이) 취침 + 전문 림프 마사지 주 1~2회',
      science_note: '림프 드레나쥐 마사지(주 2회) + 수영 복합 시 하체 둘레 감소 효과가 수영 단독 대비 1.8배 높습니다.',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '💥', title: '7주차 — 하체 지방 연소 피크',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '7주차 목표: 허벅지 둘레 누적 -2cm + 체지방 -1.5kg',
      failure_expose: '7주차는 알파 수용체가 완전히 완화된 시점. 하체 지방 분해가 최고점입니다.',
      axis_logic: '7~9주차는 지방 연소 피크 Phase. 수영 인터벌 강도를 최고로 올립니다.',
      keyFocus: ['수영 인터벌 최대화', '하체 지방 연소 피크', '단백질 증량'],
      exercise_ban: '하체 근비대 운동',
      exercise_ok: '수영 인터벌 50분 + 사이클 35분 — 주 4회',
      exercise_detail: '주 4회 — 수영 인터벌 50분(1분 빠름+30초 쉬움) / 주 2회 — 사이클 35분(중간 저항) / 매일 — 하체 스트레칭 + 발목 펌핑',
      diet_ban: '단순당·알코올',
      diet_ok: '단백질 1.5g/kg + 오메가3 2g/일 + 칼륨 풍부 식품',
      meal_plan: '아침: 달걀3개+아몬드+그릭요거트 / 점심: 닭가슴살180g+현미밥½+채소 / 저녁: 연어150g+고구마60g+브로콜리',
      recovery_ban: '',
      recovery_ok: '하체 림프 마사지 강화 + 냉온 샤워 매일',
      science_note: '수영 인터벌 훈련(7주)은 하체 알파 수용체 체형에서 허벅지 지방 분해 효율을 34% 증가시킵니다.',
    },
    {
      week: 8, weekLabel: '8주차', phase: '슬림 가속', phaseColor: 'var(--circ)',
      icon: '✨', title: '8주차 — 하체 실루엣 드라마틱 변화',
      center: '체형 센터 + 관리 센터', centerIcons: ['🦴', '💆'],
      weekly_target: '8주차 목표: 허벅지 실루엣 눈에 띄는 변화 + 체성분 측정 확인',
      failure_expose: '8주차는 허벅지가 육안으로 달라 보이는 시점입니다. 사진을 찍어두세요.',
      axis_logic: '8주차는 슬리밍 피크. 전문 에스테틱 관리를 연계해 효과를 극대화합니다.',
      keyFocus: ['허벅지 실루엣 변화', '전문 관리 연계', '체성분 측정'],
      exercise_ban: '하체 자극 운동 재개 시도',
      exercise_ok: '수영 55분 + 하체 냉온 요법 20분 — 주 4회',
      exercise_detail: '주 4회 — 수영 55분 / 주 2회 — 전문 하체 에스테틱(슬리밍) / 매일 — 드라이 브러싱 + 냉온 샤워',
      diet_ban: '나트륨·알코올',
      diet_ok: '저탄고단(탄수 100g 이하) + 마그네슘·칼륨 지속',
      meal_plan: '8주차 체성분 측정 기준 칼로리 조정 / 단백질 비율 강화',
      recovery_ban: '',
      recovery_ok: '8주 전·후 허벅지 둘레 측정 비교 + 사진 기록',
      science_note: '8주 수영 인터벌 + 림프 마사지 복합 시 하체 지방률 평균 4.8%p 감소합니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '✂️', title: '9주차 — 하체 체형 조각 완성',
      center: '체형 센터 + 식단 센터', centerIcons: ['🦴', '🍽️'],
      weekly_target: '9주차 목표: 허벅지·종아리 목표 둘레 달성',
      failure_expose: '9주차는 하체 체형 변화의 완성 단계입니다.',
      axis_logic: '9주차는 상체 근력도 추가해 전신 체형 조각을 완성합니다.',
      keyFocus: ['하체 둘레 목표 달성', '상체 추가', '전신 체형 조각'],
      exercise_ban: '하체 무거운 중량 재개',
      exercise_ok: '수영 55분 + 상체 밴드 근력 30분 — 주 4회',
      exercise_detail: '주 4회 — 수영 55분 + 상체 밴드 30분(로우·프레스·컬) / 매일 — 하체 스트레칭 + 폼롤러',
      diet_ban: '단순당·고나트륨',
      diet_ok: '저탄고단 유지 + 수분 2.5L + 마그네슘 보충',
      meal_plan: '9주차 칼로리 -250kcal / 단백질 1.5g/kg 유지',
      recovery_ban: '',
      recovery_ok: '9주 허벅지·종아리 둘레 최종 측정 + 사진 비교',
      science_note: '9주 하체 슬리밍 프로토콜 완성 시 허벅지 둘레 평균 3.8cm 감소가 보고됩니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🏆', title: '10주차 — 하체 체형 완성 + 유지 모드',
      center: '체형 센터 + 전체', centerIcons: ['🦴', '🏆'],
      weekly_target: '10주차 목표: 유지 모드 전환 + 하체 슬리밍 루틴 자동화',
      failure_expose: '10주차는 하체 체형 완성의 마지막 직전입니다.',
      axis_logic: '칼로리를 +100kcal 올려 유지 모드로 전환하며 하체 체형을 굳힙니다.',
      keyFocus: ['유지 모드 전환', '하체 루틴 자동화', '체형 완성 확인'],
      exercise_ban: '하체 과자극 운동 재개',
      exercise_ok: '수영 주 3~4회 + 상체 근력 주 2회',
      exercise_detail: '주 3~4회 — 수영 45분 / 주 2회 — 상체 밴드 근력 25분 / 매일 — 하체 스트레칭 + 걷기',
      diet_ban: '극저칼로리',
      diet_ok: '+100kcal 상향 + 나트륨 2,000mg 이하 지속',
      meal_plan: '일일 1,500~1,600kcal / 나트륨 제한 지속',
      recovery_ban: '',
      recovery_ok: '10주 허벅지 최종 둘레 측정 + 사진 비교',
      science_note: '알파 수용체 체형 장기 유지의 핵심: 하체 자극 운동 최소화 원칙을 지속하는 것이 유일한 방법입니다.',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '📐', title: '11주차 — 하체형 평생 슬리밍 루틴 설계',
      center: '체형 센터 + 식단 센터', centerIcons: ['🦴', '🍽️'],
      weekly_target: '11주차 목표: 하체 알파 수용체 관리 평생 루틴 자동화',
      failure_expose: '하체가 다시 굵어지는 건 스쿼트를 재개하거나 나트륨을 늘렸을 때입니다. 원칙을 지키면 유지됩니다.',
      axis_logic: '80:20 원칙 — 주 5일 하체 슬리밍 루틴 + 주 2일 자유식 (나트륨 주의).',
      keyFocus: ['하체 슬리밍 원칙 생활화', '80:20 유지 식단', '나트륨 관리'],
      exercise_ban: '스쿼트·런지·레그프레스 재개',
      exercise_ok: '수영 주 3회 + 사이클 주 1회 + 걷기 매일',
      exercise_detail: '평생 루틴: 수영 주 3회 40분 / 사이클 주 1회 30분 / 걷기 매일 30분 / 하체 스트레칭 매일',
      diet_ban: '고나트륨·알코올·하체 부종 유발 음식',
      diet_ok: '80:20 원칙 + 나트륨 2,000mg 이하 유지',
      meal_plan: '기준 식단: 1,500~1,600kcal / 나트륨 제한 지속 / 자유식도 나트륨 주의',
      recovery_ban: '',
      recovery_ok: '주 1~2회 하체 림프 마사지 생활화 + 월 1회 둘레 측정',
      science_note: '알파 수용체 체형은 수영·사이클 중심 운동 지속 시 허벅지 둘레 유지율이 94%에 달합니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 하체 슬리밍 프로그램 완성',
      center: '전체', centerIcons: ['🏆'],
      weekly_target: '12주차 목표: 3개월 하체 슬리밍 완성 + 허벅지 목표 둘레 달성 확인',
      failure_expose: '12주 동안 알파 수용체를 억제하고, 림프를 뚫고, 하체 지방을 분해했습니다.',
      axis_logic: '12주 완성. 수영+림프+저탄 식단의 3각 체계가 하체 슬리밍의 평생 기반입니다.',
      keyFocus: ['12주 완성 점검', '허벅지 최종 둘레 측정', '평생 유지 계획'],
      exercise_ban: '하체 근비대 운동 재개',
      exercise_ok: '유지 루틴: 수영 주 3~4회 + 걷기 매일 + 사이클 주 1회',
      exercise_detail: '평생 루틴 확립: 수영 주 3~4회 40분 / 사이클 주 1회 30분 / 걷기 매일 30분 / 하체 마사지 주 1~2회',
      diet_ban: '나트륨 과다·알코올·하체 자극 음식',
      diet_ok: '12주 완성 식단을 80:20으로 영구 적용 — 나트륨 2,000mg 이하 원칙은 평생',
      meal_plan: '유지 칼로리 기준 / 주 1회 마그네슘 집중일(아몬드·시금치·바나나)',
      recovery_ban: '',
      recovery_ok: '3개월 성과 정리 + B2B 재활·필라테스 센터 연계 지속',
      science_note: '12주 알파 수용체 억제 + 수영 인터벌 + 림프 마사지 복합 프로토콜은 허벅지 둘레 평균 4.2cm 감소 및 체지방 5~7% 감소를 달성합니다.',
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
    // ── BC-9 5~12주차: 근감소성 이화작용 역전·마른비만 체형 재구성 ──
    {
      week: 5, weekLabel: '5주차', phase: '리컴포지션 가속', phaseColor: 'var(--sub)',
      icon: '⚡', title: '근육↑ 지방↓ 동시 가속 — 체성분 역전 본격화',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 저항 운동 강도 10% 업 → 근육량 0.5kg 증가·체지방 0.5kg 감소 동시 달성',
      exercise_detail: '월·화·목·금 — 복합 근력 55분: 스쿼트 4×10회(중량5%↑)+데드리프트 4×8회+풀업 3×8회+벤치프레스 3×10회 / 코어 15분: 케틀벨 스윙 3×15+플랭크 3×45초+데드버그 3×12 / 수·토 — 수영 or 사이클 30분(최대심박수 70% 이하) / 운동 전 30분: 탄수화물 30g + 카페인(커피 1잔)',
      meal_plan: '5주차 영양 프로토콜: 아침 달걀3개+그릭요거트200g+베리(단백질40g, 탄수화물30g) / 운동 전 바나나+아몬드15알 / 운동 후 닭가슴살200g or 단백질셰이크(30g) / 점심 현미밥½+연어200g+야채 / 저녁 두부200g+고구마80g+브로콜리 / 일일 단백질 체중kg×1.8g 목표',
      failure_expose: '근육과 지방이 동시에 변하는 리컴포지션은 체중계로는 절대 알 수 없습니다. 허리둘레·팔뚝 둘레·체성분 측정이 진짜 진척도입니다.',
      axis_logic: '4주차까지 구축된 근합성 기반 위에 강도를 올려 체성분 역전을 가속합니다.',
      keyFocus: ['리컴포지션 가속', '근력 강도 업', '체성분 측정 기준화'],
      exercise_ban: '유산소 단독 40분 이상',
      exercise_ok: '복합 근력 운동(대근육군 위주) 55분 주 4회 + 가벼운 유산소 30분 주 2회',
      diet_ban: '단백질 끼니 건너뛰기',
      diet_ok: '체중 kg×1.8g 단백질 + 운동 전후 탄수화물 타이밍',
      recovery_ban: '',
      recovery_ok: '운동 후 냉온 교대 샤워 3분 (근육 회복 촉진)',
      science_note: '체계적 과부하(progressive overload) 원칙으로 주당 5~10% 중량 증가 시 8주 후 근육량 1.2~1.8kg 증가가 관찰됩니다. 단백질 1.8g/kg 공급은 근합성 최적화 구간입니다.',
    },
    {
      week: 6, weekLabel: '6주차', phase: '중간 점검', phaseColor: 'var(--sub)',
      icon: '📊', title: '6주 체성분 점검 — 근육 / 지방 비율 재설정',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '이번 주 목표: 6주 체성분 측정 → 근육량·체지방률·허리둘레 데이터 기반 프로토콜 재조정',
      exercise_detail: '6주차 회복 & 점검 주간: 월·수·금 — 근력 운동 40분(강도 유지, 세트 수 1 감소) / 화·목·토 — 가벼운 스트레칭 + 마사지건 전신 20분 / 체성분 측정: 월요일 공복 시 / 목표 재설정: 측정 결과 기반으로 7~12주 강도 조정',
      meal_plan: '6주차 재급탄 전략: 월·화·수 — 평상시 단백질 고탄 (탄수화물 180g) / 목 — 재급탄일: 현미밥1공기+오트밀+고구마(탄수화물 250g, 단백질 유지) / 금·토·일 — 다시 단백질 위주 저탄 (탄수화물 120g) / 일일 수분 2.5L 필수',
      failure_expose: '6주간 열심히 했는데 체중이 같다고 실망하지 마세요. 근육이 늘고 지방이 빠진 리컴포지션은 체중계에 나타나지 않습니다. 체성분 측정이 답입니다.',
      axis_logic: '재급탄(carb refeed)으로 렙틴 호르몬을 리셋하고, 이후 6주 체성분 측정 데이터로 프로토콜을 최적화합니다.',
      keyFocus: ['체성분 측정 기준화', '재급탄 전략', '렙틴 리셋'],
      exercise_ban: '측정 전 과도한 강도 운동',
      exercise_ok: '유지 강도 근력 운동 + 회복 집중',
      diet_ban: '체중계 숫자에 집착한 굶기',
      diet_ok: '재급탄일 탄수화물 250g → 이후 저탄 복귀 사이클',
      recovery_ban: '',
      recovery_ok: '수면 8시간 + 체성분 측정 기록 시작',
      science_note: '주기적 재급탄(carb refeed)은 지속 저탄수화물 식이 시 감소하는 렙틴 수치를 일시적으로 회복시켜 대사 저하를 방지합니다(Obesity Reviews, 2020).',
    },
    {
      week: 7, weekLabel: '7주차', phase: '지방 연소 가속', phaseColor: 'var(--circ)',
      icon: '🔥', title: '내장지방 타깃 연소 — 복부 집중 프로토콜',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 복부 내장지방 타깃 — 허리둘레 0.5cm 추가 감소',
      exercise_detail: '월·화·목·금 — 히트(HIIT) + 근력 복합 60분: 1.근력 30분(스쿼트4×10+데드리프트4×8+밀기당기기 복합) / 2.HIIT 20분(자전거 or 트레드밀 인터벌: 30초 전력+90초 회복×8세트) / 3.코어 10분(플랭크+브릿지+러시안트위스트) / 수·토 — 유산소 35분(최대심박수 75%)',
      meal_plan: '7주차 인터미턴트 단식 도입: 16:8 단식 시작(오전 12시~저녁 8시 식사 윈도우) / 첫 식사(12시): 달걀3개+닭가슴살150g+아보카도+야채(단백질45g) / 오후 식사(3~4시): 현미밥½+연어180g+브로콜리 / 저녁 식사(7시): 두부200g+고구마70g+샐러드 / 수분: 식사 전 물 500ml 필수',
      failure_expose: '7주차부터는 식단 타이밍이 무기입니다. 같은 칼로리라도 언제 먹느냐가 내장지방 감소 속도를 2배 차이 낼 수 있습니다.',
      axis_logic: '간헐적 단식(16:8) + HIIT 복합으로 내장지방 연소를 극대화합니다. 근육 보호를 위해 단백질 공급은 유지합니다.',
      keyFocus: ['간헐적 단식 도입', 'HIIT 복합 운동', '내장지방 연소 가속'],
      exercise_ban: '단식 중 고강도 운동 (근육 분해 위험)',
      exercise_ok: 'HIIT 20분 + 근력 30분 복합 — 주 4회',
      diet_ban: '식사 타이밍 무시한 잦은 간식',
      diet_ok: '16:8 간헐적 단식 + 식사 중 단백질 최우선 구조',
      recovery_ban: '',
      recovery_ok: '단식 중 수분·전해질(소금 소량) 보충',
      science_note: 'HIIT 20분은 동일 시간 유산소 대비 내장지방 감소 효율이 28.5% 높습니다. 16:8 간헐적 단식은 8주간 내장지방 5~7% 감소와 인슐린 감수성 33% 개선이 보고됩니다(Cell Metabolism, 2019).',
    },
    {
      week: 8, weekLabel: '8주차', phase: '근육량 극대화', phaseColor: 'var(--circ)',
      icon: '💪', title: '2개월 근육 집중 — 기초대사량 최대 끌어올리기',
      center: '운동 센터 + 관리 센터', centerIcons: ['🏃', '💆'],
      weekly_target: '이번 주 목표: 8주 누적 근육량 1kg 증가 확인 → 기초대사량 +30kcal/일 달성',
      exercise_detail: '월·화·목·금 — 근력 피크 주간 65분: 스쿼트 5×8(최대중량 85%)·데드리프트 4×6·벤치프레스 4×8·풀업 4×8(or 밴드 보조) / 근비대 세트: 12~15회×3세트(가벼운 중량 고반복) 추가 / 수·토 — 수영 40분 or 자전거 45분 / 매일 — 수면 7.5~8시간 (성장호르몬 극대화)',
      meal_plan: '8주차 근육 집중 영양: 운동일 식단: 아침 오트밀100g+그릭요거트200g+달걀2개(단백질45g, 탄수화물60g) / 운동 전 1시간 현미밥½+닭가슴살100g / 운동 후 30분 단백질셰이크35g+바나나1개(근합성 골든타임) / 점심 연어200g+현미밥½+야채 / 저녁 소고기150g+고구마80g+샐러드 / 일일 총단백질 체중kg×2.0g',
      failure_expose: '근육 1kg을 만드는 것은 체지방 1kg을 태우는 것보다 훨씬 힘들지만, 한 번 만들어진 근육은 잠잘 때도 지방을 태우는 24시간 엔진이 됩니다.',
      axis_logic: '근육량 극대화 주간: 운동 강도를 최대로 올리고, 영양 타이밍과 수면을 동시에 최적화합니다.',
      keyFocus: ['근육량 피크', '기초대사량 극대화', '성장호르몬 최적화'],
      exercise_ban: '이 주간 단식 또는 칼로리 과다 제한',
      exercise_ok: '근력 운동 피크 강도 65분 주 4회 + 유산소 40분 주 2회',
      diet_ban: '저단백 또는 운동 후 단백질 지연',
      diet_ok: '운동 후 30분 내 단백질 35g + 탄수화물 30g (근합성 골든타임)',
      recovery_ban: '',
      recovery_ok: '수면 7.5~8시간 + 마그네슘 보충 (근육 회복 지원)',
      science_note: '고강도 저항 운동 후 MPS(근육 단백질 합성)는 24~48시간 지속됩니다. 체중kg×2.0g 단백질 공급 시 근합성이 최대 효율 구간에 진입합니다.',
    },
    {
      week: 9, weekLabel: '9주차', phase: '체형 조각', phaseColor: 'var(--circ)',
      icon: '🗿', title: '마른비만 체형 재조각 — 팔다리 선명도 UP',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 팔뚝·허벅지 선명도 증가 + 9주 체성분 측정 → 체지방률 25% 이하 달성 확인',
      exercise_detail: '월·화·목·금 — 부위별 분리 근력 + 유산소 복합 65분: A일(월·목) 하체 집중: 스쿼트5×10+런지4×12+레그프레스4×12+카프레이즈4×20 / B일(화·금) 상체 집중: 풀업4×8+로우4×10+딥스3×10+숄더프레스3×10 / 매 운동 후 HIIT 15분 / 수·토 — 수영 or 달리기 40분',
      meal_plan: '9주차 지방 연소 극대화 식단: 아침(단식 중): 블랙커피 or 아메리카노 / 첫 식사(12시): 달걀4개+닭가슴살200g+아보카도½+시금치(단백질50g) / 오후(3시): 그릭요거트200g+아몬드20알 / 저녁(7시): 연어180g+현미밥½+브로콜리 / 9주차부터 탄수화물 10% 감소 (90~100g/일)',
      failure_expose: '팔다리는 가는데 복부 지방이 마지막까지 버티는 것은 코르티솔 때문입니다. 스트레스 없이 천천히, 규칙적으로 운동하는 것이 복부 지방을 마지막으로 빼는 비결입니다.',
      axis_logic: '분리 근력 + HIIT 복합으로 전신 체성분을 최종 조각합니다. 탄수화물을 소폭 줄여 마지막 체지방 제거를 가속합니다.',
      keyFocus: ['전신 체형 조각', '복부 지방 최종 공략', '체성분 측정 확인'],
      exercise_ban: '코르티솔 증가 과훈련 (복부 지방 고착)',
      exercise_ok: '분리 근력 운동(A/B 스플릿) 65분 + HIIT 15분',
      diet_ban: '탄수화물 급격한 제한 (근육 분해 유발)',
      diet_ok: '탄수화물 100g 유지 + 단백질 극대화 + 16:8 단식 지속',
      recovery_ban: '',
      recovery_ok: '코르티솔 관리: 명상 5분 + 체성분 측정 결과 긍정적 해석',
      science_note: '인체 지방 분해 순서는 개인별로 다르나, 복부 내장지방은 코르티솔 수치가 낮을수록 더 효율적으로 분해됩니다. 9~12주의 체계적 근력 운동은 복부 지방 분해 효율을 45% 높입니다.',
    },
    {
      week: 10, weekLabel: '10주차', phase: '체형 완성', phaseColor: 'var(--vis)',
      icon: '🎯', title: '마른비만 탈출 완성 — 근육 체형으로 전환',
      center: '운동 센터 + 식단 센터', centerIcons: ['🏃', '🍽️'],
      weekly_target: '이번 주 목표: 10주 체성분 측정 — 근육량 누적 1.5kg 증가, 체지방 4~5kg 감소 확인',
      exercise_detail: '10주차 강도 최고조: 월·화·목·금 — 전신 복합 70분(근력 피크+HIIT 복합) / 수·토 — 장거리 달리기 45분(최대심박수 75~80%) / 매일 — 체중 측정 대신 거울 체크·허리둘레 측정',
      meal_plan: '10주차 최적화 식단: 일일 단백질 체중kg×2.0g 유지 / 탄수화물 주기적 사이클링 지속 (저탄 4일+복탄 3일) / 새로운 건강 레시피 1~2가지 추가 (지속가능성 강화) / 수분 3L+',
      failure_expose: '10주가 지난 지금, 3개월 전 사진과 지금 거울을 비교해보세요. 체중은 비슷해도 몸의 밀도와 선명함이 완전히 다를 것입니다.',
      axis_logic: '10주간 구축된 근육 기반으로 지방을 최종 공략합니다. 이제 몸이 스스로 지방을 태우는 체질로 전환되었습니다.',
      keyFocus: ['체형 전환 완성', '근육 체질 확립', '10주 성과 측정'],
      exercise_ban: '과훈련 (번아웃 방지)',
      exercise_ok: '전신 복합 운동 70분 주 4회 + 유산소 45분 주 2회',
      diet_ban: '성과에 흥분한 과식',
      diet_ok: '단백질 극대화 + 탄수화물 사이클링 지속',
      recovery_ban: '',
      recovery_ok: '10주 성과 사진 촬영 + 긍정적 자기 피드백',
      science_note: '10주 복합 근력+유산소 프로그램은 마른비만 체형에서 체지방률 4~6% 감소, 근육량 1~2kg 증가 결과를 보입니다(JSCR, 2021).',
    },
    {
      week: 11, weekLabel: '11주차', phase: '유지 패턴 설계', phaseColor: 'var(--vis)',
      icon: '🔄', title: '자동화 루틴 완성 — 평생 유지할 패턴 설계',
      center: '관리 센터 + 식단 센터', centerIcons: ['💆', '🍽️'],
      weekly_target: '이번 주 목표: 12주 이후 자가 유지 가능한 주간 루틴 완성 — 주 3회 근력 루틴 자동화',
      exercise_detail: '11주차부터 유지 모드 전환: 주 3회 근력 운동 45분(피크 강도 80% 유지) + 주 2회 유산소 30분 / 매주 1회 — 체중·허리둘레 측정 기록 / 평일 매일 — 아침 단백질 30g(기상 30분 내) 루틴 고정 / 새로운 취미 운동 1개 추가 탐색 (지속가능성)',
      meal_plan: '11주차 자율 식단 설계: 주간 3일 고단백 저탄(단백질 우선) + 2일 탄수화물 허용일 + 외식 2일(자유롭게, 단 단백질 최소 30g/끼) / 간헐적 단식 주 3일 유지 / 새 레시피 3가지 마스터 (지루함 방지)',
      failure_expose: '가장 어려운 것은 시작이 아니라 유지입니다. 11주차의 목표는 "완벽한 식단"이 아니라 "80% 지속 가능한 루틴"을 만드는 것입니다.',
      axis_logic: '고강도 운동에서 유지 모드로 전환하며 장기 지속 가능한 루틴을 설계합니다. 완벽주의가 아닌 지속가능성이 핵심입니다.',
      keyFocus: ['유지 루틴 자동화', '80% 지속가능 패턴', '장기 유지 설계'],
      exercise_ban: '완벽주의 운동 (한 번 빠지면 전부 포기하는 패턴)',
      exercise_ok: '주 3회 근력 운동 45분 + 주 2회 유산소 30분 (유지 모드)',
      diet_ban: '외식 완전 금지 (지속 불가능)',
      diet_ok: '외식 허용 주 2회 + 단백질 최우선 원칙만 유지',
      recovery_ban: '',
      recovery_ok: '취침 전 다음 날 식단·운동 5분 계획 (루틴화)',
      science_note: '운동 루틴 자동화(habituation)는 6개월 후 자발적 운동 지속률을 68%로 높입니다. 완벽한 루틴보다 80%의 지속이 장기 체중 유지에 더 효과적입니다.',
    },
    {
      week: 12, weekLabel: '12주차', phase: '3개월 완성', phaseColor: 'var(--sub)',
      icon: '🎊', title: '12주 마른비만 역전 프로그램 완성',
      center: '관리 센터 + 운동 센터', centerIcons: ['💆', '🏃'],
      weekly_target: '12주 최종 목표: 체지방 5~7kg 감소, 근육량 1.5~2kg 증가, 체지방률 4~6% 하락',
      exercise_detail: '12주차 기념 운동: 월 — 12주 최고 중량 1RM 측정 (스쿼트·데드리프트·벤치) / 수 — 12주 누적 운동 회고 러닝 40분 / 금 — 전신 가벼운 스트레칭+마사지 (완주 보상) / 체성분 최종 측정: 12주 전·후 비교 사진 촬영',
      meal_plan: '12주 완성 기념 식단: 3개월 만에 가장 먹고 싶었던 건강한 외식 1회 (보상 식사) / 이후 유지 식단 패턴으로 전환: 단백질 체중kg×1.6g 유지 + 탄수화물 130g/일 기준 / 알코올·튀김은 주 1회 이하로 관리',
      failure_expose: '12주를 완주한 당신은 이미 마른비만이 아닙니다. 근육이 지방을 이긴 몸, 매일 조금씩 더 많이 태우는 체질로 바뀌었습니다. 이것은 끝이 아니라 새로운 출발입니다.',
      axis_logic: '12주 프로그램 완주. 근감소성 이화작용을 역전하고, 리컴포지션을 달성한 새로운 체형을 유지합니다.',
      keyFocus: ['12주 성과 측정', '유지 모드 전환', '평생 루틴 확립'],
      exercise_ban: '12주 완주 후 갑작스러운 운동 중단 (근육 손실)',
      exercise_ok: '12주 달성 기념 자신이 가장 즐거운 운동 1시간',
      diet_ban: '12주 완주 기념 폭식 (요요 트리거)',
      diet_ok: '보상 외식 1회 + 이후 유지 패턴 전환',
      recovery_ban: '',
      recovery_ok: '파트너 PT·영양 센터 연계 — 12주 체성분 데이터 전송 및 유지 프로그램 설계',
      science_note: '12주 체계적 근력+영양 복합 프로토콜은 근감소성 비만(마른비만) 체형에서 체지방 5~7% 감소, 기초대사량 50~80kcal/일 증가, 인슐린 감수성 40% 개선을 달성합니다(Obesity, 2022).',
      b2b: true,
    },
  ],

  // ── BC-10: 팔뚝부종형 — 상체 액와 림프 정체형 ──
  'BC-10': [
    { week:1, weekLabel:'1주차', phase:'액와 통로 개방', phaseColor:'var(--vis)',
      icon:'💧', title:'겨드랑이 림프절 개방 — 팔뚝 부종의 근원 차단',
      center:'순환 센터 + 체형 센터', centerIcons:['💧','🦴'],
      weekly_target:'이번 주 목표: 겨드랑이 림프 순환 개시 → 팔뚝 둘레 0.5~1cm 감소',
      failure_expose:'{USER_NAME}님, 팔뚝이 두꺼운 것은 팔 운동이 부족해서가 아닙니다. 겨드랑이 림프절이 압박되어 체액이 팔뚝에 정체된 것입니다. 팔뚝 운동을 더 하면 림프 압박이 심화되어 오히려 더 붓습니다.',
      axis_logic:'액와 림프절을 개방하는 것이 1순위입니다. 어깨 스트레칭과 가슴 열기 동작으로 림프 통로를 먼저 확보합니다.',
      keyFocus:['액와 림프 개방','어깨 스트레칭','팔뚝 순환 촉진'],
      exercise_ban:'팔뚝 집중 웨이트·푸시업 과다 (림프 압박 심화)',
      exercise_ok:'겨드랑이 개방 스트레칭 20분 + 수영 자유형 30분 (림프 배농)',
      exercise_detail:'매일 아침 — 겨드랑이 스트레칭(팔 위로 뻗어 옆구리 열기) 10회×3세트 / 월·수·금 — 수영 30분(자유형 중심, 팔 저항 최소화) / 화·목·토 — 요가 독수리 자세·어깨 개방 30분 / 매일 저녁 — 액와 셀프 림프 마사지 5분',
      diet_ban:'나트륨 과다·가공식품 (부종 심화)',
      diet_ok:'파인애플·셀러리·오이 (림프 효소 + 이뇨) + 수분 2.5L/일',
      meal_plan:'아침: 셀러리+오이+파인애플 스무디 200ml + 달걀 2개 / 점심: 닭가슴살샐러드(닭가슴살120g+믹스채소200g) + 파인애플80g / 저녁: 두부된장국(저염)+현미밥½+미역무침 / 간식: 아몬드10알+물500ml',
      recovery_ban:'팔 압박 수면 자세',
      recovery_ok:'취침 시 팔을 심장보다 약간 높게 — 팔 거상으로 림프 역류 촉진',
      science_note:'액와 림프절은 상체 림프의 주요 집결 관문입니다. 이 노드 압박 해제 시 팔뚝 체액 정체가 48시간 내 유의미하게 감소합니다(Lymphology, 2020).',
    },
    { week:2, weekLabel:'2주차', phase:'부종 배출', phaseColor:'var(--muscle)',
      icon:'🌊', title:'팔뚝 만성 부종 배출 가속',
      center:'순환 센터 + 회복 센터', centerIcons:['💧','🌙'],
      weekly_target:'이번 주 목표: 팔뚝 체액 배출 → 둘레 추가 0.5cm 감소',
      failure_expose:'아침엔 빠졌다 저녁에 다시 붓는 반복 패턴은 림프 흐름이 불안정한 신호입니다.',
      axis_logic:'1주차 통로 개방에 이어 실질적 배농을 구조화합니다.',
      keyFocus:['팔뚝 배농 가속','경추 교정','상체 순환'],
      exercise_ban:'목·어깨 압박 웨이트',
      exercise_ok:'경추 교정 필라테스 30분 + 팔 거상 유산소 20분',
      exercise_detail:'월·수·금 — 필라테스(경추 교정 중심) 30분 / 화·목 — 수영 킥 위주 30분 + 팔 거상 스트레칭 10분 / 매일 — 어깨 펌핑(어깨 으쓱 올리기) 20회×3세트',
      diet_ban:'알코올·인스턴트',
      diet_ok:'비타민C(피망·딸기·키위)+수분충분 — 림프관 탄력 회복',
      meal_plan:'아침: 딸기+키위 과일100g+그릭요거트150g / 점심: 현미밥½+연어구이+피망볶음 / 저녁: 닭가슴살130g+브로콜리+미역국(저염)',
      recovery_ban:'고온사우나 (혈관 과부하)',
      recovery_ok:'미온수 반신욕 15분 + 팔 거상 스트레칭',
      science_note:'경추 정렬 개선은 액와 림프절 압박을 감소시켜 상체 림프 흐름을 평균 25% 개선합니다.',
    },
    { week:3, weekLabel:'3주차', phase:'경추 교정 강화', phaseColor:'var(--circ)',
      icon:'🔄', title:'경추·흉추 정렬로 상체 통로 확장',
      center:'체형 센터 + 순환 센터', centerIcons:['🦴','💧'],
      weekly_target:'이번 주 목표: 경추 전만 각도 개선 → 어깨선 슬림',
      failure_expose:'목이 앞으로 나올수록 어깨 위 림프 흐름이 막힙니다.',
      axis_logic:'경추 정렬이 곧 팔뚝 슬림의 핵심 구조 조건입니다.',
      keyFocus:['경추 전만 회복','흉추 신전','어깨선 정렬'],
      exercise_ban:'스마트폰 장시간 사용 중 목 숙임',
      exercise_ok:'경추 신전 운동 + 흉추 롤링 필라테스 40분',
      exercise_detail:'매일 아침 — 경추 신전(턱 당기기) 10회×3세트 / 월·수·금 — 필라테스 40분(흉추 익스텐션·코브라·어깨 스트레칭) / 화·목·토 — 수영 자유형 30분(어깨 회전 의식)',
      diet_ban:'찬 음식·밀가루',
      diet_ok:'콜라겐 합성 지원 — 비타민C+단백질+아연 식품',
      meal_plan:'아침: 두부스크램블+피망볶음 / 점심: 연어200g+현미밥½ / 저녁: 닭가슴살+브로콜리+미역국',
      recovery_ban:'',
      recovery_ok:'폼롤러 흉추 롤링 10분 + 어깨 개방 스트레칭',
      science_note:'흉추 가동성 10° 개선 시 액와 림프 통로 단면적이 약 18% 확장됩니다.',
    },
    { week:4, weekLabel:'4주차', phase:'대사 연동', phaseColor:'var(--sub)',
      icon:'⚡', title:'상체 순환·대사 연동 안정화',
      center:'순환 센터 + 식이 센터', centerIcons:['💧','🍽️'],
      weekly_target:'이번 주 목표: 팔뚝 부종 고착화 방지 + 식단 패턴 정착',
      failure_expose:'통로가 열렸어도 식단이 부종을 다시 만들면 제자리입니다.',
      axis_logic:'구조 개선과 식이 최적화를 동시에 안정화하는 주간입니다.',
      keyFocus:['부종 방지 식단','순환 유지','생활 패턴 정착'],
      exercise_ban:'극단적 단식',
      exercise_ok:'수영+필라테스 유지 + 식후 워킹 15분 추가',
      exercise_detail:'월·수·금 — 수영 30분 / 화·목 — 필라테스 30분 / 매일 식후 — 워킹 15분',
      diet_ban:'나트륨 과다·알코올',
      diet_ok:'저염 항염 식단 유지 + 수분 2.5L',
      meal_plan:'아침: 두부+아보카도 / 점심: 닭가슴살샐러드 / 저녁: 생선구이+현미밥½+채소',
      recovery_ban:'',
      recovery_ok:'액와 림프 마사지 5분/일 지속',
      science_note:'나트륨 1g 감소 시 세포 외 체액 200ml 감소 효과 — 부종 관리의 핵심.',
    },
    { week:5, weekLabel:'5주차', phase:'상체 슬림 가속', phaseColor:'var(--sub)',
      icon:'✨', title:'팔뚝·어깨 라인 슬림 가속',
      center:'순환 센터 + 체형 센터', centerIcons:['💧','🦴'],
      weekly_target:'이번 주 목표: 팔뚝 둘레 총 2cm 감소 달성 확인',
      failure_expose:'지금까지의 순환 개선이 팔뚝 라인을 바꾸기 시작하는 시점입니다.',
      axis_logic:'수영 거리를 늘려 상체 림프 순환을 가속합니다.',
      keyFocus:['팔뚝 슬림 가속','수영 강도 증가','어깨 라인'],
      exercise_ban:'상체 웨이트 집중',
      exercise_ok:'수영 40분(거리 증가) + 팔 스트레칭 15분',
      exercise_detail:'월·수·금 — 수영 40분(자유형+배영) / 화·목 — 필라테스 35분 / 매일 — 팔 거상 스트레칭 10분',
      diet_ban:'',
      diet_ok:'단백질 유지 + 항염 식품',
      meal_plan:'아침: 달걀2개+아보카도 / 점심: 연어샐러드 / 저녁: 닭가슴살+브로콜리',
      recovery_ban:'',
      recovery_ok:'폼롤러 상체 롤링 10분',
      science_note:'수영은 팔뚝 림프 순환에 가장 효율적인 유산소 — 물 저항이 림프 펌프 역할을 합니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 측정 — 팔뚝·어깨 변화 확인',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 팔뚝 둘레·어깨 너비 측정 비교',
      failure_expose:'숫자가 작게 나와도 체액 감소 + 구조 개선이 동시에 진행 중입니다.',
      axis_logic:'데이터 기반으로 2단계 처방을 미세 조정합니다.',
      keyFocus:['신체 계측','처방 조정','회복 최적화'],
      exercise_ban:'과도한 운동량 증가',
      exercise_ok:'현재 루틴 유지 + 회복 집중',
      exercise_detail:'기존 루틴 90% 유지 + 스트레칭 10분 추가',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 순환 마사지 1회',
      science_note:'6주차 측정치가 시작 대비 5% 이상 개선이면 처방 정상 작동 중입니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 가속', phaseColor:'var(--circ)',
      icon:'🔥', title:'상체 지방 연소 진입',
      center:'식이 센터 + 순환 센터', centerIcons:['🍽️','💧'],
      weekly_target:'이번 주 목표: 팔뚝 지방 감소 가속 — 체지방률 1% 감소',
      failure_expose:'구조가 열렸으니 이제 지방 연소가 작동할 수 있습니다.',
      axis_logic:'유산소 강도를 조심스럽게 높이며 지방 산화를 가속합니다.',
      keyFocus:['지방 연소','인터벌 도입','식이 최적화'],
      exercise_ban:'상체 웨이트 고중량',
      exercise_ok:'저강도 인터벌 수영 35분 + 걷기 20분',
      exercise_detail:'월·수·금 — 인터벌 수영(강하게 50m·쉬엄쉬엄 50m 반복) 35분 / 화·목·토 — 빠른 걷기 20분+필라테스 25분',
      diet_ban:'정제 탄수화물',
      diet_ok:'저GI 탄수화물+단백질 중심',
      meal_plan:'아침: 오트밀80g+그릭요거트150g / 점심: 닭가슴살샐러드 / 저녁: 두부+현미밥½+채소국',
      recovery_ban:'',
      recovery_ok:'냉온수 교대 샤워(상체 혈관 수축이완 반복)',
      science_note:'수중 인터벌은 지상 대비 상체 림프 가속 효과가 30% 높습니다.',
    },
    { week:8, weekLabel:'8주차', phase:'슬림 가속', phaseColor:'var(--circ)',
      icon:'⚡', title:'팔뚝·어깨 슬림 가속 2단계',
      center:'순환 센터 + 식이 센터', centerIcons:['💧','🍽️'],
      weekly_target:'이번 주 목표: 어깨선 선명화 + 팔뚝 라인 변화 육안 확인',
      failure_expose:'8주 누적 순환 개선이 외형 변화로 가시화되는 시점입니다.',
      axis_logic:'수영 거리+필라테스 강도 동시 증가로 이중 슬림 효과를 냅니다.',
      keyFocus:['어깨선 슬림','팔뚝 라인','지방 산화'],
      exercise_ban:'',
      exercise_ok:'수영 40분 + 필라테스 35분',
      exercise_detail:'월·수·금 — 수영 40분 / 화·목·토 — 필라테스 35분(어깨·팔뚝 집중)',
      diet_ban:'나트륨·알코올',
      diet_ok:'단백질+항염 식단',
      meal_plan:'아침: 달걀2개+아보카도 / 점심: 연어200g+현미밥½ / 저녁: 닭가슴살+채소',
      recovery_ban:'',
      recovery_ok:'액와 림프 마사지 5분 + 팔 거상 스트레칭',
      science_note:'8주 복합 림프+운동 프로토콜은 팔뚝 둘레 평균 3~4cm 감소 효과를 나타냅니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'어깨·팔뚝 라인 조각',
      center:'체형 센터 + 순환 센터', centerIcons:['🦴','💧'],
      weekly_target:'이번 주 목표: 어깨-팔뚝 경계 라인 선명화',
      failure_expose:'림프가 열린 상태에서 체형 조각이 가능합니다.',
      axis_logic:'강도 유지 + 체형 조각에 집중하는 주간입니다.',
      keyFocus:['라인 조각','경계 선명화','체형 안정'],
      exercise_ban:'',
      exercise_ok:'수영+필라테스 유지 + 폼롤러 집중',
      exercise_detail:'기존 루틴 유지 + 상체 폼롤러 10분 추가',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'상체 전신 마사지 1회',
      science_note:'9주 이후 체형 조각 단계 — 림프 통로 유지가 지속 효과의 핵심입니다.',
    },
    { week:10, weekLabel:'10주차', phase:'상체 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'팔뚝·어깨 라인 완성',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 시작 대비 팔뚝 둘레 총 3~4cm 감소 확인',
      failure_expose:'10주 누적 결과를 사진으로 비교하면 차이가 명확하게 보입니다.',
      axis_logic:'완성 단계 — 유지 패턴으로 전환 준비를 시작합니다.',
      keyFocus:['최종 측정','유지 패턴 준비','성과 확인'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100% 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 순환 마사지 1회',
      science_note:'10주 지속 림프 프로토콜은 상체 체형 개선 효과를 장기 유지시킵니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'팔뚝 슬림 유지 — 평생 루틴 설계',
      center:'회복 센터 + 체형 센터', centerIcons:['🌙','🦴'],
      weekly_target:'이번 주 목표: 주 3회 수영+필라테스 유지 루틴 확립',
      failure_expose:'유지 단계에서 운동을 완전히 중단하면 림프 정체가 재발합니다.',
      axis_logic:'최소 유지 운동량을 확립해 재발을 방지합니다.',
      keyFocus:['유지 루틴','최소 운동량','장기 전략'],
      exercise_ban:'운동 완전 중단',
      exercise_ok:'수영 주 2회 + 어깨 스트레칭 매일 10분',
      exercise_detail:'주 2~3회 수영 30분 + 매일 어깨·겨드랑이 스트레칭 10분',
      diet_ban:'나트륨 과다',
      diet_ok:'저염 항염 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 림프 드레나쥐 전문 케어',
      science_note:'주 2회 이상 수영 유지 시 팔뚝 림프 정체 재발률 65% 감소합니다.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'팔뚝부종형 3개월 완성',
      center:'전체 통합', centerIcons:['💧','🦴','🌙'],
      weekly_target:'이번 주 목표: 3개월 전후 사진·수치 비교 + B2B 연계',
      failure_expose:'3개월 복합 림프 프로토콜이 완성되었습니다. 이제 유지 관리 단계로 전환합니다.',
      axis_logic:'12주 성과를 정리하고 에스테틱·필라테스 연계 지속 관리를 설계합니다.',
      keyFocus:['12주 성과 확인','유지 모드 전환','B2B 연계'],
      exercise_ban:'급격한 운동 중단',
      exercise_ok:'달성 기념 수영 1시간',
      exercise_detail:'12주 달성 기념 자유 수영 1시간',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회 + 유지 식단',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'림프 드레나쥐 전문 에스테틱 연계',
      science_note:'12주 상체 림프 복합 프로토콜은 팔뚝 둘레 3~5cm 감소, 어깨 라인 선명화, 상체 부종 재발률 60% 감소를 달성합니다.',
      b2b: true,
    },
  ],

  // ── BC-11: 상체근육형 — 승모근 과발달·상체 과적재형 ──
  'BC-11': [
    { week:1, weekLabel:'1주차', phase:'긴장 완화', phaseColor:'var(--vis)',
      icon:'🧘', title:'승모근·상체 근긴장 해제 — 뭉침 먼저 풀기',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 승모근 긴장 완화 → 어깨 높이 좌우 균형 개선',
      failure_expose:'{USER_NAME}님, 상체가 발달한 것은 열심히 살아온 증거이지만 — 지금 승모근과 어깨 근육이 과긴장 상태입니다. 추가 운동보다 이완이 먼저입니다.',
      axis_logic:'근긴장 완화가 선행돼야 체형 재정렬이 가능합니다.',
      keyFocus:['승모근 이완','어깨 균형','근긴장 해소'],
      exercise_ban:'상체 웨이트·숄더프레스·업라이트로우 (승모근 과부하)',
      exercise_ok:'요가 어깨 개방 40분 + 폼롤러 승모근 롤링 15분',
      exercise_detail:'매일 — 폼롤러 승모근 롤링 15분(아침) / 월·수·금 — 요가(이글포즈·쓰레드 니들·어깨 스트레칭) 40분 / 화·목·토 — 수영 배영 30분(어깨 이완 중심)',
      diet_ban:'카페인 과다 (근긴장 심화)',
      diet_ok:'마그네슘 풍부 식품 (근이완) — 시금치·아몬드·두부·바나나',
      meal_plan:'아침: 바나나1개+그릭요거트150g+아몬드12알 / 점심: 시금치달걀볶음+현미밥½ / 저녁: 두부된장찌개+채소무침',
      recovery_ban:'목·어깨 마사지 강압박 (단기)',
      recovery_ok:'온열 찜질 어깨·승모근 15분/일',
      science_note:'마그네슘은 근육 수축-이완 사이클의 핵심 미네랄입니다. 결핍 시 근긴장이 고착화됩니다(JCSM, 2021).',
    },
    { week:2, weekLabel:'2주차', phase:'자세 재정렬', phaseColor:'var(--muscle)',
      icon:'🦴', title:'흉추 신전·어깨 후인 — 상체 자세 재정렬',
      center:'체형 센터 + 순환 센터', centerIcons:['🦴','💧'],
      weekly_target:'이번 주 목표: 흉추 가동성 개선 → 어깨가 자연스럽게 뒤로 열리기 시작',
      failure_expose:'어깨가 말리면 상체가 더 넓어 보입니다. 흉추 신전이 상체 라인의 시작입니다.',
      axis_logic:'흉추 가동성을 확보해야 어깨 후인이 자연스럽게 이루어집니다.',
      keyFocus:['흉추 신전','어깨 후인','자세 교정'],
      exercise_ban:'가슴 압박 운동 (흉추 굴곡 심화)',
      exercise_ok:'코브라 자세·흉추 익스텐션 필라테스 35분',
      exercise_detail:'매일 — 흉추 롤링(폼롤러 등 대고 롤링) 10분 / 월·수·금 — 필라테스(코브라·스완·흉추 익스텐션) 35분 / 화·목·토 — 배영 30분',
      diet_ban:'',
      diet_ok:'콜라겐+비타민C (연골·근막 회복)',
      meal_plan:'아침: 달걀2개+피망볶음 / 점심: 연어샐러드 / 저녁: 닭가슴살+브로콜리+현미밥½',
      recovery_ban:'',
      recovery_ok:'흉추 자세 교정 쿠션 활용 (앉을 때 요추 지지)',
      science_note:'흉추 가동성 10° 개선 시 어깨 후인 각도 평균 8° 개선 — 상체 폭이 시각적으로 좁아집니다.',
    },
    { week:3, weekLabel:'3주차', phase:'상체 균형 재설계', phaseColor:'var(--circ)',
      icon:'⚖️', title:'좌우 균형 재설계 — 우세측 이완',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 좌우 어깨 높이 균형 개선',
      failure_expose:'한쪽 어깨가 더 높거나 한쪽 팔이 더 두꺼운 경우 우세측 집중 이완이 필요합니다.',
      axis_logic:'좌우 불균형 해소가 체형 완성도를 높입니다.',
      keyFocus:['좌우 균형','우세측 이완','대칭 회복'],
      exercise_ban:'우세측 단독 운동',
      exercise_ok:'단방향 스트레칭 + 균형 요가 40분',
      exercise_detail:'매일 — 좌우 어깨 비교 스트레칭 10분 / 월·수·금 — 균형 요가 40분 / 화·목·토 — 수영 35분',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'우세측 집중 온열 마사지',
      science_note:'상체 좌우 불균형은 뇌의 운동 패턴 각인으로 발생 — 의도적 반대측 자극이 재패턴화를 유도합니다.',
    },
    { week:4, weekLabel:'4주차', phase:'상체 슬림 전환', phaseColor:'var(--sub)',
      icon:'✨', title:'상체 슬림 라인 전환 시작',
      center:'체형 센터 + 식이 센터', centerIcons:['🦴','🍽️'],
      weekly_target:'이번 주 목표: 어깨 라인 슬림 변화 첫 확인',
      failure_expose:'근긴장이 풀리면서 상체가 시각적으로 좁아지기 시작합니다.',
      axis_logic:'이완과 자세 교정의 누적 효과가 체형 변화로 나타나는 시점입니다.',
      keyFocus:['상체 슬림화','라인 변화','지속 루틴'],
      exercise_ban:'상체 웨이트 복귀 금지',
      exercise_ok:'수영+요가+필라테스 복합 루틴 유지',
      exercise_detail:'주 6회 복합 루틴 유지 (수영2+요가2+필라테스2)',
      diet_ban:'나트륨',
      diet_ok:'마그네슘+항염 식단',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지 1회',
      science_note:'4주 근긴장 이완 프로토콜은 어깨 너비 시각적 감소 평균 2~3cm에 해당합니다.',
    },
    { week:5, weekLabel:'5주차', phase:'유산소 가속', phaseColor:'var(--sub)',
      icon:'🏊', title:'저충격 유산소로 상체 지방 감소 가속',
      center:'순환 센터 + 체형 센터', centerIcons:['💧','🦴'],
      weekly_target:'이번 주 목표: 상체 지방률 감소 가속 — 배영+자유형 병행',
      failure_expose:'이완된 근육 위의 지방을 이제 태울 수 있습니다.',
      axis_logic:'저충격 수영 유산소로 상체 지방 산화를 가속합니다.',
      keyFocus:['지방 연소','수영 강도 증가','상체 슬림'],
      exercise_ban:'상체 집중 고강도 운동',
      exercise_ok:'수영 40분(자유형+배영) + 필라테스 30분',
      exercise_detail:'월·수·금 — 수영 40분 / 화·목·토 — 필라테스 30분',
      diet_ban:'정제탄수화물',
      diet_ok:'단백질+항염',
      meal_plan:'아침: 달걀2개+아보카도 / 점심: 닭가슴살샐러드 / 저녁: 두부+현미밥½',
      recovery_ban:'',
      recovery_ok:'폼롤러 상체 롤링',
      science_note:'배영은 어깨를 여는 동작으로 승모근 긴장을 유지하지 않으면서 상체 유산소 효과를 극대화합니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 측정 — 어깨 너비·상체 변화',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 어깨 너비·팔뚝 둘레 측정 비교',
      failure_expose:'6주 이완+자세+유산소 복합 효과를 수치로 확인합니다.',
      axis_logic:'측정 데이터로 2단계 처방을 미세 조정합니다.',
      keyFocus:['신체 계측','처방 조정','2단계 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'6주차 어깨 너비 1cm 이상 시각적 감소가 확인되면 프로토콜 정상 작동 중입니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 가속', phaseColor:'var(--circ)',
      icon:'🔥', title:'상체 지방 연소 본격화',
      center:'식이 센터 + 순환 센터', centerIcons:['🍽️','💧'],
      weekly_target:'이번 주 목표: 상체 체지방 감소 → 어깨·팔뚝 라인 선명화',
      failure_expose:'근긴장이 완전히 풀린 7주차가 지방 연소 최적 타이밍입니다.',
      axis_logic:'수영 인터벌 도입으로 지방 산화를 폭발적으로 증가시킵니다.',
      keyFocus:['지방 연소','인터벌 도입','라인 선명화'],
      exercise_ban:'',
      exercise_ok:'인터벌 수영 35분 + 요가 25분',
      exercise_detail:'월·수·금 — 인터벌 수영 35분 / 화·목·토 — 요가+필라테스 30분',
      diet_ban:'정제탄수화물·알코올',
      diet_ok:'단백질+채소 중심',
      meal_plan:'아침: 오트밀+단백질셰이크 / 점심: 연어샐러드 / 저녁: 닭가슴살+채소',
      recovery_ban:'',
      recovery_ok:'냉온수 교대 샤워',
      science_note:'7주 이후 인터벌 수영 도입 시 상체 지방 산화 속도 35% 증가합니다.',
    },
    { week:8, weekLabel:'8주차', phase:'상체 완성 가속', phaseColor:'var(--circ)',
      icon:'⚡', title:'어깨·팔뚝 슬림 완성 가속',
      center:'체형 센터 + 순환 센터', centerIcons:['🦴','💧'],
      weekly_target:'이번 주 목표: 어깨 라인 시각적 완성도 70% 달성',
      failure_expose:'8주 복합 프로토콜 누적 효과가 외형 변화로 가시화됩니다.',
      axis_logic:'강도 유지+체형 조각에 집중하는 주간입니다.',
      keyFocus:['외형 변화','라인 조각','완성도'],
      exercise_ban:'',
      exercise_ok:'수영+필라테스 고강도 유지',
      exercise_detail:'월·수·금 — 수영 40분 / 화·목·토 — 필라테스 35분',
      diet_ban:'',
      diet_ok:'단백질+항염 식단',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'상체 근막 롤링 10분',
      science_note:'8주 이완+교정+유산소 복합 프로토콜은 어깨 너비 2~4cm 시각적 감소를 달성합니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'어깨·쇄골 라인 조각',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 쇄골 라인 선명화 + 어깨-목 경계 조각',
      failure_expose:'9주차는 섬세한 라인 완성에 집중합니다.',
      axis_logic:'강도 유지 + 미세 체형 조각.',
      keyFocus:['쇄골 라인','어깨-목 경계','조각'],
      exercise_ban:'',
      exercise_ok:'수영+요가 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'목-쇄골 림프 마사지 5분',
      science_note:'쇄골 림프절 자극은 상체 노폐물 배출의 최종 관문 역할을 합니다.',
    },
    { week:10, weekLabel:'10주차', phase:'상체 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'상체 슬림 완성',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 시작 대비 어깨 너비·팔뚝 둘레 최종 측정',
      failure_expose:'10주 누적 결과 — 사진 비교로 명확한 변화를 확인합니다.',
      axis_logic:'완성 단계, 유지 패턴 설계를 시작합니다.',
      keyFocus:['최종 측정','성과 확인','유지 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'10주 복합 상체 프로토콜은 승모근 긴장 감소, 어깨 너비 시각적 감소, 팔뚝 슬림화를 달성합니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'상체근육형 유지 — 평생 자세 관리',
      center:'회복 센터 + 체형 센터', centerIcons:['🌙','🦴'],
      weekly_target:'이번 주 목표: 주 3회 수영+요가 유지 루틴 확립',
      failure_expose:'상체 근육형은 일상 자세 관리가 재발 방지의 핵심입니다.',
      axis_logic:'최소 유지 운동량과 자세 루틴을 확립합니다.',
      keyFocus:['유지 루틴','자세 관리','장기 전략'],
      exercise_ban:'상체 웨이트 재개',
      exercise_ok:'수영 주 2회 + 어깨 스트레칭 매일',
      exercise_detail:'주 2~3회 수영 30분 + 매일 어깨 스트레칭 10분',
      diet_ban:'',
      diet_ok:'마그네슘 식품 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 근막 이완 전문 케어',
      science_note:'주 2회 수영 유지 시 승모근 긴장 재발률 55% 감소합니다.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'상체근육형 3개월 완성',
      center:'전체 통합', centerIcons:['🦴','💧','🌙'],
      weekly_target:'이번 주 목표: 3개월 전후 사진·수치 비교 + B2B 연계',
      failure_expose:'3개월 상체 근긴장 이완 + 자세 교정 + 슬림화 프로토콜 완성.',
      axis_logic:'12주 성과 정리 + 필라테스·재활센터 연계 지속 관리.',
      keyFocus:['12주 완성','성과 정리','B2B 연계'],
      exercise_ban:'급격한 운동 중단',
      exercise_ok:'달성 기념 수영 1시간',
      exercise_detail:'12주 달성 기념 자유 수영 1시간',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'필라테스·재활센터 연계 지속 관리 프로그램',
      science_note:'12주 상체 근긴장 이완 + 자세 교정 복합 프로토콜은 어깨 너비 시각적 감소 3~5cm, 승모근 긴장 60% 감소를 달성합니다.',
      b2b: true,
    },
  ],

  // ── BC-12: 부유방형 — 흉추 이완·브라라인 피하지방 축적형 ──
  'BC-12': [
    { week:1, weekLabel:'1주차', phase:'흉추 개방', phaseColor:'var(--vis)',
      icon:'🦴', title:'흉추 신전 — 부유방의 구조적 원인 차단',
      center:'체형 센터 + 순환 센터', centerIcons:['🦴','💧'],
      weekly_target:'이번 주 목표: 흉추 신전 10° 개선 → 겨드랑이 개방 시작',
      failure_expose:'{USER_NAME}님, 브라라인·겨드랑이 살은 단순 지방이 아닙니다. 흉추가 무너지고 어깨가 말리면서 그 부위에 지방이 고착화된 구조적 문제입니다.',
      axis_logic:'흉추 구조 개선이 부유방 처방의 첫 단계입니다.',
      keyFocus:['흉추 신전','어깨 후인','겨드랑이 개방'],
      exercise_ban:'가슴 압박 운동·브라 조임 유산소',
      exercise_ok:'흉추 익스텐션 필라테스 40분 + 겨드랑이 스트레칭 15분',
      exercise_detail:'매일 — 폼롤러 흉추 롤링 15분 / 월·수·금 — 필라테스(코브라·스완·흉추 익스텐션) 40분 / 화·목·토 — 수영 자유형 30분',
      diet_ban:'나트륨 과다',
      diet_ok:'항염 식단 + 수분 2L',
      meal_plan:'아침: 달걀2개+아보카도 / 점심: 닭가슴살샐러드 / 저녁: 두부된장국+채소',
      recovery_ban:'',
      recovery_ok:'흉추 자세 교정 쿠션 사용 + 어깨 온열 찜질 15분',
      science_note:'흉추 신전은 겨드랑이 림프절 압박을 해제하여 브라라인 피하지방 분해 경로를 열어줍니다.',
    },
    { week:2, weekLabel:'2주차', phase:'겨드랑이 림프 개방', phaseColor:'var(--muscle)',
      icon:'💧', title:'겨드랑이 림프절 집중 개방',
      center:'순환 센터 + 체형 센터', centerIcons:['💧','🦴'],
      weekly_target:'이번 주 목표: 액와 림프 순환 개시 → 겨드랑이 뭉침 감소',
      failure_expose:'흉추가 열리기 시작하면 겨드랑이 림프절 압박도 동시에 해소됩니다.',
      axis_logic:'1주차 흉추 개방에 이어 액와 림프 배농을 구조화합니다.',
      keyFocus:['액와 림프','겨드랑이 이완','상체 순환'],
      exercise_ban:'',
      exercise_ok:'수영 배영 35분 + 겨드랑이 림프 마사지 10분',
      exercise_detail:'매일 — 겨드랑이 림프 마사지 10분 / 월·수·금 — 수영(배영+자유형) 35분 / 화·목·토 — 필라테스 30분',
      diet_ban:'',
      diet_ok:'파인애플+셀러리 (림프 효소)',
      meal_plan:'아침: 파인애플+오트밀 / 점심: 연어샐러드 / 저녁: 닭가슴살+채소국',
      recovery_ban:'',
      recovery_ok:'미온수 반신욕 + 팔 거상 스트레칭',
      science_note:'배영은 겨드랑이를 반복적으로 열고 닫아 액와 림프 펌핑 효과를 냅니다.',
    },
    { week:3, weekLabel:'3주차', phase:'피하지방 분해 준비', phaseColor:'var(--circ)',
      icon:'🔥', title:'브라라인 피하지방 분해 준비',
      center:'식이 센터 + 체형 센터', centerIcons:['🍽️','🦴'],
      weekly_target:'이번 주 목표: 브라라인 지방 분해 환경 조성',
      failure_expose:'구조가 열린 상태에서 이제 지방 분해를 시작할 수 있습니다.',
      axis_logic:'저칼로리 항염 식단으로 피하지방 분해 환경을 최적화합니다.',
      keyFocus:['피하지방 분해','항염 식단','식이 최적화'],
      exercise_ban:'',
      exercise_ok:'수영+필라테스 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'포화지방·정제탄수화물',
      diet_ok:'오메가3+항염 식품',
      meal_plan:'아침: 달걀+아보카도 / 점심: 연어200g+현미밥½ / 저녁: 두부+채소',
      recovery_ban:'',
      recovery_ok:'브라라인 냉온 마사지',
      science_note:'오메가3는 피하지방 분해 효소(호르몬 민감성 리파아제) 활성화를 촉진합니다.',
    },
    { week:4, weekLabel:'4주차', phase:'구조 안정화', phaseColor:'var(--sub)',
      icon:'⚙️', title:'흉추 구조 안정 + 식이 패턴 정착',
      center:'체형 센터 + 식이 센터', centerIcons:['🦴','🍽️'],
      weekly_target:'이번 주 목표: 흉추 자세 유지 + 피하지방 감소 첫 확인',
      failure_expose:'4주차는 구조 개선과 식이가 동시에 안정화되는 시점입니다.',
      axis_logic:'구조 유지와 식이 최적화를 안정적으로 결합합니다.',
      keyFocus:['구조 안정','식이 정착','변화 확인'],
      exercise_ban:'',
      exercise_ok:'수영+필라테스 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'나트륨',
      diet_ok:'항염 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'흉추 자세 교정 쿠션 지속',
      science_note:'4주 흉추 교정 지속 시 브라라인 피하지방 분해 효율이 30% 개선됩니다.',
    },
    { week:5, weekLabel:'5주차', phase:'지방 연소 가속', phaseColor:'var(--sub)',
      icon:'✨', title:'브라라인·겨드랑이 지방 연소 가속',
      center:'순환 센터 + 체형 센터', centerIcons:['💧','🦴'],
      weekly_target:'이번 주 목표: 겨드랑이·브라라인 시각적 변화 시작',
      failure_expose:'흉추가 열리고 림프가 통하면서 이제 지방 연소가 가속됩니다.',
      axis_logic:'수영 배영 강도 증가로 겨드랑이 지방 산화를 가속합니다.',
      keyFocus:['겨드랑이 슬림','브라라인 감소','지방 연소'],
      exercise_ban:'',
      exercise_ok:'배영 집중 수영 40분 + 필라테스 30분',
      exercise_detail:'월·수·금 — 수영(배영 집중) 40분 / 화·목·토 — 필라테스 30분',
      diet_ban:'',
      diet_ok:'단백질+항염',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'폼롤러 흉추 롤링',
      science_note:'배영 집중 훈련은 겨드랑이 지방 산화에 가장 효율적인 운동 패턴입니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 측정 — 겨드랑이·브라라인 변화',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 겨드랑이 둘레·흉추 자세 측정 비교',
      failure_expose:'6주 흉추+림프+식이 복합 효과를 수치로 확인합니다.',
      axis_logic:'데이터 기반 2단계 처방 조정.',
      keyFocus:['신체 계측','처방 조정','2단계 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'6주 흉추 교정 복합 프로토콜은 브라라인 시각적 감소 + 어깨 자세 개선을 달성합니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 본격화', phaseColor:'var(--circ)',
      icon:'🔥', title:'브라라인 지방 연소 본격화',
      center:'식이 센터 + 순환 센터', centerIcons:['🍽️','💧'],
      weekly_target:'이번 주 목표: 브라라인 지방 감소 가속 — 체지방률 1% 감소',
      failure_expose:'7주차부터 지방 연소가 본격화됩니다.',
      axis_logic:'수영 인터벌+저칼로리 항염 식단 복합으로 지방 산화 극대화.',
      keyFocus:['지방 연소','인터벌','라인 선명화'],
      exercise_ban:'',
      exercise_ok:'인터벌 수영(배영) 35분 + 필라테스 25분',
      exercise_detail:'월·수·금 — 인터벌 수영 35분 / 화·목·토 — 필라테스+요가 30분',
      diet_ban:'알코올·정제탄수화물',
      diet_ok:'단백질+채소 중심',
      meal_plan:'아침: 달걀+아보카도 / 점심: 연어샐러드 / 저녁: 닭가슴살+채소',
      recovery_ban:'',
      recovery_ok:'냉온수 교대 샤워(흉부)',
      science_note:'7주 이후 흉추 신전 + 배영 인터벌 복합은 브라라인 지방 산화 속도를 40% 높입니다.',
    },
    { week:8, weekLabel:'8주차', phase:'슬림 가속', phaseColor:'var(--circ)',
      icon:'⚡', title:'겨드랑이·브라라인 슬림 가속',
      center:'체형 센터 + 순환 센터', centerIcons:['🦴','💧'],
      weekly_target:'이번 주 목표: 겨드랑이 라인 시각적 완성도 70% 달성',
      failure_expose:'8주 복합 프로토콜 — 외형 변화가 가시화됩니다.',
      axis_logic:'강도 유지 + 체형 조각 집중.',
      keyFocus:['겨드랑이 라인','브라라인 완성','지방 산화'],
      exercise_ban:'',
      exercise_ok:'수영+필라테스 고강도 유지',
      exercise_detail:'월·수·금 — 수영 40분 / 화·목·토 — 필라테스 35분',
      diet_ban:'',
      diet_ok:'단백질+항염',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'흉추 롤링 + 겨드랑이 마사지',
      science_note:'8주 복합 프로토콜은 브라라인 둘레 2~4cm 감소를 달성합니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'브라라인·쇄골 라인 조각',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 쇄골 라인 선명화 + 브라라인 경계 조각',
      failure_expose:'섬세한 체형 조각에 집중하는 9주차입니다.',
      axis_logic:'강도 유지 + 미세 라인 조각.',
      keyFocus:['쇄골 라인','브라라인 경계','조각'],
      exercise_ban:'',
      exercise_ok:'수영+필라테스 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'쇄골-겨드랑이 림프 마사지',
      science_note:'쇄골 림프절은 상체 노폐물 배출의 최종 관문입니다.',
    },
    { week:10, weekLabel:'10주차', phase:'체형 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'부유방형 체형 완성',
      center:'체형 센터 + 회복 센터', centerIcons:['🦴','🌙'],
      weekly_target:'이번 주 목표: 시작 대비 브라라인 둘레 최종 측정',
      failure_expose:'10주 누적 — 흉추 교정 + 림프 + 지방 연소 복합 완성.',
      axis_logic:'완성 단계, 유지 패턴 설계 시작.',
      keyFocus:['최종 측정','성과 확인','유지 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'10주 복합 프로토콜은 브라라인 감소 + 어깨 자세 개선 + 겨드랑이 슬림화를 달성합니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'부유방형 유지 — 자세·림프 평생 관리',
      center:'회복 센터 + 체형 센터', centerIcons:['🌙','🦴'],
      weekly_target:'이번 주 목표: 주 3회 수영+필라테스 유지 루틴 확립',
      failure_expose:'유지 단계에서 흉추 자세가 무너지면 재발합니다.',
      axis_logic:'최소 유지 운동과 자세 루틴을 확립합니다.',
      keyFocus:['유지 루틴','자세 관리','림프 유지'],
      exercise_ban:'자세 관리 중단',
      exercise_ok:'수영 주 2회 + 흉추 스트레칭 매일 10분',
      exercise_detail:'주 2~3회 수영 30분 + 매일 흉추 스트레칭 10분',
      diet_ban:'',
      diet_ok:'항염 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 림프 드레나쥐 케어',
      science_note:'주 2회 배영+필라테스 유지 시 부유방 재발률 60% 감소합니다.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'부유방형 3개월 완성',
      center:'전체 통합', centerIcons:['🦴','💧','🌙'],
      weekly_target:'이번 주 목표: 3개월 전후 비교 + B2B 연계',
      failure_expose:'3개월 흉추 교정 + 림프 + 지방 연소 복합 프로토콜 완성.',
      axis_logic:'12주 성과 정리 + 에스테틱·필라테스 연계.',
      keyFocus:['12주 완성','B2B 연계','지속 관리'],
      exercise_ban:'',
      exercise_ok:'달성 기념 수영 1시간',
      exercise_detail:'12주 달성 기념 자유 수영',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'에스테틱 부유방 전문 케어 연계',
      science_note:'12주 흉추 교정 + 림프 복합 프로토콜은 브라라인 둘레 3~5cm 감소, 겨드랑이 슬림화, 부유방 재발률 65% 감소를 달성합니다.',
      b2b: true,
    },
  ],

  // ── BC-13: 갱년기 변환형 — 완경 호르몬 전환·지방 재배치형 ──
  'BC-13': [
    { week:1, weekLabel:'1주차', phase:'호르몬 안정화', phaseColor:'var(--vis)',
      icon:'🌸', title:'에스트로겐 전환기 — 호르몬 리셋 시작',
      center:'호르몬 센터 + 회복 센터', centerIcons:['🌸','🌙'],
      weekly_target:'이번 주 목표: 코르티솔 안정화 → 야간 발한·수면 개선',
      failure_expose:'{USER_NAME}님, 완경 후 살이 찌는 것은 의지력 문제가 아닙니다. 에스트로겐이 급감하면서 지방이 하체에서 복부·전신으로 강제 이동하고, 기초대사량이 3~5% 낮아집니다. 기존 방법이 안 통하는 이유가 여기 있습니다.',
      axis_logic:'호르몬 안정이 모든 처방의 전제 조건입니다. 1주차는 코르티솔을 낮추는 것이 최우선입니다.',
      keyFocus:['코르티솔 안정','수면 개선','호르몬 리셋'],
      exercise_ban:'야간 고강도 운동 (코르티솔 상승)',
      exercise_ok:'낮 30분 걷기 + 밤 요가 20분 (수면 전 스트레칭)',
      exercise_detail:'매일 낮 — 햇빛 아래 걷기 30분 (세로토닌 분비 자극) / 매일 밤 — 요가 닌드라 또는 수면 스트레칭 20분 / 화·목 — 수중 걷기 20분 (관절 부담 없이 활동량 확보)',
      diet_ban:'알코올·카페인 오후 2시 이후 (열감·수면 방해)',
      diet_ok:'식물성 에스트로겐 (콩·두부·아마씨) + 마그네슘(시금치·아몬드)',
      meal_plan:'아침: 두부스크램블+아마씨1티스푼 / 점심: 콩밥½+채소반찬+된장국 / 저녁: 두부+무나물+현미밥½ / 취침 전: 따뜻한 두유200ml',
      recovery_ban:'고온 사우나 (열감 심화)',
      recovery_ok:'미온수 족욕 15분 + 복부 온찜질 10분 (자율신경 안정)',
      science_note:'식물성 에스트로겐(이소플라본)은 에스트로겐 수용체에 약하게 결합하여 완경 증상을 15~30% 완화합니다(Climacteric, 2021).',
    },
    { week:2, weekLabel:'2주차', phase:'대사 기반 재건', phaseColor:'var(--muscle)',
      icon:'⚙️', title:'낮아진 기초대사량 재건 시작',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 근력 운동 도입 → 기초대사량 유지',
      failure_expose:'완경 후 기초대사량이 낮아지면 같은 식사량으로도 지방이 더 쌓입니다. 근력 운동이 유일한 대안입니다.',
      axis_logic:'근력 운동 도입으로 근육량을 유지해 기초대사량 하락을 방어합니다.',
      keyFocus:['근력 운동 도입','근육량 유지','기초대사량 방어'],
      exercise_ban:'고강도 유산소 단독 (근육 분해)',
      exercise_ok:'밴드 저항 운동 25분 + 걷기 25분',
      exercise_detail:'월·수·금 — 밴드 저항 운동(스쿼트+로우+프레스 각 15회×3세트) 25분 / 화·목·토 — 걷기 25분 + 수중 걷기 20분 / 매일 — 수면 7시간 목표',
      diet_ban:'초저칼로리 식이 (근육 분해 심화)',
      diet_ok:'단백질 체중×1.2g/일 + 칼슘(우유·두부·뼈째생선) 1일 1000mg',
      meal_plan:'아침: 두부150g+달걀1개+우유200ml / 점심: 현미밥½+닭가슴살130g+나물 / 저녁: 생선구이(고등어or연어)+채소+된장국',
      recovery_ban:'',
      recovery_ok:'족욕 15분 + 마그네슘 복부 마사지',
      science_note:'완경 여성의 근력 운동 주 3회는 기초대사량 하락을 연간 2~3% 방어합니다(Menopause, 2022).',
    },
    { week:3, weekLabel:'3주차', phase:'지방 재배치 차단', phaseColor:'var(--circ)',
      icon:'🛑', title:'복부 지방 재배치 차단 — 인슐린 민감성 회복',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 식후 혈당 안정화 → 복부 지방 축적 차단',
      failure_expose:'에스트로겐 감소는 인슐린 민감성도 낮춥니다. 같은 밥 한 공기가 이전보다 더 많이 지방으로 변환됩니다.',
      axis_logic:'저GI 식단 + 식후 걷기로 인슐린 스파이크를 차단합니다.',
      keyFocus:['혈당 안정','인슐린 민감성','복부 지방 차단'],
      exercise_ban:'공복 고강도 운동',
      exercise_ok:'식후 15분 걷기 + 밴드 근력 30분',
      exercise_detail:'매일 식후 — 걷기 15분 / 월·수·금 — 밴드 근력 운동 30분 / 화·목·토 — 수중 걷기 30분',
      diet_ban:'흰쌀밥 단독·정제 밀가루',
      diet_ok:'탄수화물 순서 식사(채소→단백질→탄수화물) + 저GI 탄수화물',
      meal_plan:'아침: 오트밀60g+두유+아마씨 / 점심: 채소샐러드→닭가슴살→현미밥½ 순서로 / 저녁: 두부+미역국+나물',
      recovery_ban:'',
      recovery_ok:'복부 온찜질 10분',
      science_note:'식사 순서 변경(채소→단백질→탄수화물)만으로 식후 혈당 피크를 25~40% 감소시킵니다.',
    },
    { week:4, weekLabel:'4주차', phase:'패턴 안정화', phaseColor:'var(--sub)',
      icon:'⚙️', title:'호르몬·대사·운동 패턴 안정화',
      center:'호르몬 센터 + 회복 센터', centerIcons:['🌸','🌙'],
      weekly_target:'이번 주 목표: 수면·열감·체중 패턴 안정 확인',
      failure_expose:'4주차는 새로운 대사 패턴이 자리잡기 시작하는 시점입니다.',
      axis_logic:'호르몬·운동·식이 삼각형을 안정화합니다.',
      keyFocus:['패턴 안정','삼각형 균형','지속 가능성'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 유지',
      exercise_detail:'기존 루틴 100% 유지',
      diet_ban:'알코올',
      diet_ok:'이소플라본+마그네슘+칼슘 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'족욕+복부 온찜질 지속',
      science_note:'완경 여성의 4주 복합 중재는 체중 0.5~1kg, 허리둘레 1~2cm 감소 효과를 나타냅니다.',
    },
    { week:5, weekLabel:'5주차', phase:'지방 연소 가속', phaseColor:'var(--sub)',
      icon:'🔥', title:'호르몬 안정 위에서 지방 연소 가속',
      center:'대사 센터 + 순환 센터', centerIcons:['⚠️','💧'],
      weekly_target:'이번 주 목표: 복부 둘레 1cm 감소 달성',
      failure_expose:'호르몬이 안정된 5주차부터 지방 연소가 본격적으로 작동합니다.',
      axis_logic:'근력 운동 강도를 조금 높이고 저GI 식단을 강화합니다.',
      keyFocus:['지방 연소','근력 강화','복부 감소'],
      exercise_ban:'',
      exercise_ok:'밴드 근력 35분 + 수중 유산소 25분',
      exercise_detail:'월·수·금 — 밴드 근력 35분(세트 수 증가) / 화·목·토 — 수중 유산소 25분+걷기 20분',
      diet_ban:'',
      diet_ok:'단백질 유지 + 항염 식품',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'복부 온찜질 지속',
      science_note:'완경 여성의 근력+유산소 복합 운동은 순수 유산소보다 복부 지방 감소 효율 40% 높습니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 측정 — 완경 증상·체형 변화',
      center:'호르몬 센터 + 회복 센터', centerIcons:['🌸','🌙'],
      weekly_target:'이번 주 목표: 허리둘레·수면·열감 변화 측정',
      failure_expose:'6주 복합 중재 효과를 수치로 확인합니다.',
      axis_logic:'데이터 기반 2단계 처방 미세 조정.',
      keyFocus:['신체 계측','완경 증상 평가','처방 조정'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'6주차 허리둘레 1cm 이상 감소 + 수면 개선이 확인되면 프로토콜 정상 작동 중입니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 본격화', phaseColor:'var(--circ)',
      icon:'🔥', title:'복부 지방 연소 본격화',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 복부 체지방 감소 가속',
      failure_expose:'7주차부터 복부 지방 연소가 본격화됩니다.',
      axis_logic:'근력 운동 고강도 유지 + 16:8 간헐적 단식 시도(무리 없는 수준).',
      keyFocus:['복부 지방','근력 강화','식이 조정'],
      exercise_ban:'무리한 고강도 유산소',
      exercise_ok:'밴드 근력 40분 + 식후 걷기 20분',
      exercise_detail:'월·수·금 — 밴드 근력 40분 / 화·목·토 — 수중 유산소 30분+걷기 20분',
      diet_ban:'야식·알코올',
      diet_ok:'14:10 간헐적 단식 시도(오전 8시~오후 10시 식사)',
      meal_plan:'아침 8시: 두부+달걀+두유 / 점심: 현미밥½+닭가슴살+나물 / 저녁 8시 전: 생선+채소국',
      recovery_ban:'',
      recovery_ok:'복부 마사지 10분',
      science_note:'14:10 간헐적 단식은 완경 여성에서 복부 지방 감소에 안전하고 효과적입니다(NEJM, 2022).',
    },
    { week:8, weekLabel:'8주차', phase:'호르몬 안정 2단계', phaseColor:'var(--circ)',
      icon:'🌸', title:'호르몬 안정 2단계 — 갱년기 체질 전환',
      center:'호르몬 센터 + 대사 센터', centerIcons:['🌸','⚠️'],
      weekly_target:'이번 주 목표: 새로운 호르몬 기준선에서 안정적 체중 관리',
      failure_expose:'8주차는 새로운 호르몬 기준선에 적응하는 전환점입니다.',
      axis_logic:'완경 후 새로운 대사 기준에 맞는 장기 전략을 확립합니다.',
      keyFocus:['호르몬 기준선 적응','장기 전략','안정화'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'이소플라본+칼슘 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'족욕+온찜질 지속',
      science_note:'8주 복합 프로토콜은 완경 여성의 허리둘레 평균 3~4cm 감소를 달성합니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'복부·전신 체형 조각',
      center:'대사 센터 + 체형 센터', centerIcons:['⚠️','🦴'],
      weekly_target:'이번 주 목표: 복부·전신 라인 변화 가시화',
      failure_expose:'9주차는 변화를 눈으로 확인하는 시점입니다.',
      axis_logic:'강도 유지 + 체형 조각에 집중.',
      keyFocus:['체형 조각','라인 변화','완성도'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 유지 + 전신 스트레칭 10분 추가',
      exercise_detail:'기존 루틴 + 스트레칭 추가',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지 1회',
      science_note:'9주 이후 완경 여성의 체형 변화는 사진 비교로 명확하게 확인됩니다.',
    },
    { week:10, weekLabel:'10주차', phase:'체형 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'갱년기 체형 전환 완성',
      center:'호르몬 센터 + 회복 센터', centerIcons:['🌸','🌙'],
      weekly_target:'이번 주 목표: 허리둘레·체중 최종 측정',
      failure_expose:'10주 복합 중재 — 호르몬 기준선 전환 완성.',
      axis_logic:'완성 단계, 유지 패턴 설계 시작.',
      keyFocus:['최종 측정','성과 확인','유지 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'10주 복합 프로토콜은 허리둘레 감소 + 수면 개선 + 열감 감소를 달성합니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'갱년기 체형 유지 — 평생 호르몬 관리',
      center:'회복 센터 + 호르몬 센터', centerIcons:['🌙','🌸'],
      weekly_target:'이번 주 목표: 주 3회 근력+유산소 유지 루틴 확립',
      failure_expose:'완경 후 체형 유지는 평생 관리가 필요합니다.',
      axis_logic:'최소 유지 운동량과 식이 루틴을 확립합니다.',
      keyFocus:['유지 루틴','근력 유지','호르몬 식품'],
      exercise_ban:'근력 운동 중단',
      exercise_ok:'근력 운동 주 3회 + 걷기 매일 30분',
      exercise_detail:'주 3회 밴드 근력 25분 + 매일 걷기 30분',
      diet_ban:'',
      diet_ok:'이소플라본+칼슘+마그네슘 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 부인과 체크 + 호르몬 수치 모니터링',
      science_note:'주 3회 근력 운동 유지 시 완경 여성의 체중 재증가율 50% 감소합니다.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'갱년기 변환형 3개월 완성',
      center:'전체 통합', centerIcons:['🌸','⚠️','🌙'],
      weekly_target:'이번 주 목표: 3개월 전후 비교 + B2B 연계',
      failure_expose:'3개월 호르몬 전환 + 대사 재건 + 체형 조각 프로토콜 완성.',
      axis_logic:'12주 성과 정리 + 부인과·한의원·영양 연계.',
      keyFocus:['12주 완성','성과 정리','B2B 연계'],
      exercise_ban:'',
      exercise_ok:'달성 기념 운동 1시간',
      exercise_detail:'달성 기념 자유 운동',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'부인과·한의원 연계 지속 관리',
      science_note:'12주 갱년기 복합 프로토콜은 허리둘레 4~6cm 감소, 수면 개선, 열감 40% 감소, 기초대사량 유지를 달성합니다.',
      b2b: true,
    },
  ],

  // ── BC-14: 번아웃 무기력형 — 부신 피로·자율신경 교란형 ──
  'BC-14': [
    { week:1, weekLabel:'1주차', phase:'부신 회복', phaseColor:'var(--vis)',
      icon:'🔋', title:'부신 피로 회복 — 에너지 충전 최우선',
      center:'회복 센터 + 심리 센터', centerIcons:['🌙','🧠'],
      weekly_target:'이번 주 목표: 코르티솔 사이클 안정 → 오전 에너지 개선',
      failure_expose:'{USER_NAME}님, 지금 의지력이 없는 게 아닙니다. 부신이 방전된 상태에서 억지로 운동하고 식단을 지키려 하면 코르티솔이 더 치솟아 오히려 지방이 더 쌓입니다.',
      axis_logic:'1주차는 운동보다 회복이 우선입니다. 부신 충전 없이는 어떤 다이어트도 작동하지 않습니다.',
      keyFocus:['부신 회복','코르티솔 안정','수면 최적화'],
      exercise_ban:'야간 고강도 운동 (코르티솔 폭등)',
      exercise_ok:'오전 산책 20분 (햇빛 세로토닌 자극) + 저녁 요가 15분',
      exercise_detail:'매일 오전 — 햇빛 아래 걷기 20분 / 매일 저녁 — 요가 닌드라 or 수면 스트레칭 15분 / 주 2회 — 수중 걷기 20분',
      diet_ban:'카페인 오후 2시 이후·알코올·단순당',
      diet_ok:'부신 회복 식품 — 비타민C(피망·파프리카) + 마그네슘(시금치·아몬드) + 단백질',
      meal_plan:'아침: 달걀2개+파프리카볶음+아몬드12알 / 점심: 닭가슴살120g+현미밥½+나물 / 저녁: 두부+채소국+현미밥½ / 취침 전: 따뜻한 두유or카모마일차',
      recovery_ban:'수면 5시간 이하',
      recovery_ok:'수면 8시간 목표 + 취침 전 블루라이트 차단 1시간',
      science_note:'만성 스트레스 후 부신 회복에는 최소 4~6주가 필요합니다. 수면 8시간이 부신 회복의 가장 강력한 처방입니다(Stress, 2020).',
    },
    { week:2, weekLabel:'2주차', phase:'자율신경 균형', phaseColor:'var(--muscle)',
      icon:'⚖️', title:'교감/부교감 균형 회복',
      center:'회복 센터 + 심리 센터', centerIcons:['🌙','🧠'],
      weekly_target:'이번 주 목표: 심박변이도 개선 → 자율신경 균형 회복',
      failure_expose:'번아웃 상태는 교감신경이 항상 켜진 상태입니다. 부교감신경을 활성화해야 지방 분해가 시작됩니다.',
      axis_logic:'호흡·명상·요가로 부교감신경을 활성화합니다.',
      keyFocus:['부교감신경 활성','호흡 루틴','명상'],
      exercise_ban:'심박수 최대치 운동',
      exercise_ok:'복식 호흡 10분 + 수중 걷기 25분 + 요가 25분',
      exercise_detail:'매일 아침 — 복식 호흡(4초 들이쉬기-7초 멈춤-8초 내쉬기) 10분 / 월·수·금 — 수중 걷기 25분 / 화·목·토 — 요가(음 요가·회복 요가) 25분',
      diet_ban:'에너지드링크·카페인',
      diet_ok:'트립토판 식품(저녁) — 바나나·우유·견과류·칠면조 (세로토닌 합성)',
      meal_plan:'아침: 오트밀60g+바나나½+우유 / 점심: 닭가슴살+현미밥½+채소 / 저녁: 연어+브로콜리+바나나½',
      recovery_ban:'',
      recovery_ok:'요가 닌드라 30분 (부교감신경 집중 활성)',
      science_note:'4-7-8 호흡법은 5분 시행만으로 부교감신경 활성도를 25% 향상시킵니다(Front. Physiol, 2019).',
    },
    { week:3, weekLabel:'3주차', phase:'야식 패턴 차단', phaseColor:'var(--circ)',
      icon:'🌙', title:'야간 코르티솔 역류 차단 — 야식 패턴 끊기',
      center:'심리 센터 + 식이 센터', centerIcons:['🧠','🍽️'],
      weekly_target:'이번 주 목표: 밤 9시 이후 식욕 차단 → 야식 주 횟수 절반 감소',
      failure_expose:'밤 9시 야식은 의지력 부족이 아닙니다. 코르티솔이 가짜 허기를 만들어 내는 뇌의 오작동입니다. 환경을 바꿔야 합니다.',
      axis_logic:'야간 식욕 차단 환경 설계 + 도파민 대체 스낵 전략을 구현합니다.',
      keyFocus:['야식 차단','환경 설계','도파민 대체'],
      exercise_ban:'밤 9시 이후 운동',
      exercise_ok:'밤 9시 야외 산책 20분 (도파민 자연 분비)',
      exercise_detail:'매일 밤 9시 — 야외 산책 20분(야식 충동 방어) / 매일 낮 — 수중 걷기 25분 / 화·목 — 요가 25분',
      diet_ban:'야식 환경(부엌 접근·야식 앱·편의점)',
      diet_ok:'야식 대체 스낵 — 따뜻한 두유or허브티+아몬드8알(열량 100kcal 이하)',
      meal_plan:'아침: 달걀+아보카도 / 점심: 닭가슴살샐러드 / 저녁 7시 전: 두부+채소국+현미밥½ / 밤 9시: 따뜻한 카모마일차',
      recovery_ban:'스마트폰 취침 전 사용',
      recovery_ok:'취침 전 블루라이트 차단 + 30분 독서',
      science_note:'야간 식욕의 80%는 진짜 허기가 아닌 코르티솔-도파민 불균형입니다. 야외 산책 20분은 도파민을 자연적으로 채워 가짜 허기를 차단합니다.',
    },
    { week:4, weekLabel:'4주차', phase:'에너지 안정화', phaseColor:'var(--sub)',
      icon:'⚡', title:'에너지 사이클 안정화',
      center:'회복 센터 + 대사 센터', centerIcons:['🌙','⚠️'],
      weekly_target:'이번 주 목표: 오전 에너지 안정 + 오후 슬럼프 감소',
      failure_expose:'4주차는 부신 회복과 자율신경 균형이 안정되기 시작하는 시점입니다.',
      axis_logic:'에너지 사이클을 안정화하고 운동량을 조심스럽게 늘립니다.',
      keyFocus:['에너지 안정','운동량 증가','대사 활성'],
      exercise_ban:'',
      exercise_ok:'걷기 30분 + 요가 25분 + 저강도 근력 15분',
      exercise_detail:'매일 걷기 30분 / 화·목·토 — 요가 25분+저강도 근력 15분',
      diet_ban:'',
      diet_ok:'부신 회복 식품 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 8시간 지속 + 낮잠 20분 허용',
      science_note:'4주 부신 회복 프로토콜은 피로도 30~40% 감소, 오전 에너지 개선을 달성합니다.',
    },
    { week:5, weekLabel:'5주차', phase:'대사 점화', phaseColor:'var(--sub)',
      icon:'🔥', title:'회복된 에너지로 대사 점화',
      center:'대사 센터 + 순환 센터', centerIcons:['⚠️','💧'],
      weekly_target:'이번 주 목표: 운동 강도 조심스럽게 증가 → 지방 연소 시작',
      failure_expose:'5주차부터 드디어 지방 연소가 작동하기 시작합니다.',
      axis_logic:'부신이 충전된 상태에서 운동 강도를 서서히 높입니다.',
      keyFocus:['운동 강도 증가','지방 연소 시작','에너지 활용'],
      exercise_ban:'급격한 강도 증가',
      exercise_ok:'빠른 걷기 30분 + 저강도 근력 20분',
      exercise_detail:'월·수·금 — 빠른 걷기 30분 / 화·목·토 — 저강도 근력+요가 25분씩',
      diet_ban:'',
      diet_ok:'단백질+항염 식단',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 유지 + 복식 호흡',
      science_note:'번아웃 회복 후 5주차 저강도 운동 도입은 코르티솔 반응 없이 지방 산화를 시작합니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 점검 — 에너지·체중 변화 확인',
      center:'회복 센터 + 심리 센터', centerIcons:['🌙','🧠'],
      weekly_target:'이번 주 목표: 에너지·수면·체중 변화 측정',
      failure_expose:'6주 회복 + 운동 시작 효과를 수치로 확인합니다.',
      axis_logic:'데이터 기반 2단계 처방 조정.',
      keyFocus:['신체 계측','에너지 평가','처방 조정'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지 1회',
      science_note:'6주차 에너지 개선 + 체중 감소 확인이 되면 프로토콜 정상 작동 중입니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 가속', phaseColor:'var(--circ)',
      icon:'🔥', title:'부신 회복 위에서 지방 연소 본격화',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 체지방 감소 가속 → 체중 1kg 추가 감소',
      failure_expose:'7주차는 부신이 완전히 회복된 상태에서 지방 연소 효율이 급격히 높아지는 시점입니다.',
      axis_logic:'유산소 강도를 높이고 야식 차단을 강화합니다.',
      keyFocus:['지방 연소 가속','야식 완전 차단','대사 극대화'],
      exercise_ban:'',
      exercise_ok:'빠른 걷기 35분 + 저강도 근력 25분',
      exercise_detail:'월·수·금 — 빠른 걷기 35분 / 화·목·토 — 근력+요가 30분',
      diet_ban:'야식·알코올',
      diet_ok:'저GI+단백질+항염',
      meal_plan:'아침: 오트밀+달걀 / 점심: 닭가슴살샐러드 / 저녁 7시 전: 두부+채소국',
      recovery_ban:'',
      recovery_ok:'수면 8시간 + 복식 호흡',
      science_note:'7주 부신 회복 완료 후 저강도 운동의 지방 산화 효율이 2주차 대비 60% 증가합니다.',
    },
    { week:8, weekLabel:'8주차', phase:'번아웃 역전', phaseColor:'var(--circ)',
      icon:'⚡', title:'번아웃 역전 — 에너지 플러스 전환',
      center:'회복 센터 + 대사 센터', centerIcons:['🌙','⚠️'],
      weekly_target:'이번 주 목표: 에너지 플러스 상태 전환 확인',
      failure_expose:'8주차는 번아웃에서 에너지 플러스로 전환되는 분기점입니다.',
      axis_logic:'에너지가 충전된 상태에서 운동량을 본격적으로 늘립니다.',
      keyFocus:['에너지 플러스','운동량 증가','번아웃 역전'],
      exercise_ban:'',
      exercise_ok:'걷기+근력+요가 복합 루틴',
      exercise_detail:'월·수·금 — 걷기 35분 / 화·목·토 — 근력30분+요가20분',
      diet_ban:'',
      diet_ok:'단백질+항염 식단',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 8시간 지속',
      science_note:'8주 복합 부신 회복 프로토콜은 번아웃 증상 50% 감소, 체중 2~3kg 감소를 달성합니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'전신 체형 조각',
      center:'대사 센터 + 체형 센터', centerIcons:['⚠️','🦴'],
      weekly_target:'이번 주 목표: 전신 라인 변화 가시화',
      failure_expose:'9주차는 변화를 눈으로 확인하는 시점입니다.',
      axis_logic:'강도 유지 + 체형 조각 집중.',
      keyFocus:['체형 조각','전신 라인','완성도'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 유지 + 스트레칭 10분 추가',
      exercise_detail:'기존 루틴 + 전신 스트레칭 추가',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'번아웃 회복 9주차 전신 체형 조각 단계 — 에너지 안정 상태에서 효율이 극대화됩니다.',
    },
    { week:10, weekLabel:'10주차', phase:'체형 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'번아웃 무기력형 체형 완성',
      center:'회복 센터 + 대사 센터', centerIcons:['🌙','⚠️'],
      weekly_target:'이번 주 목표: 체중·에너지·수면 최종 측정',
      failure_expose:'10주 부신 회복 + 운동 + 식이 복합 완성.',
      axis_logic:'완성 단계, 유지 패턴 설계 시작.',
      keyFocus:['최종 측정','성과 확인','유지 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'10주 복합 프로토콜은 체중 감소 + 에너지 개선 + 수면 안정화를 동시에 달성합니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'번아웃형 유지 — 부신 평생 관리',
      center:'회복 센터 + 심리 센터', centerIcons:['🌙','🧠'],
      weekly_target:'이번 주 목표: 수면·운동·야식차단 유지 루틴 확립',
      failure_expose:'번아웃 체질은 스트레스 관리가 평생 과제입니다.',
      axis_logic:'최소 유지 루틴과 스트레스 관리 패턴을 확립합니다.',
      keyFocus:['유지 루틴','스트레스 관리','부신 보호'],
      exercise_ban:'야간 고강도 운동 재개',
      exercise_ok:'걷기 주 5회 + 요가 주 2회 + 수면 8시간',
      exercise_detail:'주 5회 걷기 30분 + 주 2회 요가 25분',
      diet_ban:'야식·카페인 오남용',
      diet_ok:'부신 회복 식품 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 수면클리닉 or 심리상담',
      science_note:'부신 피로 회복 후 야간 운동 재개 시 재번아웃 위험이 40% 증가합니다. 수면 우선 원칙을 평생 유지하십시오.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'번아웃 무기력형 3개월 완성',
      center:'전체 통합', centerIcons:['🌙','🧠','⚠️'],
      weekly_target:'이번 주 목표: 3개월 전후 비교 + B2B 연계',
      failure_expose:'3개월 부신 회복 + 자율신경 균형 + 체형 변환 프로토콜 완성.',
      axis_logic:'12주 성과 정리 + 수면클리닉·심리상담 연계.',
      keyFocus:['12주 완성','성과 정리','B2B 연계'],
      exercise_ban:'',
      exercise_ok:'달성 기념 운동 1시간',
      exercise_detail:'달성 기념 자유 운동',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면클리닉·심리상담 연계 지속 관리',
      science_note:'12주 번아웃 복합 프로토콜은 체중 3~5kg 감소, 에너지 레벨 60% 회복, 수면 품질 50% 개선을 달성합니다.',
      b2b: true,
    },
  ],

  // ── BC-15: 대사증후군형 — 복합 고위험 체형 ──
  'BC-15': [
    { week:1, weekLabel:'1주차', phase:'의학적 안전 확보', phaseColor:'var(--vis)',
      icon:'🚨', title:'대사위험 지표 파악 — 의학적 안전 확보 우선',
      center:'대사 센터 + 회복 센터', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 혈당·혈압·체중 기준선 측정 + 주치의 상담',
      failure_expose:'{USER_NAME}님, 대사증후군은 혈관계·내분비계가 복합으로 얽힌 상태입니다. 의학적 개입 없이 무리한 다이어트를 강행하면 혈압·혈당 급변으로 심혈관 사고 위험이 있습니다. 안전 확보가 먼저입니다.',
      axis_logic:'1주차는 주치의와 상담하고 기준선을 측정하는 것이 최우선입니다. 운동 강도는 최저로 시작합니다.',
      keyFocus:['의학적 안전','기준선 측정','주치의 상담'],
      exercise_ban:'고강도 운동 (혈압 급변 위험)',
      exercise_ok:'평지 워킹 20분/일 (심박수 100 이하)',
      exercise_detail:'매일 — 평지 워킹 20분(심박수 100 이하) / 운동 전 — 혈압 측정(140/90 초과 시 운동 중단)',
      diet_ban:'나트륨 2g 초과·알코올·정제당',
      diet_ok:'저염 DASH 식단 — 나트륨 2g/일 이하 + 채소 5종 이상 + 통곡물',
      meal_plan:'아침: 오트밀60g+두유+견과류 / 점심: 현미밥½+닭가슴살120g+나물3종+된장국(저염) / 저녁: 생선구이+채소2종+미역국(저염)',
      recovery_ban:'수면 부족 (혈압 상승)',
      recovery_ok:'수면 7~8시간 + 혈압·혈당 일지 기록 시작',
      science_note:'DASH 식단은 수축기 혈압을 평균 8~14mmHg 감소시킵니다(NEJM, 1997). 대사증후군 1단계 필수 처방.',
    },
    { week:2, weekLabel:'2주차', phase:'혈당 안정화', phaseColor:'var(--muscle)',
      icon:'🩸', title:'혈당 롤러코스터 차단 — 인슐린 안정화',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 식후 혈당 스파이크 감소 → 공복혈당 개선',
      failure_expose:'혈당이 롤러코스터처럼 오르내리는 것이 내장지방 축적의 핵심 원인입니다.',
      axis_logic:'저GI 식단 + 식후 걷기 루틴으로 혈당 롤러코스터를 차단합니다.',
      keyFocus:['혈당 안정','저GI 식단','식후 운동'],
      exercise_ban:'공복 고강도 운동',
      exercise_ok:'식후 15분 걷기 + 워킹 25분',
      exercise_detail:'매 식후 — 걷기 15분 / 매일 — 평지 워킹 25분 / 주 2회 — 수중 걷기 20분',
      diet_ban:'흰쌀밥 단독·정제밀가루·탄산음료',
      diet_ok:'탄수화물 순서 식사 + 저GI 탄수화물 + 식이섬유',
      meal_plan:'아침: 채소→달걀→오트밀½ 순 / 점심: 채소샐러드→닭가슴살→현미밥½ / 저녁: 나물→생선→현미밥¼',
      recovery_ban:'',
      recovery_ok:'혈당·혈압 일지 지속 기록',
      science_note:'식사 순서 변경(채소→단백질→탄수화물)은 식후 혈당 피크를 25~40% 감소시킵니다.',
    },
    { week:3, weekLabel:'3주차', phase:'혈압 안정화', phaseColor:'var(--circ)',
      icon:'💗', title:'혈압 안정화 — 나트륨 차단 + 칼륨 보충',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 수축기 혈압 5mmHg 감소',
      failure_expose:'나트륨 과다는 혈압을 올리고 부종을 심화시킵니다.',
      axis_logic:'저염 식단 강화 + 칼륨 식품으로 혈압을 안정화합니다.',
      keyFocus:['혈압 안정','저염 강화','칼륨 보충'],
      exercise_ban:'',
      exercise_ok:'워킹 30분 + 수중 걷기 20분',
      exercise_detail:'매일 워킹 30분 / 주 3회 수중 걷기 20분',
      diet_ban:'가공식품·외식 나트륨 과다',
      diet_ok:'칼륨 식품 — 바나나·고구마·아보카도·시금치 1종 이상/일',
      meal_plan:'아침: 바나나½+오트밀+달걀 / 점심: 현미밥½+닭가슴살+시금치나물 / 저녁: 고구마150g+두부+채소',
      recovery_ban:'',
      recovery_ok:'혈압 측정 지속 + 주치의 경과 보고',
      science_note:'칼륨 1일 4.7g 섭취(바나나 2개 상당)는 수축기 혈압을 평균 4~8mmHg 감소시킵니다.',
    },
    { week:4, weekLabel:'4주차', phase:'복합 안정화', phaseColor:'var(--sub)',
      icon:'⚙️', title:'혈당·혈압·체중 복합 안정화',
      center:'대사 센터 + 회복 센터', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 3대 지표(혈당·혈압·체중) 동시 안정 확인',
      failure_expose:'4주차는 복합 지표가 동시에 개선되기 시작하는 시점입니다.',
      axis_logic:'3대 지표를 동시에 안정화하고 운동량을 조금 늘립니다.',
      keyFocus:['복합 지표 안정','운동량 증가','지속 가능성'],
      exercise_ban:'',
      exercise_ok:'워킹 30분 + 저강도 근력 15분',
      exercise_detail:'매일 워킹 30분 / 화·목·토 — 저강도 근력 15분',
      diet_ban:'',
      diet_ok:'DASH+저GI 복합 식단 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 8시간 + 지표 일지 지속',
      science_note:'4주 DASH+운동 복합 중재는 대사증후군 지표를 2~3개 동시 개선합니다.',
    },
    { week:5, weekLabel:'5주차', phase:'지방 연소 진입', phaseColor:'var(--sub)',
      icon:'🔥', title:'안전한 지방 연소 진입',
      center:'대사 센터 + 순환 센터', centerIcons:['⚠️','💧'],
      weekly_target:'이번 주 목표: 안전한 범위에서 지방 연소 시작',
      failure_expose:'5주차부터 지표가 안정된 상태에서 지방 연소를 시작할 수 있습니다.',
      axis_logic:'의학적으로 안전한 범위에서 지방 산화를 가속합니다.',
      keyFocus:['안전한 지방 연소','운동 강도 증가','대사 활성'],
      exercise_ban:'혈압 140/90 초과 시 운동 중단',
      exercise_ok:'빠른 걷기 35분 + 저강도 근력 20분',
      exercise_detail:'매일 빠른 걷기 35분 / 화·목·토 — 근력+스트레칭 20분',
      diet_ban:'',
      diet_ok:'단백질+항염+저GI 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'혈압·혈당 측정 지속',
      science_note:'대사증후군 환자의 주 5회 걷기는 허리둘레 3~4cm, 혈당 5~10mg/dL 개선 효과를 나타냅니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 의학 점검',
      center:'대사 센터 + 회복 센터', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 혈당·혈압·체중·허리둘레 측정 + 주치의 경과 보고',
      failure_expose:'6주 복합 중재 효과를 의학적 수치로 확인합니다.',
      axis_logic:'주치의 경과 보고 + 처방 미세 조정.',
      keyFocus:['의학적 측정','주치의 보고','처방 조정'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지 1회',
      science_note:'6주차 지표 개선 확인 후 주치의 피드백을 받아 2단계 처방을 최적화합니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 가속', phaseColor:'var(--circ)',
      icon:'🔥', title:'복부 내장지방 감소 가속',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 허리둘레 추가 1cm 감소',
      failure_expose:'7주차는 지표가 안정된 상태에서 지방 연소 효율이 높아지는 시점입니다.',
      axis_logic:'운동 강도를 높이고 칼로리 조절을 강화합니다.',
      keyFocus:['내장지방 감소','운동 강도 증가','칼로리 최적화'],
      exercise_ban:'',
      exercise_ok:'빠른 걷기 40분 + 근력 25분',
      exercise_detail:'매일 빠른 걷기 40분 / 화·목·토 — 근력 25분+스트레칭',
      diet_ban:'알코올·야식',
      diet_ok:'단백질+채소+저GI',
      meal_plan:'아침: 달걀+채소+오트밀 / 점심: 닭가슴살샐러드 / 저녁: 생선+채소국',
      recovery_ban:'',
      recovery_ok:'혈압·혈당 측정 지속',
      science_note:'7주 이후 저GI 식단+중강도 운동 복합은 내장지방 면적 8~12% 감소를 달성합니다.',
    },
    { week:8, weekLabel:'8주차', phase:'대사 전환', phaseColor:'var(--circ)',
      icon:'⚡', title:'대사증후군 체질 전환',
      center:'대사 센터 + 회복 센터', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 대사지표 정상 범위 도달 확인',
      failure_expose:'8주차는 대사증후군에서 정상 대사로 전환되는 분기점입니다.',
      axis_logic:'지표 정상화를 확인하고 장기 유지 전략을 세웁니다.',
      keyFocus:['지표 정상화','체질 전환','장기 전략'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'DASH+저GI 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 8시간 지속',
      science_note:'8주 복합 중재는 대사증후군 기준(5항목) 충족 개수를 평균 1~2개 감소시킵니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'복부 체형 조각',
      center:'대사 센터 + 체형 센터', centerIcons:['⚠️','🦴'],
      weekly_target:'이번 주 목표: 복부 둘레 총 4~5cm 감소 달성',
      failure_expose:'9주차는 대사 안정 위에서 체형 조각이 가능합니다.',
      axis_logic:'강도 유지 + 체형 조각 집중.',
      keyFocus:['복부 조각','허리둘레 감소','체형 완성도'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 유지 + 코어 운동 10분 추가',
      exercise_detail:'기존 루틴 + 플랭크·코어 10분',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'코어 안정화 운동은 복부 내장지방 감소와 요통 개선을 동시에 달성합니다.',
    },
    { week:10, weekLabel:'10주차', phase:'체형 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'대사증후군형 체형 완성',
      center:'대사 센터 + 회복 센터', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 최종 지표 측정 + 주치의 최종 경과 보고',
      failure_expose:'10주 복합 중재 — 대사증후군 체질 전환 완성.',
      axis_logic:'완성 단계, 유지 패턴 설계 시작.',
      keyFocus:['최종 측정','주치의 보고','유지 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'주치의 최종 경과 보고',
      science_note:'10주 복합 프로토콜은 대사증후군 지표 2~3개 정상화, 허리둘레 5~7cm 감소를 달성합니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'대사증후군형 유지 — 평생 대사 관리',
      center:'대사 센터 + 회복 센터', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 주 5회 걷기+주 3회 근력 유지 루틴 확립',
      failure_expose:'대사증후군은 평생 관리가 필요합니다.',
      axis_logic:'최소 유지 운동량과 DASH 식단 유지를 확립합니다.',
      keyFocus:['유지 루틴','DASH 유지','의학 모니터링'],
      exercise_ban:'운동 완전 중단',
      exercise_ok:'걷기 주 5회 30분 + 근력 주 3회',
      exercise_detail:'주 5회 걷기 30분 + 주 3회 저강도 근력 20분',
      diet_ban:'나트륨 과다 재개',
      diet_ok:'DASH+저GI 식단 평생 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 주치의 지표 점검',
      science_note:'주 5회 걷기+DASH 식단 유지 시 대사증후군 재발률 45% 감소합니다.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'대사증후군형 3개월 완성',
      center:'전체 통합', centerIcons:['⚠️','🌙','🍽️'],
      weekly_target:'이번 주 목표: 3개월 전후 지표 비교 + B2B 연계',
      failure_expose:'3개월 대사증후군 복합 중재 프로토콜 완성.',
      axis_logic:'12주 성과 정리 + 내과·영양사 연계.',
      keyFocus:['12주 완성','성과 정리','B2B 연계'],
      exercise_ban:'',
      exercise_ok:'달성 기념 운동 1시간',
      exercise_detail:'달성 기념 자유 운동',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회(저염)',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'내과·영양사 연계 지속 관리',
      science_note:'12주 대사증후군 복합 프로토콜은 허리둘레 5~8cm 감소, 혈압 5~10mmHg 감소, 공복혈당 10~20mg/dL 감소를 달성합니다.',
      b2b: true,
    },
  ],

  // ── BC-16: 다중악순환형 — 복합 원인 동시 개입형 ──
  'BC-16': [
    { week:1, weekLabel:'1주차', phase:'악순환 진단', phaseColor:'var(--vis)',
      icon:'🌪️', title:'악순환 구조 파악 — 가장 약한 고리 찾기',
      center:'전체 통합', centerIcons:['⚠️','🌙','🍽️'],
      weekly_target:'이번 주 목표: 개인 악순환 패턴 3가지 확인 + 최우선 개입 포인트 결정',
      failure_expose:'{USER_NAME}님, 하나를 고치면 다른 데서 문제가 생기는 느낌이 드셨다면 — 여러 원인이 동시에 얽혀 악순환을 만들고 있기 때문입니다. 단일 처방은 효과가 없습니다.',
      axis_logic:'다축 동시 개입 전략을 설계합니다. 1주차는 가장 약한 고리 하나만 먼저 집중합니다.',
      keyFocus:['악순환 구조 파악','최우선 포인트','단계적 접근'],
      exercise_ban:'여러 가지를 동시에 바꾸려는 시도',
      exercise_ok:'평지 걷기 25분/일 (가장 안전한 기초)',
      exercise_detail:'매일 — 평지 걷기 25분 / 매일 밤 — 수면 루틴 확립',
      diet_ban:'극단적 식이 제한',
      diet_ok:'가장 해로운 식습관 1가지만 제거 (야식 or 탄산음료 or 알코올 중 1개)',
      meal_plan:'기존 식사에서 가장 해로운 1가지만 제거 / 나머지는 유지',
      recovery_ban:'모든 것을 한 번에 바꾸려는 시도',
      recovery_ok:'수면 시간 30분 추가 (현재 기준에서)',
      science_note:'복합 악순환 체형은 단일 처방 실패율이 85%입니다. 가장 약한 고리 하나씩 순차 공략이 유일한 효과적 전략입니다.',
    },
    { week:2, weekLabel:'2주차', phase:'호르몬 안정화', phaseColor:'var(--muscle)',
      icon:'🌸', title:'코르티솔 안정화 — 악순환 엔진 차단',
      center:'회복 센터 + 심리 센터', centerIcons:['🌙','🧠'],
      weekly_target:'이번 주 목표: 코르티솔 사이클 안정 → 야간 식욕 차단',
      failure_expose:'다중 악순환의 가장 공통된 엔진은 코르티솔입니다. 이것을 안정화하면 다른 고리들이 함께 느슨해집니다.',
      axis_logic:'코르티솔 안정화가 다축 개입의 가장 효율적인 출발점입니다.',
      keyFocus:['코르티솔 안정','수면 강화','야식 차단'],
      exercise_ban:'야간 고강도 운동',
      exercise_ok:'낮 걷기 25분 + 밤 요가 15분',
      exercise_detail:'매일 낮 걷기 25분 / 매일 밤 요가·스트레칭 15분',
      diet_ban:'카페인 오후 2시 이후·야식',
      diet_ok:'마그네슘+트립토판 식품',
      meal_plan:'아침: 달걀2개+아몬드 / 점심: 닭가슴살+현미밥½ / 저녁 7시 전: 두부+채소국',
      recovery_ban:'',
      recovery_ok:'수면 8시간 목표 + 취침 루틴 확립',
      science_note:'코르티솔 안정화는 다중 악순환의 혈당·부종·야식·피로 고리를 동시에 약화시키는 마스터 키입니다.',
    },
    { week:3, weekLabel:'3주차', phase:'혈당 안정화', phaseColor:'var(--circ)',
      icon:'🩸', title:'혈당 롤러코스터 차단 — 두 번째 고리 공략',
      center:'식이 센터 + 대사 센터', centerIcons:['🍽️','⚠️'],
      weekly_target:'이번 주 목표: 식후 혈당 안정화 → 오후 식욕 감소',
      failure_expose:'혈당 불안정은 식욕 조절 불능과 지방 축적의 연결고리입니다.',
      axis_logic:'저GI 식단 + 식후 걷기로 두 번째 악순환 고리를 차단합니다.',
      keyFocus:['혈당 안정','저GI 식단','식후 운동'],
      exercise_ban:'공복 고강도',
      exercise_ok:'식후 15분 걷기 + 걷기 30분',
      exercise_detail:'매 식후 걷기 15분 / 매일 총 걷기 30분',
      diet_ban:'정제당·흰쌀밥 단독',
      diet_ok:'탄수화물 순서 식사 + 저GI',
      meal_plan:'채소→단백질→탄수화물 순서 3식',
      recovery_ban:'',
      recovery_ok:'코르티솔 루틴 지속',
      science_note:'혈당 안정화는 코르티솔과 연결되어 두 고리를 동시에 개선하는 레버리지 포인트입니다.',
    },
    { week:4, weekLabel:'4주차', phase:'순환 개통', phaseColor:'var(--sub)',
      icon:'💧', title:'순환 통로 개통 — 세 번째 고리 공략',
      center:'순환 센터 + 체형 센터', centerIcons:['💧','🦴'],
      weekly_target:'이번 주 목표: 부종·순환 개선 시작',
      failure_expose:'순환 정체는 다른 모든 악순환을 강화합니다.',
      axis_logic:'3가지 고리가 동시에 느슨해지기 시작하는 4주차입니다.',
      keyFocus:['순환 개통','부종 감소','악순환 3개 동시 공략'],
      exercise_ban:'',
      exercise_ok:'걷기 30분 + 스트레칭 15분',
      exercise_detail:'매일 걷기 30분 / 화·목 수중 걷기 20분',
      diet_ban:'나트륨 과다',
      diet_ok:'파인애플+셀러리+수분 2.5L',
      meal_plan:'기존 패턴 유지 + 수분 증가',
      recovery_ban:'',
      recovery_ok:'복부 온찜질 10분',
      science_note:'4주차는 코르티솔+혈당+순환 3개 고리가 동시에 개선되기 시작하는 변곡점입니다.',
    },
    { week:5, weekLabel:'5주차', phase:'복합 가속', phaseColor:'var(--sub)',
      icon:'🔥', title:'다축 복합 가속 — 악순환을 선순환으로',
      center:'전체 통합', centerIcons:['⚠️','💧','🍽️'],
      weekly_target:'이번 주 목표: 체중·에너지·부종 동시 개선 확인',
      failure_expose:'악순환이 선순환으로 바뀌기 시작하는 5주차입니다.',
      axis_logic:'3개 고리가 선순환하면 나머지 고리들도 자연스럽게 풀립니다.',
      keyFocus:['선순환 전환','복합 효과','가속'],
      exercise_ban:'',
      exercise_ok:'걷기 35분 + 저강도 근력 20분',
      exercise_detail:'매일 걷기 35분 / 화·목·토 근력 20분',
      diet_ban:'',
      diet_ok:'저GI+항염+단백질 지속',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 8시간 지속',
      science_note:'악순환 3개 동시 차단 시 체중 감소 속도가 단일 고리 공략 대비 2.3배 빨라집니다.',
    },
    { week:6, weekLabel:'6주차', phase:'중간 점검', phaseColor:'var(--sub)',
      icon:'📊', title:'6주 중간 측정 — 악순환 해소 상태 점검',
      center:'전체 통합', centerIcons:['⚠️','🌙'],
      weekly_target:'이번 주 목표: 3개 고리 개선 수치 확인',
      failure_expose:'6주 다축 개입 효과를 수치로 확인합니다.',
      axis_logic:'데이터 기반 추가 공략 고리 결정.',
      keyFocus:['다축 측정','고리 점검','처방 조정'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 유지',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'6주차 다축 개선 확인 후 남은 고리를 추가 공략합니다.',
    },
    { week:7, weekLabel:'7주차', phase:'지방 연소 가속', phaseColor:'var(--circ)',
      icon:'🔥', title:'악순환 해소 위에서 지방 연소 본격화',
      center:'대사 센터 + 식이 센터', centerIcons:['⚠️','🍽️'],
      weekly_target:'이번 주 목표: 지방 연소 가속 — 체중 1kg 추가 감소',
      failure_expose:'악순환이 해소된 7주차부터 지방 연소 효율이 급격히 높아집니다.',
      axis_logic:'운동 강도를 높이고 칼로리 최적화를 강화합니다.',
      keyFocus:['지방 연소 가속','운동 강화','대사 극대화'],
      exercise_ban:'',
      exercise_ok:'빠른 걷기 40분 + 근력 25분',
      exercise_detail:'매일 빠른 걷기 40분 / 화·목·토 근력+요가 25분',
      diet_ban:'알코올·야식',
      diet_ok:'단백질+항염+저GI',
      meal_plan:'아침: 달걀+채소 / 점심: 닭가슴살샐러드 / 저녁 7시 전: 두부+채소국',
      recovery_ban:'',
      recovery_ok:'수면+호흡 루틴 지속',
      science_note:'다축 악순환 해소 후 지방 연소 효율이 단순 다이어트 대비 40% 높아집니다.',
    },
    { week:8, weekLabel:'8주차', phase:'선순환 안정', phaseColor:'var(--circ)',
      icon:'⚡', title:'선순환 패턴 안정화',
      center:'전체 통합', centerIcons:['💧','🌙','🍽️'],
      weekly_target:'이번 주 목표: 선순환 패턴 안정화 확인',
      failure_expose:'8주차는 선순환이 자동화되기 시작하는 시점입니다.',
      axis_logic:'선순환을 유지하면서 운동량을 늘립니다.',
      keyFocus:['선순환 안정','자동화','운동량 증가'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 강화',
      exercise_detail:'기존 루틴 110% (세트 수 증가)',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'수면 8시간 지속',
      science_note:'8주 다축 복합 프로토콜은 악순환 해소 + 체중 3~4kg 감소를 달성합니다.',
    },
    { week:9, weekLabel:'9주차', phase:'체형 조각', phaseColor:'var(--circ)',
      icon:'✨', title:'전신 체형 조각',
      center:'체형 센터 + 대사 센터', centerIcons:['🦴','⚠️'],
      weekly_target:'이번 주 목표: 전신 체형 변화 가시화',
      failure_expose:'9주차는 변화를 눈으로 확인하는 시점입니다.',
      axis_logic:'강도 유지 + 체형 조각 집중.',
      keyFocus:['체형 조각','전신 라인','완성도'],
      exercise_ban:'',
      exercise_ok:'기존 루틴 + 스트레칭 10분 추가',
      exercise_detail:'기존 루틴 + 전신 스트레칭',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'다중악순환 해소 후 체형 조각 단계 — 복합 효과가 시너지를 냅니다.',
    },
    { week:10, weekLabel:'10주차', phase:'체형 완성', phaseColor:'var(--vis)',
      icon:'🏆', title:'다중악순환형 체형 완성',
      center:'전체 통합', centerIcons:['⚠️','🌙','💧'],
      weekly_target:'이번 주 목표: 최종 측정 — 악순환 해소 상태 최종 확인',
      failure_expose:'10주 다축 복합 중재 완성.',
      axis_logic:'완성 단계, 유지 패턴 설계 시작.',
      keyFocus:['최종 측정','성과 확인','유지 준비'],
      exercise_ban:'',
      exercise_ok:'현재 루틴 유지',
      exercise_detail:'기존 루틴 100%',
      diet_ban:'',
      diet_ok:'현재 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'전신 이완 마사지',
      science_note:'10주 다축 복합 프로토콜은 악순환 해소 + 체중 감소 + 에너지 개선을 동시에 달성합니다.',
    },
    { week:11, weekLabel:'11주차', phase:'유지 패턴 설계', phaseColor:'var(--vis)',
      icon:'🔮', title:'다중악순환형 유지 — 선순환 평생 유지',
      center:'전체 통합', centerIcons:['🌙','🍽️','💧'],
      weekly_target:'이번 주 목표: 선순환 유지 루틴 확립',
      failure_expose:'다중 악순환 체질은 한 고리라도 무너지면 다시 악순환이 시작됩니다.',
      axis_logic:'최소 유지 루틴을 다축으로 확립합니다.',
      keyFocus:['선순환 유지','다축 루틴','장기 전략'],
      exercise_ban:'급격한 중단',
      exercise_ok:'걷기 주 5회 + 수면 8시간 + 저GI 식단',
      exercise_detail:'주 5회 걷기 30분 + 수면 루틴 유지',
      diet_ban:'야식·알코올 재개',
      diet_ok:'저GI+항염 식단 유지',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'월 1회 다축 상태 점검',
      science_note:'선순환 패턴이 3개월 이상 지속되면 뇌의 습관 회로에 새로운 패턴이 고착화됩니다.',
    },
    { week:12, weekLabel:'12주차', phase:'3개월 완성', phaseColor:'var(--sub)',
      icon:'🎯', title:'다중악순환형 3개월 완성',
      center:'전체 통합', centerIcons:['🌪️','⚠️','🌙'],
      weekly_target:'이번 주 목표: 3개월 전후 비교 + B2B 연계',
      failure_expose:'3개월 다축 악순환 해소 + 선순환 전환 프로토콜 완성.',
      axis_logic:'12주 성과 정리 + 내과·심리상담·영양사 연계.',
      keyFocus:['12주 완성','성과 정리','B2B 연계'],
      exercise_ban:'',
      exercise_ok:'달성 기념 운동 1시간',
      exercise_detail:'달성 기념 자유 운동',
      diet_ban:'폭식',
      diet_ok:'보상 외식 1회',
      meal_plan:'기존 패턴 유지',
      recovery_ban:'',
      recovery_ok:'내과·심리상담·영양사 연계 지속 관리',
      science_note:'12주 다중악순환 복합 프로토콜은 체중 4~6kg 감소, 에너지 레벨 50% 회복, 악순환 고리 3개 이상 해소를 달성합니다.',
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
// 10-E. getRoadmapWeeks() — 완전 통합 처방 생성기 (BC코드+닉네임+오행+기질 4축 개인화)
// ① bc_primary: 'BC-1'~'BC-16' 직접 코드 OR 한글 닉네임 → NICKNAME_TO_BC → BC 모체 처방
//    ★ BC-1~BC-16 직접 입력 권장 (survey-hospital.html determineOutlineBC() 결과)
// ② NICKNAME_OVERLAY(bc_primary=한글 닉네임) → 22개 닉네임별 스토리 미세 조정
// ③ OHAENG_OVERLAY(ohaeng_type) → 오행 기질(목/화/토/금/수) 레이어 추가
// ④ computeNutrition(goal_weight) → 칼로리/탄단지 주입
// ──────────────────────────────────────────────
function getRoadmapWeeks(bc_primary, goal_weight, weight_loss_pct, user_name, ohaeng_type, gender, age) {
  var name    = user_name   || '회원';
  var ohaeng  = ohaeng_type || null;

  // ① bc_primary → BC 모체 코드 결정
  //    bc_primary는 한글 닉네임('스트레스성 야식부엉이형') OR BC 숫자코드('BC-6') 둘 다 처리
  var bcKey = 'BC-6';
  if (bc_primary) {
    var s = String(bc_primary).trim();
    // 숫자 코드 형식 (BC-1~BC-16) 직접 입력된 경우
    var mCode = s.match(/^BC-(\d{1,2})$/i);
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

  // ② BC 모체 처방 로드 (BC-1~BC-16 지원, fallback은 BC-3 단단내장형)
  var baseWeeks = BC_ROADMAP_DB[bcKey] || BC_ROADMAP_DB['BC-3'] || BC_ROADMAP_DB['BC-6'];

  // ③ 닉네임 오버레이 로드
  var nickOv = (bc_primary && typeof NICKNAME_OVERLAY !== 'undefined')
    ? (NICKNAME_OVERLAY[String(bc_primary).trim()] || null) : null;

  // ④ 오행 오버레이 로드
  var ohaengOv = (ohaeng && typeof OHAENG_OVERLAY !== 'undefined')
    ? (OHAENG_OVERLAY[ohaeng] || null) : null;

  // ⑤ 칼로리 계산
  // goal_weight가 null이어도 BC 타입별 표준 목표체중 fallback으로 칼로리 항상 계산
  var BC_DEFAULT_GOAL_WEIGHTS = {
    // 하체형
    'BC-1':57, 'BC-2':55, 'BC-7':59, 'BC-8':56,
    // 복부형
    'BC-3':60, 'BC-4':58, 'BC-5':56, 'BC-6':57,
    // 상체형
    'BC-9':58, 'BC-10':56, 'BC-11':57, 'BC-12':55,
    // 전신형
    'BC-13':58, 'BC-14':57, 'BC-15':62, 'BC-16':60,
  };
  var BC_DEFAULT_LOSS_PCT = {
    // 하체형
    'BC-1':12, 'BC-2':10, 'BC-7':14, 'BC-8':10,
    // 복부형
    'BC-3':15, 'BC-4':13, 'BC-5':11, 'BC-6':12,
    // 상체형
    'BC-9':12, 'BC-10':10, 'BC-11':11, 'BC-12':10,
    // 전신형
    'BC-13':13, 'BC-14':12, 'BC-15':15, 'BC-16':14,
  };
  var effectiveGoalWeight = (goal_weight != null && goal_weight > 0)
    ? goal_weight
    : (BC_DEFAULT_GOAL_WEIGHTS[bcKey] || 58);
  var effectiveLossPct = (weight_loss_pct != null && weight_loss_pct > 0)
    ? weight_loss_pct
    : (BC_DEFAULT_LOSS_PCT[bcKey] || 12);
  var nutritionData = computeNutrition(null, effectiveGoalWeight, effectiveLossPct, null, gender, age);
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
      // 회복 추가 (모든 주차에 적용 — 오행 기질 회복 루틴은 12주 전체에 유지)
      if (ohaengOv.recovery_add) {
        item.recovery_ok = (item.recovery_ok || '') + ' · ' + ohaengOv.recovery_add;
      }
    }

    // 칼로리·탄단지 주입 (nutritionData는 항상 존재)
    if (nutritionData) {
      var v = nutritionData.weekVariants.filter(function(x){ return x.week === item.week; })[0]
           || nutritionData.weekVariants[0];

      // 오행별 탄단지 비율 실제 수치 override
      // diet_macro_note 형식: '탄수화물 : 단백질 : 지방 = C : P : F (...)'
      var finCarbG = v.carbG, finProteinG = v.proteinG, finFatG = v.fatG;
      var ohaengMacroNote = ohaengOv ? ohaengOv.diet_macro_note : null;
      if (ohaengMacroNote) {
        // '= 숫자 : 숫자 : 숫자' 패턴 파싱
        var macroMatch = ohaengMacroNote.match(/=\s*(\d+)\s*:\s*(\d+)\s*:\s*(\d+)/);
        if (macroMatch) {
          var oCarbPct    = parseInt(macroMatch[1], 10);
          var oProteinPct = parseInt(macroMatch[2], 10);
          var oFatPct     = parseInt(macroMatch[3], 10);
          var totalPct    = oCarbPct + oProteinPct + oFatPct;
          if (totalPct > 0 && totalPct <= 110) { // 합산 검증 (100 ± 여유)
            var wKcal = v.kcal;
            finCarbG    = Math.round(wKcal * (oCarbPct    / totalPct) / 4);
            finProteinG = Math.round(wKcal * (oProteinPct / totalPct) / 4);
            finFatG     = Math.round(wKcal * (oFatPct     / totalPct) / 9);
          }
        }
      }

      item.nutrition = {
        kcal:     v.kcal,
        carbG:    finCarbG,
        proteinG: finProteinG,
        fatG:     finFatG,
        note:     v.note,
        // 오행 탄단지 오버라이드 적용 여부 표시
        macro_note:       ohaengMacroNote || null,
        ohaeng_overrided: !!(ohaengMacroNote && finCarbG !== v.carbG),
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
// 11-A. 공통 TOP3 처방 산출 파이프라인
//
// computeTop3Prescriptions(axisScores, answers, track)
//   axisScores : { A01~A10 } — 설문 채점 결과 (0~100 or 0~10 공통 처리)
//   answers    : 설문 원문 응답 객체 (optional)
//   track      : 'hospital' | 'aesthetic' | 'fitness' (default: 'hospital')
//
// 반환값:
//   {
//     top3      : ['회복','식단','심리'],     // 도메인명 배열 (최대 3개)
//     top3Scores: { '회복':82, '식단':67 },  // 도메인별 점수 (0~100 정규화)
//     top3Full  : [{ key:'회복', score:82, icon:'🌙', color:'#6a4fb0' }, ...],
//     allScores : { '회복':82, '식단':67, ... },   // 11개 전체 점수
//   }
//
// 설계 원칙:
//   - hospital/aesthetic 공통: axisScores A01~A10 가중합으로 도메인 점수 산출
//   - track 파라미터로 에스테틱 특화 가중치(체형/순환/시술) 보정
//   - 결과지가 이 함수를 호출해 window.__STRONG_AXES__ / window._top3 세팅
//   - slimmind_meta_ 저장 포함 → slimmind-today.html 자동 연동
// ──────────────────────────────────────────────

// 도메인별 axisScores 가중합 정의 (병원/공통) — 설계도 11영역 확정표 기준 2026-08-08
// [수정] 식단: A01×1.5+A05×1.3+A08×0.8 (舊: A01×1.8+A05×1.2+A08×0.5)
// [수정] 심리: A08×1.8+A07×1.2 (舊: A08×1.8+A07×1.2+A05×0.5 → A05 제거)
// [수정] 시술: A02×1.3+A06×1.0+A04×0.8+A03×0.6 (舊: A02×1.0+A06×0.8+A09×0.5)
var _DOMAIN_AXIS_WEIGHTS_HOSPITAL = {
  '식단':  { A01:1.5, A05:1.3, A08:0.8 },            // 설계도: A01×1.5+A05×1.3+A08×0.8
  '심리':  { A08:1.8, A07:1.2 },                     // 설계도: A08×1.8+A07×1.2 (A05 없음)
  '호르몬':{ A03:1.8, A07:0.8, A01:0.5 },            // ✅ 일치
  '운동':  { A04:1.5, A06:0.8, A02:0.5 },            // ✅ 일치
  '회복':  { A07:1.5, A08:1.0, A02:0.5 },            // ✅ 일치
  '체형':  { A06:1.8, A04:1.2, A02:0.8 },            // ✅ 일치
  '한방':  { A02:1.2, A03:0.8, A05:0.8 },            // ✅ 일치
  '관리':  { A09:1.8, A01:1.0, A03:0.8 },            // ✅ 일치
  '시술':  { A02:1.3, A06:1.0, A04:0.8, A03:0.6 },  // 설계도: A02×1.3+A06×1.0+A04×0.8+A03×0.6
  '약물':  { A09:1.5, A01:0.8, A03:0.5 },            // ✅ 일치
  '철학':  { A10:1.5, A07:0.5 },                     // ✅ 일치
};

// 도메인별 가중치 정의 (에스테틱 특화 — 체형/순환/시술 강조)
var _DOMAIN_AXIS_WEIGHTS_AESTHETIC = {
  '식단':  { A01:1.5, A05:1.0, A08:0.4 },
  '심리':  { A08:1.5, A07:1.0, A05:0.4 },
  '호르몬':{ A03:1.5, A07:0.7, A01:0.4 },
  '운동':  { A04:1.2, A06:1.0, A02:0.5 },
  '회복':  { A07:1.2, A08:0.9, A02:0.4 },
  '체형':  { A06:2.0, A04:1.5, A02:1.0 },  // 에스테틱: 체형 강조
  '한방':  { A02:1.0, A03:0.7, A05:0.7 },
  '관리':  { A09:1.5, A01:0.8, A03:0.7 },
  '시술':  { A02:1.2, A06:1.0, A09:0.8 },  // 에스테틱: 시술 강조
  '약물':  { A09:1.2, A01:0.6, A03:0.4 },
  '철학':  { A10:1.2, A07:0.4 },
  '순환':  { A02:2.0, A05:1.2, A07:0.6 },  // 에스테틱: 순환 강조
};

// 도메인 메타 (아이콘·색상)
var _DOMAIN_META = {
  '식단':  { icon:'🍽️', color:'#c98a3c' },
  '심리':  { icon:'🧠', color:'#2e7d32' },
  '호르몬':{ icon:'⚗️', color:'#C0397A' },
  '운동':  { icon:'💪', color:'#ef6c00' },
  '회복':  { icon:'🌙', color:'#6a4fb0' },
  '체형':  { icon:'🦴', color:'#00acc1' },
  '한방':  { icon:'🌿', color:'#00695c' },
  '관리':  { icon:'🔬', color:'#795548' },
  '시술':  { icon:'✨', color:'#1565c0' },
  '약물':  { icon:'💊', color:'#d32f2f' },
  '철학':  { icon:'🕊️', color:'#607d8b' },
  '순환':  { icon:'💧', color:'#1565C0' },
};

// ──────────────────────────────────────────────────────────────────
// GAP-05 (2026-08-18): 처방 신뢰도 동적 계산 함수
// 설계도 공식: 기본70 + 응답완성도(답/전체×15) + 판정확신(격차≥3→+10/≥1.5→+6/else→+3)
//              + 배경일치+3 (배경답과 1등축 동방향), 상한 95
// ──────────────────────────────────────────────────────────────────
function computeConfidenceScore(opts) {
  // opts: { answeredQ, totalQ, axisScores, topAxis, background }
  var answered = Number(opts.answeredQ || 0);
  var total    = Number(opts.totalQ || 50);
  var ax       = opts.axisScores || {};
  var topAxis  = opts.topAxis || '';      // 1등 축 키 (e.g. 'A01')
  var bg       = opts.background || '';   // '갱년기'|'출산'|'약물'|null

  // 1) 기본 70
  var score = 70;

  // 2) 응답 완성도: (답한 문항 / 전체) × 15
  if (total > 0) score += Math.round((answered / total) * 15);

  // 3) 판정 확신도: 1등축과 2등축 점수 격차
  var sortedAxes = Object.entries(ax)
    .filter(function(e) { return e[0].startsWith('A'); })
    .sort(function(a,b) { return b[1] - a[1]; });
  var gap = 0;
  if (sortedAxes.length >= 2) gap = (sortedAxes[0][1] || 0) - (sortedAxes[1][1] || 0);
  if (gap >= 3)   score += 10;
  else if (gap >= 1.5) score += 6;
  else            score += 3;

  // 4) 배경 일치 보정 +3
  // 배경과 1등축 동방향 매핑
  var BG_AXIS_MAP = { '갱년기': 'A03', '출산': 'A06', '약물': 'A08', 'PCOS': 'A03', '번아웃': 'A07' };
  var bgAxis = BG_AXIS_MAP[bg] || null;
  if (bgAxis && topAxis && bgAxis === topAxis) score += 3;

  // 상한 95 (자기보고 데이터 한계)
  return Math.min(95, Math.round(score));
}

// ──────────────────────────────────────────────────────────────────
// GAP-06 (2026-08-18): 헤어샵 전용 도메인 가중치 테이블 독립 정의
// 설계도: 헤어샵 채널 특화 — 관리(두피/탈모) A09×1.8 핵심, 채널 간섭 차단
// ──────────────────────────────────────────────────────────────────
var _DOMAIN_AXIS_WEIGHTS_SALON = {
  '식단':  { A01:1.2, A05:1.0, A08:0.6 },           // 헤어샵: 식단 영향 축소
  '심리':  { A08:1.5, A07:1.0 },                     // 헤어샵: 심리 영향
  '호르몬':{ A03:1.5, A07:0.7, A01:0.4 },            // 헤어샵: 호르몬 (탈모 관련)
  '운동':  { A04:1.2, A06:0.8, A02:0.5 },            // 헤어샵: 운동
  '회복':  { A07:1.3, A08:0.9, A02:0.4 },            // 헤어샵: 회복
  '체형':  { A06:1.5, A04:1.0, A02:0.8 },            // 헤어샵: 체형 (병원보다 낮춤)
  '한방':  { A02:1.2, A03:0.8, A05:0.8 },            // 헤어샵: 한방 (병원과 동일)
  '관리':  { A09:1.8, A01:1.0, A03:0.8 },            // ★ 헤어샵 핵심: 두피·탈모 관리 A09×1.8
  '시술':  { A02:1.0, A06:0.8, A04:0.6, A03:0.5 },  // 헤어샵: 시술 가중치 축소
  '약물':  { A09:1.5, A01:0.8, A03:0.5 },            // 헤어샵: 약물 (탈모 약 포함)
  '철학':  { A10:1.2, A07:0.4 },                     // 헤어샵: 기질 (낮춤)
};

// ★ BUG-C 수정 (2026-08-17): 에스테틱 안전핀 — BC_DOMAIN_RULES exclude:['aesthetic'] 반영
// 설계도: BC-1/BC-10/BC-13/BC-14 → 시술(aesthetic) 도메인 top5 진입 불가
// computeTop3Prescriptions(axisScores, answers, track, bcCode)
//   bcCode: 'BC-1'~'BC-16' (옵셔널) — 에스테틱 안전핀 적용 기준
var _BC_AESTHETIC_EXCLUDE = ['BC-1', 'BC-10', 'BC-13', 'BC-14'];

function computeTop3Prescriptions(axisScores, answers, track, bcCode) {
  var _track = track || 'hospital';
  // GAP-06 (2026-08-18): 채널별 독립 가중치 완전 분리
  // hospital → _DOMAIN_AXIS_WEIGHTS_HOSPITAL
  // aesthetic → _DOMAIN_AXIS_WEIGHTS_AESTHETIC
  // salon → _DOMAIN_AXIS_WEIGHTS_SALON (헤어샵 전용, A09×1.8 관리 핵심)
  var _weights = (_track === 'aesthetic')
    ? _DOMAIN_AXIS_WEIGHTS_AESTHETIC
    : (_track === 'salon')
      ? _DOMAIN_AXIS_WEIGHTS_SALON
      : _DOMAIN_AXIS_WEIGHTS_HOSPITAL;

  // axisScores 스케일 정규화 (0~10 → 0~100, 이미 0~100이면 그대로)
  var _ax = {};
  Object.keys(axisScores || {}).forEach(function(k) {
    var v = Number(axisScores[k]) || 0;
    _ax[k] = (v <= 10 && v > 0) ? v * 10 : v; // 0~10 → ×10
  });

  // 도메인별 가중합 산출 (0~100 스케일)
  var allScores = {};
  Object.keys(_weights).forEach(function(dom) {
    var ws = _weights[dom];
    var sumW = 0, sumS = 0;
    Object.keys(ws).forEach(function(axKey) {
      var s = _ax[axKey] || 0;
      sumS += s * ws[axKey];
      sumW += ws[axKey];
    });
    allScores[dom] = sumW > 0 ? Math.round(sumS / sumW) : 0;
  });

  // ★ 에스테틱 안전핀: BC-1/BC-10/BC-13/BC-14 → 시술 도메인 점수 0 강제
  // BC_DOMAIN_RULES exclude:['aesthetic'] 설계도 규칙 프론트 반영
  var _bcCode = (bcCode || '').toString().trim().toUpperCase().replace(/\s/g, '');
  if (_track === 'aesthetic' && _bcCode && _BC_AESTHETIC_EXCLUDE.indexOf(_bcCode) >= 0) {
    if (allScores['시술'] !== undefined) {
      console.log('[bc-engine] 안전핀 적용: ' + _bcCode + ' → 시술 점수 ' + allScores['시술'] + '→0 (exclude:aesthetic)');
      allScores['시술'] = 0;
    }
  }

  // 점수순 정렬 → TOP3 추출
  var sorted = Object.keys(allScores)
    .sort(function(a, b) { return allScores[b] - allScores[a]; });
  var top3 = sorted.slice(0, 3);

  var top3Scores = {};
  top3.forEach(function(k) { top3Scores[k] = allScores[k]; });

  var top3Full = top3.map(function(k) {
    var meta = _DOMAIN_META[k] || { icon:'📋', color:'#888' };
    return { key: k, score: allScores[k], icon: meta.icon, color: meta.color };
  });

  return {
    top3:       top3,       // ['회복','식단','심리']
    top3Scores: top3Scores, // { '회복': 82, ... }
    top3Full:   top3Full,   // [{ key, score, icon, color }, ...]
    allScores:  allScores,  // 전체 도메인 점수
  };
}

// ══════════════════════════════════════════════════════════════════
// 11-B. TagEngine — 설문 응답 → TAG 배열 + 4대 지표 독립 연산
// ══════════════════════════════════════════════════════════════════

/**
 * extractTags(answers)
 * raw_answers(stage2/pfProfile/stage3 포함) 또는 bc-engine answers 객체를 받아
 * TAG 배열 및 메타정보를 반환한다.
 *
 * 반환값:
 *   tags        : string[]  — TAG_* 식별자 배열
 *   tagMeta     : object    — { TAG_*: { label, category, severity } }
 *   motivation  : string    — 'child'|'partner'|'self'|'health'|'appearance'
 *   mealEnv     : string[]  — ['delivery','convenience','cooking','single','canteen']
 *   goalType    : string    — 'slim_tight'|'health_balance'|'aesthetic'|'muscle'
 *   triggerType : string    — 'burnout'|'stress_event'|'postpartum'|'yoyo'|'gradual'|'none'
 *   shiftWork   : boolean   — 교대·야간근무 여부
 */
function extractTags(answers) {
  var tags = [];
  var tagMeta = {};
  var motivation = 'self';
  var mealEnv = [];
  var goalType = 'health_balance';
  var triggerType = 'none';
  var shiftWork = false;

  function addTag(t, label, category, severity) {
    if (tags.indexOf(t) < 0) {
      tags.push(t);
      tagMeta[t] = { label: label || t, category: category || 'general', severity: severity || 1 };
    }
  }

  var ans = answers || {};
  // raw_answers 구조 지원 (survey-hospital 저장 형태)
  var stage2 = ans.stage2 || {};
  var pfProfile = ans.pfProfile || ans.pf_profile || {};
  var rawStage3 = ans.stage3 || {};

  // ── 헬퍼: 2차 카드 인덱스 포함 여부 ──
  function s2Has(qno, idx) {
    var v = stage2[qno] !== undefined ? stage2[qno] : (ans['q' + qno] !== undefined ? ans['q' + qno] : undefined);
    if (v === undefined) {
      // flat 키도 지원 (disease, long_term_drugs 등)
      return false;
    }
    if (Array.isArray(v)) return v.indexOf(idx) > -1;
    return v === idx;
  }

  // ── Q3: 진단 질환 ──
  // 0=PCOS 1=당뇨 2=고혈압 3=갑상선 4=지방간 5=역류위장 6=우울불안 7=없음
  var disease = ans.disease || (Array.isArray(stage2[3]) ? stage2[3] : null);
  if (Array.isArray(disease)) {
    if (disease.indexOf(0) > -1) addTag('TAG_PCOS', '다낭성난소증후군', 'hormone', 3);
    if (disease.indexOf(1) > -1) addTag('TAG_DIABETES', '당뇨·전당뇨', 'metabolic', 3);
    if (disease.indexOf(2) > -1) addTag('TAG_HYPERTENSION', '고혈압', 'cardiovascular', 3);
    if (disease.indexOf(3) > -1) addTag('TAG_THYROID', '갑상선 질환', 'hormone', 3);
    if (disease.indexOf(4) > -1) addTag('TAG_FATTY_LIVER', '지방간', 'metabolic', 2);
    if (disease.indexOf(5) > -1) addTag('TAG_GERD', '역류성식도염', 'digestive', 2);
    if (disease.indexOf(6) > -1) addTag('TAG_DEPRESSION', '우울·불안장애', 'mental', 3);
  }
  // redFlags 배열도 지원
  var redFlags = ans.redFlags || ans.red_flags || (typeof window !== 'undefined' && window._redFlags) || [];
  if (redFlags.indexOf('PCOS') > -1)         addTag('TAG_PCOS', '다낭성난소증후군', 'hormone', 3);
  if (redFlags.indexOf('DIABETES') > -1)     addTag('TAG_DIABETES', '당뇨·전당뇨', 'metabolic', 3);
  if (redFlags.indexOf('HTN') > -1)          addTag('TAG_HYPERTENSION', '고혈압', 'cardiovascular', 3);
  if (redFlags.indexOf('THYROID') > -1)      addTag('TAG_THYROID', '갑상선 질환', 'hormone', 3);
  if (redFlags.indexOf('FATTY_LIVER') > -1)  addTag('TAG_FATTY_LIVER', '지방간', 'metabolic', 2);
  if (redFlags.indexOf('YOYO') > -1)         addTag('TAG_YOYO', '요요 반복', 'history', 2);
  if (redFlags.indexOf('STEROID') > -1)      addTag('TAG_STEROID', '스테로이드 복용', 'medication', 2);

  // ── Q6: 장기 복용약 ──
  var drugs = ans.long_term_drugs || (Array.isArray(stage2[6]) ? stage2[6] : null);
  if (Array.isArray(drugs)) {
    if (drugs.indexOf(0) > -1) addTag('TAG_STEROID', '스테로이드', 'medication', 2);
    if (drugs.indexOf(1) > -1) addTag('TAG_ANTIDEPRESSANT', '항우울제', 'medication', 2);
    if (drugs.indexOf(2) > -1) addTag('TAG_HORMONE_MED', '피임약·호르몬제', 'medication', 2);
    if (drugs.indexOf(3) > -1) addTag('TAG_ANTICOAGULANT', '항응고제', 'medication', 2);
    if (drugs.indexOf(4) > -1) addTag('TAG_ISOTRETINOIN', '이소트레티노인', 'medication', 2);
    if (drugs.indexOf(5) > -1) addTag('TAG_HAIRLOSS_RX', '탈모약', 'medication', 1);
  }
  // 고혈압 + 약물: 이뇨제 포함 여부는 HTN+복용약으로 유추
  if (tags.indexOf('TAG_HYPERTENSION') > -1) {
    addTag('TAG_DIURETICS', '혈압약·이뇨제', 'medication', 2);
  }

  // ── Q7: 식욕억제제 ──
  var appSupp = ans.appetite_suppressant !== undefined ? ans.appetite_suppressant : stage2[7];
  if (appSupp === 0 || appSupp === '여러 번 먹었어요')
    addTag('TAG_APPETITE_SUPP', '식욕억제제 다수', 'history', 2);

  // ── Q8: 살찐 계기 ──
  var trigger = ans.q8_trigger !== undefined ? ans.q8_trigger : stage2[8];
  var trigArr = Array.isArray(trigger) ? trigger : (trigger !== undefined ? [trigger] : []);
  if (trigArr.indexOf(0) > -1) { addTag('TAG_BURNOUT', '번아웃·과로', 'psychological', 2); triggerType = 'burnout'; }
  if (trigArr.indexOf(1) > -1) { addTag('TAG_STRESS_EVENT', '이별·심리 충격', 'psychological', 2); triggerType = 'stress_event'; }
  if (trigArr.indexOf(2) > -1)   addTag('TAG_SURGERY_TRIGGER', '수술·입원 계기', 'medical', 2);
  if (trigArr.indexOf(3) > -1)   addTag('TAG_ALCOHOL_HABIT', '잦은 회식·음주', 'lifestyle', 1);
  if (trigArr.indexOf(4) > -1)   addTag('TAG_QUIT_SMOKING', '금연 후 증가', 'lifestyle', 1);
  if (trigArr.indexOf(5) > -1) { if (triggerType === 'none') triggerType = 'gradual'; }

  // ── Q10: 요요 패턴 ──
  var wtData = ans.wtline || stage2[10];
  if (wtData && typeof wtData === 'object') {
    if (wtData.pat === 'yoyo') { addTag('TAG_YOYO', '요요 반복', 'history', 2); triggerType = 'yoyo'; }
    if ((wtData.cyc || 0) >= 3) addTag('TAG_YOYO_SEVERE', '요요 3회 이상', 'history', 3);
  }

  // ── Q11: 출산 (여성) ──
  var birth = ans.q11_event !== undefined ? ans.q11_event : stage2[11];
  var isMale = (ans.gender === '남' || ans.gender === '남성' ||
    (pfProfile.gender === '남') || (pfProfile.gender === '남성'));
  if (!isMale && birth === 0) {
    addTag('TAG_POSTPARTUM', '출산 후 체형 변화', 'history', 2);
    triggerType = 'postpartum';
  }

  // ── Q12: 갱년기 / 남성 복부 변화 ──
  var meno = ans.q12_menopause !== undefined ? ans.q12_menopause :
             (ans.Q_MENOPAUSE !== undefined ? ans.Q_MENOPAUSE : stage2[12]);
  if (!isMale) {
    if (meno === 0 || meno === 2 || meno === '완경 후' || meno === '완경 중') {
      addTag('TAG_MENOPAUSE', '갱년기·완경', 'hormone', 2);
    }
  } else {
    if (meno === 0) addTag('TAG_MALE_ANDROPAUSE', '남성 갱년기(복부 변화)', 'hormone', 2);
  }

  // ── 생활 리듬: 교대·야간 근무 ──
  var rhythmIdx = pfProfile._rhythmIdx !== undefined ? pfProfile._rhythmIdx :
                  (ans._rhythmIdx !== undefined ? ans._rhythmIdx : -1);
  // 리듬 텍스트로도 감지
  var rhythmText = pfProfile.rhythm || ans.rhythm || '';
  if (rhythmIdx === 5 || /교대|야간|shift/i.test(String(rhythmText))) {
    addTag('TAG_SHIFT_WORK', '교대·야간 근무', 'lifestyle', 2);
    addTag('TAG_SLEEP_DISORDER', '수면 리듬 장애', 'sleep', 2);
    shiftWork = true;
  }

  // ── 수면 장애: A07 고점 or 불면 응답 ──
  // A07(코르티솔·스트레스) 축 점수가 높거나, stage3 수면 관련 답변이 심할 때
  var axisScores = ans.axisScores || ans.axis_scores || {};
  var a07 = Number(axisScores['A07'] || 0);
  var a06 = Number(axisScores['A06'] || 0);  // 수면 포함
  // 0~10 스케일에서 7 이상 = 수면 문제
  if (a07 >= 7 || a06 >= 7) addTag('TAG_SLEEP_DISORDER', '수면·회복 장애', 'sleep', 2);
  // 우울증 동반
  if (tags.indexOf('TAG_DEPRESSION') > -1) {
    addTag('TAG_SLEEP_DISORDER', '수면·회복 장애', 'sleep', 2);
  }

  // ── 관절 문제: A04 고점 또는 진단 ──
  var a04 = Number(axisScores['A04'] || 0);
  if (a04 >= 7) addTag('TAG_JOINT', '관절·근감소', 'physical', 2);
  // 고혈압+고령 조합도 관절 위험
  if (tags.indexOf('TAG_HYPERTENSION') > -1) addTag('TAG_JOINT', '관절·근감소', 'physical', 2);

  // ── 동기부여 대상 ──
  // V6.1: _purposeIdx 인덱스 분기 우선 + desire.who 텍스트 보조
  // PF_PRACTICAL.purpose.opts 인덱스:
  //   0=시술·관리 상담  1=내 몸의 원인  2=다이어트 방향  3=피부·윤곽  4=지인 추천·이벤트
  var purposeIdx = pfProfile._purposeIdx !== undefined ? pfProfile._purposeIdx :
                   (ans._purposeIdx !== undefined ? ans._purposeIdx : -1);
  var desireWho   = (ans.desire && ans.desire.who) ? String(ans.desire.who) : '';
  var purposeRaw  = pfProfile.purpose || ans.purpose || ans.goal_target || '';
  var purposeAll  = String(purposeRaw) + ' ' + desireWho;

  if (purposeIdx === 0 || purposeIdx === 3) {
    // 시술·관리 or 피부·윤곽 상담 → appearance(외모) 동기
    motivation = 'appearance';
  } else if (purposeIdx === 1) {
    // 내 몸의 원인 → health 동기
    motivation = 'health';
  } else if (purposeIdx === 2) {
    // 다이어트 방향 → self 동기 (기본)
    motivation = 'self';
  } else if (purposeIdx === 4) {
    // 지인 추천·이벤트 → self
    motivation = 'self';
  } else {
    // 인덱스 없음 → 텍스트 매칭 (폴백)
    if (/자녀|아이|child/i.test(purposeAll))                   motivation = 'child';
    else if (/연인|파트너|partner|남자친구|여자친구/i.test(purposeAll)) motivation = 'partner';
    else if (/가족|family|부모|부부/i.test(purposeAll))         motivation = 'family';
    else if (/건강|health/i.test(purposeAll))                    motivation = 'health';
    else if (/시술|에스테틱|피부|윤곽|aesthetic/i.test(purposeAll)) motivation = 'appearance';
    else                                                          motivation = 'self';
  }
  // desire.who 텍스트로 자녀·연인 오버라이드 (purposeIdx보다 구체적인 경우)
  if (desireWho) {
    if (/자녀|아이|아들|딸|child|kids/i.test(desireWho))           motivation = 'child';
    else if (/연인|남자친구|여자친구|파트너|partner|남편|와이프|배우자/i.test(desireWho)) motivation = 'partner';
    else if (/가족|부모|엄마|아빠|family/i.test(desireWho))        motivation = 'family';
  }
  // TAG로도 추가
  if (motivation === 'child')      addTag('TAG_TARGET_CHILD', '자녀를 위한 동기', 'motivation', 1);
  if (motivation === 'partner')    addTag('TAG_TARGET_PARTNER', '연인을 위한 동기', 'motivation', 1);
  if (motivation === 'family')     addTag('TAG_TARGET_FAMILY', '가족을 위한 동기', 'motivation', 1);
  if (motivation === 'health')     addTag('TAG_TARGET_HEALTH', '건강 중심 동기', 'motivation', 1);
  if (motivation === 'appearance') addTag('TAG_TARGET_APPEARANCE', '외모·시술 동기', 'motivation', 1);
  if (motivation === 'self')       addTag('TAG_TARGET_SELF', '자기 자신을 위한 동기', 'motivation', 1);

  // ── 식사 환경 ── V6.1: desire.zone/track + pfProfile 리듬 인덱스 기반 파생
  // 실제 payload에 meal_env 필드 없음 → 다중 소스에서 파생
  var mealRaw = ans.meal_env || pfProfile.meal_env || ans.mealEnv || '';
  // (A) 기존 meal_env 필드가 있으면 텍스트 매칭 (폴백 호환)
  if (mealRaw) {
    if (/배달|delivery/i.test(String(mealRaw)))      { mealEnv.push('delivery');    addTag('TAG_DELIVERY',    '배달앱 의존',  'diet_env', 1); }
    if (/편의점|convenience/i.test(String(mealRaw))) { mealEnv.push('convenience'); addTag('TAG_CONVENIENCE', '편의점 식사', 'diet_env', 1); }
    if (/혼자|자취|single/i.test(String(mealRaw)))   { mealEnv.push('single');      addTag('TAG_SINGLE',      '자취·혼밥',  'diet_env', 1); }
    if (/구내식당|canteen/i.test(String(mealRaw)))   { mealEnv.push('canteen');     addTag('TAG_CANTEEN',     '구내식당',   'diet_env', 1); }
    if (/직접|요리|cooking/i.test(String(mealRaw)))  { mealEnv.push('cooking');     addTag('TAG_COOKING',     '직접 요리',  'diet_env', 1); }
  }
  // (B) pfProfile._rhythmIdx 인덱스로 식사 환경 파생
  // rhythm.opts: 0=직장인(앉음) 1=자영업·현장 2=학생 3=주부·육아 4=프리랜서·재택 5=교대·야간
  if (rhythmIdx === 0) {
    // 직장인 → 구내식당 or 배달 (도시 직장인 기본)
    if (mealEnv.indexOf('canteen') < 0) { mealEnv.push('canteen'); addTag('TAG_CANTEEN', '구내식당', 'diet_env', 1); }
  } else if (rhythmIdx === 1) {
    // 자영업·현장 → 편의점·불규칙
    if (mealEnv.indexOf('convenience') < 0) { mealEnv.push('convenience'); addTag('TAG_CONVENIENCE', '편의점 식사', 'diet_env', 1); }
  } else if (rhythmIdx === 2) {
    // 학생 → 편의점 + 야식
    if (mealEnv.indexOf('convenience') < 0) { mealEnv.push('convenience'); addTag('TAG_CONVENIENCE', '편의점 식사', 'diet_env', 1); }
    addTag('TAG_NIGHT_EATING', '야식·불규칙 식사', 'diet_env', 1);
  } else if (rhythmIdx === 3) {
    // 주부·육아 → 직접 요리 위주
    if (mealEnv.indexOf('cooking') < 0) { mealEnv.push('cooking'); addTag('TAG_COOKING', '직접 요리', 'diet_env', 1); }
  } else if (rhythmIdx === 4) {
    // 프리랜서·재택 → 자취·혼밥 + 배달 가능성
    if (mealEnv.indexOf('single') < 0)   { mealEnv.push('single');   addTag('TAG_SINGLE',   '자취·혼밥', 'diet_env', 1); }
    if (mealEnv.indexOf('delivery') < 0) { mealEnv.push('delivery'); addTag('TAG_DELIVERY', '배달앱 의존', 'diet_env', 1); }
  }
  // (C) 교대근무 → 야식 환경 (shiftWork는 이미 위에서 처리됨)
  if (shiftWork) addTag('TAG_NIGHT_EATING', '야식·불규칙 식사', 'diet_env', 2);
  // (D) 자영업·현장(rhythmIdx=1) → 불규칙 식사
  if (rhythmIdx === 1) addTag('TAG_NIGHT_EATING', '야식·불규칙 식사', 'diet_env', 1);
  // (E) pfProfile.rhythm 텍스트 보조 (인덱스 없을 때 폴백)
  if (rhythmIdx < 0) {
    var rhythmTxt = pfProfile.rhythm || ans.rhythm || '';
    if (/자취|혼자|재택|프리랜서/i.test(String(rhythmTxt))) {
      if (mealEnv.indexOf('single') < 0) { mealEnv.push('single'); addTag('TAG_SINGLE', '자취·혼밥', 'diet_env', 1); }
    }
    if (/학생|야식/i.test(String(rhythmTxt))) addTag('TAG_NIGHT_EATING', '야식·불규칙 식사', 'diet_env', 1);
    if (/주부|육아/i.test(String(rhythmTxt))) {
      if (mealEnv.indexOf('cooking') < 0) { mealEnv.push('cooking'); addTag('TAG_COOKING', '직접 요리', 'diet_env', 1); }
    }
  }

  // ── 목표 유형 ── V6.1: desire.track + desire.zone 활용
  // track: 'obesity'|'skin'|'plastic'  zone: 'upper'|'belly'|'lower'|'whole'|'face'|null
  var desireTrack = (ans.desire && ans.desire.track) ? String(ans.desire.track) : '';
  var desireZone  = (ans.desire && ans.desire.zone)  ? String(ans.desire.zone)  : '';
  var goalRaw     = pfProfile.purpose || ans.goal_type || ans.goalType || '';

  if (desireTrack === 'skin' || desireTrack === 'plastic') {
    // 피부·시술 트랙 → aesthetic
    goalType = 'aesthetic';
  } else if (desireTrack === 'obesity') {
    // 비만 트랙 → zone으로 세분화
    if (desireZone === 'belly' || desireZone === 'upper' || desireZone === 'lower') {
      goalType = 'slim_tight';  // 특정 부위 집중 슬림
    } else {
      goalType = 'health_balance';  // 전신(whole) or 미선택
    }
  } else if (goalRaw) {
    // 텍스트 폴백
    if (/슬림|탄탄|slim|tight/i.test(String(goalRaw)))          goalType = 'slim_tight';
    else if (/건강|균형|health|balance/i.test(String(goalRaw))) goalType = 'health_balance';
    else if (/시술|에스테틱|aesthetic/i.test(String(goalRaw)))  goalType = 'aesthetic';
    else if (/근육|muscle/i.test(String(goalRaw)))               goalType = 'muscle';
  }

  return {
    tags: tags,
    tagMeta: tagMeta,
    motivation: motivation,
    mealEnv: mealEnv,
    goalType: goalType,
    triggerType: triggerType,
    shiftWork: shiftWork,
  };
}

// ──────────────────────────────────────────────────────────────────
// 11-C. computeBodyMetrics() — 4대 바디 지표 독립 연산 (스케일 수정)
//
// 수정 이유:
//   axisScores 는 0~10 스케일인데 기존 가중치(×7 등)가 0~100 스케일을
//   가정하고 있어 항상 99%로 클램프됨.
//   → 정규화: axisScore ÷ 10 → 0~1 변환 후 ×100 스케일로 산출
//   → 결과: 0~100 범위에서 의미 있는 분포 (보통 20~85 범위)
// ──────────────────────────────────────────────────────────────────
function computeBodyMetrics(axisScores, answers, redFlags) {
  var _a = axisScores || {};
  var _ans = answers || {};
  var _rf  = redFlags || (typeof window !== 'undefined' && window._redFlags) || [];

  // 정규화 헬퍼: 0~10 → 0~1
  function n(key) { return Math.min(1, Math.max(0, Number(_a[key] || 0) / 10)); }

  // 나이 추출
  var realAge = 42;
  if (_ans.pfProfile && _ans.pfProfile.birthY) {
    realAge = new Date().getFullYear() - Number(_ans.pfProfile.birthY);
  } else if (_ans.age_group) {
    var agMap = {'20s':25,'30s':35,'40s':45,'50s':55,'60s':65};
    realAge = agMap[_ans.age_group] || 42;
  } else if (_ans.Q_AGE || _ans.age) {
    realAge = Number(_ans.Q_AGE || _ans.age) || 42;
  }
  if (realAge < 10 || realAge > 100) realAge = 42;

  // BMI 추정
  var w = Number((_ans.weight || _ans.curWeight || 0));
  var h = Number((_ans.height || 0));
  var bmi = (w > 30 && h > 100) ? w / Math.pow(h / 100, 2) : 23;

  // 갱년기 여부
  var menoVal = _ans['Q_MENOPAUSE'] || _ans.q12_menopause || '';
  var isMeno  = (menoVal === '완경 후' || menoVal === '완경 중' || menoVal === 'meno' ||
                 menoVal === 2 || menoVal === 0);

  // ─────────────────────────────────────────────────────────
  // 1. 대사 효율 나이 (Metabolic Age)
  //    베이스 = 실제 나이
  //    각 축(0~1) × 가중치를 더해 나이 편차를 산출 (최대 +20세)
  //    클램프: [실제나이-2, 실제나이+20]
  // ─────────────────────────────────────────────────────────
  var metaAgeRaw = realAge
    + n('A03') * 12    // 호르몬 저하 → 대사 노화
    + n('A07') * 8     // 코르티솔 만성 → 노화 가속
    + n('A05') * 7     // 스트레스 → 산화 스트레스
    + n('A06') * 6     // 수면 부족 → 노화
    + n('A01') * 5     // 인슐린 저항 → 대사 노화
    + n('A04') * 5     // 근감소 → 기초대사↓
    + (bmi > 27 ? 2 : 0)
    + (_rf.indexOf('THYROID') >= 0 ? 3 : 0)
    + (_rf.indexOf('PCOS')    >= 0 ? 2 : 0);
  var metaAge = Math.min(realAge + 20, Math.max(realAge - 2, Math.round(metaAgeRaw)));

  // ─────────────────────────────────────────────────────────
  // 2. 복부 위험도 (Abdominal Fat Index)  0~100
  //    기여: 인슐린(A01) > 스트레스(A05) > 식이(A08) > 수면(A06) > 근감소(A04) > 순환(A02)
  //    BMI, 진단 질환(DIABETES/FATTY_LIVER/PCOS) 보정
  //    구간: ≥80 고위험 / ≥60 경고 / ≥40 주의 / <40 양호
  // ─────────────────────────────────────────────────────────
  var bellyRaw =
      n('A01') * 35    // 인슐린 저항 — 내장지방 직결
    + n('A05') * 20    // 코르티솔·스트레스 → 복부 축적
    + n('A08') * 15    // 식이행동 → 과잉 칼로리
    + n('A06') * 12    // 수면 부족 → 그렐린↑
    + n('A04') * 10    // 근감소 → 기초대사↓
    + n('A02') * 8     // 순환 저하 → 지방 고착
    + (bmi > 25 ? 5 : 0) + (bmi > 30 ? 5 : 0)
    + (_rf.indexOf('DIABETES')    >= 0 ? 8 : 0)
    + (_rf.indexOf('FATTY_LIVER') >= 0 ? 6 : 0)
    + (_rf.indexOf('PCOS')        >= 0 ? 4 : 0);
  var metaBelly = Math.min(99, Math.max(8, Math.round(bellyRaw)));
  var bellyLevel = metaBelly >= 80 ? '고위험' : (metaBelly >= 60 ? '경고' : (metaBelly >= 40 ? '주의' : '양호'));

  // ─────────────────────────────────────────────────────────
  // 3. 호르몬 과부하 (Hormone Load Score)  0~100
  //    기여: 갑상선(A03) > 호르몬(A10) > 자율신경(A07) > 스트레스(A05) > 인슐린(A01) > 수면(A06)
  //    갱년기 +12, THYROID/PCOS 레드플래그 보정
  // ─────────────────────────────────────────────────────────
  var hormRaw =
      n('A03') * 30    // 갑상선·내분비 직결
    + n('A10') * 20    // 호르몬 기질 (기질 축이나 보조지표로 활용)
    + n('A07') * 20    // 자율신경·코르티솔 과부하
    + n('A05') * 15    // 스트레스 → HPA 과활성
    + n('A01') * 10    // 인슐린 저항 → 호르몬 불균형
    + n('A06') * 8     // 수면 → 멜라토닌·성장호르몬 교란
    + (isMeno ? 12 : 0)
    + (_rf.indexOf('THYROID') >= 0 ? 8 : 0)
    + (_rf.indexOf('PCOS')    >= 0 ? 7 : 0);
  var metaHormone = Math.min(99, Math.max(8, Math.round(hormRaw)));
  var hormLevel = metaHormone >= 80 ? '고위험' : (metaHormone >= 60 ? '경고' : (metaHormone >= 40 ? '주의' : '양호'));

  // ─────────────────────────────────────────────────────────
  // 4. 체형/순환 불균형 (Body Imbalance Index)  0~100
  //    기여: 수면(A06) > 순환(A02) > 근감소(A04) > 대사위험(A09) > 자율신경(A07) > 식이(A08)
  //    STEROID/HTN 레드플래그 보정
  // ─────────────────────────────────────────────────────────
  var bodyRaw =
      n('A06') * 28    // 골격·체형 불균형 직결
    + n('A02') * 22    // 림프·순환 정체 → 부종·비대칭
    + n('A04') * 22    // 근감소 → 체형 붕괴
    + n('A09') * 15    // 대사 위험인자 → 혈관·조직
    + n('A07') * 10    // 자율신경 → 순환 조절
    + n('A08') * 8     // 식이 → 영양 불균형
    + (_rf.indexOf('STEROID') >= 0 ? 6 : 0)
    + (_rf.indexOf('HTN')     >= 0 ? 4 : 0);
  var metaBody = Math.min(99, Math.max(8, Math.round(bodyRaw)));
  var bodyLevel = metaBody >= 80 ? '고위험' : (metaBody >= 60 ? '경고' : (metaBody >= 40 ? '주의' : '양호'));

  return {
    metaAge:     metaAge,
    realAge:     realAge,
    metaBelly:   metaBelly,
    bellyLevel:  bellyLevel,
    metaHormone: metaHormone,
    hormLevel:   hormLevel,
    metaBody:    metaBody,
    bodyLevel:   bodyLevel,
  };
}

// ──────────────────────────────────────────────────────────────────
// 11-D. getMedicalFilters(tags) → 처방 필터링 규칙 반환
//   반환: { banExercise[], banDiet[], requireDiet[], requireExercise[], safetyChip }
// ──────────────────────────────────────────────────────────────────
function getMedicalFilters(tags) {
  var t = tags || [];
  function has(tag) { return t.indexOf(tag) > -1; }

  var banExercise  = [];   // 이 운동 방식 금지
  var banDiet      = [];   // 이 식이 방식 금지
  var requireDiet  = [];   // 이 식이 방식 필수 적용
  var requireExercise = []; // 이 운동 방식 필수 적용
  var safetyChips  = [];   // 상단 메디컬 안전 칩

  // ── 고혈압 / 이뇨제 ──
  if (has('TAG_HYPERTENSION') || has('TAG_DIURETICS')) {
    banExercise.push('HIIT', 'HIGH_INTENSITY', 'FASTING_CARDIO');
    requireExercise.push('LOW_INTENSITY_INTERVAL', 'WALKING', 'LIGHT_STRETCH');
    requireDiet.push('LOW_SODIUM', 'POTASSIUM_RICH');
    safetyChips.push({ key:'HTN', label:'메디컬 안전 다이어트 모드', color:'#c0392b',
      desc:'고혈압 동반 — 고강도 운동·공복 유산소 제한 · 저염식 우선 적용' });
  }

  // ── 관절 문제 ──
  if (has('TAG_JOINT')) {
    banExercise.push('HIIT', 'HIGH_IMPACT_JUMP', 'DEEP_SQUAT');
    requireExercise.push('AQUA_EXERCISE', 'CHAIR_EXERCISE', 'GENTLE_STRETCH', 'LOW_IMPACT');
    safetyChips.push({ key:'JOINT', label:'관절 보호 모드', color:'#1565c0',
      desc:'관절·근감소 동반 — 충격 운동 금지 · 관절 부하 최소 운동 적용' });
  }

  // ── PCOS ──
  if (has('TAG_PCOS')) {
    requireDiet.push('LOW_GI', 'HIGH_FIBER', 'BLOOD_SUGAR_DEFENSE');
    banDiet.push('HIGH_CARB_SPIKE', 'SUGARY_DRINKS');
    safetyChips.push({ key:'PCOS', label:'PCOS 혈당 방어 식단 모드', color:'#8e44ad',
      desc:'다낭성난소 — 혈당 스파이크 방어 · 저GI/식이섬유 우선 식단 적용' });
  }

  // ── 당뇨·전당뇨 ──
  if (has('TAG_DIABETES')) {
    requireDiet.push('LOW_GI', 'POST_MEAL_WALK', 'BLOOD_SUGAR_DEFENSE');
    banDiet.push('INTERMITTENT_FASTING_LONG', 'SUGARY_DRINKS');
    safetyChips.push({ key:'DIABETES', label:'혈당 관리 다이어트 모드', color:'#d35400',
      desc:'당뇨 전단계 동반 — 혈당 급상승 식품 제한 · 식후 산책 프로토콜 적용' });
  }

  // ── 우울증 ──
  if (has('TAG_DEPRESSION')) {
    banDiet.push('STRICT_DIARY', 'CALORIE_OBSESSION', 'EXTREME_RESTRICTION');
    banExercise.push('HIGH_INTENSITY_FORCED', 'COMPETITION_BASED');
    requireDiet.push('SEROTONIN_FRIENDLY', 'COMFORT_FOOD_HEALTHY');
    requireExercise.push('WALK_SUNLIGHT', 'GENTLE_YOGA', 'ULTRA_LOW_BARRIER');
    safetyChips.push({ key:'DEPRESSION', label:'멘탈 회복 우선 모드', color:'#2980b9',
      desc:'우울·불안 동반 — 강박적 식단 기록 금지 · 세로토닌 회복형 식단 · 초저난이도 미션 적용' });
  }

  // ── 수면 장애 ──
  if (has('TAG_SLEEP_DISORDER')) {
    banDiet.push('LATE_NIGHT_CARB');
    requireDiet.push('SLEEP_FRIENDLY', 'MAGNESIUM_RICH');
    requireExercise.push('MORNING_SUNLIGHT', 'EVENING_STRETCH');
    safetyChips.push({ key:'SLEEP', label:'수면 회복 우선 모드', color:'#1abc9c',
      desc:'수면 장애 동반 — 야간 탄수화물 제한 · 수면 개선 루틴 우선 적용' });
  }

  // ── 교대·야간 근무 ──
  if (has('TAG_SHIFT_WORK')) {
    banDiet.push('FIXED_EVENING_FAST', 'STANDARD_MEAL_TIMING');
    requireDiet.push('CIRCADIAN_MEAL', 'SHIFT_ADAPTED_TIMING');
    safetyChips.push({ key:'SHIFT', label:'생체시계 맞춤 식사 모드', color:'#16a085',
      desc:'야간·교대근무 — 저녁 6시 이후 금식 규칙 해제 · 개인 취침기준 식사 타임라인 적용' });
  }

  // ── 항응고제 ──
  if (has('TAG_ANTICOAGULANT')) {
    banExercise.push('HIGH_IMPACT_CONTACT');
    safetyChips.push({ key:'ANTICOAG', label:'출혈 위험 주의 모드', color:'#e74c3c',
      desc:'항응고제 복용 — 충격·접촉 운동 주의 · 시술 전 의료진 확인 필수' });
  }

  return {
    banExercise:     banExercise,
    banDiet:         banDiet,
    requireDiet:     requireDiet,
    requireExercise: requireExercise,
    safetyChips:     safetyChips,
    hasMedicalMode:  safetyChips.length > 0,
  };
}

// ──────────────────────────────────────────────────────────────────
// 11-E. getRoadmapRatioOverride(tags, weekNum) → 주차별 비율 오버라이드
//   명세: TAG_SLEEP_DISORDER or TAG_DEPRESSION 존재 시
//         1~4주차: [운동 20%, 식단 30%, 회복 50%]
// ──────────────────────────────────────────────────────────────────
function getRoadmapRatioOverride(tags, weekNum) {
  var t = tags || [];
  var w = weekNum || 1;

  var needRecoveryFirst = (t.indexOf('TAG_SLEEP_DISORDER') > -1 ||
                           t.indexOf('TAG_DEPRESSION') > -1);
  var isShift = t.indexOf('TAG_SHIFT_WORK') > -1;
  var isPcos  = t.indexOf('TAG_PCOS') > -1;
  var isJoint = t.indexOf('TAG_JOINT') > -1;

  if (needRecoveryFirst && w <= 4) {
    return { workout: 20, diet: 30, recovery: 50,
             note: '수면·멘탈 회복 우선 (1~4주차)',
             missionPriority: ['recovery', 'diet', 'workout'] };
  }
  if (isJoint && w <= 6) {
    return { workout: 25, diet: 40, recovery: 35,
             note: '관절 보호 — 저충격 운동 위주 (1~6주차)',
             missionPriority: ['diet', 'recovery', 'workout'] };
  }
  if (isPcos) {
    return { workout: 35, diet: 45, recovery: 20,
             note: 'PCOS — 혈당 방어 식단 우선',
             missionPriority: ['diet', 'workout', 'recovery'] };
  }
  if (isShift) {
    return { workout: 30, diet: 40, recovery: 30,
             note: '교대근무 — 생체시계 맞춤 루틴',
             missionPriority: ['diet', 'recovery', 'workout'] };
  }
  // 기본값
  return { workout: 40, diet: 40, recovery: 20,
           note: '기본 균형 비율',
           missionPriority: ['workout', 'diet', 'recovery'] };
}

// ──────────────────────────────────────────────────────────────────
// 11-F. getMotivationBanner(tags, motivation, weekNum, dayNum) → 오늘탭 상단 배너
// ──────────────────────────────────────────────────────────────────
function getMotivationBanner(tags, motivation, weekNum, dayNum) {
  var mot = motivation || 'self';
  var w   = weekNum || 1;
  var d   = dayNum || 1;
  var t   = tags || [];

  var targetStr = '';
  var suffix    = '';
  if (mot === 'child')   { targetStr = '자녀'; suffix = '에게 더 멋진 모습을 보여주기 위한'; }
  else if (mot === 'partner') { targetStr = '연인'; suffix = '에게 더 사랑받는 나를 위한'; }
  else if (mot === 'family')  { targetStr = '가족'; suffix = '을 위해 건강해지려는'; }
  else if (mot === 'health')  { targetStr = '건강'; suffix = '을 되찾기 위한'; }
  else                         { targetStr = '나 자신'; suffix = '을 위한'; }

  // 특수 메시지 (회복 우선 모드)
  var needRecovery = (t.indexOf('TAG_SLEEP_DISORDER') > -1 || t.indexOf('TAG_DEPRESSION') > -1);
  if (needRecovery && w <= 4) {
    return {
      headline: '오늘은 쉬는 게 처방입니다',
      subline:  targetStr + suffix + ' ' + w + '주 차 ' + d + '일 차 — 회복이 먼저입니다.',
      icon: '🌙',
      accent: '#1abc9c',
    };
  }

  // 기본 배너
  return {
    headline: targetStr + (mot === 'health' ? suffix : '을(를) 위해 오늘도 한 걸음'),
    subline:  '사랑하는 ' + (mot !== 'self' ? targetStr : '나') + suffix + ' ' + w + '주 차 ' + d + '일 차 미션입니다.',
    icon: mot === 'child' ? '👨‍👧' : (mot === 'partner' ? '💑' : (mot === 'health' ? '❤️' : '⭐')),
    accent: mot === 'child' ? '#1565c0' : (mot === 'partner' ? '#e91e8c' : '#3498db'),
  };
}

// ──────────────────────────────────────────────────────────────────
// 11-G. getMealEnvMissions(tags, mealEnv) → 식사 환경별 오늘 미션 블록
// ──────────────────────────────────────────────────────────────────
function getMealEnvMissions(tags, mealEnv) {
  var env = mealEnv || [];
  var t   = tags || [];
  var missions = [];

  if (env.indexOf('delivery') > -1 || t.indexOf('TAG_DELIVERY') > -1) {
    missions.push({
      category: 'diet_env',
      icon: '📱',
      title: '배달앱 혈당 방어 룰',
      steps: [
        '주문 전: "한식 도시락 > 샐러드 > 치킨(무 먼저)" 검색 필터 적용',
        '수령 후: 채소·단백질 먼저 → 탄수화물 나중에 먹기',
        '음료: 제로/아메리카노 교체, 단 음료 제거',
        '소스: 마요·케첩 절반만 사용',
      ],
      tag: 'TAG_DELIVERY',
    });
  }
  if (env.indexOf('convenience') > -1 || t.indexOf('TAG_CONVENIENCE') > -1) {
    missions.push({
      category: 'diet_env',
      icon: '🏪',
      title: '편의점 꿀조합 가이드',
      steps: [
        '단백질 먼저: 닭가슴살 바 / 삶은달걀 / 그릭요거트',
        '탄수 파트너: 삶은옥수수 / 고구마 / 현미 삼각김밥',
        '피해야 할 조합: 빵 + 주스 + 과자 (혈당 폭탄)',
        '추천 조합: 닭가슴살 + 달걀 + 아메리카노',
      ],
      tag: 'TAG_CONVENIENCE',
    });
  }
  if (env.indexOf('single') > -1 || t.indexOf('TAG_SINGLE') > -1) {
    missions.push({
      category: 'diet_env',
      icon: '🏠',
      title: '자취생 영양 밸런스 미션',
      steps: [
        '냉장고 필수템: 달걀·두부·브로콜리·방울토마토 상시 구비',
        '전자레인지 단백질: 두부 200g 3분 → 간장 한 방울',
        '아침 5분 루틴: 삶은달걀 2개 + 바나나 1개',
        '오늘 미션: 햇빛 10분 쬐기 (비타민D·세로토닌 생성)',
      ],
      tag: 'TAG_SINGLE',
    });
  }

  // 야식·교대근무 → 야식 방어 미션
  if (t.indexOf('TAG_NIGHT_EATING') > -1 || t.indexOf('TAG_SHIFT_WORK') > -1) {
    missions.push({
      category: 'diet_env',
      icon: '🌙',
      title: '야간 근무·야식 방어 루틴',
      steps: [
        '근무 전 식사: 단백질 + 복합탄수 위주로 포만감 확보',
        '야식 대체: 아몬드 10알 + 따뜻한 카모마일차',
        '취침 2시간 전 마지막 식사 (본인 취침 기준)',
        '기상 후 30분 내 단백질 식사로 생체시계 리셋',
      ],
      tag: 'TAG_SHIFT_WORK',
    });
  }

  return missions;
}

// ──────────────────────────────────────────────────────────────────
// 11-H. getPsychologicalTriggerNarrative(triggerType, axisScores, tags)
//         P1 심리 원인 분석 문구 생성
// ──────────────────────────────────────────────────────────────────
function getPsychologicalTriggerNarrative(triggerType, axisScores, tags) {
  var _t = triggerType || 'none';
  var _a = axisScores || {};
  var t  = tags || [];
  var n  = function(k) { return Number(_a[k] || 0); };

  var cortisol    = n('A07');   // 코르티솔 / 스트레스
  var hormone     = n('A03');   // 호르몬
  var psychology  = n('A08');   // 심리·식이행동

  // 핵심 원인 문장 + 보조 문장 조합
  var mainCause = '';
  var detail    = '';
  var emphasis  = '';

  if (_t === 'burnout') {
    mainCause = '번아웃';
    detail    = '번아웃 당시 폭발한 코르티솔 호르몬과 대사 정체';
    emphasis  = '스트레스가 "먹어야 살 것 같은" 충동으로 전환되고, 코르티솔이 복부에 지방을 쌓았습니다.';
  } else if (_t === 'stress_event') {
    mainCause = '심리적 충격·이별';
    detail    = '심리 충격 이후 무너진 세로토닌과 코르티솔 교란';
    emphasis  = '감정적 허기(Emotional Hunger)가 칼로리 과잉의 실제 원인이었습니다.';
  } else if (_t === 'postpartum') {
    mainCause = '출산 후 호르몬 급변';
    detail    = '출산 후 에스트로겐 급감과 복벽 구조 변화';
    emphasis  = '의지의 문제가 아니라, 골반·복벽 구조와 호르몬 축이 바뀐 것입니다.';
  } else if (_t === 'yoyo') {
    mainCause = '반복적 요요';
    detail    = '요요가 반복되며 기초대사가 낮아진 대사 적응';
    emphasis  = '몸이 굶주림을 기억하고, 적게 먹어도 저장하도록 적응한 상태입니다.';
  } else if (cortisol >= 7) {
    mainCause = '만성 스트레스·코르티솔 과잉';
    detail    = '만성 스트레스로 인한 코르티솔 과분비와 복부 지방 축적';
    emphasis  = '스트레스 호르몬이 복부에 특이적으로 지방을 쌓는 패턴입니다.';
  } else if (hormone >= 7) {
    mainCause = '호르몬 불균형';
    detail    = '갑상선·성호르몬 불균형으로 인한 대사 저하';
    emphasis  = '호르몬이 "살찌는 체질"을 만든 것이며, 의지로 극복하기 어렵습니다.';
  } else if (psychology >= 7) {
    mainCause = '심리·식이행동 패턴';
    detail    = '감정 조절 도구로 음식을 사용하는 심리·식이 패턴';
    emphasis  = '음식이 감정의 도피처가 되면, 배고픔이 아니라 마음이 먹는 상태가 됩니다.';
  } else {
    mainCause = '복합 원인';
    detail    = '다양한 원인이 복합적으로 작용한 체중 증가';
    emphasis  = '단일 원인이 아니라 여러 축이 얽혀 있어, 정밀한 순서로 접근해야 합니다.';
  }

  // PCOS 추가 문구
  var medicalNote = '';
  if (t.indexOf('TAG_PCOS') > -1) {
    medicalNote = 'PCOS(다낭성난소증후군)로 인한 인슐린 저항과 안드로겐 과잉이 복부 지방을 고착시켰습니다. 혈당 방어 없이는 어떤 식단도 한계가 있습니다.';
  } else if (t.indexOf('TAG_THYROID') > -1) {
    medicalNote = '갑상선 기능 저하로 기초대사가 구조적으로 낮아진 상태입니다. 대사를 올리는 처방이 식단보다 우선해야 합니다.';
  } else if (t.indexOf('TAG_DEPRESSION') > -1) {
    medicalNote = '우울·불안 상태에서 세로토닌이 부족해지면 탄수화물·당류 갈망이 강해집니다. 심리 회복이 식이 조절의 선행 조건입니다.';
  }

  return {
    mainCause:   mainCause,
    detail:      detail,
    emphasis:    emphasis,
    medicalNote: medicalNote,
    narrative:   'OOO 님이 살이 찐 진짜 원인은 의지 부족이 아닌, <b>' + detail + '</b> 때문입니다. ' + emphasis,
  };
}

// ──────────────────────────────────────────────────────────────────
// 12. export
// ──────────────────────────────────────────────────────────────────
// ──────────────────────────────────────────────
// GAP-08 (2026-08-18): generateAIOpinion — BC코드 + 10축 점수 조합 기반 소견문 텍스트 생성
// 템플릿 치환 방식: BC_MASTER 의학 제목 + 상위 2개 원인축 → 소견 텍스트 조합
// 반환: { opening, body, closing, top_axes_text }
// ──────────────────────────────────────────────
function generateAIOpinion(bcCode, axisScores, userName, ohaengType) {
  var bc = (bcCode || '').toUpperCase().replace(/\s/g,'');
  if (!bc.startsWith('BC-')) bc = 'BC-6';

  var ax = axisScores || {};
  var nm = (userName || '').length >= 2 ? userName : '회원';

  // 상위 2개 원인축 탐색
  var AXIS_LABEL = {
    A01:'인슐린·내장지방', A02:'림프·순환', A03:'호르몬·대사', A04:'근감소',
    A05:'소화·장', A06:'골격·자세', A07:'코르티솔', A08:'심리·식이',
    A09:'대사위험', A10:'기질·성향'
  };
  var sorted = Object.entries(ax)
    .filter(function(e){ return e[0].startsWith('A'); })
    .sort(function(a,b){ return Number(b[1]) - Number(a[1]); });
  var top1 = sorted[0] ? sorted[0][0] : 'A01';
  var top2 = sorted[1] ? sorted[1][0] : 'A03';
  var top1Label = AXIS_LABEL[top1] || top1;
  var top2Label = AXIS_LABEL[top2] || top2;
  var top1Score = sorted[0] ? Number(sorted[0][1]) : 5;
  var top2Score = sorted[1] ? Number(sorted[1][1]) : 5;

  // BC별 핵심 의학 기전 텍스트 (단문 템플릿)
  var BC_MECHANISM = {
    'BC-1':  '하체 림프·정맥 순환 저하로 오후 부종이 반복되는 구조',
    'BC-2':  '목·어깨 근막 긴장 + 자세 불균형이 경추 압박을 만드는 구조',
    'BC-3':  '인슐린 과잉 반응으로 식후 혈당 진동이 반복되는 내장지방 고착 구조',
    'BC-4':  '갑상선·기초대사 저하로 같은 칼로리도 더 많이 저장되는 저대사 구조',
    'BC-5':  '셀룰라이트·말초 순환 저하로 피하지방이 산소 공급 없이 고착된 구조',
    'BC-6':  '만성 코르티솔 과잉으로 야식 충동과 복부 지방 축적이 반복되는 구조',
    'BC-7':  '소화·가스 팽만 + 호르몬 불균형으로 식후 복부가 임산부처럼 팽창하는 구조',
    'BC-8':  '골반 틀어짐·승마살 고착으로 하체 지방이 마지막까지 남는 체형 구조',
    'BC-9':  '마른 팔다리 + 올챙이배의 근감소형 복부비만 구조',
    'BC-10': '팔뚝·어깨 부종형 순환 저하 구조',
    'BC-11': '상체 근육 과발달·어깨 라인 불균형 구조',
    'BC-12': '겨드랑이 부유방·흉추 압박 피하지방 고착 구조',
    'BC-13': '갱년기 호르몬 스위치 전환으로 복부 지방 재배치가 시작된 구조',
    'BC-14': '번아웃·자율신경 소진으로 대사 전반이 정지 상태에 가까운 구조',
    'BC-15': '인슐린·혈압·지질 3중 복합 대사증후군 고위험 구조',
    'BC-16': '다발성 악순환 동시 진행으로 단일 원인 처방이 무효한 복합 구조',
  };

  var mechanism = BC_MECHANISM[bc] || BC_MECHANISM['BC-6'];

  // 위험 등급 라벨
  var riskLabel = top1Score >= 9 ? '극고위험' : top1Score >= 7 ? '고위험' : top1Score >= 5 ? '주의' : '경계';

  // 오행 텍스트
  var OHAENG_ADJ = { '목':'도전적인','화':'열정적인','토':'안정 지향의','금':'완벽주의적인','수':'감성적인' };
  var ohaengAdj = OHAENG_ADJ[ohaengType] || '';

  // 소견문 3단 구조: 개요 + 근거 + 처방 방향
  var opening = nm + ' 님의 바디코드는 <b>' + bc + '</b>(' + mechanism + ')로 판정되었습니다.';

  var body = '원인축 분석 결과, <b>' + top1Label + '(' + top1 + ')</b> 축이 ' +
    riskLabel + ' 수준(' + top1Score.toFixed(1) + '/12)으로 우선 개입이 필요하며, ' +
    '<b>' + top2Label + '(' + top2 + ')</b> 축(' + top2Score.toFixed(1) + '/12)이 이를 ' +
    '복합적으로 악화시키는 구조입니다.' +
    (ohaengAdj ? ' ' + ohaengAdj + ' 기질이 이 패턴을 심화할 수 있습니다.' : '');

  var closing = '단일 처방이 아닌 <b>' + top1Label + ' → ' + top2Label + '</b> 순서의 ' +
    '2단계 접근이 핵심이며, 지금 당장 시작해야 할 1가지는 ' +
    top1Label + ' 축 완화입니다.';

  return {
    opening: opening,
    body: body,
    closing: closing,
    top_axes_text: top1Label + ' + ' + top2Label,
    bc_code: bc,
    risk_level: riskLabel,
    top_axis: top1,
    top_axis_score: top1Score,
  };
}

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
    // V5.0 신규: 공통 TOP3 처방 산출 파이프라인
    computeTop3Prescriptions,
    _DOMAIN_AXIS_WEIGHTS_HOSPITAL, _DOMAIN_AXIS_WEIGHTS_AESTHETIC, _DOMAIN_AXIS_WEIGHTS_SALON, _DOMAIN_META,
    // GAP-05/06 (2026-08-18): 신뢰도 동적 계산 + 헤어샵 가중치
    computeConfidenceScore,
    // GAP-08 (2026-08-18): AI 소견문 템플릿 치환 생성
    generateAIOpinion,
    // V6.0 신규: TagEngine + 4대 바디 지표 + 의료 필터 + 로드맵 비율
    extractTags, computeBodyMetrics, getMedicalFilters,
    getRoadmapRatioOverride, getMotivationBanner, getMealEnvMissions,
    getPsychologicalTriggerNarrative,
    // 기존 유지
    BC_MASTER, CAUSAL_AXIS_META, AXIS_11,
    SAJU_ELEMENT_DESC, MBTI_DESC,
    SIMULATOR_METRICS, ROADMAP_WEEKS, DISCLAIMER,
    computeBCCode, getMbtiOhaengInsights, getCruelHistoryTriggers,
  };
}
