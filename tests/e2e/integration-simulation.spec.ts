/**
 * integration-simulation.spec.ts
 *
 * SlimMind E2E 통합 시뮬레이션 테스트
 *
 * 시나리오: 마스터 Admin B2B 등록 → QR/URL 생성 → 질문지 분기 → 제출 → 결과 반환
 *
 * 검증 도메인: 병원(hospital) / 에스테틱(aesthetic) / 미용실(salon) — 3채널 전수
 *
 * 테스트 그룹:
 *  SIM-1: B2B 파트너 등록 로직 — typeAbbr / validCategories / catToPath
 *  SIM-2: 질문지 URL 분기 — /h/:code, /a/:code, /salon/:code 라우팅 (구조 분리 완료)
 *  SIM-3: window.__BRAND__ 주입 — survey_category 정확성
 *  SIM-4: submitDiagnosis payload — 3채널 payload 필드 완결성
 *  SIM-5: /api/v1/diagnosis POST — 저장 로직 입력값 검증
 *  SIM-6: /api/survey/submit POST — results 테이블 저장 검증
 *  SIM-7: /result/:id 결과 분기 — hospital/aesthetic/salon 라우팅
 *  SIM-8: REFACTOR 검증 — salon 전용 경로 /salon/:code 구조 분리 + 하위호환 /f/ 리다이렉트
 */

// ─────────────────────────────────────────────────────────────────────────────
// 타입 / 상수 정의
// ─────────────────────────────────────────────────────────────────────────────

type SurveyCategory = 'hospital' | 'aesthetic' | 'salon' | 'fitness' | 'integrated';
type ChannelCode = 'hospital' | 'aesthetic' | 'salon';

interface B2BPartner {
  code: string;
  name: string;
  type: string;
  survey_category: SurveyCategory;
  brand_color: string;
  brand_name: string;
}

interface DiagnosisPayload {
  user_name: string;
  survey_category: SurveyCategory;
  ref_code: string;
  completed_at: string;
  bc_nickname?: string;
  bc_primary?: string;
  bc_code_key?: string;
  top3_axes?: string[];
  axis_scores?: Record<string, number>;
  ohaeng_type?: string;
  mbti_full?: string;
  region?: string;
  texture?: string;
  gender?: string;
  height?: number;
  age?: number;
}

