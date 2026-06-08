-- BC-10 R-REBOUND형 INSERT
-- 요요 리바운드형 — 렙틴 저항성
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
  'BC-10',
  1,
  'R-REBOUND형',
  '요요 리바운드형 — 렙틴 저항성',
  '전신 (대사 설정점 상승)',

  -- bc_primary_oneline_reason
  '살을 빼도 다시 돌아오는 건 의지 문제가 아닙니다. 몸이 원래 무게로 돌아가려는 강력한 생물학적 프로그램이 작동하고 있기 때문입니다.',

  -- bc_cause_story
  '반복적인 다이어트-요요 사이클은 렙틴 저항성을 만듭니다. 렙틴은 지방세포에서 분비되어 뇌에 포만감 신호를 보내는 호르몬입니다. 요요가 반복될수록 뇌가 렙틴 신호를 무시하기 시작합니다. 몸은 계속 배고프다고 느끼고, 기초대사는 낮아진 상태를 유지합니다. 체중 감량 후 1년이 지나도 식욕 호르몬이 정상화되지 않는 연구가 이를 뒷받침합니다. (Sumithran 2011 / Farooqi 2002)

몇 번이나 살을 뺐는데, 그때마다 다시 돌아왔습니다. 이건 실패가 아닙니다. 당신의 몸이 너무 똑똑한 겁니다. 체중이 줄면 식욕 호르몬이 증가하고, 기초대사가 낮아지고, 모든 시스템이 원래 무게로 돌아가려고 작동합니다. 이 프로그램을 이기려면 방법이 달라야 합니다.',

  -- bc_worsen_word
  '또 다른 단기 다이어트·극단적 칼로리 제한·빠른 결과 목표',

  -- closing_copy
  '이번이 마지막 다이어트가 되려면 방법이 달라야 합니다. 더 강하게가 아니라 더 지속 가능하게. 더 빠르게가 아니라 더 꾸준하게. 렙틴이 회복되면 배고픔이 줄고, 포만감이 돌아오고, 몸이 스스로 균형을 찾기 시작합니다. 3개월. 이번엔 다릅니다.',

  -- symptom_checklist_json
  '["다이어트 후 다시 원래 몸무게로 돌아온 경험 2회 이상","먹는 걸 줄여도 살이 잘 안 빠짐","항상 배고프고 포만감이 오래 안 감","살 빠지는 속도가 처음보다 느려짐","조금만 먹어도 찌는 느낌","야식·단것 충동이 강함","운동해도 예전만큼 효과 없음"]',

  -- wrong_methods_json
  '[{"method":"또 다른 단기 다이어트","reason":"렙틴 저항성을 더 강화. 요요 사이클 추가. 지속 불가능한 방법의 반복","evidence":"Sumithran P. NEJM 2011"},{"method":"극단적 칼로리 제한","reason":"기초대사 추가 저하 + 근육 분해. 요요 후 더 쉽게 찌는 몸으로 변화","evidence":"Rosenbaum M. 2010"},{"method":"빠른 결과를 향한 초조함","reason":"단기 목표가 아닌 시스템 구축이 필요. 빠른 방법일수록 더 빠른 요요","evidence":"임상 영양학 원칙"}]',

  -- correct_principles_json
  '[{"principle":"렙틴 감수성 회복 먼저","explanation":"오메가3·수면·간헐적 단식(부드럽게)이 렙틴 감수성 점진적 회복 (Farooqi 2002)"},{"principle":"장내 미생물 다양성 증가","explanation":"발효식품·프리바이오틱스로 장내 미생물 다양성 증가 → 대사 설정점 낮아짐 (Cotillard 2013)"},{"principle":"지속 가능한 속도","explanation":"주당 0.3~0.5kg. 이 속도가 요요 없이 유지되는 기전과 일치. 빠른 감량은 요요 가속"}]',

  -- recommended_sports_json
  '[{"sport":"규칙적 걷기 (NEAT 기반)","reason":"비운동 활동 열발생(NEAT) 증가가 요요 방지에 가장 효과적. 엘리베이터 대신 계단 등","schedule":"매일 7000보 이상","tip":"특별한 운동 시간 없이 일상 활동량 올리기"},{"sport":"저항 운동 (근육 보호)","reason":"근육이 있어야 요요 후에도 기초대사 유지. 근육 1kg이 기초대사 13kcal/일 상승","schedule":"주 2~3회, 30분","tip":"강도보다 꾸준함 우선"},{"sport":"수영 또는 걷기","reason":"스트레스 없이 즐길 수 있는 운동 선택. 운동이 의무가 아닌 즐거움이 되어야 지속","schedule":"주 2~3회","tip":"즐길 수 있는 운동 한 가지만 고르기"}]',

  -- forbidden_sports_json
  '[{"sport":"빠른 결과 위한 고강도 운동 집중","reason":"기초대사 대비 에너지 소비 과다 → 반작용 식욕 증가 → 요요 가속","evidence":"Sumithran P. 2011"},{"sport":"자신을 처벌하는 방식의 운동","reason":"심리적 부담이 지속성 떨어뜨림. 운동을 다이어트 도구로만 보는 것이 문제","evidence":"임상 심리학"},{"sport":"단기 강도 높은 프로그램","reason":"12주 완성 같은 프로그램 종료 후 요요 패턴 반복. 지속 가능한 생활 방식으로 전환 필요","evidence":"임상 관찰"}]',

  -- zone2_bpm_v2 (지속 가능한 강도)
  130,

  -- hiit_available_week_v2 (렙틴 저항성 개선 후 12주)
  12,

  -- sauna_ok (이완·회복 목적 가능)
  1,

  -- cryo_ok (특별 금기 없음)
  0,

  -- macro_ratio_json
  '{"protein":32,"fat":28,"carb":35,"fiber_g":30,"water_L":2,"priority_minerals":"마그네슘·아연·오메가3"}',

  -- macro_story
  '요요가 반복된 몸에게 필요한 건 더 강한 다이어트가 아닙니다. 렙틴이 제대로 일할 수 있는 환경을 만드는 것입니다. 식이섬유 30g은 장내 미생물을 다양하게 만들고, 이것이 뇌의 포만감 신호를 서서히 회복시킵니다.',

  -- supplement_list_json
  '[{"name":"오메가3","dose":"2g/일","timing":"식후","reason":"렙틴 수용체 반응성 개선 + 염증 억제","evidence":"Simopoulos AP. 2002"},{"name":"프로바이오틱스 (다균주)","dose":"10억 CFU 이상","timing":"아침 공복","reason":"장내 미생물 다양성 증가 → 대사 설정점 조절","evidence":"Cotillard A. Nature 2013"},{"name":"마그네슘","dose":"400mg","timing":"취침 전","reason":"렙틴 분비 패턴 정상화. 수면 질 개선 → 렙틴 회복 가속","evidence":"Guerrero-Romero F. 2004"}]',

  -- lifestyle_rules_json
  '[{"rule":"주당 0.3~0.5kg 목표 설정","type":"do","description":"이 속도가 요요 없는 감량의 생리학적 적정 속도입니다. 빠를수록 돌아옵니다"},{"rule":"체중 대신 습관 추적","type":"do","description":"오늘 채소를 먹었는가, 7000보를 걸었는가. 숫자보다 행동이 지속성을 만듭니다"},{"rule":"즐길 수 있는 운동 하나","type":"do","description":"다이어트를 위한 운동이 아닌 즐거운 활동. 이것이 10년을 유지하는 유일한 방법"},{"rule":"또 다른 단기 다이어트 시작","type":"dont","description":"렙틴 저항성을 더 강화합니다. 이번에는 시스템을 바꾸는 것이 목표"},{"rule":"빠른 결과에 대한 초조함","type":"dont","description":"빠른 결과가 빠른 요요를 만듭니다. 3개월 단위로 생각하세요"}]',

  -- recovery_priority_json
  '[{"method":"수면 7~9시간 필수","description":"렙틴은 수면 중에 분비. 수면 부족이 렙틴 저항성 악화의 주요 원인","condition":"수면이 가장 강력한 항요요 처방"},{"method":"스트레스 관리","description":"코르티솔이 렙틴 신호를 방해. BC-09 회복 처방과 병행","condition":"마음챙김·아로마·요가"},{"method":"장 회복 (프로바이오틱스)","description":"장내 미생물 다양성이 체중 설정점 조절에 영향. 장 건강이 요요 방지의 기반","condition":"발효식품 매일 + 프로바이오틱스"}]',

  -- b2b_treatments_json
  '[{"partner_type":"병원 (내분비과·비만클리닉)","treatments":["렙틴·그렐린 수치 검사 + 기초대사율 측정","GLP-1 수용체 작용제 적응 여부 검토","장내 미생물 검사 (최신 클리닉)"],"revisit_point":"렙틴 수치 변화 추적이 재방문 포인트"},{"partner_type":"에스테틱","treatments":["림프 배농 + 전신 순환 마사지 (회복 지원)","스트레스 이완 테라피 (BC-09와 겸용)"],"revisit_point":"몸 변화 서사 구축이 재방문 동기"},{"partner_type":"헬스장·PT","treatments":["단기 프로그램 대신 6개월 지속 가능 플랜 설계","NEAT 올리는 생활 방식 코칭"],"revisit_point":"장기 회원권 + 정기 체크인 프로그램"}]',

  1,
  CURRENT_TIMESTAMP,
  'seed_bc10'
);
