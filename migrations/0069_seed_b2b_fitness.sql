-- ══════════════════════════════════════════════════════════════
--  0069: [피트니스 전용] bc_prescriptions_b2b fitness 시드 (BC-1~BC-16)
--  피트니스 특화 필드: fitness_weekly_plan_json, fitness_hiit_protocol_json,
--                      fitness_zone2_bpm, fitness_center_program_json, fitness_metrics_json
-- ══════════════════════════════════════════════════════════════

INSERT OR REPLACE INTO bc_prescriptions_b2b
  (bc_code, survey_category,
   brand_name, bc_primary_oneline_reason,
   fitness_weekly_plan_json, fitness_hiit_protocol_json,
   fitness_zone2_bpm, fitness_center_program_json, fitness_metrics_json,
   notes)
VALUES

-- ── BC-1: 내장지방형 ────────────────────────────────────────
('BC-1','fitness',
 '내장지방 연소 집중 프로그램',
 '인슐린 저항성으로 복부 내장에 지방이 우선 축적되는 체형',
 '[{"day":"월","workout":"Zone2 유산소 40분 (런닝머신 경사 6도 4.5km/h)","intensity":"저-중강도","notes":"공복 상태 권장"},{"day":"화","workout":"하체+코어 복합 웨이트 50분 (스쿼트·데드리프트·플랭크)","intensity":"중강도","notes":"단백질 섭취 후 1시간 후 진행"},{"day":"수","workout":"Zone2 사이클 45분","intensity":"저-중강도","notes":"심박수 130~145 유지"},{"day":"목","workout":"HIIT 25분 + 코어 20분","intensity":"고강도","notes":"전날 충분한 수면 확인"},{"day":"금","workout":"상체 웨이트 45분 (푸시업·로우·숄더프레스)","intensity":"중강도","notes":""},{"day":"토","workout":"야외 걷기 또는 등산 60분","intensity":"저강도","notes":"NEAT 활동 극대화"},{"day":"일","workout":"스트레칭·폼롤링·요가 30분","intensity":"휴식","notes":"회복 집중"}]',
 '[{"week_start":3,"protocol":"타바타 변형","rounds":6,"work_sec":30,"rest_sec":30,"exercises":["버피","마운틴클라이머","점프스쿼트"],"total_min":25,"notes":"3주차부터 도입 — 처음 2주는 Zone2만 진행"},{"week_start":7,"protocol":"인터벌 런닝","rounds":8,"work_sec":45,"rest_sec":30,"exercises":["트레드밀 스프린트 12km/h","회복 조깅 8km/h"],"total_min":20,"notes":"7주차부터 강도 업그레이드"}]',
 135,
 '[{"program":"복부 집중 PT 8회","description":"PT 트레이너와 1:1로 인슐린 저항 체형 맞춤 복부 운동 설계","frequency":"주 2회","duration_weeks":4},{"program":"체형교정 필라테스 (기구)","description":"코어 심부근 활성화로 복부 압박·자세 교정","frequency":"주 1회","duration_weeks":8},{"program":"영양 코칭 세션","description":"인슐린 저항성 완화를 위한 저GI 식단 설계","frequency":"월 1회","duration_weeks":12}]',
 '[{"metric":"체지방률(%)","target_change":"-3% / 12주","measurement":"InBody 또는 체성분계","timing":"초진·4주·8주·12주"},{"metric":"복부 둘레(cm)","target_change":"-5cm / 12주","measurement":"줄자 측정 (배꼽 위 1cm)","timing":"매 PT 세션"},{"metric":"공복혈당(mg/dL)","target_change":"100 이하 유지","measurement":"자가 혈당 측정기","timing":"주 2회 아침 공복"},{"metric":"VO2max 추정","target_change":"+3 ml/kg/min / 12주","measurement":"사이클 에르고미터 테스트","timing":"초진·12주"}]',
 'fitness BC-1 seed v1.0'),

-- ── BC-2: 피하지방형 ────────────────────────────────────────
('BC-2','fitness',
 '피하지방 분해 전신 프로그램',
 '복부 표층 피하지방이 과잉 축적된 체형',
 '[{"day":"월","workout":"전신 서킷 트레이닝 45분 (스쿼트→푸시업→런지→로우 4서킷)","intensity":"중강도","notes":"세트 간 휴식 45초"},{"day":"화","workout":"Zone2 수영 또는 자전거 40분","intensity":"저-중강도","notes":"관절 부담 최소화"},{"day":"수","workout":"하체 저항 운동 50분 (레그프레스·레그컬·카프레이즈)","intensity":"중강도","notes":""},{"day":"목","workout":"HIIT 20분 + 전신 스트레칭 20분","intensity":"고강도","notes":"4주차부터 도입"},{"day":"금","workout":"상체 근력 + 코어 50분","intensity":"중강도","notes":""},{"day":"토","workout":"장거리 걷기 90분 또는 하이킹","intensity":"저강도","notes":"NEAT 극대화"},{"day":"일","workout":"능동적 회복 (요가·스트레칭)","intensity":"휴식","notes":""}]',
 '[{"week_start":4,"protocol":"AMRAP 서킷","rounds":4,"work_sec":40,"rest_sec":20,"exercises":["스쿼트점프","푸시업","버피","하이니","플랭크"],"total_min":20,"notes":"체지방 연소 극대화 서킷"},{"week_start":8,"protocol":"20-10 타바타","rounds":8,"work_sec":20,"rest_sec":10,"exercises":["케틀벨스윙","박스점프"],"total_min":16,"notes":"8주차부터 도구 활용"}]',
 130,
 '[{"program":"전신 지방연소 PT 8회","description":"저항 운동 + 유산소 복합 체지방 감량 특화 PT","frequency":"주 2회","duration_weeks":4},{"program":"배드민턴·줄넘기 그룹 클래스","description":"지속적 칼로리 소모 + 재미 요소로 운동 습관 형성","frequency":"주 2회","duration_weeks":8},{"program":"체형 분석 재측정","description":"체지방률 변화 추적 및 프로그램 조정","frequency":"4주 1회","duration_weeks":12}]',
 '[{"metric":"체지방률(%)","target_change":"-4% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"피하지방 두께","target_change":"-2cm / 12주","measurement":"캘리퍼 복부·허벅지·상완","timing":"초진·4주·8주·12주"},{"metric":"허리 둘레","target_change":"-5cm / 12주","measurement":"줄자","timing":"매 2주"},{"metric":"TDEE 소모 칼로리","target_change":"일일 2000kcal 이상","measurement":"활동량 추적기(갤럭시워치·애플워치)","timing":"매일"}]',
 'fitness BC-2 seed v1.0'),

