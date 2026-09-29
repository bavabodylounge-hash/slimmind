-- 오늘탭 C슬롯: 컨설턴트 답장 초안
-- status: 'draft' → 컨설턴트 수정 대기 / 'approved' → 승인됨(con-tx 표시) / 'sent' → 실제 발송됨
ALTER TABLE diagnosis_results ADD COLUMN today_slot_c TEXT;
ALTER TABLE diagnosis_results ADD COLUMN today_slot_c_status TEXT DEFAULT 'draft';
ALTER TABLE diagnosis_results ADD COLUMN today_slot_c_week INTEGER;
ALTER TABLE diagnosis_results ADD COLUMN today_slot_c_approved_at DATETIME;
ALTER TABLE diagnosis_results ADD COLUMN today_slot_c_approved_by TEXT;
