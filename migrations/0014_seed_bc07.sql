-- BC-07 S-SKINNY형 INSERT (마른비만 스키니팻형 — 근감소)
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
  'BC-07', 1, 'S-SKINNY형', '마른비만 스키니팻형 — 근감소', '전신 (체지방 과잉)',

  '체중은 정상이지만 인바디에서 체지방이 높게 나오는 건 근육이 지방으로 천천히 교체되어 온 결과입니다.',

  '마른비만은 체중이 정상이어도 근육량이 부족해서 체지방 비율이 높은 상태입니다. 칼로리 제한 다이어트를 반복하면 지방과 함께 근육도 빠지고, 이 과정이 반복될수록 근육은 줄고 지방 비율은 높아집니다. 기초대사율이 낮아져서 적게 먹어도 살이 찌는 몸이 됩니다. 처방의 목표는 체중 감량이 아니라 근육 합성입니다.',

  '칼로리 제한',

  '숫자가 바뀌기 전에 몸이 먼저 달라집니다. 근육이 채워지면 체중은 그대로여도 몸이 단단해지고, 옷 맵시가 바뀌고, 기초대사가 올라갑니다. 체중계를 잠시 내려놓으세요. 저항 운동 주 4회. 단백질 충분히. 인바디 4주마다. 몸이 바뀌고 있다는 걸 느끼게 됩니다.',

  '[
    {"tag":"체중계 숫자는 정상인데 인바디를 찍으면 체지방이 높게 나온다"},
    {"tag":"팔다리가 가는데 배나 허리에 살이 있다"},
    {"tag":"조금만 먹어도 살이 찌는 것 같다"},
    {"tag":"다이어트를 해도 체중이 빠지긴 하는데 금방 돌아온다"},
    {"tag":"근력이 약하고 체력이 빨리 떨어진다"}
  ]',

  '[
    {"method":"칼로리 제한 다이어트","reason":"근육과 지방을 함께 줄임. 근육이 더 많이 빠지면 기초대사율 추가 저하","ref":"Prado CM. JCSM 2012"},
    {"method":"유산소 운동만","reason":"에너지 소비는 되지만 근육 합성 신호가 없음. 장기적으로 근감소 악화","ref":"Morton RW. 2018"},
    {"method":"하체 집중 유산소 (달리기·자전거)","reason":"이미 약한 하체 근육 추가 분해 가능성. 상체 근육 빌드업이 선행되어야","ref":"임상 관찰"}
  ]',

  '[
    {"principle":"단백질 40% + 저항 운동 동시 처방","detail":"근합성을 위한 두 가지 필수 조건. 둘 중 하나만으로는 효과 절반","ref":"Morton RW. 2018"},
    {"principle":"상체 근육 먼저 증가","detail":"상체 근육이 늘면 기초대사율이 올라가면서 하체 지방도 자연스럽게 에너지로 전환"},
    {"principle":"류신 풍부 단백질 우선","detail":"달걀·유청·닭가슴살의 류신이 근합성 스위치(mTOR)를 직접 자극","ref":"Norton LE 2009"}
  ]',

  '[
    {"sport":"상체 저항 운동 (덤벨·바벨)","reason":"가슴·등·어깨·팔 근육 증가 → 전신 기초대사율 상승","schedule":"주 4회, 45분","mbti_tip":"하체 운동 비율 최소화. 상체 70%:하체 30%"},
    {"sport":"수영 (상체 위주)","reason":"상체 근육 저항 + 유산소 동시. 하체 압박 없이 전신 대사 활성화","schedule":"주 2회, 40분","mbti_tip":"평영보다 자유형·배영 비율 높이기"},
    {"sport":"PT (퍼스널 트레이닝)","reason":"자세 교정 + 근육 활성화 순서 학습이 중요. 혼자 하면 효율 낮음","schedule":"주 2회 이상 강력 권장","mbti_tip":"근합성 목표 명확히 전달"}
  ]',

  '[
    {"sport":"칼로리 소비 위주 유산소","reason":"근감소 악화 가능성. 지금 필요한 건 칼로리 소비가 아니라 근육 합성 신호","ref":"Morton RW. 2018"},
    {"sport":"하체 집중 고중량 운동 (초기)","reason":"상체 근육 기반 없이 하체만 자극하면 하체 비대만 발생"},
    {"sport":"단식·극단적 소식","reason":"근육 분해 가속. 이 체형에서 가장 피해야 할 선택","ref":"Prado CM. 2012"}
  ]',

  130, 10,
  0, 1,

  '{"protein":40,"fat":25,"carb":30,"fiber_g":20,"water_L":2.0,"mineral_priority":"아연·비타민D·류신 우선"}',

  '체중을 줄이려고 먹는 양을 줄이면 근육이 먼저 빠집니다. 지금 이 체형에게 필요한 건 덜 먹는 게 아니라 단백질을 충분히 채우는 겁니다. 40%는 근육 합성에 필요한 최소량입니다.',

  '[
    {"name":"유청 단백질","dose":"25~30g, 운동 후 30분 이내","reason":"근합성 골든타임 활용. 류신 함량 가장 높음","ref":"Morton RW. Br J Sports Med 2018"},
    {"name":"크레아틴 모노하이드레이트","dose":"5g/일, 운동 전후","reason":"근력 + 근육량 증가 가장 근거 강한 보충제 중 하나","ref":"Lanhers C et al. Eur J Sport Sci 2017"},
    {"name":"비타민D","dose":"2000IU/일, 식사 중","reason":"근기능 + 근합성 보조. 마른비만에서 비타민D 결핍 흔함","ref":"Holick MF. NEJM 2007"}
  ]',

  '[
    {"rule":"운동 후 30분 이내 단백질 먹기","detail":"근합성 골든타임. 이 타이밍을 놓치면 운동 효과가 절반으로 줄어듭니다","do":true},
    {"rule":"하루 단백질 체중×1.8g 목표","detail":"60kg이면 108g. 닭가슴살 200g+달걀2개+두부반모면 80g 정도. 나머지는 단백질 쉐이크","do":true},
    {"rule":"체중계보다 인바디 측정","detail":"근육량·체지방률 변화가 체중보다 먼저 개선됩니다. 4주마다 인바디 측정","do":true},
    {"rule":"칼로리 너무 많이 줄이기","detail":"근육 분해 가속. 지금은 유지 칼로리 + 단백질 추가가 맞습니다","do":false},
    {"rule":"유산소만 길게 하기","detail":"칼로리 소비는 되지만 근육이 빠집니다. 저항 운동이 이 체형의 핵심입니다","do":false}
  ]',

  '[
    {"method":"단백질 운동 후 30분 이내 섭취","detail":"근합성 골든타임. 유청단백 20~25g or 달걀 3개","condition":"매 운동 후 필수"},
    {"method":"수면 7~8시간","detail":"성장호르몬 분비의 70%가 수면 중 발생. 근합성의 결정적 시간","condition":"수면 부족 시 근합성 효율 40% 감소"},
    {"method":"냉온 교대 샤워 (운동 후)","detail":"운동 후 근육 통증 완화 + 혈류 증가. 뜨거운 물 2분 → 차가운 물 30초 × 3회","condition":"주 3~4회"}
  ]',

  '[
    {"type":"헬스장·PT센터","treatments":["상체 집중 근력 프로그램 설계 (하체 비율 최소화)","인바디 주 1회 추적","운동 후 단백질 즉시 섭취 지도"],"revisit":"4주마다 인바디 수치 변화 → 재등록 포인트"},
    {"type":"병원(내과·비만클리닉)","treatments":["인바디 정밀 측정 + 근감소증 스크리닝","비타민D·아연 혈중 수치 확인"],"revisit":"수치 개선 추적이 재방문 설계"},
    {"type":"에스테틱","treatments":["EMSlim/EMS 상체 근육 활성화","근육량 증가 + 체지방 동시 타겟"],"revisit":"EMS 8회 후 인바디 변화 비교"}
  ]',

  1, datetime('now'), 'seed_v1'
);
