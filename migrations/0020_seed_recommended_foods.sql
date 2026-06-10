-- ══════════════════════════════════════════════════════════════════
--  마이그레이션 0020: BC별 권장 식품 + 금지 식품 + 보충제 데이터 삽입
--  ch5 식단 처방 카드 렌더링에 사용
-- ══════════════════════════════════════════════════════════════════

-- BC-01 · 내장지방형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"연어","reason":"오메가3가 인슐린 저항성을 낮추고 내장지방 분해를 촉진","category":"단백질","emoji":"🐟"},
    {"name":"현미","reason":"저GI 탄수화물, 혈당 스파이크 없이 포만감 유지","category":"탄수화물","emoji":"🌾"},
    {"name":"아보카도","reason":"단일불포화지방산이 복부 내장지방 감소에 직접 작용","category":"지방","emoji":"🥑"},
    {"name":"브로콜리","reason":"설포라판이 간의 지방 대사를 활성화","category":"채소","emoji":"🥦"},
    {"name":"계란흰자","reason":"고단백 저지방, 인슐린 반응 없이 포만감 극대화","category":"단백질","emoji":"🥚"},
    {"name":"녹차","reason":"EGCG가 내장지방 연소 효소를 직접 자극","category":"음료","emoji":"🍵"}
  ]',
  forbidden_foods_json = '[
    {"name":"흰쌀밥","reason":"급격한 혈당 스파이크 → 인슐린 과분비 → 복부 지방 저장","emoji":"🍚"},
    {"name":"빵·베이커리","reason":"정제 밀가루 + 설탕 조합이 내장지방 직접 생성","emoji":"🍞"},
    {"name":"탄산음료","reason":"액상 과당이 간에서 즉시 내장지방으로 전환","emoji":"🥤"},
    {"name":"주류","reason":"알코올이 간을 통해 복부 지방으로 전환되는 대사 경로","emoji":"🍺"},
    {"name":"과자·스낵","reason":"트랜스지방 + 정제 탄수화물의 최악 조합","emoji":"🍪"}
  ]',
  supplement_list_json = '[
    {"name":"베르베린 500mg","timing":"식전 30분","reason":"인슐린 저항성 개선, 메트포르민과 유사 효과"},
    {"name":"오메가3 2000mg","timing":"식후","reason":"내장지방 감소, 항염 효과"},
    {"name":"마그네슘 300mg","timing":"취침 전","reason":"인슐린 민감성 개선, 수면 질 향상"}
  ]'
WHERE bc_code = 'BC-01';

-- BC-02 · 복부비만형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"두부","reason":"저GI 고단백, 혈당 급등 없이 복부 지방 감소에 최적","category":"단백질","emoji":"🫘"},
    {"name":"렌틸콩","reason":"복합 탄수화물 + 식이섬유, 혈당 지속 안정화","category":"탄수화물","emoji":"🌱"},
    {"name":"사과식초","reason":"식후 혈당 상승을 15~20% 낮추는 아세트산 효과","category":"조미료","emoji":"🍶"},
    {"name":"시나몬","reason":"혈당 조절 효소 활성화, 1일 1/2 티스푼으로 효과","category":"향신료","emoji":"🌿"},
    {"name":"오이","reason":"수분 95%, 저칼로리, 혈당 부담 없는 포만감","category":"채소","emoji":"🥒"},
    {"name":"닭가슴살","reason":"순수 단백질로 인슐린 반응 최소화, 복부 지방 분해 보조","category":"단백질","emoji":"🍗"}
  ]',
  forbidden_foods_json = '[
    {"name":"과일 주스","reason":"과당이 농축되어 복부 지방으로 직행","emoji":"🧃"},
    {"name":"흰 면류","reason":"GI 지수 최고 수준, 복부에 지방 직접 축적","emoji":"🍜"},
    {"name":"꿀·시럽","reason":"과당 함량 높아 간에서 내장지방으로 전환","emoji":"🍯"},
    {"name":"가공육","reason":"포화지방 + 나트륨이 복부 지방 세포를 확장","emoji":"🌭"},
    {"name":"감자튀김","reason":"고GI + 트랜스지방 + 나트륨 3종 세트","emoji":"🍟"}
  ]',
  supplement_list_json = '[
    {"name":"크롬 200mcg","timing":"식전","reason":"인슐린 민감성 개선, 당 대사 효율화"},
    {"name":"알파리포산 300mg","timing":"식전 30분","reason":"혈당 조절, 항산화"},
    {"name":"오메가3 2000mg","timing":"식후","reason":"복부 지방 분해 촉진"}
  ]'
