#!/usr/bin/env python3
"""
SlimMind V4.1 전체 플로우 Playwright 테스트
설문 시작 → 동의 → 질문(Q00~끝) → 기질설문 → 로딩 → 완료 → result-v4
"""

import asyncio
import json
import sys
from playwright.async_api import async_playwright, TimeoutError as PlaywrightTimeout

BASE_URL = "http://localhost:3000"
SURVEY_URL = f"{BASE_URL}/slimmind_live"
TIMEOUT = 15000

bugs_found = []
tests_passed = []
tests_failed = []

def log(msg, level="INFO"):
    icons = {"INFO":"📋","OK":"✅","FAIL":"❌","WARN":"⚠️","STEP":"🔷"}
    print(f"{icons.get(level,'  ')} {msg}")

def bug(msg):
    bugs_found.append(msg)
    log(f"BUG: {msg}", "FAIL")

def ok(msg):
    tests_passed.append(msg)
    log(msg, "OK")

def fail(msg):
    tests_failed.append(msg)
    log(msg, "FAIL")

async def wait_visible(page, selector, timeout=TIMEOUT):
    """요소가 보일 때까지 대기"""
    try:
        el = await page.wait_for_selector(selector, state="visible", timeout=timeout)
        return el
    except PlaywrightTimeout:
        return None

async def click_if_visible(page, selector, timeout=TIMEOUT):
    """보이면 클릭"""
    el = await wait_visible(page, selector, timeout)
    if el:
        await el.click()
        return True
    return False

async def test_1_page_load(page):
    """1. 페이지 로드 및 JS 오류 없음 확인"""
    log("=== 1. 페이지 로드 테스트 ===", "STEP")

    js_errors = []
    page.on("pageerror", lambda e: js_errors.append(str(e)))

    await page.goto(SURVEY_URL, wait_until="networkidle", timeout=30000)
    await page.wait_for_timeout(2000)

    # body 배경색 확인
    bg = await page.evaluate("() => getComputedStyle(document.body).backgroundColor")
    log(f"body background: {bg}")
    if "255, 255, 255" in bg or "rgb(255" in bg:
        ok("body 배경 흰색 정상")
    else:
        bug(f"body 배경이 흰색이 아님: {bg}")

    if js_errors:
        for err in js_errors:
            bug(f"JS 오류: {err}")
    else:
        ok("JS 오류 없음")

    # 인트로 화면 확인
    intro_visible = await page.is_visible("#intro-screen")
    if intro_visible:
        ok("인트로 화면 표시됨")
    else:
        bug("인트로 화면 안 보임")

    return len(js_errors) == 0

async def test_2_start_and_consent(page):
    """2. 시작 → 동의 화면 테스트"""
    log("=== 2. 시작 → 동의 테스트 ===", "STEP")

    # 시작 버튼 클릭
    start_btn = await wait_visible(page, "#start-btn")
    if not start_btn:
        fail("시작 버튼 없음")
        return False
    await start_btn.click()
    await page.wait_for_timeout(800)

    # 동의 화면으로 이동했는지 확인
    consent_visible = await page.is_visible("#consent-screen")
    if consent_visible:
        ok("동의 화면 진입 성공")
    else:
        bug("동의 화면 진입 실패")
        return False

    # 전체 동의 클릭
    await page.click("#check-all", timeout=5000)
    await page.wait_for_timeout(500)

    # 동의 버튼 활성화 확인
    consent_btn = await page.query_selector("#consent-agree-btn")
    is_disabled = await consent_btn.get_attribute("disabled")
    if is_disabled is None:
        ok("동의 버튼 활성화됨")
    else:
        bug("전체동의 후에도 버튼이 비활성화됨")

    # 동의 버튼 클릭
    await page.click("#consent-agree-btn")
    await page.wait_for_timeout(1000)

    ok("동의 완료")
    return True

