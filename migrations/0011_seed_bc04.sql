-- BC-04 BLOCK-A형 INSERT (통짜 허리 블록형 — 코어 복압 실패)
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
  'BC-04', 1, 'BLOCK-A형', '통짜 허리 블록형 — 코어 복압 실패', '허리 전체',

  '정면에서 봤을 때 허리 곡선이 없고 통짜처럼 보이는 건 코어 근육이 복강 내압을 제대로 잡지 못하고 있기 때문입니다.',

  '허리 라인을 만드는 핵심은 눈에 보이는 복직근(식스팩)이 아니라 깊숙이 위치한 복횡근과 다열근입니다. 이 근육들이 복강 내압(IAP)을 안정적으로 유지해야 내장이 앞으로 밀려나오지 않고 허리 라인이 생깁니다. 잘못된 호흡 패턴, 장시간 앉은 자세, 과도한 복직근 운동이 이 코어 근육의 기능을 약화시킵니다.',

  '자세·호흡',

  '허리 라인은 다이어트로 만드는 게 아닙니다. 복횡근이 활성화되는 순간, 뱃살이 빠지지 않아도 허리 라인이 먼저 생깁니다. 필라테스 8주. 드로인 매일. 허리 곡선이 시작됩니다.',

  '[
    {"tag":"정면에서 봤을 때 허리가 쭉 뻗은 블록처럼 보인다"},
    {"tag":"배에 힘을 줘도 허리 라인이 잘 만들어지지 않는다"},
    {"tag":"허리 통증이나 뻐근함이 자주 있다"},
    {"tag":"크런치를 많이 해도 허리 라인이 안 생긴다"},
    {"tag":"오래 앉아 있으면 허리가 유독 불편하다"}
  ]',

  '[
    {"method":"크런치·윗몸일으키기","reason":"복직근만 강화. 복횡근은 미활성화 상태 유지. 복강 내압 오히려 불안정하게 만들 수 있음","ref":"McGill SM 2016"},
    {"method":"허리 꽉 잡아주는 거들·코르셋 착용","reason":"외부 지지대가 복횡근의 자체 활성화를 억제. 근육이 더 약해지는 패턴","ref":"재활의학 원칙"},
    {"method":"숨 참고 하는 고중량 운동","reason":"발살바 호흡이 복강 내압 급격히 상승 → 요추 불안정","ref":"McGill SM 2016"}
  ]',

  '[
    {"principle":"드로인(Draw-in) 운동으로 복횡근 활성화","detail":"배꼽을 척추 쪽으로 당기는 동작이 복횡근을 직접 수축. 8주 꾸준히 하면 허리 라인 가시화","ref":"Sirin 2022"},
    {"principle":"횡격막 호흡 재훈련","detail":"코로 깊이 들이쉬며 배가 부풀어 오르는 복식 호흡. 횡격막 기능 회복 → 복강 내압 안정화"},
    {"principle":"필라테스 코어 시퀀스","detail":"필라테스의 중립 척추 + 파워하우스 활성화가 복횡근·다열근을 동시에 타겟","ref":"Sekendiz 2007"}
  ]',

  '[
    {"sport":"필라테스 (기구/매트)","reason":"복횡근·다열근·골반저근 동시 활성화. 중립 척추 정렬 학습. 허리 라인 가장 빠르게 변화","schedule":"주 3회","mbti_tip":"코어 집중 수업 요청. 개인 PT 추천"},
    {"sport":"수영 (자유형·배영)","reason":"물 속 저항이 코어를 자연스럽게 활성화. 척추 감압 효과","schedule":"주 2~3회, 30분","mbti_tip":"역영 동작보다 호흡 리듬에 집중"},
    {"sport":"요가 (코어 시퀀스)","reason":"플랭크·보트 포즈·고양이-소 포즈가 복횡근·다열근 협응 훈련","schedule":"주 3회, 30분","mbti_tip":"부드러운 통증 없는 범위에서 진행"}
  ]',

  '[
    {"sport":"크런치·레그레이즈 시리즈","reason":"복직근만 강화하고 복횡근 패턴 방해. 허리 안정성 개선에 도움이 되지 않음","ref":"McGill SM 2016"},
    {"sport":"고중량 스쿼트·데드리프트 (초기)","reason":"코어 안정화 전 고중량은 요추에 부적절한 부담. 코어 활성화 후 단계적 도입"},
    {"sport":"달리기 (충격 반복)","reason":"코어 안정화 전 반복 충격은 요추 하중 불균형 악화 가능성"}
  ]',

  130, 12,
  1, 0,

  '{"protein":32,"fat":28,"carb":35,"fiber_g":25,"water_L":2.0,"mineral_priority":"마그네슘·칼슘 우선"}',

  '코어 근육을 만들려면 단백질이 필요하지만, 과도한 단백질은 간에 부담을 줍니다. 32%가 이 체형에게 딱 맞는 균형입니다. 마그네슘은 근육의 수축-이완 사이클을 돕는데, 코어 근육 활성화를 위해 특히 중요합니다.',

  '[
    {"name":"마그네슘 글리시네이트","dose":"400mg, 취침 전","reason":"코어 근육 야간 이완 + 척추 주변 근막 회복","ref":"Guerrero-Romero F. 2004"},
    {"name":"콜라겐 펩타이드","dose":"10g/일, 아침 공복","reason":"척추 인대·디스크 콜라겐 보충. 코어 안정성 기반","ref":"Shaw G et al. AJCN 2017"},
    {"name":"비타민D","dose":"2000IU/일, 식사 중","reason":"근육 기능 + 뼈 밀도 유지. 코어 운동 효과 보조","ref":"Holick MF. NEJM 2007"}
  ]',

  '[
    {"rule":"앉을 때 복횡근 살짝 조여두기","detail":"드로인 자세를 일상에서 습관화. 허리 라인이 조금씩 자리잡기 시작","do":true},
    {"rule":"매 시간 드로인 10회","detail":"배꼽을 척추 쪽으로 당기기 10회. 30초면 됩니다. 코어 근육이 깨어납니다","do":true},
    {"rule":"의자에 앉을 때 등받이 없이","detail":"척추 기립근 + 복횡근 자연스럽게 활성화. 처음엔 20분씩 늘려가기","do":true},
    {"rule":"배 꽉 잡아주는 속옷·코르셋 착용","detail":"외부 지지가 복횡근 자체 수축 억제. 근육이 스스로 일하게 두세요","do":false},
    {"rule":"눕자마자 바로 자기","detail":"취침 전 드로인 + 복식 호흡 5분이 코어 야간 회복을 가속합니다","do":false}
  ]',

  '[
    {"method":"온열 허리 찜질","detail":"요부 근막 이완 + 혈류 개선. 코어 운동 후 회복 촉진","condition":"매일 취침 전 15분"},
    {"method":"폼롤러 흉추 이완","detail":"흉추 가동성 회복 → 요추 보상 패턴 감소. 허리 뒤 폼롤러 위에서 좌우 굴림 10회","condition":"매일 아침"},
    {"method":"복식 호흡 명상","detail":"횡격막 기능 회복 + 코르티솔 감소. 눕거나 앉아서 배로 숨쉬기 5분","condition":"매일, 취침 전"}
  ]',

  '[
    {"type":"필라테스 센터","treatments":["코어 활성화 + 중립 척추 집중 수업","복횡근 타겟 기구 필라테스"],"revisit":"코어 수업 8주 전후 허리 둘레 변화 추적 → 재등록 포인트"},
    {"type":"병원(재활의학과)","treatments":["요추 안정성 평가 + 도수치료","코어 강화 처방운동 처방"],"revisit":"재활 후 필라테스 연계 추천"},
    {"type":"에스테틱","treatments":["복부 온열 테라피 + EMS 코어 활성화","림프 배농 복부 마사지"],"revisit":"EMS 후 코어 감각 개선 즉각 체감"}
  ]',

  1, datetime('now'), 'seed_v1'
);