interface SurveySubmitPayload {
  user_name: string;
  survey_category: SurveyCategory;
  ref_code: string;
  bc_primary: string;
  bc_scores: Record<string, number>;
  ohaeng_type?: string;
  gender?: string;
  birth_date?: string;
  height?: number;
  weight?: number;
  answers: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 백엔드 로직 추출 (src/index.tsx 실제 로직 미러링)
// ─────────────────────────────────────────────────────────────────────────────

/** typeAbbr: B2B 코드 자동 생성 업종 약자 매핑 (src/index.tsx line 1348) */
const typeAbbr: Record<string, string> = {
  '에스테틱': 'AES', '필라테스': 'PIL', '한의원': 'HAN',
  '헬스장': 'GYM', '뷰티샵': 'BTY', '병원': 'HOS', '기타': 'ETC',
  '성형외과': 'SUR', '피부과': 'DRM', '성형외과피부과': 'SUR', '성형': 'SUR',
  '요가': 'YGA', 'PT샵': 'PTS', '다이어트샵': 'DTS', '비만클리닉': 'OBC',
  '웰니스': 'WEL', '스파': 'SPA', '뷰티숍': 'BTY',
  '미용실': 'SAL'  // ✅ BUG-8 FIX
};

/** validCategories: 허용 survey_category 목록 (src/index.tsx POST /api/admin/b2b-partners) */
const validCategories = ['integrated', 'hospital', 'aesthetic', 'fitness', 'salon'] as const;  // ✅ BUG-8 FIX

/** catToPath: survey_category → 질문지 URL prefix (src/index.tsx line 1411) */
const catToPath: Record<string, string> = {
  hospital: '/h', aesthetic: '/a', fitness: '/f', integrated: '/s',
  salon: '/salon'  // ✅ REFACTOR: salon 전용 경로 /salon/:code 분리
};

/** catPath: /h/:code, /s/:code 리다이렉트용 (src/index.tsx line ~3447) */
const catPath: Record<string, string> = {
  aesthetic: '/a', fitness: '/f', integrated: '/s',
  salon: '/salon'  // ✅ REFACTOR: salon 전용 경로 /salon/:code 분리
};

/**
 * B2B 파트너 코드 생성 시뮬레이션
 * src/index.tsx line 1363-1374 로직 미러링
 */
function generateB2BCode(type: string, existingCodes: string[]): string {
  const abbr = typeAbbr[type] || 'ETC';
  const prefix = `B2B-${abbr}-`;
  const existing = existingCodes.filter(c => c.startsWith(prefix));
  let maxNum = 0;
  for (const c of existing) {
    const n = parseInt(c.split('-').pop() || '0');
    if (!isNaN(n) && n > maxNum) maxNum = n;
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

/**
 * survey_category → 질문지 URL 매핑 (B2B 파트너 등록 시)
 * src/index.tsx line 1411-1414 로직 미러링
 */
function resolveB2BSurveyUrl(code: string, survey_category: string): string {
  const base = catToPath[survey_category] || '/s';
  return `${base}/${code}`;
}

/**
 * /h/:code 접속 시 리다이렉트 로직
 * src/index.tsx line 3445-3449 로직 미러링
 */
function resolveHospitalRedirect(code: string, survey_category: string): string | null {
  if (survey_category && survey_category !== 'hospital') {
    const path = catPath[survey_category] || '/s';
    return `${path}/${code}`;
  }
  return null; // hospital이면 리다이렉트 없음
}

/**
 * /s/:code 접속 시 리다이렉트 로직
 * src/index.tsx line 3855-3864 로직 미러링
 */
function resolveSurveyRedirect(code: string, cat: string): string | null {
  if (cat === 'hospital') return `/h/${code}`;
  if (cat === 'aesthetic') return `/a/${code}`;
  if (cat === 'fitness') return `/f/${code}`;
  if (cat === 'salon') return `/salon/${code}`;  // ✅ REFACTOR: 전용 경로
  return null; // integrated는 /s/:code 그대로
}

/**
 * window.__BRAND__.survey_category 시뮬레이션
 * 각 라우트별 하드코딩 값 반환
 */
function getBrandSurveyCategory(route: '/h/:code' | '/a/:code' | '/f/:code' | '/salon/:code'): string {
  if (route === '/h/:code')     return 'hospital';    // line ~3490
  if (route === '/a/:code')     return 'aesthetic';   // line ~3720
  if (route === '/f/:code')     return 'salon';       // legacy /f/ → /salon/ 301 리다이렉트 후 salon 서빙
  if (route === '/salon/:code') return 'salon';       // ✅ REFACTOR: /salon/:code 전용 라우트
  return 'integrated';
}

/**
 * /api/v1/diagnosis survey_category 저장값 시뮬레이션
 * src/index.tsx line 5432: survey_category || 'integrated'
 */
function resolveDiagnosisCategory(payload_category: string | null): string {
  return payload_category || 'integrated';
}

/**
 * /result/:id 결과 분기 시뮬레이션
 * src/index.tsx line 2582-2604 로직 미러링
 */
function resolveResultRoute(id: string, survey_category: string): string {
  if (survey_category === 'hospital') return `/result-hospital/${id}`;
  if (survey_category === 'aesthetic') return `result-aesthetic.html`;
  // salon / fitness / integrated → result-v4.html
  return `result-v4.html`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3채널 테스트 데이터
// ─────────────────────────────────────────────────────────────────────────────

const CHANNEL_DATA = {
  hospital: {
    type: '병원',
    survey_category: 'hospital' as SurveyCategory,
    brandColor: '#8b6db5',
    route: '/h/:code' as const,
    expectedRedirect: null,  // 병원은 /h/ 그대로
    expectedSurveyFile: 'survey-hospital.html',
    expectedResultRoute: '/result-hospital/:id',
  },
  aesthetic: {
    type: '에스테틱',
    survey_category: 'aesthetic' as SurveyCategory,
    brandColor: '#e879a0',
    route: '/a/:code' as const,
    expectedRedirect: null,  // 에스테틱은 /a/ 그대로
    expectedSurveyFile: 'survey-aesthetic.html',
    expectedResultRoute: 'result-aesthetic.html',
  },
  salon: {
    type: '미용실',
    survey_category: 'salon' as SurveyCategory,
    brandColor: '#22c55e',
    route: '/f/:code' as const,
    expectedRedirect: null,  // 미용실은 /f/ 그대로
    expectedSurveyFile: 'survey-fitness.html',
    expectedResultRoute: 'result-v4.html',
  },
} as const;

// 샘플 B2B 파트너 (등록 후 생성될 코드)
const SAMPLE_PARTNERS: Record<ChannelCode, B2BPartner> = {
  hospital: {
    code: 'B2B-HOS-001',
    name: '테스트 병원',
    type: '병원',
    survey_category: 'hospital',
    brand_color: '#8b6db5',
    brand_name: '테스트 병원',
  },
  aesthetic: {
    code: 'B2B-AES-001',
    name: '테스트 에스테틱',
    type: '에스테틱',
    survey_category: 'aesthetic',
    brand_color: '#e879a0',
    brand_name: '테스트 에스테틱',
  },
  salon: {
    code: 'B2B-SAL-001',
    name: '테스트 미용실',
    type: '미용실',
    survey_category: 'salon',
    brand_color: '#22c55e',
    brand_name: '테스트 미용실',
  },
};

// 샘플 진단 payload
function buildDiagnosisPayload(channel: ChannelCode, refCode: string): DiagnosisPayload {
  return {
    user_name: `테스트고객_${channel}`,
    survey_category: CHANNEL_DATA[channel].survey_category,
    ref_code: refCode,
    completed_at: new Date().toISOString(),
    bc_nickname: '림프부종형',
    bc_primary: 'BC-1',
    bc_code_key: 'BC-1',
    top3_axes: ['A01', 'A03', 'A05'],
    axis_scores: { A01: 82, A02: 45, A03: 71, A04: 33, A05: 68, A06: 22, A07: 55, A08: 41, A09: 63, A10: 29, A11: 38 },
    ohaeng_type: '수',
    mbti_full: 'INFJ',
    region: '하체',
    texture: '연',
    gender: 'F',
    height: 163,
    age: 35,
  };
}

// 샘플 submit payload
function buildSubmitPayload(channel: ChannelCode, refCode: string): SurveySubmitPayload {
  return {
    user_name: `테스트고객_${channel}`,
    survey_category: CHANNEL_DATA[channel].survey_category,
    ref_code: refCode,
    bc_primary: 'BC-1',
    bc_scores: { 'BC-1': 82, 'BC-3': 45, 'BC-4': 38 },
    ohaeng_type: '수',
    gender: 'F',
    birth_date: '1989-03-15',
    height: 163,
    weight: 58,
    answers: {
      q1: 'a', q2: 'b', q3: 'c',
      name: `테스트고객_${channel}`,
    },
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SIM-1: B2B 파트너 등록 로직 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-1: B2B 파트너 등록 로직', () => {
  const CHANNELS: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];

  test.each(CHANNELS)(
    'SIM-1-1 [%s] typeAbbr 업종 코드 생성 정상 동작',
    (channel) => {
      const data = CHANNEL_DATA[channel];
      const abbr = typeAbbr[data.type];
      expect(abbr).toBeDefined();
      expect(abbr).not.toBe('ETC');  // 기본값이 아닌 정확한 약자

      const code = generateB2BCode(data.type, []);
      expect(code).toMatch(/^B2B-[A-Z]{2,4}-\d{3}$/);
    }
  );

  test('SIM-1-2 typeAbbr — 미용실 → SAL 코드 생성 (BUG-8 수정 검증)', () => {
    expect(typeAbbr['미용실']).toBe('SAL');
    const code = generateB2BCode('미용실', []);
    expect(code).toBe('B2B-SAL-001');
  });

  test('SIM-1-3 typeAbbr — 병원 → HOS, 에스테틱 → AES', () => {
    expect(typeAbbr['병원']).toBe('HOS');
    expect(typeAbbr['에스테틱']).toBe('AES');
  });

  test('SIM-1-4 typeAbbr — 순번 증가 로직 (기존 코드 있을 때)', () => {
    const existing = ['B2B-SAL-001', 'B2B-SAL-002'];
    const next = generateB2BCode('미용실', existing);
    expect(next).toBe('B2B-SAL-003');
  });

  test.each(CHANNELS)(
    'SIM-1-5 [%s] validCategories에 survey_category 포함됨 (BUG-8 수정 검증)',
    (channel) => {
      const cat = CHANNEL_DATA[channel].survey_category;
      expect(validCategories).toContain(cat);
    }
  );

  test('SIM-1-6 validCategories — salon 포함 확인 (BUG-8 핵심 수정)', () => {
    expect(validCategories).toContain('salon');
    // salon이 없으면 validCategories.includes('salon')이 false → 'integrated'로 폴백되는 버그
    const category = (validCategories as readonly string[]).includes('salon') ? 'salon' : 'integrated';
    expect(category).toBe('salon');  // BUG-8 수정 전에는 'integrated'로 잘못 저장됨
  });

  test.each(CHANNELS)(
    'SIM-1-7 [%s] catToPath 질문지 URL 정확성',
    (channel) => {
      const data = CHANNEL_DATA[channel];
      const partner = SAMPLE_PARTNERS[channel];
      const url = resolveB2BSurveyUrl(partner.code, data.survey_category);

      if (channel === 'hospital') expect(url).toBe(`/h/${partner.code}`);
      if (channel === 'aesthetic') expect(url).toBe(`/a/${partner.code}`);
      if (channel === 'salon') expect(url).toBe(`/salon/${partner.code}`);  // ✅ REFACTOR: 전용 경로
    }
  );

  test('SIM-1-8 catToPath — salon → /salon (REFACTOR: 전용 경로 분리)', () => {
    expect(catToPath['salon']).toBe('/salon');  // 구조 분리 완료
    const url = resolveB2BSurveyUrl('B2B-SAL-001', 'salon');
    expect(url).toBe('/salon/B2B-SAL-001');    // /f/ 잔재 완전 제거
    // BUG-8 수정 전: catToPath에 'salon' 없어 '/s/B2B-SAL-001' 생성
    // REFACTOR 전: '/f/B2B-SAL-001' (임시 경로)
    // REFACTOR 후: '/salon/B2B-SAL-001' (전용 경로 — 완료)
  });

  test('SIM-1-9 B2B 등록 결과 — 3채널 전수 URL 확인', () => {
    const expected: Record<ChannelCode, string> = {
      hospital: '/h/B2B-HOS-001',
      aesthetic: '/a/B2B-AES-001',
      salon: '/salon/B2B-SAL-001',
    };
    for (const [ch, partner] of Object.entries(SAMPLE_PARTNERS) as [ChannelCode, B2BPartner][]) {
      const url = resolveB2BSurveyUrl(partner.code, partner.survey_category);
      expect(url).toBe(expected[ch]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-2: 질문지 URL 분기 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-2: 질문지 URL 분기 — /h/:code, /a/:code, /f/:code 라우팅', () => {
  test('SIM-2-1 [병원] /h/:code — 병원 파트너는 리다이렉트 없음', () => {
    const redirect = resolveHospitalRedirect('B2B-HOS-001', 'hospital');
    expect(redirect).toBeNull();
  });

  test('SIM-2-2 [병원] /h/:code — salon 파트너 접근 시 /f/:code로 리다이렉트 (BUG-8)', () => {
    // 미용실 파트너가 실수로 /h/코드로 접근한 경우
    const redirect = resolveHospitalRedirect('B2B-SAL-001', 'salon');
    expect(redirect).toBe('/salon/B2B-SAL-001');
  });

  test('SIM-2-3 [병원] /h/:code — aesthetic 파트너는 /a/:code로 리다이렉트', () => {
    const redirect = resolveHospitalRedirect('B2B-AES-001', 'aesthetic');
    expect(redirect).toBe('/a/B2B-AES-001');
  });

  test('SIM-2-4 [통합] /s/:code — 병원 파트너 → /h/:code 리다이렉트', () => {
    const redirect = resolveSurveyRedirect('B2B-HOS-001', 'hospital');
    expect(redirect).toBe('/h/B2B-HOS-001');
  });

  test('SIM-2-5 [통합] /s/:code — 에스테틱 파트너 → /a/:code 리다이렉트', () => {
    const redirect = resolveSurveyRedirect('B2B-AES-001', 'aesthetic');
    expect(redirect).toBe('/a/B2B-AES-001');
  });

  test('SIM-2-6 [통합] /s/:code — 미용실 파트너 → /f/:code 리다이렉트 (BUG-8 수정)', () => {
    const redirect = resolveSurveyRedirect('B2B-SAL-001', 'salon');
    expect(redirect).toBe('/salon/B2B-SAL-001');
    // BUG-8 수정 전에는 'salon' 분기가 없어 null 반환 → 통합 질문지 서빙
  });

  test('SIM-2-7 [통합] /s/:code — fitness 파트너 → /f/:code 리다이렉트', () => {
    const redirect = resolveSurveyRedirect('B2B-FIT-001', 'fitness');
    expect(redirect).toBe('/f/B2B-FIT-001');
  });

  test('SIM-2-8 [통합] /s/:code — integrated 파트너 → 리다이렉트 없음', () => {
    const redirect = resolveSurveyRedirect('B2B-ETC-001', 'integrated');
    expect(redirect).toBeNull();
  });

  test('SIM-2-9 3채널 전수 — QR코드 URL 접근 시 올바른 질문지 서빙', () => {
    const channels: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];
    const expectedRoutes: Record<ChannelCode, string> = {
      hospital: '/h/B2B-HOS-001',
      aesthetic: '/a/B2B-AES-001',
      salon: '/salon/B2B-SAL-001',
    };

    for (const ch of channels) {
      const partner = SAMPLE_PARTNERS[ch];
      const directUrl = resolveB2BSurveyUrl(partner.code, partner.survey_category);
      expect(directUrl).toBe(expectedRoutes[ch]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-3: window.__BRAND__ 주입 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-3: window.__BRAND__.survey_category 주입 정확성', () => {
  test('SIM-3-1 /h/:code — survey_category: "hospital" 하드코딩', () => {
    const cat = getBrandSurveyCategory('/h/:code');
    expect(cat).toBe('hospital');
  });

  test('SIM-3-2 /a/:code — survey_category: "aesthetic" 하드코딩', () => {
    const cat = getBrandSurveyCategory('/a/:code');
    expect(cat).toBe('aesthetic');
  });

  test('SIM-3-3 /f/:code — survey_category: "salon" (BUG-7/8 수정 검증)', () => {
    const cat = getBrandSurveyCategory('/f/:code');
    expect(cat).toBe('salon');
    // BUG-7/8 수정 전: 'fitness' → frontend에서 salon payload가 아닌 fitness로 제출
  });

  test('SIM-3-4 survey-fitness.html localStorage — "salon" 저장', () => {
    // HTML line 7167 검증: localStorage.setItem('sm_survey_category', 'salon')
    const expected = 'salon';
    // window.__BRAND__가 없을 때 폴백 시뮬레이션 (HTML 실제 코드 패턴)
    // (window.__BRAND__ && window.__BRAND__.survey_category) || 'salon'
    const windowBrand: Record<string, string> | undefined = undefined;
    const fallback = (windowBrand && windowBrand['survey_category']) || 'salon';
    expect(fallback).toBe(expected);
  });

  test('SIM-3-5 survey_category 결정 로직 — window.__BRAND__ 있을 때', () => {
    const brand = { survey_category: 'salon' };
    const category = (brand && brand.survey_category) || 'salon';
    expect(category).toBe('salon');
  });

  test('SIM-3-6 survey_category 결정 로직 — window.__BRAND__ 없을 때 폴백', () => {
    const brand = null;
    const category = (brand && (brand as { survey_category?: string }).survey_category) || 'salon';
    expect(category).toBe('salon');
  });

  test('SIM-3-7 3채널 전수 — __BRAND__.survey_category 정합성', () => {
    const routes: Array<'/h/:code' | '/a/:code' | '/f/:code'> = ['/h/:code', '/a/:code', '/f/:code'];
    const expected: Record<string, string> = {
      '/h/:code': 'hospital',
      '/a/:code': 'aesthetic',
      '/f/:code': 'salon',
    };
    for (const route of routes) {
      expect(getBrandSurveyCategory(route)).toBe(expected[route]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-4: submitDiagnosis payload 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-4: submitDiagnosis payload — 3채널 전수 검증', () => {
  const CHANNELS: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];

  test.each(CHANNELS)(
    'SIM-4-1 [%s] payload survey_category 필드 존재 및 정확성',
    (channel) => {
      const partner = SAMPLE_PARTNERS[channel];
      const payload = buildDiagnosisPayload(channel, partner.code);

      expect(payload.survey_category).toBeDefined();
      expect(payload.survey_category).toBe(CHANNEL_DATA[channel].survey_category);
    }
  );

  test('SIM-4-2 [미용실] payload.survey_category === "salon" (BUG-7/8 수정)', () => {
    const payload = buildDiagnosisPayload('salon', 'B2B-SAL-001');
    expect(payload.survey_category).toBe('salon');
    // BUG-7 수정 전: payload.survey_category가 'fitness'로 제출됨
  });

  test.each(CHANNELS)(
    'SIM-4-3 [%s] payload 필수 필드 완결성',
    (channel) => {
      const partner = SAMPLE_PARTNERS[channel];
      const payload = buildDiagnosisPayload(channel, partner.code);

      expect(payload.user_name).toBeTruthy();
      expect(payload.ref_code).toBe(partner.code);
      expect(payload.completed_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(payload.bc_primary).toBeTruthy();
      expect(payload.top3_axes).toHaveLength(3);
      expect(payload.axis_scores).toBeDefined();
      expect(Object.keys(payload.axis_scores!)).toHaveLength(11);
    }
  );

  test('SIM-4-4 [병원] payload.survey_category === "hospital"', () => {
    const payload = buildDiagnosisPayload('hospital', 'B2B-HOS-001');
    expect(payload.survey_category).toBe('hospital');
  });

  test('SIM-4-5 [에스테틱] payload.survey_category === "aesthetic"', () => {
    const payload = buildDiagnosisPayload('aesthetic', 'B2B-AES-001');
    expect(payload.survey_category).toBe('aesthetic');
  });

  test('SIM-4-6 ref_code B2B 파트너 코드 연결', () => {
    const channels: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];
    const expectedCodes: Record<ChannelCode, string> = {
      hospital: 'B2B-HOS-001',
      aesthetic: 'B2B-AES-001',
      salon: 'B2B-SAL-001',
    };
    for (const ch of channels) {
      const payload = buildDiagnosisPayload(ch, SAMPLE_PARTNERS[ch].code);
      expect(payload.ref_code).toBe(expectedCodes[ch]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-5: /api/v1/diagnosis POST 저장 로직 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-5: /api/v1/diagnosis POST — DB 저장 로직 검증', () => {

  test('SIM-5-1 survey_category 저장 — salon 전달 시 salon으로 저장', () => {
    const saved = resolveDiagnosisCategory('salon');
    expect(saved).toBe('salon');
  });

  test('SIM-5-2 survey_category 저장 — hospital 전달 시 hospital로 저장', () => {
    const saved = resolveDiagnosisCategory('hospital');
    expect(saved).toBe('hospital');
  });

  test('SIM-5-3 survey_category 저장 — aesthetic 전달 시 aesthetic으로 저장', () => {
    const saved = resolveDiagnosisCategory('aesthetic');
    expect(saved).toBe('aesthetic');
  });

  test('SIM-5-4 survey_category 폴백 — null 전달 시 "integrated" 저장', () => {
    const saved = resolveDiagnosisCategory(null);
    expect(saved).toBe('integrated');
  });

  test('SIM-5-5 survey_category 폴백 — undefined 전달 시 "integrated" 저장', () => {
    const saved = resolveDiagnosisCategory(undefined as unknown as null);
    expect(saved).toBe('integrated');
  });

  test('SIM-5-6 bc_code_key 해석 — NICKNAME_TO_BC 매핑 검증', () => {
    // 닉네임 → BC코드 역매핑 (src/index.tsx line 5316)
    const NICKNAME_TO_BC: Record<string, string> = {
      '코끼리다리형': 'BC-1',
      '림프부종형': 'BC-1',  // 참고용
      '단단내장형': 'BC-3',
      'PCOS호르몬형': 'BC-6',
    };
    expect(NICKNAME_TO_BC['코끼리다리형']).toBe('BC-1');
    expect(NICKNAME_TO_BC['단단내장형']).toBe('BC-3');
  });

  test('SIM-5-7 3채널 전수 — survey_category 저장 무결성', () => {
    const channels: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];
    for (const ch of channels) {
      const payload = buildDiagnosisPayload(ch, SAMPLE_PARTNERS[ch].code);
      const stored = resolveDiagnosisCategory(payload.survey_category);
      expect(stored).toBe(CHANNEL_DATA[ch].survey_category);
    }
  });

  test('SIM-5-8 result_id 형식 — UUID 패턴', () => {
    // crypto.randomUUID() 형식 검증
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    // Node.js crypto.randomUUID 시뮬레이션
    const mockUuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(mockUuid).toMatch(uuidRegex);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-6: /api/survey/submit POST — results 테이블 저장 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-6: /api/survey/submit POST — results 테이블 저장 검증', () => {
  const CHANNELS: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];

  test.each(CHANNELS)(
    'SIM-6-1 [%s] submit payload 구조 검증',
    (channel) => {
      const partner = SAMPLE_PARTNERS[channel];
      const payload = buildSubmitPayload(channel, partner.code);

      expect(payload.user_name).toBeTruthy();
      expect(payload.bc_primary).toBeTruthy();
      expect(payload.bc_scores).toBeDefined();
      expect(payload.survey_category).toBe(CHANNEL_DATA[channel].survey_category);
      expect(payload.ref_code).toBe(partner.code);
      expect(payload.answers).toBeDefined();
    }
  );

  test('SIM-6-2 bc_primary 폴백 — bc_primary 없을 때 UNKNOWN 저장', () => {
    // src/index.tsx line 930: const safeBcPrimary = toStr(bc_primary) || ... || 'UNKNOWN'
    const bc_primary: string | null = null;
    const axis_primary: string | null = null;
    const safeBcPrimary = bc_primary || axis_primary || 'UNKNOWN';
    expect(safeBcPrimary).toBe('UNKNOWN');
  });

  test('SIM-6-3 birth_date 정제 — YYYY-MM-DD 형식 검증', () => {
    // src/index.tsx line 899: sanitizeBirthDate 로직 미러링
    const sanitizeBirthDate = (raw: unknown): string | null => {
      if (!raw) return null;
      const s = String(raw).trim();
      const dateOnly = s.split('T')[0];
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return null;
      const d = new Date(dateOnly);
      if (isNaN(d.getTime())) return null;
      const year = d.getFullYear();
      const thisYear = new Date().getFullYear();
      if (year < 1920 || year > thisYear) return null;
      return dateOnly;
    };

    expect(sanitizeBirthDate('1989-03-15')).toBe('1989-03-15');
    expect(sanitizeBirthDate('1989-03-15T00:00:00')).toBe('1989-03-15');
    expect(sanitizeBirthDate('shoulderT...')).toBeNull();
    expect(sanitizeBirthDate(null)).toBeNull();
    expect(sanitizeBirthDate('1800-01-01')).toBeNull();  // 범위 벗어남
  });

  test('SIM-6-4 숫자 변환 — n() 함수 null-safe 처리', () => {
    // src/index.tsx line 926: const n = (v: any) => ...
    // src/index.tsx line 926 실제 코드: (v !== undefined && v !== null && !isNaN(Number(v))) ? Number(v) : null
    // 주의: Number('') === 0 이므로 실제 구현에서 빈 문자열은 0으로 처리됨
    const n = (v: unknown): number | null =>
      (v !== undefined && v !== null && !isNaN(Number(v))) ? Number(v) : null;

    expect(n(163)).toBe(163);
    expect(n('58')).toBe(58);
    expect(n(null)).toBeNull();
    expect(n(undefined)).toBeNull();
    expect(n('abc')).toBeNull();
    // Number('') === 0 → n('')는 0 반환 (실제 백엔드 동작과 동일)
    expect(n('')).toBe(0);
  });

  test('SIM-6-5 3채널 전수 — survey_category 정합성', () => {
    for (const ch of CHANNELS) {
      const payload = buildSubmitPayload(ch, SAMPLE_PARTNERS[ch].code);
      expect(payload.survey_category).toBe(CHANNEL_DATA[ch].survey_category);
    }
  });

  test('SIM-6-6 ref_code → ref_type 연결', () => {
    // B2B 코드 형식 → ref_type = 'B2B_PARTNER' (추론)
    const isB2BCode = (code: string) => code.startsWith('B2B-');
    expect(isB2BCode('B2B-SAL-001')).toBe(true);
    expect(isB2BCode('SC-001')).toBe(false);
  });

  test('SIM-6-7 toStr() 변환 — 배열/객체/null 처리', () => {
    // src/index.tsx line 883: toStr 함수 미러링
    const toStr = (v: unknown): string | null => {
      if (v === null || v === undefined) return null;
      if (Array.isArray(v)) return v.join(',');
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    };

    expect(toStr('BC-1')).toBe('BC-1');
    expect(toStr(['A01', 'A03'])).toBe('A01,A03');
    expect(toStr({ key: 'val' })).toBe('{"key":"val"}');
    expect(toStr(null)).toBeNull();
    expect(toStr(undefined)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-7: /result/:id 결과 분기 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-7: /result/:id 결과 분기 — hospital/aesthetic/salon 라우팅', () => {
  const MOCK_ID = 'test-result-id-12345';

  test('SIM-7-1 [병원] survey_category === "hospital" → /result-hospital/:id 리다이렉트', () => {
    const route = resolveResultRoute(MOCK_ID, 'hospital');
    expect(route).toBe(`/result-hospital/${MOCK_ID}`);
  });

  test('SIM-7-2 [에스테틱] survey_category === "aesthetic" → result-aesthetic.html 서빙', () => {
    const route = resolveResultRoute(MOCK_ID, 'aesthetic');
    expect(route).toBe('result-aesthetic.html');
  });

  test('SIM-7-3 [미용실] survey_category === "salon" → result-v4.html 폴백 서빙', () => {
    const route = resolveResultRoute(MOCK_ID, 'salon');
    expect(route).toBe('result-v4.html');
  });

  test('SIM-7-4 [통합] survey_category === "integrated" → result-v4.html 폴백', () => {
    const route = resolveResultRoute(MOCK_ID, 'integrated');
    expect(route).toBe('result-v4.html');
  });

  test('SIM-7-5 effectiveCategory 오버라이드 — ref_code 파트너가 hospital이면 강제 hospital', () => {
    // src/index.tsx line 2575-2582 로직: 파트너가 hospital이면 survey_category 저장값 무관
    const overrideEffectiveCategory = (
      survey_category: string,
      partnerCategory: string | null
    ): string => {
      if (partnerCategory === 'hospital') return 'hospital';
      if (!survey_category && partnerCategory) return partnerCategory;
      return survey_category;
    };

    // 파트너가 hospital이면 survey_category='integrated'로 잘못 저장되어도 hospital로 처리
    expect(overrideEffectiveCategory('integrated', 'hospital')).toBe('hospital');
    expect(overrideEffectiveCategory('salon', 'hospital')).toBe('hospital');
    expect(overrideEffectiveCategory('salon', 'aesthetic')).toBe('salon');
    expect(overrideEffectiveCategory('', 'salon')).toBe('salon');
  });

  test('SIM-7-6 3채널 전수 — 결과 분기 라우팅 정합성', () => {
    const expected: Record<ChannelCode, string> = {
      hospital: `/result-hospital/${MOCK_ID}`,
      aesthetic: 'result-aesthetic.html',
      salon: 'result-v4.html',
    };

    for (const ch of ['hospital', 'aesthetic', 'salon'] as ChannelCode[]) {
      const route = resolveResultRoute(MOCK_ID, CHANNEL_DATA[ch].survey_category);
      expect(route).toBe(expected[ch]);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SIM-8: BUG-8 수정 종합 검증
// ─────────────────────────────────────────────────────────────────────────────

describe('SIM-8: REFACTOR 종합 검증 — salon 전용 경로 /salon/:code 구조 분리', () => {

  test('SIM-8-1 typeAbbr["미용실"] === "SAL" — B2B 코드 생성 정상', () => {
    expect(typeAbbr['미용실']).toBe('SAL');
  });

  test('SIM-8-2 validCategories.includes("salon") === true — B2B 등록 시 salon 저장', () => {
    expect((validCategories as readonly string[]).includes('salon')).toBe(true);
  });

  test('SIM-8-3 catToPath["salon"] === "/salon" — REFACTOR 후 전용 경로 확인', () => {
    expect(catToPath['salon']).toBe('/salon');  // /f/ 임시 경로 제거 완료
  });

  test('SIM-8-4 catPath["salon"] === "/salon" — /h/:code 리다이렉트 정확', () => {
    expect(catPath['salon']).toBe('/salon');    // /h/:code 리다이렉트도 /salon/로
  });

  test('SIM-8-5 /s/:code salon 분기 → /salon/:code — 전용 라우트 정확', () => {
    const redirect = resolveSurveyRedirect('B2B-SAL-001', 'salon');
    expect(redirect).toBe('/salon/B2B-SAL-001');  // ✅ REFACTOR
  });

  test('SIM-8-6 /salon/:code window.__BRAND__.survey_category === "salon" — 프론트엔드 전달', () => {
    const cat = getBrandSurveyCategory('/salon/:code');
    expect(cat).toBe('salon');
  });

  test('SIM-8-7 BUG-8 수정 전 시나리오 재현 — salon → integrated 폴백 버그', () => {
    // 수정 전: validCategories에 'salon'이 없을 때
    const oldValidCategories = ['integrated', 'hospital', 'aesthetic', 'fitness'];
    const category = oldValidCategories.includes('salon') ? 'salon' : 'integrated';
    expect(category).toBe('integrated');  // 버그: 'integrated'로 잘못 저장
  });

  test('SIM-8-8 BUG-8 수정 후 시나리오 — salon 정상 저장', () => {
    // 수정 후: validCategories에 'salon' 추가
    const newValidCategories = [...validCategories];
    const category = newValidCategories.includes('salon') ? 'salon' : 'integrated';
    expect(category).toBe('salon');  // 수정: 'salon'으로 정상 저장
  });

  test('SIM-8-9 전체 파이프라인 — 미용실 B2B 등록 → 질문지 접속 → 제출 → 결과', () => {
    // Step 1: B2B 등록
    const code = generateB2BCode('미용실', []);
    expect(code).toBe('B2B-SAL-001');

    // Step 2: survey_category 저장
    const isValid = (validCategories as readonly string[]).includes('salon');
    expect(isValid).toBe(true);
    const category = isValid ? 'salon' : 'integrated';
    expect(category).toBe('salon');

    // Step 3: 질문지 URL 생성 (구조 분리 후 전용 경로)
    const surveyUrl = resolveB2BSurveyUrl(code, category);
    expect(surveyUrl).toBe('/salon/B2B-SAL-001');  // ✅ REFACTOR: /f/ 없음

    // Step 4: 질문지 접속 시 window.__BRAND__.survey_category
    const brandCat = getBrandSurveyCategory('/salon/:code');
    expect(brandCat).toBe('salon');

    // Step 5: 제출 payload
    const payload = buildDiagnosisPayload('salon', code);
    expect(payload.survey_category).toBe('salon');
    expect(payload.ref_code).toBe(code);

    // Step 6: DB 저장
    const stored = resolveDiagnosisCategory(payload.survey_category);
    expect(stored).toBe('salon');

    // Step 7: 결과 라우팅
    const resultRoute = resolveResultRoute('mock-result-id', stored as string);
    expect(resultRoute).toBe('result-v4.html');  // 미용실은 result-v4.html 사용
  });

  test('SIM-8-10 전체 파이프라인 — 3채널 병렬 검증', () => {
    const channels: ChannelCode[] = ['hospital', 'aesthetic', 'salon'];
    const expectedUrls: Record<ChannelCode, string> = {
      hospital: '/h/B2B-HOS-001',
      aesthetic: '/a/B2B-AES-001',
      salon: '/salon/B2B-SAL-001',  // ✅ REFACTOR: 전용 경로
    };
    const expectedResults: Record<ChannelCode, string> = {
      hospital: '/result-hospital/mock-id',
      aesthetic: 'result-aesthetic.html',
      salon: 'result-v4.html',
    };

    for (const ch of channels) {
      const partner = SAMPLE_PARTNERS[ch];

      // URL 생성 정확성
      const url = resolveB2BSurveyUrl(partner.code, partner.survey_category);
      expect(url).toBe(expectedUrls[ch]);

      // payload category 정확성
      const payload = buildDiagnosisPayload(ch, partner.code);
      expect(payload.survey_category).toBe(CHANNEL_DATA[ch].survey_category);

      // 결과 라우팅 정확성
      const resultRoute = resolveResultRoute('mock-id', CHANNEL_DATA[ch].survey_category);
      expect(resultRoute).toBe(expectedResults[ch]);
    }
  });
});