async def test_3_question_flow(page):
    """3. 질문 플로우 전체 테스트 (QUESTIONS 배열 기반)"""
    log("=== 3. 설문 질문 플로우 테스트 ===", "STEP")

    # resume 팝업이 있으면 처음부터
    resume_visible = await page.is_visible("#resume-overlay.show")
    if resume_visible:
        log("임시저장 팝업 감지 → 처음부터 선택")
        fresh_btn = await wait_visible(page, "#resume-fresh-btn", 3000)
        if fresh_btn:
            await fresh_btn.click()
            await page.wait_for_timeout(800)
        else:
            bug("임시저장 팝업에서 처음부터 버튼 못찾음")

    # 질문 화면 진입 확인
    q_screen = await wait_visible(page, "#question-screen", 5000)
    if not q_screen:
        fail("질문 화면 진입 실패")
        return False

    ok("질문 화면 진입")

    # 최대 120문항 순회 (안전 한도)
    max_questions = 120
    q_count = 0
    hook_count = 0
    transition_count = 0
    error_count = 0

    for _ in range(max_questions):
        # 현재 화면 확인
        cur_screen = await page.evaluate("""() => {
            const screens = ['question-screen','hook-screen','transition-screen',
                           'disp-screen','loading-screen','result-screen',
                           'intermission-screen'];
            for (const s of screens) {
                const el = document.getElementById(s);
                if (el && el.style.display !== 'none' && 
                    !el.classList.contains('hidden') &&
                    getComputedStyle(el).display !== 'none') {
                    return s;
                }
            }
            return 'unknown';
        }""")

        if cur_screen == 'disp-screen':
            log(f"기질 설문 화면 진입 (Q{q_count}개 완료)")
            ok(f"일반 설문 {q_count}문항 완료 → 기질 설문 진입")
            return {"reached_disp": True, "q_count": q_count}

        if cur_screen == 'loading-screen':
            ok(f"로딩 화면 진입 (Q{q_count}개 완료)")
            return {"reached_loading": True, "q_count": q_count}

        if cur_screen == 'result-screen':
            ok(f"결과 화면 진입 (Q{q_count}개 완료)")
            return {"reached_result": True, "q_count": q_count}

        if cur_screen == 'hook-screen':
            hook_count += 1
            log(f"Hook 화면 감지 #{hook_count}")
            hook_btn = await wait_visible(page, "#hook-screen button:not([disabled])", 3000)
            if hook_btn:
                await hook_btn.click()
                await page.wait_for_timeout(500)
            continue

        if cur_screen == 'transition-screen':
            transition_count += 1
            log(f"섹션 전환 화면 #{transition_count}")
            await page.wait_for_timeout(2500)  # 전환 애니메이션 대기
            continue

        if cur_screen == 'intermission-screen':
            log("인터미션 화면 진입")
            im_btn = await wait_visible(page, "#im-continue-btn", 3000)
            if im_btn:
                await im_btn.click()
                await page.wait_for_timeout(800)
            continue

        # question-screen에서 현재 질문 정보 가져오기
        q_info = await page.evaluate("""() => {
            const qNum = document.getElementById('q-num')?.textContent || '';
            const qText = document.getElementById('q-text')?.textContent || '';
            const btnNext = document.getElementById('btn-next');
            const btnNextVisible = btnNext && getComputedStyle(btnNext).display !== 'none';
            const btnNextDisabled = btnNext?.disabled;
            
            // V3 모드 체크
            const isV3 = window.state?.v3Mode || false;
            const v3Phase = window.state?.v3Phase || null;
            
            // 현재 질문 타입 가져오기
            let qType = null;
            if (isV3) {
                const qIdx = window.state?.v3CurrentQ || 0;
                const qs = window.QUESTIONS_V3 || [];
                qType = qs[qIdx]?.type || null;
            } else {
                const active = window.state ? (function() {
                    try {
                        const qs = window.QUESTIONS || [];
                        return qs.filter(q => {
                            if (q.conditional) {
                                return window.state.answers[q.conditional.dependsOn] === q.conditional.showIf;
                            }
                            return true;
                        });
                    } catch(e) { return []; }
                })() : [];
                const curQ = window.state?.currentQ || 0;
                qType = active[curQ]?.type || null;
            }
            
            return { qNum, qText: qText.slice(0,40), btnNextVisible, btnNextDisabled, isV3, v3Phase, qType };
        }""")

        q_count += 1

        # 현재 질문 타입에 따라 처리
        q_type = q_info.get('qType')

        if q_count <= 5 or q_count % 10 == 0:
            log(f"Q{q_count}: {q_info.get('qNum','')} {q_info.get('qText','')[:30]}... type={q_type}")

        try:
            handled = await handle_question_by_type(page, q_type, q_info, q_count)
            if not handled:
                error_count += 1
                if error_count > 3:
                    bug(f"Q{q_count}에서 진행 불가 (type={q_type}, 3회 연속 실패)")
                    return {"error": True, "q_count": q_count}
        except PlaywrightTimeout as e:
            bug(f"Q{q_count} 타임아웃: type={q_type}, {q_info.get('qNum','')}")
            error_count += 1
            if error_count > 3:
                return {"error": True, "q_count": q_count}
        except Exception as e:
            log(f"Q{q_count} 예외: {e}", "WARN")
            error_count += 1

        await page.wait_for_timeout(200)

    fail(f"최대 {max_questions}문항 한도 초과")
    return {"timeout": True, "q_count": q_count}


