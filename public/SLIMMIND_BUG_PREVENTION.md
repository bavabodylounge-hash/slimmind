# SlimMind 재발 방지 버그 가이드라인 v1.0
> 과거 발생한 모든 버그 원인·증상·해결책 정리. 신규 코드 작성 전 반드시 확인.

---

## ❌ BUG-01: Optional Chaining (`?.`) SyntaxError
**발생 파일**: `bc-engine.js`, `result-hospital.html`, `survey-data.js`
**증상**: 결과지 완전 빈 화면. 콘솔 `Uncaught SyntaxError: Unexpected token ':'`
**원인**: `?.` 는 Chrome 80+ 이상에서만 지원. 구형 안드로이드 브라우저에서 파일 파싱 전체 실패 → 모든 함수 미정의
**해결**: ES5 호환 문법으로 교체

```javascript
// ❌ 금지
obj?.prop
arr?.find(...)?.value
fn?.(args)

// ✅ 올바른 방법
obj && obj.prop
arr ? arr.find(...) : null
var _r = arr ? arr.find(...) : null; _r ? _r.value : undefined
```

**규칙**: 이 프로젝트의 모든 public/*.html, public/*.js 파일은 ES5 호환으로 작성.
`const`/`let`/`class`/화살표함수/템플릿리터럴은 현재 코드베이스가 이미 사용 중이므로 허용.
단 `?.`/`??`/`?.[]`/`?.()`은 절대 금지.

---

## ❌ BUG-02: BC_ROADMAP_DB BC-10~16 두 번째 세트 중복
**발생 파일**: `result-hospital.html` (BC_ROADMAP_DB)
**증상**: BC-10~16 선택 시 week 3,4가 week 1,2와 동일 처방 반복
**원인**: DB 입력 시 week 3~4 블록을 week 1~2에서 복사 후 내용 미수정
**해결**: BC-10~16 week 3,4 블록을 완전히 새로 작성 (538줄 제거)

**예방 규칙**:
```javascript
// BC_ROADMAP_DB 신규 항목 추가 시 반드시 검증
var DB_KEYS = Object.keys(BC_ROADMAP_DB);
DB_KEYS.forEach(function(bc) {
  var weeks = BC_ROADMAP_DB[bc];
  if (weeks.length !== 4) console.error('BC_ROADMAP_DB 오류: ' + bc + '가 ' + weeks.length + '주');
  weeks.forEach(function(w, i) {
    if (w.week !== i+1) console.error(bc + ' week 순서 오류: ' + w.week);
  });
});
```

---

## ❌ BUG-03: 5~12주 처방 공백 (weeks[WK-1] = undefined)
**발생 파일**: `result-hospital.html` (getRoadmapWeeks)
**증상**: 5주차 이상 사용자의 오늘탭/로드맵이 빈 값
**원인**: BC_ROADMAP_DB는 week 1~4만 존재. WK=5이면 weeks[4] = undefined
**해결**: v2.5에서 BC_CYCLE + WEEK_CYCLE_META + expandedWeeks 12주 확장 루프 삽입

**예방 규칙**:
- `getRoadmapWeeks()` 반환값은 반드시 12개 배열 검증
- 오늘탭에서 `weeks[WK-1]`접근 시 항상 `|| weeks[0]` fallback 유지
```javascript
W = weeks ? (weeks[WK-1] || weeks[0]) : null;  // ← 이 패턴 필수
```

---

## ❌ BUG-04: 오행 recovery_add가 week===1에만 적용
**발생 파일**: `result-hospital.html` (OHAENG_OVERLAY 적용 루프)
**증상**: 오늘탭 회복 처방이 1주차에만 오행 맞춤, 2주차 이상은 기본값
**원인**: 오버레이 적용 조건에 `if (week === 1)` 분기가 잘못 포함됨
**해결**: v2.6에서 `OHAENG_RECOVERY_DB` 별도 객체 생성, 전 주차 적용

**예방 규칙**: 오행 오버레이는 주차 조건 없이 항상 적용
```javascript
// ❌ 금지
if (week === 1 && ohaeng.recovery_add) { ... }

// ✅ 올바른 방법  
var ohRec = OHAENG_RECOVERY_DB[OHAENG_KEY];
var recDetail = ohRec ? ohRec.daily : recBase;  // 전 주차 동일 적용
```

---

## ❌ BUG-05: 쿠팡 파트너스 링크 href="#" (미연결)
**발생 파일**: `slimmind-today.html`
**증상**: 영양제 구매 버튼 탭 시 페이지 최상단 이동만 됨
**원인**: `SUPP_BUY_LINKS` 객체 추가 후 `renderItems()`가 `suppBuyHtml` 필드를 렌더링하지 않았음
**해결**: v2.6에서 renderItems()에 suppBuyHtml 렌더링 추가

**예방 규칙**: 새 필드를 todayTasks() return 객체에 추가할 때 반드시 renderItems()에도 렌더링 코드 추가
```javascript
// todayTasks() return 필드 ↔ renderItems() 렌더링 필드 대조표
// tx ↔ item-main
// detail ↔ item-detail (det-toggle 포함)
// sub ↔ item-sub
// suppBuyHtml ↔ [직접 삽입]
// tags ↔ item-tags
// nutr ↔ item-nutr
// warn ↔ item-warn
// alert ↔ item-alert
```

---

## ❌ BUG-06: GPS 리뷰순 정렬 미작동
**발생 파일**: `src/index.tsx` (/api/places)
**증상**: 협진 안내 센터가 리뷰 높은 순이 아닌 임의 순서로 표시
**원인**: 카카오 REST API는 `sort=accuracy` / `sort=distance` 만 지원. 리뷰순 파라미터 없음
**해결**: v2.6에서 키워드 2개 병렬 fetch(size=15) → 중복제거 → 200m 버킷 정렬로 근사

**예방 규칙**:
- 카카오 `keyword.json` API에 `sort=rating`은 존재하지 않음 (항상 에러/무시)
- 리뷰순 근사: `Math.floor(distance / 200)` 버킷 + 버킷 내 이름길이 오름차순

---

## ❌ BUG-07: SID 불일치로 오늘탭 데이터 미로드
**발생 파일**: `slimmind-today.html` (sid 함수)
**증상**: 결과지에서 오늘탭 클릭 시 처방 데이터 빈 화면
**원인**: `slimmind_meta_[SID]` 저장 시 SID와 오늘탭 URL의 `?id=` 파라미터 불일치

**예방 규칙**:
```javascript
// result-hospital.html에서 오늘탭 URL 생성 시
var sid = q.get('id') || q.get('diagnosis_id') || '';
var todayUrl = 'slimmind-today.html?id=' + encodeURIComponent(sid);
// ← ?id= 파라미터 누락 금지

// localStorage 저장 시
localStorage.setItem('slimmind_meta_' + sid, JSON.stringify(meta));
localStorage.setItem('slimmind_weeks_' + sid, JSON.stringify(weeks));
// ← sid 일관성 필수: URL의 id와 localStorage key의 SID가 동일해야 함
```

---

## ❌ BUG-08: Genspark URL 하드코딩
**발생 파일**: `src/index.tsx`, `result-aesthetic.html`
**증상**: 이메일/링크 발송 시 gensparksite.com URL 노출
**원인**: 개발 편의를 위해 Genspark 배포 URL을 코드에 직접 작성
**해결**: `new URL(req.url).origin` 동적 추출 방식으로 교체

**예방 규칙**:
```typescript
// ❌ 금지
const siteBase = 'https://7ed6c475-8afa-4ef8-9af8-8fab0cf8224b.vip.gensparksite.com'

// ✅ 올바른 방법 (요청 origin 동적 추출)
const siteBase = (() => {
  try { return new URL(c.req.raw.url).origin }
  catch { return 'https://slimmind.kr' }
})()
// → slimmind.kr 로 접속하면 slimmind.kr 반환
// → 개발 환경이면 localhost:3000 반환
```

---

## 코드 작성 전 필수 체크리스트

### JavaScript 작성 시
- [ ] `?.` 또는 `??` 사용 여부 확인 → ES5 호환으로 교체
- [ ] 새 배열 접근 시 bounds check 또는 fallback `|| arr[0]` 추가
- [ ] `todayTasks()` return 필드 추가 → `renderItems()` 렌더링도 동시 추가

### BC 데이터 작성 시
- [ ] BC_ROADMAP_DB 각 BC: week 1~4 정확히 4개인지 확인
- [ ] week.week 필드 값이 1,2,3,4 순서 맞는지 확인
- [ ] 12주 확장 후 `weeks[11]` (12주차) 접근 가능한지 확인

### URL/링크 작성 시
- [ ] Genspark URL(`gensparksite.com`) 하드코딩 여부 확인
- [ ] 오늘탭 링크에 `?id=SID` 파라미터 포함 여부 확인
- [ ] localStorage key에 SID 접미사(`_[SID]`) 포함 여부 확인

### 백엔드 작성 시
- [ ] 외부 URL이 필요한 경우 `new URL(c.req.raw.url).origin` 동적 추출
- [ ] D1 쿼리 결과 `.results` 배열 항상 null-check 후 사용
- [ ] 새 API 엔드포인트 추가 시 ARCHITECTURE.md 표에도 추가

---

## 빌드 전 자동 검사 명령어

```bash
# Optional chaining 잔여 여부 검사
grep -rn "\?\." public/*.html public/*.js src/*.tsx && echo "❌ ?. 발견!" || echo "✅ ?. 없음"

# Genspark URL 잔여 여부 검사  
grep -rn "gensparksite" public/*.html public/*.js src/*.tsx && echo "❌ gensparksite URL 발견!" || echo "✅ 없음"

# BC_ROADMAP_DB week 개수 검사 (Node.js)
node -e "
  var fs = require('fs');
  var code = fs.readFileSync('public/result-hospital.html', 'utf8');
  var m = code.match(/var BC_ROADMAP_DB = ([\s\S]*?)^var /m);
  console.log(m ? 'DB 블록 발견' : '⚠ DB 블록 미발견');
"
```
