-- 0061: BC-1~BC-16 특허 바디코드 처방 재정비 (설계도 v2 기준)
-- 기존 BC-11~22 구버전 데이터를 DELETE 후 BC-1~16 신규 시드로 교체
-- BC-1~9 기존 행은 REPLACE(UPDATE)로 덮어씀

-- ── 컬럼 호환성 보장: exercise_type, diet_type, core_supplement, lifestyle_tip
-- 이 컬럼들은 이전 migration에서 이미 추가됨 → ALTER TABLE 불필요 (중복 제거)

-- 구버전 BC-11~22 삭제 (신규 BC-11~16으로 교체)
DELETE FROM bc_prescriptions WHERE bc_code IN (
  'BC-17','BC-18','BC-19','BC-20','BC-21','BC-22'
);

-- ════════════════════════════════════════════════════════
-- BC-1: 단단내장형 (인슐린·내장지방)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-1', 'v2.0', '단단내장형', '복부 깊숙이 쌓인 인슐린의 벽 — 내장지방 우선 연소형', '윗배·복부 깊은 곳',
  '인슐린 저항성으로 복부 내장에 지방이 우선 축적되는 체형입니다.',
  '식사 후 혈당이 빠르게 오르고 인슐린이 과잉 분비되면서 남은 포도당이 내장지방으로 전환됩니다. 단단한 복부 긴장감, 식후 졸음이 반복된다면 인슐린 패턴이 원인입니다.',
  '악화시키고', 'BC-1 단단내장형은 식사 순서 하나만 바꿔도 4주 안에 복부 둘레가 달라집니다.',
  '유산소+근력 복합', '저혈당지수 식단', '베르베린, 크롬', '식사 순서(채소→단백→탄수) 준수',
  '["걷기","수영","실내자전거","저강도 서킷"]', '["HIIT(초기)","격렬한 복근운동"]'
);

-- ════════════════════════════════════════════════════════
-- BC-2: 물렁피하형 (림프·피하지방)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-2', 'v2.0', '물렁피하형', '손가락이 푹 들어가는 부드러운 지방 — 림프 순환 부진형', '복부·허벅지 피하층',
  '림프 순환이 저하되어 피하지방 층에 노폐물과 수분이 정체된 체형입니다.',
  '전신적으로 부드럽고 눌리는 지방이 특징입니다. 림프 흐름이 느려 노폐물 배출이 잘 안 되고, 셀룰라이트로 발전하기 쉽습니다.',
  '정체시키고', 'BC-2 물렁피하형은 순환 하나만 살려도 몸이 가벼워지는 속도가 다릅니다.',
  '림프 드레이나지+저강도 유산소', '항염 식단', '비타민 C, 루틴', '드라이 브러싱, 족욕',
  '["림프 마사지","걷기","요가","수영"]', '["장시간 앉기","고강도 충격 운동"]'
);

-- ════════════════════════════════════════════════════════
-- BC-3: 가스팽만형 (소화·장)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-3', 'v2.0', '가스팽만형', '저녁이면 빵빵해지는 복부 — 장내 가스 팽만형', '아랫배·소화관',
  '장내 가스 과잉 생성과 소화 기능 저하로 복부 팽만이 반복되는 체형입니다.',
  '식후 배가 빵빵해지고 방귀가 잦으며 변비와 설사가 교대로 나타납니다. 장내 세균 불균형(디스바이오시스)이 주요 원인입니다.',
  '부풀리고', 'BC-3 가스팽만형은 장을 회복시키면 4주 안에 아랫배 실루엣이 달라집니다.',
  '코어 호흡+장 운동', '저포드맵 식단', '프로바이오틱스, 소화효소', '식후 10분 걷기, 복부 마사지',
  '["복부 마사지","걷기","필라테스","요가"]', '["탄산음료","고FODMAP 음식","과식"]'
);

-- ════════════════════════════════════════════════════════
-- BC-4: 올챙이배형 (근감소·대사저하)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-4', 'v2.0', '올챙이배형', '팔다리는 가는데 배만 나온 — 근감소성 복부비만형', '복부·내장+사지 근감소',
  '근육량 감소로 기초대사율이 떨어지고 복부에만 지방이 집중 축적되는 체형입니다.',
  '다이어트를 반복하면서 근육을 잃었거나 운동 없이 칼로리만 줄인 경우 나타납니다. 팔다리는 가늘고 복부만 나오는 체형 불균형이 특징입니다.',
  '가속시키고', 'BC-4 올챙이배형은 근육만 채워도 복부가 가장 먼저 반응합니다.',
  '근력 우선+단백질 강화', '고단백 저탄수', '류신, 크레아틴', '단백질 타이밍(운동 후 30분)',
  '["스쿼트","데드리프트","케틀벨","TRX"]', '["장기 유산소만","초저열량 다이어트"]'
);