-- ── BC-3: 복부+상체 복합형 ──────────────────────────────────
('BC-3','fitness',
 '복부·상체 집중 리쉐이핑 프로그램',
 '복부와 상체에 복합적으로 지방이 축적된 체형',
 '[{"day":"월","workout":"상체 저항 + 코어 55분 (로우·풀다운·케이블플라이·플랭크변형)","intensity":"중강도","notes":"상체 근육 발달로 기초대사 향상"},{"day":"화","workout":"Zone2 런닝 또는 자전거 40분","intensity":"저-중강도","notes":"심박수 125~140"},{"day":"수","workout":"코어 집중 서킷 40분 + 전신 스트레칭","intensity":"중강도","notes":"복부 드로인 호흡 연습 포함"},{"day":"목","workout":"복합 HIIT 25분 (상체+코어 중심)","intensity":"고강도","notes":"6주차부터 도입"},{"day":"금","workout":"하체 경량 + 전신 유산소 50분","intensity":"중강도","notes":"하체도 균형 유지"},{"day":"토","workout":"수영 또는 아쿠아 에어로빅 60분","intensity":"중강도","notes":"상체·코어 부하 분산"},{"day":"일","workout":"폼롤링 + 유연성 운동 30분","intensity":"휴식","notes":""}]',
 '[{"week_start":6,"protocol":"상체+코어 인터벌","rounds":5,"work_sec":40,"rest_sec":20,"exercises":["메디신볼슬램","버피","마운틴클라이머","케이블우드찹","배트윙로우"],"total_min":25,"notes":"복부 상체 동시 자극 극대화"},{"week_start":10,"protocol":"피라미드 인터벌","rounds":5,"work_sec":[20,30,40,30,20],"rest_sec":20,"exercises":["점프버피","푸시업","하이니"],"total_min":18,"notes":"강도 가변형 고강도"}]',
 132,
 '[{"program":"코어·상체 특화 PT 10회","description":"복부+상체 균형 발달 맞춤 저항 운동 설계","frequency":"주 2회","duration_weeks":5},{"program":"필라테스 기구 (상체·코어)","description":"심부 코어 활성화 + 자세 교정","frequency":"주 1회","duration_weeks":10},{"program":"식단 보조 코칭","description":"상체 지방 연소 위한 단백질 섭취 전략","frequency":"월 2회","duration_weeks":12}]',
 '[{"metric":"복부 둘레(cm)","target_change":"-5cm / 12주","measurement":"줄자","timing":"매 2주"},{"metric":"상완 둘레(cm)","target_change":"-2cm / 12주","measurement":"줄자 팔뚝 최대 둘레","timing":"매 4주"},{"metric":"체지방률","target_change":"-3.5% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"1분 푸시업 횟수","target_change":"+10회 / 12주","measurement":"직접 테스트","timing":"초진·6주·12주"}]',
 'fitness BC-3 seed v1.0'),

-- ── BC-4: 하체 집중형 ───────────────────────────────────────
('BC-4','fitness',
 '하체 리쉐이핑 전문 프로그램',
 '에스트로겐 과잉으로 하체 피하지방 수용체가 활성화된 체형',
 '[{"day":"월","workout":"하체 저항 고반복 60분 (레그프레스 고반복·스모스쿼트·힙어브덕션·카프레이즈)","intensity":"중강도","notes":"고중량 저반복 금지 — 근육 비대 유발 가능"},{"day":"화","workout":"Zone2 빠른 걷기 또는 자전거 50분","intensity":"저-중강도","notes":"경사 없는 저충격 유산소"},{"day":"수","workout":"하체 유연성·스트레칭 + 코어 40분","intensity":"낮음","notes":"하체 근막 이완 집중"},{"day":"목","workout":"수영 또는 아쿠아 조깅 50분","intensity":"중강도","notes":"하체 림프 순환 촉진"},{"day":"금","workout":"상체 근력 50분 + 하체 가벼운 런지","intensity":"중강도","notes":"상하체 균형 유지"},{"day":"토","workout":"하이킹 또는 언덕 걷기 90분","intensity":"저-중강도","notes":"하체 유산소 + NEAT"},{"day":"일","workout":"요가 플로우·스트레칭 40분","intensity":"휴식","notes":""}]',
 '[{"week_start":5,"protocol":"하체 HIIT (저충격)","rounds":6,"work_sec":35,"rest_sec":25,"exercises":["스텝업","사이드런지","힙쓰러스트","점프프리스쿼트"],"total_min":22,"notes":"점프 동작 최소화 — 림프 과자극 방지"},{"week_start":9,"protocol":"저강도 연속 인터벌","rounds":8,"work_sec":45,"rest_sec":15,"exercises":["리버스런지","사이드스텝","클램쉘"],"total_min":20,"notes":"고강도 대신 지속 저강도로 지방연소 지속"}]',
 128,
 '[{"program":"하체 전문 PT 8회","description":"고반복·저중량 하체 리쉐이핑 맞춤 설계","frequency":"주 2회","duration_weeks":4},{"program":"발레 핏 또는 바레 클래스","description":"하체 길이감 + 유연성 개선 특화","frequency":"주 2회","duration_weeks":8},{"program":"림프 순환 촉진 스트레칭 세션","description":"에스트로겐 체형 림프 정체 해소","frequency":"주 1회","duration_weeks":12}]',
 '[{"metric":"허벅지 둘레(cm)","target_change":"-3cm / 12주","measurement":"줄자 허벅지 최대 둘레","timing":"매 2주"},{"metric":"종아리 둘레(cm)","target_change":"-1.5cm / 12주","measurement":"줄자","timing":"매 4주"},{"metric":"하체 체지방률","target_change":"-3% / 12주","measurement":"InBody 분절 분석","timing":"초진·4주·8주·12주"},{"metric":"힙어브덕션 강도(kg)","target_change":"+10kg / 12주","measurement":"머신 기록","timing":"매 4주"}]',
 'fitness BC-4 seed v1.0'),