WHERE bc_code = 'BC-02';

-- BC-03 · 상체비대형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"생강차","reason":"혈관 확장 + 림프 순환 촉진, 상체 부종 감소","category":"음료","emoji":"🫖"},
    {"name":"파인애플","reason":"브로멜라인 효소가 상체 부종과 염증을 직접 분해","category":"과일","emoji":"🍍"},
    {"name":"셀러리","reason":"프탈라이드 성분이 혈압을 낮추고 림프 흐름 개선","category":"채소","emoji":"🌿"},
    {"name":"아몬드","reason":"비타민E가 상체 혈관 순환을 개선하고 림프벽 강화","category":"견과","emoji":"🌰"},
    {"name":"연근","reason":"탄닌 + 무틴 성분이 림프관 벽을 강화","category":"채소","emoji":"🪷"},
    {"name":"참치","reason":"오메가3로 상체 미세혈관 염증 감소","category":"단백질","emoji":"🐟"}
  ]',
  forbidden_foods_json = '[
    {"name":"짜개류·국물요리","reason":"나트륨 과다 → 상체 부종 직접 유발","emoji":"🍲"},
    {"name":"가공식품","reason":"숨겨진 나트륨이 림프 정체를 악화","emoji":"🥫"},
    {"name":"커피 과다","reason":"카페인이 상체 혈관을 수축시켜 림프 순환 방해","emoji":"☕"},
    {"name":"알코올","reason":"탈수 후 반동 부종이 상체에 집중","emoji":"🍻"},
    {"name":"인스턴트 라면","reason":"나트륨 2,000mg+ 의 부종 폭탄","emoji":"🍜"}
  ]',
  supplement_list_json = '[
    {"name":"비타민C 1000mg","timing":"식후","reason":"림프관 벽 강화, 상체 순환 개선"},
    {"name":"루틴(바이오플라보노이드) 500mg","timing":"식후","reason":"모세혈관 강화, 림프 부종 감소"},
    {"name":"마그네슘 300mg","timing":"취침 전","reason":"혈관 이완, 상체 근육 긴장 완화"}
  ]'
WHERE bc_code = 'BC-03';

-- BC-04 · 복압형 ─────────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"김치","reason":"유산균이 장 건강을 회복하고 복압 불균형 근본 원인 해소","category":"발효식품","emoji":"🥬"},
    {"name":"바나나","reason":"칼륨이 장 근육 수축을 도와 복압 균형 개선","category":"과일","emoji":"🍌"},
    {"name":"고구마","reason":"장 운동을 촉진하고 복부 가스 배출 도움","category":"탄수화물","emoji":"🍠"},
    {"name":"요거트","reason":"프로바이오틱스로 장내 환경 개선, 복압 안정화","category":"유제품","emoji":"🥛"},
    {"name":"시금치","reason":"마그네슘이 장근육 + 코어근육 동시 이완","category":"채소","emoji":"🥬"},
    {"name":"연어","reason":"오메가3가 장 염증 감소, 장벽 강화","category":"단백질","emoji":"🐟"}
  ]',
  forbidden_foods_json = '[
    {"name":"콩류·브로콜리(과다)","reason":"가스 생성이 복압 불균형을 악화","emoji":"🫘"},
    {"name":"탄산음료","reason":"이산화탄소가 복압 직접 상승","emoji":"🥤"},
    {"name":"밀가루 음식","reason":"글루텐 과민 시 장 염증과 복부 팽창 유발","emoji":"🍞"},
    {"name":"튀긴 음식","reason":"소화 지연으로 복부 팽창 장시간 지속","emoji":"🍤"},
    {"name":"인공감미료","reason":"장내 유해균 증가, 복압 불균형 악화","emoji":"🍬"}
  ]',
  supplement_list_json = '[
    {"name":"프로바이오틱스 100억CFU","timing":"공복","reason":"장내 환경 개선, 복압 근본 원인 해소"},
    {"name":"소화효소(다이제스타제)","timing":"식전","reason":"소화 불량 개선, 복부 가스 감소"},
    {"name":"마그네슘 400mg","timing":"취침 전","reason":"장근육 + 코어근육 이완"}
  ]'
WHERE bc_code = 'BC-04';