-- ════════════════════════════════════════════════════════
-- BC-5: 코끼리다리형 (림프·하체 부종)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-5', 'v2.0', '코끼리다리형', '오후만 되면 통통해지는 다리 — 하체 림프 정체형', '하체·종아리·발목',
  '림프 정체와 정맥 순환 부진으로 하체에 수분과 노폐물이 쌓이는 체형입니다.',
  '아침에 괜찮다가 오후가 되면 다리가 무거워지고 신발이 꽉 끼는 증상이 반복됩니다. 오래 서있거나 앉아있을 때 악화됩니다.',
  '정체시키고', 'BC-5 코끼리다리형은 하루 3번 종아리 펌핑만으로도 4주 안에 다리 라인이 바뀝니다.',
  '림프 순환+하체 근력', '저나트륨 항부종 식단', '마그네슘, 비타민 B6', '다리 올리기, 압박 스타킹',
  '["수영","걷기(경사)","런지","종아리 올리기"]', '["장시간 서있기","교차다리 앉기"]'
);

-- ════════════════════════════════════════════════════════
-- BC-6: 귤껍질하체형 (셀룰라이트·에스트로겐)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-6', 'v2.0', '귤껍질하체형', '허벅지 안쪽 울퉁불퉁 귤껍질 — 에스트로겐 과잉형', '허벅지 안쪽·엉덩이',
  '에스트로겐 과잉으로 하체 피하지방 수용체가 활성화되고 셀룰라이트가 형성된 체형입니다.',
  '허벅지와 엉덩이에 울퉁불퉁한 귤껍질 피부가 나타납니다. 에스트로겐 우세증이 원인으로 피임약, 환경 호르몬, 스트레스가 악화 요인입니다.',
  '굳히고', 'BC-6 귤껍질하체형은 호르몬 균형만 잡아도 8주 안에 피부 결이 달라집니다.',
  '하체 순환+호르몬 밸런스', '식물성 에스트로겐 조절 식단', 'DIM, 아연', '냉온 샤워, 드라이 브러싱',
  '["사이클링","런지","스쿼트","폼롤러"]', '["고에스트로겐 식품 과잉","스트레스 방치"]'
);

-- ════════════════════════════════════════════════════════
-- BC-7: 말벅지형 (근육·골격)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-7', 'v2.0', '말벅지형', '허벅지가 운동할수록 굵어지는 — 근비대성 하체 과발달형', '허벅지·대퇴사두근',
  '특정 근육군(특히 대퇴사두근)이 과발달하여 하체가 굵어 보이는 체형입니다.',
  '운동을 많이 해도 허벅지가 얇아지지 않거나 오히려 굵어지는 패턴입니다. 근육 비대와 피하지방이 공존하며 골반 전방 경사도 동반될 수 있습니다.',
  '굵게 만들고', 'BC-7 말벅지형은 운동 방향을 바꾸면 4주 안에 허벅지 라인이 달라집니다.',
  '스트레칭+저강도 유산소', '항염 단백질 식단', 'BCAA, 마그네슘', '자기 전 폼롤러 15분',
  '["수영","필라테스","요가","폼롤러"]', '["스쿼트 과잉","레그프레스 고중량","사이클 고저항"]'
);

-- ════════════════════════════════════════════════════════
-- BC-8: 승마살형 (골반·자율신경)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-8', 'v2.0', '승마살형', '허벅지 바깥쪽 튀어나온 지방 — 골반 불균형 자율신경 저하형', '허벅지 외측·골반 주변',
  '골반 불균형과 자율신경 저하로 허벅지 외측에 지방이 집중 축적된 체형입니다.',
  '골반이 틀어지면서 허벅지 바깥쪽이 강조됩니다. 자율신경 밸런스가 깨지면 해당 부위 혈행이 저하되고 지방이 고착됩니다.',
  '고착시키고', 'BC-8 승마살형은 골반 교정과 자율신경 회복으로 8주 안에 라인이 달라집니다.',
  '골반 교정+자율신경 이완', '항염 온기 식단', '마그네슘, B복합체', '온욕, 골반 교정 스트레칭',
  '["필라테스","요가","힙힌지","사이드 런지"]', '["골반 비대칭 동작","고강도 점프"]'
);

