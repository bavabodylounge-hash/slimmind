-- ══════════════════════════════════════════════════════════════════
--  migration 0075: BC-1~16 clinical_ctx 값 설정
--  (0074에서 ALTER TABLE 오류로 UPDATE 미적용 → 재실행)
-- ══════════════════════════════════════════════════════════════════

UPDATE bc_prescriptions SET
  clinical_ctx = '인슐린 저항성 + 내장지방 축적 패턴. HOMA-IR 상승 가능성. 복부 내장지방 우선 분해를 위해 혈당 조절 중심 접근 필요.'
WHERE bc_code = 'BC-1';

UPDATE bc_prescriptions SET
  clinical_ctx = '림프부종 패턴: 피하지방층 내 간질액 정체 + 림프관 수축력 저하. 셀룰라이트 전단계 가역적 단계.'
WHERE bc_code = 'BC-2';

UPDATE bc_prescriptions SET
  clinical_ctx = 'IBS-B 패턴(팽만 우세형): 소장내 세균 과증식(SIBO) 가능성 + 장 운동성 저하. 저FODMAP 식이 반응 높음.'
WHERE bc_code = 'BC-3';

UPDATE bc_prescriptions SET
  clinical_ctx = '근감소비만(Sarcopenic Obesity): 체중 정상·BMI 정상이나 체지방률 높음. 기초대사율 저하로 일반 식이조절 효과 미미.'
WHERE bc_code = 'BC-4';

UPDATE bc_prescriptions SET
  clinical_ctx = 'CVI(만성 정맥 부전) 경향 + 림프부종 혼재. 하지 정맥류 전단계. 오래 서 있거나 앉을 때 악화되는 중력성 부종 패턴.'
WHERE bc_code = 'BC-5';

UPDATE bc_prescriptions SET
  clinical_ctx = '에스트로겐 우세증(Estrogen Dominance) 패턴: 황체 기능 저하 + 간 해독 2상 저하. 셀룰라이트 Grade 2~3 해당.'
WHERE bc_code = 'BC-6';

UPDATE bc_prescriptions SET
  clinical_ctx = '근비대 우세형: 지방보다 근섬유 비대 + 근막 긴장이 주원인. 일반적 유산소 운동으로는 오히려 악화. 신장·스트레칭 중심 접근 필요.'
WHERE bc_code = 'BC-7';

UPDATE bc_prescriptions SET
  clinical_ctx = '자율신경 불균형 + 골반 순환 저하 패턴. 교감신경 우위로 인한 말초혈관 수축 → 국소 지방 분해 억제. 심박변이도(HRV) 저하 동반.'
WHERE bc_code = 'BC-8';

UPDATE bc_prescriptions SET
  clinical_ctx = '경추 전만 소실(군인자세) 또는 상위 교차 증후군(Upper Crossed Syndrome): 흉근 단축 + 심부 경부 굴곡근 약화 동반.'
WHERE bc_code = 'BC-9';

UPDATE bc_prescriptions SET
  clinical_ctx = '상지 림프부종 경향 + 액와 림프절 과부하. 유방 수술력 없는 경우 기능성 림프부종 또는 잠재적 림프관 발달 불량 패턴.'
WHERE bc_code = 'BC-10';

UPDATE bc_prescriptions SET
  clinical_ctx = '코르티솔 과잉 패턴: HPA 축 과활성화 → 스트레스성 복부 지방 축적. 아침 각성 후 피로감, 오후 에너지 저하 동반.'
WHERE bc_code = 'BC-11';

UPDATE bc_prescriptions SET
  clinical_ctx = '갑상선 기능 저하 경향: 기초대사율 저하 + 체온 조절 이상. 부종성 체중 증가(점액부종). TSH 경계치 주의.'
WHERE bc_code = 'BC-12';

UPDATE bc_prescriptions SET
  clinical_ctx = '인슐린-렙틴 저항성 복합 패턴: 식욕 조절 호르몬 교란. 포만감 신호 지연 + 공복 혈당 이상 동반 가능성.'
WHERE bc_code = 'BC-13';

UPDATE bc_prescriptions SET
  clinical_ctx = '골격 불균형 + 체간 근력 저하 패턴. 체중 분산 불균형으로 특정 부위 만성 비대. 코어 안정화 우선 접근 필요.'
WHERE bc_code = 'BC-14';

UPDATE bc_prescriptions SET
  clinical_ctx = '피부 장벽 기능 저하 + 만성 염증 패턴. 아토피·건선 경향 동반. 장-피부 축(gut-skin axis) 교란 가능성.'
WHERE bc_code = 'BC-15';

UPDATE bc_prescriptions SET
  clinical_ctx = '복합 대사 이상: 인슐린 저항성 + 자율신경 불균형 + 순환 저하 복합. 단일 접근 효과 제한, 통합 관리 필요.'
WHERE bc_code = 'BC-16';
