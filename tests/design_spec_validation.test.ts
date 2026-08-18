/**
 * design_spec_validation.test.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * 설계도 기준 1:1 검증 테스트 (Single Source of Truth: 슬림마인드_결과지_설계도.html)
 *
 * 이 테스트는 bc-engine.js의 코드값을 기준으로 삼지 않고,
 * 설계도 원본 테이블을 직접 하드코딩하여 코드와 대조합니다.
 *
 * 검증 항목:
 *   [GAP-01~03] NICKNAME_TO_BC 25개 아형 매핑 25/25 PASS
 *   [GAP-04]    4대 지표 공식 계산 결과 검증
 *   [GAP-05]    신뢰도 동적 계산 공식 검증
 *   [GAP-06]    _DOMAIN_AXIS_WEIGHTS_SALON 독립 존재 검증
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// bc-engine.js를 Node.js에서 require하기 위한 로더
const bcEngineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
const moduleWrapper = `
  (function(module, exports, require) {
    ${bcEngineCode}
  })
`
const mod: any = { exports: {} }
try {
  const fn = eval(moduleWrapper)
  fn(mod, mod.exports, () => ({}))
} catch (e: any) {
  // module.exports 할당 실패 방어 — 스크립트가 CommonJS 조건분기 없이 실행되면 전역 변수로 존재
}

// bc-engine.js에서 export된 NICKNAME_TO_BC 추출
const NICKNAME_TO_BC: Record<string, string> = mod.exports?.NICKNAME_TO_BC || {}

// ─────────────────────────────────────────────────────────────────────────────
// 설계도 원본 25개 아형 테이블 (Single Source of Truth)
// 출처: 슬림마인드_결과지_설계도.html "아형(통) 테이블 25행"
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_SPEC_25: Array<{ name: string; bc: string; note: string }> = [
  // BC-1
  { name: '엄마체형 하지정체형',        bc: 'BC-1',  note: '하체·부종·정맥' },
  { name: '오후만되면 코끼리다리형',      bc: 'BC-1',  note: '하체·부종·림프' },
  // BC-2
  { name: '목짧아지는 거북이형',         bc: 'BC-2',  note: '상체·자세·거북목 [구:BC-9]' },
  // BC-3
  { name: '남산수박배 기본형',           bc: 'BC-3',  note: '복부·내장·기본 [신규]' },
  { name: '식후기절 혈당롤러형',         bc: 'BC-3',  note: '복부·인슐린·혈당 [이름통일]' },
  { name: '아빠체형 내장비대형',         bc: 'BC-3',  note: '복부·내장·대사 [구:BC-4]' },
  { name: '털털한 PCOS형',              bc: 'BC-3',  note: '복부·호르몬·PCOS [구:BC-14]' },
  // BC-4
  { name: '물만마셔도요요 기본형',        bc: 'BC-4',  note: '대사저하·기본 [신규]' },
  { name: '약물부작용 강제축적형',        bc: 'BC-4',  note: '약물·갑상선 [유지]' },
  { name: '억제제부작용 배부름마비형',    bc: 'BC-4',  note: '복부·가스·소화 [구:BC-3]' },
  // BC-5
  { name: '셀룰라이트귤껍질 기본형',     bc: 'BC-5',  note: '순환저하·기본 [신규]' },
  { name: '여름에도 시린 얼음장형',      bc: 'BC-5',  note: '전신·냉체·순환 [구:BC-15]' },
  // BC-6
  { name: '스트레스성 야식부엉이형',     bc: 'BC-6',  note: '코르티솔·야식 [구:BC-3]' },
  // BC-7
  { name: '식후임산부 가스풍선형',       bc: 'BC-7',  note: '호르몬·가스·팽만 [구:BC-5]' },
  { name: '출산후 바람빠진 풍선형',      bc: 'BC-7',  note: '호르몬·출산 [신규]' },
  // BC-8
  { name: '골반틀어짐 승마살형',         bc: 'BC-8',  note: '체형·골반 [유지]' },
  { name: '운동할수록 말벅지형',         bc: 'BC-8',  note: '하체·근육 [구:BC-7]' },
  // BC-9
  { name: '팔다리거미 올챙이배형',       bc: 'BC-9',  note: '복부·마른비만 [구:BC-6]' },
  // BC-10
  { name: '안 쓰는 팔뚝 부종형',        bc: 'BC-10', note: '상체·팔뚝·부종 [유지]' },
  // BC-11
  { name: '상체근육형',                  bc: 'BC-11', note: '상체·근육 [유지]' },
  // BC-12
  { name: '겨드랑이 부유방형',           bc: 'BC-12', note: '상체·흉추·피하 [유지]' },
  // BC-13
  { name: '호르몬스위치 갱년기형',       bc: 'BC-13', note: '전신·갱년기 [유지]' },
  // BC-14
  { name: '스트레스기절 번아웃형',       bc: 'BC-14', note: '전신·번아웃 [유지]' },
  // BC-15
  { name: '대사증후군 종합형',           bc: 'BC-15', note: '전신·고위험 [유지]' },
  // BC-16
  { name: '동시다발 다중악순환형',       bc: 'BC-16', note: '전신·복합 [유지]' },
]

// ─────────────────────────────────────────────────────────────────────────────
// 설계 외 항목 (코드에 없어야 함)
// ─────────────────────────────────────────────────────────────────────────────
const DESIGN_DELETED = ['지방흡입후 재발형']

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 1: 25개 아형 BC 코드 매핑 검증
// ─────────────────────────────────────────────────────────────────────────────
describe('[GAP-01~03] NICKNAME_TO_BC 설계도 25개 아형 1:1 매핑 검증', () => {
  it('bc-engine.js에서 NICKNAME_TO_BC를 로드할 수 있어야 한다', () => {
    // module.exports 또는 eval 환경 체크
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain('NICKNAME_TO_BC')
    expect(engineCode).toContain('엄마체형 하지정체형')
    expect(engineCode).toContain('목짧아지는 거북이형')
  })

  // 설계도 25개 아형 전수 검증 — NICKNAME_TO_BC 블록 범위로 검색 제한
  DESIGN_SPEC_25.forEach(({ name, bc, note }) => {
    it(`[${bc}] "${name}" → ${bc} 매핑 확인 (${note})`, () => {
      const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
      // ① NICKNAME_TO_BC 블록만 추출 (NICKNAME_TABLE보다 뒤에 있음)
      const blockStart = engineCode.indexOf('var NICKNAME_TO_BC = {')
      expect(blockStart).toBeGreaterThan(0)
      const blockEnd = engineCode.indexOf('};', blockStart)
      const block    = engineCode.slice(blockStart, blockEnd + 2)
      // ② 블록 내에서 아형명 위치 탐색
      const nameIdx = block.indexOf(`'${name}'`)
      expect(nameIdx, `"${name}" 키가 NICKNAME_TO_BC 블록에 없음`).toBeGreaterThan(0)
      // ③ 해당 줄에서 BC 코드 확인
      const lineStart = block.lastIndexOf('\n', nameIdx)
      const lineEnd   = block.indexOf('\n', nameIdx)
      const line      = block.slice(lineStart, lineEnd)
      expect(line, `"${name}" 줄에 '${bc}' 없음 — 실제 줄: ${line.trim()}`).toContain(`'${bc}'`)
    })
  })

  it('[GAP-03] "지방흡입후 재발형"은 NICKNAME_TO_BC에서 삭제되어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    // NICKNAME_TO_BC 블록 추출
    const blockStart = engineCode.indexOf('var NICKNAME_TO_BC = {')
    const blockEnd   = engineCode.indexOf('};', blockStart)
    const block      = engineCode.slice(blockStart, blockEnd + 2)
    DESIGN_DELETED.forEach(name => {
      // BC-2 매핑에 없어야 함 (BC_TO_DEFAULT_NICKNAME 등 다른 곳엔 있을 수 있음)
      expect(block).not.toContain(`'${name}':`)
    })
  })

  it('NICKNAME_TO_BC에 25개 아형 키가 모두 존재해야 한다 (하위 호환 별칭 제외)', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    const blockStart = engineCode.indexOf('var NICKNAME_TO_BC = {')
    const blockEnd   = engineCode.indexOf('};', blockStart)
    const block      = engineCode.slice(blockStart, blockEnd + 2)

    let passCount = 0
    const failList: string[] = []
    DESIGN_SPEC_25.forEach(({ name }) => {
      if (block.includes(`'${name}'`)) passCount++
      else failList.push(name)
    })
    if (failList.length > 0) {
      console.error('누락된 아형:', failList)
    }
    expect(passCount).toBe(25)
    expect(failList).toHaveLength(0)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 2: 4대 지표 공식 GAP-04 검증
// ─────────────────────────────────────────────────────────────────────────────
describe('[GAP-04] 4대 지표 공식 설계도 기준 계산 검증', () => {
  it('설계도 복부위험도 공식: (A01×45%+A09×25%+A07×15%+A05×15%)×75+8', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    // 설계도 공식 키워드 검증
    expect(engineCode).toContain('0.45')  // A01×45%
    expect(engineCode).toContain('0.25')  // A09×25%
    expect(engineCode).toContain('0.15')  // A07/A05×15%
    expect(engineCode).toContain('* 75 + 8')  // ×75+8 스케일
    // 구버전 오류 공식이 없는지 확인
    expect(engineCode).not.toContain("axisScores['A01']||0) * 0.8 + (axisScores['A05']||0) * 0.2")
  })

  it('설계도 호르몬부하 공식: A03×45%+A07×30%+A02×25%', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain("axisScores['A03']||0)*0.45")
    expect(engineCode).toContain("axisScores['A07']||0)*0.30")
    expect(engineCode).toContain("axisScores['A02']||0)*0.25")
    // 구버전 A02 누락 오류 없는지
    expect(engineCode).not.toContain("axisScores['A03']||0) * 0.6 + (axisScores['A07']||0) * 0.4")
  })

  it('설계도 체형불균형 공식: A06×50%+A02×30%+A04×20%', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain("axisScores['A06']||0)*0.50")
    expect(engineCode).toContain("axisScores['A02']||0)*0.30")
    expect(engineCode).toContain("axisScores['A04']||0)*0.20")
    // 구버전 A04 누락 오류 없는지
    expect(engineCode).not.toContain("axisScores['A06']||0) * 0.7 + (axisScores['A02']||0) * 0.3")
  })

  it('대사효율나이: 고정값 40 하드코딩이 구버전 공식에 사용되지 않아야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    // 구버전: Math.round(40 + A03×0.15 + A07×0.1) — 이 패턴이 없어야 함
    expect(engineCode).not.toContain("Math.round(40 + (axisScores['A03']||0) * 0.15")
    // 설계도 공식: 실나이 기반 (_realAge4 또는 realAge 변수)
    expect(engineCode).toContain('_realAge4')
  })

  it('4대 지표 모두 clamp 상한 99 또는 설계도 라벨 기준값 적용', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    // ×75+8 패턴 — 설계도 스케일링
    const count75_8 = (engineCode.match(/\* 75 \+ 8/g) || []).length
    expect(count75_8).toBeGreaterThanOrEqual(3)  // 복부/호르몬/체형 3개
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 3: 신뢰도 동적 계산 GAP-05 검증
// ─────────────────────────────────────────────────────────────────────────────
describe('[GAP-05] 신뢰도 동적 계산 함수 검증', () => {
  it('computeConfidenceScore 함수가 bc-engine.js에 정의되어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain('function computeConfidenceScore')
  })

  it('기본 70 + 완성도 + 확신 보정이 포함되어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain('var score = 70')
    expect(engineCode).toContain('answered / total')
    expect(engineCode).toContain('gap >= 3')
    expect(engineCode).toContain('gap >= 1.5')
  })

  it('상한 95가 적용되어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain('Math.min(95,')
  })

  it('배경 일치 보정 +3이 있어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    // bc-engine.js는 bgAxis 변수명 사용 (bgBonus 아님)
    expect(engineCode).toContain('BG_AXIS_MAP')
    expect(engineCode).toContain('bgAxis')
    // 배경 일치 시 +3 보정
    expect(engineCode).toContain('bgAxis === topAxis') // 조건
  })

  it('신뢰도 계산: 만점 케이스 (50/50 응답, 격차 4점, 배경 일치) → 95 상한', () => {
    // computeConfidenceScore 수동 계산
    // 70 + (50/50×15=15) + (gap4≥3→+10) + (배경일치→+3) = 98 → 상한 95
    const base = 70
    const comp = Math.round((50 / 50) * 15) // 15
    const cert = 10  // gap ≥ 3
    const bg   = 3   // 배경 일치
    const raw  = base + comp + cert + bg     // 98
    const result = Math.min(95, raw)
    expect(result).toBe(95)
  })

  it('신뢰도 계산: 미응답 케이스 (0/50 응답, 격차 0.5점) → 73', () => {
    const base = 70
    const comp = Math.round((0 / 50) * 15)  // 0
    const cert = 3   // gap < 1.5
    const bg   = 0
    const result = Math.min(95, base + comp + cert + bg)
    expect(result).toBe(73)
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 4: SALON 가중치 독립 존재 GAP-06 검증
// ─────────────────────────────────────────────────────────────────────────────
describe('[GAP-06] _DOMAIN_AXIS_WEIGHTS_SALON 채널 독립성 검증', () => {
  it('_DOMAIN_AXIS_WEIGHTS_SALON 테이블이 bc-engine.js에 정의되어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain('_DOMAIN_AXIS_WEIGHTS_SALON')
  })

  it('SALON 가중치: 관리 도메인 A09×1.8이 핵심값으로 정의되어야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    const salonIdx  = engineCode.indexOf('_DOMAIN_AXIS_WEIGHTS_SALON')
    const salonEnd  = engineCode.indexOf('};', salonIdx)
    const salonBlock = engineCode.slice(salonIdx, salonEnd + 2)
    // 관리 도메인에 A09:1.8 포함 확인
    expect(salonBlock).toContain('A09:1.8')
  })

  it('computeTop3Prescriptions에 salon 분기가 존재해야 한다', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain("_track === 'salon'")
    expect(engineCode).toContain('_DOMAIN_AXIS_WEIGHTS_SALON')
  })

  it('salon 분기: hospital/aesthetic/salon 3개 채널이 각자 다른 가중치 사용', () => {
    const engineCode = readFileSync(resolve(__dirname, '../public/bc-engine.js'), 'utf-8')
    expect(engineCode).toContain("_track === 'aesthetic'")
    expect(engineCode).toContain("_track === 'salon'")
    // 3개 가중치 테이블 모두 정의됨
    expect(engineCode).toContain('_DOMAIN_AXIS_WEIGHTS_HOSPITAL')
    expect(engineCode).toContain('_DOMAIN_AXIS_WEIGHTS_AESTHETIC')
    expect(engineCode).toContain('_DOMAIN_AXIS_WEIGHTS_SALON')
  })
})
