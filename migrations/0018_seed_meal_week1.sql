-- ══════════════════════════════════════════════════
--  0018: BC-01~BC-10 sample_meal_week1_json 데이터 추가
--  각 BC 코드별 맞춤 1주차 샘플 식단 (월~금 5일치)
--  2026-06-08
-- ══════════════════════════════════════════════════

-- BC-01: 내장지방형 - 저GI, 식이섬유, 식사 순서 조절
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"달걀 2개 스크램블 + 방울토마토","lunch":"잡곡밥 소량 + 된장찌개(두부) + 나물 3종","dinner":"고등어구이 + 미역국 + 잡곡밥 소량"},
  {"day":"화","breakfast":"무가당 그릭요거트 + 견과류","lunch":"현미밥 + 닭가슴살볶음 + 채소샐러드","dinner":"두부조림 + 시금치된장국 + 잡곡밥"},
  {"day":"수","breakfast":"삶은달걀 2개 + 오이","lunch":"쌈밥(상추·깻잎) + 된장 + 불고기 소량","dinner":"갈치조림 + 콩나물국 + 현미밥"},
  {"day":"목","breakfast":"오트밀 + 블루베리","lunch":"비빔밥(나물 위주, 밥 반공기) + 된장국","dinner":"닭가슴살찜 + 버섯볶음 + 잡곡밥 소량"},
  {"day":"금","breakfast":"달걀후라이 + 채소볶음","lunch":"잡곡밥 + 청국장 + 구운두부","dinner":"연어구이 + 브로콜리 + 잡곡밥"}
]' WHERE bc_code = 'BC-01';

-- BC-02: 복부비만형 - 간 해독, 항염, 강황
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"따뜻한 레몬물 + 달걀 2개 + 채소","lunch":"현미밥 + 닭가슴살 + 강황나물","dinner":"연어구이 + 브로콜리찜 + 잡곡밥 소량"},
  {"day":"화","breakfast":"그릭요거트 + 아마씨 1스푼","lunch":"쌈밥 + 불고기 소량 + 된장국","dinner":"두부찌개 + 나물 2종 + 현미밥"},
  {"day":"수","breakfast":"오트밀 + 강황 1/4티스푼 + 견과류","lunch":"비빔밥(나물 위주) + 미역국","dinner":"고등어구이 + 시금치볶음 + 잡곡밥"},
  {"day":"목","breakfast":"달걀스크램블 + 아보카도 1/4개","lunch":"잡곡밥 + 청국장 + 야채볶음","dinner":"닭가슴살구이 + 새우볶음 + 현미밥"},
  {"day":"금","breakfast":"따뜻한 생강차 + 통밀빵 + 달걀","lunch":"샐러드(닭가슴살) + 현미밥 소량","dinner":"갈치조림 + 무나물 + 잡곡밥"}
]' WHERE bc_code = 'BC-02';

-- BC-03: 상체비대형 - 림프 순환, 저염, 수분 보충
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"따뜻한 물 500ml 공복 + 달걀 2개","lunch":"현미밥 소량 + 닭가슴살 + 저염나물","dinner":"흰살생선찜 + 시금치 + 잡곡밥"},
  {"day":"화","breakfast":"오트밀(무가당) + 블루베리","lunch":"쌈밥(저염장) + 두부구이 + 미역국","dinner":"닭가슴살샐러드 + 견과류 + 현미밥 소량"},
  {"day":"수","breakfast":"그릭요거트 + 아마씨","lunch":"비빔밥(나물, 고추장 소량) + 된장국","dinner":"연어구이 + 아스파라거스 + 잡곡밥"},
  {"day":"목","breakfast":"달걀스크램블 + 오이슬라이스","lunch":"잡곡밥 + 청국장(저염) + 콩나물","dinner":"고등어구이 + 무나물 + 현미밥 소량"},
  {"day":"금","breakfast":"따뜻한 보리차 + 달걀 + 채소","lunch":"채소쌈 + 된장 소량 + 두부","dinner":"흰살생선구이 + 브로콜리찜 + 잡곡밥"}
]' WHERE bc_code = 'BC-03';

