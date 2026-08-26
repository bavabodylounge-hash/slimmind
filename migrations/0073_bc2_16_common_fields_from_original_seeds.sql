-- ═══════════════════════════════════════════════════════════
-- 0073: BC-2~16 공통 처방 핵심 필드 이식 (설계도 원본 데이터)
-- 구버전 0009~0017, 0026 파일에서 symptom_checklist, exercises,
-- supplement, lifestyle, zone2_bpm, hiit_weeks 등 추출하여 UPDATE
-- ═══════════════════════════════════════════════════════════

-- ─── BC-2 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '[
    {"tag":"술을 마신 다음날 배가 더 나와 보인다"},
    {"tag":"배가 단단하게 팽창된 느낌이 자주 든다"},
    {"tag":"음주 후 며칠간 몸이 붓고 무겁다"},
    {"tag":"안주를 많이 먹지 않아도 배가 나온다"},
    {"tag":"간 부위(오른쪽 갈비뼈 아래)가 묵직한 느낌이 든다"}
  ]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[
    {"method":"음주 다음날 공복 운동","reason":"알코올 대사 산물(아세트알데히드)이 남아있는 상태에서 운동하면 간 부하 2배 증가","ref":"Sports Med 권고사항"},
    {"method":"이온 음료·당분 음료로 해장","reason":"당분이 알코올 해독 지연. 간에 추가 부담. 배만 더 나옴","ref":"임상 영양학 권고"},
    {"method":"유산소만 장기간","reason":"간 내 지방 감소에는 저항 운동 병행이 필수. 유산소만으로는 내장지방 효과 제한적","ref":"Hashida R. JGH 2017"}
  ]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[
    {"principle":"절주 후 4주 간 회복","detail":"절주 시작 4주 후부터 간지방이 줄기 시작. 처방 효과가 가장 빠른 BC 코드","ref":"Sozio M 2008"},
    {"principle":"간 해독 식품 우선 처방","detail":"밀크씨슬·아티초크·강황이 ALT·AST 수치 개선. 간 재생 촉진"},
    {"principle":"저항+유산소 복합 운동","detail":"간 내 지방 감소에 복합 운동이 단독 운동보다 2배 효과적","ref":"Hashida R 2017"}
  ]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[
    {"sport":"중강도 유산소+저항 복합","reason":"간 지방 대사 활성화. 유산소 20분 + 저항 운동 20분 세트","schedule":"주 4회, 총 40분","mbti_tip":"간 해독 회복 기간 중 강도 60%로 시작"},
    {"sport":"수영 (중강도)","reason":"전신 유산소. 간에 부담 없이 지방 태우기. 관절 부담 없음","schedule":"주 3회, 40분","mbti_tip":"알코올성 부종 있는 날은 강도 줄이기"},
    {"sport":"걷기 (식후)","reason":"식후 혈당 관리 + 간 부하 최소화 상태에서 지방 산화","schedule":"매일 식후 15분","mbti_tip":"음주 다음날은 가벼운 산책만"}
  ]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[
    {"sport":"음주 다음날 고강도 운동","reason":"아세트알데히드 잔류 상태에서 간 부하 폭발. 근 손상 위험 증가","ref":"Sports Med 권고사항"},
    {"sport":"HIIT·크로스핏 (초기)","reason":"간 회복 전 고강도는 ALT·AST 수치 상승. 8주 후 재평가 필요"},
    {"sport":"빈속 달리기","reason":"코르티솔 폭발 + 간 글리코겐 고갈 → 지방 대신 근육 분해"}
  ]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[
    {"name":"밀크씨슬 (실리마린)","dose":"300mg/일, 식사 중","reason":"간세포 보호 + ALT·AST 개선. 알코올성 지방간 1순위 영양제","ref":"Vargas-Mendoza N. World J Hepatol 2014"},
    {"name":"비타민 B군 복합제","dose":"1정/일, 아침 식사 후","reason":"알코올이 가장 먼저 파괴하는 영양소. 지방 대사 효소 보조"},
    {"name":"아연","dose":"25mg/일, 식후","reason":"알코올성 지방간에서 아연 결핍 가장 흔함. 인슐린 수용체 기능 보조","ref":"Chavarro JE. AJCN 2009"}
  ]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[
    {"rule":"절주 목표 설정","detail":"완전 금주가 이상적. 현실적 목표: 주 2회 이하, 1회 2잔 이하. 4주 지키면 배 사이즈 변화 체감","do":true},
    {"rule":"음주 전 물 500ml","detail":"알코올 흡수 속도 늦추기. 공복 음주 금지. 반드시 음식과 함께","do":true},
    {"rule":"간 해독 아침 루틴","detail":"기상 후 따뜻한 레몬수 + 강황 가루 1/4티스푼. 간 해독 효소 아침부터 활성화","do":true},
    {"rule":"음주 다음날 고강도 운동","detail":"잔류 아세트알데히드 상태에서 운동하면 간 손상 가중. 가벼운 산책만","do":false},
    {"rule":"숙취 음식으로 라면·탄수화물","detail":"해장이 아니라 추가 지방 합성. 따뜻한 물 + 강황차가 진짜 해장","do":false}
  ]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[
    {"method":"간 회복 수면 8시간","detail":"간 세포 재생은 수면 중에만 이루어짐. 7시간 미만 시 간 회복 속도 40% 감소","condition":"매일 필수. 알코올 전날보다 1시간 추가"},
    {"method":"온열 테라피 (사우나)","detail":"혈류 증가 → 간 산소 공급 증가 → 해독 효소 활성화","condition":"주 2회, 15분. 음주 다음날은 금지"},
    {"method":"간 해독 차 (밀크씨슬·민들레)","detail":"실리마린 성분이 간세포 보호 + 재생 촉진. 아침 공복 복용","condition":"매일 아침"}
  ]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":30,"fat":25,"carb":40,"fiber_g":30,"water_L":2.5,"mineral_priority":"아연·셀레늄·B군 비타민"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 130),
  hiit_available_week       = COALESCE(hiit_available_week, 8)
WHERE bc_code = 'BC-2';