async def handle_question_by_type(page, q_type, q_info, q_count):
    """질문 타입별 처리"""
    await page.wait_for_timeout(100)

    # SINGLE_SELECT: 자동 진행 (btn-next 없음)
    if q_type == 'SINGLE_SELECT':
        # 옵션 카드 클릭
        cards = await page.query_selector_all(".option-card:not(.selected), #v3-options .option-card")
        if cards:
            await cards[0].click()
            await page.wait_for_timeout(600)
            return True
        # SINGLE_SELECT인데 카드 없음 → forceButton일 수도 있음
        btn_visible = await page.is_visible("#btn-next:not([disabled])")
        if btn_visible:
            await page.click("#btn-next")
            await page.wait_for_timeout(400)
            return True
        return False

    # TEXT_INPUT
    elif q_type == 'TEXT_INPUT':
        # v3 text input
        v3_inp = await page.query_selector("#v3-text-input")
        if v3_inp:
            await v3_inp.fill("테스트닉네임")
            await page.wait_for_timeout(200)
        else:
            # 일반 text input
            text_inp = await page.query_selector("#text-inp, .text-input")
            if text_inp:
                await text_inp.fill("테스트고객")
                await page.wait_for_timeout(200)

        # btn-next 클릭
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
            return True
        else:
            bug(f"TEXT_INPUT Q{q_count}: btn-next 비활성화 상태 (입력 후에도)")
            return False

    # MULTI_SELECT
    elif q_type == 'MULTI_SELECT':
        cards = await page.query_selector_all(".option-card:not(.selected)")
        if cards:
            await cards[0].click()
            await page.wait_for_timeout(300)
            if len(cards) > 1:
                await cards[1].click()
                await page.wait_for_timeout(300)
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
            return True
        # 선택 안 해도 넘어갈 수 있는 경우 (0개 허용)
        btn_any = await page.query_selector("#btn-next")
        if btn_any:
            await btn_any.click()
            await page.wait_for_timeout(400)
        return True

    # SLIDER
    elif q_type == 'SLIDER':
        # 슬라이더 중간값 클릭
        slider = await page.query_selector("input[type=range], .slider")
        if slider:
            await slider.fill("50")
            await page.wait_for_timeout(300)
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
            return True
        return False

    # MBTI_GRID
    elif q_type == 'MBTI_GRID':
        # 각 MBTI 행에서 첫 번째 옵션 클릭
        cards = await page.query_selector_all(".mbti-opt, .option-card")
        clicked = 0
        for card in cards[:8]:  # 최대 8개 (E/I, N/S, T/F, J/P 각 2개)
            try:
                await card.click()
                await page.wait_for_timeout(200)
                clicked += 1
            except:
                pass
        await page.wait_for_timeout(300)
        btn = await page.query_selector("#btn-next:not([disabled])")
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
        return True

    # SIZE_GRID
    elif q_type == 'SIZE_GRID':
        cards = await page.query_selector_all(".size-cell, .option-card")
        if cards:
            await cards[0].click()
            await page.wait_for_timeout(300)
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
        return True

    # DATE_PICKER
    elif q_type == 'DATE_PICKER':
        # 날짜 입력
        date_inp = await page.query_selector("input[type=date], input[type=text].date-input, #date-inp")
        if date_inp:
            await date_inp.fill("1990-01-15")
            await page.wait_for_timeout(300)
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
        return True

    # INBODY_INPUT
    elif q_type == 'INBODY_INPUT':
        inputs = await page.query_selector_all(".inbody-inp, input[type=number]")
        for inp in inputs[:4]:
            try:
                await inp.fill("50")
                await page.wait_for_timeout(100)
            except:
                pass
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
        return True

    # INBODY_RANGE
    elif q_type == 'INBODY_RANGE':
        sliders = await page.query_selector_all("input[type=range]")
        for s in sliders[:2]:
            await s.fill("50")
            await page.wait_for_timeout(100)
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
        return True

    # WAIST_HIP_INPUT
    elif q_type == 'WAIST_HIP_INPUT':
        inputs = await page.query_selector_all("input[type=number], .waist-inp, .hip-inp")
        for inp in inputs[:2]:
            await inp.fill("80")
            await page.wait_for_timeout(100)
        btn = await wait_visible(page, "#btn-next:not([disabled])", 5000)
        if btn:
            await btn.click()
            await page.wait_for_timeout(400)
        return True

    # 타입 불명 → 버튼 클릭 시도
    else:
        # 먼저 클릭 가능한 카드가 있는지 확인
        cards = await page.query_selector_all(".option-card:not(.selected)")
        if cards:
            await cards[0].click()
            await page.wait_for_timeout(400)

        btn = await page.query_selector("#btn-next:not([disabled])")
        if btn and await btn.is_visible():
            await btn.click()
            await page.wait_for_timeout(400)
            return True

        # 화면이 바뀌었는지 확인
        await page.wait_for_timeout(500)
        return True  # 계속 진행 시도


