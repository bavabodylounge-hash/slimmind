-- BC-09 C-STRESS형 INSERT
-- 코르티솔 스트레스형 — 부신 피로
-- 2026-06-08

INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason,
  bc_cause_story,
  bc_worsen_word,
  closing_copy,
  symptom_checklist_json,
  wrong_methods_json,
  correct_principles_json,
  recommended_sports_json,
  forbidden_sports_json,
  zone2_bpm_v2,
  hiit_available_week_v2,
  sauna_ok,
  cryo_ok,
  macro_ratio_json,
  macro_story,
  supplement_list_json,
  lifestyle_rules_json,
  recovery_priority_json,
  b2b_treatments_json,
  is_active,
  updated_at,
  updated_by
) VALUES (
  'BC-09',
  1,
  'C-STRESS형',
  '코르티솔 스트레스형 — 부신 피로',
  '복부 (내장지방 우선)',

  -- bc_primary_oneline_reason
  '배가 나오는 건 많이 먹어서가 아닙니다. 스트레스가 코르티솔을 분비시키고, 코르티솔이 복부에 지방을 쌓고 있기 때문입니다.',

  -- bc_cause_story
  '복부 지방세포에는 다른 부위보다 코르티솔 수용체가 더 많이 분포합니다. 스트레스를 받으면 코르티솔이 분비되고, 이 코르티솔이 복부 지방 합성을 직접 자극합니다. 동시에 수면 부족이 코르티솔을 37% 추가 상승시키고, 식욕 호르몬(그렐린)이 28% 증가해서 야식 충동이 강해집니다. 열심히 운동해도 스트레스가 계속되는 한 이 사이클이 반복됩니다. (Epel 2000 / Spiegel 1999 / Björntorp 2001)

밥을 별로 안 먹는데도 배가 나옵니다. 스트레스를 받으면 단것이 당깁니다. 잠을 못 자는 날은 더 붓는 것 같습니다. 이 모든 것이 연결되어 있습니다. 오늘, 이 신호를 줄이는 방법을 알게 됩니다.',

  -- bc_worsen_word
  '저녁 고강도 운동·카페인 과다·극단적 식이제한',

  -- closing_copy
  '스트레스는 이유가 있어서 먹는 게 아닙니다. 코르티솔이 복부에 지방을 쌓으라고 신호를 보낸 것입니다. 수면을 먼저 잡으면 이 신호가 줄어듭니다. 저녁 운동 대신 요가. 카페인 대신 마그네슘. 4주 후 배가 달라지기 시작합니다.',

  -- symptom_checklist_json
  '["밥을 별로 안 먹는데 배가 나옴","스트레스 받으면 단것이 당김","잠을 못 자는 날 더 붓는 느낌","만성 피로·낮 졸림","야식 충동이 강함","저녁에 더 먹게 되는 패턴","어깨·목 긴장 지속"]',

  -- wrong_methods_json
  '[{"method":"저녁 고강도 운동","reason":"코르티솔 회복 주기 방해 + 불면 유발 → 다음 날 코르티솔 더 높아짐","evidence":"Hackney AC. 2006"},{"method":"극단적 식이 제한","reason":"칼로리 부족 → 코르티솔 추가 상승. 스트레스 체형에 식이 제한은 역효과","evidence":"임상 영양학"},{"method":"카페인 과다 (3잔 이상)","reason":"부신 자극 → 코르티솔 추가 분비. 악순환 강화","evidence":"Arnason T. AJCN 2018"}]',

  -- correct_principles_json
  '[{"principle":"수면이 모든 처방보다 우선","explanation":"코르티솔 회복의 70%는 수면에서 이루어짐. 수면 7시간이 안 되면 다른 처방의 효과가 반감"},{"principle":"오전 운동 + 저녁 이완","explanation":"오전 운동이 코르티솔 리듬과 일치. 저녁은 요가·스트레칭으로 부교감 활성화"},{"principle":"마음챙김·아로마 처방","explanation":"마음챙김 4주가 코르티솔 수치를 유의미하게 낮춤 (Turakitwanakan 2013)"}]',

  -- recommended_sports_json
  '[{"sport":"오전 30분 걷기","reason":"코르티솔 리듬이 오전에 가장 높음. 이 시간대 가벼운 운동이 리듬 정상화","schedule":"매일 오전, 햇볕 아래","tip":"스마트폰 없이 걷기 추천. 마음챙김 걷기"},{"sport":"요가 (부교감 활성화)","reason":"저녁 요가가 코르티솔 저하에 가장 효과적. 하타요가·음요가 권장","schedule":"매일 저녁 20분","tip":"빠른 동작보다 이완과 호흡에 집중"},{"sport":"수영 (오전)","reason":"물의 부력이 코르티솔 반응 완화. 리드미컬한 호흡 패턴이 부교감 신경 활성화","schedule":"주 3회, 오전","tip":"대화하며 할 수 있는 속도"}]',

  -- forbidden_sports_json
  '[{"sport":"저녁 고강도 유산소","reason":"코르티솔 회복 주기 방해 + 불면 유발 악순환","evidence":"Hackney AC. 2006"},{"sport":"크로스핏·타바타 (스트레스 상태에서)","reason":"교감신경 최대 자극 → 부신 추가 부담 → 코르티솔 폭발","evidence":"임상 관찰"},{"sport":"경쟁·비교 분위기 운동","reason":"심리적 스트레스가 코르티솔 추가 자극. 편안한 환경이 중요","evidence":"임상 심리학"}]',

  -- zone2_bpm_v2 (부교감 우선 — 115bpm 이하)
  115,

  -- hiit_available_week_v2 (부신 회복 후 12주)
  12,

  -- sauna_ok (이완 목적 온열은 가능, 단 저강도)
  1,

  -- cryo_ok (냉각 자극은 부신 추가 부담 우려)
  0,

  -- macro_ratio_json
  '{"protein":30,"fat":30,"carb":35,"fiber_g":25,"water_L":2,"priority_minerals":"마그네슘·B5·비타민C"}',

  -- macro_story
  '스트레스를 받으면 단것이 당기는 건 뇌가 세로토닌을 원하기 때문입니다. 탄수화물이 세로토닌의 원료입니다. 탄수화물을 너무 줄이면 오히려 코르티솔이 더 올라갑니다. 35%는 뇌를 달래주면서도 지방을 쌓지 않는 균형입니다.',

  -- supplement_list_json
  '[{"name":"마그네슘 글리시네이트","dose":"400mg","timing":"취침 전","reason":"코르티솔 분비 억제 + 부신 회복 + 수면 깊이 개선","evidence":"Guerrero-Romero F. 2004"},{"name":"아슈와간다","dose":"300~600mg/일","timing":"아침","reason":"적응원 허브. 코르티솔 수치 유의미하게 감소 (8주 RCT)","evidence":"Chandrasekhar K et al. IJAM 2012"},{"name":"비타민B5 (판토텐산)","dose":"500mg/일","timing":"식후","reason":"부신에서 코르티솔 합성 조절. 부신 피로 회복 보조","evidence":"임상 영양학"}]',

  -- lifestyle_rules_json
  '[{"rule":"취침 2시간 전 스마트폰 차단","type":"do","description":"블루라이트가 멜라토닌 분비 억제. 코르티솔 야간 회복 방해. 이 루틴이 가장 강력"},{"rule":"오전 햇볕 10분","type":"do","description":"일광이 코르티솔 리듬을 리셋. 세로토닌 합성 촉진. 자연스럽게 저녁에 코르티솔이 낮아짐"},{"rule":"스트레스 신호 오면 5분 걷기","type":"do","description":"단것 대신 걷기 5분. 코르티솔이 실제로 낮아지기 시작합니다 (Salmon P. 2001)"},{"rule":"저녁 고강도 운동","type":"dont","description":"코르티솔 회복 주기를 방해합니다. 저녁은 몸이 쉬어야 하는 시간"},{"rule":"카페인으로 피로 버티기","type":"dont","description":"부신에 추가 부담. 코르티솔 악순환을 강화합니다. 생강차·루이보스로 대체"}]',

  -- recovery_priority_json
  '[{"method":"아로마테라피 (라벤더)","description":"라벤더 흡입이 코르티솔 분비 억제 + 부교감 신경 활성화. 취침 전 디퓨저 30분","condition":"매일 취침 전"},{"method":"수면 치료 프로토콜","description":"취침 2시간 전 스마트폰 차단. 실내 온도 18도. 귀마개·수면 마스크 활용","condition":"수면 7~9시간 목표. 취침 시간 고정"},{"method":"마음챙김 명상 5분","description":"아침 기상 후 5분 호흡 명상. 코르티솔 분비 패턴을 하루 시작부터 안정화","condition":"매일 아침, 5분으로 시작"}]',

  -- b2b_treatments_json
  '[{"partner_type":"병원 (내분비과·정신건강의학과)","treatments":["코르티솔 24시간 타액 검사 + 부신 피로 패널","DHEA·코르티솔 비율 확인","필요시 심리상담 연계"],"revisit_point":"코르티솔 수치 추적이 재방문 동기"},{"partner_type":"에스테틱","treatments":["아로마 오일 전신 이완 마사지 (라벤더·베르가못)","두피·경추 집중 이완","수면 유도 마사지 프로토콜"],"revisit_point":"매주 1회 관리 + 수면 개선 추적"},{"partner_type":"필라테스·요가 센터","treatments":["저녁 이완 요가 수업 추천","호흡 집중 프로그램","마음챙김 요소 포함 수업"],"revisit_point":"스트레스 감소 체감이 가장 빠른 재방문 포인트"}]',

  1,
  CURRENT_TIMESTAMP,
  'seed_bc09'
);
