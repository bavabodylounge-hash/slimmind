#!/usr/bin/env python3
"""
4개 survey HTML 파일의 모든 inline <script> 블록 JS 문법 검사
node --check 으로 검증
"""
import subprocess, tempfile, os, re

FILES = [
    'public/survey-hospital.html',
    'public/survey-fitness.html',
    'public/survey-aesthetic.html',
    'public/survey-salon.html',
]

def check_file(fpath):
    with open(fpath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    errors = []
    i = 0
    script_idx = 0
    while i < len(lines):
        line = lines[i]
        # <script> 시작 (src 없는 인라인만)
        if re.search(r'<script(?:\s[^>]*)?>$', line.strip(), re.I) or line.strip() == '<script>':
            script_start = i
            # </script> 찾기
            j = i + 1
            while j < len(lines):
                if '</script>' in lines[j].lower():
                    script_end = j
                    break
                j += 1
            else:
                i += 1
                continue

            js_lines = lines[script_start+1:script_end]
            js_content = ''.join(js_lines)
            
            if len(js_content.strip()) < 10:
                i = script_end + 1
                script_idx += 1
                continue

            with tempfile.NamedTemporaryFile(mode='w', suffix='.js', 
                                              delete=False, encoding='utf-8') as tf:
                tf.write(js_content)
                tmp_path = tf.name

            result = subprocess.run(['node', '--check', tmp_path],
                                    capture_output=True, text=True, timeout=10)
            os.unlink(tmp_path)

            if result.returncode != 0:
                # 오류 라인 파싱
                m = re.search(r':(\d+)\n', result.stderr)
                rel_line = int(m.group(1)) if m else -1
                abs_line = script_start + 1 + rel_line if rel_line > 0 else script_start + 1
                errors.append({
                    'script_idx':   script_idx,
                    'script_start': script_start + 1,  # 1-indexed
                    'script_end':   script_end + 1,
                    'rel_line':     rel_line,
                    'abs_line':     abs_line,
                    'error':        result.stderr.strip()[:300],
                    # 해당 라인 컨텍스트
                    'context':      js_lines[rel_line-3:rel_line+2] if rel_line > 0 else [],
                })
            script_idx += 1
            i = script_end + 1
        else:
            i += 1

    return script_idx, errors


print(f"\n{'='*70}")
print("  4개 survey HTML 전체 script 블록 JS 문법 검사")
print(f"{'='*70}")

total_scripts = 0
total_errors  = 0

for fpath in FILES:
    if not os.path.exists(fpath):
        print(f"\n⚠️  {fpath} — 파일 없음")
        continue
    cnt, errs = check_file(fpath)
    total_scripts += cnt
    status = '✅' if not errs else f'❌ ({len(errs)} errors)'
    print(f"\n{status}  {fpath}  ({cnt} script blocks)")
    for e in errs:
        total_errors += 1
        print(f"     script#{e['script_idx']} L{e['script_start']}~{e['script_end']}")
        print(f"     오류 위치: JS-L{e['rel_line']} → HTML-L{e['abs_line']}")
        print(f"     오류: {e['error'][:200]}")
        if e['context']:
            print("     컨텍스트:")
            for ln in e['context']:
                print(f"       {ln.rstrip()[:90]}")

print(f"\n{'='*70}")
print(f"  총 검사: {total_scripts} script blocks  |  오류: {total_errors}개")
if total_errors == 0:
    print("  ✅ 모든 script 블록 문법 이상 없음")
else:
    print(f"  ❌ {total_errors}개 오류 발견 — 수정 필요")
print(f"{'='*70}\n")
