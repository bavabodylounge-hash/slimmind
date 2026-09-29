-- 오늘탭 AI 슬롯 (A·B·E·F) 컬럼 추가
-- A: 왜 [이름]님만의 프로그램인가 문단
-- B: 주차 머리글 (title + body JSON)
-- E: 격주 체크 반영 문장
-- F: 재측정 재설계 문장
ALTER TABLE diagnosis_results ADD COLUMN today_slot_a TEXT;
ALTER TABLE diagnosis_results ADD COLUMN today_slot_b TEXT;
ALTER TABLE diagnosis_results ADD COLUMN today_slot_e TEXT;
ALTER TABLE diagnosis_results ADD COLUMN today_slot_f TEXT;
ALTER TABLE diagnosis_results ADD COLUMN ai_today_src TEXT DEFAULT 'wardrobe_v4';
ALTER TABLE diagnosis_results ADD COLUMN ai_today_at DATETIME;
-- B슬롯: 주차별로 재생성되므로 현재 주차 번호 저장
ALTER TABLE diagnosis_results ADD COLUMN today_slot_b_week INTEGER;
-- E슬롯: 격주 배치이므로 마지막 생성 주차 저장
ALTER TABLE diagnosis_results ADD COLUMN today_slot_e_week INTEGER;
-- F슬롯: 재측정 시점(4주·8주)이므로 마지막 생성 주차 저장
ALTER TABLE diagnosis_results ADD COLUMN today_slot_f_week INTEGER;
