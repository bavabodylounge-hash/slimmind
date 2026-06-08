-- BC-01 A-CORE형 UPDATE (docx 풍부한 원고로 교체)
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  symptom_checklist_json,
  wrong_methods_json, correct_principles_json,
  recommended_sports_json, forbidden_sports_json,
  zone2_bpm_v2, hiit_available_week_v2,
  sauna_ok, cryo_ok,
  macro_ratio_json, macro_story,
  supplement_list_json, lifestyle_rules_json,
  recovery_priority_json,
  b2b_treatments_json,
  is_active, updated_at, updated_by
) VALUES (
  'BC-01', 2, 'A-CORE형', '복부내장 코어형 — 인슐린 저항성', '복부 내장',

  '배꼽 주변 지방이 단단하게 잡히는 건 인슐린이 지방을 복부에 가두는 스위치를 켜놓았기 때문입니다.',

  '당신의 복부 지방세포 주변에는 인슐린 수용체가 과민하게 반응하는 염증 상태가 지속되고 있습니다. 탄수화물이 들어오는 순간 인슐린이 폭발적으로 분비되고, 이 인슐린이 지방을 복부 장기 주변에 가두는 신호를 보냅니다. 특히 과당(액상과당·과일주스)은 간으로 직행해서 중성지방으로 즉시 합성됩니다. 크런치를 아무리 해도 이 호르몬 스위치를 끄지 못하면 배는 절대 들어가지 않습니다.',

  '탄수화물',

  '당신의 몸은 고장난 게 아닙니다. 잘못된 스위치를 건드려왔을 뿐입니다. BC-01 A-CORE형은 올바른 방법을 만나면 변화가 가장 빠르게 나타나는 체형입니다. 인슐린 스위치가 꺼지는 순간, 배가 하루하루 들어가는 게 느껴집니다. 식후 15분 걷기. 복부 진공 호흡. 과일 끊기. 이 세 가지만 4주. 배가 들어가기 시작합니다.',

  '[
    {"tag":"팔다리는 그렇게 굵지 않은데, 배만 유독 볼록하다"},
    {"tag":"배를 눌러보면 딱딱하고 손가락이 잘 안 들어간다"},
    {"tag":"밥을 먹고 나면 유독 졸립고 에너지가 뚝 떨어진다"},
    {"tag":"스트레스를 받으면 단것과 밀가루가 미칠 듯이 당긴다"},
    {"tag":"정말 열심히 했는데, 이 배만은 절대 안 빠졌다"}
  ]',

  '[
    {"method":"크런치·싯업·레그레이즈","reason":"복직근만 비대해지고 복강 내 압력(IAP) 오히려 상승. 내장지방 1g도 안 빠짐","ref":"McGill SM. JSCR 2010"},
    {"method":"과일·과일주스 식단","reason":"과당이 간으로 직행 → 중성지방·내장지방으로 즉시 합성. 건강식처럼 보이지만 최악의 선택","ref":"Stanhope KL. JCI 2009"},
    {"method":"공복 유산소 러닝","reason":"인슐린 저항성 체형의 공복 운동 시 코르티솔 폭발 → 복부지방 축적 가속","ref":"Hackney AC. IJSR 2006"}
  ]',

  '[
    {"principle":"식후 혈당 스파이크 차단","detail":"식후 15분 걷기가 3시간 혈당 곡선을 가장 효과적으로 평탄화. 이것만으로도 인슐린 분비량 20~30% 감소 가능","ref":"DiPietro L. Diabetes Care 2013"},
    {"principle":"복횡근 활성화 (Stomach Vacuum)","detail":"크런치가 아닌 복횡근을 타겟으로 하면 복강 내 압력을 낮추고 내장지방에 직접 압력 가함. 자세도 개선"},
    {"principle":"다관절 저항 운동","detail":"대근육이 포도당을 먼저 소비하면서 인슐린 수용체 민감성 회복. 전신 대사율 상승으로 내장지방 지속 감소","ref":"Chen X. Obes Rev 2024"}
  ]',

  '[
    {"sport":"식후 평지 걷기","reason":"식후 혈당 스파이크를 근육이 직접 흡수. 15분으로 3시간 혈당 안정화","schedule":"매일 식후 15분, 경사 없는 평지만","mbti_tip":"매번 다른 코스 (ENTP·B형 지루함 방지)"},
    {"sport":"복부 Stomach Vacuum","reason":"복횡근 직접 활성화. 내장지방 압박 + 자세 교정 + 복강 내 압력 안정화","schedule":"매일 10분 (공복 or 식후 1시간 이후)","mbti_tip":"유튜브 검색 stomach vacuum 시청 후 시작"},
    {"sport":"전신 다관절 저항 운동","reason":"스쿼트·데드리프트·힙힌지. 대근육 동원 → 인슐린 수용체 활성화 → 내장지방 에너지 전환","schedule":"주 3회 30분","mbti_tip":"매 세션 순서 다르게 구성 가능 (ENTP형 권장)"}
  ]',

  '[
    {"sport":"크런치·싯업·레그레이즈","reason":"복직근만 단단해지고 내장지방 전혀 안 빠짐. 허리 디스크 위험 증가","ref":"McGill SM. JSCR 2010"},
    {"sport":"공복 유산소 러닝","reason":"코르티솔 분비 → 혈당 방어 → 내장지방 오히려 더 축적","ref":"Hackney AC. IJSR 2006"},
    {"sport":"고강도 HIIT (현재 단계)","reason":"카테콜아민 급분비 → 혈당 롤러코스터 → 인슐린 저항성 악화. 8주 후 재진단 후 도입 가능"}
  ]',

  135, 8,
  1, 0,

  '{"protein":35,"fat":30,"carb":30,"fiber_g":25,"water_L":2.0,"mineral_priority":"마그네슘·크롬 우선"}',

  '인슐린이 예민한 당신의 몸에서 탄수화물은 즉시 지방으로 전환됩니다. 30%는 뇌가 작동할 최소량입니다. 이것도 밥 마지막에 먹어야 혈당 폭발을 막을 수 있습니다. 식이섬유 25g은 혈당이 급격히 오르지 못하도록 장에서 잡아주는 완충제 역할을 합니다.',

  '[
    {"name":"베르베린","dose":"500mg × 2회, 식전 30분","reason":"AMPK 활성화로 인슐린 저항성 직접 개선. 천연 메트포르민","ref":"Nie Q et al. J Transl Med 2024"},
    {"name":"오메가3","dose":"2~3g/일, 식후","reason":"내장지방 염증 억제 + 인슐린 감수성 향상. EPA·DHA 함유 제품","ref":"Simopoulos AP. 2002"},
    {"name":"마그네슘 글리시네이트","dose":"400mg, 취침 전","reason":"인슐린 수용체 직접 활성화. 과각성 신경 진정. 수면 깊이 개선","ref":"Guerrero-Romero F. 2004"}
  ]',

  '[
    {"rule":"식사 순서 지키기","detail":"채소·나물 먼저 → 단백질 → 밥 마지막. 순서만 바꿔도 식후 혈당 20% 낮아짐","do":true},
    {"rule":"식후 15분 이내 움직이기","detail":"앉아 있으면 혈당이 계속 상승. 10분 걷기만으로도 스파이크 17~24% 감소","do":true},
    {"rule":"아침 미지근한 물 한 잔","detail":"공복 혈당 안정화 + 소화 효소 준비. 차가운 물은 위 수축으로 역효과","do":true},
    {"rule":"저녁 9시 이후 금식","detail":"야간 인슐린 분비는 낮의 3배 효율. 같은 양이라도 밤에 먹으면 지방 축적 증가","do":false},
    {"rule":"스트레스 시 단것 해소","detail":"코르티솔+인슐린 동시 폭발 → 내장지방 축적 최악의 패턴. 대안: 5분 걷기","do":false}
  ]',

  '[
    {"method":"수면 7시간 (1순위)","detail":"수면 부족 1주일이 코르티솔을 37% 올립니다. 코르티솔은 복부 지방 축적의 직접 원인. 모든 처방보다 수면이 먼저","condition":"매일 필수"},
    {"method":"사우나 주 2회","detail":"열 충격 단백질(HSP)이 인슐린 수용체 민감성을 회복시킵니다. 62~90도, 15~20분","condition":"1회 15~20분"},
    {"method":"마그네슘 목욕","detail":"엡솜솔트 2컵을 따뜻한 욕조에 녹여 20분. 경피 흡수된 마그네슘이 인슐린 수용체를 활성화","condition":"취침 전"}
  ]',

  '[
    {"type":"병원(내과·비만클리닉)","treatments":["공복혈당·인슐린·HOMA-IR 검사 우선","GLP-1 수용체 작용제 적응 검토 (HOMA-IR≥2.5)","알파리포산+베르베린 수액 옵션"],"revisit":"4주 후 혈당 지표 재확인 → 수치 개선 추적이 재방문 동기"},
    {"type":"에스테틱·뷰티센터","treatments":["복부 중주파(EMS) 테라피 → 복횡근 활성화 직접","온열 랩 + 디톡스 마사지","냉온 교대 복부 테라피"],"revisit":"결과지의 복부 단단함→말랑 변화가 가장 빠른 효과 체감 포인트"},
    {"type":"헬스장·PT센터","treatments":["크런치 금지 → Stomach Vacuum + 다관절 프로그램으로 교체","식후 걷기 세션 추가 (그룹 프로그램화 가능)","인바디 주 1회 내장지방 추적"],"revisit":"식후 혈당 관리와 운동을 연결한 프로그램이 차별화 포인트"}
  ]',

  1, datetime('now'), 'seed_v2'
);