-- ── BC-5: 상체 집중형 ───────────────────────────────────────
('BC-5','fitness',
 '상체·팔뚝 감량 특화 프로그램',
 '상반신 전체에 지방이 집중된 체형',
 '[{"day":"월","workout":"상체 고반복 저중량 60분 (케이블로우·풀다운·플라이·숄더프레스)","intensity":"중강도","notes":"근비대 최소화, 근선명도 위주"},{"day":"화","workout":"Zone2 사이클 또는 엘립티컬 45분","intensity":"저-중강도","notes":""},{"day":"수","workout":"팔뚝·등 집중 슈퍼세트 50분","intensity":"중강도","notes":"트라이셉스+바이셉스 슈퍼세트"},{"day":"목","workout":"상체 HIIT 20분 + 전신 스트레칭 20분","intensity":"고강도","notes":"5주차부터 도입"},{"day":"금","workout":"하체 근력 50분 (균형 유지) + 코어","intensity":"중강도","notes":""},{"day":"토","workout":"자전거 투어 또는 수영 60분","intensity":"중강도","notes":""},{"day":"일","workout":"능동적 회복·폼롤링","intensity":"휴식","notes":""}]',
 '[{"week_start":5,"protocol":"상체 슈퍼세트 인터벌","rounds":5,"work_sec":40,"rest_sec":20,"exercises":["케이블 로우","트라이셉스딥","메디신볼체스트패스","배트윙"],"total_min":22,"notes":"상체 지방연소+근육 선명도"},{"week_start":9,"protocol":"복합 상체 인터벌","rounds":6,"work_sec":35,"rest_sec":25,"exercises":["버피","마운틴클라이머","덤벨스윙"],"total_min":20,"notes":"전신 동원으로 상체 지방연소 극대화"}]',
 130,
 '[{"program":"상체 집중 PT 8회","description":"팔뚝·등·어깨 라인 맞춤 근선명도 향상 프로그램","frequency":"주 2회","duration_weeks":4},{"program":"권투·복싱 핏 클래스","description":"상체 전방위 지방연소 + 유산소 동시 효과","frequency":"주 2회","duration_weeks":8},{"program":"스트레칭·폼롤링 세션","description":"상체 근막 이완·자세 교정","frequency":"주 1회","duration_weeks":12}]',
 '[{"metric":"팔뚝 둘레(cm)","target_change":"-2cm / 12주","measurement":"줄자 최대 둘레","timing":"매 4주"},{"metric":"등·겨드랑이 둘레(cm)","target_change":"-3cm / 12주","measurement":"줄자 흉곽 최대","timing":"매 4주"},{"metric":"상체 체지방(%)","target_change":"-3% / 12주","measurement":"InBody 분절","timing":"초진·4주·8주·12주"},{"metric":"풀업 또는 어시스트 풀업 수","target_change":"+5회 / 12주","measurement":"직접 테스트","timing":"초진·6주·12주"}]',
 'fitness BC-5 seed v1.0'),

-- ── BC-6: 림프순환 냉증형 ────────────────────────────────────
('BC-6','fitness',
 '순환·온열 활성화 운동 프로그램',
 '림프 순환 저하로 셀룰라이트와 냉증이 동반된 체형',
 '[{"day":"월","workout":"수영 또는 아쿠아 에어로빅 50분","intensity":"저-중강도","notes":"수온 28~30℃ 권장 — 온수 자극으로 림프 활성화"},{"day":"화","workout":"Zone2 빠른 걷기 45분 (경사 5도)","intensity":"저강도","notes":"발이 차가운 경우 두꺼운 양말 착용"},{"day":"수","workout":"하체 고반복 저중량 + 스트레칭 50분","intensity":"중강도","notes":"종아리·발목 위주 혈류 자극"},{"day":"목","workout":"사이클 Zone2 40분 + 온열 스트레칭","intensity":"저-중강도","notes":""},{"day":"금","workout":"전신 림프 활성화 요가 60분","intensity":"낮음","notes":"역전 자세·다리 올리기 포함"},{"day":"토","workout":"하이킹 또는 맨발 걷기 (잔디) 90분","intensity":"저강도","notes":"말초 신경 자극으로 순환 개선"},{"day":"일","workout":"온탕·냉탕 교대 + 스트레칭 30분","intensity":"휴식","notes":"냉온 교대로 혈관 운동 촉진"}]',
 '[{"week_start":6,"protocol":"저충격 순환 HIIT","rounds":5,"work_sec":30,"rest_sec":30,"exercises":["스텝업","사이드킥","암서클","무릎올리기행진"],"total_min":18,"notes":"충격 없는 저강도로 림프 자극만"},{"week_start":10,"protocol":"아쿠아 인터벌","rounds":6,"work_sec":40,"rest_sec":20,"exercises":["아쿠아조깅","수중점프","사이드킥"],"total_min":22,"notes":"수압으로 림프 순환 추가 자극"}]',
 125,
 '[{"program":"림프 순환 특화 PT 6회","description":"냉증 체형 하체 순환 개선 맞춤 운동","frequency":"주 1회","duration_weeks":6},{"program":"아쿠아 에어로빅 클래스","description":"수압·온도 활용 림프 순환 극대화","frequency":"주 2회","duration_weeks":10},{"program":"온열 요가 클래스","description":"체온 상승으로 림프·혈류 활성화","frequency":"주 1회","duration_weeks":12}]',
 '[{"metric":"발·손 체표 온도(℃)","target_change":"+1℃ / 12주","measurement":"적외선 체온계 손발 끝","timing":"매 4주"},{"metric":"하체 둘레 (부종 지표)","target_change":"-2cm / 12주","measurement":"줄자 종아리 최대 둘레","timing":"매 2주"},{"metric":"셀룰라이트 등급","target_change":"1등급 개선 / 12주","measurement":"Nurnberger-Muller 스케일","timing":"초진·12주"},{"metric":"VO2max 추정","target_change":"+2 ml/kg/min / 12주","measurement":"6분 걷기 테스트","timing":"초진·12주"}]',
 'fitness BC-6 seed v1.0'),

