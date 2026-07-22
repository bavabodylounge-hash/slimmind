#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
P6 renderP6() 정교화 패치
- renderP6() 파라미터에 bcCode, redFlags 추가
- 호출부에서 bcCode, redFlags 전달
- DX_11_BASE 11개 항목 tagsFn/whyFn/actions 완전 동적화
  (bcCode/ohaengKey/redFlags/score 조합 기반)
- hospital + v4 동시 패치
"""

import re

# ═══════════════════════════════════════════════════════════════
# 공통: 새 DX_11_BASE 블록 (hospital용)
# ═══════════════════════════════════════════════════════════════

NEW_DX_11_BASE_HOSPITAL = r"""  // 11개 진단 전체 정의 — 다중축 가중합 긴급도 계산
  // ★ bcCode / ohaengKey / redFlags 기반 완전 동적화
  const _bcCode_p6    = bcCode_p6 || (inputData && (inputData.bc_code||inputData.bc_primary)) || (window.__DIAG_DATA__ && (window.__DIAG_DATA__.bc_code||window.__DIAG_DATA__.bc_primary)) || '';
  const _ohaengKey_p6 = ohaengType || (inputData && (inputData.ohaeng_type||inputData.ohaengType)) || '';
  const _rflP6        = (Array.isArray(redFlags_p6) ? redFlags_p6 : (window.__RED_FLAGS__ || window._redFlags || []));
  const _hasDIABETES  = _rflP6.indexOf('DIABETES')  >= 0;
  const _hasTHYROID   = _rflP6.indexOf('THYROID')   >= 0;
  const _hasPCOS      = _rflP6.indexOf('PCOS')      >= 0;
  const _hasYOYO      = _rflP6.indexOf('YOYO')      >= 0;
  const _hasHTN       = _rflP6.indexOf('HTN')       >= 0;
  const _hasFATTY     = _rflP6.indexOf('FATTY_LIVER')>= 0;
  const _hasSTEROID   = _rflP6.indexOf('STEROID')   >= 0;
  const _hasLIPO      = _rflP6.indexOf('LIPO_HX')   >= 0 || _rflP6.indexOf('ABDOMINOPLASTY_HX') >= 0;
  const _hasANTI      = _rflP6.indexOf('ANTICOAGULANT') >= 0 || _rflP6.indexOf('ISOTRETINOIN') >= 0;
  // BC 계열 분류 헬퍼
  const _bcIsVis  = ['비만형','내장형','복부형'].indexOf(_bcCode_p6) >= 0;
  const _bcIsMus  = ['근육형','운동형','탄탄형'].indexOf(_bcCode_p6) >= 0;
  const _bcIsHorm = ['호르몬형','갑상선형','PCOS형'].indexOf(_bcCode_p6) >= 0;
  const _bcIsCirc = ['순환형','부종형','림프형'].indexOf(_bcCode_p6) >= 0;
  // 오행 헬퍼
  const _ohWood   = _ohaengKey_p6 === '목' || _ohaengKey_p6 === '木';
  const _ohFire   = _ohaengKey_p6 === '화' || _ohaengKey_p6 === '火';
  const _ohEarth  = _ohaengKey_p6 === '토' || _ohaengKey_p6 === '土';
  const _ohMetal  = _ohaengKey_p6 === '금' || _ohaengKey_p6 === '金';
  const _ohWater  = _ohaengKey_p6 === '수' || _ohaengKey_p6 === '水';

  const DX_11_BASE = [
    {
      key:'식단',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><path d="M6 3v7a2.2 2.2 0 0 0 4.4 0V3"/><path d="M8.2 10.5V21"/><path d="M16.5 3c-1.6 1.4-2.2 3.2-2.2 5.2 0 1.7.8 2.8 2.2 3V21"/></svg>', color:'#E8631A',
      expert:'영양·식이 전문가',
      title:'식이 패턴 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasDIABETES)                         t.push('당뇨 전단계 식이 관리');
        if (_bcIsVis && score>6)                   t.push('내장지방 유발 식패턴');
        if (score>7)                               t.push('탄수화물 과잉','혈당 스파이크');
        else if (score>4)                          t.push('식이 패턴 불안정','혈당 변동성 주의');
        else                                       t.push('식이 기반 안정');
        if (_ohEarth)                              t.push('비위 맞춤 식이');
        if (_ohWater)                              t.push('신장 보호 저염식');
        if (t.length < 2)                          t.push('영양 밸런스 점검');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasDIABETES)
          return `<strong>${name}</strong>의 혈당 관련 지표가 식이 패턴에서 직접 기인합니다. 당뇨 전단계 관리를 위한 탄수화물 타이밍과 혈당 지수(GI) 조절이 모든 처방 중 최우선입니다.`;
        if (_bcIsVis && score>6)
          return `<strong>${name}</strong>의 내장지방형 체질에서 정제 탄수화물·야식 패턴이 복부 지방 축적의 직접 원인입니다. 혈당 급등-급락 사이클 차단이 체형 교정의 첫 단추입니다.`;
        if (score>7)
          return `<strong>${name}</strong>의 식이 패턴에서 혈당 급등-급락 사이클이 감지됩니다. 탄수화물 타이밍과 양 조절이 다른 어떤 개입보다 먼저 안정되어야 이후 처방 효과가 올라갑니다.`;
        if (score>4)
          return `식이 패턴에 일부 불안정 요소가 있습니다. ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 기질에 맞는 혈당 관리와 영양 타이밍을 조정합니다.`;
        return `식이 기반은 비교적 안정적이지만 ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 기질에 맞는 영양 비율을 미세 조정하면 대사 효율이 달라집니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_hasDIABETES)   a.push('당뇨 전단계 혈당 식이 교정');
        if (_bcIsVis)        a.push('내장지방 차단 탄수 타이밍');
        a.push('단백질 목표량 설정');
        if (_ohEarth)        a.push('비위 기능 강화 식단');
        else if (_ohWater)   a.push('신장 보호 저염·저단백 조정');
        else                 a.push('야식 패턴 차단');
        return a.slice(0,3);
      })(),
    },
    {
      key:'심리',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><path d="M9.5 4.2a2.7 2.7 0 0 0-2.6 2.2 2.6 2.6 0 0 0-1.8 4.2A2.8 2.8 0 0 0 6.4 15a2.7 2.7 0 0 0 2.6 3.4h.5V4.2Z"/><path d="M14.5 4.2a2.7 2.7 0 0 1 2.6 2.2 2.6 2.6 0 0 1 1.8 4.2A2.8 2.8 0 0 1 17.6 15a2.7 2.7 0 0 1-2.6 3.4h-.5V4.2Z"/><path d="M12 4.2v14.2M12 21v-2.6"/></svg>', color:'#9C27B0',
      expert:'행동심리·식욕 전문가',
      title:'심리·식욕 조절 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasYOYO)                              t.push('요요 방어 심리 패턴');
        if (score>6.5)                             t.push('스트레스 식욕','감정적 폭식');
        else if (score>4)                          t.push('심리적 식욕 주의','수면-식욕 연결');
        else                                       t.push('심리 안정');
        if (_ohFire)                               t.push('과열 신경 진정 필요');
        if (t.length < 2)                          t.push('도파민 보상 설계');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasYOYO && score>5)
          return `<strong>${name}</strong>의 반복 요요 패턴은 의지 부족이 아닌 방어 체중 설정점(set-point)과 감정 식욕의 복합 작용입니다. 심리 기반 행동 패턴 교정 없이는 어떤 식이·운동 처방도 지속이 어렵습니다.`;
        if (score>6.5)
          return `<strong>${name}</strong>의 체중 문제는 의지 부족이 아니라 스트레스-식욕 호르몬 연결 고리에서 시작됩니다. 행동 패턴을 먼저 진단해야 식단·운동 처방이 지속됩니다.`;
        if (score>4)
          return `수면 불균형이 야간 식욕과 연결되어 있습니다. ${_hasYOYO ? '요요 이력이 심리 저항을 높이므로' : '심리·수면'} 동시 접근으로 식욕 조절이 안정화됩니다.`;
        return `심리적 식욕 조절은 안정적입니다. ${_ohFire ? '화(火) 기질의 과열 신경을 진정시키는' : '현재 루틴을 강화하는'} 방향으로 접근합니다.`;
      },
      actions: (()=>{
        var a = ['스트레스 식욕 트리거 분석'];
        if (_hasYOYO)   a.push('요요 방어 마인드셋 재설계');
        else            a.push('감정 식사 일지');
        if (_ohFire)    a.push('과열 신경 진정 루틴');
        else            a.push('도파민 보상 대체 루틴');
        return a.slice(0,3);
      })(),
    },
    {
      key:'호르몬', icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><circle cx="12" cy="12" r="2.2"/><path d="M12 9.8c0-2.4-1-4.3-2.6-4.3S6.8 7 8.6 9.4M14.2 12c2.3 0 4.2-1 4.2-2.6s-1.5-2.6-3.9-.8M12 14.2c0 2.4 1 4.3 2.6 4.3s2.6-1.5.8-3.9M9.8 12c-2.4 0-4.3 1-4.3 2.6s1.5 2.6 3.9.8"/></svg>', color:'#C0397A',
      expert:'내분비·호르몬 전문가',
      title:'호르몬 불균형 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasTHYROID)                           t.push('갑상선 기능 저하 주의');
        if (_hasPCOS)                              t.push('PCOS 인슐린 저항');
        if (score>6.5)                             t.push('코르티솔 이상');
        else if (score>4)                          t.push('호르몬 변동성 주의','생리 주기 영향');
        else                                       t.push('호르몬 기반 안정');
        if (_ohWater)                              t.push('신장-부신 축 점검');
        if (t.length < 2)                          t.push('주기적 모니터링');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasTHYROID)
          return `<strong>${name}</strong>의 갑상선 기능 저하는 기초대사율을 직접 낮춥니다. 갑상선 호르몬 최적화 없이 식이·운동을 아무리 해도 체중 감량 효과가 절반 이하로 떨어집니다.`;
        if (_hasPCOS)
          return `<strong>${name}</strong>의 PCOS 패턴에서 인슐린 저항이 체중 조절의 핵심 병목입니다. 인슐린 민감도 교정을 중심으로 모든 처방을 설계해야 효과가 납니다.`;
        if (score>6.5)
          return `<strong>${name}</strong>의 호르몬 지표가 체중 조절의 핵심 병목입니다. 인슐린 민감도와 코르티솔 패턴을 교정하지 않으면 식이·운동 효과가 반감됩니다.`;
        if (score>4)
          return `호르몬 변동이 감지됩니다. ${_bcCode_p6 ? _bcCode_p6+'형' : ''} 생리 주기·코르티솔 리듬에 맞춘 식이·운동 타이밍 최적화가 필요합니다.`;
        return `호르몬 기반은 관리 가능한 수준입니다. ${_ohWater ? '신장-부신 축을 강화하는' : '생활 패턴으로'} 최적화할 수 있습니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_hasTHYROID)   a.push('갑상선 호르몬 수치 재확인');
        else if (_hasPCOS) a.push('PCOS 인슐린 저항 교정 프로토콜');
        else               a.push('인슐린 민감도 검사');
        a.push('코르티솔 일주기 체크');
        if (_ohWater)      a.push('신장-부신 축 보강 처방');
        else               a.push('갑상선 기능 모니터링');
        return a.slice(0,3);
      })(),
    },
    {
      key:'운동',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><circle cx="13.5" cy="4" r="1.6"/><path d="M7.5 21l3-5.8-2.6-3 1-5.2L12 9.5l3.2 1.2"/><path d="M5.5 11.4 9 8.6M15.2 14.8l2 2.6.9 3.6"/></svg>', color:'#4A8C1C',
      expert:'운동처방·재활 전문가',
      title:'운동 처방 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_bcIsMus && score>5)                   t.push('과훈련 주의','근손실 위험');
        else if (_bcIsCirc && score>4)             t.push('순환 개선 운동 필요');
        if (score>6)                               t.push('체형 불균형','운동 부작용 위험');
        else if (score>3.5)                        t.push('운동 효율 개선 필요','자세 패턴 주의');
        else                                       t.push('운동 기반 양호');
        if (_ohMetal)                              t.push('폐 기능 강화 유산소');
        if (t.length < 2)                          t.push('강도 최적화 필요');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_bcIsMus && score>5)
          return `<strong>${name}</strong>의 근육형 체질에서 과훈련은 코르티솔 급등과 근손실을 유발합니다. 운동 종류·강도·회복 비율을 BC 기질에 정밀 맞춤해야 근육량 유지와 지방 감량이 동시에 가능합니다.`;
        if (score>6)
          return `<strong>${name}</strong>의 ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 기질에 맞지 않는 운동이 오히려 염증과 식욕을 증가시킬 수 있습니다. BC 맞춤 운동 종류와 강도를 먼저 진단합니다.`;
        if (score>3.5)
          return `운동 효율에 개선 여지가 있습니다. 체형 정렬과 운동 순서를 교정하면 같은 시간에 더 큰 효과를 냅니다.`;
        return `운동 기반은 양호합니다. ${_bcCode_p6 ? _bcCode_p6+'형에' : 'BC에'} 맞는 종류와 시간대를 최적화합니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_bcIsMus)    a.push('과훈련 방지 주간 볼륨 설계');
        else             a.push('체형별 운동 금지 목록 확인');
        a.push('주간 운동 루틴 설계');
        if (_ohMetal)    a.push('폐 기능 강화 유산소 추가');
        else             a.push('근육 활성화 순서 교정');
        return a.slice(0,3);
      })(),
    },
    {
      key:'회복',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><path d="M20 14.2A8.1 8.1 0 0 1 9.8 4 8.3 8.3 0 1 0 20 14.2Z"/></svg>', color:'#3F51B5',
      expert:'수면·자율신경 전문가',
      title:'수면·회복 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasSTEROID && score>4)                t.push('스테로이드 수면 교란');
        if (score>6)                               t.push('수면 호르몬 교란','야간 식욕');
        else if (score>4)                          t.push('수면 리듬 불안정','자율신경 과부하');
        else                                       t.push('수면 패턴 안정');
        if (_ohFire)                               t.push('심화(心火) 과열 진정');
        if (_ohWater)                              t.push('신수(腎水) 회복 우선');
        if (t.length < 2)                          t.push('회복력 양호');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasSTEROID && score>4)
          return `<strong>${name}</strong>의 스테로이드 복용 이력이 수면-코르티솔 리듬을 교란하고 있습니다. 수면 질 회복을 우선하지 않으면 대사 회복이 지연됩니다.`;
        if (score>6)
          return `<strong>${name}</strong>의 수면 패턴이 렙틴·그렐린 불균형을 만들어 다음날 식욕 폭발로 이어집니다. 수면 질을 먼저 개선해야 모든 처방 효과가 살아납니다.`;
        if (score>4)
          return `수면 리듬이 일부 불안정합니다. ${_ohFire ? '화(火) 기질의 심화 과열을 진정시키는' : '자율신경 과부하 차단과 수면 루틴 고정이'} 우선입니다.`;
        return `수면·회복 기반은 양호합니다. ${_ohWater ? '신수(腎水) 회복을 중심으로' : '질적 최적화로'} 대사 회복을 가속합니다.`;
      },
      actions: (()=>{
        var a = ['수면 단계 분석'];
        if (_hasSTEROID)  a.push('스테로이드 중단 후 코르티솔 회복 프로토콜');
        else              a.push('야간 코르티솔 패턴 체크');
        if (_ohFire)      a.push('심화 진정 명상·호흡 루틴');
        else              a.push('회복 루틴 설계');
        return a.slice(0,3);
      })(),
    },
    {
      key:'체형',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><path d="M8.6 15.4 15.4 8.6"/><path d="M8.6 15.4a2.3 2.3 0 1 0-3 3 2.3 2.3 0 1 0 3 3 2.3 2.3 0 0 0 3-3"/><path d="M15.4 8.6a2.3 2.3 0 1 0 3-3 2.3 2.3 0 1 0-3-3 2.3 2.3 0 0 0-3 3"/></svg>', color:'#6B4EAA',
      expert:'체형·자세 전문가',
      title:'체형·자세 교정 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasLIPO)                              t.push('시술 후 체형 재정렬 필요');
        if (_bcIsCirc && score>4)                  t.push('부종형 림프 순환 저하');
        if (score>6)                               t.push('체형 불균형','자세성 비만');
        else if (score>4)                          t.push('자세 패턴 주의','부위별 지방 분포 영향');
        else                                       t.push('체형 기반 안정');
        if (_ohWood)                               t.push('간담 기능 연계 자세 교정');
        if (t.length < 2)                          t.push('자세 미세 교정');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasLIPO && score>4)
          return `<strong>${name}</strong>의 지방흡입 이력으로 인해 주변 조직 유착과 림프 순환 변화가 있습니다. 체형 재정렬 없이 운동 강도를 높이면 불균형이 심화됩니다.`;
        if (_bcIsCirc && score>5)
          return `<strong>${name}</strong>의 순환형 체질에서 림프·정맥 순환 저하가 부위별 지방 축적을 고착시킵니다. 자세·체형 교정이 순환 개선의 기반이 됩니다.`;
        if (score>6)
          return `<strong>${name}</strong>의 체형 불균형이 특정 부위 지방 분포에 영향을 줍니다. 자세·체형 교정이 선행되어야 운동 효율과 순환이 개선됩니다.`;
        if (score>4)
          return `자세 패턴이 부위별 지방 축적에 영향을 주고 있습니다. 골반·척추 정렬 교정으로 대사 효율을 높입니다.`;
        return `체형 기반은 양호합니다. ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 맞춤 세부 자세 교정으로 대사 효율을 높입니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_hasLIPO)    a.push('시술 후 림프 순환 재활 루틴');
        else             a.push('체형 불균형 부위 분석');
        if (_bcIsCirc)   a.push('림프 드레나쥐 운동');
        else             a.push('자세 교정 루틴');
        a.push('BC 맞춤 스트레칭');
        return a.slice(0,3);
      })(),
    },
    {
      key:'한방',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><path d="M12 21V11"/><path d="M12 14c-4 0-7-2.6-7-7 4.4 0 7 2.6 7 7Z"/><path d="M12.5 11.5c0-4 2.6-7 7-7 0 4.4-2.6 7-7 7Z"/></svg>', color:'#1A8C5B',
      expert:'한의학·동양의학 전문가',
      title:'한방 기질 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_ohWood)       t.push('간담 기능 강화 필요');
        if (_ohFire)       t.push('심소장 과열 조절');
        if (_ohEarth)      t.push('비위 습담 제거');
        if (_ohMetal)      t.push('폐대장 기운 보강');
        if (_ohWater)      t.push('신방광 음기 보충');
        if (score>5.5 && !t.length) t.push('기혈 순환 저하','체질 불균형');
        else if (score>3.5 && t.length<2) t.push('기혈 흐름 주의');
        else if (t.length<2) t.push('기혈 순환 양호');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        var ohDesc = _ohWood?'목(木) 간담 기능':_ohFire?'화(火) 심소장 과열':_ohEarth?'토(土) 비위 습담':_ohMetal?'금(金) 폐대장 기운':_ohWater?'수(水) 신방광 음기':'오행 기질';
        if (score>5.5)
          return `<strong>${name}</strong>의 ${ohDesc} 불균형이 감지됩니다. 한방적 접근으로 ${_bcCode_p6 ? _bcCode_p6+'형' : ''} 체질 기반 처방을 보완하면 효과가 배가됩니다.`;
        if (score>3.5)
          return `${ohDesc}에 따른 특이 패턴이 있습니다. 계절·체질별 식이 보완이 전체 처방 효율을 높입니다.`;
        return `${ohDesc} 기반은 안정적입니다. 계절·시간대 맞춤 보완으로 최적화합니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_ohWood)    a.push('간담 강화 처방 (산미류 식이)');
        else if (_ohFire) a.push('심화 진정 처방 (고미류 보완)');
        else if (_ohEarth) a.push('비위 습담 제거 처방');
        else if (_ohMetal) a.push('폐기 보강 처방 (신미류 식이)');
        else if (_ohWater) a.push('신음 보충 처방 (함미류 식이)');
        else            a.push('오행 기질 처방 확인');
        a.push('한방 식이 보완 목록');
        a.push('체질별 금기 식품 체크');
        return a.slice(0,3);
      })(),
    },
    {
      key:'관리',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/><path d="M4.6 6.5 3 5M19.4 6.5 21 5M4 11H2M22 11h-2"/></svg>', color:'#3EB8A0',
      expert:'생활습관·코칭 전문가',
      title:'생활 습관·대사 관리 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasDIABETES)  t.push('혈당 수치 집중 관리');
        if (_hasHTN)       t.push('혈압 일일 모니터링');
        if (_hasFATTY)     t.push('지방간 식이·운동 관리');
        if (score>6 && !t.length) t.push('대사위험 관리 시급','습관 자동화 필요');
        else if (score>4 && t.length<2) t.push('생활 루틴 점검 필요');
        else if (t.length<2) t.push('데일리 루틴 최적화');
        if (t.length < 2)   t.push('습관 자동화 설계');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        var rfDesc = [];
        if (_hasDIABETES) rfDesc.push('혈당');
        if (_hasHTN)      rfDesc.push('혈압');
        if (_hasFATTY)    rfDesc.push('지방간');
        if (rfDesc.length)
          return `<strong>${name}</strong>의 ${rfDesc.join('·')} 지표가 복합 관리를 요구합니다. 이 지표들이 안정되지 않으면 체중 감량 효과가 유지되지 않습니다.`;
        if (score>6)
          return `<strong>${name}</strong>의 대사 위험 지표가 높습니다. 혈압·혈당·지방간 등 복합 관리 없이는 체중 감량 효과가 지속되지 않습니다.`;
        if (score>4)
          return `<strong>${name}</strong>의 처방이 지속되려면 일상 루틴에 녹아들어야 합니다. 대사 모니터링과 습관화 설계를 병행합니다.`;
        return `습관 기반이 안정적입니다. 처방을 일상 루틴에 자동화하는 단계로 진입합니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_hasDIABETES)  a.push('공복혈당·HbA1c 추적 루틴');
        if (_hasHTN)       a.push('혈압 일일 측정 시스템');
        if (_hasFATTY)     a.push('지방간 개선 식이·운동 프로토콜');
        if (!a.length)     a.push('대사위험 지표 체크');
        a.push('아침 루틴 설계');
        if (a.length < 3)  a.push('습관 트래킹 시스템');
        return a.slice(0,3);
      })(),
    },
    {
      key:'시술',   icon:'✨', color:'#E67E22',
      expert:'미용·시술 전문가',
      title:'보조 시술 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasANTI)                              t.push('항응고제·이소트레티노인 시술 금기');
        if (_hasLIPO)                              t.push('재시술 적합성 재검토');
        if (score>6 && !t.length)                  t.push('시술 금기 체크 시급','BC 맞춤 시술 필요');
        else if (score>4 && t.length<2)            t.push('시술 타이밍 검토');
        else if (t.length<2)                       t.push('BC 맞춤 시술 선별');
        if (_bcIsCirc)                             t.push('부종 위험 시술 배제');
        if (t.length < 2)                          t.push('시술 타이밍 최적화');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasANTI)
          return `<strong>${name}</strong>의 항응고제 또는 이소트레티노인 복용으로 인해 대부분의 침습적 시술이 금기 대상입니다. 처방 변경 후 시술 적합성을 재평가해야 합니다.`;
        if (_hasLIPO)
          return `<strong>${name}</strong>의 지방흡입 이력으로 재시술 적합성을 신중히 검토해야 합니다. 기존 시술 부위의 조직 상태와 순환 회복 여부 확인 후 결정합니다.`;
        if (score>6)
          return `<strong>${name}</strong>의 체형 변화에 보조 시술이 유효할 수 있습니다. 단, 기저 순환·체형 문제가 해결되지 않은 상태의 시술은 오히려 역효과가 납니다.`;
        if (score>4)
          return `보조 시술로 체형 목표를 앞당길 수 있습니다. ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 기질 검토 후 적합한 시술을 선별합니다.`;
        return `기반 처방 효과가 먼저 쌓여야 시술 효율이 최대화됩니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_hasANTI)    a.push('복약 중단 후 시술 적합성 재평가');
        else if (_hasLIPO) a.push('기존 시술 부위 조직 상태 확인');
        else             a.push('BC 맞춤 시술 목록 확인');
        a.push('시술 금기 체크');
        a.push('시술 전 기반 조건 충족');
        return a.slice(0,3);
      })(),
    },
    {
      key:'약물',   icon:'<svg class="lic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="width:var(--icsz,16px);height:var(--icsz,16px)"><path d="M10.5 3.9 3.9 10.5a4.7 4.7 0 0 0 6.6 6.6l6.6-6.6a4.7 4.7 0 0 0-6.6-6.6Z"/><path d="M7.2 7.2l6.6 6.6"/></svg>', color:'#7B1FA2',
      expert:'약학·보조요법 전문가',
      title:'약물·보충제 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasSTEROID)   t.push('스테로이드 대사 교란 위험');
        if (_hasANTI)      t.push('항응고제·약물 상호작용 필수 체크');
        if (_hasDIABETES)  t.push('당뇨약 보충제 상호작용 확인');
        if (score>6 && !t.length) t.push('복약 대사 충돌 주의','BC 보충제 긴급 점검');
        else if (score>4 && t.length<2) t.push('보충제 조정 필요');
        else if (t.length<2) t.push('BC 맞춤 보충제');
        if (t.length < 2)   t.push('복용 중인 약물 점검');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasSTEROID)
          return `<strong>${name}</strong>의 스테로이드 복용 이력이 대사 경로와 직접 충돌합니다. 스테로이드×보충제 조합 점검과 중단 후 대사 회복 프로토콜이 다른 모든 처방보다 우선합니다.`;
        if (_hasANTI)
          return `<strong>${name}</strong>의 항응고제 또는 이소트레티노인 복용이 다수 보충제와 심각한 상호작용을 일으킬 수 있습니다. 모든 보충제를 처방 의사와 반드시 확인해야 합니다.`;
        if (score>6)
          return `<strong>${name}</strong>의 현재 복용 약물이 대사 경로와 충돌할 가능성이 있습니다. BC×복약 조합 점검이 다른 모든 처방보다 우선합니다.`;
        if (score>4)
          return `보충제와 약물 상호작용을 점검합니다. ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 기질에 맞는 보충제로 교체하면 처방 효율이 높아집니다.`;
        return `복약 이력이 안정적입니다. ${_bcCode_p6 ? _bcCode_p6+'형' : 'BC'} 맞춤 보충제로 처방 효과를 극대화합니다.`;
      },
      actions: (()=>{
        var a = ['현재 복용 목록 정리'];
        if (_hasSTEROID)   a.push('스테로이드 중단 후 대사 회복 프로토콜');
        else if (_hasANTI) a.push('항응고제·보충제 상호작용 전문의 확인');
        else               a.push('BC 맞춤 보충제 확인');
        a.push('약물-영양소 상호작용 체크');
        return a.slice(0,3);
      })(),
    },
    {
      key:'철학',   icon:'🔮', color:'#E67E22',
      expert:'목표 설계·삶의 방향 코치',
      title:'목표·철학 진단',
      tagsFn:(score)=>{
        var t = [];
        if (_hasYOYO)      t.push('요요 차단 마인드셋 재정립');
        if (score>6.5)     t.push('목표 재정의 필요','동기 지속 설계');
        else if (score>4)  t.push('목표 구체화','장기 유지 전략');
        else               t.push('목표 명확화','비전 고도화');
        if (_ohWood)       t.push('성장·확장 목표 설계');
        if (t.length < 2)  t.push('철학적 기반 강화');
        return t.slice(0,3);
      },
      whyFn:(score,name)=>{
        if (_hasYOYO && score>5)
          return `<strong>${name}</strong>의 반복 요요 경험은 목표 정의 방식과 직결됩니다. '체중 감량'이 아닌 '영구적 체질 전환'으로 목표를 재정의하지 않으면 동일 패턴이 반복됩니다.`;
        if (score>6.5)
          return `<strong>${name}</strong>이 원하는 몸과 삶의 연결고리가 아직 명확하지 않습니다. 목표를 깊이 정의하지 않으면 처방을 따르다 포기하는 패턴이 반복됩니다.`;
        if (score>4)
          return `목표를 더 구체적으로 정의하면 처방 지속력이 올라갑니다. ${_bcCode_p6 ? _bcCode_p6+'형에 맞는' : ''} 장기 유지 철학을 구체화합니다.`;
        return `<strong>${name}</strong>이 원하는 몸과 삶의 연결고리를 명확히 하는 것이 모든 처방의 마지막 접착제입니다.`;
      },
      actions: (()=>{
        var a = [];
        if (_hasYOYO)   a.push('요요 차단 장기 목표 재설계');
        else            a.push('목표 체중 의미 탐구');
        a.push('장기 유지 비전 설계');
        a.push('요요 차단 마인드셋');
        return a.slice(0,3);
      })(),
    },
  ];
"""

# ═══════════════════════════════════════════════════════════════
# v4용 DX_11_BASE (이모지 아이콘 사용, 동일 로직)
# ═══════════════════════════════════════════════════════════════
NEW_DX_11_BASE_V4 = NEW_DX_11_BASE_HOSPITAL\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><path d=\"M6 3v7a2.2 2.2 0 0 0 4.4 0V3\"/><path d=\"M8.2 10.5V21\"/><path d=\"M16.5 3c-1.6 1.4-2.2 3.2-2.2 5.2 0 1.7.8 2.8 2.2 3V21\"/></svg>',   color:'#E8631A',",
           "icon:'🍽️', color:'#E8631A',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><path d=\"M9.5 4.2a2.7 2.7 0 0 0-2.6 2.2 2.6 2.6 0 0 0-1.8 4.2A2.8 2.8 0 0 0 6.4 15a2.7 2.7 0 0 0 2.6 3.4h.5V4.2Z\"/><path d=\"M14.5 4.2a2.7 2.7 0 0 1 2.6 2.2 2.6 2.6 0 0 1 1.8 4.2A2.8 2.8 0 0 1 17.6 15a2.7 2.7 0 0 1-2.6 3.4h-.5V4.2Z\"/><path d=\"M12 4.2v14.2M12 21v-2.6\"/></svg>',   color:'#9C27B0',",
           "icon:'🧠', color:'#9C27B0',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><circle cx=\"12\" cy=\"12\" r=\"2.2\"/><path d=\"M12 9.8c0-2.4-1-4.3-2.6-4.3S6.8 7 8.6 9.4M14.2 12c2.3 0 4.2-1 4.2-2.6s-1.5-2.6-3.9-.8M12 14.2c0 2.4 1 4.3 2.6 4.3s2.6-1.5.8-3.9M9.8 12c-2.4 0-4.3 1-4.3 2.6s1.5 2.6 3.9.8\"/></svg>',   color:'#C0397A',",
           "icon:'🌸', color:'#C0397A',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><circle cx=\"13.5\" cy=\"4\" r=\"1.6\"/><path d=\"M7.5 21l3-5.8-2.6-3 1-5.2L12 9.5l3.2 1.2\"/><path d=\"M5.5 11.4 9 8.6M15.2 14.8l2 2.6.9 3.6\"/></svg>',   color:'#4A8C1C',",
           "icon:'🏃', color:'#4A8C1C',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><path d=\"M20 14.2A8.1 8.1 0 0 1 9.8 4 8.3 8.3 0 1 0 20 14.2Z\"/></svg>',   color:'#3F51B5',",
           "icon:'🌙', color:'#3F51B5',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><path d=\"M8.6 15.4 15.4 8.6\"/><path d=\"M8.6 15.4a2.3 2.3 0 1 0-3 3 2.3 2.3 0 1 0 3 3 2.3 2.3 0 0 0 3-3\"/><path d=\"M15.4 8.6a2.3 2.3 0 1 0 3-3 2.3 2.3 0 1 0-3-3 2.3 2.3 0 0 0-3 3\"/></svg>',   color:'#6B4EAA',",
           "icon:'🦴', color:'#6B4EAA',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><path d=\"M12 21V11\"/><path d=\"M12 14c-4 0-7-2.6-7-7 4.4 0 7 2.6 7 7Z\"/><path d=\"M12.5 11.5c0-4 2.6-7 7-7 0 4.4-2.6 7-7 7Z\"/></svg>',   color:'#1A8C5B',",
           "icon:'🌿', color:'#1A8C5B',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><circle cx=\"12\" cy=\"8\" r=\"3.4\"/><path d=\"M5.5 20a6.5 6.5 0 0 1 13 0\"/><path d=\"M4.6 6.5 3 5M19.4 6.5 21 5M4 11H2M22 11h-2\"/></svg>',   color:'#3EB8A0',",
           "icon:'💆', color:'#3EB8A0',")\
  .replace("icon:'<svg class=\"lic\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:var(--icsz,16px);height:var(--icsz,16px)\"><path d=\"M10.5 3.9 3.9 10.5a4.7 4.7 0 0 0 6.6 6.6l6.6-6.6a4.7 4.7 0 0 0-6.6-6.6Z\"/><path d=\"M7.2 7.2l6.6 6.6\"/></svg>',   color:'#7B1FA2',",
           "icon:'💊', color:'#7B1FA2',")

def patch_file(filepath, is_v4=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    total = len(lines)
    print(f"\n[{filepath}] 총 {total}줄")

    # ── 1. renderP6 함수 시그니처 패치 ──────────────────────────
    if is_v4:
        sig_old = 'function renderP6(userName, fullCode, ohaengType, inputData) {\n'
        sig_new = 'function renderP6(userName, fullCode, ohaengType, inputData, bcCode_p6, redFlags_p6) {\n'
    else:
        sig_old = 'function renderP6(userName, fullCode, ohaengType, inputData) {\n'
        sig_new = 'function renderP6(userName, fullCode, ohaengType, inputData, bcCode_p6, redFlags_p6) {\n'

    sig_idx = None
    for i, line in enumerate(lines):
        if sig_old in line:
            sig_idx = i
            break
    if sig_idx is None:
        print(f"  [ERROR] renderP6 시그니처를 찾지 못했습니다.")
        return False
    lines[sig_idx] = lines[sig_idx].replace(sig_old, sig_new)
    print(f"  [OK] renderP6 시그니처 패치: line {sig_idx+1}")

    # ── 2. 호출부 패치 ───────────────────────────────────────────
    call_old = '  renderP6(userName, fullCode, ohaengType, data);\n'
    call_new = '  renderP6(userName, fullCode, ohaengType, data, bcCode, window.__RED_FLAGS__ || window._redFlags || []);\n'

    call_idx = None
    for i, line in enumerate(lines):
        if call_old in line:
            call_idx = i
            break
    if call_idx is None:
        print(f"  [ERROR] renderP6 호출부를 찾지 못했습니다.")
        return False
    lines[call_idx] = lines[call_idx].replace(call_old, call_new)
    print(f"  [OK] renderP6 호출부 패치: line {call_idx+1}")

    # ── 3. DX_11_BASE 교체 (hospital / v4 구분) ─────────────────
    # 시작 마커: "  // 11개 진단 전체 정의 — 다중축 가중합 긴급도 계산"
    # 종료 마커: "  ];" (DX_11_BASE 배열 끝)
    if is_v4:
        start_marker = '  // 11개 진단 전체 정의 — 다중축 가중합 긴급도 계산 (v4 0~100 스케일 → /10 정규화)\n'
        dx_key_name  = 'DX_AXIS_WEIGHTS_V4'
    else:
        start_marker = '  // 11개 진단 전체 정의 — 다중축 가중합 긴급도 계산\n'
        dx_key_name  = 'DX_AXIS_WEIGHTS'

    dx_start = None
    # sig_idx 이후에서 찾기
    for i in range(sig_idx, len(lines)):
        if start_marker in lines[i]:
            dx_start = i
            break

    if dx_start is None:
        print(f"  [ERROR] DX_11_BASE 시작 마커를 찾지 못했습니다: {repr(start_marker)}")
        # fallback: const DX_11_BASE = [ 로 찾기
        for i in range(sig_idx, len(lines)):
            if '  const DX_11_BASE = [\n' in lines[i]:
                dx_start = i
                break
        if dx_start is None:
            print(f"  [ERROR] const DX_11_BASE 도 찾지 못했습니다.")
            return False
        print(f"  [WARN] fallback으로 const DX_11_BASE 발견: line {dx_start+1}")
    else:
        print(f"  [OK] DX_11_BASE 시작: line {dx_start+1}")

    # 종료 마커: "];  다음 줄이 빈줄이거나 // 주석
    dx_end = None
    brace_depth = 0
    bracket_depth = 0
    in_dx = False
    for i in range(dx_start, len(lines)):
        l = lines[i]
        if 'const DX_11_BASE = [' in l:
            in_dx = True
        if in_dx:
            bracket_depth += l.count('[') - l.count(']')
            if bracket_depth <= 0 and in_dx and i > dx_start:
                dx_end = i
                break

    if dx_end is None:
        print(f"  [ERROR] DX_11_BASE 끝을 찾지 못했습니다.")
        return False
    print(f"  [OK] DX_11_BASE 끝: line {dx_end+1}")

    # 교체 대상: dx_start ~ dx_end (포함)
    new_block = NEW_DX_11_BASE_V4 if is_v4 else NEW_DX_11_BASE_HOSPITAL
    lines[dx_start:dx_end+1] = [new_block]
    print(f"  [OK] DX_11_BASE 교체 완료 ({dx_end - dx_start + 1}줄 → {len(new_block.splitlines())+1}줄)")

    # ── 4. _rfl 변수 패치: redFlags_p6 우선 사용 ────────────────
    # hospital: const _rfl = window._redFlags || [];
    # v4:       const _rfl_v4 = window._redFlags || [];
    if is_v4:
        rfl_old = '  const _rfl_v4 = window._redFlags || [];\n'
        rfl_new = '  const _rfl_v4 = (Array.isArray(redFlags_p6) ? redFlags_p6 : (window.__RED_FLAGS__ || window._redFlags || []));\n'
    else:
        rfl_old = '  const _rfl = window._redFlags || [];\n'
        rfl_new = '  const _rfl = (Array.isArray(redFlags_p6) ? redFlags_p6 : (window.__RED_FLAGS__ || window._redFlags || []));\n'

    rfl_idx = None
    for i in range(sig_idx, len(lines)):
        if (rfl_old in lines[i]):
            rfl_idx = i
            break
    if rfl_idx is not None:
        lines[rfl_idx] = lines[rfl_idx].replace(rfl_old, rfl_new)
        print(f"  [OK] _rfl 변수 패치: line {rfl_idx+1}")
    else:
        print(f"  [WARN] _rfl 변수를 찾지 못했습니다 (이미 패치됐을 수 있음)")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"  [DONE] 저장 완료: {filepath}")
    return True


if __name__ == '__main__':
    import sys
    h_ok = patch_file('/home/user/webapp/public/result-hospital.html', is_v4=False)
    v4_ok = patch_file('/home/user/webapp/public/result-v4.html', is_v4=True)
    if h_ok and v4_ok:
        print("\n✅ hospital + v4 동시 패치 성공")
        sys.exit(0)
    else:
        print("\n❌ 패치 실패")
        sys.exit(1)