async def test_4_disp_survey(page):
    """4. 기질 설문 (G01~G10) 테스트"""
    log("=== 4. 기질 설문 테스트 ===", "STEP")

    disp_visible = await page.is_visible("#disp-screen")
    if not disp_visible:
        bug("기질 설문 화면이 보이지 않음")
        return False

    ok("기질 설문 화면 진입 확인")

    # DISP_QUESTIONS가 로드됐는지 확인
    disp_count = await page.evaluate("() => (typeof DISP_QUESTIONS !== 'undefined' ? DISP_QUESTIONS.length : 0)")
    log(f"DISP_QUESTIONS 개수: {disp_count}")
    if disp_count >= 10:
        ok(f"DISP_QUESTIONS {disp_count}개 로드됨")
    elif disp_count == 0:
        bug("DISP_QUESTIONS가 로드되지 않음 (survey-data.js 연결 문제)")
        return False
    else:
        bug(f"DISP_QUESTIONS가 {disp_count}개만 있음 (10개 필요)")

    # 10문항 순회
    for i in range(12):  # 여유 있게 12회
        # 현재 화면 확인
        cur_screen = await page.evaluate("""() => {
            const screens = ['disp-screen','loading-screen','result-screen'];
            for (const s of screens) {
                const el = document.getElementById(s);
                if (el && getComputedStyle(el).display !== 'none') return s;
            }
            return 'unknown';
        }""")

        if cur_screen == 'loading-screen':
            ok("기질 설문 완료 → 로딩 화면 진입")
            return True
        if cur_screen != 'disp-screen':
            break

        # 진행 텍스트 확인
        prog = await page.evaluate("() => document.getElementById('disp-progress-text')?.textContent || ''")
        log(f"기질 설문 진행: {prog}")

        # 옵션 버튼 클릭 (data-disp-idx 속성으로 찾기)
        opts = await page.query_selector_all("[data-disp-idx]")
        if opts:
            await opts[0].click()
            log(f"  기질 옵션 선택 완료 ({prog})")
            await page.wait_for_timeout(600)  # selectDispOpt → 320ms 후 dispNext
        else:
            # disp-next-btn 직접 클릭
            next_btn = await wait_visible(page, "#disp-next-btn:not([disabled])", 3000)
            if next_btn:
                await next_btn.click()
                await page.wait_for_timeout(400)
            else:
                bug(f"기질 설문 옵션 없음 ({prog})")
                return False

    # 로딩 화면 도달 확인
    loading_visible = await page.is_visible("#loading-screen")
    if loading_visible:
        ok("기질 설문 → 로딩 화면 정상 전환")
        return True
    else:
        bug("기질 설문 완료 후 로딩 화면으로 이동 안 됨")
        return False