-- ════════════════════════════════════════════════════════
-- BC-9: 거북이형 (골격·자세)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-9', 'v2.0', '거북이형', '목이 짧아 보이고 등이 굽은 — 자세 불균형 근골격형', '목·어깨·등 상체',
  '자세 불균형(거북목·굽은 등)으로 상체 근육이 경직되고 체형이 왜곡된 체형입니다.',
  '스마트폰, 컴퓨터 사용으로 목이 앞으로 빠지고 어깨가 말립니다. 상체 전반의 근육 불균형이 체형을 왜곡하고 만성 통증을 유발합니다.',
  '굳히고', 'BC-9 거북이형은 자세 교정 4주면 목 라인과 어깨 너비가 눈에 띄게 달라집니다.',
  '척추 신장+코어 안정화', '항염 오메가3 식단', '비타민 D, 마그네슘', '1시간마다 목 스트레칭',
  '["수영","필라테스","척추 스트레칭","데드버그"]', '["목 앞으로 빠진 자세","무거운 가방 한쪽"]'
);

-- ════════════════════════════════════════════════════════
-- BC-10: 팔뚝부종형 (림프·골격 상체)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-10', 'v2.0', '팔뚝부종형', '쓸수록 굵어지는 팔뚝 — 상체 림프 정체·골격 불균형형', '팔뚝·상완·腋下',
  '상체 림프 정체와 골격 불균형으로 팔뚝 부위에 부종과 지방이 집중된 체형입니다.',
  '팔을 들면 겨드랑이 살이 걸리고 팔뚝이 굵어 보입니다. 상체 림프 순환이 저하되어 노폐물이 정체되고, 어깨 주변 근육 긴장도 동반됩니다.',
  '정체시키고', 'BC-10 팔뚝부종형은 림프 순환을 살리면 4주 안에 팔뚝이 가벼워집니다.',
  '상체 림프+가벼운 유산소', '저나트륨 항부종', '비타민 C, 루틴', '팔 들고 자기, 상체 마사지',
  '["수영","암컬(저중량)","어깨 돌리기","림프 마사지"]', '["고중량 상체 운동","꽉 끼는 옷"]'
);

-- ════════════════════════════════════════════════════════
-- BC-11: 상체근육형 (근비대·골격)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-11', 'v2.0', '상체근육형', '어깨·등이 넓고 상체가 발달한 — 상체 근비대 체형', '어깨·등·상완',
  '상체 근육군이 과발달하여 상체가 크고 하체와 불균형을 이루는 체형입니다.',
  '운동을 많이 할수록 어깨가 넓어지고 상체가 강조됩니다. 하체 발달 없이 상체만 커지는 불균형이 체형 왜곡을 만듭니다.',
  '비대하게 만들고', 'BC-11 상체근육형은 방향을 바꾸면 8주 안에 균형 잡힌 실루엣으로 달라집니다.',
  '하체 강화+상체 이완', '균형 단백질 식단', 'BCAA, 아연', '하체 운동 우선화',
  '["하체 위주 운동","필라테스","요가","수영"]', '["상체 고중량","어깨 프레스 과잉"]'
);

-- ════════════════════════════════════════════════════════
-- BC-12: 부유방형 (골격·호르몬)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-12', 'v2.0', '부유방형', '겨드랑이 옆으로 삐져나오는 살 — 부유방형', '겨드랑이·흉부 측면',
  '골격 불균형과 호르몬 영향으로 흉부 측면(겨드랑이 주변)에 지방이 집중된 체형입니다.',
  '브라 라인 옆으로 지방이 튀어나오는 부유방이 특징입니다. 자세 불균형, 에스트로겐 과잉, 림프 정체가 복합적으로 작용합니다.',
  '고착시키고', 'BC-12 부유방형은 자세 교정과 호르몬 균형으로 8주 안에 라인이 달라집니다.',
  '흉부 자세 교정+호르몬 밸런스', 'DIM 식단', 'DIM, 아연', '바른 자세 유지, 적절한 속옷',
  '["수영","푸시업(넓은 그립)","어깨 뒤로 당기기","요가"]', '["굽은 자세","꽉 끼는 속옷"]'
);