-- ── BC-7: 저근육 체지방형 ────────────────────────────────────
('BC-7','fitness',
 '근육 증량 + 지방 감량 이중 목표 프로그램',
 '근육량 부족 + 체지방 과잉의 마른 비만 체형',
 '[{"day":"월","workout":"하체 근력 (중고중량) 60분 (바벨스쿼트·루마니안데드·레그프레스·힙쓰러스트)","intensity":"중-고강도","notes":"근성장이 최우선 — 충분한 단백질 식전 섭취"},{"day":"화","workout":"Zone2 사이클 30분 (짧게 — 근분해 방지)","intensity":"저강도","notes":"유산소는 최소화"},{"day":"수","workout":"상체 근력 60분 (벤치프레스·바벨로우·오버헤드프레스·딥스)","intensity":"중-고강도","notes":""},{"day":"목","workout":"완전 휴식 또는 능동 회복 (걷기 20분)","intensity":"휴식","notes":"근육 회복 최우선"},{"day":"금","workout":"전신 복합 운동 60분 (데드리프트·클린앤프레스·풀업)","intensity":"중-고강도","notes":""},{"day":"토","workout":"Zone2 걷기 40분 + 코어·유연성","intensity":"저강도","notes":""},{"day":"일","workout":"완전 휴식","intensity":"휴식","notes":""}]',
 '[{"week_start":8,"protocol":"짧은 고강도 인터벌 (근 손실 최소화)","rounds":4,"work_sec":20,"rest_sec":40,"exercises":["케틀벨스윙","박스점프","배틀로프"],"total_min":12,"notes":"8주차 이후 근육 기반 충분 시 도입 — 초기 8주는 근력 위주"},{"week_start":10,"protocol":"복합 근지구력 서킷","rounds":3,"work_sec":50,"rest_sec":30,"exercises":["스쿼트","풀업","딥스","런지"],"total_min":20,"notes":"근육 유지하며 체지방 연소"}]',
 128,
 '[{"program":"마른비만 전용 PT 12회","description":"근증량 우선 + 체지방 동시 감량 맞춤 설계","frequency":"주 3회","duration_weeks":4},{"program":"영양·식단 코칭 (단백질 섭취 타이밍)","description":"근합성 극대화를 위한 단백질 타이밍·양 설계","frequency":"주 1회","duration_weeks":8},{"program":"근기능 평가 세션","description":"좌우 근력 불균형·약점 근육군 파악","frequency":"4주 1회","duration_weeks":12}]',
 '[{"metric":"골격근량(kg)","target_change":"+2kg / 12주","measurement":"InBody 골격근량","timing":"초진·4주·8주·12주"},{"metric":"체지방률(%)","target_change":"-2% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"1RM 스쿼트 또는 데드리프트(kg)","target_change":"+15kg / 12주","measurement":"1RM 테스트","timing":"초진·6주·12주"},{"metric":"기초대사량(kcal)","target_change":"+100kcal / 12주","measurement":"InBody BMR 항목","timing":"초진·12주"}]',
 'fitness BC-7 seed v1.0'),

-- ── BC-8: 기초대사 저하형 ───────────────────────────────────
('BC-8','fitness',
 '대사 재점화 저항+유산소 복합 프로그램',
 '기초대사량 저하로 전신 체지방이 축적되는 체형',
 '[{"day":"월","workout":"전신 저항 서킷 50분 (스쿼트·풀업·데드리프트·벤치·코어 5종 3서킷)","intensity":"중강도","notes":"세트 간 휴식 60초 — 운동 후 대사량 상승 효과"},{"day":"화","workout":"Zone2 런닝 35분","intensity":"저-중강도","notes":"심박수 120~135"},{"day":"수","workout":"하체 근력 + NEAT 활동 권장","intensity":"중강도","notes":"엘리베이터 대신 계단, 걷기 목표 8000보"},{"day":"목","workout":"대사 촉진 HIIT 20분 + 스트레칭 20분","intensity":"고강도","notes":"6주차부터 도입"},{"day":"금","workout":"상체 복합 저항 50분","intensity":"중강도","notes":""},{"day":"토","workout":"장거리 걷기·자전거 60~90분","intensity":"저강도","notes":"지방 산화 극대화"},{"day":"일","workout":"완전 휴식 또는 요가 30분","intensity":"휴식","notes":""}]',
 '[{"week_start":6,"protocol":"대사 촉진 타바타","rounds":8,"work_sec":20,"rest_sec":10,"exercises":["점프스쿼트","버피","마운틴클라이머","크로스바디 니드라이브"],"total_min":16,"notes":"EPOC 극대화를 위한 고강도 전신"},{"week_start":10,"protocol":"AMRAPx20분","rounds":1,"work_sec":1200,"rest_sec":0,"exercises":["스쿼트 15회","푸시업 10회","버피 5회 반복"],"total_min":20,"notes":"최대반복으로 대사 총량 자극"}]',
 132,
 '[{"program":"대사 활성화 PT 10회","description":"기초대사 저하 체형 맞춤 복합 저항+유산소 설계","frequency":"주 2~3회","duration_weeks":4},{"program":"HIIT 그룹 클래스 (크로스핏 라이트)","description":"고강도 운동 후 EPOC로 대사 재점화","frequency":"주 2회","duration_weeks":8},{"program":"생활 패턴 NEAT 코칭","description":"운동 외 일상 활동량 증가 전략 수립","frequency":"월 1회","duration_weeks":12}]',
 '[{"metric":"기초대사량(BMR, kcal)","target_change":"+150kcal / 12주","measurement":"InBody BMR","timing":"초진·4주·8주·12주"},{"metric":"체지방률(%)","target_change":"-3% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"일일 활동 칼로리(TDEE)","target_change":"+300kcal 소모 / 12주","measurement":"웨어러블 기기","timing":"매일"},{"metric":"최대산소섭취량 VO2max","target_change":"+3 ml/kg/min","measurement":"에르고미터 테스트","timing":"초진·12주"}]',
 'fitness BC-8 seed v1.0'),