async def test_5_loading_and_complete(page):
    """5. 로딩 → 완료 화면 테스트"""
    log("=== 5. 로딩 → 완료 테스트 ===", "STEP")

    loading_visible = await page.is_visible("#loading-screen")
    if loading_visible:
        ok("로딩 화면 확인됨")
    else:
        bug("로딩 화면 없음")
        return False

    # 로딩 완료 대기 (최대 20초 - 스텝 6개 × 1.5초 + API 호출 시간)
    js_errors = []
    page.on("pageerror", lambda e: js_errors.append(str(e)))

    # result-screen 또는 API 오류 대기
    try:
        await page.wait_for_selector("#result-screen", state="visible", timeout=25000)
        ok("완료 화면 진입 성공")

        # JS 오류 확인
        if js_errors:
            for err in js_errors:
                bug(f"로딩 중 JS 오류: {err}")
        else:
            ok("로딩 중 JS 오류 없음")

        return True
    except PlaywrightTimeout:
        bug("로딩이 25초 내에 완료되지 않음")
        # 현재 어떤 화면인지 확인
        cur = await page.evaluate("""() => {
            const screens = document.querySelectorAll('.screen');
            for (const s of screens) {
                if (getComputedStyle(s).display !== 'none') return s.id;
            }
            return 'none';
        }""")
        log(f"타임아웃 시 현재 화면: {cur}", "WARN")
        return False


async def test_6_complete_screen(page):
    """6. 완료 화면 상세 테스트"""
    log("=== 6. 완료 화면 상세 테스트 ===", "STEP")

    # 완료 화면 요소 확인
    result_id_el = await page.query_selector("#complete-result-id")
    if result_id_el:
        result_id_text = await result_id_el.text_content()
        log(f"완료 화면 결과 ID: {result_id_text}")
        if result_id_text and result_id_text.strip():
            ok("완료 화면에 결과 ID 표시됨")
        else:
            bug("완료 화면에 결과 ID 없음")

    # diagnosisId 상태 확인
    diag_id = await page.evaluate("() => window.state?.diagnosisId || null")
    if diag_id:
        ok(f"diagnosisId 저장됨: {diag_id[:8]}...")
    else:
        bug("diagnosisId가 state에 없음 (diagnosis API 저장 실패 가능)")

    # result-v4 버튼 확인
    v4_btn = await wait_visible(page, "#view-result-v4-btn", 3000)
    if v4_btn:
        ok("result-v4 버튼 표시됨")
    else:
        bug("result-v4 버튼 없음")

    return diag_id is not None