-- ─── BC-3 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '[
    {"tag":"목이 짧아 보이고 어깨가 두꺼워 보인다"},
    {"tag":"팔뚝이 굵고 잘 빠지지 않는다"},
    {"tag":"어깨와 목 주변이 항상 뭉쳐있다"},
    {"tag":"하루 종일 앉아서 일하거나 스마트폰을 많이 쓴다"},
    {"tag":"어깨·팔뚝을 마사지하면 붓는 느낌이 든다"}
  ]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[
    {"method":"고중량 어깨·승모근 운동(바벨쉬러그·밀리터리프레스)","reason":"이미 긴장된 승모근을 더 강화. 림프 정체 악화. 어깨 더 두꺼워짐","ref":"림프 해부학 원리"},
    {"method":"목·어깨 강한 마사지 (초반)","reason":"막힌 림프를 강하게 밀어도 배출 경로가 없으면 더 붓는 역반응 발생","ref":"림프계 해부학 원리"},
    {"method":"장시간 같은 자세 유지 (앉아서 일)","reason":"경추 하중 지속 → 림프관 압박 지속. 1시간마다 목·어깨 스트레칭 필수","ref":"Hansraj KK 2014"}
  ]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[
    {"principle":"상지 림프절 먼저 활성화","detail":"마사지·운동 전 겨드랑이 림프절을 가볍게 10회 자극. 배출 경로를 열어놓고 시작"},
    {"principle":"경추 하중 감소","detail":"목을 바로 세우는 자세 교정만으로도 승모근 긴장이 줄고 림프 흐름 개선"},
    {"principle":"수영 리듬 동작","detail":"수영의 반복적 어깨 동작이 상지 림프를 심장 방향으로 자연스럽게 펌핑","ref":"Malicka 2013"}
  ]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[
    {"sport":"수영 (배영·자유형)","reason":"어깨 리드미컬한 반복 동작 → 상지 림프 펌핑. 경추 하중 없이 순환","schedule":"주 3회, 30~40분","mbti_tip":"배영이 경추 이완에 특히 효과적"},
    {"sport":"필라테스 (경추·어깨 집중)","reason":"경추 정렬 + 어깨 안정화 + 근막 이완을 동시에. 림프 배농 동작 포함 수업","schedule":"주 2~3회","mbti_tip":"경추 집중 프로그램 요청"},
    {"sport":"요가 (머리 위치 교정 동작)","reason":"고양이·소 동작·어깨 원 그리기·흉추 회전. 경추 하중 분산 + 림프 자극","schedule":"매일 10~15분, 기상 후","mbti_tip":"부교감 신경 활성화로 림프 순환 보조"}
  ]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[
    {"sport":"고중량 어깨·승모 운동","reason":"긴장된 승모근 추가 강화 → 림프 정체 악화. 어깨 사이즈만 커짐"},
    {"sport":"헤드뱅잉·충격 유발 운동","reason":"경추 하중 추가 → 근막 경직 악화","ref":"Hansraj KK 2014"},
    {"sport":"거북목 자세로 하는 모든 운동","reason":"운동 중 자세 불량이 경추 하중 유지 → 림프 정체 지속"}
  ]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[
    {"name":"오메가3","dose":"2g/일, 식후","reason":"림프관 염증 억제 + 상지 혈관 탄성","ref":"Simopoulos AP. 2002"},
    {"name":"마그네슘 글리시네이트","dose":"400mg, 취침 전","reason":"승모근 만성 긴장 완화. 수면 중 근막 이완 보조","ref":"Guerrero-Romero F. 2004"},
    {"name":"비타민C","dose":"1000mg/일, 아침","reason":"콜라겐 합성 → 림프관 벽 강화. 항산화","ref":"Padayatty SJ. JAMA 2004"}
  ]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[
    {"rule":"1시간마다 목·어깨 스트레칭","detail":"경추 하중 누적 차단. 타이머 설정으로 습관화. 어깨 원 10회 + 목 좌우 기울이기","do":true},
    {"rule":"모니터 높이 눈 높이로 조정","detail":"거북목 자세 근본 해결. 스마트폰 사용 시 눈 높이까지 올리기","do":true},
    {"rule":"취침 전 온열 찜질 10분","detail":"경추 근막 이완 + 림프 야간 배출 촉진. 라벤더 오일 추가 시 부교감 신경 활성화","do":true},
    {"rule":"무거운 백팩·한쪽 숄더백","detail":"어깨 불균형 + 림프관 압박 직결. 백팩은 양쪽 끈 필수","do":false},
    {"rule":"고나트륨 가공식품 과다","detail":"나트륨이 상체 세포 간질에 수분 잡아둠 → 팔뚝·어깨 부종 직결","do":false}
  ]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[
    {"method":"상지 림프 마사지 (드레나쥐)","detail":"겨드랑이 림프절 먼저 10회 활성화 → 팔 말단에서 겨드랑이 방향으로 부드럽게. 강도 처음 2주 50%","condition":"주 2~3회"},
    {"method":"온열 목·어깨 찜질","detail":"경추 근막 이완 + 림프 순환 개선. 40~42도 15분","condition":"매일 저녁, 취침 전"},
    {"method":"경추 스트레칭 루틴","detail":"1시간마다 목 좌우 기울이기·어깨 원 그리기 10회. 림프 정체 예방","condition":"매 시간 습관화"}
  ]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":30,"fat":28,"carb":37,"fiber_g":25,"water_L":2.0,"mineral_priority":"칼륨·마그네슘 우선"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 140),
  hiit_available_week       = COALESCE(hiit_available_week, 8)
WHERE bc_code = 'BC-3';

-- ─── BC-4 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '[
    {"tag":"정면에서 봤을 때 허리가 쭉 뻗은 블록처럼 보인다"},
    {"tag":"배에 힘을 줘도 허리 라인이 잘 만들어지지 않는다"},
    {"tag":"허리 통증이나 뻐근함이 자주 있다"},
    {"tag":"크런치를 많이 해도 허리 라인이 안 생긴다"},
    {"tag":"오래 앉아 있으면 허리가 유독 불편하다"}
  ]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[
    {"method":"크런치·윗몸일으키기","reason":"복직근만 강화. 복횡근은 미활성화 상태 유지. 복강 내압 오히려 불안정하게 만들 수 있음","ref":"McGill SM 2016"},
    {"method":"허리 꽉 잡아주는 거들·코르셋 착용","reason":"외부 지지대가 복횡근의 자체 활성화를 억제. 근육이 더 약해지는 패턴","ref":"재활의학 원칙"},
    {"method":"숨 참고 하는 고중량 운동","reason":"발살바 호흡이 복강 내압 급격히 상승 → 요추 불안정","ref":"McGill SM 2016"}
  ]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[
    {"principle":"드로인(Draw-in) 운동으로 복횡근 활성화","detail":"배꼽을 척추 쪽으로 당기는 동작이 복횡근을 직접 수축. 8주 꾸준히 하면 허리 라인 가시화","ref":"Sirin 2022"},
    {"principle":"횡격막 호흡 재훈련","detail":"코로 깊이 들이쉬며 배가 부풀어 오르는 복식 호흡. 횡격막 기능 회복 → 복강 내압 안정화"},
    {"principle":"필라테스 코어 시퀀스","detail":"필라테스의 중립 척추 + 파워하우스 활성화가 복횡근·다열근을 동시에 타겟","ref":"Sekendiz 2007"}
  ]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[
    {"sport":"필라테스 (기구/매트)","reason":"복횡근·다열근·골반저근 동시 활성화. 중립 척추 정렬 학습. 허리 라인 가장 빠르게 변화","schedule":"주 3회","mbti_tip":"코어 집중 수업 요청. 개인 PT 추천"},
    {"sport":"수영 (자유형·배영)","reason":"물 속 저항이 코어를 자연스럽게 활성화. 척추 감압 효과","schedule":"주 2~3회, 30분","mbti_tip":"역영 동작보다 호흡 리듬에 집중"},
    {"sport":"요가 (코어 시퀀스)","reason":"플랭크·보트 포즈·고양이-소 포즈가 복횡근·다열근 협응 훈련","schedule":"주 3회, 30분","mbti_tip":"부드러운 통증 없는 범위에서 진행"}
  ]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[
    {"sport":"크런치·레그레이즈 시리즈","reason":"복직근만 강화하고 복횡근 패턴 방해. 허리 안정성 개선에 도움이 되지 않음","ref":"McGill SM 2016"},
    {"sport":"고중량 스쿼트·데드리프트 (초기)","reason":"코어 안정화 전 고중량은 요추에 부적절한 부담. 코어 활성화 후 단계적 도입"},
    {"sport":"달리기 (충격 반복)","reason":"코어 안정화 전 반복 충격은 요추 하중 불균형 악화 가능성"}
  ]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[
    {"name":"마그네슘 글리시네이트","dose":"400mg, 취침 전","reason":"코어 근육 야간 이완 + 척추 주변 근막 회복","ref":"Guerrero-Romero F. 2004"},
    {"name":"콜라겐 펩타이드","dose":"10g/일, 아침 공복","reason":"척추 인대·디스크 콜라겐 보충. 코어 안정성 기반","ref":"Shaw G et al. AJCN 2017"},
    {"name":"비타민D","dose":"2000IU/일, 식사 중","reason":"근육 기능 + 뼈 밀도 유지. 코어 운동 효과 보조","ref":"Holick MF. NEJM 2007"}
  ]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[
    {"rule":"앉을 때 복횡근 살짝 조여두기","detail":"드로인 자세를 일상에서 습관화. 허리 라인이 조금씩 자리잡기 시작","do":true},
    {"rule":"매 시간 드로인 10회","detail":"배꼽을 척추 쪽으로 당기기 10회. 30초면 됩니다. 코어 근육이 깨어납니다","do":true},
    {"rule":"의자에 앉을 때 등받이 없이","detail":"척추 기립근 + 복횡근 자연스럽게 활성화. 처음엔 20분씩 늘려가기","do":true},
    {"rule":"배 꽉 잡아주는 속옷·코르셋 착용","detail":"외부 지지가 복횡근 자체 수축 억제. 근육이 스스로 일하게 두세요","do":false},
    {"rule":"눕자마자 바로 자기","detail":"취침 전 드로인 + 복식 호흡 5분이 코어 야간 회복을 가속합니다","do":false}
  ]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[
    {"method":"온열 허리 찜질","detail":"요부 근막 이완 + 혈류 개선. 코어 운동 후 회복 촉진","condition":"매일 취침 전 15분"},
    {"method":"폼롤러 흉추 이완","detail":"흉추 가동성 회복 → 요추 보상 패턴 감소. 허리 뒤 폼롤러 위에서 좌우 굴림 10회","condition":"매일 아침"},
    {"method":"복식 호흡 명상","detail":"횡격막 기능 회복 + 코르티솔 감소. 눕거나 앉아서 배로 숨쉬기 5분","condition":"매일, 취침 전"}
  ]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":32,"fat":28,"carb":35,"fiber_g":25,"water_L":2.0,"mineral_priority":"마그네슘·칼슘 우선"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 130),
  hiit_available_week       = COALESCE(hiit_available_week, 12)
