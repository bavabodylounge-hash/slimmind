-- BC-02 V-VISCERAL형 INSERT (내장지방 폭발형 — 알코올성 지방간)
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
  'BC-02', 1, 'V-VISCERAL형', '내장지방 폭발형 — 과음+인슐린 복합', '복부 내장',

  '복부가 단단하게 팽창된 느낌이 드는 건 알코올이 간을 통해 중성지방을 복부에 직접 쌓고 있기 때문입니다.',

  '알코올은 간에서 아세트알데히드로 분해될 때 지방 산화를 완전히 차단합니다. 이 상태에서 들어온 탄수화물과 지방은 100% 중성지방으로 전환됩니다. 특히 맥주의 과당+알코올 조합은 내장지방 합성을 극대화합니다. 일주일에 3회 이상 음주를 지속하면 간이 지속적으로 해독 모드에 있어서 인슐린 저항성까지 동반됩니다.',

  '알코올',

  '술이 문제가 아닙니다. 몰랐던 게 문제였습니다. 절주 4주면 간지방이 줄기 시작하고, 배가 들어가기 시작합니다. BC-02형은 원인이 명확하기 때문에 원인만 제거하면 결과가 가장 빠르게 나타납니다. 첫 4주의 목표는 하나입니다. 주 2회 이하 음주. 그것만으로 충분합니다.',

  '[
    {"tag":"술을 마신 다음날 배가 더 나와 보인다"},
    {"tag":"배가 단단하게 팽창된 느낌이 자주 든다"},
    {"tag":"음주 후 며칠간 몸이 붓고 무겁다"},
    {"tag":"안주를 많이 먹지 않아도 배가 나온다"},
    {"tag":"간 부위(오른쪽 갈비뼈 아래)가 묵직한 느낌이 든다"}
  ]',

  '[
    {"method":"음주 다음날 공복 운동","reason":"알코올 대사 산물(아세트알데히드)이 남아있는 상태에서 운동하면 간 부하 2배 증가","ref":"Sports Med 권고사항"},
    {"method":"이온 음료·당분 음료로 해장","reason":"당분이 알코올 해독 지연. 간에 추가 부담. 배만 더 나옴","ref":"임상 영양학 권고"},
    {"method":"유산소만 장기간","reason":"간 내 지방 감소에는 저항 운동 병행이 필수. 유산소만으로는 내장지방 효과 제한적","ref":"Hashida R. JGH 2017"}
  ]',

  '[
    {"principle":"절주 후 4주 간 회복","detail":"절주 시작 4주 후부터 간지방이 줄기 시작. 처방 효과가 가장 빠른 BC 코드","ref":"Sozio M 2008"},
    {"principle":"간 해독 식품 우선 처방","detail":"밀크씨슬·아티초크·강황이 ALT·AST 수치 개선. 간 재생 촉진"},
    {"principle":"저항+유산소 복합 운동","detail":"간 내 지방 감소에 복합 운동이 단독 운동보다 2배 효과적","ref":"Hashida R 2017"}
  ]',

  '[
    {"sport":"중강도 유산소+저항 복합","reason":"간 지방 대사 활성화. 유산소 20분 + 저항 운동 20분 세트","schedule":"주 4회, 총 40분","mbti_tip":"간 해독 회복 기간 중 강도 60%로 시작"},
    {"sport":"수영 (중강도)","reason":"전신 유산소. 간에 부담 없이 지방 태우기. 관절 부담 없음","schedule":"주 3회, 40분","mbti_tip":"알코올성 부종 있는 날은 강도 줄이기"},
    {"sport":"걷기 (식후)","reason":"식후 혈당 관리 + 간 부하 최소화 상태에서 지방 산화","schedule":"매일 식후 15분","mbti_tip":"음주 다음날은 가벼운 산책만"}
  ]',

  '[
    {"sport":"음주 다음날 고강도 운동","reason":"아세트알데히드 잔류 상태에서 간 부하 폭발. 근 손상 위험 증가","ref":"Sports Med 권고사항"},
    {"sport":"HIIT·크로스핏 (초기)","reason":"간 회복 전 고강도는 ALT·AST 수치 상승. 8주 후 재평가 필요"},
    {"sport":"빈속 달리기","reason":"코르티솔 폭발 + 간 글리코겐 고갈 → 지방 대신 근육 분해"}
  ]',

  130, 8,
  1, 0,

  '{"protein":30,"fat":25,"carb":40,"fiber_g":30,"water_L":2.5,"mineral_priority":"아연·셀레늄·B군 비타민"}',

  '알코올이 가장 먼저 파괴하는 영양소가 B군 비타민과 아연입니다. 이것들이 없으면 지방 대사 자체가 작동하지 않습니다. 음식으로 채우는 것도 중요하지만, 영양제로 보충하는 것이 더 빠릅니다.',

  '[
    {"name":"밀크씨슬 (실리마린)","dose":"300mg/일, 식사 중","reason":"간세포 보호 + ALT·AST 개선. 알코올성 지방간 1순위 영양제","ref":"Vargas-Mendoza N. World J Hepatol 2014"},
    {"name":"비타민 B군 복합제","dose":"1정/일, 아침 식사 후","reason":"알코올이 가장 먼저 파괴하는 영양소. 지방 대사 효소 보조"},
    {"name":"아연","dose":"25mg/일, 식후","reason":"알코올성 지방간에서 아연 결핍 가장 흔함. 인슐린 수용체 기능 보조","ref":"Chavarro JE. AJCN 2009"}
  ]',

  '[
    {"rule":"절주 목표 설정","detail":"완전 금주가 이상적. 현실적 목표: 주 2회 이하, 1회 2잔 이하. 4주 지키면 배 사이즈 변화 체감","do":true},
    {"rule":"음주 전 물 500ml","detail":"알코올 흡수 속도 늦추기. 공복 음주 금지. 반드시 음식과 함께","do":true},
    {"rule":"간 해독 아침 루틴","detail":"기상 후 따뜻한 레몬수 + 강황 가루 1/4티스푼. 간 해독 효소 아침부터 활성화","do":true},
    {"rule":"음주 다음날 고강도 운동","detail":"잔류 아세트알데히드 상태에서 운동하면 간 손상 가중. 가벼운 산책만","do":false},
    {"rule":"숙취 음식으로 라면·탄수화물","detail":"해장이 아니라 추가 지방 합성. 따뜻한 물 + 강황차가 진짜 해장","do":false}
  ]',

  '[
    {"method":"간 회복 수면 8시간","detail":"간 세포 재생은 수면 중에만 이루어짐. 7시간 미만 시 간 회복 속도 40% 감소","condition":"매일 필수. 알코올 전날보다 1시간 추가"},
    {"method":"온열 테라피 (사우나)","detail":"혈류 증가 → 간 산소 공급 증가 → 해독 효소 활성화","condition":"주 2회, 15분. 음주 다음날은 금지"},
    {"method":"간 해독 차 (밀크씨슬·민들레)","detail":"실리마린 성분이 간세포 보호 + 재생 촉진. 아침 공복 복용","condition":"매일 아침"}
  ]',

  '[
    {"type":"병원(내과·간질환 클리닉)","treatments":["간기능 검사 (ALT·AST·GGT) + 복부 초음파 지방간 확인","글루타치온 + 비타민B 수액 처방 옵션","베르베린 처방 검토"],"revisit":"6주 후 간 수치 재확인 → 수치 개선이 동기 부여"},
    {"type":"에스테틱","treatments":["온열 랩 (간 주변 혈류 개선)","복부 디톡스 마사지 (림프 배농)"],"revisit":"간 회복 경과 추적이 재방문 포인트"},
    {"type":"헬스장·PT","treatments":["음주 다음날 강도 관리 프로토콜 제공","복합 운동 (유산소+저항) 처방","간 수치 정상화 목표 설정"],"revisit":"6주 체크인이 재등록 포인트"}
  ]',

  1, datetime('now'), 'seed_v1'
);
