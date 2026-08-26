-- ══════════════════════════════════════════════════════════════════
--  0072: bc_prescriptions 공통 처방 필드 보강 (BC-1~BC-16)
--  이유: 0061에서 INSERT OR REPLACE 시 symptom_checklist_json,
--         recommended_exercises_json, monthly_goals_json 등 핵심 필드가
--         누락되어 mapping-recheck + 결과지에서 "비어있음"으로 표시됨.
--  해결: UPDATE SET으로 빈 필드만 채움 (existing data 보호)
-- ══════════════════════════════════════════════════════════════════

-- ────── BC-1: 단단내장형 ──────────────────────────────────────
UPDATE bc_prescriptions SET
  symptom_checklist_json = COALESCE(NULLIF(symptom_checklist_json,''), '[{"tag":"식사 후 30분 이내 졸음·피로감"},{"tag":"공복 시 복부 팽만감"},{"tag":"앉으면 배가 앞으로 돌출됨"},{"tag":"운동해도 복부만 안 빠짐"},{"tag":"혈당 검사에서 경계수치 나온 적 있음"}]'),
  wrong_methods_json = COALESCE(NULLIF(wrong_methods_json,''), '[{"method":"무조건 굶기","reason":"인슐린 급락 후 반동 폭식으로 내장지방 증가"},{"method":"탄수화물 제로 식단","reason":"근손실 + 코르티솔 상승으로 내장지방 오히려 촉진"},{"method":"복근 운동만 집중","reason":"내장지방은 국소 운동으로 안 빠짐. 전신 유산소 필수"}]'),
  correct_principles_json = COALESCE(NULLIF(correct_principles_json,''), '[{"principle":"식사 순서 채소→단백→탄수 준수","detail":"인슐린 스파이크 방지로 내장지방 축적 차단"},{"principle":"저GI 식품 우선 선택","detail":"혈당 지수 55 이하 식품으로 인슐린 안정"},{"principle":"공복 유산소 40분 이상","detail":"글리코겐 고갈 후 지방 연소 극대화"}]'),
  recommended_exercises_json = COALESCE(NULLIF(recommended_exercises_json,''), '[{"name":"존2 유산소 (걷기/자전거)","duration":"40분","frequency":"주4회","reason":"인슐린 감수성 개선 + 내장지방 우선 연소"},{"name":"하체 복합 웨이트","duration":"45분","frequency":"주3회","reason":"기초대사율 향상"},{"name":"코어 안정화","duration":"20분","frequency":"주3회","reason":"복부 압력 조절"}]'),
  forbidden_exercises_json = COALESCE(NULLIF(forbidden_exercises_json,''), '[{"name":"초기 고강도 HIIT","reason":"인슐린 저항성 심화 가능 — 3주 후 도입"},{"name":"복근 크런치 과잉","reason":"내장지방에 직접 효과 없음 + 허리 부담"}]'),
  recommended_foods_json = COALESCE(NULLIF(recommended_foods_json,''), '[{"food":"현미·귀리","reason":"저GI 탄수화물, 혈당 안정"},{"food":"브로콜리·시금치","reason":"인슐린 감수성 개선 식이섬유"},{"food":"닭가슴살·계란","reason":"단백질 공급, 포만감 유지"},{"food":"아보카도","reason":"건강 지방, 인슐린 저항성 감소"}]'),
  forbidden_foods_json = COALESCE(NULLIF(forbidden_foods_json,''), '[{"food":"흰쌀밥·흰빵·과자","reason":"혈당 급상승 → 인슐린 과분비"},{"food":"설탕 음료·과일주스","reason":"내장지방 직접 촉진"},{"food":"알코올","reason":"간 인슐린 대사 저해 + 내장지방 축적"}]'),
  supplement_list_json = COALESCE(NULLIF(supplement_list_json,''), '[{"name":"베르베린","dose":"500mg 1일 2회 식전","reason":"인슐린 감수성 개선, 혈당 안정"},{"name":"마그네슘","dose":"400mg 취침 전","reason":"인슐린 수용체 활성화"},{"name":"오메가3","dose":"2000mg/일","reason":"염증 감소 + 지방대사 개선"}]'),
  lifestyle_rules_json = COALESCE(NULLIF(lifestyle_rules_json,''), '[{"rule":"식후 15분 걷기","detail":"혈당 스파이크 억제 효과","do":true},{"rule":"수면 7시간 이상","detail":"수면 부족 시 인슐린 저항성 악화","do":true},{"rule":"야식 금지","detail":"야간 인슐린 분비 패턴 교란","do":false}]'),
  monthly_goals_json = COALESCE(NULLIF(monthly_goals_json,''), '[{"month":1,"goal":"Zone2 유산소 정착 + 식사 순서 습관화","target":"복부 둘레 -2cm"},{"month":2,"goal":"웨이트 추가 + 저GI 식단 완성","target":"체지방률 -1.5%"},{"month":3,"goal":"HIIT 도입 + 12주 측정","target":"내장지방 수치 개선 확인"}]'
WHERE bc_code = 'BC-1';

-- ────── BC-2: 피하지방형 ──────────────────────────────────────
UPDATE bc_prescriptions SET
  symptom_checklist_json = COALESCE(NULLIF(symptom_checklist_json,''), '[{"tag":"배를 잡으면 살이 많이 잡힘 (피하지방 두꺼움)"},{"tag":"전신이 포동포동하게 살이 찐 느낌"},{"tag":"유산소 운동을 해도 체중이 잘 안 줄음"},{"tag":"체형이 고르게 통통한 편"},{"tag":"식욕 조절이 특히 어려움"}]'),
  wrong_methods_json = COALESCE(NULLIF(wrong_methods_json,''), '[{"method":"칼로리 제한만 하는 다이어트","reason":"근손실 동반 요요 위험"},{"method":"유산소만 장시간","reason":"적응 후 효과 감소, 근육 소실"},{"method":"극단적 단식","reason":"기초대사율 저하로 피하지방 더 잘 생김"}]'),
  correct_principles_json = COALESCE(NULLIF(correct_principles_json,''), '[{"principle":"근력 + 유산소 복합","detail":"근육량 증가로 기초대사율 올리기"},{"principle":"단백질 우선 섭취","detail":"체중 kg당 1.5g 이상"},{"principle":"일일 NEAT 최대화","detail":"엘리베이터 대신 계단, 걸어다니기"}]'),
  recommended_exercises_json = COALESCE(NULLIF(recommended_exercises_json,''), '[{"name":"전신 서킷 트레이닝","duration":"45분","frequency":"주4회","reason":"칼로리 소모 극대화"},{"name":"Zone2 유산소","duration":"40분","frequency":"주3회","reason":"지방 산화 촉진"},{"name":"HIIT","duration":"20분","frequency":"주2회","reason":"운동 후 칼로리 소모 증가"}]'),
  forbidden_exercises_json = COALESCE(NULLIF(forbidden_exercises_json,''), '[{"name":"장시간 저강도 유산소만","reason":"칼로리 소모 낮고 근육 손실 위험"},{"name":"운동 없이 식단만","reason":"피하지방은 운동 자극 필수"}]'),
  recommended_foods_json = COALESCE(NULLIF(recommended_foods_json,''), '[{"food":"닭가슴살·두부·계란","reason":"고단백 저지방 식품"},{"food":"통곡물","reason":"포만감 + 혈당 안정"},{"food":"채소류","reason":"저칼로리 식이섬유"}]'),
  forbidden_foods_json = COALESCE(NULLIF(forbidden_foods_json,''), '[{"food":"튀김·패스트푸드","reason":"고칼로리 피하지방 직접 축적"},{"food":"과자·케이크","reason":"정제 탄수화물 + 설탕"},{"food":"알코올","reason":"칼로리 높고 지방 연소 방해"}]'),
  supplement_list_json = COALESCE(NULLIF(supplement_list_json,''), '[{"name":"단백질 보충제","dose":"운동 후 30분 이내 20-30g","reason":"근육 합성 촉진"},{"name":"L-카르니틴","dose":"2000mg/일","reason":"지방산 미토콘드리아 이동 촉진"},{"name":"CLA","dose":"3000mg/일","reason":"체지방 감소 보조"}]'),
  lifestyle_rules_json = COALESCE(NULLIF(lifestyle_rules_json,''), '[{"rule":"하루 8000보 이상 걷기","detail":"NEAT로 추가 칼로리 소모","do":true},{"rule":"주 5회 이상 운동","detail":"지방 연소 속도 유지","do":true},{"rule":"야식·음주 금지","detail":"피하지방 직접 축적 원인","do":false}]'),
  monthly_goals_json = COALESCE(NULLIF(monthly_goals_json,''), '[{"month":1,"goal":"운동 습관 형성 + 단백질 섭취 증가","target":"체중 -2kg"},{"month":2,"goal":"근력 향상 + HIIT 도입","target":"체지방률 -2%"},{"month":3,"goal":"유지 루틴 완성","target":"목표 체중 달성"}]')
WHERE bc_code = 'BC-2';

-- ────── BC-3: 복부+상체 복합형 ──────────────────────────────
UPDATE bc_prescriptions SET
  symptom_checklist_json = COALESCE(NULLIF(symptom_checklist_json,''), '[{"tag":"복부와 상체(등·겨드랑이)에 동시에 살이 찜"},{"tag":"앉으면 옆구리 살이 많이 접힘"},{"tag":"가슴 아래 등쪽이 두껍게 느껴짐"},{"tag":"상체가 하체보다 살이 많은 편"},{"tag":"스트레스받으면 복부 먼저 나옴"}]'),
  wrong_methods_json = COALESCE(NULLIF(wrong_methods_json,''), '[{"method":"하체만 집중 운동","reason":"상체·복부 지방은 그대로"},{"method":"복근 운동만","reason":"표면 지방은 국소 운동으로 제거 불가"}]'),
  correct_principles_json = COALESCE(NULLIF(correct_principles_json,''), '[{"principle":"상체+코어 복합 운동","detail":"상체 근육 발달로 기초대사 향상"},{"principle":"코르티솔 관리","detail":"수면 7시간, 스트레스 완화"}]'),
  recommended_exercises_json = COALESCE(NULLIF(recommended_exercises_json,''), '[{"name":"상체 저항 운동","duration":"50분","frequency":"주3회","reason":"상체 근육 발달"},{"name":"코어 서킷","duration":"30분","frequency":"주4회","reason":"복부 집중"},{"name":"Zone2 유산소","duration":"40분","frequency":"주3회","reason":"지방 산화"}]'),
  forbidden_exercises_json = COALESCE(NULLIF(forbidden_exercises_json,''), '[{"name":"하체만 집중 PT","reason":"상체 지방 해결 안 됨"},{"name":"스트레스 유발 고강도만","reason":"코르티솔 상승으로 복부 지방 증가"}]'),
  recommended_foods_json = COALESCE(NULLIF(recommended_foods_json,''), '[{"food":"연어·고등어","reason":"오메가3로 코르티솔 완화"},{"food":"견과류","reason":"건강지방 + 포만감"},{"food":"녹색 채소","reason":"마그네슘 공급으로 스트레스 완화"}]'),
  forbidden_foods_json = COALESCE(NULLIF(forbidden_foods_json,''), '[{"food":"카페인 과잉","reason":"코르티솔 상승으로 복부 지방 축적"},{"food":"고나트륨 음식","reason":"상체 부종 악화"},{"food":"알코올","reason":"코르티솔 상승 + 간 지방화"}]'),
  supplement_list_json = COALESCE(NULLIF(supplement_list_json,''), '[{"name":"마그네슘","dose":"400mg 취침 전","reason":"코르티솔 완화 + 수면 개선"},{"name":"비타민C","dose":"1000mg/일","reason":"코르티솔 억제"},{"name":"아시와간다","dose":"600mg/일","reason":"스트레스 호르몬 조절"}]'),
  lifestyle_rules_json = COALESCE(NULLIF(lifestyle_rules_json,''), '[{"rule":"수면 7시간 이상","detail":"코르티솔 조절 필수","do":true},{"rule":"명상·심호흡 10분","detail":"스트레스 완화","do":true},{"rule":"카페인 오후 2시 이후 금지","detail":"수면 방해 + 코르티솔 상승","do":false}]'),
  monthly_goals_json = COALESCE(NULLIF(monthly_goals_json,''), '[{"month":1,"goal":"스트레스 관리 + 상체 운동 정착","target":"복부 둘레 -2cm"},{"month":2,"goal":"코어 강화 + 수면 개선","target":"상체 둘레 -3cm"},{"month":3,"goal":"체형 균형 달성","target":"체지방 -3%"}]')
WHERE bc_code = 'BC-3';

-- ────── BC-4~BC-16: 일괄 기본값 보강 ──────────────────────────
-- 개별 맞춤 대신 BC-4~16 공통 필드가 비어있는 행에 대한 범용 보강
UPDATE bc_prescriptions SET
  symptom_checklist_json = COALESCE(NULLIF(symptom_checklist_json,''), 
    '[{"tag":"체형별 지방 축적 패턴 확인됨"},{"tag":"반복적인 다이어트 실패 경험"},{"tag":"특정 부위 집중 지방 축적"},{"tag":"운동 후 회복이 느린 편"},{"tag":"식욕 조절 어려움"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (symptom_checklist_json IS NULL OR symptom_checklist_json = '' OR symptom_checklist_json = '[]');

UPDATE bc_prescriptions SET
  wrong_methods_json = COALESCE(NULLIF(wrong_methods_json,''),
    '[{"method":"단기 극단 다이어트","reason":"근손실 + 요요 반복"},{"method":"체형 무시한 획일적 운동","reason":"효과 없거나 역효과"},{"method":"영양 불균형 식단","reason":"호르몬 교란으로 체중 오히려 증가"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (wrong_methods_json IS NULL OR wrong_methods_json = '' OR wrong_methods_json = '[]');

UPDATE bc_prescriptions SET
  correct_principles_json = COALESCE(NULLIF(correct_principles_json,''),
    '[{"principle":"체형별 맞춤 운동 프로토콜","detail":"BC 코드에 최적화된 운동 방식 적용"},{"principle":"호르몬 균형 식단","detail":"체형 원인 해결을 위한 맞춤 영양"},{"principle":"꾸준한 측정과 기록","detail":"12주 단위 체성분 변화 추적"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (correct_principles_json IS NULL OR correct_principles_json = '' OR correct_principles_json = '[]');

UPDATE bc_prescriptions SET
  recommended_exercises_json = COALESCE(NULLIF(recommended_exercises_json,''),
    '[{"name":"맞춤형 유산소","duration":"40분","frequency":"주3회","reason":"체형 특화 지방 연소"},{"name":"저항 운동","duration":"45분","frequency":"주3회","reason":"근육량 유지 및 증가"},{"name":"코어 안정화","duration":"20분","frequency":"주3회","reason":"체형 교정 및 자세 개선"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (recommended_exercises_json IS NULL OR recommended_exercises_json = '' OR recommended_exercises_json = '[]');

UPDATE bc_prescriptions SET
  forbidden_exercises_json = COALESCE(NULLIF(forbidden_exercises_json,''),
    '[{"name":"체형 역효과 운동","reason":"BC 코드별 금기 운동 적용"},{"name":"과도한 고강도 운동","reason":"회복 부족 시 역효과"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (forbidden_exercises_json IS NULL OR forbidden_exercises_json = '' OR forbidden_exercises_json = '[]');

UPDATE bc_prescriptions SET
  recommended_foods_json = COALESCE(NULLIF(recommended_foods_json,''),
    '[{"food":"고단백 저지방 식품","reason":"근육 유지 + 포만감"},{"food":"항염 식품 (연어, 블루베리)","reason":"체내 염증 감소"},{"food":"고식이섬유 채소","reason":"장 건강 + 혈당 안정"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (recommended_foods_json IS NULL OR recommended_foods_json = '' OR recommended_foods_json = '[]');

UPDATE bc_prescriptions SET
  forbidden_foods_json = COALESCE(NULLIF(forbidden_foods_json,''),
    '[{"food":"가공식품·패스트푸드","reason":"체형 악화 원인"},{"food":"정제 설탕·음료","reason":"혈당 급등 + 지방 축적"},{"food":"알코올","reason":"간 대사 방해 + 지방 합성 촉진"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (forbidden_foods_json IS NULL OR forbidden_foods_json = '' OR forbidden_foods_json = '[]');

UPDATE bc_prescriptions SET
  supplement_list_json = COALESCE(NULLIF(supplement_list_json,''),
    '[{"name":"오메가3","dose":"2000mg/일","reason":"항염 + 체지방 감소"},{"name":"마그네슘","dose":"400mg 취침 전","reason":"근육 회복 + 수면 개선"},{"name":"비타민D","dose":"2000IU/일","reason":"호르몬 균형 + 근력 개선"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (supplement_list_json IS NULL OR supplement_list_json = '' OR supplement_list_json = '[]');

UPDATE bc_prescriptions SET
  lifestyle_rules_json = COALESCE(NULLIF(lifestyle_rules_json,''),
    '[{"rule":"수면 7시간 이상","detail":"호르몬 균형 + 회복 필수","do":true},{"rule":"하루 8000보 이상","detail":"기초 활동량 유지","do":true},{"rule":"음주 주 1회 이하","detail":"지방 대사 정상화","do":false}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (lifestyle_rules_json IS NULL OR lifestyle_rules_json = '' OR lifestyle_rules_json = '[]');

UPDATE bc_prescriptions SET
  monthly_goals_json = COALESCE(NULLIF(monthly_goals_json,''),
    '[{"month":1,"goal":"운동·식단 루틴 정착","target":"체중 변화 확인"},{"month":2,"goal":"강도 향상 + 식단 정밀화","target":"체지방 -2%"},{"month":3,"goal":"12주 목표 완성","target":"체형 변화 확인"}]')
WHERE bc_code IN ('BC-4','BC-5','BC-6','BC-7','BC-8','BC-9','BC-10','BC-11','BC-12','BC-13','BC-14','BC-15','BC-16')
  AND (monthly_goals_json IS NULL OR monthly_goals_json = '' OR monthly_goals_json = '[]');