async def test_7_diagnosis_api(page, diag_id=None):
    """7. diagnosis API 테스트"""
    log("=== 7. diagnosis API 테스트 ===", "STEP")

    if not diag_id:
        diag_id = await page.evaluate("() => window.state?.diagnosisId || null")

    if not diag_id:
        bug("diagnosis ID 없어서 API 테스트 건너뜀")
        return False

    # GET /api/v1/diagnosis/:id 테스트
    api_result = await page.evaluate(f"""async () => {{
        try {{
            const res = await fetch('/api/v1/diagnosis/{diag_id}');
            const data = await res.json();
            return {{ ok: res.ok, status: res.status, data }};
        }} catch(e) {{
            return {{ ok: false, error: e.message }};
        }}
    }}""")

    if api_result.get('ok'):
        data = api_result.get('data', {})
        ok(f"GET /api/v1/diagnosis/:id 성공")
        log(f"  user_name: {data.get('user_name')}")
        log(f"  bc_nickname: {data.get('bc_nickname')}")
        log(f"  ohaeng_type: {data.get('ohaeng_type')}")
        log(f"  mbti_full: {data.get('mbti_full')}")
        return True
    else:
        bug(f"GET /api/v1/diagnosis/:id 실패: {api_result}")
        return False


async def test_8_result_v4(page):
    """8. result-v4 페이지 테스트"""
    log("=== 8. result-v4 페이지 테스트 ===", "STEP")

    diag_id = await page.evaluate("() => window.state?.diagnosisId || null")
    result_id = await page.evaluate("() => window.state?.resultId || null")

    if diag_id:
        url = f"{BASE_URL}/result-v4?diagnosis_id={diag_id}"
        log(f"diagnosis_id로 결과지 이동: {url}")
    elif result_id:
        url = f"{BASE_URL}/result-v4?id={result_id}"
        log(f"result_id로 결과지 이동")
    else:
        url = f"{BASE_URL}/result-v4"
        log("파라미터 없이 result-v4 이동 (demo 모드)")

    js_errors = []
    page.on("pageerror", lambda e: js_errors.append(str(e)))

    await page.goto(url, wait_until="networkidle", timeout=20000)
    await page.wait_for_timeout(3000)

    if js_errors:
        for err in js_errors:
            bug(f"result-v4 JS 오류: {err}")
    else:
        ok("result-v4 JS 오류 없음")

    # BC 코드 표시 확인
    body_text = await page.evaluate("() => document.body.innerText.slice(0, 500)")
    log(f"result-v4 내용 미리보기: {body_text[:200]}")

    if "오류" in body_text or "error" in body_text.lower():
        bug("result-v4에 오류 메시지 표시됨")
    else:
        ok("result-v4 정상 로드")

    return len(js_errors) == 0


