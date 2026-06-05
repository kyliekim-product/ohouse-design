# htmlviaTrueSource — Bookmarklet

브라우저-side 추출기. Chrome 어느 HTML 페이지에서나 클릭 한 번으로 prototype 생성에 필요한 데이터를 JSON으로 다운로드합니다. 랜딩에 국한되지 않음.

## 파일

| 파일 | 역할 |
|---|---|
| `extractor.js` | Readable JS source (변경할 때 여기 수정) |
| `bookmarklet.url` | URL-encoded one-liner (북마크바에 등록할 값) |
| `install.html` | "북마크바로 드래그" 설치 페이지 |
| `README.md` | 이 문서 |

## 설치

가장 쉬운 방법:

```bash
open ~/.claude/skills/htmlviaTrueSource/bookmarklet/install.html
```

→ 열린 페이지에서 "📋 추출하기" 버튼을 Chrome 북마크바로 드래그.

수동 설치 (다른 브라우저나 install.html이 안 열릴 때):

1. `bookmarklet.url` 내용 전체 복사
2. Chrome 새 북마크 추가 (`⌘+D`)
3. URL 필드에 붙여넣기
4. 이름: "📋 Prototype 추출" 등

## 사용

1. 분석하려는 페이지를 Chrome에서 연 상태로
2. 북마크바의 추출하기 버튼 클릭
3. 자동 스크롤 후 `extraction-{slug}.json` 다운로드
4. Claude Code에서:
   ```
   "북마클릿 추출 데이터로 {slug} 프로토타입 만들어줘"
   ```
5. Claude Code가 spec.md → prototype.html → qa.md까지 자동 생성

## 추출되는 데이터 스키마

```json
{
  "_meta": {
    "url": "...",
    "title": "...",
    "slug": "...",
    "captured_at": "ISO",
    "viewport": "WxH",
    "pageHeight": 6000,
    "userAgent": "...",
    "extractor_version": "1.0"
  },
  "tokens": {
    "fontFamily": "...",
    "letterSpacing": "...",
    "colors": ["rgb(...)", ...],
    "backgrounds": [...],
    "fontSizes": ["12px", ...],
    "fontWeights": ["400", ...],
    "radii": [...]
  },
  "structure": {
    "h1": "...",
    "h2s": [...],
    "h3s": [...],
    "sections": [{"text": "...", "h": 200}],
    "buttons": [{"text": "...", "ariaLabel": "..."}]
  },
  "images": [{"src": "...", "alt": "...", "naturalW": 400, "naturalH": 300, ...}],
  "backgroundImages": [{"tag": "div", "url": "...", "w": 343, "h": 200}],
  "embedded": {
    "nextData": {...},
    "initialState": {...},
    "apolloState": {...},
    "jsonScripts": [...],
    "ldjson": [...]
  }
}
```

## 빌드 (extractor.js 수정 후)

```bash
cd ~/.claude/skills/htmlviaTrueSource/bookmarklet
python3 -c "
import urllib.parse
with open('extractor.js') as f: src = f.read()
# strip leading comment lines
lines = src.split('\n'); code = []; skip = True
for l in lines:
    if skip and (l.startswith('//') or l.strip() == ''): continue
    skip = False; code.append(l)
js = '\n'.join(code)
with open('bookmarklet.url', 'w') as f:
    f.write('javascript:' + urllib.parse.quote(js, safe=''))
"
```

## 다른 브라우저

- **Safari**: 북마크바 드래그 동일하게 동작. 단, `URL.createObjectURL` 다운로드가 일부 버전에서 막힘 — Chrome 권장
- **Firefox**: 동작하나 `__NEXT_DATA__` 등 React internals 접근에 제약 가능
- **Edge (Chromium)**: Chrome과 동일

## 보안 주의

- 추출 JSON에는 페이지의 모든 inline state 데이터가 포함됨 (Next.js의 user 정보, API key가 client에 누출돼 있다면 그것도 포함)
- 공유 전 JSON 파일 내용 확인 권장
- 사내 페이지에서는 회사 정책에 따라 외부 공유 금지될 수 있음

## 제한사항

- iframe 컨텐츠 추출 불가
- Canvas/WebGL 렌더 추출 불가
- Shadow DOM은 부분 지원
- SPA에서 라우트 변경 후엔 다시 클릭 필요

## 추출 안 될 때 디버깅

Chrome DevTools Console (F12) 열고 북마클릿 다시 클릭 → 에러 메시지 확인. 자주 보이는 패턴:

- `Refused to display 'about:blank' in a frame` → 페이지 CSP 영향. iframe 내부에서는 동작 안 함.
- `getComputedStyle is not a function on null` → DOM이 아직 렌더되지 않음. 잠시 후 재시도.
- `URL.createObjectURL is not defined` → 브라우저 버전 너무 낮음. Chrome 60+ 권장.
