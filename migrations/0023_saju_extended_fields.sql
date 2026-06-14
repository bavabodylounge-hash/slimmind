-- Migration 0023: 사주 확장 필드 추가
-- saju_il_ji(일지), saju_yin_yang(음양), birth_hour(출생시간),
-- saju_hour_stem(시간天干), saju_hour_branch(시지地支), saju_display(표시문자열)

ALTER TABLE results ADD COLUMN saju_il_ji TEXT DEFAULT NULL;
ALTER TABLE results ADD COLUMN saju_yin_yang TEXT DEFAULT NULL;
ALTER TABLE results ADD COLUMN birth_hour TEXT DEFAULT NULL;
ALTER TABLE results ADD COLUMN saju_hour_stem TEXT DEFAULT NULL;
ALTER TABLE results ADD COLUMN saju_hour_branch TEXT DEFAULT NULL;
ALTER TABLE results ADD COLUMN saju_display TEXT DEFAULT NULL;