-- BC-04: 복압형 - 저FODMAP, 가스·팽만 최소화
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"달걀 2개 + 쌀밥 소량(흰쌀)","lunch":"흰쌀밥 소량 + 닭가슴살구이 + 호박나물","dinner":"연어구이 + 당근볶음 + 흰쌀밥"},
  {"day":"화","breakfast":"쌀오트밀 + 딸기(적량)","lunch":"닭가슴살볶음 + 주키니호박 + 흰쌀밥","dinner":"흰살생선찜 + 감자(삶은) + 흰쌀밥 소량"},
  {"day":"수","breakfast":"달걀스크램블 + 시금치(소량)","lunch":"쌈밥(상추) + 닭가슴살 + 된장 소량","dinner":"고등어구이 + 당근·주키니 + 흰쌀밥"},
  {"day":"목","breakfast":"달걀 2개 + 오이(껍질 제거)","lunch":"흰쌀밥 + 두부구이 + 호박나물","dinner":"닭안심찜 + 당근나물 + 흰쌀밥"},
  {"day":"금","breakfast":"쌀오트밀 + 블루베리","lunch":"닭가슴살샐러드(드레싱 올리브오일+소금만)","dinner":"흰살생선구이 + 삶은감자 + 흰쌀밥 소량"}
]' WHERE bc_code = 'BC-04';

-- BC-05: 하체지방형 - 에스트로겐 대사, 두부·콩 제한
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"달걀 2개 + 채소볶음","lunch":"현미밥 + 닭가슴살구이 + 브로콜리","dinner":"고등어구이 + 나물 2종 + 잡곡밥 소량"},
  {"day":"화","breakfast":"그릭요거트(무가당) + 견과류","lunch":"쌈밥(두부 제외) + 불고기 소량 + 미역국","dinner":"닭안심구이 + 아스파라거스 + 현미밥"},
  {"day":"수","breakfast":"오트밀(두유 말고 물로) + 블루베리","lunch":"비빔밥(나물, 고추장 소량) + 된장국","dinner":"연어구이 + 브로콜리 + 잡곡밥"},
  {"day":"목","breakfast":"달걀스크램블 + 시금치볶음","lunch":"잡곡밥 + 청국장(두부 빼고) + 나물","dinner":"흰살생선찜 + 당근나물 + 현미밥 소량"},
  {"day":"금","breakfast":"달걀 2개 + 아보카도 1/4","lunch":"닭가슴살샐러드 + 현미밥 소량","dinner":"고등어구이 + 무나물 + 잡곡밥"}
]' WHERE bc_code = 'BC-05';

-- BC-06: 냉증셀룰라이트형 - 체온 상승, 따뜻한 음식
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"따뜻한 오트밀 + 삶은달걀 1개","lunch":"잡곡밥 소량 + 두부된장국 + 나물","dinner":"생선구이 + 브로콜리찜 + 잡곡밥 소량"},
  {"day":"화","breakfast":"귀리죽 + 견과류","lunch":"닭가슴살 샐러드 + 현미밥","dinner":"돼지 앞다리 수육 + 채소"},
  {"day":"수","breakfast":"따뜻한 두유 + 통밀빵","lunch":"연어샐러드 + 잡곡밥","dinner":"청국장 + 나물 + 잡곡밥"},
  {"day":"목","breakfast":"달걀스크램블 + 채소볶음","lunch":"비빔밥(나물 위주) 소량","dinner":"닭가슴살구이 + 버섯볶음"},
  {"day":"금","breakfast":"따뜻한 오트밀 + 베리류","lunch":"잡곡밥 + 된장찌개 + 구운두부","dinner":"갈치조림 + 시금치나물 + 잡곡밥"}
]' WHERE bc_code = 'BC-06';

-- BC-07: 마른비만형 - 근육 단백질 강화, 고단백 저탄수
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"달걀 3개 스크램블 + 아보카도 1/2","lunch":"닭가슴살 150g + 현미밥 + 채소","dinner":"소고기 안심구이 80g + 잡곡밥 소량"},
  {"day":"화","breakfast":"그릭요거트 200g + 견과류 + 단백질파우더","lunch":"연어구이 + 샐러드 + 현미밥","dinner":"닭안심찜 + 브로콜리 + 잡곡밥"},
  {"day":"수","breakfast":"달걀 3개 + 닭가슴살 50g","lunch":"비빔밥(단백질 추가) + 된장국","dinner":"고등어구이 + 두부조림 + 현미밥"},
  {"day":"목","breakfast":"오트밀 + 단백질파우더 + 견과류","lunch":"쌈밥 + 불고기(소고기) + 미역국","dinner":"새우볶음 + 나물 + 잡곡밥"},
  {"day":"금","breakfast":"달걀 2개 + 그릭요거트","lunch":"닭가슴살샐러드 + 현미밥","dinner":"연어구이 + 버섯볶음 + 잡곡밥"}
]' WHERE bc_code = 'BC-07';

