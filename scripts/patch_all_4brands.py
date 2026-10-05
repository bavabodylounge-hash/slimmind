#!/usr/bin/env python3
"""
SlimMind 4업종 공통 패치 스크립트
====================================
4개 result-*.html 파일에 동일 패치를 동시 적용하고,
적용 후 즉시 메인 JS 블록 node --check 검증을 실행합니다.

사용법:
  python3 scripts/patch_all_4brands.py

설계 의도:
  - AI/사람이 4파일을 직접 건드리지 않고 이 스크립트를 통해서만 패치
  - 패치 후 자동 구문 검사로 SyntaxError를 즉시 탐지
  - 각 파일의 적용 결과를 명시적으로 출력해 오적용 방지
"""

import subprocess, sys, os, re
from pathlib import Path

BASE = Path(__file__).parent.parent / "public"

# ★ 파일별 메인 JS 블록 라인 범위 (node --check 검증에 사용)
JS_BLOCKS = {
    "result-fitness.html":   (7846, 12236),
    "result-aesthetic.html": (7895, 12342),
    "result-hospital.html":  (7899, 12284),
    "result-salon.html":     (7882, 12267),
}

def node_check(filepath: Path, start: int, end: int) -> tuple[bool, str]:
    """메인 JS 블록을 추출해 node --check 실행"""
    lines = filepath.read_text(encoding="utf-8").splitlines()
    block = "\n".join(lines[start-1:end])
    tmp = Path("/tmp/_sm_nodecheck.js")
    tmp.write_text(block, encoding="utf-8")
    r = subprocess.run(["node", "--check", str(tmp)], capture_output=True, text=True)
    tmp.unlink(missing_ok=True)
    return r.returncode == 0, r.stderr.strip()

def apply_patches(patches: list[dict]) -> dict:
    """
    patches: [{"old": "...", "new": "...", "desc": "설명"}, ...]
    각 파일에 patches를 순서대로 적용하고 결과를 반환
    """
    results = {}
    
    for fname, (js_start, js_end) in JS_BLOCKS.items():
        fpath = BASE / fname
        if not fpath.exists():
            results[fname] = {"status": "SKIP", "reason": "파일 없음"}
            continue
        
        content = fpath.read_text(encoding="utf-8")
        file_result = {"applied": [], "skipped": [], "status": "OK"}
        
        for p in patches:
            old, new, desc = p["old"], p["new"], p.get("desc", "")
            count = content.count(old)
            if count == 0:
                file_result["skipped"].append(f"패턴 없음: {desc}")
            elif count > 1:
                file_result["skipped"].append(f"중복 패턴({count}개) — 건드리지 않음: {desc}")
            else:
                content = content.replace(old, new)
                file_result["applied"].append(desc)
        
        # 파일 저장
        fpath.write_text(content, encoding="utf-8")
        
        # node --check
        ok, err = node_check(fpath, js_start, js_end)
        if not ok:
            file_result["status"] = "SYNTAX_ERROR"
            file_result["error"] = err
        
        results[fname] = file_result
    
    return results

def print_results(results: dict):
    all_ok = True
    for fname, r in results.items():
        status = r.get("status", "?")
        sym = "✅" if status == "OK" else ("⚠️" if status == "SKIP" else "❌")
        print(f"\n{sym} {fname} [{status}]")
        for a in r.get("applied", []):
            print(f"   ✓ 적용: {a}")
        for s in r.get("skipped", []):
            print(f"   - 건너뜀: {s}")
        if "error" in r:
            print(f"   ⛔ SyntaxError: {r['error'][:300]}")
            all_ok = False
    
    print("\n" + "="*50)
    if all_ok:
        print("✅ 전체 패치 완료 — 모든 파일 JS 구문 정상")
    else:
        print("❌ 일부 파일에 SyntaxError 발생 — 위 내용 확인 필요")
        sys.exit(1)

# ==========================================
# ★ 여기에 실제 패치 목록을 작성하세요
# ==========================================
PATCHES = [
    # 예시: 다음 패치를 추가할 때 이 형식으로 작성
    # {
    #     "old": "수정 전 코드 (정확히 파일에 있는 문자열)",
    #     "new": "수정 후 코드",
    #     "desc": "패치 설명 (한 줄)"
    # },
]

if __name__ == "__main__":
    if not PATCHES:
        print("ℹ️  PATCHES 목록이 비어있습니다.")
        print("   scripts/patch_all_4brands.py 파일 하단 PATCHES 리스트에 패치를 추가하세요.")
        print("\n현재 4업종 JS 구문 상태 검사만 실행합니다...\n")
        # 구문 검사만 실행
        all_ok = True
        for fname, (s, e) in JS_BLOCKS.items():
            fpath = BASE / fname
            ok, err = node_check(fpath, s, e)
            sym = "✅" if ok else "❌"
            print(f"{sym} {fname}: {'구문 OK' if ok else err[:200]}")
            if not ok: all_ok = False
        print("\n" + ("✅ 전체 구문 정상" if all_ok else "❌ 구문 오류 있음"))
        sys.exit(0 if all_ok else 1)
    
    print(f"[patch_all_4brands] {len(PATCHES)}개 패치 적용 시작...")
    results = apply_patches(PATCHES)
    print_results(results)