-- BC-05 · 하체지방형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"아스파라거스","reason":"천연 이뇨 작용으로 하체 수분 정체 해소","category":"채소","emoji":"🌿"},
    {"name":"연어","reason":"오메가3가 에스트로겐 대사를 개선하고 하체 지방 분해 촉진","category":"단백질","emoji":"🐟"},
    {"name":"인삼차","reason":"에스트로겐 밸런스 조절, 하체 순환 개선","category":"음료","emoji":"🫖"},
    {"name":"블루베리","reason":"안토시아닌이 하체 미세혈관 순환 개선","category":"과일","emoji":"🫐"},
    {"name":"콜리플라워","reason":"DIM 성분이 에스트로겐 과잉을 자연 조절","category":"채소","emoji":"🥦"},
    {"name":"병아리콩","reason":"식물성 에스트로겐이 호르몬 균형 보조","category":"단백질","emoji":"🫘"}
  ]',
  forbidden_foods_json = '[
    {"name":"플라스틱 포장 음식","reason":"환경호르몬이 에스트로겐 교란, 하체 지방 고착","emoji":"📦"},
    {"name":"전자레인지 팝콘","reason":"화학 첨가물의 에스트로겐 유사 작용","emoji":"🍿"},
    {"name":"정제 소금","reason":"나트륨이 하체 림프 정체를 유발","emoji":"🧂"},
    {"name":"가공 유제품","reason":"호르몬 성분이 첨가된 제품은 에스트로겐 교란","emoji":"🧈"},
    {"name":"알코올","reason":"에스트로겐 분해 효소를 억제해 하체 지방 고착화","emoji":"🍷"}
  ]',
  supplement_list_json = '[
    {"name":"DIM(디인돌릴메탄) 200mg","timing":"식후","reason":"에스트로겐 과잉 자연 조절, 하체 지방 분해"},
    {"name":"오메가3 2000mg","timing":"식후","reason":"하체 미세혈관 순환 개선"},
    {"name":"루틴 500mg","timing":"식후","reason":"하체 모세혈관 강화, 부종 감소"}
  ]'
WHERE bc_code = 'BC-05';

-- BC-06 · 냉증셀룰라이트형 ───────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"생강","reason":"진저롤이 하체 혈관을 확장하고 체온을 올려 셀룰라이트 분해","category":"향신료","emoji":"🫚"},
    {"name":"계피차","reason":"혈관 확장 + 체온 상승 효과, 하체 순환 즉각 개선","category":"음료","emoji":"🍵"},
    {"name":"고추","reason":"캡사이신이 체온을 올리고 지방 연소를 자극","category":"향신료","emoji":"🌶️"},
    {"name":"마늘","reason":"알리신이 혈액 순환 개선, 냉증 근본 원인 해소","category":"채소","emoji":"🧄"},
    {"name":"당근","reason":"베타카로틴이 혈관 벽을 강화하고 순환 개선","category":"채소","emoji":"🥕"},
    {"name":"견과류","reason":"비타민E + 불포화지방산이 혈관 유연성 개선","category":"견과","emoji":"🌰"}
  ]',
  forbidden_foods_json = '[
    {"name":"차가운 음료·아이스","reason":"혈관 수축 → 하체 혈류 즉각 감소 → 셀룰라이트 악화","emoji":"🧊"},
    {"name":"생맥주·아이스 음료","reason":"체온 저하 = 이 체형의 가장 큰 적","emoji":"🍺"},
    {"name":"과도한 생채소","reason":"차가운 성질의 음식이 체온을 낮춤 (적당량은 OK)","emoji":"🥗"},
    {"name":"정제 소금","reason":"나트륨 과다 = 하체 림프 정체 직접 유발","emoji":"🧂"},
    {"name":"포화지방 과다","reason":"혈관벽에 쌓여 하체 미세혈관 순환 방해","emoji":"🥓"}
  ]',
  supplement_list_json = '[
    {"name":"비타민C 1000mg + 콜라겐","timing":"식후","reason":"혈관벽 강화, 셀룰라이트 개선"},
    {"name":"루틴 500mg","timing":"식후","reason":"모세혈관 강화, 하체 부종 감소"},
    {"name":"코엔자임Q10 200mg","timing":"식후","reason":"하체 세포 에너지 대사 활성화"}
  ]'
WHERE bc_code = 'BC-06';