WHERE bc_code = 'BC-4';

-- ─── BC-5 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '[
    {"tag":"하체(허벅지·엉덩이)가 유독 살이 많고 잘 안 빠진다"},
    {"tag":"스쿼트를 열심히 했는데 허벅지가 더 굵어진 느낌이 든다"},
    {"tag":"상체는 날씬한 편인데 하체만 크다"},
    {"tag":"생리 전후로 하체가 더 붓는다"},
    {"tag":"하체 림프 마사지 후 더 붓는 경험이 있다"}
  ]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[
    {"method":"고중량 스쿼트·런지·레그프레스","reason":"대퇴사두근 비대 유발. 지방 안 빠지고 근육만 커져서 허벅지 사이즈 증가","ref":"Schoenfeld BJ. JSCR 2010"},
    {"method":"스텝밀·계단 오르기","reason":"허벅지 외측(IT밴드+외측광근) 직접 자극 → 외측 비대","ref":"임상 관찰"},
    {"method":"대두·두유 과다 섭취","reason":"이소플라본이 에스트로겐 수용체 작용 → 에스트로겐 효과 증폭. 하체 지방 고착 악화","ref":"Messina M. AJCN 2016"}
  ]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[
    {"principle":"에스트로겐 대사 경로 회복","detail":"간에서 에스트로겐을 분해하는 경로(2-OHE1)를 DIM 식품으로 활성화. 하체 알파-2 수용체 억제"},
    {"principle":"상체 근육량 증가로 전신 대사 동기화","detail":"상체 근육을 키우면 전신 기초대사가 올라가면서 하체 지방도 에너지로 동원됨"},
    {"principle":"림프 순환 활성화","detail":"하체 림프 흐름 개선으로 지방 대사 산물 배출 촉진. 수영·족욕·림프 마사지가 효과적"}
  ]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[
    {"sport":"수영 (상체 위주 영법)","reason":"하체 부하 없이 전신 혈류·림프 순환. 에스트로겐 대사 산물 배출 촉진","schedule":"주 3회, 40분, 배영·자유형 위주","mbti_tip":"물 온도 27도 이상 필수 (냉수는 하체 림프 수축)"},
    {"sport":"상체 덤벨 운동","reason":"상체 근육량 증가 → 전신 기초대사 상승 → 하체 지방 에너지화","schedule":"주 3회, 30분. 하체 운동 제외","mbti_tip":"반복적이면 지루 → 매 세션 다른 구성 OK"},
    {"sport":"평지 걷기 (경사·계단 금지)","reason":"하체 알파-2 수용체 과자극 없이 림프 순환만 개선","schedule":"매일 30분, 완전 평지만","mbti_tip":"경사도 0 필수. 경사 있으면 허벅지 자극 증가"}
  ]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[
    {"sport":"고중량 하체 운동 (스쿼트·런지 등)","reason":"알파-2 수용체 자극 없이 근육만 비대. 치수 악화","ref":"Arner P. 1990 기전"},
    {"sport":"스텝밀·에어로바이크 고저항","reason":"허벅지 외측 비대 직접 유발"},
    {"sport":"고강도 하체 유산소 (달리기)","reason":"하체 근육 과자극. 부종 악화 가능성"}
  ]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[
    {"name":"DIM (디인돌리메탄)","dose":"200mg/일, 식사 중","reason":"에스트로겐 2-OHE1 전환 1순위 영양제. 브로콜리 식품 보완","ref":"Thomson CA. Breast Cancer Res Treat 2017"},
    {"name":"오메가3","dose":"2g/일, 식후","reason":"하체 혈관·림프 순환 + 에스트로겐 대사 보조","ref":"Simopoulos AP. 2002"},
    {"name":"마그네슘 글리시네이트","dose":"400mg, 취침 전","reason":"근육 긴장 완화 + 수면 개선. 하체 경련 예방","ref":"Guerrero-Romero F. 2004"}
  ]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[
    {"rule":"다리 꼬지 않기","detail":"다리 꼬기 → 사타구니 림프관 압박 → 하체 림프 정체 직접 유발. 의자에 앉을 때 양발 바닥","do":true},
    {"rule":"저녁 족욕 10분","detail":"하체 림프 순환 개선 + 냉증 해소. 에센셜 오일(사이프러스·주니퍼) 추가 시 림프 효과 강화","do":true},
    {"rule":"수면 중 다리 올리기","detail":"베개 1~2개를 발 아래 받쳐 심장보다 높게. 하체 부종 수면 중 자연 배출","do":true},
    {"rule":"장시간 서 있기·걷기 후 냉찜질","detail":"냉자극이 하체 림프관 수축. 오히려 부종 악화. 온찜질·족욕으로 대체","do":false},
    {"rule":"짠 음식+저녁 수분 과다","detail":"나트륨이 세포 간질에 수분 잡아둠 → 아침 하체 부종 악화","do":false}
  ]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[
    {"method":"족욕 매일 (40도, 20분)","detail":"하체 혈류 촉진 + 림프 순환 개선. 냉증 해소. 취침 전 가장 효과적","condition":"매일 취침 전"},
    {"method":"하체 림프 마사지 (드레나쥐)","detail":"사타구니 림프절 먼저 활성화 → 허벅지 말단에서 중심으로 마사지. 마사지 전 림프절 압박 10회 필수","condition":"주 2~3회"},
    {"method":"온열 테라피","detail":"하체 혈류 증가 + 에스트로겐 대사 촉진. 적외선 사우나 하체 집중","condition":"주 2회, 15분"}
  ]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":30,"fat":25,"carb":40,"fiber_g":30,"water_L":2.5,"mineral_priority":"나트륨 1500mg 이하 제한"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 130),
  hiit_available_week       = COALESCE(hiit_available_week, 12)
WHERE bc_code = 'BC-5';

