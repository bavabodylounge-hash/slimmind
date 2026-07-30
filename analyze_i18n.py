import re

with open('public/survey-hospital.html', 'r', encoding='utf-8') as f:
    content = f.read()

# ── 1. fins 22개 이름 추출 ──────────────────────────────────
fins_start = content.find('// 22개 fins')
fins_end   = content.find('];\n\n// 3차 축 순서')
fins_block = content[fins_start:fins_end+3]
fins_names = re.findall(r"name:'([^']+)'", fins_block)
fins_chains= re.findall(r"chain:'([^']+)'", fins_block)
fins_exts  = re.findall(r"ext:'([^']+)'", fins_block)
print(f"fins[] {len(fins_names)}개")

# ── 2. EN 사전 전체 키 수집 ──────────────────────────────────
en_keys = {}
# 여러 패턴의 Object.assign 처리
pat_assign = re.compile(
    r'window\.SM_I18N_EN\s*=\s*Object\.assign\s*\([^,{]+,\s*\{(.*?)\}\s*\)',
    re.DOTALL
)
for m in pat_assign.finditer(content):
    block = m.group(1)
    for km in re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', block):
        en_keys[km.group(1)] = km.group(2)

# window.SM_I18N_EN = { ... } 직접 선언도
pat_direct = re.compile(r'window\.SM_I18N_EN\s*=\s*\{(.*?)\}', re.DOTALL)
for m in pat_direct.finditer(content):
    block = m.group(1)
    for km in re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', block):
        en_keys[km.group(1)] = km.group(2)

# ── 3. TH 사전 전체 키 수집 ──────────────────────────────────
th_keys = {}
pat_th_assign = re.compile(
    r'window\.SM_I18N_TH\s*=\s*(?:Object\.assign\s*\([^,{]+,\s*)?\{(.*?)\}(?:\s*\))?',
    re.DOTALL
)
for m in pat_th_assign.finditer(content):
    block = m.group(1)
    for km in re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', block):
        th_keys[km.group(1)] = km.group(2)

print(f"EN 사전 키: {len(en_keys)}")
print(f"TH 사전 키: {len(th_keys)}")

# ── 4. fins 22개 name / chain / ext 번역 상태 ─────────────────
print("\n===== [결과지 타입명 번역 상태] =====")
print(f"{'#':>2}  {'한국어':22s}  {'EN':35s}  {'TH':35s}")
print("-"*100)
missing_en = []
missing_th = []
for i, (nm, ch, ext) in enumerate(zip(fins_names, fins_chains, fins_exts)):
    en_nm = en_keys.get(nm, 'MISSING')
    th_nm = th_keys.get(nm, 'MISSING')
    en_ok = '✅' if en_nm != 'MISSING' else '❌'
    th_ok = '✅' if th_nm != 'MISSING' else '❌'
    en_short = en_nm[:32] if len(en_nm)<=32 else en_nm[:29]+'...'
    th_short = th_nm[:32] if len(th_nm)<=32 else th_nm[:29]+'...'
    print(f"{i+1:2d} {en_ok}{th_ok} {nm[:22]:22s}  {en_short:35s}  {th_short}")
    if en_nm == 'MISSING': missing_en.append(nm)
    if th_nm == 'MISSING': missing_th.append(nm)

print(f"\n누락 EN: {len(missing_en)}개 → {missing_en}")
print(f"누락 TH: {len(missing_th)}개 → {missing_th}")

# ── 5. chain / ext 번역 상태 ─────────────────────────────────
print("\n===== [chain / ext 번역 상태] =====")
chain_miss_en, chain_miss_th = [], []
ext_miss_en, ext_miss_th = [], []
for ch in set(fins_chains):
    if en_keys.get(ch, 'MISSING') == 'MISSING': chain_miss_en.append(ch)
    if th_keys.get(ch, 'MISSING') == 'MISSING': chain_miss_th.append(ch)
for ext in set(fins_exts):
    if en_keys.get(ext, 'MISSING') == 'MISSING': ext_miss_en.append(ext)
    if th_keys.get(ext, 'MISSING') == 'MISSING': ext_miss_th.append(ext)

print(f"chain EN 누락: {len(chain_miss_en)}개  TH 누락: {len(chain_miss_th)}개")
print(f"ext   EN 누락: {len(ext_miss_en)}개  TH 누락: {len(ext_miss_th)}개")
if chain_miss_th:
    print("  chain TH 누락:", chain_miss_th[:5])
if ext_miss_th:
    print("  ext TH 누락:", ext_miss_th)

# ── 6. SM_PF_I18N 상태 ───────────────────────────────────────
pf_en = {}
pf_th = {}
for m in re.finditer(r'window\.SM_PF_I18N_EN\s*=\s*Object\.assign[^{]*\{(.*?)\}', content, re.DOTALL):
    for km in re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', m.group(1)):
        pf_en[km.group(1)] = km.group(2)
for m in re.finditer(r'window\.SM_PF_I18N_TH\s*=\s*\{(.*?)\}', content, re.DOTALL):
    for km in re.finditer(r'"((?:[^"\\]|\\.)*)"\s*:\s*"((?:[^"\\]|\\.)*)"', m.group(1)):
        pf_th[km.group(1)] = km.group(2)
print(f"\nSM_PF_I18N_EN 키: {len(pf_en)}  SM_PF_I18N_TH 키: {len(pf_th)}")
