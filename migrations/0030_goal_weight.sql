-- V4.1 P6: diagnosis_results에 목표체중 · 감량률 컬럼 추가
ALTER TABLE diagnosis_results ADD COLUMN goal_weight     INTEGER DEFAULT NULL;
ALTER TABLE diagnosis_results ADD COLUMN weight_loss_pct INTEGER DEFAULT NULL;
