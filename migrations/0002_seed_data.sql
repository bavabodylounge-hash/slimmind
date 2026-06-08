-- ══════════════════════════════════════════════
--  시드 데이터: 마스터 관리자 + 컨설턴트 샘플 + BC 코드 기본 데이터
-- ══════════════════════════════════════════════

-- 마스터 관리자 계정 (password: admin1234 → 실제 배포 시 변경 필수)
INSERT OR IGNORE INTO consultants (id, code, name, email, password_hash, grade, subscription_status, job_type)
VALUES ('master-0000-0000-0000-000000000001', 'MASTER', '최고마스터', 'admin@slimmind.co.kr', 'MASTER_ACCOUNT', '마스터', 'active', '관리자');

-- 샘플 컨설턴트 2명
INSERT OR IGNORE INTO consultants (code, name, email, password_hash, job_type, grade, subscription_status, subscription_end, lecture_progress, is_certified, phone)
VALUES 
  ('SC-0001', '김지수', 'jisu@slimmind.co.kr', 'hashed_pw_1', '트레이너', '시니어', 'active', '2026-12-31', 12, 1, '010-1234-5678'),
  ('SC-0002', '박민준', 'minjun@slimmind.co.kr', 'hashed_pw_2', '필라테스강사', '일반', 'active', '2026-09-30', 6, 0, '010-9876-5432');

-- 샘플 결과지 2건
INSERT OR IGNORE INTO results (id, user_name, consultant_code, bc_primary, bc_secondary, bc_primary_score, bc_secondary_score, ohaeng_type, mbti, blood_type, saju_il_gan, gender, height, weight, target_weight, bmi, bfr, top_size, bottom_size, emotional_state, main_goal, priority_value, bc_scores_json, ohaeng_scores_json, survey_summary_json)
VALUES 
  ('RES-20260608-A1B2C3', '김지연', 'SC-0001', 'BC-05', 'BC-06', 78, 64, '목(木)', 'ENFP', 'B', '甲木', 'female', 163, 58, 50, 21.8, 28.5, 'M', '27', 'tired', 'confidence', 'sustainable',
   '{"BC-01":12,"BC-02":18,"BC-03":8,"BC-04":15,"BC-05":78,"BC-06":64,"BC-07":22,"BC-08":31,"BC-09":45,"BC-10":28}',
   '{"목":72,"화":31,"토":44,"금":28,"수":19}',
   '{"diet_attempts":5,"past_exercises":["스쿼트","런지","러닝"],"past_diets":["닭가슴살샐러드","간헐적단식"],"yoyo_count":3,"symptom_tags":["하체부종","셀룰라이트","저녁붓기"],"stress_type":"야식폭식","sleep_hours":5.5,"worst_season":"봄"}'),
  ('RES-20260605-X9Y8Z7', '이하은', 'SC-0001', 'BC-09', null, 82, 0, '수(水)', 'INFJ', 'A', '壬水', 'female', 158, 62, 52, 24.8, 31.2, 'L', '28', 'anxious', 'health', 'healthy',
   '{"BC-01":25,"BC-02":20,"BC-03":10,"BC-04":18,"BC-05":35,"BC-06":42,"BC-07":28,"BC-08":55,"BC-09":82,"BC-10":60}',
   '{"목":22,"화":35,"토":48,"금":30,"수":71}',
   '{"diet_attempts":3,"past_exercises":["HIIT","크런치"],"past_diets":["소식","간헐적단식"],"yoyo_count":2,"symptom_tags":["복부비만","수면부족","스트레스폭식"],"stress_type":"야식폭식","sleep_hours":4.5,"worst_season":"겨울"}');

