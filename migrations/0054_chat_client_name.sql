-- chat_messages에 client_name 컬럼 추가 (고객 이름 직접 저장)
ALTER TABLE chat_messages ADD COLUMN client_name TEXT DEFAULT NULL;