-- ── BC-9: 코르티솔·스트레스형 ────────────────────────────────
('BC-9','fitness',
 '스트레스 해소·부교감 활성화 운동 프로그램',
 '만성 스트레스로 코르티솔이 과잉 분비되어 복부에 지방이 쌓이는 체형',
 '[{"day":"월","workout":"요가 플로우 60분 (해소·이완 중심)","intensity":"낮음","notes":"코르티솔 저하 효과 최우선 — 고강도 금지"},{"day":"화","workout":"Zone2 자연 걷기 또는 공원 조깅 40분","intensity":"저강도","notes":"자연 환경에서 진행 권장"},{"day":"수","workout":"필라테스 또는 기능 스트레칭 50분","intensity":"낮음","notes":"복부 코어 심부근 활성화"},{"day":"목","workout":"수영 40분 (자유형·배영 교대)","intensity":"저-중강도","notes":"호흡 리듬 안정화"},{"day":"금","workout":"Zone2 사이클 40분 + 명상·호흡 20분","intensity":"저강도","notes":"운동 후 5분 복식호흡 의무"},{"day":"토","workout":"하이킹 또는 자연 트레킹 90분","intensity":"저-중강도","notes":"자연 환경 노출로 코르티솔 추가 감소"},{"day":"일","workout":"완전 휴식 + 5분 마음챙김 명상","intensity":"휴식","notes":""}]',
 '[{"week_start":8,"protocol":"저강도 페이스 인터벌 (코르티솔 최소 자극)","rounds":5,"work_sec":60,"rest_sec":60,"exercises":["빠른 걷기","보통 걷기"],"total_min":20,"notes":"고강도 절대 금지 — 코르티솔 급등 유발"},{"week_start":10,"protocol":"수중 인터벌","rounds":4,"work_sec":45,"rest_sec":45,"exercises":["자유형 스프린트","배영 회복"],"total_min":18,"notes":"수영은 코르티솔 감소에 최적"}]',
 120,
 '[{"program":"마음챙김 운동 PT 8회","description":"코르티솔 과잉 체형 저강도 운동 + 호흡 훈련 통합","frequency":"주 2회","duration_weeks":4},{"program":"요가 그룹 클래스 (인 클래스)","description":"이완 중심 요가로 부교감 신경 활성화","frequency":"주 3회","duration_weeks":10},{"program":"수면 질 개선 코칭","description":"수면·회복이 코르티솔 감소에 핵심 — 루틴 설계","frequency":"월 1회","duration_weeks":12}]',
 '[{"metric":"코르티솔 수치 (주관 지표)","target_change":"스트레스 점수 30% 감소","measurement":"PSS(지각된 스트레스 척도) 설문","timing":"초진·4주·8주·12주"},{"metric":"복부 둘레","target_change":"-4cm / 12주","measurement":"줄자","timing":"매 4주"},{"metric":"수면 질 점수","target_change":"PSQI 5점 이하 목표","measurement":"수면 질 설문(PSQI)","timing":"초진·4주·8주·12주"},{"metric":"심박변이도(HRV)","target_change":"+10ms / 12주","measurement":"웨어러블 HRV 측정","timing":"매일 아침"}]',
 'fitness BC-9 seed v1.0'),

-- ── BC-10: 갱년기 호르몬형 ──────────────────────────────────
('BC-10','fitness',
 '갱년기 골밀도 보호·호르몬 균형 운동 프로그램',
 '호르몬 불균형·갱년기로 전신 체지방이 증가하는 체형',
 '[{"day":"월","workout":"저중량 고반복 전신 저항 55분 (스쿼트·레그프레스·로우·가벼운 데드)","intensity":"중강도","notes":"골밀도 보호를 위한 저항 운동 필수"},{"day":"화","workout":"수중 유산소·아쿠아로빅 50분","intensity":"저-중강도","notes":"관절 부담 최소화"},{"day":"수","workout":"균형 훈련 + 코어 50분 (싱글레그 운동·TRX·보수볼)","intensity":"중강도","notes":"낙상 예방·고유감각 훈련"},{"day":"목","workout":"완전 휴식 또는 가벼운 요가 30분","intensity":"휴식","notes":"호르몬 회복을 위한 충분한 휴식"},{"day":"금","workout":"걷기 + 경미한 언덕 60분","intensity":"저강도","notes":""},{"day":"토","workout":"수영 또는 필라테스 50분","intensity":"저-중강도","notes":""},{"day":"일","workout":"스트레칭·폼롤링 30분","intensity":"휴식","notes":""}]',
 '[{"week_start":7,"protocol":"골밀도 보호 점프 인터벌 (저충격)","rounds":4,"work_sec":30,"rest_sec":45,"exercises":["소프트점프스쿼트","스텝업","저충격스키점프"],"total_min":15,"notes":"뼈 충격 자극으로 골밀도 유지 — 고충격 금지"},{"week_start":10,"protocol":"균형+근력 서킷","rounds":3,"work_sec":45,"rest_sec":30,"exercises":["싱글레그스쿼트","TRX로우","힙힌지"],"total_min":18,"notes":"균형 + 근력 병행"}]',
 122,
 '[{"program":"갱년기 전문 PT 10회","description":"골밀도·균형·근력 통합 갱년기 특화 운동","frequency":"주 2회","duration_weeks":5},{"program":"아쿠아 에어로빅 그룹","description":"관절 친화적 유산소 + 수압 하체 자극","frequency":"주 2회","duration_weeks":10},{"program":"균형 감각 그룹 트레이닝","description":"낙상 예방 고유감각 훈련","frequency":"주 1회","duration_weeks":12}]',
 '[{"metric":"골밀도 T-score 보조 지표","target_change":"현상 유지 또는 개선","measurement":"DEXA (의료기관 협력)","timing":"초진·6개월"},{"metric":"체지방률(%)","target_change":"-2.5% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"균형 능력 (단발 서기)","target_change":"+10초 / 12주","measurement":"단발 서기 시간 측정","timing":"초진·6주·12주"},{"metric":"근감소 지표 (SMM)","target_change":"현상 유지 또는 +1kg","measurement":"InBody 골격근량","timing":"초진·4주·8주·12주"}]',
 'fitness BC-10 seed v1.0'),

