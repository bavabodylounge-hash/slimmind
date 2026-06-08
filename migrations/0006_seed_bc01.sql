-- ══════════════════════════════════════════════════
--  BC-01 v2.0 처방 데이터 업데이트
--  PART A~D 전체 필드 채우기
-- ══════════════════════════════════════════════════

UPDATE bc_prescriptions SET
  recommended_sports_json = '[{"sport":"수영","condition":"온수 28도 이상","frequency":"주 3회 40분","reason_bc":"인슐린 저항성 개선·림프 순환"},{"sport":"필라테스","condition":"기구 또는 매트","frequency":"주 3회 50분","reason_bc":"복횡근 활성화로 내장 지방 압박"},{"sport":"PT(퍼스널 트레이닝)","condition":"다관절 저항 운동 중심","frequency":"주 3회 30분","reason_bc":"대근육 포도당 소비로 인슐린 수용체 활성화"},{"sport":"골프·테니스·생활스포츠","condition":"식후 활동 가능","frequency":"주 2~3회","reason_bc":"식후 혈당 스파이크 물리적 억제"},{"sport":"식후 걷기","condition":"경사 없는 평지","frequency":"매 식후 15분","reason_bc":"혈당 스파이크 차단 가장 효과적"}]',
  forbidden_sports_json = '[{"sport":"크런치·싯업·레그레이즈","reason":"복강 내 압력 폭발로 내장지방 불변 + 허리 디스크 위험"},{"sport":"공복 유산소 러닝","reason":"코르티솔 폭발로 복부 지방 가속 축적"},{"sport":"크로스핏·하이록스","reason":"카테콜아민 급분비로 혈당 롤러코스터 → 인슐린 저항성 악화"},{"sport":"핫요가","reason":"과열로 인슐린 분비 교란 위험"}]',
  aerobic_restriction = 'conditional',
  rest_prescription_json = '{"required":false,"duration_weeks":0,"reason":"현재 단계에서 활동 유지 권장"}',
  hiit_available_week_v2 = '8주 차 이후 (인슐린 저항성 지표 안정 후 재진단 필요)',
  zone2_bpm_v2 = 135,
  muscle_soreness_protocol_json = '{"ice_minutes":15,"rest_hours":48,"magnesium_add_mg":200}',
  recovery_priority_json = '[{"method":"마그네슘 목욕 (40도, 20분)","priority":1,"reason":"인슐린 수용체 활성화 + 근육 회복"},{"method":"수면 7시간 확보","priority":2,"reason":"성장호르몬 분비 → 복부 지방 분해 가속"},{"method":"크라이오테라피 (냉동 치료)","priority":3,"reason":"염증 억제 + 인슐린 감수성 향상"}]',
  sauna_ok = 'true',
  cryo_ok = 'true',
  lymph_massage_protocol_json = '{"pre_activation":false,"intensity_pct":100,"post_water_ml":300}',
  sleep_protocol_json = '{"target_hours":7,"phone_ban_before_sleep_min":60,"bedroom_temp_celsius":18}',
  aromatherapy_json = '{"ok":true,"scent":["페퍼민트","유칼립투스"],"timing":"운동 전 30분"}',
  psych_referral_recommended = 0,
  macro_ratio_json = '{"protein_pct":35,"fat_pct":30,"carb_pct":30,"fiber_g":25,"water_L":2.0,"mineral_priority":["마그네슘","크롬"]}',
  macro_story = '인슐린이 예민한 당신의 몸에서 탄수화물은 즉시 지방으로 전환됩니다. 30%는 뇌가 작동할 최소량입니다. 밥은 항상 마지막에.',
  meal_timing_rule_json = '{"carb_last":true,"post_meal_walk_min":15,"fasting_allowed":false,"meal_interval_min":240}',
  forbidden_foods_reason_json = '[{"food":"과일·과일주스·액상과당","reason":"과당이 간으로 직행해 내장지방으로 즉시 합성","urgency":"critical"},{"food":"저녁 9시 이후 야식","reason":"대사 멈춤으로 내장지방 축적률 3배","urgency":"high"},{"food":"밀가루빵·라면·우동","reason":"글루텐으로 장 투과성 증가 → 인슐린 저항성 악화","urgency":"high"},{"food":"공복 커피","reason":"코르티솔 자극으로 혈당 불안정","urgency":"medium"}]',
  timing_story = '소화 효소는 오전~오후 3시 가장 활발합니다. 저녁 7시 이후 탄수화물은 에너지가 아니라 지방으로 직행합니다.',
  b2b_treatments_json = '{"병원":[{"treatment":"공복혈당·인슐린·HOMA-IR 검사","urgency":"high","reason":"인슐린 저항성 수치 정량화"},{"treatment":"GLP-1 수용체 작용제 (위고비·삭센다) 적응 검토","urgency":"medium","reason":"BC-01형 최고 효과 처방"},{"treatment":"알파리포산 수액 + 복부 중주파 테라피","urgency":"medium","reason":"인슐린 감수성 향상 + 내장지방 직접 처치"}],"에스테틱":[{"treatment":"복부 EMS + 중주파 테라피","urgency":"high","reason":"복횡근 전기 자극으로 내장지방 접근"},{"treatment":"복부 림프 드레나쥐","urgency":"medium","reason":"인슐린 저항성 복부 순환 개선"}],"헬스장":[{"treatment":"식후 걷기 세션 추가 (그룹 또는 PT)","urgency":"high","reason":"혈당 스파이크 차단"},{"treatment":"다관절 저항 운동 구성 (크런치 전면 제외)","urgency":"high","reason":"인슐린 수용체 활성화"},{"treatment":"복부 진공 호흡 가이드 세션","urgency":"medium","reason":"복횡근 직접 활성화"}],"필라테스":[{"treatment":"복횡근 중심 코어 프로그램","urgency":"high","reason":"BC-01 내장지방 메커니즘 직접 대응"},{"treatment":"호흡 패턴 교정 세션","urgency":"medium","reason":"복강 내 압력 안정화"}]}',
  hospital_tests_json = '[{"test":"공복혈당·인슐린","bc_indication":"BC-01","urgency":"high"},{"test":"HOMA-IR (인슐린 저항성 지수)","bc_indication":"BC-01","urgency":"high"},{"test":"HbA1c (당화혈색소)","bc_indication":"BC-01","urgency":"medium"},{"test":"중성지방·LDL 패널","bc_indication":"BC-01","urgency":"medium"}]',
  reassessment_schedule_json = '{"week4":"인슐린 저항성 초기 개선 여부 확인","week8":"BC 코드 전환·HIIT 도입 가능 여부 판단","week12":"유지 시스템 구축 + 목표 재설정"}',
  partner_hints_json = '["식후 혈당 스파이크가 핵심 원인 - 식후 걷기와 식사 순서가 1순위","과일·과일주스 즉시 중단 요청 - 내장지방 직합성 경로","크런치·싯업 금지 안내 - 역효과 설명이 설득 포인트"]'
WHERE bc_code = 'BC-01';