-- BC-07 · 마른비만형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"닭가슴살","reason":"순수 단백질로 근육 합성 극대화, 마른비만 탈출의 핵심","category":"단백질","emoji":"🍗"},
    {"name":"그릭요거트","reason":"단백질 20g + 프로바이오틱스, 근육 회복 + 장 건강 동시","category":"유제품","emoji":"🫙"},
    {"name":"퀴노아","reason":"완전 단백질 + 복합탄수화물, 근육 성장에 최적","category":"탄수화물","emoji":"🌾"},
    {"name":"달걀(전란)","reason":"근육 합성에 가장 효율적인 단백질 + 지질 조합","category":"단백질","emoji":"🥚"},
    {"name":"고등어","reason":"오메가3 + 단백질로 근육 합성 + 체지방 감소 동시","category":"단백질","emoji":"🐟"},
    {"name":"아몬드","reason":"칼로리 밀도 높은 건강 지방으로 기초대사량 향상","category":"견과","emoji":"🌰"}
  ]',
  forbidden_foods_json = '[
    {"name":"극저칼로리 식단","reason":"근육부터 빠지는 이 체형에서 가장 위험한 선택","emoji":"🚫"},
    {"name":"알코올","reason":"근육 단백질 합성을 직접 억제","emoji":"🍻"},
    {"name":"가공 단백질바","reason":"인공 성분이 실제 근육 합성을 방해","emoji":"🍫"},
    {"name":"고당분 음료","reason":"근육 대신 체지방만 증가시키는 최악의 조합","emoji":"🧃"},
    {"name":"저지방 식품","reason":"지방이 없으면 지용성 비타민 흡수 불가 = 대사 저하","emoji":"📉"}
  ]',
  supplement_list_json = '[
    {"name":"유청단백질(WPI) 30g","timing":"운동 직후","reason":"근육 합성 골든타임 공략"},
    {"name":"크레아틴 5g","timing":"운동 전후","reason":"근육 에너지 공급, 마른비만 탈출 가속"},
    {"name":"비타민D3 2000IU","timing":"식후","reason":"근육 수축 기능 향상, 지방 대사 활성화"}
  ]'
WHERE bc_code = 'BC-07';

-- BC-08 · 대사정체형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"귀리","reason":"베타글루칸이 정체된 대사를 재가동하고 장 환경 개선","category":"탄수화물","emoji":"🌾"},
    {"name":"브로콜리 새싹","reason":"설포라판이 미토콘드리아 기능을 회복하고 대사 재점화","category":"채소","emoji":"🥦"},
    {"name":"발효 된장","reason":"장내 환경 개선 → 대사 효소 활성화","category":"발효식품","emoji":"🫙"},
    {"name":"고등어","reason":"오메가3가 정체된 지방 분해 경로를 재활성화","category":"단백질","emoji":"🐟"},
    {"name":"아몬드","reason":"비타민E + 불포화지방산으로 대사 효소 생성 촉진","category":"견과","emoji":"🌰"},
    {"name":"녹색잎채소(시금치·케일)","reason":"마그네슘이 300여 가지 대사 효소의 보조 인자","category":"채소","emoji":"🥬"}
  ]',
  forbidden_foods_json = '[
    {"name":"극단적 칼로리 제한","reason":"이미 낮아진 기초대사량을 더 낮추는 악순환","emoji":"🚫"},
    {"name":"인스턴트 가공식품","reason":"트랜스지방이 대사 효소를 직접 억제","emoji":"🍜"},
    {"name":"알코올","reason":"간의 지방 대사 경로를 차단","emoji":"🍺"},
    {"name":"설탕 음료","reason":"혈당 스파이크 후 대사 정체 심화","emoji":"🥤"},
    {"name":"마가린·쇼트닝","reason":"트랜스지방이 세포막을 손상시켜 대사 효율 저하","emoji":"🧈"}
  ]',
  supplement_list_json = '[
    {"name":"코엔자임Q10 300mg","timing":"식후","reason":"미토콘드리아 기능 회복, 대사 재점화"},
    {"name":"L-카르니틴 2000mg","timing":"운동 전","reason":"지방을 미토콘드리아로 운반, 정체된 지방 연소"},
    {"name":"비타민B 컴플렉스","timing":"아침 식후","reason":"탄단지 대사 효소의 필수 보조 인자"}
  ]'
WHERE bc_code = 'BC-08';