-- ════════════════════════════════════════════════════════
-- BC-13: 갱년기변환형 (호르몬·완경)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-13', 'v2.0', '갱년기변환형', '완경 이후 복부와 전신이 바뀌는 — 호르몬 전환 체형', '복부·전신(호르몬 분포 변화)',
  '완경(갱년기) 후 에스트로겐 급감으로 복부 지방 분포가 전환되는 체형입니다.',
  '에스트로겐이 줄면서 하체에 모이던 지방이 복부로 재분배됩니다. 코르티솔 상승, 인슐린 민감성 저하, 수면 장애가 동반되어 체중 관리가 어려워집니다.',
  '가속시키고', 'BC-13 갱년기변환형은 호르몬 흐름에 맞게 접근하면 12주 안에 체형이 안정됩니다.',
  '저강도 복합+호르몬 지원', '식물성 호르몬 식단(이소플라본)', '블랙코호시, 마그네슘, 비타민 D3', '수면 위생, 스트레스 관리',
  '["걷기","요가","필라테스","수영","근력(저중량 고반복)"]', '["고강도 HIIT","야간 과식","카페인 과잉"]'
);

-- ════════════════════════════════════════════════════════
-- BC-14: 번아웃무기력형 (심리·코르티솔)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-14', 'v2.0', '번아웃무기력형', '기운이 없고 의욕도 없어 살이 찌는 — 심리·번아웃 체형', '전신·복부(코르티솔 분포)',
  '만성 스트레스와 번아웃으로 코르티솔이 만성 상승하고 심리적 식이 조절이 어려운 체형입니다.',
  '일상적인 피로감, 무기력감이 지속되며 폭식과 절식이 반복됩니다. 코르티솔 만성 상승이 복부 지방 축적을 유발하고 회복력을 저하시킵니다.',
  '심화시키고', 'BC-14 번아웃무기력형은 회복을 먼저 채우면 다이어트가 저절로 따라옵니다.',
  '회복 우선+저강도 운동', '혈당 안정 식단', '아쉬와간다, 마그네슘, B5', '수면 8시간, 디지털 디톡스',
  '["걷기","요가","호흡 명상","가벼운 스트레칭"]', '["고강도 운동","칼로리 제한 급격","카페인 과잉"]'
);

-- ════════════════════════════════════════════════════════
-- BC-15: 대사증후군형 (대사위험·복합)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-15', 'v2.0', '대사증후군형', '혈당·혈압·중성지방 — 5대 지표 복합 이상형', '복부·전신(내장+혈관)',
  '대사증후군 5대 지표(복부비만·고혈당·고혈압·고중성지방·저HDL)가 복합적으로 이상을 보이는 체형입니다.',
  '복부 둘레가 크고 혈당, 혈압, 중성지방이 경계치 이상입니다. 심혈관 질환과 당뇨 위험이 동반되는 대사 위기 체형입니다.',
  '악화시키고', 'BC-15 대사증후군형은 의료진 협진과 함께 12주면 수치가 달라집니다.',
  '유산소+근력 복합', '지중해 식단', '오메가3, 코엔자임Q10, 베르베린', '혈압·혈당 주기적 모니터링',
  '["걷기","수영","실내자전거","근력 복합"]', '["포화지방 과잉","나트륨 과다","앉아있기"]'
);

-- ════════════════════════════════════════════════════════
-- BC-16: 다중악순환형 (복합·기질)
-- ════════════════════════════════════════════════════════
INSERT OR REPLACE INTO bc_prescriptions (
  bc_code, version, brand_name, tagline, fat_area,
  bc_primary_oneline_reason, bc_cause_story, bc_worsen_word, closing_copy,
  exercise_type, diet_type, core_supplement, lifestyle_tip,
  recommended_sports_json, forbidden_sports_json
) VALUES (
  'BC-16', 'v2.0', '다중악순환형', '여러 축이 동시에 얽혀 악순환이 반복되는 — 복합 다중 체형', '전신·복합(복부+하체+심리)',
  '10개 원인축 중 4개 이상이 동시에 높아 복합적인 악순환이 형성된 체형입니다.',
  '단일 원인이 아닌 다중 원인이 서로 얽혀 악화됩니다. 한 가지를 개선하면 다른 축이 방해하는 패턴이 반복됩니다. 통합적 접근이 필수입니다.',
  '복잡하게 만들고', 'BC-16 다중악순환형은 가장 높은 축부터 순서대로 풀면 12주 안에 흐름이 바뀝니다.',
  '우선 축 집중+순차 접근', '항염 균형 식단', '멀티비타민, 오메가3, 마그네슘', '우선순위 축 집중 관리',
  '["우선순위 맞춤 운동","걷기(기본)","요가","수영"]', '["전체 동시 공략","과도한 제한"]'
);