-- ── BC-11: 요요·대사 손상형 ──────────────────────────────────
('BC-11','fitness',
 '요요 대사 재건 점진적 운동 프로그램',
 '반복적 다이어트로 대사 회로가 손상된 요요 체형',
 '[{"day":"월","workout":"초저강도 전신 서킷 40분 (자체중량·고무밴드 위주)","intensity":"낮음","notes":"처음 4주는 고강도 절대 금지 — 대사 추가 손상 위험"},{"day":"화","workout":"Zone1~2 걷기 40분","intensity":"저강도","notes":"심박수 115~125 유지"},{"day":"수","workout":"코어·유연성 + 스트레칭 50분","intensity":"낮음","notes":""},{"day":"목","workout":"자체중량 하체 40분 + 가벼운 산책","intensity":"낮음-중강도","notes":"5주차부터 점진적 강도 증가"},{"day":"금","workout":"가벼운 전신 저항 45분","intensity":"낮음-중강도","notes":""},{"day":"토","workout":"장거리 걷기 또는 자전거 60분","intensity":"저강도","notes":""},{"day":"일","workout":"완전 휴식","intensity":"휴식","notes":""}]',
 '[{"week_start":9,"protocol":"요요 회복 페이스 인터벌","rounds":4,"work_sec":30,"rest_sec":60,"exercises":["가벼운 런닝","걷기 회복"],"total_min":15,"notes":"9주차 이후 대사 안정화 확인 후 도입"},{"week_start":11,"protocol":"점진 강도 서킷","rounds":3,"work_sec":40,"rest_sec":30,"exercises":["스쿼트","푸시업","사이드런지"],"total_min":18,"notes":"11주차 최종 단계 — 일반 수준 점진 접근"}]',
 118,
 '[{"program":"요요 회복 전문 PT 12회","description":"대사 손상 체형 점진적 운동 강도 상향 설계","frequency":"주 2회","duration_weeks":6},{"program":"영양 코칭 (최소 칼로리 방지)","description":"극단적 식이 재발 방지 + 지속 가능한 식단 설계","frequency":"월 2회","duration_weeks":12},{"program":"생체신호 모니터링 세션","description":"운동 중 혈압·심박 실시간 모니터링","frequency":"주 1회","duration_weeks":8}]',
 '[{"metric":"기초대사량(BMR)","target_change":"+100kcal / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"체지방률","target_change":"-1.5% / 12주 (천천히)","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"에너지 레벨 자가 점수","target_change":"7/10 이상 유지","measurement":"자가 보고 설문 (0~10점)","timing":"매주"},{"metric":"운동 지속률","target_change":"90% 이상 출석","measurement":"출석 기록","timing":"매주"}]',
 'fitness BC-11 seed v1.0'),

-- ── BC-12: 갱년기 변환형 ────────────────────────────────────
('BC-12','fitness',
 '갱년기 전환 체형 관리 통합 프로그램',
 '갱년기 전환기에 전신 체형이 변화하는 체형',
 '[{"day":"월","workout":"전신 저항 55분 (중저중량 고반복 — 근감소 예방)","intensity":"중강도","notes":"단백질 식전 섭취 필수"},{"day":"화","workout":"Zone2 걷기+경사 50분","intensity":"저-중강도","notes":""},{"day":"수","workout":"균형·코어·유연성 통합 55분","intensity":"낮음-중강도","notes":""},{"day":"목","workout":"수영 또는 아쿠아로빅 50분","intensity":"저-중강도","notes":""},{"day":"금","workout":"상체+코어 55분","intensity":"중강도","notes":""},{"day":"토","workout":"자전거 또는 장거리 걷기 60분","intensity":"저강도","notes":""},{"day":"일","workout":"요가 또는 명상적 스트레칭 40분","intensity":"휴식","notes":""}]',
 '[{"week_start":6,"protocol":"갱년기 전환 인터벌 (저충격)","rounds":4,"work_sec":35,"rest_sec":35,"exercises":["스텝업","사이드킥","암서클","코어마치"],"total_min":20,"notes":"저충격 — 뼈·관절 보호"},{"week_start":10,"protocol":"근지구력 서킷","rounds":3,"work_sec":50,"rest_sec":25,"exercises":["고블릿스쿼트","벤트오버로우","힙쓰러스트"],"total_min":20,"notes":"근육량 보호 마지막 단계"}]',
 122,
 '[{"program":"갱년기 전환 PT 10회","description":"근감소·체지방 증가 동시 관리 갱년기 전환 특화","frequency":"주 2회","duration_weeks":5},{"program":"아쿠아·수영 그룹 클래스","description":"관절 부담 없는 전신 운동","frequency":"주 2회","duration_weeks":10},{"program":"수면 개선 코칭","description":"갱년기 수면 장애가 체지방 증가 악화 — 수면 루틴 설계","frequency":"월 1회","duration_weeks":12}]',
 '[{"metric":"체지방률","target_change":"-2% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"골격근량","target_change":"현상 유지 또는 +0.5kg","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"갱년기 증상 점수","target_change":"MRS(갱년기 증상 척도) 20% 감소","measurement":"설문","timing":"초진·6주·12주"},{"metric":"균형 테스트","target_change":"단발 서기 +10초","measurement":"직접 측정","timing":"초진·12주"}]',
 'fitness BC-12 seed v1.0'),