-- ─── BC-6 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '[
    {"tag":"허벅지를 만지면 차갑고 꼬집으면 울퉁불퉁하다"},
    {"tag":"하체가 항상 차갑고 잘 붓는다"},
    {"tag":"운동 후 하체가 오히려 더 붓는 경험이 있다"},
    {"tag":"찬 곳에 앉아 있으면 하체가 특히 더 차가워진다"},
    {"tag":"샤워 후에도 하체만 빨리 차가워진다"}
  ]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[
    {"method":"찬물 수영·냉수욕","reason":"하체 혈관 수축 → 미세혈관 순환 추가 악화. 셀룰라이트가 더 굳어짐","ref":"혈관 반응 생리학"},
    {"method":"저녁 고강도 하체 운동","reason":"근육 혈류는 증가하지만 림프 배출 경로가 막혀 있으면 오히려 더 붓는 패턴","ref":"림프계 생리학"},
    {"method":"고나트륨 식품","reason":"세포 간질에 수분 고착 → 하체 림프 흐름 추가 방해","ref":"임상 영양학"}
  ]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[
    {"principle":"온열로 혈관 먼저 열기","detail":"따뜻한 환경(온수 수영·족욕·사우나)이 하체 미세혈관을 확장. 이후 림프가 흐르기 시작"},
    {"principle":"림프 배농 순서 준수","detail":"사타구니 림프절 먼저 활성화 → 허벅지 말단에서 중심으로 마사지 방향. 반대로 하면 더 붓는 역반응"},
    {"principle":"콜라겐 합성 촉진","detail":"비타민C + 콜라겐 펩타이드로 굳어진 결합조직을 부드럽게 회복"}
  ]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[
    {"sport":"온수 수영 (28도 이상)","reason":"따뜻한 물이 하체 혈관 확장 + 림프 순환 동시 활성화. 찬 수영장은 맞지 않음","schedule":"주 3회, 40분","mbti_tip":"수온 28도 이상 확인 필수"},
    {"sport":"족욕 후 가벼운 걷기","reason":"족욕으로 혈관 열고 → 걷기로 림프 펌핑. 냉증 완화에 가장 효과적인 순서","schedule":"매일, 족욕 20분 후 15분 걷기","mbti_tip":"경사 없는 평지만"},
    {"sport":"아침 햇볕 걷기","reason":"비타민D 합성 + 혈관 확장 효과. 이른 아침 일광욕은 하체 혈류 개선","schedule":"매일 오전 20~30분","mbti_tip":"자외선 차단 없이 10분간 햇볕 노출"}
  ]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[
    {"sport":"찬 환경 운동 (겨울 야외·냉방 센터)","reason":"하체 혈관 수축 강화. 셀룰라이트 악화"},
    {"sport":"고중량 하체 운동","reason":"이미 순환이 막힌 상태에서 근육 부하만 증가. 부종 악화 가능"},
    {"sport":"저녁 늦은 고강도 운동","reason":"야간 코르티솔 상승 + 림프 순환 저하 시간대 고강도는 회복 방해"}
  ]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[
    {"name":"콜라겐 펩타이드","dose":"10g/일, 아침 공복","reason":"셀룰라이트 결합조직 회복. 피부 탄력 개선","ref":"Proksch E et al. Skin Pharmacol 2014"},
    {"name":"비타민C","dose":"1000mg/일, 아침","reason":"콜라겐 합성 보조 + 혈관 벽 강화","ref":"Padayatty SJ. JAMA 2004"},
    {"name":"마그네슘","dose":"400mg, 취침 전","reason":"혈관 평활근 이완 → 미세순환 개선. 냉증 완화","ref":"Guerrero-Romero F. 2004"}
  ]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[
    {"rule":"취침 전 족욕 20분","detail":"하루 중 가장 중요한 루틴. 따뜻한 물이 하체 혈관을 열고 야간 림프 순환을 가속","do":true},
    {"rule":"따뜻한 음료 습관화","detail":"커피 대신 따뜻한 생강차·루이보스. 차가운 음료가 하체 냉증을 악화시킵니다","do":true},
    {"rule":"다리 올리고 자기","detail":"베개 1~2개로 발을 심장보다 높게. 밤새 하체 림프가 자연스럽게 빠짐","do":true},
    {"rule":"차가운 곳에 오래 앉아있기","detail":"하체 혈관 수축 지속 → 셀룰라이트 악화. 방석·무릎 담요 활용","do":false},
    {"rule":"다리 꼬기","detail":"사타구니 림프관 직접 압박. 이 체형에게는 특히 영향이 큽니다","do":false}
  ]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[
    {"method":"족욕 매일 (40도, 20분)","detail":"하체 미세혈관 확장 + 림프 순환 촉진. 취침 전 시행이 야간 순환에 가장 효과적. 사이프러스 에센셜 오일 2방울 추가","condition":"매일 취침 전"},
    {"method":"온열 랩·핫팩 (허벅지)","detail":"지방 섬유화 부위 직접 온열 → 결합조직 이완 + 혈류 증가","condition":"주 4~5회, 20분"},
    {"method":"하체 림프 마사지 (드레나쥐)","detail":"사타구니 림프절 10회 활성화 → 허벅지 안쪽에서 사타구니 방향 부드럽게. 강도 처음 2주 50% 유지","condition":"주 2~3회"}
  ]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":28,"fat":35,"carb":32,"fiber_g":25,"water_L":2.5,"mineral_priority":"칼슘·규소·비타민C 우선"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 125),
  hiit_available_week       = COALESCE(hiit_available_week, 12)
WHERE bc_code = 'BC-6';

-- ─── BC-7 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '[
    {"tag":"체중계 숫자는 정상인데 인바디를 찍으면 체지방이 높게 나온다"},
    {"tag":"팔다리가 가는데 배나 허리에 살이 있다"},
    {"tag":"조금만 먹어도 살이 찌는 것 같다"},
    {"tag":"다이어트를 해도 체중이 빠지긴 하는데 금방 돌아온다"},
    {"tag":"근력이 약하고 체력이 빨리 떨어진다"}
  ]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[
    {"method":"칼로리 제한 다이어트","reason":"근육과 지방을 함께 줄임. 근육이 더 많이 빠지면 기초대사율 추가 저하","ref":"Prado CM. JCSM 2012"},
    {"method":"유산소 운동만","reason":"에너지 소비는 되지만 근육 합성 신호가 없음. 장기적으로 근감소 악화","ref":"Morton RW. 2018"},
    {"method":"하체 집중 유산소 (달리기·자전거)","reason":"이미 약한 하체 근육 추가 분해 가능성. 상체 근육 빌드업이 선행되어야","ref":"임상 관찰"}
  ]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[
    {"principle":"단백질 40% + 저항 운동 동시 처방","detail":"근합성을 위한 두 가지 필수 조건. 둘 중 하나만으로는 효과 절반","ref":"Morton RW. 2018"},
    {"principle":"상체 근육 먼저 증가","detail":"상체 근육이 늘면 기초대사율이 올라가면서 하체 지방도 자연스럽게 에너지로 전환"},
    {"principle":"류신 풍부 단백질 우선","detail":"달걀·유청·닭가슴살의 류신이 근합성 스위치(mTOR)를 직접 자극","ref":"Norton LE 2009"}
  ]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[
    {"sport":"상체 저항 운동 (덤벨·바벨)","reason":"가슴·등·어깨·팔 근육 증가 → 전신 기초대사율 상승","schedule":"주 4회, 45분","mbti_tip":"하체 운동 비율 최소화. 상체 70%:하체 30%"},
    {"sport":"수영 (상체 위주)","reason":"상체 근육 저항 + 유산소 동시. 하체 압박 없이 전신 대사 활성화","schedule":"주 2회, 40분","mbti_tip":"평영보다 자유형·배영 비율 높이기"},
    {"sport":"PT (퍼스널 트레이닝)","reason":"자세 교정 + 근육 활성화 순서 학습이 중요. 혼자 하면 효율 낮음","schedule":"주 2회 이상 강력 권장","mbti_tip":"근합성 목표 명확히 전달"}
  ]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[
    {"sport":"칼로리 소비 위주 유산소","reason":"근감소 악화 가능성. 지금 필요한 건 칼로리 소비가 아니라 근육 합성 신호","ref":"Morton RW. 2018"},
    {"sport":"하체 집중 고중량 운동 (초기)","reason":"상체 근육 기반 없이 하체만 자극하면 하체 비대만 발생"},
    {"sport":"단식·극단적 소식","reason":"근육 분해 가속. 이 체형에서 가장 피해야 할 선택","ref":"Prado CM. 2012"}
  ]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[
    {"name":"유청 단백질","dose":"25~30g, 운동 후 30분 이내","reason":"근합성 골든타임 활용. 류신 함량 가장 높음","ref":"Morton RW. Br J Sports Med 2018"},
    {"name":"크레아틴 모노하이드레이트","dose":"5g/일, 운동 전후","reason":"근력 + 근육량 증가 가장 근거 강한 보충제 중 하나","ref":"Lanhers C et al. Eur J Sport Sci 2017"},
    {"name":"비타민D","dose":"2000IU/일, 식사 중","reason":"근기능 + 근합성 보조. 마른비만에서 비타민D 결핍 흔함","ref":"Holick MF. NEJM 2007"}
  ]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[
    {"rule":"운동 후 30분 이내 단백질 먹기","detail":"근합성 골든타임. 이 타이밍을 놓치면 운동 효과가 절반으로 줄어듭니다","do":true},
    {"rule":"하루 단백질 체중×1.8g 목표","detail":"60kg이면 108g. 닭가슴살 200g+달걀2개+두부반모면 80g 정도. 나머지는 단백질 쉐이크","do":true},
    {"rule":"체중계보다 인바디 측정","detail":"근육량·체지방률 변화가 체중보다 먼저 개선됩니다. 4주마다 인바디 측정","do":true},
    {"rule":"칼로리 너무 많이 줄이기","detail":"근육 분해 가속. 지금은 유지 칼로리 + 단백질 추가가 맞습니다","do":false},
    {"rule":"유산소만 길게 하기","detail":"칼로리 소비는 되지만 근육이 빠집니다. 저항 운동이 이 체형의 핵심입니다","do":false}
  ]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[
    {"method":"단백질 운동 후 30분 이내 섭취","detail":"근합성 골든타임. 유청단백 20~25g or 달걀 3개","condition":"매 운동 후 필수"},
    {"method":"수면 7~8시간","detail":"성장호르몬 분비의 70%가 수면 중 발생. 근합성의 결정적 시간","condition":"수면 부족 시 근합성 효율 40% 감소"},
    {"method":"냉온 교대 샤워 (운동 후)","detail":"운동 후 근육 통증 완화 + 혈류 증가. 뜨거운 물 2분 → 차가운 물 30초 × 3회","condition":"주 3~4회"}
  ]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":40,"fat":25,"carb":30,"fiber_g":20,"water_L":2.0,"mineral_priority":"아연·비타민D·류신 우선"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 130),
  hiit_available_week       = COALESCE(hiit_available_week, 10)