async def test_survey_data_integrity():
    """survey-data.js 데이터 무결성 테스트 (Node.js)"""
    log("=== 0. survey-data.js 데이터 검증 ===", "STEP")

    import subprocess
    result = subprocess.run(
        ['node', '-e', """
const fs = require('fs');
let code = fs.readFileSync('/home/user/webapp/public/survey-data.js', 'utf8');
// module.exports 처리
code = code.replace(/module\.exports\s*=\s*\{[\s\S]*?\};?\s*$/, '');
eval(code);

const checks = [];

// BC_META 개수
const bcKeys = Object.keys(BC_META || {});
checks.push(['BC_META 개수', bcKeys.length, '>=17']);

// BC10~BC17 확인
for (let i = 10; i <= 17; i++) {
    const key = 'BC' + i;
    checks.push([key + ' 존재', !!BC_META[key], 'true']);
}

// DISP_QUESTIONS
checks.push(['DISP_QUESTIONS 개수', (DISP_QUESTIONS||[]).length, '==10']);

// NICKNAME_TABLE
const ntKeys = Object.keys(NICKNAME_TABLE || {});
checks.push(['NICKNAME_TABLE 축 개수', ntKeys.length, '>=5']);

// getNickname 함수
checks.push(['getNickname 함수', typeof getNickname, 'function']);

// calcDisposition 함수
checks.push(['calcDisposition 함수', typeof calcDisposition, 'function']);

// SECTIONS 색상
const mintSections = (SECTIONS||[]).filter(s => s.color === '#3EB8A0');
checks.push(['민트 섹션 수', mintSections.length, '>=1']);

checks.forEach(([name, val, expect]) => {
    const ok = expect.startsWith('>=') ? val >= parseInt(expect.slice(2)) :
               expect.startsWith('==') ? val == expect.slice(2) :
               String(val) === expect;
    console.log((ok ? 'OK' : 'FAIL') + ' ' + name + ': ' + val + ' (expect ' + expect + ')');
});
"""],
        capture_output=True, text=True
    )

    lines = result.stdout.strip().split('\n')
    for line in lines:
        if line.startswith('OK'):
            ok(line[3:])
        elif line.startswith('FAIL'):
            bug(line[5:])

    if result.stderr and 'Error' in result.stderr:
        bug(f"survey-data.js 파싱 오류: {result.stderr[:200]}")
        print(result.stderr[:500])

    return 'FAIL' not in result.stdout


async def main():
    await test_survey_data_integrity()

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=["--no-sandbox"])
        context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)"
        )
        page = await context.new_page()

        try:
            # 1. 페이지 로드
            load_ok = await test_1_page_load(page)

            if not load_ok:
                fail("페이지 로드 실패로 테스트 중단")
                return

            # 2. 시작 → 동의
            consent_ok = await test_2_start_and_consent(page)
            if not consent_ok:
                fail("동의 화면 테스트 실패로 중단")
                return

            # 3. 질문 플로우
            q_result = await test_3_question_flow(page)

            if q_result and q_result.get("reached_disp"):
                # 4. 기질 설문
                disp_ok = await test_4_disp_survey(page)

                if disp_ok:
                    # 5. 로딩 → 완료
                    complete_ok = await test_5_loading_and_complete(page)
                    if complete_ok:
                        # 6. 완료 화면
                        await test_6_complete_screen(page)
                        # 7. diagnosis API
                        await test_7_diagnosis_api(page)
                        # 8. result-v4
                        await test_8_result_v4(page)
            elif q_result and q_result.get("reached_loading"):
                # 기질 설문 없이 로딩으로 간 경우
                log("기질 설문 건너뜀 (DISP_QUESTIONS 없거나 바로 로딩)")
                complete_ok = await test_5_loading_and_complete(page)
                if complete_ok:
                    await test_6_complete_screen(page)
                    await test_7_diagnosis_api(page)
                    await test_8_result_v4(page)
            elif q_result and q_result.get("error"):
                fail(f"질문 플로우 오류 발생 (Q{q_result.get('q_count')}번에서)")

        except Exception as e:
            fail(f"테스트 예외: {e}")
            import traceback
            traceback.print_exc()
        finally:
            await browser.close()

    # 결과 요약
    print("\n" + "="*60)
    print("📊 테스트 결과 요약")
    print("="*60)
    print(f"✅ 통과: {len(tests_passed)}개")
    print(f"❌ 실패: {len(tests_failed)}개")
    print(f"🐛 발견된 버그: {len(bugs_found)}개")

    if bugs_found:
        print("\n🐛 발견된 버그 목록:")
        for i, bug_msg in enumerate(bugs_found, 1):
            print(f"  {i}. {bug_msg}")

    if tests_failed:
        print("\n❌ 실패한 테스트:")
        for t in tests_failed:
            print(f"  - {t}")

    return bugs_found


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(0 if not result else 1)