-- BC-09 · 코르티솔형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"다크초콜릿 (카카오 85%+)","reason":"마그네슘 풍부, 코르티솔 수치를 자연스럽게 낮추는 효과","category":"간식","emoji":"🍫"},
    {"name":"아보카도","reason":"칼륨 + 건강한 지방으로 부신 기능 회복 지원","category":"지방","emoji":"🥑"},
    {"name":"귀리죽","reason":"세로토닌 전구체 트립토판 포함, 야간 코르티솔 진정","category":"탄수화물","emoji":"🥣"},
    {"name":"시금치","reason":"마그네슘 최고 함량, 스트레스 호르몬 생성 억제","category":"채소","emoji":"🥬"},
    {"name":"블루베리","reason":"항산화 플라보노이드가 코르티솔 과잉 반응 완화","category":"과일","emoji":"🫐"},
    {"name":"연어","reason":"오메가3가 코르티솔 수용체 민감도를 낮춰 반응 완화","category":"단백질","emoji":"🐟"}
  ]',
  forbidden_foods_json = '[
    {"name":"에너지드링크","reason":"카페인 과다 → 코르티솔 즉각 상승 → 복부 지방 저장","emoji":"⚡"},
    {"name":"커피 3잔 이상","reason":"카페인이 코르티솔 분비를 직접 자극","emoji":"☕"},
    {"name":"야식·밤 탄수화물","reason":"야간 인슐린 + 코르티솔 동시 상승 = 내장지방 최대 생성","emoji":"🌙"},
    {"name":"주류","reason":"수면의 질 저하 → 코르티솔 다음날 상승 → 악순환","emoji":"🍺"},
    {"name":"초가공 스낵","reason":"혈당 롤러코스터 → 코르티솔 반응 반복 자극","emoji":"🍟"}
  ]',
  supplement_list_json = '[
    {"name":"마그네슘 글리시네이트 300mg","timing":"취침 전","reason":"코르티솔 15~20% 자연 감소, 수면 질 향상"},
    {"name":"아시와간다(아슈와간다) 600mg","timing":"저녁 식후","reason":"코르티솔 수치 직접 감소, 부신 피로 회복"},
    {"name":"L-테아닌 200mg","timing":"스트레스 시 또는 저녁","reason":"GABA 유사 효과로 코르티솔 급등 완화"}
  ]'
WHERE bc_code = 'BC-09';

-- BC-10 · 요요반복형 ─────────────────────────────────────────────
UPDATE bc_prescriptions SET
  recommended_foods_json = '[
    {"name":"김치·된장","reason":"유산균으로 손상된 장내 환경 회복, 요요 방지의 근본","category":"발효식품","emoji":"🥬"},
    {"name":"고구마","reason":"레지스턴트 스타치가 장내 유익균의 먹이 역할","category":"탄수화물","emoji":"🍠"},
    {"name":"사과(껍질째)","reason":"펙틴 식이섬유가 장벽을 복구하고 유익균 증식","category":"과일","emoji":"🍎"},
    {"name":"연어","reason":"오메가3가 장 염증 감소, 마이크로바이옴 다양성 증가","category":"단백질","emoji":"🐟"},
    {"name":"아몬드","reason":"프리바이오틱 효과로 장내 유익균 증식 지원","category":"견과","emoji":"🌰"},
    {"name":"귀리","reason":"베타글루칸 식이섬유가 요요 방지 핵심인 장 건강 회복","category":"탄수화물","emoji":"🌾"}
  ]',
  forbidden_foods_json = '[
    {"name":"항생제 포함 식품","reason":"장내 유익균을 파괴해 요요 패턴 직접 심화","emoji":"💊"},
    {"name":"인공감미료","reason":"장내 유해균 증가, 장 환경 파괴","emoji":"🍬"},
    {"name":"알코올","reason":"장벽 투과성 증가, 요요의 주요 원인","emoji":"🍺"},
    {"name":"초가공식품","reason":"장내 다양성 감소, 요요 저항성 약화","emoji":"🍟"},
    {"name":"잦은 단식·클렌즈","reason":"장 환경이 회복 안 된 상태에서 반복 시 요요 심화","emoji":"🚫"}
  ]',
  supplement_list_json = '[
    {"name":"프로바이오틱스 100억CFU (다균주)","timing":"공복 또는 식전","reason":"장내 유익균 집락 회복, 요요 방지 핵심"},
    {"name":"프리바이오틱스(이눌린) 5g","timing":"저녁 식후","reason":"유익균의 먹이 공급, 장 환경 지속 개선"},
    {"name":"L-글루타민 5g","timing":"공복","reason":"장벽 복구, 음식 흡수율 정상화"}
  ]'
WHERE bc_code = 'BC-10';
