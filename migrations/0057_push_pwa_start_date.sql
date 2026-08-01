-- 0057: push_subscriptions에 pwa_start_date 컬럼 추가
-- D+28 KST 푸시 스케줄러용 — PWA 최초 설치/구독 시점 저장
ALTER TABLE push_subscriptions ADD COLUMN pwa_start_date TEXT DEFAULT NULL;

-- 기존 구독 레코드는 created_at을 pwa_start_date로 초기화
UPDATE push_subscriptions
SET pwa_start_date = created_at
WHERE pwa_start_date IS NULL;
