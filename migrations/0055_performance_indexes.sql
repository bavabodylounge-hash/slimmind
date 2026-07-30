-- 0055: 부하 대비 성능 인덱스 추가
-- daily_checks.result_id — chat/clients JOIN에서 OR 조건 최적화
CREATE INDEX IF NOT EXISTS idx_daily_result_id    ON daily_checks(result_id);
-- diagnosis_results.user_name — 고객 이름 검색 최적화
CREATE INDEX IF NOT EXISTS idx_diagnosis_user_name ON diagnosis_results(user_name);
-- push_subscriptions.session_id + endpoint 복합 (중복 구독 체크)
-- 이미 endpoint UNIQUE 인덱스 있으므로 session별 조회 최적화
CREATE INDEX IF NOT EXISTS idx_push_session_ep     ON push_subscriptions(session_id, endpoint);
-- chat_messages 복합 인덱스 — b2b_code + session_id + is_read (미읽음 집계 최적화)
CREATE INDEX IF NOT EXISTS idx_chat_b2b_sid_read   ON chat_messages(b2b_code, session_id, is_read);