-- ── BC-13: 인슐린 저항 복부형 ───────────────────────────────
('BC-13','fitness',
 '인슐린 저항 완화 공복 유산소+저항 프로그램',
 '인슐린 저항성이 높아 복부에 지방이 집중되는 체형',
 '[{"day":"월","workout":"공복 Zone2 사이클 45분 (아침 공복 상태)","intensity":"저-중강도","notes":"공복 유산소로 인슐린 감수성 직접 개선"},{"day":"화","workout":"하체 복합 저항 55분 (스쿼트·레그프레스·런지)","intensity":"중강도","notes":"운동 후 근육의 포도당 흡수로 혈당 관리"},{"day":"수","workout":"공복 걷기 30분 + 코어 30분","intensity":"저강도","notes":""},{"day":"목","workout":"HIIT 20분 (혈당 강하 효과)","intensity":"고강도","notes":"5주차부터 도입 — 고강도 운동의 인슐린 감수성 개선"},{"day":"금","workout":"상체+전신 복합 저항 55분","intensity":"중강도","notes":""},{"day":"토","workout":"장거리 걷기 또는 자전거 90분 (공복 2시간 후)","intensity":"저강도","notes":""},{"day":"일","workout":"완전 휴식 또는 가벼운 요가","intensity":"휴식","notes":""}]',
 '[{"week_start":5,"protocol":"혈당 강하 HIIT","rounds":6,"work_sec":30,"rest_sec":30,"exercises":["점프스쿼트","버피","마운틴클라이머"],"total_min":20,"notes":"고강도 운동의 포도당 소비로 혈당·인슐린 직접 개선"},{"week_start":9,"protocol":"공복 인터벌 런닝","rounds":8,"work_sec":45,"rest_sec":30,"exercises":["스프린트 12km/h","회복 조깅 7km/h"],"total_min":22,"notes":"공복 상태에서 지방 산화 극대화"}]',
 133,
 '[{"program":"혈당 관리 PT 10회","description":"인슐린 저항 완화 맞춤 공복 운동·저항 운동 설계","frequency":"주 2회","duration_weeks":5},{"program":"영양 코칭 (저GI 식단)","description":"저GI 식품 선택 + 식후 혈당 스파이크 억제 전략","frequency":"월 2회","duration_weeks":12},{"program":"혈당 자가 모니터링 코칭","description":"운동 전후 혈당 측정 습관 형성","frequency":"주 1회","duration_weeks":8}]',
 '[{"metric":"공복혈당(mg/dL)","target_change":"100 이하 달성","measurement":"자가 혈당계 아침 공복","timing":"주 3회"},{"metric":"HOMA-IR","target_change":"2.5 이하","measurement":"혈액검사 (의료기관)","timing":"초진·8주·12주"},{"metric":"복부 둘레","target_change":"-5cm / 12주","measurement":"줄자","timing":"매 2주"},{"metric":"운동 후 혈당 강하폭","target_change":"운동 후 20mg/dL 이상 감소","measurement":"운동 전후 혈당 측정","timing":"매 운동 후"}]',
 'fitness BC-13 seed v1.0'),

-- ── BC-14: 골반·자세 불균형형 ───────────────────────────────
('BC-14','fitness',
 '골반·자세 교정 기능성 운동 프로그램',
 '골반과 척추 불균형으로 체형이 틀어진 체형',
 '[{"day":"월","workout":"교정 코어 + 골반 안정화 60분 (버드독·데드버그·클램쉘·힙힌지)","intensity":"낮음-중강도","notes":"올바른 자세 우선 — 무게보다 폼"},{"day":"화","workout":"Zone2 걷기 (폼 교정 포함) 40분","intensity":"저강도","notes":"걷기 자세 교정 — 골반 중립 유지"},{"day":"수","workout":"기능적 하체 운동 + 유연성 55분 (싱글레그·런지변형)","intensity":"중강도","notes":"좌우 균형 확인하며 진행"},{"day":"목","workout":"필라테스 기구 60분 (척추·골반 특화)","intensity":"중강도","notes":"피트니스 센터 필라테스 기구 세션"},{"day":"금","workout":"전신 복합 기능 운동 55분","intensity":"중강도","notes":""},{"day":"토","workout":"수영 또는 자전거 50분 (척추 중립 자세)","intensity":"저-중강도","notes":"척추 부담 없는 운동"},{"day":"일","workout":"폼롤링·스트레칭 집중 40분","intensity":"휴식","notes":""}]',
 '[{"week_start":7,"protocol":"기능성 코어 인터벌","rounds":4,"work_sec":40,"rest_sec":30,"exercises":["케이블 우드찹","팔로프프레스","싱글레그데드","사이드플랭크로테이션"],"total_min":20,"notes":"코어 안정화 + 회전 패턴 통합"},{"week_start":10,"protocol":"전신 기능 서킷","rounds":3,"work_sec":50,"rest_sec":25,"exercises":["고블릿스쿼트","TRX로우","리버스런지","오버헤드프레스"],"total_min":18,"notes":"자세 교정 상태에서 전신 강도 강화"}]',
 125,
 '[{"program":"자세 교정 PT 12회","description":"골반·척추 불균형 맞춤 교정 운동 + 기능 강화","frequency":"주 3회","duration_weeks":4},{"program":"필라테스 기구 (척추 특화)","description":"척추 분절 안정화·골반 교정 전문","frequency":"주 2회","duration_weeks":10},{"program":"자세 분석 재평가","description":"4주 단위 자세 변화 측정 + 프로그램 수정","frequency":"4주 1회","duration_weeks":12}]',
 '[{"metric":"골반 틸트 각도(°)","target_change":"±5° 이내 정상화","measurement":"자세 분석 앱 또는 트레이너 측정","timing":"초진·4주·8주·12주"},{"metric":"플랭크 유지 시간(초)","target_change":"+30초 / 12주","measurement":"직접 테스트","timing":"초진·6주·12주"},{"metric":"좌우 근력 불균형","target_change":"10% 이내","measurement":"싱글레그 스쿼트 비교","timing":"초진·12주"},{"metric":"통증 점수(VAS)","target_change":"3점 이하","measurement":"VAS 자가 보고 (0~10)","timing":"매 PT 세션"}]',
 'fitness BC-14 seed v1.0'),