WHERE bc_code = 'BC-7';

-- ─── BC-8 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["6개월 이상 다이어트 중인데 체중이 정체됨","식사량을 줄여도 체중이 안 빠짐","운동량을 늘려도 변화 없음","항상 피로하고 추위를 많이 탐","식욕이 이전보다 강해짐","체온이 낮고 손발이 차가움","탈모나 피부 건조감 심화"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[{"method":"칼로리 더 줄이기","reason":"이미 대사 셧다운 상태. 추가 제한은 기초대사를 더 낮춤. 플래토 심화","evidence":"Rosenbaum M. JCI 2010"},{"method":"운동 강도 높이기","reason":"에너지 부족 상태에서 고강도 운동은 코르티솔 증가 + 근육 분해 + 대사 추가 저하","evidence":"Martins C. Nutr Metab 2021"},{"method":"단식·간헐적 단식 강화","reason":"이미 굶어서 생긴 문제에 더 굶는 건 악화만 시킴","evidence":"임상 영양학 원칙"}]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[{"principle":"2주 대사 회복 (유지 칼로리 섭취)","explanation":"칼로리를 유지 수준으로 올리면 렙틴이 회복되고 T3가 증가. 대사율 상승 (Byrne 2017)"},{"principle":"갑상선 기능 지원","explanation":"요오드·셀레늄이 T3 합성 보조. 대사 회복 속도 향상"},{"principle":"완전 휴식 1~2주","explanation":"지친 몸에 회복 신호. 코르티솔 감소 + 성장호르몬 증가 → 대사 재점화"}]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"sport":"가벼운 걷기","reason":"운동 자체보다 일상 활동량(NEAT) 유지가 목표. 과도한 운동은 지금 맞지 않음","schedule":"매일 30분, 가볍게","tip":"운동이 힘들면 산책으로 대체"},{"sport":"요가·스트레칭","reason":"코르티솔 감소 + 부교감 신경 활성화. 대사 회복 기간의 최적 운동","schedule":"매일 20분","tip":"강도보다 이완에 집중"},{"sport":"완전 휴식 1~2주","reason":"지금 이 체형에서 완전 휴식이 가장 강력한 처방. 몸이 회복할 시간 필요","schedule":"1~2주 권장","tip":"휴식 후 재진단으로 처방 재조정"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"sport":"고강도 유산소·크로스핏","reason":"코르티솔 폭발 + 근육 분해 → 대사 추가 저하","evidence":"Martins C. 2021"},{"sport":"2시간 이상 장시간 운동","reason":"에너지 고갈 → 코르티솔 상승 → 대사 셧다운 심화","evidence":"임상 관찰"},{"sport":"연속적인 인터벌 트레이닝","reason":"회복 시간 없이 반복 자극은 부신 피로 악화 가능성","evidence":"임상 영양학 원칙"}]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"셀레늄","dose":"200mcg/일","timing":"식사 중","reason":"T4→T3 전환 효소 보조. 대사 회복 1순위 영양제","evidence":"Duntas LH. Thyroid 2010"},{"name":"아연","dose":"25mg/일","timing":"식후","reason":"갑상선호르몬 수용체 기능 보조. 대사 정체와 마른비만에 겸용","evidence":"Holick MF. 2007"},{"name":"마그네슘","dose":"400mg","timing":"취침 전","reason":"수면 중 대사 회복 보조 + 코르티솔 억제","evidence":"Guerrero-Romero F. 2004"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[{"rule":"지금 하는 다이어트 2주 중단","type":"do","description":"가장 어렵지만 가장 강력한 처방. 몸에게 안전 신호를 보내야 대사가 켜집니다"},{"rule":"수면 9시간 목표","type":"do","description":"성장호르몬이 기초대사를 재점화합니다. 일찍 자는 것이 가장 강력한 처방"},{"rule":"체중계 잠시 내려놓기","type":"do","description":"회복 기간 중 체중이 소폭 올라도 정상. 이것이 회복의 신호입니다"},{"rule":"운동 강도 높이기","type":"dont","description":"에너지 부족 상태에서 고강도 운동은 대사를 더 낮춥니다. 지금은 회복이 먼저"},{"rule":"단식 더 늘리기","type":"dont","description":"굶어서 생긴 문제에 더 굶는 건 악화만 시킵니다"}]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[{"method":"완전 휴식 1~2주 (처방)","description":"지금 가장 중요한 회복. 운동 자극 없이 렙틴·T3 회복에만 집중","condition":"취침 9시간 목표. 낮잠 허용"},{"method":"적외선 사우나 (심부 온열)","description":"기초체온 상승 → T3 활성화 보조. 혈류 증가로 갑상선 영양소 공급","condition":"주 3회, 20분"},{"method":"수면 치료 우선","description":"성장호르몬의 70%가 수면 중 분비. 대사 회복의 결정적 요소","condition":"7~9시간 수면 필수. 취침 시간 고정"}]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":30,"fat":35,"carb":30,"fiber_g":20,"water_L":2,"priority_minerals":"요오드·셀레늄·아연"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 115),
  hiit_available_week       = COALESCE(hiit_available_week, 8)
WHERE bc_code = 'BC-8';

-- ─── BC-9 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["밥을 별로 안 먹는데 배가 나옴","스트레스 받으면 단것이 당김","잠을 못 자는 날 더 붓는 느낌","만성 피로·낮 졸림","야식 충동이 강함","저녁에 더 먹게 되는 패턴","어깨·목 긴장 지속"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[{"method":"저녁 고강도 운동","reason":"코르티솔 회복 주기 방해 + 불면 유발 → 다음 날 코르티솔 더 높아짐","evidence":"Hackney AC. 2006"},{"method":"극단적 식이 제한","reason":"칼로리 부족 → 코르티솔 추가 상승. 스트레스 체형에 식이 제한은 역효과","evidence":"임상 영양학"},{"method":"카페인 과다 (3잔 이상)","reason":"부신 자극 → 코르티솔 추가 분비. 악순환 강화","evidence":"Arnason T. AJCN 2018"}]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[{"principle":"수면이 모든 처방보다 우선","explanation":"코르티솔 회복의 70%는 수면에서 이루어짐. 수면 7시간이 안 되면 다른 처방의 효과가 반감"},{"principle":"오전 운동 + 저녁 이완","explanation":"오전 운동이 코르티솔 리듬과 일치. 저녁은 요가·스트레칭으로 부교감 활성화"},{"principle":"마음챙김·아로마 처방","explanation":"마음챙김 4주가 코르티솔 수치를 유의미하게 낮춤 (Turakitwanakan 2013)"}]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"sport":"오전 30분 걷기","reason":"코르티솔 리듬이 오전에 가장 높음. 이 시간대 가벼운 운동이 리듬 정상화","schedule":"매일 오전, 햇볕 아래","tip":"스마트폰 없이 걷기 추천. 마음챙김 걷기"},{"sport":"요가 (부교감 활성화)","reason":"저녁 요가가 코르티솔 저하에 가장 효과적. 하타요가·음요가 권장","schedule":"매일 저녁 20분","tip":"빠른 동작보다 이완과 호흡에 집중"},{"sport":"수영 (오전)","reason":"물의 부력이 코르티솔 반응 완화. 리드미컬한 호흡 패턴이 부교감 신경 활성화","schedule":"주 3회, 오전","tip":"대화하며 할 수 있는 속도"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"sport":"저녁 고강도 유산소","reason":"코르티솔 회복 주기 방해 + 불면 유발 악순환","evidence":"Hackney AC. 2006"},{"sport":"크로스핏·타바타 (스트레스 상태에서)","reason":"교감신경 최대 자극 → 부신 추가 부담 → 코르티솔 폭발","evidence":"임상 관찰"},{"sport":"경쟁·비교 분위기 운동","reason":"심리적 스트레스가 코르티솔 추가 자극. 편안한 환경이 중요","evidence":"임상 심리학"}]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"마그네슘 글리시네이트","dose":"400mg","timing":"취침 전","reason":"코르티솔 분비 억제 + 부신 회복 + 수면 깊이 개선","evidence":"Guerrero-Romero F. 2004"},{"name":"아슈와간다","dose":"300~600mg/일","timing":"아침","reason":"적응원 허브. 코르티솔 수치 유의미하게 감소 (8주 RCT)","evidence":"Chandrasekhar K et al. IJAM 2012"},{"name":"비타민B5 (판토텐산)","dose":"500mg/일","timing":"식후","reason":"부신에서 코르티솔 합성 조절. 부신 피로 회복 보조","evidence":"임상 영양학"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[{"rule":"취침 2시간 전 스마트폰 차단","type":"do","description":"블루라이트가 멜라토닌 분비 억제. 코르티솔 야간 회복 방해. 이 루틴이 가장 강력"},{"rule":"오전 햇볕 10분","type":"do","description":"일광이 코르티솔 리듬을 리셋. 세로토닌 합성 촉진. 자연스럽게 저녁에 코르티솔이 낮아짐"},{"rule":"스트레스 신호 오면 5분 걷기","type":"do","description":"단것 대신 걷기 5분. 코르티솔이 실제로 낮아지기 시작합니다 (Salmon P. 2001)"},{"rule":"저녁 고강도 운동","type":"dont","description":"코르티솔 회복 주기를 방해합니다. 저녁은 몸이 쉬어야 하는 시간"},{"rule":"카페인으로 피로 버티기","type":"dont","description":"부신에 추가 부담. 코르티솔 악순환을 강화합니다. 생강차·루이보스로 대체"}]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[{"method":"아로마테라피 (라벤더)","description":"라벤더 흡입이 코르티솔 분비 억제 + 부교감 신경 활성화. 취침 전 디퓨저 30분","condition":"매일 취침 전"},{"method":"수면 치료 프로토콜","description":"취침 2시간 전 스마트폰 차단. 실내 온도 18도. 귀마개·수면 마스크 활용","condition":"수면 7~9시간 목표. 취침 시간 고정"},{"method":"마음챙김 명상 5분","description":"아침 기상 후 5분 호흡 명상. 코르티솔 분비 패턴을 하루 시작부터 안정화","condition":"매일 아침, 5분으로 시작"}]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":30,"fat":30,"carb":35,"fiber_g":25,"water_L":2,"priority_minerals":"마그네슘·B5·비타민C"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 115),
  hiit_available_week       = COALESCE(hiit_available_week, 12)
WHERE bc_code = 'BC-9';

-- ─── BC-10 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["다이어트 후 다시 원래 몸무게로 돌아온 경험 2회 이상","먹는 걸 줄여도 살이 잘 안 빠짐","항상 배고프고 포만감이 오래 안 감","살 빠지는 속도가 처음보다 느려짐","조금만 먹어도 찌는 느낌","야식·단것 충동이 강함","운동해도 예전만큼 효과 없음"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '[{"method":"또 다른 단기 다이어트","reason":"렙틴 저항성을 더 강화. 요요 사이클 추가. 지속 불가능한 방법의 반복","evidence":"Sumithran P. NEJM 2011"},{"method":"극단적 칼로리 제한","reason":"기초대사 추가 저하 + 근육 분해. 요요 후 더 쉽게 찌는 몸으로 변화","evidence":"Rosenbaum M. 2010"},{"method":"빠른 결과를 향한 초조함","reason":"단기 목표가 아닌 시스템 구축이 필요. 빠른 방법일수록 더 빠른 요요","evidence":"임상 영양학 원칙"}]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '[{"principle":"렙틴 감수성 회복 먼저","explanation":"오메가3·수면·간헐적 단식(부드럽게)이 렙틴 감수성 점진적 회복 (Farooqi 2002)"},{"principle":"장내 미생물 다양성 증가","explanation":"발효식품·프리바이오틱스로 장내 미생물 다양성 증가 → 대사 설정점 낮아짐 (Cotillard 2013)"},{"principle":"지속 가능한 속도","explanation":"주당 0.3~0.5kg. 이 속도가 요요 없이 유지되는 기전과 일치. 빠른 감량은 요요 가속"}]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"sport":"규칙적 걷기 (NEAT 기반)","reason":"비운동 활동 열발생(NEAT) 증가가 요요 방지에 가장 효과적. 엘리베이터 대신 계단 등","schedule":"매일 7000보 이상","tip":"특별한 운동 시간 없이 일상 활동량 올리기"},{"sport":"저항 운동 (근육 보호)","reason":"근육이 있어야 요요 후에도 기초대사 유지. 근육 1kg이 기초대사 13kcal/일 상승","schedule":"주 2~3회, 30분","tip":"강도보다 꾸준함 우선"},{"sport":"수영 또는 걷기","reason":"스트레스 없이 즐길 수 있는 운동 선택. 운동이 의무가 아닌 즐거움이 되어야 지속","schedule":"주 2~3회","tip":"즐길 수 있는 운동 한 가지만 고르기"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"sport":"빠른 결과 위한 고강도 운동 집중","reason":"기초대사 대비 에너지 소비 과다 → 반작용 식욕 증가 → 요요 가속","evidence":"Sumithran P. 2011"},{"sport":"자신을 처벌하는 방식의 운동","reason":"심리적 부담이 지속성 떨어뜨림. 운동을 다이어트 도구로만 보는 것이 문제","evidence":"임상 심리학"},{"sport":"단기 강도 높은 프로그램","reason":"12주 완성 같은 프로그램 종료 후 요요 패턴 반복. 지속 가능한 생활 방식으로 전환 필요","evidence":"임상 관찰"}]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"오메가3","dose":"2g/일","timing":"식후","reason":"렙틴 수용체 반응성 개선 + 염증 억제","evidence":"Simopoulos AP. 2002"},{"name":"프로바이오틱스 (다균주)","dose":"10억 CFU 이상","timing":"아침 공복","reason":"장내 미생물 다양성 증가 → 대사 설정점 조절","evidence":"Cotillard A. Nature 2013"},{"name":"마그네슘","dose":"400mg","timing":"취침 전","reason":"렙틴 분비 패턴 정상화. 수면 질 개선 → 렙틴 회복 가속","evidence":"Guerrero-Romero F. 2004"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '[{"rule":"주당 0.3~0.5kg 목표 설정","type":"do","description":"이 속도가 요요 없는 감량의 생리학적 적정 속도입니다. 빠를수록 돌아옵니다"},{"rule":"체중 대신 습관 추적","type":"do","description":"오늘 채소를 먹었는가, 7000보를 걸었는가. 숫자보다 행동이 지속성을 만듭니다"},{"rule":"즐길 수 있는 운동 하나","type":"do","description":"다이어트를 위한 운동이 아닌 즐거운 활동. 이것이 10년을 유지하는 유일한 방법"},{"rule":"또 다른 단기 다이어트 시작","type":"dont","description":"렙틴 저항성을 더 강화합니다. 이번에는 시스템을 바꾸는 것이 목표"},{"rule":"빠른 결과에 대한 초조함","type":"dont","description":"빠른 결과가 빠른 요요를 만듭니다. 3개월 단위로 생각하세요"}]'),
  recovery_priority_json    = COALESCE(NULLIF(recovery_priority_json,'[]'), NULLIF(recovery_priority_json,''), '[{"method":"수면 7~9시간 필수","description":"렙틴은 수면 중에 분비. 수면 부족이 렙틴 저항성 악화의 주요 원인","condition":"수면이 가장 강력한 항요요 처방"},{"method":"스트레스 관리","description":"코르티솔이 렙틴 신호를 방해. BC-09 회복 처방과 병행","condition":"마음챙김·아로마·요가"},{"method":"장 회복 (프로바이오틱스)","description":"장내 미생물 다양성이 체중 설정점 조절에 영향. 장 건강이 요요 방지의 기반","condition":"발효식품 매일 + 프로바이오틱스"}]'),
  macro_ratio_json          = COALESCE(NULLIF(macro_ratio_json,'{}'), NULLIF(macro_ratio_json,''), '{"protein":32,"fat":28,"carb":35,"fiber_g":30,"water_L":2,"priority_minerals":"마그네슘·아연·오메가3"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 130),
  hiit_available_week       = COALESCE(hiit_available_week, 12)
WHERE bc_code = 'BC-10';

-- ─── BC-11 ~ BC-16 (from 0026) ───
-- ─── BC-11 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["허리·골반 통증","한쪽 어깨가 낮음","사진에서 몸이 비대칭","쉽게 피로해짐","오래 앉으면 허리 통증"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '["무작정 코어 운동 강행","복근 강화 크런치 과잉","통증 참고 운동 지속"]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '["골반 정렬 먼저","고관절 가동성 회복","호흡 패턴 교정"]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"exercise":"맥킨지 신전","sets":3,"reps":"10회","note":"척추 후만 교정"},{"exercise":"데드버그","sets":3,"reps":"12회","note":"코어 안정화"},{"exercise":"힙 힌지","sets":3,"reps":"15회","note":"골반 정렬"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"exercise":"복근 크런치","reason":"척추 굴곡 과부하"},{"exercise":"레그프레스 과중량","reason":"골반 틀어짐 악화"}]'),
  recommended_foods_json    = COALESCE(NULLIF(recommended_foods_json,'[]'), NULLIF(recommended_foods_json,''), '["뼈 건강: 칼슘 1200mg+비타민D3","항염: 오메가3 EPA 1000mg","근육 이완: 마그네슘 400mg"]'),
  forbidden_foods_json      = COALESCE(NULLIF(forbidden_foods_json,'[]'), NULLIF(forbidden_foods_json,''), '["탄산음료·인산 과다 식품","고염식 (부종·관절압 악화)","카페인 과다 (골밀도 저하)"]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"칼슘+비타민D3","dose":"1200mg+2000IU","timing":"식후"},{"name":"마그네슘 글리시네이트","dose":"400mg","timing":"취침전"},{"name":"오메가3","dose":"2g","timing":"식사중"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '["의자 높이 골반=무릎 수평","모니터 눈높이 맞춤","1시간 착석 후 5분 스트레칭","한쪽 다리 꼬기 금지"]'),
  monthly_goals_json        = COALESCE(NULLIF(monthly_goals_json,'{}'), NULLIF(monthly_goals_json,''), '{"month1":"골반 수평 정렬 회복","month2":"코어 비대칭 감소 50%","month3":"통증 없는 일상 자세 유지"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 125),
  hiit_available_week       = COALESCE(hiit_available_week, '12주 이후 정렬 안정 후')
WHERE bc_code = 'BC-11';

-- ─── BC-12 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["아침 기상이 매우 힘들다","카페인 없이 버티기 어렵다","자고 나도 피로가 풀리지 않는다","집중력·기억력 저하","달콤한 것이 극도로 당긴다"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '["공복 강도 운동","칼로리 급격한 제한","카페인으로 버티기"]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '["부신 회복 우선","수면 질 최우선","에너지 생산 영양소 충분 공급"]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"exercise":"저강도 걷기","sets":1,"reps":"30분","note":"부신 과부하 없이 미토콘드리아 활성"},{"exercise":"요가·스트레칭","sets":1,"reps":"20분","note":"부교감 신경 활성화"},{"exercise":"수영 느린 페이스","sets":1,"reps":"20분","note":"전신 순환 자극"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"exercise":"HIIT","reason":"부신 추가 탈진 위험"},{"exercise":"공복 고강도 운동","reason":"코르티솔 폭발"},{"exercise":"무거운 웨이트","reason":"회복 자원 고갈"}]'),
  recommended_foods_json    = COALESCE(NULLIF(recommended_foods_json,'[]'), NULLIF(recommended_foods_json,''), '["코엔자임Q10 300mg","NMN 250mg","비타민B복합체","마그네슘 말레이트 400mg","철분 (헴철)"]'),
  forbidden_foods_json      = COALESCE(NULLIF(forbidden_foods_json,'[]'), NULLIF(forbidden_foods_json,''), '["카페인 오후 2시 이후","알코올","설탕·과당","초가공식품"]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"코엔자임Q10","dose":"200mg","timing":"식사중"},{"name":"비타민B12","dose":"1000mcg","timing":"아침"},{"name":"철분(헴철)","dose":"18mg","timing":"공복 또는 비타민C와"},{"name":"마그네슘말레이트","dose":"400mg","timing":"취침전"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '["기상 직후 햇빛 10분 노출","오후 2시 이후 카페인 금지","수면 7~9시간 절대 우선","과부하 활동 자제"]'),
  monthly_goals_json        = COALESCE(NULLIF(monthly_goals_json,'{}'), NULLIF(monthly_goals_json,''), '{"month1":"수면 질 개선·기상 피로감 감소","month2":"카페인 의존도 50% 감소","month3":"운동 내성 회복·활력 증가"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 115),
  hiit_available_week       = COALESCE(hiit_available_week, '12주 이후 에너지 회복 확인 후')
WHERE bc_code = 'BC-12';

-- ─── BC-13 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["자주 감기 걸림","전신이 자주 부음","관절이 자주 뻐근","상처 회복이 느림","알레르기 증상 잦음"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '["무리한 운동으로 면역 저하","다이어트 급식제한","고강도 운동 과잉"]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '["림프 순환 촉진","항염 식단 우선","수면+회복 충분"]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"exercise":"림프 드레나쥐 마사지","sets":1,"reps":"20분","note":"림프 순환 직접 자극"},{"exercise":"수중 걷기","sets":1,"reps":"30분","note":"하체 림프 순환"},{"exercise":"저강도 트레킹","sets":1,"reps":"40분","note":"전신 면역 강화"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"exercise":"HIIT 고강도","reason":"면역 과부하 위험"},{"exercise":"크로스핏","reason":"염증 마커 상승"}]'),
  recommended_foods_json    = COALESCE(NULLIF(recommended_foods_json,'[]'), NULLIF(recommended_foods_json,''), '["비타민C 1000mg","아연 15mg","비타민D3 3000IU","프로바이오틱스 1억 CFU","오메가3 EPA/DHA 2g"]'),
  forbidden_foods_json      = COALESCE(NULLIF(forbidden_foods_json,'[]'), NULLIF(forbidden_foods_json,''), '["설탕·과당 (면역 억제)","트랜스지방","알코올","고염식"]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"비타민C","dose":"1000mg","timing":"식후"},{"name":"아연","dose":"15mg","timing":"식사중"},{"name":"비타민D3","dose":"3000IU","timing":"식사중"},{"name":"프로바이오틱스","dose":"1억 CFU","timing":"아침 공복"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '["손 씻기·위생 철저","수면 7시간 이상","스트레스 관리","냉온 대비 면역 훈련"]'),
  monthly_goals_json        = COALESCE(NULLIF(monthly_goals_json,'{}'), NULLIF(monthly_goals_json,''), '{"month1":"부종 감소·면역 안정","month2":"알레르기 증상 완화","month3":"감염 빈도 감소"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 120),
  hiit_available_week       = COALESCE(hiit_available_week, '10주 이후 면역 안정 확인 후')
WHERE bc_code = 'BC-13';

-- ─── BC-14 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["잠들기 어렵다","밤에 배가 고프다","기상 후 붓기가 심하다","낮에 졸리고 밤에 각성","야식 없이 못 잠"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '["수면제 의존","야식 억제 의지력으로만 해결","낮잠 과다"]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '["취침 루틴 구축","블루라이트 차단","저녁 식사 타이밍 앞당기기"]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"exercise":"저녁 7시 이전 가벼운 걷기","sets":1,"reps":"30분","note":"체온 상승 후 하강으로 수면 유도"},{"exercise":"요가 닌드라","sets":1,"reps":"20분","note":"수면 전 부교감 활성화"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"exercise":"저녁 고강도 운동","reason":"코르티솔 상승으로 수면 방해"},{"exercise":"취침 직전 운동","reason":"각성 상태 유발"}]'),
  recommended_foods_json    = COALESCE(NULLIF(recommended_foods_json,'[]'), NULLIF(recommended_foods_json,''), '["마그네슘 글리시네이트 400mg","L-테아닌 200mg","멜라토닌 0.5mg (단기)","트립토판 500mg","GABA 500mg"]'),
  forbidden_foods_json      = COALESCE(NULLIF(forbidden_foods_json,'[]'), NULLIF(forbidden_foods_json,''), '["카페인 (오후 1시 이후)","알코올","야식 탄수화물","블루라이트 (취침 1시간 전)"]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"마그네슘 글리시네이트","dose":"400mg","timing":"취침 1시간 전"},{"name":"L-테아닌","dose":"200mg","timing":"취침 30분 전"},{"name":"트립토판","dose":"500mg","timing":"저녁 식사 후"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '["취침 시간 고정 (23시 이전)","기상 시간 고정 (7시 이전)","침실 온도 18~19도","취침 전 1시간 블루라이트 차단","저녁 8시 이후 음식 금지"]'),
  monthly_goals_json        = COALESCE(NULLIF(monthly_goals_json,'{}'), NULLIF(monthly_goals_json,''), '{"month1":"수면 시작 시간 30분 앞당기기","month2":"야식 빈도 주 1회 이하","month3":"기상 후 부기 감소"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 125),
  hiit_available_week       = COALESCE(hiit_available_week, '8주 이후 수면 패턴 안정 후')
WHERE bc_code = 'BC-14';

-- ─── BC-15 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["오전 피로감·무기력","황달·눈 노란빛","복부 팽만·소화불량","피부 가려움·발진","음주 후 회복 느림"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '["다이어트 보조제 남용","알코올 지속","고지방 가공식품"]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '["간 해독 영양소 공급","알코올 완전 차단","항산화 식단 우선"]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"exercise":"저강도 걷기","sets":1,"reps":"40분","note":"간 혈류 증가·지방산 산화"},{"exercise":"수영","sets":1,"reps":"30분","note":"전신 유산소·간 부담 최소"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"exercise":"고강도 무산소","reason":"젖산 과잉→간 부담 증가"},{"exercise":"공복 장거리 유산소","reason":"지방산 과잉 방출→간 과부하"}]'),
  recommended_foods_json    = COALESCE(NULLIF(recommended_foods_json,'[]'), NULLIF(recommended_foods_json,''), '["밀크씨슬 (실리마린 140mg)","NAC (N-아세틸시스테인) 600mg","비타민E 400IU","알파리포산 300mg","콜린 500mg"]'),
  forbidden_foods_json      = COALESCE(NULLIF(forbidden_foods_json,'[]'), NULLIF(forbidden_foods_json,''), '["알코올 (완전 차단)","과당·액상과당","트랜스지방·튀김","아세트아미노펜 장기복용"]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"밀크씨슬","dose":"실리마린 140mg","timing":"식전"},{"name":"NAC","dose":"600mg","timing":"식전"},{"name":"알파리포산","dose":"300mg","timing":"식사중"},{"name":"비타민E","dose":"400IU","timing":"식사중"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '["알코올 완전 차단","하루 물 2.5L 이상","유기농 채소 위주","가공식품 최소화"]'),
  monthly_goals_json        = COALESCE(NULLIF(monthly_goals_json,'{}'), NULLIF(monthly_goals_json,''), '{"month1":"간 효소 수치 (ALT·AST) 감소","month2":"복부 팽만 완화","month3":"지방 대사 회복·체중 감소 시작"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 120),
  hiit_available_week       = COALESCE(hiit_available_week, '10주 이후 간 기능 개선 확인 후')
WHERE bc_code = 'BC-15';

-- ─── BC-16 ───
UPDATE bc_prescriptions SET
  symptom_checklist_json    = COALESCE(NULLIF(symptom_checklist_json,'[]'), NULLIF(symptom_checklist_json,''), '["항상 춥다·추위를 탄다","조금 먹어도 살이 찐다","변비가 잦다","머리카락·눈썹이 빠진다","피부가 건조하고 푸석하다"]'),
  wrong_methods_json        = COALESCE(NULLIF(wrong_methods_json,'[]'), NULLIF(wrong_methods_json,''), '["칼로리 급감으로 대사 더 낮추기","공복 장시간 유지","유산소만 과잉"]'),
  correct_principles_json   = COALESCE(NULLIF(correct_principles_json,'[]'), NULLIF(correct_principles_json,''), '["근육 유지로 기초대사 유지","단백질 충분 섭취","갑상선 영양소 공급"]'),
  recommended_exercises_json= COALESCE(NULLIF(recommended_exercises_json,'[]'), NULLIF(recommended_exercises_json,''), '[{"exercise":"근력 운동 (대근육 중심)","sets":4,"reps":"8~10회","note":"기초대사율 유지의 핵심"},{"exercise":"존2 유산소","sets":1,"reps":"40분","note":"지방 산화 효율 최대화"},{"exercise":"HIIT (8주 이후)","sets":1,"reps":"20분","note":"기초대사율 추가 상승"}]'),
  forbidden_exercises_json  = COALESCE(NULLIF(forbidden_exercises_json,'[]'), NULLIF(forbidden_exercises_json,''), '[{"exercise":"과도한 유산소만","reason":"근육 손실로 기초대사 추가 저하"},{"exercise":"극저칼로리 병행","reason":"대사 추가 감소"}]'),
  recommended_foods_json    = COALESCE(NULLIF(recommended_foods_json,'[]'), NULLIF(recommended_foods_json,''), '["셀레늄 200mcg (갑상선 효소 보조)","아연 15mg","요오드 150mcg","비타민D3 3000IU","타이로신 500mg"]'),
  forbidden_foods_json      = COALESCE(NULLIF(forbidden_foods_json,'[]'), NULLIF(forbidden_foods_json,''), '["글루텐 (하시모토 갑상선염 악화)","대두 과잉 (갑상선 호르몬 흡수 방해)","생 십자화과 과잉","칼로리 극단 제한"]'),
  supplement_list_json      = COALESCE(NULLIF(supplement_list_json,'[]'), NULLIF(supplement_list_json,''), '[{"name":"셀레늄","dose":"200mcg","timing":"식사중"},{"name":"아연","dose":"15mg","timing":"식사중"},{"name":"비타민D3","dose":"3000IU","timing":"식사중"},{"name":"타이로신","dose":"500mg","timing":"아침 공복"}]'),
  lifestyle_rules_json      = COALESCE(NULLIF(lifestyle_rules_json,'[]'), NULLIF(lifestyle_rules_json,''), '["아침 기상 후 스트레칭 10분","햇빛 노출 30분 이상","냉온 샤워로 대사 자극","식사 규칙적 3회"]'),
  monthly_goals_json        = COALESCE(NULLIF(monthly_goals_json,'{}'), NULLIF(monthly_goals_json,''), '{"month1":"기초체온 상승 (36.5도 목표)","month2":"변비 개선·장 운동성 회복","month3":"기초대사율 5~10% 상승"}'),
  zone2_bpm                 = COALESCE(zone2_bpm, 130),
  hiit_available_week       = COALESCE(hiit_available_week, '8주 이후 갑상선 안정 확인 후')
WHERE bc_code = 'BC-16';

-- ─── 완료 ───