-- BC-08: 대사정체형 - 간헐적 단식 유도, 대사 활성화
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"공복 유지 or 달걀 2개(12시 이후)","lunch":"현미밥 소량 + 닭가슴살 + 나물","dinner":"고등어구이 + 시금치볶음 + 잡곡밥"},
  {"day":"화","breakfast":"블랙커피 or 차(무가당)","lunch":"비빔밥(나물 위주) + 된장국","dinner":"닭안심찜 + 버섯볶음 + 현미밥 소량"},
  {"day":"수","breakfast":"공복 유지 or 견과류 소량","lunch":"쌈밥 + 두부구이 + 미역국","dinner":"연어구이 + 브로콜리 + 잡곡밥"},
  {"day":"목","breakfast":"달걀 2개(간헐적 단식 후 첫 식사)","lunch":"잡곡밥 + 청국장 + 나물","dinner":"갈치조림 + 무나물 + 현미밥"},
  {"day":"금","breakfast":"공복 유지 or 그릭요거트","lunch":"닭가슴살샐러드 + 현미밥","dinner":"고등어구이 + 채소볶음 + 잡곡밥"}
]' WHERE bc_code = 'BC-08';

-- BC-09: 코르티솔형 - 혈당 안정, 마그네슘, 스트레스 식품 조절
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"달걀 2개 + 귀리(혈당 완만)","lunch":"현미밥 + 닭가슴살 + 채소","dinner":"연어구이 + 아스파라거스 + 잡곡밥"},
  {"day":"화","breakfast":"그릭요거트 + 바나나(小)","lunch":"쌈밥 + 두부구이 + 된장국","dinner":"고등어구이 + 시금치볶음 + 현미밥"},
  {"day":"수","breakfast":"오트밀 + 견과류 + 달걀","lunch":"비빔밥(나물) + 미역국","dinner":"닭가슴살구이 + 버섯볶음 + 잡곡밥"},
  {"day":"목","breakfast":"달걀스크램블 + 견과류","lunch":"잡곡밥 + 청국장 + 나물","dinner":"흰살생선찜 + 채소 + 현미밥"},
  {"day":"금","breakfast":"따뜻한 카카오차 + 달걀 2개","lunch":"닭가슴살샐러드 + 현미밥","dinner":"두부조림 + 나물 + 잡곡밥"}
]' WHERE bc_code = 'BC-09';

-- BC-10: 요요반복형 - 장 마이크로바이옴, 발효식품, 천천히 먹기
UPDATE bc_prescriptions SET sample_meal_week1_json = '[
  {"day":"월","breakfast":"김치(소량) + 달걀 2개 + 잡곡밥","lunch":"된장찌개 + 나물 3종 + 현미밥","dinner":"고등어구이 + 콩나물국 + 잡곡밥"},
  {"day":"화","breakfast":"무가당 그릭요거트 + 견과류","lunch":"쌈밥 + 불고기 소량 + 청국장","dinner":"닭가슴살구이 + 김치볶음(기름 少) + 현미밥"},
  {"day":"수","breakfast":"오트밀 + 블루베리","lunch":"비빔밥(나물) + 된장국","dinner":"흰살생선찜 + 시금치나물 + 잡곡밥"},
  {"day":"목","breakfast":"달걀스크램블 + 김치(소량)","lunch":"잡곡밥 + 청국장 + 두부조림","dinner":"연어구이 + 아스파라거스 + 현미밥"},
  {"day":"금","breakfast":"따뜻한 보리차 + 달걀 + 낫토(있으면)","lunch":"닭가슴살샐러드 + 잡곡밥 소량","dinner":"갈치조림 + 나물 2종 + 잡곡밥"}
]' WHERE bc_code = 'BC-10';