-- ── BC-15: 피하지방·탄력 저하형 ─────────────────────────────
('BC-15','fitness',
 '피부 탄력 복원 근력+유산소 복합 프로그램',
 '피하지방 과잉과 콜라겐 감소로 탄력이 저하된 체형',
 '[{"day":"월","workout":"전신 저항 고반복 50분 (밴드·TRX·자체중량 위주)","intensity":"중강도","notes":"콜라겐 합성 자극 — 단백질 섭취 병행 필수"},{"day":"화","workout":"Zone2 사이클 또는 수영 40분","intensity":"저-중강도","notes":"피부 혈류 개선"},{"day":"수","workout":"상체+코어 탄력 운동 50분 (케이블·밴드)","intensity":"중강도","notes":""},{"day":"목","workout":"요가 또는 유연성 집중 50분","intensity":"낮음","notes":"콜라겐 합성 지원 스트레칭"},{"day":"금","workout":"하체+전신 저항 50분","intensity":"중강도","notes":""},{"day":"토","workout":"장거리 걷기 또는 자전거 60분","intensity":"저강도","notes":""},{"day":"일","workout":"폼롤링 + 피부 마사지 자가 케어 30분","intensity":"휴식","notes":""}]',
 '[{"week_start":5,"protocol":"탄력 서킷","rounds":4,"work_sec":40,"rest_sec":25,"exercises":["TRX로우","밴드풀어파트","싱글레그데드","사이드런지"],"total_min":20,"notes":"밴드·TRX로 피부 탄력 자극 최적화"},{"week_start":9,"protocol":"전신 지방연소 HIIT","rounds":6,"work_sec":30,"rest_sec":25,"exercises":["점프스쿼트","버피","마운틴클라이머"],"total_min":18,"notes":"체지방 감량으로 탄력 저하 부위 개선"}]',
 128,
 '[{"program":"탄력 복원 PT 8회","description":"콜라겐 합성 자극 저항 운동 + 피부 탄력 맞춤 프로그램","frequency":"주 2회","duration_weeks":4},{"program":"수영·아쿠아로빅 클래스","description":"수압 마사지 효과로 피부 탄력 개선","frequency":"주 2회","duration_weeks":8},{"program":"영양 코칭 (콜라겐·비타민C)","description":"콜라겐 합성 영양소 최적화 전략","frequency":"월 1회","duration_weeks":12}]',
 '[{"metric":"피부 탄력 지수","target_change":"트레이너 촉진 평가 1등급 개선","measurement":"핀치 테스트·Cutometer (의료기관)","timing":"초진·12주"},{"metric":"체지방률","target_change":"-3% / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"근육량","target_change":"+1.5kg / 12주","measurement":"InBody","timing":"초진·4주·8주·12주"},{"metric":"피부 수분도","target_change":"+10% / 12주","measurement":"피부 수분 측정기 (의료기관)","timing":"초진·12주"}]',
 'fitness BC-15 seed v1.0'),

-- ── BC-16: 면역·순환 복합형 ─────────────────────────────────
('BC-16','fitness',
 '면역 강화·순환 촉진 저강도 복합 프로그램',
 '림프 정체와 만성 염증으로 순환이 저하된 체형',
 '[{"day":"월","workout":"Zone2 걷기 또는 수영 45분","intensity":"저-중강도","notes":"만성 염증 체형은 고강도 절대 금지 초기 8주"},{"day":"화","workout":"전신 자체중량 서킷 40분 (저충격)","intensity":"낮음-중강도","notes":""},{"day":"수","workout":"림프 순환 요가 60분 (역전 자세 포함)","intensity":"낮음","notes":"다리 올리기·어깨 서기 등 정맥류 개선 자세"},{"day":"목","workout":"수영 또는 아쿠아로빅 50분","intensity":"저-중강도","notes":"수압으로 림프 순환 자극"},{"day":"금","workout":"가벼운 저항 + 스트레칭 50분","intensity":"낮음-중강도","notes":""},{"day":"토","workout":"자연 하이킹 또는 맨발 걷기 90분","intensity":"저강도","notes":"자연 환경 면역 회복 효과"},{"day":"일","workout":"완전 휴식 + 호흡·명상 15분","intensity":"휴식","notes":""}]',
 '[{"week_start":9,"protocol":"저충격 순환 인터벌","rounds":4,"work_sec":35,"rest_sec":45,"exercises":["스텝박스","사이드킥","암서클","무릎들기"],"total_min":18,"notes":"9주차 이후 염증 안정화 확인 후 도입"},{"week_start":11,"protocol":"아쿠아 인터벌","rounds":5,"work_sec":40,"rest_sec":30,"exercises":["수중조깅","수중점프","수중사이드스텝"],"total_min":20,"notes":"수중 저충격으로 면역 부담 없이 강도 향상"}]',
 118,
 '[{"program":"면역 회복 PT 8회","description":"만성 염증·순환 저하 체형 저강도 맞춤 운동","frequency":"주 1~2회","duration_weeks":4},{"program":"림프 순환 요가 그룹","description":"역전 자세·호흡 위주 림프 활성화","frequency":"주 3회","duration_weeks":10},{"program":"면역 강화 라이프스타일 코칭","description":"수면·영양·운동 통합 면역 루틴 설계","frequency":"월 1회","duration_weeks":12}]',
 '[{"metric":"CRP 수치(염증 지표)","target_change":"1.0mg/L 이하","measurement":"혈액검사 (의료기관 협력)","timing":"초진·8주·12주"},{"metric":"피로도 점수","target_change":"FSS 3.0 이하","measurement":"피로 심각도 척도(FSS) 설문","timing":"초진·4주·8주·12주"},{"metric":"하체 부종 둘레","target_change":"-2cm / 12주","measurement":"줄자 종아리 저녁 측정","timing":"매 2주"},{"metric":"운동 완주율","target_change":"80% 이상","measurement":"출석 기록","timing":"매주"}]',
 'fitness BC-16 seed v1.0');
