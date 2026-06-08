-- BC-08 T-PLATEAU형 INSERT
-- 대사 정체 플래토형 — Adaptive Thermogenesis
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
  'BC-08',
  1,
  'T-PLATEAU형',
  '대사 정체 플래토형 — Adaptive Thermogenesis',
  '전신 (기초대사율 저하)',

  -- bc_primary_oneline_reason
  '열심히 하는데 살이 안 빠지는 건 의지력 문제가 아닙니다. 몸이 더 이상 변화를 허락하지 않는 생존 모드에 들어간 것입니다.',

  -- bc_cause_story
  '장기간 칼로리를 줄이면 몸은 기초대사율을 낮추는 방식으로 생존을 선택합니다. 이것을 적응 열발생(Adaptive Thermogenesis)이라고 합니다. 체중이 줄면 기초대사율이 예상보다 300~400kcal 더 감소합니다. 동시에 렙틴이 감소하면서 식욕이 올라가고, 갑상선 호르몬 T3가 낮아지면서 대사가 더 느려집니다. 이 상태에서 더 먹는 걸 줄이면 오히려 역효과입니다. (Rosenbaum 2010 / Farooqi 2002)

6개월 이상 다이어트를 했는데 체중이 꼼짝을 안 합니다. 이건 실패가 아닙니다. 성공한 겁니다. 몸이 그 상태에 완벽하게 적응한 것입니다. 이 적응을 깨려면 지금까지와 완전히 다른 접근이 필요합니다. 역설적이지만, 지금 당장 필요한 것은 더 열심히 하는 것이 아닐 수 있습니다.',

  -- bc_worsen_word
  '칼로리 더 줄이기·운동 강도 높이기·단식 강화',

  -- closing_copy
  '멈추는 것도 전략입니다. 6개월 이상 열심히 해온 당신의 몸은 지쳐있습니다. 2주의 회복이 이후 3개월의 변화를 만듭니다. 완전 휴식 2주. 유지 칼로리 2주. 몸이 다시 움직이기 시작합니다.',

  -- symptom_checklist_json
  '["6개월 이상 다이어트 중인데 체중이 정체됨","식사량을 줄여도 체중이 안 빠짐","운동량을 늘려도 변화 없음","항상 피로하고 추위를 많이 탐","식욕이 이전보다 강해짐","체온이 낮고 손발이 차가움","탈모나 피부 건조감 심화"]',

  -- wrong_methods_json
  '[{"method":"칼로리 더 줄이기","reason":"이미 대사 셧다운 상태. 추가 제한은 기초대사를 더 낮춤. 플래토 심화","evidence":"Rosenbaum M. JCI 2010"},{"method":"운동 강도 높이기","reason":"에너지 부족 상태에서 고강도 운동은 코르티솔 증가 + 근육 분해 + 대사 추가 저하","evidence":"Martins C. Nutr Metab 2021"},{"method":"단식·간헐적 단식 강화","reason":"이미 굶어서 생긴 문제에 더 굶는 건 악화만 시킴","evidence":"임상 영양학 원칙"}]',

  -- correct_principles_json
  '[{"principle":"2주 대사 회복 (유지 칼로리 섭취)","explanation":"칼로리를 유지 수준으로 올리면 렙틴이 회복되고 T3가 증가. 대사율 상승 (Byrne 2017)"},{"principle":"갑상선 기능 지원","explanation":"요오드·셀레늄이 T3 합성 보조. 대사 회복 속도 향상"},{"principle":"완전 휴식 1~2주","explanation":"지친 몸에 회복 신호. 코르티솔 감소 + 성장호르몬 증가 → 대사 재점화"}]',

  -- recommended_sports_json
  '[{"sport":"가벼운 걷기","reason":"운동 자체보다 일상 활동량(NEAT) 유지가 목표. 과도한 운동은 지금 맞지 않음","schedule":"매일 30분, 가볍게","tip":"운동이 힘들면 산책으로 대체"},{"sport":"요가·스트레칭","reason":"코르티솔 감소 + 부교감 신경 활성화. 대사 회복 기간의 최적 운동","schedule":"매일 20분","tip":"강도보다 이완에 집중"},{"sport":"완전 휴식 1~2주","reason":"지금 이 체형에서 완전 휴식이 가장 강력한 처방. 몸이 회복할 시간 필요","schedule":"1~2주 권장","tip":"휴식 후 재진단으로 처방 재조정"}]',

  -- forbidden_sports_json
  '[{"sport":"고강도 유산소·크로스핏","reason":"코르티솔 폭발 + 근육 분해 → 대사 추가 저하","evidence":"Martins C. 2021"},{"sport":"2시간 이상 장시간 운동","reason":"에너지 고갈 → 코르티솔 상승 → 대사 셧다운 심화","evidence":"임상 관찰"},{"sport":"연속적인 인터벌 트레이닝","reason":"회복 시간 없이 반복 자극은 부신 피로 악화 가능성","evidence":"임상 영양학 원칙"}]',

  -- zone2_bpm_v2 (회복 기간 최대 심박수)
  115,

  -- hiit_available_week_v2 (대사 회복 후 최소 8주 이후)
  8,

  -- sauna_ok (적외선 사우나 - 심부 온열로 T3 활성화)
  1,

  -- cryo_ok (냉각은 대사 회복 방해 — 비권장)
  0,

  -- macro_ratio_json
  '{"protein":30,"fat":35,"carb":30,"fiber_g":20,"water_L":2,"priority_minerals":"요오드·셀레늄·아연"}',

  -- macro_story
  '다이어트를 하면 할수록 살이 안 빠지는 역설. 이 체형에게 지금 필요한 건 더 줄이는 게 아니라 몸에게 "이제 괜찮아, 굶지 않아도 돼"라는 신호를 주는 겁니다. 유지 칼로리로 2주를 보내면 대사가 다시 켜지기 시작합니다. 단백질 30%로 근육 보호, 지방 35%로 갑상선 호르몬 합성 원료 공급이 핵심입니다.',

  -- supplement_list_json
  '[{"name":"셀레늄","dose":"200mcg/일","timing":"식사 중","reason":"T4→T3 전환 효소 보조. 대사 회복 1순위 영양제","evidence":"Duntas LH. Thyroid 2010"},{"name":"아연","dose":"25mg/일","timing":"식후","reason":"갑상선호르몬 수용체 기능 보조. 대사 정체와 마른비만에 겸용","evidence":"Holick MF. 2007"},{"name":"마그네슘","dose":"400mg","timing":"취침 전","reason":"수면 중 대사 회복 보조 + 코르티솔 억제","evidence":"Guerrero-Romero F. 2004"}]',

  -- lifestyle_rules_json
  '[{"rule":"지금 하는 다이어트 2주 중단","type":"do","description":"가장 어렵지만 가장 강력한 처방. 몸에게 안전 신호를 보내야 대사가 켜집니다"},{"rule":"수면 9시간 목표","type":"do","description":"성장호르몬이 기초대사를 재점화합니다. 일찍 자는 것이 가장 강력한 처방"},{"rule":"체중계 잠시 내려놓기","type":"do","description":"회복 기간 중 체중이 소폭 올라도 정상. 이것이 회복의 신호입니다"},{"rule":"운동 강도 높이기","type":"dont","description":"에너지 부족 상태에서 고강도 운동은 대사를 더 낮춥니다. 지금은 회복이 먼저"},{"rule":"단식 더 늘리기","type":"dont","description":"굶어서 생긴 문제에 더 굶는 건 악화만 시킵니다"}]',

  -- recovery_priority_json
  '[{"method":"완전 휴식 1~2주 (처방)","description":"지금 가장 중요한 회복. 운동 자극 없이 렙틴·T3 회복에만 집중","condition":"취침 9시간 목표. 낮잠 허용"},{"method":"적외선 사우나 (심부 온열)","description":"기초체온 상승 → T3 활성화 보조. 혈류 증가로 갑상선 영양소 공급","condition":"주 3회, 20분"},{"method":"수면 치료 우선","description":"성장호르몬의 70%가 수면 중 분비. 대사 회복의 결정적 요소","condition":"7~9시간 수면 필수. 취침 시간 고정"}]',

  -- b2b_treatments_json
  '[{"partner_type":"병원 (내과·내분비과)","treatments":["갑상선 T3·T4·TSH 정밀 검사","기초대사율 측정 (간접 열량 측정법)","대사 회복 처방 지원"],"revisit_point":"대사 회복 후 체중 변화 추적이 재방문 포인트"},{"partner_type":"에스테틱","treatments":["적외선 사우나 심부 온열 (갑상선 주변 혈류)","전신 온열 랩 (기초체온 상승 유도)"],"revisit_point":"체온 측정으로 회복 진행도 확인"}]',

  1,
  CURRENT_TIMESTAMP,
  'seed_bc08'
);