-- BC 코드 기본 처방 데이터 (10개 코드)
INSERT OR IGNORE INTO bc_prescriptions (bc_code, version, brand_name, tagline, fat_area, bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  symptom_checklist_json, wrong_methods_json, correct_principles_json, recommended_exercises_json, forbidden_exercises_json,
  zone2_bpm, forbidden_bpm, hiit_available_week, recommended_foods_json, forbidden_foods_json, supplement_list_json, lifestyle_rules_json, monthly_goals_json)
VALUES
  ('BC-01', 'v1.0', '내장지방형', '복부 중심 단단한 지방 — 인슐린이 쌓은 벽', '윗배·복부', '인슐린 저항성으로 인해 복부 내장에 지방이 우선 축적되는 체형입니다.',
   '당신의 복부 지방세포는 인슐린 수용체가 과민하게 반응합니다. 탄수화물을 섭취할 때마다 인슐린이 과잉 분비되어 복부에 직접 지방을 저장합니다.',
   '굳히고', '내장형 복부지방은 올바른 방법을 만나면 가장 빠르게 반응하는 체형입니다. 지금부터 딱 4주.',
   '["만지면 딱딱하고 단단한 복부","식후 30분 이내 복부가 팽창하는 느낌","탄수화물 먹으면 바로 배가 나오는 것 같음","아침보다 저녁 복부가 훨씬 나옴"]',
   '[{"method":"크런치·싯업","reason_physiology":"복압을 높여 내장지방 압박, 오히려 팽창 유발"},{"method":"저탄고지 단독","reason_physiology":"인슐린 저항성 개선 없이 지방산만 늘려 역효과"},{"method":"고강도 HIIT 초기 도입","reason_physiology":"코르티솔 급등 → 내장지방 촉진"}]',
   '[{"principle":"저인슐린 식단 + 식이섬유 우선","expected_result":"4주 내 복부 2~3cm 감소"},{"principle":"Zone2 유산소 45분 이상","expected_result":"인슐린 감수성 개선"},{"principle":"식후 15분 내 걷기 10분","expected_result":"혈당 스파이크 억제"}]',
   '[{"name":"빠른 걷기","frequency":"주 5회","duration":"45분","reason_bc":"Zone2 심박수 유지로 인슐린 감수성 개선"},{"name":"수영","frequency":"주 3회","duration":"40분","reason_bc":"전신 저충격 유산소로 코르티솔 최소화"},{"name":"가벼운 요가","frequency":"주 2회","duration":"30분","reason_bc":"코르티솔 감소 + 수면질 개선"}]',
   '[{"name":"크런치·싯업","reason_physiology":"복압 상승으로 내장지방 팽창"},{"name":"고강도 HIIT","reason_physiology":"코르티솔 과잉으로 내장지방 증가"},{"name":"레그프레스 고중량","reason_physiology":"혈압 급등 → 인슐린 저항성 악화"}]',
   130, 160, '8주 차 이후',
   '["브로콜리","귀리","연어","아보카도","올리브오일","검은콩","무","배추"]',
   '[{"food":"흰쌀밥","reason":"GI지수 높아 인슐린 급등"},{"food":"밀가루 음식","reason":"글루텐이 장 투과성 높여 염증 유발"},{"food":"과당 음료","reason":"과당은 직접 내장지방으로 전환"}]',
   '[{"name":"베르베린","dosage":"500mg","timing":"식전 30분","reason_bc":"인슐린 감수성 개선","reason_ohaeng":""},{"name":"마그네슘","dosage":"200mg","timing":"취침 전","reason_bc":"인슐린 수용체 기능 정상화"},{"name":"오메가3","dosage":"2000mg","timing":"식후","reason_bc":"염증 억제 + 지방분해 촉진"}]',
   '[{"type":"positive","rule":"매 식사 채소 먼저 → 단백질 → 탄수화물 순서"},{"type":"positive","rule":"식후 15분 내 10분 걷기"},{"type":"positive","rule":"취침 3시간 전 금식"},{"type":"forbidden","rule":"야식·야간 탄수화물 절대 금지"},{"type":"forbidden","rule":"앉아있는 시간 1시간 초과 금지"}]',
   '{"month1":"인슐린 저항성 원인 제거 + 식단 리셋","month2":"Zone2 유산소 정착 + 복부 2~3cm 감소 확인","month3":"체형 유지 시스템 완성"}'),

  ('BC-05', 'v1.0', '하체지방형', '허벅지·엉덩이 피하지방 — 에스트로겐이 숨긴 지방', '허벅지·엉덩이', '에스트로겐 과잉으로 하체 피하지방 수용체가 활성화된 체형입니다.',
   '당신의 하체 지방세포에는 지방을 태우는 걸 막는 알파-2 수용체가 평균보다 4배 더 많습니다. 일반적인 유산소나 근력 운동으로는 이 지방이 움직이지 않습니다.',
   '고착시키고', 'BC-05 하체지방형은 올바른 방법을 만나면 가장 극적으로 바뀌는 체형입니다. 오늘부터 딱 4주.',
   '["허벅지·엉덩이에 살이 집중된다","스쿼트 하면 오히려 더 커지는 느낌","상체는 괜찮은데 하체만 유독 빠지지 않음","앉으면 허벅지가 옆으로 퍼지는 느낌"]',
   '[{"method":"스쿼트·레그프레스","reason_physiology":"하체 근육 비대 촉진 → 허벅지 더 커짐"},{"method":"닭가슴살 단독 식단","reason_physiology":"에스트로겐 대사에 필요한 영양소 부족"},{"method":"저강도 걷기만 반복","reason_physiology":"알파-2 수용체 자극 불충분"}]',
   '[{"principle":"림프 순환 촉진 운동 우선","expected_result":"4주 내 허벅지 2cm 감소"},{"principle":"에스트로겐 대사 지원 식단","expected_result":"호르몬 밸런스 개선"},{"principle":"고강도 인터벌 사이클링","expected_result":"알파-2 수용체 억제"}]',
   '[{"name":"인클라인 사이클링","frequency":"주 4회","duration":"40분","reason_bc":"알파-2 수용체 억제에 최적","reason_mbti_addon":""},{"name":"수영","frequency":"주 3회","duration":"40분","reason_bc":"하체 림프 순환 촉진"},{"name":"버피·점프런지","frequency":"주 2회","duration":"20분","reason_bc":"카테콜아민 분비로 하체 지방 동원"}]',
   '[{"name":"스쿼트·런지","reason_physiology":"하체 근육 비대 → 허벅지 더 굵어짐"},{"name":"레그프레스","reason_physiology":"대퇴근 과비대 유발"},{"name":"걷기만 반복","reason_physiology":"하체 알파-2 수용체 자극 부족"}]',
   135, 165, '6주 차 이후',
   '["연어","아스파라거스","브로콜리","아마씨","크랜베리","쑥갓","미역"]',
   '[{"food":"소금 과다","reason":"하체 부종 악화"},{"food":"맥주·탄산음료","reason":"에스트로겐 대사 방해"},{"food":"가공 두부·콩","reason":"식물성 에스트로겐 과잉"}]',
   '[{"name":"DIM","dosage":"100mg","timing":"식후","reason_bc":"에스트로겐 대사 개선","reason_ohaeng":""},{"name":"밀크씨슬","dosage":"140mg","timing":"식후","reason_bc":"간기능 강화로 에스트로겐 배출"},{"name":"비타민D3","dosage":"2000IU","timing":"아침","reason_bc":"지방 분해 효소 활성화"}]',
   '[{"type":"positive","rule":"매일 자기 전 누워서 다리 올리기 10분 (림프 촉진)"},{"type":"positive","rule":"탄수화물은 오전에만 섭취"},{"type":"positive","rule":"냉온 샤워 마무리 (냉 30초)"},{"type":"forbidden","rule":"저녁 6시 이후 탄수화물 금지"},{"type":"forbidden","rule":"꽉 끼는 하의 장시간 착용 금지 (림프 압박)"}]',
   '{"month1":"에스트로겐 과잉 원인 제거 + 림프 루틴 시작","month2":"사이클링 정착 + 허벅지 2cm 감소 확인","month3":"호르몬 밸런스 유지 시스템"}'),

  ('BC-06', 'v1.0', '냉증셀룰라이트형', '림프 순환 저하 + 셀룰라이트 — 차가운 지방의 이야기', '허벅지 바깥·엉덩이', '림프 순환 저하로 노폐물이 지방 사이에 쌓여 셀룰라이트가 형성된 체형입니다.',
   '셀룰라이트는 단순 지방이 아닙니다. 림프액과 노폐물이 지방 조직 사이에 축적되어 굳은 것입니다. 차가운 부위에 집중됩니다.',
   '굳히고', 'BC-06 냉증셀룰라이트형은 순환만 살려도 극적으로 바뀝니다. 지금이 딱 맞는 시점입니다.',
   '["허벅지 바깥이 귤껍질처럼 오돌토돌","손으로 잡으면 차갑고 알갱이 느낌","여름에도 하체가 차가움","누르면 오래 들어가 있는 느낌"]',
   '[{"method":"마사지만 반복","reason_physiology":"표면 자극만 되고 심부 림프 안 풀림"},{"method":"찜질방·열 치료","reason_physiology":"혈관 확장만 되고 림프 흐름 미개선"},{"method":"고강도 하체 운동","reason_physiology":"근육 과긴장 → 림프관 압박 심화"}]',
   '[{"principle":"림프드레나쥐 마사지 + 유산소 결합","expected_result":"4주 내 셀룰라이트 단계 개선"},{"principle":"체온 상승 운동 (점프 계열)","expected_result":"하체 혈류 개선"},{"principle":"항염 식단","expected_result":"조직 내 염증 감소"}]',
   '[{"name":"점프 줄넘기","frequency":"주 4회","duration":"20분","reason_bc":"림프 펌핑 효과 극대화"},{"name":"수영","frequency":"주 3회","duration":"40분","reason_bc":"수압 마사지 + 저충격 유산소"},{"name":"트램폴린","frequency":"주 2회","duration":"20분","reason_bc":"림프 순환 촉진 최고 효과"}]',
   '[{"name":"무거운 스쿼트","reason_physiology":"근막 압박 → 림프관 막힘"},{"name":"정적 스트레칭만","reason_physiology":"림프 흐름 자극 불충분"},{"name":"핫요가","reason_physiology":"탈수로 림프 농도 증가"}]',
   125, 150, '8주 차 이후',
   '["파인애플","생강","강황","블루베리","셀러리","아티초크","녹차"]',
   '[{"food":"짠 음식","reason":"림프 과부하 → 부종 악화"},{"food":"술","reason":"림프 독소 증가"},{"food":"튀긴 음식","reason":"염증 유발 트랜스지방"}]',
   '[{"name":"루틴","dosage":"500mg","timing":"아침","reason_bc":"모세혈관 강화 + 림프벽 탄력"},{"name":"비타민C","dosage":"1000mg","timing":"아침","reason_bc":"콜라겐 합성으로 림프관 강화"},{"name":"마그네슘","dosage":"200mg","timing":"취침 전","reason_bc":"혈관 이완 + 림프 흐름 개선"}]',
   '[{"type":"positive","rule":"매일 아침 냉온 샤워 (온 2분 → 냉 30초 × 3회)"},{"type":"positive","rule":"자기 전 다리 높이 올리기 15분"},{"type":"positive","rule":"물 하루 2L 이상 (림프 묽게)"},{"type":"forbidden","rule":"꽉 끼는 속옷·레깅스 장시간 착용 금지"},{"type":"forbidden","rule":"다리 꼬고 앉기 금지 (림프 압박)"}]',
   '{"month1":"림프 순환 루틴 시작 + 체온 올리기","month2":"셀룰라이트 질감 변화 확인","month3":"유지 + 관리 루틴 정착"}'),

  ('BC-09', 'v1.0', '코르티솔형', '스트레스·수면 부족 기반 — 호르몬이 쌓은 복부', '복부·전체', '만성 스트레스와 수면 부족으로 코르티솔이 지속 분비되어 복부에 지방이 축적된 체형입니다.',
   '코르티솔은 비상 에너지를 복부에 저장하라는 명령을 내립니다. 당신이 열심히 운동하고 식단을 지켜도 스트레스가 해결되지 않으면 살은 빠지지 않습니다.',
   '고착시키고', 'BC-09 코르티솔형은 삶의 방식이 바뀌면 가장 빠르게 반응하는 체형입니다. 첫 주부터 변화가 느껴집니다.',
   '["밤에 유독 먹고 싶어짐","스트레스 받으면 복부가 먼저 나옴","수면이 부족한 날 더 많이 먹게 됨","다이어트 중에도 스트레스 받으면 요요"]',
   '[{"method":"고강도 HIIT·크로스핏","reason_physiology":"코르티솔 추가 분비 → 복부지방 증가"},{"method":"극단적 칼로리 제한","reason_physiology":"스트레스 호르몬 추가 분비"},{"method":"밤 운동","reason_physiology":"코르티솔 분비 리듬 교란"}]',
   '[{"principle":"코르티솔 억제 생활 루틴","expected_result":"2주 내 수면질 개선 → 복부 변화"},{"principle":"Zone2 유산소 (아침)","expected_result":"코르티솔 정상화"},{"principle":"수면 7시간 확보 절대 원칙","expected_result":"렙틴·그렐린 정상화 → 식욕 안정"}]',
   '[{"name":"빠른 걷기 (아침)","frequency":"주 5회","duration":"40분","reason_bc":"아침 코르티솔 자연 소비"},{"name":"요가·명상","frequency":"주 4회","duration":"30분","reason_bc":"코르티솔 억제 효과 검증"},{"name":"가벼운 수영","frequency":"주 2회","duration":"40분","reason_bc":"부교감 신경 활성화"}]',
   '[{"name":"저녁 고강도 운동","reason_physiology":"코르티솔 급등 → 수면 방해 → 악순환"},{"name":"HIIT·크로스핏","reason_physiology":"코르티솔 추가 분비"},{"name":"공복 유산소 (만성 스트레스 시)","reason_physiology":"코르티솔 과잉 분비 유발"}]',
   120, 145, '10주 차 이후',
   '["다크초콜릿","아슈와간다차","바나나","귀리","연어","시금치","블루베리"]',
   '[{"food":"카페인 과다","reason":"코르티솔 분비 자극"},{"food":"야식·야간 탄수화물","reason":"인슐린+코르티솔 동시 분비"},{"food":"알코올","reason":"수면질 저하 → 코르티솔 증가"}]',
   '[{"name":"아슈와간다","dosage":"300mg","timing":"취침 전","reason_bc":"코르티솔 억제 효과 임상 검증"},{"name":"마그네슘","dosage":"400mg","timing":"취침 전","reason_bc":"수면질 개선 + 코르티솔 감소"},{"name":"L-테아닌","dosage":"200mg","timing":"낮","reason_bc":"스트레스 반응 완화"}]',
   '[{"type":"positive","rule":"취침 시간 11시 이전 고정"},{"type":"positive","rule":"아침 햇빛 10분 노출 (코르티솔 리듬 정상화)"},{"type":"positive","rule":"저녁 명상 10분"},{"type":"forbidden","rule":"오후 2시 이후 카페인 금지"},{"type":"forbidden","rule":"저녁 9시 이후 스마트폰 금지"}]',
   '{"month1":"수면 루틴 확립 + 코르티솔 식단 적용","month2":"스트레스 관리 루틴 정착 + 복부 변화 확인","month3":"자율신경 균형 유지 시스템"}'),

  ('BC-10', 'v1.0', '요요반복형', '다이어트 반복·요요 패턴 — 대사가 기억하는 상처', '전체 체형', '반복된 다이어트와 요요로 기초대사량이 저하되고 몸이 기아 모드에 고착된 체형입니다.',
   '몸은 반복된 굶주림을 기억합니다. 지방을 쌓는 능력은 극대화되고, 태우는 능력은 극소화된 상태입니다. 의지가 아니라 생리적 메커니즘의 문제입니다.',
   '더 고착시키고', '요요형은 올바른 방법으로 대사를 살리면 누구보다 빠르게 변할 수 있는 체형입니다. 지금부터 시작입니다.',
   '["열심히 해도 처음 2주만 빠지고 멈춤","조금만 먹어도 살이 찜","과거보다 같은 양 먹어도 더 찜","식단 멈추면 바로 원래대로"]',
   '[{"method":"극단적 칼로리 제한","reason_physiology":"기초대사량 추가 저하 → 요요 가속"},{"method":"원푸드 다이어트","reason_physiology":"근육 손실 → 대사 악화"},{"method":"단기 고강도 운동","reason_physiology":"지속 불가 → 완전 중단 → 더 큰 요요"}]',
   '[{"principle":"대사 재건 식단 (적당한 칼로리)","expected_result":"4주 내 기초대사량 5~10% 상승"},{"principle":"근육량 보존 운동","expected_result":"지방만 빠지는 환경 조성"},{"principle":"리피드·식욕 호르몬 정상화","expected_result":"식욕 안정 + 요요 방지"}]',
   '[{"name":"저강도 근력 운동","frequency":"주 3회","duration":"40분","reason_bc":"근육량 보존으로 기초대사 유지"},{"name":"빠른 걷기","frequency":"주 5회","duration":"40분","reason_bc":"대사 활성화 최소 자극"},{"name":"필라테스","frequency":"주 2회","duration":"50분","reason_bc":"코어 근육 재건"}]',
   '[{"name":"굶기·극단적 절식","reason_physiology":"기초대사량 추가 저하"},{"name":"고강도 유산소 단독","reason_physiology":"근육 분해 촉진"},{"name":"원푸드 식단","reason_physiology":"영양 불균형 → 대사 교란"}]',
   125, 150, '12주 차 이후',
   '["닭가슴살","계란","고구마","현미","아보카도","견과류","요거트"]',
   '[{"food":"극단적 저칼로리 식품","reason":"기아 모드 지속"},{"food":"인공 감미료","reason":"인슐린 혼란 유발"},{"food":"간식 완전 제거","reason":"대사 저하 신호"}]',
   '[{"name":"아연","dosage":"15mg","timing":"식후","reason_bc":"렙틴 감수성 개선"},{"name":"비타민D3","dosage":"2000IU","timing":"아침","reason_bc":"대사 호르몬 정상화"},{"name":"프로바이오틱스","dosage":"10억CFU","timing":"공복","reason_bc":"장내 미생물 → 대사 개선"}]',
   '[{"type":"positive","rule":"하루 1200kcal 이상은 반드시 섭취 (기아 모드 탈출)"},{"type":"positive","rule":"3끼 규칙적으로 (대사 리듬 형성)"},{"type":"positive","rule":"단백질 매 끼니 포함"},{"type":"forbidden","rule":"2일 이상 연속 절식 금지"},{"type":"forbidden","rule":"1주일 내 2kg 이상 목표 절대 금지"}]',
   '{"month1":"대사 재건 + 기초대사량 회복 확인","month2":"지방 감량 시작 + 근육 보존 확인","month3":"요요 없는 유지 시스템 구축"}');
