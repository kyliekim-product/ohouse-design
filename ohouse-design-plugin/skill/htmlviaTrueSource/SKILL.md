---
name: htmlviaTrueSource
description: 임의 HTML 페이지(URL 또는 북마클릿 JSON)를 받아 (1) spec MD 초안 합성, (2) 이미지·JSON 데이터·computed 토큰 자동 감지, (3) self-contained 프로토타입 HTML 생성, (4) **prod-대조 디자인 QA를 항상 수행**한다. 랜딩 페이지뿐 아니라 상품 상세·검색 결과·폼·관리자 페이지 등 임의 HTML에 적용 가능. 코드렌더(레포 접근) 페이지는 레포를 1순위 ground truth로 대조하고, PD/PO용 ODS React 프로토타입 트랙과 컴포넌트별 diff QA(노드 캡처 우선)도 지원. "[URL] 프로토타입 만들어줘", "htmlviaTrueSource 실행", "[URL] md로 변환", "이 페이지 분석해서 프리뷰", "북마클릿 추출 데이터로 프로토타입", "extraction-*.json 으로 프로토타입" 같은 표현 시 트리거. 추가로 "htmlviaTrueSource 설치 검증", "skill 셋업 확인", "install verify", "스킬 동작 테스트" 시 Playwright 기반 5단계 스모크 테스트 실행. 레거시 트리거 "랜딩 프로토타입 만들어줘", "html2md 실행", "html2md 설치 검증"(구 스킬명)도 호환.
---

# htmlviaTrueSource — HTML 페이지 → MD 스펙 + 프로토타입 자동 생성 파이프라인

임의 HTML URL 또는 브라우저 북마클릿 JSON을 입력받아 prod-동등 프로토타입과 **QA 리포트(필수)** 까지 한 번에 생성한다. 랜딩 페이지에 국한되지 않고 모든 HTML 링크에서 동작.

> **이 스킬은 자기완결(self-contained)이다.** 동작에 다른 스킬 패키지(`internet-landing` 등)를 요구하지 않는다. 모든 절차·검증·QA 프로토콜이 이 문서 안에 인라인돼 있다.

## 핵심 원칙 (True Source)

"True Source" = 화면을 **렌더하는 실제 출처**를 1순위 근거로 삼는다는 뜻. 추론·스크린샷보다 출처가 우선.

1. **두-축 ground truth (소스 라우터 확장)** — repo 와 runtime 은 상하(主-fallback)가 아니라 **축이 다른 두 1순위 근거**다. 목표는 prod 과 **동작·정책까지 99% 동일**한 산출물.
   - **동작·정책·IA·카피·상태머신 축 → repo 코드가 1순위.** 조건부 노출·eligibility·비즈니스 룰은 코드에만 있고 화면으로 관측 불가(런타임으로 복원 안 됨).
   - **시각·computed 토큰·실제 배포 결과·동적 데이터 축 → Playwright 런타임이 1순위.** repo 엔 flag/실험/빌드차가 있어 "코드 ≠ 실제 배포"일 수 있음.
   - **원칙**: 공유된 URL 의 콘텐츠/slug 로 **해당 repo 코드 소스를 해석·참조해 구현**하는 것을 기본으로 한다(Step 1.4 Source Resolution Gate). repo 가 결손(권한 밖·SDUI·미해석)이면 Playwright 런타임을 근거로 강등(fallback ladder, Step 1.4) — 단 **"에러 fallback" 이 아니라 정책축 결손**으로 다루고 provenance(8)로 정직하게 표기.
2. **창작 금지** — leaf 콘텐츠(카피·항목 수·링크)는 출처에서 가져온다. 없으면 "출처 미확인"으로 표기하지 임의 생성하지 않는다.
3. **status는 콘텐츠 상태만** — `populated/loading/empty/error`. **제외(별도 축)**: auth(로그인/비로그인)=접근가드·redirect, 조건부 비노출 요소(배너 등)=conditional+dataSource, system/OS chrome(statusbar·home indicator·GNB)=preview harness. 이들은 status에 넣지 않는다.
4. **diff QA 근거 우선순위** — ① 북마클릿 노드 캡처(computed + React props) > ② Playwright computed > ③ 스크린샷. 캡처만이 gap·max-count·누락요소·정확 padding을 잡는다.
5. **migration 타깃 인지** — prod가 신구 디자인시스템 혼재면 프로토타입(타깃 DS)과의 차이를 **3분류**(fidelity 갭=수정 / migration 의도차=문서화 / 자산 갈음=문서화)로 처리.
6. **멀티페이지/탭은 빌드 전 스코프 합의** — 플로우 단위를 옵션으로 제안하고 사용자 선택 후 진행.
7. **QA는 필수 산출물** — `qa.md` 없으면 미완료.
8. **provenance 표기 + 99% 정직성 게이트** — spec 의 모든 섹션·인터랙션에 ground-truth 출처 태그(`repo` / `runtime` / `inferred`)를 의무로 단다. **"prod 99% 동일" 클레임은 `repo`-grounded 동작/정책 항목에만** 부여. runtime-fallback 으로 만든 동작/정책은 `inferred — repo 확인 필요`로 표기(과대 클레임 금지). runtime 은 시각·IA 는 ~99% 도달하나 서버 조건/eligibility 는 관측 불가하므로 동작/정책 fidelity 는 99% 가 아님.
9. **Source Resolution Gate 선행 (Step 1.4)** — 빌드 전에 URL/slug → owner/repo 해석 → `gh repo view` 검증 → 접근 체크로 ground-truth 소스를 확정한다. **추정 레포명을 검증 없이 manifest 에 사실처럼 기재 금지.**

## 입력 모드 (택1)

| 모드 | 입력 | 사용 케이스 |
|---|---|---|
| **A. URL** | `https://...` | public 페이지 (랜딩·상품·검색·블로그 등), 추출 API + Playwright로 직접 추출 |
| **B. 북마클릿 JSON** | `extraction-{slug}.json` (Downloads 폴더) | 로그인 필요·QA env·내부망·관리자 페이지 (브라우저 세션 활용) |

공통 선택:
- viewport (기본 `375 × 812`)
- 출력 경로 (기본 `./preview/{slug}/`)

## 출력 디렉토리 (모드 공통)

```
./preview/{slug}/
├── raw-content.md       # 추출 API 원본 (모드 A에서만)
├── snapshot.md          # Playwright DOM 스냅샷 (모드 A에서만)
├── extraction.json      # 북마클릿 입력 사본 (모드 B에서만)
├── spec.md              # 합성된 디자인 스펙
├── assets.json          # 이미지·CDN URL·메타
├── data.json            # 구조화 데이터
├── {slug}.html          # self-contained 프로토타입 (배포 추출용 정식 네임)
├── index.html           # {slug}.html 사본 — http.server 루트 서빙용
├── manifest.json        # 프로토타입 ↔ repo 매핑 (routeId·route·pageComponent)
├── qa.md                # **필수** — QA 리포트(1회 측정 결과)
├── qa-history.md        # **필수** — 디자인 QA 자가개선 이력(캡처→diff→깨짐 재수정→원인분석→CR 승격, §4.7)
├── flow-guide.md        # **필수(목적 B)** — 플로우 단위 가이드(페이지 목적·UX goal·key action·연결 플로우·상태/조건)
├── pattern-rules.md     # **필수(목적 B)** — 페이지 패턴 룰 후보 (PTN-* 스키마, §4.6c)
├── components/          # **필수(목적 B)** — 재사용 컴포넌트 docs (페이지에서 쓰인 컴포넌트별 1파일)
│   ├── {ComponentName}.md   # props·상태·ODS 매핑·do/don't·provenance·repo 컴포넌트 경로
│   └── ...
└── qa/
    ├── prod-full.png
    └── prototype-full.png
```

> **목적 B 산출물(`flow-guide.md` + `pattern-rules.md` + `components/*.md`)은 필수다.** 이 파이프라인의 목적은 ① 플로우 단위 prod 프로토타입 **그리고** ② 재사용 컴포넌트 docs·가이드·패턴 룰 md 두 가지다. 프로토타입+qa.md 만 있고 이들이 없으면 **미완료**(Step 4.6에서 생성).

`{slug}` (디렉토리 + HTML basename) 파생 — **위에서부터 우선** (자세한 규칙·매니페스트는 §3.1.2):
1. **repo page-id (코드렌더 페이지)** — Step 1.5 Discovery 가 레포 `routeId`/`page_id` 를 찾으면 kebab-case 로. 예: `O2O_CONSULTATION_LIST` → `o2o-consultation-list`.
2. **route path slug** — routeId 없고 route 경로를 알면 그 경로. 예: `/my/consultations` → `my-consultations`.
3. **url slug (fallback)** — 레포 미접근 public 페이지. 예: `https://lifecycle.ohou.se/rental/internet` → `lifecycle-rental-internet`.

## 사전 조건 (크로스머신 셋업)

### 공통 (모든 OS)
- **Node.js >= 20.17.0** (`nvm` 권장)
- **Python 3** (임시 HTTP 서버 + JSON 처리용)
- **Claude Code** 0.x+ + Playwright MCP plugin

### 모드 A (URL 입력) 추가 조건

> **추출 API 키는 선택 사항**입니다. 키 없이도 엔드포인트는 20 RPM (분당 요청)으로 동작합니다. 우리 워크플로우는 세션당 1-3회 호출이라 무료(키 없음)로 충분합니다. 키를 등록하면 500 RPM + 1천만 토큰 누적 무료.

키 저장 옵션 (등록할 경우, 우선순위 순으로 자동 탐지):

1. **자동 셋업 스크립트** (권장):
   ```bash
   bash ~/.claude/skills/htmlviaTrueSource/setup-jina.sh
   ```
   → 브라우저에서 키 발급 → 입력 → keychain/`.env`에 자동 저장
2. **macOS Keychain** 수동:
   ```bash
   security add-generic-password -a "$USER" -s JINA_API_KEY -w "키" -U
   ```
3. **환경변수** (Linux/WSL):
   ```bash
   export JINA_API_KEY="키"      # ~/.bashrc 또는 ~/.zshrc
   ```
4. **`.env` 파일** (프로젝트별):
   ```
   # ./.env
   JINA_API_KEY=키
   ```

### 모드 B (북마클릿 입력) 추가 조건
- Chrome (또는 Chromium 기반 브라우저)
- 북마클릿 설치 (1회):
  ```bash
  open ~/.claude/skills/htmlviaTrueSource/bookmarklet/install.html
  ```
  → 브라우저에서 "📋 추출하기" 버튼을 북마크바로 드래그

### 권장 (ODS 토큰·컴포넌트 매핑)
- 사내 Nexus npm registry 접근 권한
- `bucketplace-product-design` Claude Code plugin 활성화
  ```bash
  npm config set @bucketplace:registry https://nexus.co-workerhou.se/repository/npm-private/
  ```

### 셋업 검증

#### 빠른 수동 검증
```bash
# 1. Node + Python 버전
node --version  # v20.17.0+
python3 --version  # Python 3.x

# 2. 추출 API key 확인 (모드 A)
security find-generic-password -s JINA_API_KEY -a "$USER" -w | head -c 12  # macOS
# 또는
echo $JINA_API_KEY | head -c 12  # env var

# 3. 북마클릿 (모드 B)
ls ~/.claude/skills/htmlviaTrueSource/bookmarklet/install.html

# 4. Claude Code MCP
# 새 세션에서: "인터넷 랜딩 불러와줘" 동작하면 정상
```

#### Playwright 기반 자동 검증 (권장)

새 세션에서 다음 표현으로 트리거:

> "랜딩 프로토타입 설치 검증해줘"

자동 5단계 스모크 테스트가 실행됩니다 — 자세한 내용은 아래 **Step 0** 참조.

---

## Step 0. Install Verification (Playwright MCP 자동 검증)

> "설치 검증" / "install verify" / "skill 셋업 확인" / "스킬 동작 테스트" 시 트리거. 새 머신·재설치 후 한 번 실행 권장.

목적: Claude Code + Playwright MCP + 추출 API + 북마클릿 추출 로직까지 4개 영역을 자동 점검하여 각 단계가 실제로 동작함을 보장. **외부 스킬에 의존하지 않고** 공개 페이지(`example.com`)로 toolchain만 검증한다.

### 검증 5단계

#### 0.1 사전 조건 확인
```bash
# Node + Python
node --version && python3 --version
# Skill 폴더 (자기완결 — 이 스킬 파일만 확인)
ls ~/.claude/skills/htmlviaTrueSource/SKILL.md
ls ~/.claude/skills/htmlviaTrueSource/bookmarklet/install.html
ls ~/.claude/skills/htmlviaTrueSource/setup-jina.sh
```
실패 시: 해당 파일/명령 누락 안내 후 종료.

#### 0.2 추출 API 호출 검증 (무인증 → 키 모두)

```bash
# 무인증 (20 RPM)
JINA_NOKEY_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" "https://r.jina.ai/https://example.com" --max-time 15)
echo "추출 API no-key: HTTP $JINA_NOKEY_STATUS"

# 키 있으면 추가 검증
JINA_KEY=$(security find-generic-password -s JINA_API_KEY -a "$USER" -w 2>/dev/null || echo "$JINA_API_KEY")
if [ -n "$JINA_KEY" ]; then
  JINA_KEY_STATUS=$(curl -sS -o /dev/null -w "%{http_code}" "https://r.jina.ai/https://example.com" \
    -H "Authorization: Bearer $JINA_KEY" --max-time 15)
  echo "추출 API with-key: HTTP $JINA_KEY_STATUS"
fi
```
기대: 둘 다 200. 401/403 → 키 무효 → `setup-jina.sh` 재실행 안내.

#### 0.3 Playwright MCP 렌더 검증 (공개 페이지)

외부 스킬·산출물 없이, 공개 페이지로 Playwright MCP 가 실제로 렌더·측정 가능한지만 확인:

```
browser_resize 375 × 812
browser_navigate https://example.com
browser_take_screenshot fullPage=true → /tmp/verify-render.png
browser_evaluate (아래 함수)
```

검증 함수 (페이지가 정상 로드되고 DOM 측정이 되는지 확인):
```js
() => {
  const h1 = document.querySelector('h1');
  return {
    h1Text: h1?.textContent.trim(),                 // 기대: "Example Domain"
    bodyChildren: document.body.children.length,     // 기대: >= 1
    rendered: getComputedStyle(document.body).display !== 'none',
  };
}
```

검증 통과 기준:
- `h1Text` 가 비어있지 않음 (네트워크·렌더 정상)
- `bodyChildren >= 1`, `rendered = true`

> 실제 프로토타입 렌더·인터랙션 검증은 Step 4 QA 가 매 작업마다 수행하므로, 설치 검증 단계에서는 toolchain 연결만 확인한다.

#### 0.4 북마클릿 추출 로직 검증

같은 페이지에서 extractor.js 로직을 Playwright로 직접 실행 — 다운로드는 시뮬레이션만 (alert/createObjectURL 부분 제외하고 payload 빌드까지):

```js
async () => {
  // extractor.js의 핵심 추출 부분만 실행
  const colors = new Set(), bgs = new Set(), fs = new Set();
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colors.add(s.color);
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(s.backgroundColor);
    if (s.fontSize) fs.add(s.fontSize);
  });
  return {
    colorsCount: colors.size,
    bgsCount: bgs.size,
    fontSizesCount: fs.size,
    imagesCount: document.querySelectorAll('img').length,
    fontFamily: getComputedStyle(document.body).fontFamily,
    letterSpacing: getComputedStyle(document.body).letterSpacing
  };
}
```

기대: `colorsCount >= 5`, `imagesCount >= 0`, `fontFamily` contains "Pretendard", `letterSpacing` = "-0.3px".

#### 0.5 정리 + 보고

```bash
browser_close
```

검증 결과 리포트 형식:

```
✅ 사전 조건       (Node v20.17 / Python 3.x / skill 파일 3종)
✅ 추출 API no-key  HTTP 200
⚠ 추출 API with-key 미설정 (선택 — bash setup-jina.sh로 등록 가능)
✅ Playwright 렌더  example.com 정상 로드 + DOM 측정 OK
✅ Extractor 로직  N개 컬러, N개 폰트사이즈, N개 이미지 감지
✅ 북마클릿 install.html 정상 (~/.claude/skills/htmlviaTrueSource/bookmarklet/install.html)

→ 전체 셋업 정상. 새 페이지에서 사용 시작 가능.
```

실패 케이스별 안내:
- 추출 API 호출 실패 → 키 재발급 or 무인증 모드 안내
- Playwright 렌더 실패 → Playwright MCP plugin 설치/연결 확인 안내
- 추출 로직 0건 → 페이지 load timeout, 재시도 안내

### 자동 트리거 후속 액션

검증 완료 후 사용자에게 다음 옵션 제시:
- "튜토리얼 돌려줘" → 첫 사용 가이드 (실제 페이지에 적용)
- "북마클릿 install.html 열어줘" → `open ~/.claude/skills/.../install.html`
- "추출 API key 설정" → `setup-jina.sh` 실행

## 산출물 형식 (self-contained)

이 스킬은 별도 예시 스킬을 읽지 않아도 동작한다 — spec.md 구조는 **Step 1c**, HTML 패턴은 **Step 3.1~3.2**, QA 프로토콜은 **Step 4(요약 9단계 + 4.1~4.5)** 에 모두 인라인돼 있다.

> (선택) 과거 PoC 산출물이 로컬에 있으면 참고용으로 열어볼 수 있으나 **필수 아님**. 없어도 워크플로우는 완결된다.

---

## Step 1. Spec MD 초안 추출 (모드별 분기)

입력 모드를 자동 감지: 사용자가 URL을 주면 모드 A, `extraction-*.json` 경로/내용을 주면 모드 B.

### 모드 A — URL 입력 (추출 API + Playwright)

#### 1a. 추출 API로 콘텐츠 markdown

JINA_KEY 로드 (4가지 순서로 시도, 모두 실패 시 **무인증 모드**로 호출):

```bash
JINA_KEY=$(security find-generic-password -s JINA_API_KEY -a "$USER" -w 2>/dev/null)
[ -z "$JINA_KEY" ] && JINA_KEY="$JINA_API_KEY"
[ -z "$JINA_KEY" ] && [ -f .env ] && JINA_KEY=$(grep -E '^JINA_API_KEY=' .env | cut -d= -f2- | tr -d '"')

mkdir -p ./preview/{slug}

# 키 있으면 헤더 추가 (500 RPM), 없으면 무인증 호출 (20 RPM)
if [ -n "$JINA_KEY" ]; then
  curl -sS https://r.jina.ai/<URL> \
    -H "Authorization: Bearer $JINA_KEY" \
    -H "Accept: text/plain" \
    -o ./preview/{slug}/raw-content.md
else
  echo "ℹ 추출 API key 없음 — 무인증 모드 (20 RPM)로 호출"
  curl -sS https://r.jina.ai/<URL> \
    -H "Accept: text/plain" \
    -o ./preview/{slug}/raw-content.md
fi

# 429 rate-limit 시 setup-jina.sh 안내 후 fallback
if [ ! -s "./preview/{slug}/raw-content.md" ] || head -c 200 "./preview/{slug}/raw-content.md" | grep -qi "429\|rate"; then
  echo "⚠ Rate limit 또는 빈 응답. 키 등록 권장: bash ~/.claude/skills/htmlviaTrueSource/setup-jina.sh"
fi
```

### 1b. Playwright로 페이지 구조·스타일 추출 (필수 풀스크롤 + 패턴 감지)

```
browser_resize 375 × 812
browser_navigate <URL>
browser_snapshot boxes=true filename=./preview/{slug}/snapshot.md
browser_evaluate → 풀스크롤 + 토큰 + 섹션 패턴 추출 (아래 함수)
browser_take_screenshot fullPage=true filename=./preview/{slug}/qa/prod-full.png
```

> **풀스크롤 필수**: 페이지 끝까지 스크롤해서 모든 섹션이 lazy-load + intersection-observer로 mount되도록 보장. 스크롤 후 다시 측정 — 첫 측정은 placeholder/data:image뿐.

> ⚠ **무한스크롤 가드 (S-2, contents-community PoC 교훈)**: 피드/리스트형은 풀스크롤이 **끝나지 않아** `scrollHeight` 가 폭증한다(실측: 쇼핑수다 2.3M px). "끝까지 스크롤"을 무가드로 돌리면 거대 DOM·메모리·시간 폭증 + fullPage 캡처 불가. **스크롤 루프에 무한 감지**를 넣는다: 직전 `scrollHeight` 대비 계속 증가(예: 3회 연속 +30% 이상)하면 무한스크롤로 판정 → **최초 N(기본 8) viewport 까지만** 로드하고 중단, `log` 로 "무한스크롤 — N뷰포트로 제한" 경고. 이때 항목 수 ≠ 노출 수이므로 spec 에 "노출분만 캡처(무한)" 명시(CR-1/CR-6).

> ⚠ **viewport 재확인 필수 (ohou-experts QA에서 학습)**: Playwright MCP 브라우저가 크래시·재시작되면 viewport가 기본값(데스크탑 ~520px+)으로 **리셋**된다. 리셋된 상태에서 측정하면 layout 의존값(width, flex-direction, grid 컬럼 수 등)이 **데스크탑 기준으로 오염**된다 (실제 사례: §7 견적순위가 mobile 가로막대인데 desktop 세로 podium으로 잘못 측정됨). 따라서:
> - **모든 측정/추출 evaluate 직전에 `browser_resize 375 × 812`를 다시 호출**한다 (navigate 직후, 재시작 직후 특히).
> - 추출 결과의 컨테이너 width가 예상(≈375 또는 343)을 크게 벗어나면 viewport 오염을 의심하고 resize 후 재추출.
> - font-size·color·radius·line-height 등 **viewport 무관 토큰값은 오염돼도 유효**하나, width·height·flexDirection·gridTemplateColumns 등 **layout값은 반드시 375에서 재측정**.

> 🔧 **브라우저 락 복구 (반복 발생)**: `Error: Browser is already in use ... use --isolated` 또는 `Target page... has been closed`가 나오면 stale lock이다. 복구:
> ```bash
> pkill -f "mcp-chrome" 2>/dev/null; sleep 1
> rm -f ~/Library/Caches/ms-playwright/mcp-chrome-*/SingletonLock 2>/dev/null
> ```
> 이후 `browser_navigate` 재시도 → **반드시 `browser_resize 375 × 812` 재호출**.

토큰 + 섹션 패턴 통합 추출 JS:
```js
async () => {
  // ── 1. 풀스크롤로 lazy-load 모두 트리거 ────
  const step = 400;
  for (let y = 0; y < document.body.scrollHeight; y += step) {
    window.scrollTo(0, y);
    await new Promise(r => setTimeout(r, 200));
  }
  window.scrollTo(0, document.body.scrollHeight);
  await new Promise(r => setTimeout(r, 500));  // 끝까지 + 추가 대기
  window.scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 500));

  // ── 2. 토큰 ──────────────────────────────
  const colors = new Set(), bgs = new Set(), fs = new Set(), radii = new Set(), fws = new Set();
  document.querySelectorAll('*').forEach(el => {
    const s = getComputedStyle(el);
    if (s.color && s.color !== 'rgba(0, 0, 0, 0)') colors.add(s.color);
    if (s.backgroundColor && s.backgroundColor !== 'rgba(0, 0, 0, 0)') bgs.add(s.backgroundColor);
    if (s.fontSize) fs.add(s.fontSize);
    if (s.fontWeight && el.textContent.trim()) fws.add(s.fontWeight);
    if (s.borderRadius && s.borderRadius !== '0px') radii.add(s.borderRadius);
  });

  // ── 3. 섹션별 레이아웃 패턴 자동 감지 ──────
  // H2를 기준으로 각 섹션의 컨테이너를 찾고 패턴 분류
  function findSectionContainer(h2) {
    let el = h2;
    while (el && el !== document.body) {
      const parent = el.parentElement;
      if (!parent) break;
      const r = parent.getBoundingClientRect();
      const meaningfulChildren = [...parent.children].filter(c => {
        const cr = c.getBoundingClientRect();
        return cr.height >= 40;
      });
      if (parent.querySelector('h2') === h2 && meaningfulChildren.length >= 2 && r.height >= 100) {
        return parent;
      }
      el = parent;
    }
    return h2.parentElement;
  }

  const sectionPatterns = [...document.querySelectorAll('h2')].map(h2 => {
    const container = findSectionContainer(h2);
    const cr = container.getBoundingClientRect();

    // 패턴 감지: overflow-x:auto/scroll OR display:grid OR vertical-stack
    const overflowXScrolls = [...container.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return s.overflowX === 'auto' || s.overflowX === 'scroll';
    });
    const grids = [...container.querySelectorAll('*')].filter(el => {
      const s = getComputedStyle(el);
      return s.display === 'grid' && el.children.length >= 2;
    });

    let pattern = 'vertical-stack';
    let scrollContainer = null, gridContainer = null;
    if (overflowXScrolls.length > 0) {
      pattern = 'horizontal-scroll';
      scrollContainer = overflowXScrolls[0];
    } else if (grids.length > 0) {
      pattern = 'grid';
      gridContainer = grids[0];
    }

    return {
      heading: h2.textContent.trim().slice(0, 60),
      y: Math.round(cr.y + window.scrollY),
      height: Math.round(cr.height),
      childCount: container.children.length,
      imgCount: container.querySelectorAll('img').length,
      h3Count: container.querySelectorAll('h3').length,
      // 핵심: 패턴 + 측정값
      pattern,
      scrollGap: scrollContainer ? getComputedStyle(scrollContainer).gap : null,
      scrollOverflowX: scrollContainer ? getComputedStyle(scrollContainer).overflowX : null,
      gridCols: gridContainer ? getComputedStyle(gridContainer).gridTemplateColumns : null,
      gridGap: gridContainer ? getComputedStyle(gridContainer).gap : null,
      // 카드 수 추정 (스크롤/그리드 첫 자식의 동기 개수)
      itemCount: (scrollContainer || gridContainer)?.children.length || 0,
    };
  });

  return {
    fontFamily: getComputedStyle(document.body).fontFamily,
    letterSpacing: getComputedStyle(document.body).letterSpacing,
    colors: [...colors].slice(0, 30),
    backgrounds: [...bgs].slice(0, 20),
    fontSizes: [...fs].sort((a,b) => parseFloat(a)-parseFloat(b)),
    fontWeights: [...fws].sort(),
    radii: [...radii].slice(0, 15),
    pageHeight: document.body.scrollHeight,
    sectionCount: document.querySelectorAll('h2').length,
    sections: sectionPatterns
  };
}
```

> **출력 활용 규칙**:
> - 각 섹션의 `pattern` 값(`horizontal-scroll` / `grid` / `vertical-stack`)을 spec §3 컴포넌트 매핑에 **명시 필수**
> - `itemCount`로 실제 카드 수 파악 — Step 3에서 더미 N건이 아닌 **실데이터 N건 inline 필수**
> - `pattern === 'horizontal-scroll'`이면 `ScrollableList` ODS 매핑, `pattern === 'grid'`면 `Grid` ODS 매핑

### 1b.2 H2 없는 영역도 검출 (NEW — v3 추가)

H2 기반 detection이 놓치는 영역들 자동 보충:

```js
// (a) 작은 텍스트 + 카드 그룹 패턴 (예: "인테리어 시공이 필요할 때")
const orphanSections = [...document.querySelectorAll('div, section')]
  .filter(el => {
    // 1) H2가 없고
    if (el.querySelector('h2')) return false;
    // 2) 짧은 텍스트 헤딩 형태 (12-30 chars)
    const heading = el.querySelector(':scope > *:first-child');
    if (!heading || heading.tagName.startsWith('H')) return false;
    const txt = heading.textContent?.trim();
    if (!txt || txt.length > 30 || txt.length < 4) return false;
    // 3) 자식에 a/button 그룹이 있고
    const linkGroups = [...el.querySelectorAll('a, [role="button"]')];
    if (linkGroups.length < 2) return false;
    // 4) 높이가 100 이상
    return el.getBoundingClientRect().height >= 100;
  });

// (b) 필터 탭 / 토글 그룹 패턴
const filterTabs = [...document.querySelectorAll('div, ul')]
  .filter(el => {
    const buttons = [...el.children].filter(c =>
      c.matches('button, [role="tab"], [role="radio"], a[class*="tab"]')
    );
    if (buttons.length < 2 || buttons.length > 8) return false;
    // active 상태가 하나라도 있으면 필터 탭
    return buttons.some(b =>
      b.matches('[aria-pressed="true"], [aria-selected="true"], [class*="active"], [class*="selected"]')
    );
  });
```

→ spec §3에 다음 명시:
- `orphan_sections`: pseudo-heading + card group 패턴 N개
- `filter_tabs`: 필터/탭 그룹 N개 (탭 라벨 + activeIndex 포함)

### 1b.3 카드별 측정 + 2-col 패턴 자동 분류 (NEW)

```js
function detectColumnLayout(scrollContainer) {
  const cards = [...scrollContainer.children].filter(c =>
    c.getBoundingClientRect().width >= 80
  );
  if (cards.length < 2) return { columns: 1, cardWidth: null };

  const cardWidths = cards.map(c => c.getBoundingClientRect().width);
  const containerWidth = scrollContainer.getBoundingClientRect().width;
  const avgCard = cardWidths.reduce((a,b)=>a+b)/cardWidths.length;

  // viewport-relative: 한 화면에 카드 몇 개가 보이는지
  const visibleColumns = Math.round(containerWidth / (avgCard + 12));  // 12px gap 가정

  return {
    columns: visibleColumns,        // 1=large card, 2=2-col scroll, 3=3-col
    cardWidth: Math.round(avgCard),
    containerWidth: Math.round(containerWidth),
  };
}
```

각 카드 측정 시 dimensions를 카드별로 spec에 inline:
```yaml
card_dimensions:
  width: 159        # 실측
  height: 280
  columns_per_screen: 2   # 2-col scroll (한 화면에 2개 카드)
```

### 1b.4 사용자가 본 ohou/experts 실패 사례에서 학습한 추가 패턴

다음 패턴들이 H2 detection으론 못 잡혀서 v3 prototype에 누락됨:

| 누락 케이스 | 검출 방법 |
|---|---|
| "인테리어 시공이 필요할 때" pseudo-heading | 1b.2 (a) orphan section |
| §5 직영 후기 "전체/주방/도배/장판마루" 탭 | 1b.2 (b) filter tabs |
| §6 시공사례 "전체/모던/미니멀/내추럴" 탭 | 1b.2 (b) filter tabs |
| §3/§6 2-column horizontal scroll | 1b.3 column 자동 분류 |

### 1b.4b 리스트/피드 페이지 감지 (S-1, h2/h3=0 — contents-community PoC 교훈)

H2/H3 기반 섹션 감지(§1b·1b.2)는 **피드/리스트형 페이지에서 0건**이 된다(실측: 쇼핑수다 h2=0·h3=0). 섹션 인벤토리가 빈 채 Step 3 로 가면 구조 누락. **fallback 감지**:

```js
// h2+h3 == 0 이면 "반복 카드 리스트" 분기
const headings = document.querySelectorAll('h2,h3').length;
if (headings === 0) {
  // 동일 className 형제가 ≥5 개인 최빈 서브트리 = feed item
  const byCls = {};
  document.querySelectorAll('div,li,article,a').forEach(el=>{
    const sib = el.parentElement; if(!sib) return;
    const cls = el.className?.toString().split(' ')[0]; if(!cls) return;
    const key = sib.tagName+'>'+cls;
    (byCls[key] ||= []).push(el);
  });
  const feedGroups = Object.entries(byCls).filter(([k,v])=>v.length>=5 && v[0].getBoundingClientRect().height>=40);
  // 최다 반복 그룹 = 피드 카드; 그 위 가로스크롤(overflow-x) = 인기 캐러셀; 그 위 chip row = 필터 탭
}
```

→ spec §3 에 `repeated-card-list` 패턴으로 기록: 피드 카드 = "동일 클래스 형제 최빈 서브트리", 카드 1장의 서브트리를 §1b.5(computed-style 트랜스플랜트)로 정밀 추출. 카드가 **2-row**(예: row1 뱃지+제목+썸네일 / row2 메타+댓글)면 row 별로 분리 측정(S-4). 항목은 **동적(시간순)** 일 수 있으니 content-item 일치가 아닌 **구조 정합**으로 판정(CR-5).

### 1b.5 computed-style 트랜스플랜트 — 픽셀 정합이 필요할 때 (NEW — ohou-experts v4 QA에서 학습)

집계 치수(카드 width/height/count)만 측정하면 "비슷하지만 다른" 프로토타입이 나온다. 사용자가 **"prod와 정확히 동일"**을 요구하거나 QA에서 컴포넌트 UI 불일치가 반복되면, bounding-box 근사를 버리고 **요소별 computed style을 추출해 그대로 이식**한다.

**핵심 원칙**:
- 손으로 `2fr/1fr`·`gap 2px`·`radius 12px`를 추정하지 말고, prod 카드 서브트리를 walk하며 노드별 computed style을 덤프 → `card-spec-prod.json` / `comp-spec-prod.json`으로 저장 → Step 3가 이 값을 그대로 적용.
- **컨테이너 locator 주의**: H2 기준으로 scroll 컨테이너를 찾을 때 **filter-tab/chip row가 먼저 잡힌다**(걔들도 overflow-x:scroll). 콘텐츠 카드를 찾으려면 "자식이 `<img>`를 포함하고 width ≥ 120"인 scroll 컨테이너를 선택 (실제 사례: §5·§6에서 '전체' 탭 칩을 카드로 오인 → 재추출 필요했음).
- **STYLE만 이식, 콘텐츠는 유지**: prod는 지역 개인화·run별 변동이므로 추출한 텍스트/이미지가 아니라 **스타일만** 가져오고 콘텐츠는 기존 실데이터 사용.

추출 화이트리스트 (layout 결정 프로퍼티 + pseudo):
```js
const PROPS=['display','flexDirection','gap','alignItems','justifyContent','gridTemplateColumns','gridTemplateRows',
 'position','top','right','bottom','left','overflow','overflowX','width','height','minWidth','maxWidth','boxSizing','aspectRatio',
 'paddingTop','paddingRight','paddingBottom','paddingLeft','marginTop','marginRight','marginBottom','marginLeft',
 'borderTopWidth','borderStyle','borderColor','borderTopLeftRadius','borderTopRightRadius','borderBottomRightRadius','borderBottomLeftRadius',
 'fontSize','fontWeight','lineHeight','letterSpacing','color','textAlign','whiteSpace','textOverflow','webkitLineClamp',
 'backgroundColor','backgroundImage','boxShadow','opacity','objectFit','objectPosition'];
// 각 노드: getComputedStyle(el) + getComputedStyle(el,'::before'/'::after') 의 content≠none 이면 pseudo도 캡처
// NOISE(기본값: auto/normal/none/0px/rgba(0,0,0,0)/static…) 는 제외해 파일 압축
```

**구조까지 prod와 다를 수 있음 — 썸네일로 단정 금지**. 실제 사례에서 발견된 구조 차이:
- §7 견적순위: 가로 막대인 줄 알았으나 **세로 podium(top-3, #1만 강조)** → 반드시 해당 섹션 **region 스크린샷**으로 구조 확인 후 빌드
- §3 리뷰: 이미지가 **정사각**, h3는 author가 아니라 **meta(지역/평형)**
- §4 직영: 상하분리가 아니라 **풀블리드 이미지 + 하단 텍스트 오버레이**
→ 추출 직후 의심 섹션은 `browser_take_screenshot`(viewport)로 한 장 떠서 layout을 눈으로 확정한다.

**ODS 토큰 매핑 규칙 (token 정합 전략)**: ODS는 **spacing/radius/gap 토큰이 없다**(컴포넌트 내장). 따라서:
- 색상 → ODS semantic 토큰(`foreground`·`backgroundBrand`·`accentGreen`·`foregroundDisabled`…)
- 타이포 → ODS textStyle(`body16L20`·`body14L20`·`body14L18`·`detail12L16`·`detail10L14`…)
- spacing/radius/gap, 그리고 ODS 미매칭 색(예: `#2F3438`) → **raw px/hex + semantic 주석**으로 CSS variable 선언

검증은 Step 4.4 (요소 단위 computed-style diff)로 수행.

### 1c. spec.md 합성 — **strict contract 형식 (필수)**

> v2부터 spec MD는 "노트"가 아닌 **계약(contract)** 이다. Step 3는 이 contract를 정확히 준수해야 하며, Step 4 QA는 contract 위반을 high severity로 분류한다.

각 §3 컴포넌트 항목에 다음 필드를 **의무**로 작성:

```yaml
- name: <컴포넌트 이름>
  ODS_mapping: <ODS 컴포넌트 이름 or "needsRecipe">
  recipe_used: <recipe 이름 or null>   # 1c.recipe-search 결과
  pattern: horizontal-scroll | grid | vertical-stack    # browser_evaluate 직접 측정값
  itemCount: <정수 N>                  # raw-content.md 파싱 정확값
  measurements:
    width: <px>
    height: <px>
    gap: <px>
    padding: <css value>
  inline_data:                         # Step 3가 inline해야 할 실데이터 keys
    - title, meta, image, ...
  step3_assertions:                    # Step 3 자체 검증 체크
    - "querySelectorAll('.<selector>').length === <N>"
    - "getComputedStyle('#<id>').overflowX === '<value>'"
```

→ Step 3는 코드 생성 후 inline browser_evaluate로 이 assertions를 검증, 하나라도 fail이면 self-retry.

#### 1c.recipe-search — Recipe-first 매칭 (필수)

각 컴포넌트 후보에 대해 ODS recipe 검색 시도 (기존 list_components/get_token만으론 부족):

```js
// 각 §3 컴포넌트 후보별:
const items = await ods_prototype.search_items({ query: semantic_role });    // 예: "product card carousel"
const recipes = await ods_prototype.list_recipes({ category: inferred });    // 예: "product"
// 매칭되는 recipe가 있으면:
const recipe = await ods_prototype.get_recipe({ name: matched_name });
// recipe.canonicalUsage를 spec.md의 inline_data 옆에 첨부
```

매칭 결과 분기:
- **Recipe found** → `recipe_used: <name>` + canonicalUsage 사용 (Step 3 안정성 ↑)
- **Component found, no recipe** → `ODS_mapping: <component>`, recipe 없음 명시
- **Neither** → `ODS_mapping: needsRecipe`, raw HTML fallback + Appendix B에 신청 후보 기록

`./preview/{slug}/spec.md` 는 아래 **Step 1c 합성 spec 구조**(§0 메타 ~ §3 컴포넌트별 `component_id`/`pattern`/`inline_data`/`step3_assertions` ~ §11)를 따른다.

### 모드 B — 북마클릿 JSON 입력

사용자가 북마클릿으로 추출한 JSON을 제공:

#### 1a. JSON 위치 확인

다음 순서로 탐색:
1. 사용자가 직접 경로 제공 → 그대로 사용
2. 기본: `~/Downloads/extraction-{slug}.json` (가장 최근 파일)
3. 현재 작업 디렉토리: `./extraction-*.json`

```bash
# 가장 최근 추출 파일
LATEST=$(ls -t ~/Downloads/extraction-*.json 2>/dev/null | head -1)
```

#### 1b. JSON 파싱 + 디렉토리 생성

```bash
SLUG=$(jq -r '._meta.slug' "$LATEST")
mkdir -p "./preview/$SLUG/qa"
cp "$LATEST" "./preview/$SLUG/extraction.json"
```

#### 1c. spec.md 합성 (북마클릿 데이터에서)

JSON의 다음 필드를 spec.md 섹션에 매핑:
- `_meta.url, title, viewport` → §0 페이지 개요
- `tokens.{colors, backgrounds, fontSizes, fontWeights, radii, fontFamily, letterSpacing}` → §1 토큰
- `structure.{h1, h2s, h3s, sections, buttons}` → §2 레이아웃 + §4 섹션 스펙
- `images, backgroundImages` → §8 자산
- `embedded.{nextData, initialState, jsonScripts}` → 콘텐츠/데이터 사전

모드 B는 Playwright 비실행 — 모든 정보가 JSON에 있음. 단, 좌표 정보(rect)가 모드 A보다 제한적이라 spec.md §3 컴포넌트 측정값은 "북마클릿 추출 기준"으로 표기.

### (모드 A 계속) Playwright 합성 spec

```
§0  페이지 개요 (URL, 뷰포트, 페이지 목적)
§1  전역 토큰 (Color/Typography/Spacing/Radius/Elevation)
    └ ODS semantic 토큰으로 매핑 가능한 항목은 매핑 명시
§2  레이아웃 (ASCII 다이어그램으로 섹션 구조)
§3  컴포넌트 카탈로그 (각 컴포넌트별 ODS 매핑 + 측정값)
§4  섹션 스펙 (섹션별 콘텐츠·옵션 데이터)
§5  동작 (Interactions, B1~Bn ID로 액션 정의)
§6  반응형 / 디바이스
§7  접근성 (aria 속성 등)
§8  자산 (assets.json 참조)
§9  콘텐츠 사전 (실제 텍스트, 리스트, 데이터)
§10 재현 체크리스트
§11 후속 작업 (Out of Scope)
Appendix A  ODS 컴포넌트 매핑 요약표
```

ODS 토큰 매칭은 `ods-prototype.get_tokens` + `get_token_migration_hints` MCP 도구 사용. 컴포넌트 매핑은 `ods-prototype.list_components` 참조.

---

## Step 1.4 Source Resolution Gate (필수 — Discovery 앞단, contents-community PoC 교훈)

> **빌드 전에 ground-truth 소스를 확정한다.** "공유 URL/slug → 실제 GitHub owner/repo → 검증 → 접근 체크"를 거쳐 두-축 ground truth(핵심원칙 1)를 라우팅. (실패 사례: `contents.ohou.se/community/product` 를 URL 경로 `contents-web` 만 보고 레포명으로 **추정·미검증** manifest 기재 → 실제로 `contents-web` 은 레포가 아니었고 해당 contents 프론트는 계정 접근 범위 밖이었음.)

### 1.4a repo 해석 (slug/URL → owner/repo)
1. URL host/path·slug·raw-content 의 단서(redirect 경로, asset 경로, `__NEXT_DATA__.buildId`, 페이지 메타)로 owner/repo **후보**를 만든다. **경로 세그먼트 = 레포명 가정 금지**(예: `/contents-web/...` 는 라우팅 prefix).
2. 후보를 **반드시 검증**: `gh repo view <owner>/<repo>` / `gh search repos --owner <owner> <kw>` / `gh repo list <owner>`. resolve 안 되면 후보 폐기.
3. resolve 되면 모노레포 여부 확인 후 라우트→page 컴포넌트 경로까지 좁힌다(`gh api repos/.../git/trees/<branch>?recursive=1` 로 community/route 디렉토리 탐색). leaf·상태머신·조건·카피는 이 소스가 1순위.

### 1.4b 접근 체크 → 4-케이스 라우팅 (fallback ladder)
- **(a) repo 해석 OK + 접근 OK** → **repo-primary**(동작/정책/IA/카피) + runtime 시각 교차검증. provenance=`repo`.
- **(b) repo 는 맞는데 권한 없음** → **사용자에게 매번 확인**(AskUserQuestion: ① runtime 으로 진행 + 동작/정책 `inferred` 표기 + 추후 재-grounding / ② 권한 획득까지 중단). 진행 선택 시 provenance=`inferred`. **추정 레포명을 사실로 기재하지 말고** manifest 에 `repo: "<후보> (access-blocked)"`, `groundTruth: "runtime-capture"`, `resolution: "권한 밖 — 추후 re-grounding"` 로 사유 기록.
- **(c) SDUI/서버구성**(leaf 정책이 레포에 없음) → 설계상 **runtime-primary**(정책축까지). provenance=`runtime`.
- **(d) 둘 다 불가** → 중단 + 사유 보고.

### 1.4c inferred 항목 렌더 규칙 (케이스 b·c·d 진행 시)
- 동작/정책을 repo 로 확인 못한 항목은 **best-effort 로 구현하되 가시적 inferred 마커**를 단다: spec/qa 에 `[inferred]` 태그, 프로토타입 DEV 패널 또는 해당 섹션에 "repo 미확인" 주석. 프로토타입은 **동작하게** 만들되(스텁 아님) fidelity 를 과대 표기하지 않음.
- **Re-grounding 훅**: 추후 repo 권한 취득 시 **동작/정책 패스만** repo 로 재실행 → 해당 항목 provenance 를 `inferred`→`repo` 로 승격, manifest·spec 갱신.

### 1.4d 산출물 반영
- `manifest.json`: `rendering`·`repo`·`pageComponent`·`groundTruth`·`resolution` + 컴포넌트별 `provenance`.
- `spec.md`: §0 에 소스 해석 결과(케이스 a~d) 명시, 각 §3 컴포넌트·§5 동작에 `provenance` 태그.

### 1.4e repo 코드 읽기 절차 (G-1, 케이스 a 전용 — "어떻게 읽나"의 구체화)

> 케이스 (a)에서 레포명만 resolve 하고 멈추면 안 된다. **route → page 컴포넌트 → leaf** 를 실제로 읽어 동작·상태·조건·카피를 확정한다. full clone 없이 `gh api` 로 부분 읽기 가능.

1. **route → pageComponent 매핑**: 트리에서 라우터 규약으로 페이지 파일 찾기.
   ```bash
   BR=$(gh api repos/{owner}/{repo} --jq .default_branch)
   gh api "repos/{owner}/{repo}/git/trees/$BR?recursive=1" --jq '.tree[].path' \
     | grep -iE "pages/.*{route}|app/.*{route}/page|routes/.*{route}"   # next pages/app or route registry
   ```
2. **page 컴포넌트 읽기** (raw):
   ```bash
   gh api "repos/{owner}/{repo}/contents/{pageComponentPath}?ref=$BR" --jq .content | base64 -d
   ```
3. **leaf 트리 재귀**: page 의 `import { X } from '...'` 를 따라 **leaf 컴포넌트까지** 읽는다(§1.5 rule2 래퍼체인 + leaf). 많으면 sparse checkout:
   ```bash
   git clone --depth 1 --filter=blob:none --sparse https://github.com/{owner}/{repo} /tmp/{repo}
   cd /tmp/{repo} && git sparse-checkout set {srcDir}/pages/{route} {srcDir}/domains/{domain}
   ```
4. **추출 체크리스트(동작/정책 — provenance=`repo`)**: 각 항목을 소스에서 확정해 state-map·spec 에 기록.
   - [ ] **상태머신**: status enum / case 분기(`populated/loading/empty/error`) — 콘텐츠 상태만(rule6)
   - [ ] **조건부 노출**: `{cond && <X/>}` → conditional + 게이팅 소스(flag/eligibility/API), 기본 비노출
   - [ ] **카피**: 하드코딩 문자열 vs server-driven(`*.banners` 등 dataSource) — 창작 금지
   - [ ] **max-count / crop**: `slice(0,N)` / `nth-of-type` 등 노출 제한
   - [ ] **핸들러→동작**: `onClick` → navigation(route)/toast/sheet open — 프로토타입 §5 동작으로 1:1 매핑(G-4)
   - [ ] **컴포넌트 출처**: import 경로로 ODS/BDS/도메인 판별(§4.5 source layer)
5. **재-grounding**: 케이스 b 로 시작해 나중에 권한 취득 시 이 1.4e 만 재실행 → `inferred`→`repo` 승격.

---

## Step 1.5 Discovery 정합성 규칙 (consultations PoC 교훈 — 모든 모드 공통)

추출/캡처는 "보이는 것"만 잡는다. 아래 5규칙으로 **구조 누락·콘텐츠 창작·조건부 오인**을 막는다. (실패 사례: 상담내역에서 할인배너 창작, 상단 탭(신청내역/받은문서/채팅) 누락, FAQ 동작 창작 — 모두 이 규칙 부재로 발생.)

1. **렌더 컨텍스트 먼저 고정.** 웹(브라우저) vs 인앱 webview 에 따라 노출 chrome 이 다름(웹=GNB+카테고리내비+푸터, webview=최소 TopNavigation). 타깃 컨텍스트를 정하고 그 chrome 만 포함. prod 대조 캡처도 **같은 컨텍스트·같은 viewport**로.
2. **래퍼 체인 재귀 해석.** route 의 named 컴포넌트에서 멈추지 말 것 — 반환 JSX 의 `<*Layout>`·provider 를 **app 레벨까지** 따라가 공통 chrome(탭·헤더·네비·푸터)을 섹션 인벤토리에 포함. (예: `ConsultationList` → `<MyLayout>`(MyHeader+MyTab) → app Layout/Footer.) "named 컴포넌트=전체 화면" 가정 금지.
3. **조건부·데이터 출처 표기.** `{cond && <X/>}` 는 상시 아님 → 게이팅 소스(flag/eligibility/API) 기록 + 기본 비노출. 서버구동 텍스트(`*.banners` 등)는 dataSource 명시, 카피 창작 금지(placeholder).
4. **leaf 콘텐츠·인터랙션 창작 금지.** FAQ/배지/리스트의 문구·개수·동작은 추정하지 말고 **leaf 컴포넌트 또는 노드 캡처에서 추출**(아코디언 vs 링크, 기본 open 여부, 정확 문자열, 최대 노출 개수).
5. **코드렌더면 레포가 1순위 ground truth.** route 컴포넌트·values(enum)·layout·leaf 컴포넌트를 직접 읽어 상태머신·조건·카피를 확정. 캡처(런타임)·추출 API 는 보강. (SDUI/서버구성이면 런타임 캡처가 1순위 — 소스 라우터로 판별.)
6. **status/state(case 머신)는 콘텐츠·데이터 상태만.** `pageStates` 는 `populated`/`loading`/`empty`/`error` 처럼 **같은 화면의 데이터 렌더 분기**만 포함한다. 아래는 status 에서 **제외**하고 별도 축으로 모델링:
   - **auth(로그인/비로그인)** → status 아님. **접근 가드/redirect** 로 분리(prod 가 로그인 페이지로 보내면 그건 다른 라우트).
   - **조건부 비노출 요소(배너·프로모 등)** → status 아님. `sections[].conditional`+`dataSource` 로 분리(노출 토글이지 페이지 상태가 아님).
   - **system/OS chrome(statusbar·home indicator·GNB 등 preview harness)** → status 아님. ScreenShell `osChrome` 영역으로 분리, **컴포넌트 diff QA(§4.5)에서도 제외**.
   - dev 패널/문서에서 status 토글과 이 "별도 조건"을 **시각적으로 구분**해 표기.

> state-map 스키마에 `renderContext`·`layoutChain`·`sections[].conditional|dataSource|contentSource` 필드를 두어 위를 구조적으로 강제. `pageStates` 에는 콘텐츠 상태만 넣고 auth·조건부요소·system 은 넣지 않는다.

### 1.5b 플로우 단위 스코핑 — 멀티 페이지/탭 플로우일 때 (옵션 제안 강제)

단일 화면이 아니라 **탭/스텝/멀티페이지 플로우**(예: My 섹션 신청내역·받은문서·채팅 3탭)면, 빌드 전에 **스코프를 사용자에게 옵션으로 제안**한다(AskUserQuestion). 임의로 끝까지 만들지 말 것.

- **스코프(깊이) 옵션 축**:
  1. **1depth + 탭/스텝 전환만** (권장 기본) — 각 화면의 list/state(populated·empty·loading)와 전환 동작까지. 2depth(상세·미리보기·외부 SDK 화면)는 **stub**(클릭 시 "범위 외" 토스트).
  2. **+ 핵심 2depth 1개** — 가장 가치 높은 상세 1개까지.
  3. **단일 화면만 심화 + 나머지 placeholder**.
- **Ground truth/데이터 방법 축** (권장: repo 구조 + fixture):
  - 멀티상태·인터랙션·탭전환은 **런타임 노드 캡처 한 장으로 못 잡음** → **레포가 구조·상태·문구 1순위**. 노드 캡처는 탭별 픽셀 QA 보조(§4.5).
  - **실시간/외부 SDK(예: Sendbird 채팅)** 는 정적 캡처로 동작 재현 불가 → **리스트 시각만 fixture**, 실시간/입장은 범위 외.
  - 디자인 스펙만(레포 미사용)은 비권장(상태/조건/문구 누락→창작).
- **구현 패턴**: 공통 chrome(탭바·헤더)은 **공유 컴포넌트로 1회** 렌더 + 활성 화면 body 를 상태 전환. 2depth 진입은 공통 `stub(label)` 토스트. 칩/기간필터 등 반복 컴포넌트는 공유화.

---

## Step 2. 자산·데이터 자동 추출

### 2a. 이미지 수집

`browser_evaluate`로 다음 추출:

```js
() => ({
  imgs: [...document.querySelectorAll('img')].map(el => ({
    src: el.currentSrc || el.src,
    alt: el.alt || null,
    naturalWidth: el.naturalWidth,
    naturalHeight: el.naturalHeight,
    displayedWidth: Math.round(el.getBoundingClientRect().width),
    displayedHeight: Math.round(el.getBoundingClientRect().height),
    srcset: el.srcset || null
  })),
  backgroundImages: [...document.querySelectorAll('*')]
    .map(el => ({ tag: el.tagName.toLowerCase(), bg: getComputedStyle(el).backgroundImage, rect: el.getBoundingClientRect() }))
    .filter(x => x.bg && x.bg !== 'none' && x.bg.startsWith('url('))
    .map(x => ({ tag: x.tag, url: x.bg.match(/url\("?([^"]+)"?\)/)?.[1], w: Math.round(x.rect.width), h: Math.round(x.rect.height) })),
  pictureSources: [...document.querySelectorAll('picture source')].map(el => ({ srcset: el.srcset, media: el.media, type: el.type })),
  svgInlineCount: document.querySelectorAll('svg').length
})
```

### 2b. 구조화 데이터 감지

다음 패턴을 순차 시도:

```js
() => ({
  nextData: window.__NEXT_DATA__ || null,
  initialState: window.__INITIAL_STATE__ || null,
  apolloState: window.__APOLLO_STATE__ || null,
  reduxState: window.__REDUX_STATE__ || null,
  jsonScripts: [...document.querySelectorAll('script[type="application/json"]')].map(s => ({ id: s.id, text: s.textContent.slice(0, 1000) })),
  ldjson: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent)
})
```

자주 보이는 다른 패턴:
- 가격/상품 리스트 → `[data-product-id]` `[data-price]`
- 옵션 매트릭스 → state object (예: `pricing.json` 같은 구조)
- API 응답 → `browser_network_requests`로 인터셉트

발견된 데이터가 페이지 동작에 핵심이면 `./preview/{slug}/data.json`으로 저장.

### 2c. assets.json 저장 — **카드별 매핑 (sampling 금지)**

> **v3부터 sampling 금지**: 섹션별로 카드 N개를 enumerate하여 각 카드의 이미지/텍스트를 idx-매핑으로 저장.

카드별 자산 추출 JS:
```js
async () => {
  // 풀스크롤 후 카드별 매핑 (Step 1b의 sections 결과 활용)
  const cardMaps = {};
  for (const section of detectedSections) {
    const container = section.scrollContainer || section.gridContainer;
    if (!container) continue;
    const cards = [...container.children];
    cardMaps[section.heading] = cards.map((card, idx) => {
      const imgs = [...card.querySelectorAll('img')]
        .map(i => (i.currentSrc || i.src))
        .filter(s => s && !s.startsWith('data:') && !s.startsWith('blob:'));
      const text = card.textContent.trim();
      return {
        idx,
        images: imgs,
        text_snippet: text.slice(0, 200),
        rect: {
          w: Math.round(card.getBoundingClientRect().width),
          h: Math.round(card.getBoundingClientRect().height)
        }
      };
    });
  }
  return cardMaps;
}
```

저장 형식:
```json
{
  "_meta": { "source": "<URL>", "captured_at": "<ISO>" },
  "sections": {
    "추천 업체 둘러보기": {
      "cards": [
        { "idx": 0, "images": ["https://prs.../abc.jpg", ...], "text_snippet": "체크인테리어 5.0 리뷰 9", "rect": {w: 280, h: 254} },
        { "idx": 1, "images": ["https://prs.../def.jpg", ...], "text_snippet": "리안 디자인 5.0 리뷰 21", "rect": {w: 280, h: 254} },
        ...
      ]
    },
    "시공사례": { "cards": [...] }
  },
  "global_images": [...],   # 기존 sampling list (보조용)
  "data": {...}
}
```

→ **Step 3는 sections.*.cards[idx] 그대로 inline**. 21개 카드면 21개 고유 URL 사용. **반복 URL 사용 금지**.

`blob:` URL이 있는 카드는 풀스크롤 부족 신호 → 1초 추가 대기 후 재추출.

추출된 이미지는 prototype HTML에서 **원본 CDN URL 그대로** 참조 (재호스팅 X).

---

## Step 3. Self-contained HTML 프로토타입 생성

> ⚠ **선행 필수: Step 3.5.0 컴포넌트 인벤토리 게이트** — 빌드 전에 컴포넌트 목록 추출 → ODS 대조 → ODS 컴포넌트의 *실제 토큰값* 확보를 끝낸 뒤 빌드한다. badge·chip·tab·card 등을 손으로 근사해 짓고 나중에 고치는 순서 금지(community 칩 버그).

아래 **3.1 필수 구성 + 3.2 패턴 체크리스트**를 따른다 (단일 HTML 파일, 외부 JS 의존 X):

### 3.1 필수 구성

- `<!doctype html>` + Pretendard Variable CDN link
- CSS variables로 §1 토큰 매핑 (`--foreground`, `--backgroundBrand`, `--accentRed` 등)
- `.frame` 컨테이너 (width 375px, max-width 100vw, padding-bottom = sticky bar 높이만큼)
- §3 컴포넌트들을 inline HTML로 구성
- §5 동작들을 inline `<script>`로 구현 (외부 JS 의존 X)
- 페이지에 구조화 데이터가 있으면 `const DATA = {...};`로 inline (data.json을 Python 등으로 치환)

> ⚠ **구현 범위 제외 (글로벌 CLAUDE.md §2 규칙 — 필수)**: 프리뷰는 **feature 콘텐츠 영역만** 재현한다. 다음은 **구현하지 않는다**:
> - **웹 네비게이션 영역 (GNB)** — 글로벌 상단 내비(로고·검색·장바구니·햄버거·카테고리 GNB). 서비스 공통 chrome.
> - **statusbar 컴포넌트 영역** — OS 상태바(시간·배터리·신호·노치·home indicator). preview harness/OS chrome.
> 단, 콘텐츠 바로 위 **페이지 전용 헤더/탭(타이틀 바·콘텐츠 필터 탭)** 은 feature이므로 포함. QA에서도 GNB·statusbar는 비교 대상 제외(§4 / `references/design-qa-prompt.md` "제외 영역").

### 3.1.1 실데이터 인라인 의무화 (NEW)

> **더미/샘플 3건이 아닌 raw-content.md의 모든 항목을 inline해야 합니다.** Step 2의 `assets.json` + raw-content.md 파싱 결과를 빠짐없이 적용.

각 섹션의 데이터 적용 규칙:

| 패턴 | 적용 규칙 |
|---|---|
| `horizontal-scroll` | Step 1c의 `itemCount` 만큼 카드 inline. 이미지 URL은 assets.json에서. |
| `grid` | `gridCols`를 그대로 적용 + 모든 항목 inline. |
| `vertical-stack` | raw-content.md에서 H3/리스트 항목 모두 inline. 차트형이면 percentage/value도. |

**raw-content.md 파싱 예시 (시공사례 H3 추출)**:

```python
import re
with open('./preview/{slug}/raw-content.md') as f:
    raw = f.read()
# H3 헤딩 추출
h3_pattern = re.compile(r'### (.+?)$', re.MULTILINE)
all_h3s = h3_pattern.findall(raw)
# 또는 markdown link로 표현된 카드 추출:
# [![Image XX](url) ### 카드 제목 메타](href)
card_pattern = re.compile(r'\[!\[Image \d+.*?\]\((.+?)\).*?### (.+?)\s+(\d+평[^\]]*)\]')
all_cards = card_pattern.findall(raw)
# 결과를 {slug}.html의 const DATA = {...}에 inline
```

> **준수 체크리스트** (Step 3 완료 전 자체 검증):
> - [ ] 각 섹션의 실데이터 N건이 모두 inline되었는가? (placeholder 3건만 X)
> - [ ] horizontal-scroll 섹션이 `vertical-stack`으로 렌더되지 않는가?
> - [ ] `assets.json`의 이미지 URL이 카드별로 정확히 매핑되었는가?
> - [ ] §7 같은 차트형 섹션이 raw 데이터(예: 5개 percentage bar)와 일치하는가?

### 3.1.2 출력 파일 네이밍 + 배포 코드 추출 규칙 (필수)

프로토타입 파일명을 generic `prototype.html` 로 두지 말고 **repo page-id / url slug 를 따라** 생성한다. 나중에 이 프로토타입을 실제 repo 페이지/컴포넌트로 옮길 때(배포 코드 추출) 1:1 매핑이 되도록 하는 것이 목적.

**N1. 파일·디렉토리 basename = `{slug}`** (위 「출력 디렉토리」 파생 규칙: page-id > route slug > url slug).
- 정식 산출물 = `{slug}.html` (예: `o2o-consultation-list.html`). `index.html` 은 이 파일의 **사본**(http.server 루트 서빙용) — 둘은 항상 동일 내용.
- 생성 후 복사: `cp ./preview/{slug}/{slug}.html ./preview/{slug}/index.html`.

**N2. 멀티 페이지/탭 플로우(1.5b)** — page-id 별로 파일을 쪼갠다.
```
./preview/{flow-slug}/
├── o2o-consultation-list.html   # 탭1 (routeId 기반)
├── o2o-documents-list.html      # 탭2
├── o2o-chat-list.html           # 탭3
├── index.html                   # 플로우 진입/탭 네비 (기본 첫 페이지 또는 shell)
└── manifest.json
```

**N3. `manifest.json` — 프로토타입 ↔ repo 매핑** (배포 코드 추출의 핵심 산출물). Step 1.5 Discovery 의 `source` 를 그대로 기록:
```json
{
  "pages": [{
    "file": "o2o-consultation-list.html",
    "routeId": "O2O_CONSULTATION_LIST",
    "route": "/my/consultations",
    "repo": "bucketplace/o2o-web",
    "pageComponent": "src/pages/my/consultations/index.page.tsx",
    "rendering": "code-render | sdui",
    "groundTruth": "repo | runtime-capture",
    "resolution": "gh repo view 검증 OK | access-blocked(추후 re-grounding) | sdui | unresolved",
    "components": [
      { "id": "consultation-card", "repoComponent": "ConsultationListCard", "source": "@bucketplace/design-system | bds | o2o-react", "provenance": "repo | runtime | inferred" }
    ]
  }]
}
```
- 코드렌더+접근 가능이면 `routeId`·`pageComponent` 채움(레포가 동작/정책 ground truth, `groundTruth: "repo"`).
- **추정 레포명을 검증 없이 채우지 말 것**(Step 1.4). 접근 불가면 `repo: "<후보>(access-blocked)"`·`groundTruth: "runtime-capture"`·`resolution: "access-blocked..."`, `pageComponent: null`, 컴포넌트 `provenance: "inferred"`. SDUI 면 `groundTruth: "runtime-capture"`·`provenance: "runtime"`.
- **provenance** 는 "99% 동일" 클레임 게이트(핵심원칙 8) — `repo` 만 정책 99% 주장 가능.

**N4. 배포 추출 용이성 — HTML 구조를 repo 컴포넌트 경계에 맞춘다**:
- 각 컴포넌트 블록을 **repo 컴포넌트명 주석으로 래핑**: `<!-- [ConsultationListCard] repo: domains/my/.../ConsultationListCard -->` … `<!-- [/ConsultationListCard] -->`.
- 섹션 `id`/`data-component` = spec 의 `component_id` 와 일치(예: `<section id="consultation-card" data-component="ConsultationListCard">`).
- 토큰은 hex 직접값 금지 → CSS variable(`var(--foreground)`)로, manifest 의 ODS 매핑과 1:1 (레거시→ODS 토큰 치환을 추출 시 자동화 가능).
- 동작 스크립트는 컴포넌트별 함수로 분리(인라인이라도 `function ConsultationListCard_onToggle(){}` 식 네이밍) → 추출 시 핸들러 매핑 용이.

> 이렇게 하면 "이 프로토타입을 실제 `{routeId}` 페이지로 구현" 요청 시, manifest + 주석 경계 + component_id 로 파일↔repo 컴포넌트가 곧바로 매핑된다.

### 3.2 패턴 체크리스트

검증된 self-contained HTML 패턴:
- [ ] Header `position: relative` (sticky 아님), 상단에서 고정 X
- [ ] Sticky bar `position: fixed; bottom: 0; width: 375px` + `body padding-bottom`
- [ ] 가로 스크롤은 `.scroll-row { padding: 0 16px; }` 필수 (양쪽 끝 padding)
- [ ] Radio/Checkbox는 `role` + `aria-checked` 정확히 부여
- [ ] FAQ accordion은 단일 펼침 (다른 항목 클릭 시 닫힘)
- [ ] 모든 컬러는 CSS variable로 (raw hex 직접 사용 X)
- [ ] letter-spacing -0.3px body 전체 적용 (한글 최적화)

### 3.2.1 컴포넌트 컬러 사용 규칙 (필수)

다음 3개 룰을 모든 prototype 생성 시 강제 적용:

**R1. Primary CTA는 항상 Brand Blue**
- Primary CTA = `backgroundBrand` (#00A1FF) fill
- ODS `BoxButton` 사용 시: `variant="brand-solid"`

**R2. Primary + Secondary 동시 사용 시 Secondary는 Outline 타입**
- Primary: `brand-solid` (filled blue)
- Secondary: `brand-outlined` (border만, fill 없음)
- ❌ 금지: Primary blue 옆에 Secondary가 dark/black filled로 들어가는 패턴
- ✅ 예시:
```html
<!-- Sticky bar 또는 footer action 영역 -->
<button class="cta secondary"><!-- outline --></button>
<button class="cta primary"><!-- brand-solid --></button>

<style>
.cta.primary { background: var(--backgroundBrand); color: white; border: none; }
.cta.secondary { background: transparent; color: var(--backgroundBrand); border: 1.5px solid var(--backgroundBrand); }
</style>
```

**R3. CTA 외 인터랙션 컴포넌트는 Primary Blue 금지**
- Radio, Checkbox, Chip(selection), Toggle 등의 **선택/체크 상태**에 `backgroundBrand` 사용 X
- 대신 사용:
  - 선택 border: `borderStrong` (= `gray.900`, #141414)
  - 체크 아이콘 fill: `foreground` (= `gray.900`)
  - 라디오 dot/체크박스 fill: `foreground`
- ❌ 금지 예시: `.radio-card[aria-checked="true"] .radio-dot::after { background: var(--backgroundBrand); }`
- ✅ 권장 예시: `.radio-card[aria-checked="true"] .radio-dot::after { background: var(--foreground); }`

이 룰들은 ODS의 "primary blue는 conversion 행위(CTA)에만 사용한다"는 원칙을 코드화한 것입니다. spec §3 각 컴포넌트 항목에서 prod가 이 룰을 어기는 경우가 발견되면 spec Appendix B에 "needsReview"로 명시하되, 신규 prototype은 항상 룰을 준수합니다.

### 3.2.2 자산·아이콘 사용 규칙 (필수 — 이모지/임의 마크업 금지)

> **하드 룰: 아이콘·일러스트·로고·별점 등 "자산"을 이모지(🏠 👷 👑 ★ 등)나 임의 손그림 SVG/유니코드 글리프로 대체하는 것을 금지한다.** 자산이 필요하면 반드시 아래 우선순위로 **조회 → 참조 → 반영**한다. (ohou-experts QA 교훈: 🏠/👷/👑/★ 이모지가 prod 일러스트를 대체해 사용자가 지적함.)

**자산 해결 우선순위 (위에서부터 시도):**
1. **prod가 렌더하는 실제 자산을 캡처** — prod DOM에서 해당 노드의 `<img src>`(ohousecdn static URL)이면 URL 그대로 사용. **인라인 SVG**(@bucketplace/icons·assets 컴포넌트)면 `outerHTML`을 추출해 `./assets/{name}.svg`로 저장 후 `<img src="assets/{name}.svg">` 참조. (큰 일러스트는 인라인 대신 파일 분리로 HTML 경량 유지.)
   - 추출 패턴: prod 노드를 locator로 찾아 `el.querySelector('svg').outerHTML` 를 `browser_evaluate({filename})` 로 덤프 → Python으로 개별 `.svg` 파일 분리.
2. **ods-prototype MCP 조회** — `search_icon`(@bucketplace/icons) / `search_asset`(@bucketplace/assets, type=image|lottie)로 정확한 자산명 확인. self-contained HTML이라 React import 불가하면, 동일 자산의 prod 렌더본(1번)을 쓰거나 ohousecdn static URL(`https://asset.ohousecdn.com/static/{AssetName}/{kebab}.svg`)을 사용.
3. **둘 다 없을 때만** 중립 placeholder(빈 박스/회색 톤) + spec에 "asset 미확인" 표기. **이모지/임의 글리프는 어떤 경우에도 금지.**

**Lottie 에셋은 loop autoplay 로 렌더 (필수):** `search_asset` 결과 **type:"lottie"** 인 에셋은 정적 PNG/첫 프레임으로 대체하지 말고 **반복재생 플레이어**로 렌더한다. self-contained HTML 은 `<lottie-player>`(@lottiefiles CDN) 또는 dotlottie-player + `loop autoplay` 속성, React 는 `lottie-react`/`@dotlottie/react-player` 에 `loop autoplay`. (QA: `references/design-qa-prompt.md` R9)

**미디어/배너 슬롯 (필수):** 슬롯에 넣는 모든 이미지의 **종횡비가 슬롯에 부합**해야 한다(가로 배너에 portrait 금지). 캐러셀이면 **전 슬라이드 개별 확인**. 미디어 뒤 컨테이너 bg 는 임의 hex 금지(`object-fit:cover` 풀필 또는 prod 슬롯 bg 토큰). (QA R8)

**검증(Step 4 필수 추가):** 생성된 prototype.html에 이모지/픽토그램 유니코드가 없는지 정규식 스캔.
```python
import re; html=open('prototype.html').read()
emoji=re.findall(r'[\U0001F000-\U0001FAFF☀-➿←-⇿⬀-⯿★☆]', html)
assert not emoji, f"이모지/글리프 잔존 — ods-asset으로 교체 필요: {set(emoji)}"
```
- 예외: CSS로 그린 **순수 도형**(chevron `border` 삼각형, divider 등 UI 프리미티브)과 system/OS chrome은 허용. 단 **브랜드 로고·서비스 일러스트·기능 아이콘·별점/뱃지**는 반드시 실자산.
- `assets/` 디렉토리에 추출 자산을 모으고, 출처(prod 노드 / ods-asset명)를 spec §8에 기록.

### 3.3 데이터 인라인 (Python 치환 패턴)

원본 HTML 템플릿에 `const DATA = __DATA__;` placeholder를 두고 빌드:

```python
import json, shutil
with open('data.json') as f: data = json.load(f)
with open('{slug}.html') as f: html = f.read()
html = html.replace('const DATA = __DATA__;', 'const DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',',':')) + ';')
with open('{slug}.html', 'w') as f: f.write(html)
shutil.copyfile('{slug}.html', 'index.html')   # http.server 루트 서빙용 사본
```

저장: `./preview/{slug}/{slug}.html` (정식 네임, §3.1.2) + `index.html`(사본) + `manifest.json`(repo 매핑).

### 3.4 ODS React 프로토타입 트랙 + ODS 사용 함정 (PD/PO 타깃 시 — consultations PoC 교훈)

기본 산출물은 self-contained HTML 이나, **타깃이 ODS 컴포넌트 프로토타입(PD/PO 리뷰·디자인시스템 정합)** 이면 `ods-prototype.get_starter_files` 로 Vite+React18+`DesignSystemProvider` scaffold 를 떠서 ODS 컴포넌트로 조립. 실측 검증된 **ODS 함정**:

- **아이콘은 `weight` 필수.** `@bucketplace/icons` 는 `` `${renderMode}|${weight}` `` 키로 SVG 선택 → `weight` 없으면 `()=>null`(아무것도 안 보임). 항상 `weight="regular"` 등 지정(`*Filled` 도 동일). 색은 부모 `color` + `renderMode="monochrome"` 로 상속.
- **아이콘 size 는 prod 아이콘폰트 nominal 값을 그대로 복사 금지.** prod 가 OhouseIcon 등 **아이콘폰트**(예 `_dropdown_18`/font-size 18)면 글리프 시각크기는 box(18)보다 작다. ODS **SVG** 아이콘은 box 를 꽉 채우므로 같은 숫자(18)면 prod 보다 **커 보인다** → 보통 한 단계 작게(16)가 시각 일치. 노드값(font-size/svg width)을 적되 **시각 대조로 확정**.
- **semantic 토큰은 전역 CSS 변수가 아님.** `var(--foreground)` 등은 비어 있음(`Canvas` fallback). 컴포넌트 밖 hand-styled 색은 `LIGHT_THEME.colors.<name>` 에서 읽음(`useTheme` export 없음 → `LIGHT_THEME`/`DARK_THEME`).
- **props 는 d.ts 로 확정**(추정 금지): `ChipVariant='normal|outlined|solid|subtle'`(선택 전용 prop 없음·`outlined`=border 0 렌더), `Avatar` placeholderIcon 필수, `Divider` height, `BoxButton` size/variant enum, `Text` variant=textStyle.
- **starter peer dep 누락**: `@bucketplace/ui`(Dialog/BottomSheet 의존)가 `focus-trap-react` 요구 → 별도 설치.
- **ODS 로 prod 가 안 맞으면 token 기반 커스텀.** ODS 가 못 내는 스타일(light-border dropdown·chip — ODS outlined 는 dark/borderless)은 ODS semantic 토큰(`border`·`foreground`·`backgroundBrand`…)으로 직접 구현하고 **사유 기록**. 오버레이/시트 등 인터랙션은 ODS 컴포넌트 유지.
- **서비스 도메인 일러스트·placeholder 는 ods-assets 로 갈음**(없으면 `@bucketplace/icons` + 컬러 토큰; 색 디폴트는 보통 primary=`foregroundBrand`). 파트너 프로필 등은 실제 이미지 URL 주입(placeholder 만 X).
- 색·폰트는 `get_tokens` 확정값(예: foreground `#141414`·foregroundWeak `#8C8C8C`·brand `#00A1FF`), 타이포는 textStyle variant(`heading18`·`body16L24`·`body14L18`·`detail13L18`…).

> prod 가 ODS+레거시(BDS·o2o-react) 혼재(마이그레이션 중)면 ODS 프로토타입은 **migration 타깃** — 차이는 §4.5 의 3분류로 처리.

---

## Step 3.5 ODS-first 검증·치환 플로우 (필수 — **인벤토리·대조는 빌드 전**, 검증·치환은 빌드 직후)

> **하드 룰: 설치된 `ods-prototype` 을 단일 기준으로, 컴포넌트는 ① 인벤토리 추출 → ② ODS 대조 → ③ ODS 컴포넌트의 *실제 토큰값* 으로 빌드(우선 적용) 한다.** 디자인 QA 정합성 저하의 최대 원인은 "ODS에 있는데 임의 근사 구현"이다. 이 게이트 없이 Step 3 빌드·Step 4 QA 로 넘어가지 않는다. (교훈: ohou-experts 탭·뱃지·폰트사이즈 ODS 미참조 / **community 칩 — "ODS Chip 으로 매핑"은 했으나 실제 토큰(border #141414·fs14·idle #141414·`::before` ring) 미적용 → 근사 빌드로 버그**.)

### 3.5.0 컴포넌트 인벤토리 게이트 (빌드 전 — 필수 선행)
Step 3 빌드 **전에** 다음을 수행. 근사로 먼저 만들고 나중에 고치지 말 것.
1. **인벤토리 추출**: spec §3 의 모든 컴포넌트(+leaf)를 목록화 — chip·tab·badge·card·list·divider·button·avatar·input·toggle·sheet·dropdown 등.
2. **ODS 대조**: 각 항목을 `check_component_name`/`list_components`/`list_recipes` 로 매칭 → `ods | recipe | needsRecipe(신규)` 판정.
3. **실토큰 확보 후 빌드**: `ods` 매칭이면 **`get_component`(+offline catalog)로 그 컴포넌트의 variant·size·state(selected/idle/disabled)·pseudo 토큰을 가져와 그대로 적용**. prod 노드 캡처(CR-10: `::before`/`::after` 포함)와 교차확인. **이름만 "ODS Chip"으로 적어두고 값은 손으로 근사하는 것 금지.**

> **이름 매핑 ≠ 통과.** "ODS 컴포넌트로 매핑함"은 필요조건일 뿐, **매핑된 ODS 컴포넌트의 실제 variant/state/pseudo 토큰값을 적용**해야 통과. (community 칩이 이름검사만 통과하고 값이 틀렸던 사례.)

### 3.5.1 카탈로그 로드 (값 추정 금지 — MCP 조회, **미가용 시 offline catalog**)
구현할(그리고 구현한) 컴포넌트 인벤토리의 **모든** 토큰/폰트/컴포넌트/에셋을 열거한 뒤, ods-prototype 으로 기준 카탈로그를 만든다:
| 축 | MCP 도구 |
|---|---|
| colors | `ods-prototype.get_tokens`(color) + `get_token_migration_hints` |
| typography | `get_tokens`(text/typography) — textStyle 단위 |
| spacing/radius/shadow | `get_tokens` + `get_token_migration_hints` (ODS는 semantic 적음 → 허용범위 기록) |
| components | `list_components` / `get_component` / `list_recipes` / `get_recipe` / `check_component_name` |
| assets/icons | `search_asset`(image·lottie) / `search_icon` |

> **ODS MCP 미연결 시 fallback (필수 — 추정 금지)**: `@bucketplace/ods-prototype/src/catalog/*.json`(node_modules / Downloads 패키지) 을 **오프라인 ground truth** 로 사용 — `components.json`(Chip/Tab/Badge 등 variant·props·canonicalUsage), `tokens.json`(semantic→hex), `icons.json`/`assets.json`. 토큰뿐 아니라 **컴포넌트 spec(`get_component` 대체)도 여기서 조회**한다. (community 런: MCP 없이 tokens 만 보고 Chip 컴포넌트 spec 을 안 봐서 근사한 것이 버그 원인.)

→ `./preview/{slug}/catalog.json` 으로 저장(구조: `{colors,typography,spacing,radius,shadow,components,assets}`).

### 3.5.2 4축 검증 → 치환 결정
프로토타입의 각 사용처를 카탈로그와 대조:
1. **토큰(color)** — raw hex가 ODS semantic에 매핑되면 그 토큰으로 치환. ODS 미보유색은 raw + 사유 주석(`needsReview`).
2. **폰트** — 모든 텍스트의 size/weight/lineHeight를 ODS textStyle로 매핑·치환(임의 px 금지). 미매칭만 raw + 사유.
3. **컴포넌트** — **badge·card·list·divider·chip·tab·button 등은 무조건 ODS 컴포넌트로 매핑하고, 그 ODS 컴포넌트의 *실제 variant/state/pseudo 토큰값* 으로 구현**(임의 마크업·임의 근사 금지). `list_components`/`list_recipes`로 매칭 후 `get_component`(또는 offline `components.json`)로 토큰 확보. **검사는 2단계: (a) ODS 컴포넌트로 매핑됐나 (b) 매핑된 컴포넌트의 active/idle/disabled 및 `::before`/`::after` 토큰값이 실제로 적용됐나(CR-10).** (a)만 통과하고 (b)가 근사면 **High**(community 칩: ODS Chip 매핑 OK였으나 border #E0E0E0·fs15·idle #8C8C8C 근사 → 실제 #141414·fs14·idle #141414 미적용).
4. **에셋/아이콘** — 이모지·임의 글리프·임의 SVG 금지(§3.2.2). `search_asset`/`search_icon` 또는 prod 렌더 자산으로 치환.

### 3.5.3 신규 패턴 분기
ODS에 동등 컴포넌트가 **없는** "공통화 가치 있는" 신규 패턴은 → `shared-components/` 공통 소스로 관리(상세: `shared-components/README.md`):
- `*.tsx`(ODS 토큰 기반 구현) + `*.usage.md`(사용 규칙) + `*.spec.ts`(Playwright 정합성) **삼중 산출물**
- `shared-components/CATALOG.md` 에 등재(candidate→reviewing→promoted→deprecated)
- self-contained HTML 프로토타입은 이 공통 컴포넌트와 **동일 시각 스펙**으로 인라인, 출처를 `spec.md §8`에 기록
- 1회성 레이아웃은 등록 금지(프로토타입 로컬 유지).

### 3.5.4 치환 후 기록
- `spec.md §3`의 각 컴포넌트에 `ODS_mapping`(치환된 ODS 컴포넌트명) / `token_mapping` 갱신.
- 치환 불가(ODS 미보유)는 `Appendix B`에 `needsReview` + 신규후보 여부 기록.
- 이후 Step 4 QA(`references/design-qa-prompt.md`)가 catalog.json 기준으로 정합성 재검증.

---

## Step 4. Design QA (Playwright 기반) — ⚠ **필수 단계**

> ⬆ **최상위 필수 참조: `references/qa-common-rules.md`(공통 규칙 CR-1~CR-9)** — page-type 불문 모든 QA가 먼저 통과해야 하는 공통 게이트(3개 아웃풋 QA에서 반복된 문항을 승격·정리). 위계: SKILL §4 → qa-common-rules.md → design-qa-prompt.md(R1~R9) → 각 `qa.md`.
> **표준 측정 절차는 `references/design-qa-prompt.md`(ODS 카탈로그 기준 검증) 를 따른다.** prod 스크린샷 대조는 보조, **catalog.json(ODS) 대조가 1순위**. 아래 §4.1~§4.5는 보강 절차.

> **Step 4는 워크플로우의 필수 부분이다.** 사용자가 "QA 빼고"를 명시적으로 요청하지 않는 한 항상 실행. 결과물에 `qa.md` 가 없으면 워크플로우는 완료된 것으로 보지 않는다.

기본 QA 절차는 이 §4 말미의 **요약 9단계**(서버 기동 → viewport 고정 → prod/proto 캡처 → computed diff → 시각 비교 → severity 정리 → `qa.md`)를 따른다. 여기에 다음을 추가한다:

### 4.0 초장신/무한스크롤 페이지 QA 분기 (S-3, contents-community PoC 교훈)

prod `pageHeight` 가 임계(기본 **20000px**)를 넘거나 무한스크롤(§1b 가드 발동)이면 **fullPage 캡처가 불가/무의미**하다(2.3M px). 이때 `prod-full.png` 대신:
- **고정 viewport 영역 캡처 N장**으로 대조: `prod-top.png`(필터/캐러셀), `prod-feed.png`(피드 카드 N개) 등 feature 구간별. 프로토타입도 동일 구간으로.
- 피드 항목은 동적이므로 **content-item 일치가 아닌 컴포넌트 구조·computed 정합**으로 판정(§4.4/4.5, CR-5).
- `qa.md` 에 "prod=무한스크롤(Npx) → fixed-viewport 영역 대조" 명시.
- **provenance**: QA 표의 각 항목에 `repo`/`runtime`/`inferred` 출처를 달고, "99% 동일"은 `repo`-grounded 항목에만(핵심원칙 8).

### 4.1 A11y tree diff (NEW)

픽셀 비교 외에 accessibility tree 양방향 비교:

```js
// prod
await browser_navigate(prod_url)
const prodA11y = await browser_snapshot({ boxes: true })
// prototype
await browser_navigate(localhost)
const protoA11y = await browser_snapshot({ boxes: true })

// 비교 차원:
// - landmark 구조 (header/main/footer/nav)
// - heading hierarchy (H1, H2, H3 count + 순서)
// - role 누락 (button, link, region)
// - aria-label 채워짐 여부
```

리포트 카테고리 확장:
```
🔴 [a11y-1] H1 부재 (prod: 0개, proto: 0개 — 일치하나 prod 자체 결함 — 리뷰 권장)
🔴 [structural-1] §6 캐러셀에 role="region" 누락
🟡 [labelling-1] button aria-label 3건 빈 문자열
```

### 4.2 Contract assertions 검증 (NEW)

spec.md의 각 §3 `step3_assertions`를 prototype에서 실행:

```js
const violations = [];
for (const section of spec.components) {
  for (const assertion of section.step3_assertions) {
    const result = await browser_evaluate(assertion);
    if (!result) violations.push({ section: section.name, assertion });
  }
}
// violations.length > 0 → high severity로 분류
```

위반 예시 (실제 ohou/experts에서 발견된):
```
🔴 [contract-1] §6 시공사례: itemCount=20 expected, actual=3
🔴 [contract-2] §6 시공사례: pattern=horizontal-scroll expected, actual=vertical-stack
```

### 4.3 Diff-driven 자동 보정 loop (NEW)

```python
qa_result = run_qa()
if qa_result.high > 0 or qa_result.contract_violations > 0:
    if not retry_attempted:
        # Step 3 재실행, QA 결과를 입력으로 제공
        feedback = format_qa_as_correction_input(qa_result)
        rerun_step3(feedback)
        qa_result = run_qa()  # 재검증
    if qa_result.high > 0:
        report_to_user("자동 수정 후 여전히 N건 잔여 — 디자인 결정 필요")
# 최대 2회 패스, 그래도 잔여면 사용자에게 보고
```

→ 사용자가 "왜 §X가 Y야?" 두 번 묻는 사이클 제거.

### 4.4 요소 단위 computed-style diff (NEW — ohou-experts v4 QA에서 학습)

스크린샷 시각 비교 + 핵심 셀렉터 몇 개로는 "비슷하지만 다른"을 못 잡는다. 1b.5로 prod 스펙을 추출했거나 픽셀 정합이 요구되면, **prod node[i] vs prototype 대응 요소**를 화이트리스트 프로퍼티로 비교한다.

```js
// prototype 측정 직전 viewport 재확인 (4.x 모든 측정 공통)
// browser_resize 375 × 812  ← 반드시
// 컴포넌트별 cs(selector, prop) 로 prod 추출값과 대조
const cs=(s,p)=>{const e=document.querySelector(s);return e?getComputedStyle(e)[p]:null;};
// 예: [['§7 podium 3col', document.querySelectorAll('.podium-col').length===3],
//      ['filterTab r16', cs('.filter-tab:not(.active)','borderTopLeftRadius')==='16px'], ...]
// diff 0 또는 허용오차(컬러 반올림·±1px)까지 보정 루프
```

> **셀렉터 함정**: `querySelector('.filter-tab')`는 **첫 요소(보통 active)**를 잡는다 → idle 스타일 검증은 `:not(.active)`로 타겟. (실제로 active 탭의 흰 글자 때문에 idle 색 검증이 오탐했음.)

**Step 4 필수 추가 점검 (반복 버그)**:
- 🔴 **undefined CSS variable**: `var(--xxx)`가 `:root`에 없으면 값이 조용히 `transparent`/initial로 떨어져 **요소가 사라진다**(실제: §7 회색 막대가 `var(--backgroundWeak)` 미정의로 투명). 점검:
  ```js
  // 사용된 모든 var(--x)가 정의됐는지
  () => { const used=new Set(); for(const ss of document.styleSheets){ try{for(const r of ss.cssRules){ (r.cssText.match(/var\(--[\w-]+/g)||[]).forEach(v=>used.add(v.slice(4))); }}catch(e){} }
    const root=getComputedStyle(document.documentElement); return [...used].filter(v=>!root.getPropertyValue(v).trim()); }  // → [] 이어야 정상
  ```
- 🟡 **UA 기본 margin이 fixed-height flex를 깨뜨림**: `<h3>`·`<p>`를 의미마크업으로 승격하면 기본 margin(~1em)이 카드 높이를 넘쳐 형제(이미지)를 flex-shrink시킨다(실제: 정사각 159² 이미지가 124로 줄어듦). fixed-height flex 카드 안의 heading/paragraph는 **`margin: 0` 리셋**. 점검: 이미지 실측이 spec과 다르면 형제의 margin을 먼저 의심.

### 4.5 컴포넌트별 diff QA — 노드 캡처 1순위 + migration 분류 (consultations PoC 교훈)

4.4(요소 단위 computed diff)를 **컴포넌트 단위**로 확장. ground truth 우선순위:
**① 북마클릿 HTML 노드 캡처(computed styles + React 트리 un-minified props) > ② Playwright computed 추출 > ③ 스크린샷.**
캡처만이 잡는 것: gap·**max-count**·누락 요소·정확 padding·React props(`variant`/`size`/`checked`/`partners`…). (실측: 스크린샷·Playwright extract 가 못 잡은 칩 gap·아바타 최대개수·FAQ 더보기 링크 누락을 노드 캡처가 드러냄.)

대조 2레이어:
- **소스 레이어** — 각 컴포넌트 import 출처(ODS `@bucketplace/design-system` / 레거시 BDS `/bds` / `@bucketplace/o2o-react`). prod 가 BDS·o2o-react 혼재면 ODS 프로토타입=**migration 타깃** 명시.
- **computed 레이어(타이포만 보지 말 것)** — box(border·radius·padding·height)·footprint(아이콘 타일 px)·자식 정렬(dot/overlay 위치)·콘텐츠 형태(placeholder vs 실제 이미지)·**max-count**(예: 아바타 4개+ellipsis 오버레이). 텍스트 노드뿐 아니라 **styled ancestor(button/label/li)** 까지 climb. (셀렉터 함정: `:not(.active)`/비선택 상태로 idle 스타일 타겟.)
- **조건부 요소(badge·dot·new 표시 등)는 prod 계정 상태에 따라 캡처에 없을 수 있다.** 이때는 **레포 컴포넌트 소스가 ground truth** — 위치/정렬을 소스 구조로 확정(예: 탭 `DotNotification`=타이틀 상단 superscript / 카드 `DotBadge`=메시지 첫 줄 상단, offset 없음). dot 위치는 dy(상단 0 vs 중앙)를 측정해 검증.
- **system/OS chrome 은 diff 대상에서 제외.** statusbar·home indicator·시간(9:41)·배터리·GNB 등 OS/preview harness 요소는 prototype 의 `ScreenShell osChrome` 가 그리는 가짜 chrome 이므로 prod 와 픽셀 비교하지 않는다(앱 컴포넌트가 아님). 비교는 feature 화면(탭 본문) 컴포넌트로 한정.

**delta 3분류 → 조치**:
1. **fidelity 갭**(같은 의도인데 값 틀림: 라벨 15px인데 prod 18px) → **수정**.
2. **migration 의도차**(prod=legacy: 색 `#2F3438`↔ODS `#141414`, BDS→ODS 컴포넌트, Modal→BottomSheet) → **문서화만**.
3. **자산 갈음**(도메인 일러스트→ODS 아이콘) → **문서화**.

재사용 computed 추출기:
```js
() => { const pick=(el)=>{ if(!el) return null; const s=getComputedStyle(el),r=el.getBoundingClientRect();
  return {fontSize:s.fontSize,fontWeight:s.fontWeight,lineHeight:s.lineHeight,color:s.color,bg:s.backgroundColor,
    border:`${s.borderTopWidth} ${s.borderTopColor}`,radius:s.borderTopLeftRadius,padding:s.padding,h:Math.round(r.height)}; };
  const deepest=(t)=>{ let n=[...document.querySelectorAll('*')].filter(e=>(e.textContent||'').replace(/\s+/g,' ').trim()===t);
    if(!n.length) n=[...document.querySelectorAll('*')].filter(e=>(e.textContent||'').includes(t));
    return n.find(e=>!n.some(o=>o!==e&&e.contains(o)))||n[0]||null; };
  const climb=(el,pred)=>{ for(let i=0;i<6&&el;i++){ if(pred(el)) return el; el=el.parentElement;} return el; };
  // 예: climb(deepest('전체시공'), e=>getComputedStyle(e).borderTopWidth!=='0px') 로 chip root
  return {/* 컴포넌트별 pick(...) */}; }
```

요약:

1. 임시 HTTP 서버 기동 — **반드시 `./preview/{slug}/` 또는 index.html이 있는 디렉토리에서** (홈 노출 방지)
   ```bash
   cd ./preview/{slug} && python3 -m http.server 8765 > /tmp/qa-server.log 2>&1 &
   ```
2. **`browser_resize 375 × 812`** (navigate 전마다 재확인 — viewport 리셋 방지, 1b 경고 참조)
3. prod 캡처: `browser_navigate <URL>` → `./qa/prod-full.png`
4. prototype 캡처: `browser_navigate http://localhost:8765/` (index.html 서빙) → `./qa/prototype-full.png`
5. `browser_evaluate`로 주요 셀렉터 computed style 추출 + **4.4 요소 단위 diff** + undefined-var/margin 점검
6. 두 스크린샷을 Read로 로드하여 시각 비교 (구조 의심 섹션은 region 스크린샷 추가)
7. severity별 차이 정리 (🔴 high / 🟡 med / 🟢 low / ❌ missing)
8. `./preview/{slug}/qa.md` 작성 (아래 severity 형식 + §4.5 컴포넌트 diff 표)
9. 서버 종료(`pkill -f "python3 -m http.server 8765"`), Playwright 탭 닫기

severity 기준:
- 🔴 **high**: 사용자가 즉시 인지 (잘못된 레이아웃, 누락된 컨테이너 padding, 핵심 아이콘 오류)
- 🟡 **med**: 픽셀 단위 차이 (간격 4-8px, 높이 10-20px)
- 🟢 **low**: 미세한 디테일 (1-2px 차이)
- ❌ **missing**: prod에는 있고 prototype에 없는 요소

---

## Step 4.6 목적 B 산출물 생성 — 컴포넌트 docs + 플로우 가이드 (G-2, 필수)

> 이 파이프라인의 목적은 ① 플로우 단위 prod 프로토타입 **그리고** ② **재사용 컴포넌트 docs·가이드·패턴 룰 md** 둘 다(핵심원칙·출력 디렉토리). QA 후 아래 세 산출물(4.6a~4.6c)을 생성한다. (※ `shared-components/` 는 "ODS 미보유 신규 패턴" 전용 레지스트리로 별개 — 여기 `components/*.md` 는 **이 페이지에서 쓰인 모든 재사용 컴포넌트의 문서**.)

### 4.6a `components/{ComponentName}.md` — 컴포넌트별 docs
spec §3 의 각 컴포넌트마다 1파일. 포함:
- **역할/언제 쓰나**, **props/variant**(repo d.ts 또는 노드 캡처 기준), **상태**(idle/active/empty…), **ODS 매핑**(컴포넌트·토큰) + migration delta, **do/don't**, **provenance**(`repo`/`runtime`/`inferred`) + repo 컴포넌트 경로(있으면), **재사용 예시**(인라인 HTML/JSX 스니펫).
- ODS 보유 컴포넌트면 "ODS {Name} 사용" 으로 매핑만, 신규 패턴이면 `shared-components/` 후보 등록 링크.

### 4.6b `flow-guide.md` — 플로우 단위 가이드
- §A 포맷(PoC flow-rules 계승): **페이지 목적 · UX Goal · Key Action · 유저 스토리**.
- **연결된 플로우**: 진입점 → 이 페이지 → 다음(상세/탭/외부) 의 **실제 네비게이션 경로**(repo 핸들러 route 또는 href 기준). 멀티페이지면 manifest N2 와 1:1.
- **상태·조건 맵**: status(콘텐츠 상태) + 별도 축(auth·조건부요소·system chrome) 구분(rule6).
- provenance 표기 — repo 미확인 동작은 `[inferred]`.

### 4.6c `pattern-rules.md` — 페이지 패턴 룰 후보 추출 (필수)

> 이 페이지가 속한 **페이지 패턴**(유형)을 분류하고, 그 패턴의 **재사용 가능 룰 후보**를 추출한다. 정책(상태 분기)과 축이 다름: 패턴 룰 = "이 유형의 페이지는 이렇게 **구성·배치·동작**한다". 목적: 같은 패턴 페이지 N개가 쌓이면 공통 룰로 승격(4.6d)해 LLM 추측을 룰로 대체.

**패턴 분류 — 2-레벨 체계 (추상 패턴 × 페이지 타입)**:

레벨 1 = **추상 패턴** (룰 승격(4.6d)의 기준 축, 택1 — 복합이면 주+부):
| 패턴 | 정의 |
|---|---|
| `FORM` | 다단계/단일 정보 입력 |
| `LIST·FEED` | 반복 카드/행 목록 (피드·내역·랭킹) |
| `DETAIL` | 단일 엔티티 상세 |
| `FUNNEL` | 단계 전환형 플로우 (온보딩·가입·결제) |
| `LANDING` | 스크롤 설득형 (기획전·가격 안내 포함) |
| `DASHBOARD` | 상태 요약/관리 (마이·지갑) |
| `HOME` | 서비스 홈/디스커버리 — 서버드리븐 모듈 믹스 |
| `SETTINGS·INFO` | 설정 행 그룹·정적 정보 (토글/링크 행 + 문서) |
| `CHAT·MESSAGING` | 대화/스레드형 (입력바 하단 고정 + 메시지 스트림) |
| `GATE` | 진입 게이트/전환 화면 (스플래시·인증 대기·인터스티셜) |

레벨 2 = **페이지 타입** (`page_type` 필드, 구체 화면 유형 → 기본 패턴 매핑). 같은 page_type 산출물이 2개 이상이면 패턴 룰보다 구체적인 **타입 룰**도 승격 가능:
| 기본 패턴 | page_type |
|---|---|
| `HOME` | SERVICE-HOME(O2O홈 등), BROWSE-DISCOVER, COMMUNITY(허브형) |
| `LIST·FEED` | SOCIALFEED, NOTIFICATIONS, ORDER-HISTORY, FOLLOWERS, LEADERBOARD, REVIEW(목록), COMMUNITY(게시판형) |
| `DETAIL` | PRODUCT-DETAIL, POST-DETAIL, ORDER-DETAIL, GROUP(그룹 상세) |
| `FORM` | SIGNUP, FORGOT-PASSWORD, VERIFICATION, SUGGESTIONS(문의/제안), REVIEW(작성) |
| `FUNNEL` | ONBOARDING, SUBSCRIPTION(가입 플로우) |
| `LANDING` | PROMOTION, PRICING |
| `DASHBOARD` | MYPAGE, DASHBOARD, WALLET |
| `SETTINGS·INFO` | SETTING, PAYMENT-METHOD(관리), SUBSCRIPTION(관리), ABOUT, HELP, TERMS |
| `CHAT·MESSAGING` | CHAT |
| `GATE` | SPLASH |

> 매핑 규칙: ① page_type 이 표에 없으면 가장 가까운 추상 패턴으로 분류 + 새 page_type 명 기재. ② 같은 이름이라도 화면 성격으로 판별 (예: REVIEW 작성=FORM / 목록=LIST·FEED, SUBSCRIPTION 가입=FUNNEL / 관리=SETTINGS·INFO). ③ 승격은 패턴 레벨이 기본, page_type 레벨은 동일 타입 2개 이상일 때 추가로.

**룰 후보 엔트리 스키마** (페이지당 룰 단위로 기재):

```yaml
- id: PTN-{PATTERN}-NN          # 페이지 로컬 일련번호 (승격 시 재부여)
  page_type: <레벨 2 타입>        # 예: SIGNUP, PRODUCT-DETAIL (승격 시 타입 룰 분리 기준)
  rule_type: structure | layout | interaction | state-link
  rule: <한 줄 — 관계·조건으로 서술>   # 예: "프로그레스는 항상 페이지 상단에 배치"
  level: MUST | SHOULD            # 강제 수준 (합의/관측 근거로 판단)
  component: <구현 컴포넌트/훅>      # 예: Stepper, formState.isValid
  assertion: <검증 가능 형태>        # step3_assertions 문법 재사용 가능하게
  source: <repo 경로·심볼 | 노드 캡처 | 합의 링크>
  confidence: extracted | agreed | inferred
  # extracted=코드 확인 / agreed=팀 합의·가이드 문서 / inferred=관측 추정
```

**작성 원칙 (LLM 추측 방지)**:
1. **관계로 서술** — 컴포넌트 존재("프로그레스 있음")가 아니라 **배치·순서·그룹핑 관계**("항상 상단", "유사 카테고리별 그룹핑")를 명시. LLM은 존재는 맞히고 관계에서 틀린다.
2. **활성 조건은 조건문 형태** — 예: "필수 input 전부 valid → CTA enabled (else disabled)". state-link 타입.
3. **assertion화 가능하게** — spec contract(`step3_assertions`)에 꽂을 수 있는 형태 우선. 룰이 곧 QA 항목이 된다.
4. **픽셀/토큰 값 금지** — 배치 관계·조건만. 측정값은 spec §3 measurements 영역(중복 기재 X).
5. **창작 금지(핵심원칙 2 동일)** — 룰은 ①repo 코드(폼 state·step·disabled 분기), ②노드 캡처/computed 관측, ③명시된 합의 문서에서만. 근거 없는 "일반적 UX 상식"은 기재하지 않거나 `inferred`+사유.

**추출 소스 (기존 산출물 재활용 — 추가 측정 불필요)**:
| 소스 | 뽑을 수 있는 룰 |
|---|---|
| spec §3 `pattern`/`step3_assertions` | structure·layout 룰 (그룹핑·스크롤 방향·섹션 순서) |
| repo 코드 (1.4e 체크리스트) | state-link·interaction 룰 (`useState(step)`·`disabled={!isValid}`·"이전" 핸들러·required 검증) — provenance=`repo`→confidence=`extracted` |
| flow-guide.md 상태·조건 맵 | state-link 룰 (status별 구성 변화) |
| components/*.md do/don't | 컴포넌트 사용 룰 → 패턴 레벨로 일반화 가능한 것만 승격 후보 |

예시 (FORM 패턴):
```yaml
- id: PTN-FORM-01
  rule_type: structure
  rule: 폼은 여러 정보 입력 단계(step)로 구분된다
  level: MUST
  component: useState(step) / Stepper
  assertion: "step 컨테이너가 2개 이상이고 동시에 1개만 표시"
  source: src/pages/.../FormPage.tsx (useFunnel)
  confidence: extracted
- id: PTN-FORM-05
  rule_type: layout
  rule: 프로그레스는 항상 페이지 상단(페이지 헤더 직하)에 배치한다
  level: MUST
  assertion: "progressbar 가 main 콘텐츠 첫 시각 요소"
  source: 노드 캡처 (computed order)
  confidence: extracted
- id: PTN-FORM-06
  rule_type: state-link
  rule: 필수 인풋이 모두 채워졌을 때만 CTA 가 활성화된다
  level: MUST
  component: formState.isValid → BoxButton disabled
  assertion: "required 미충족 시 CTA [disabled]"
  source: repo disabled={!isValid} 분기
  confidence: extracted
```

### 4.6d 패턴 룰 승격 (cross-page — 같은 패턴 산출물 2개 이상일 때)

> 단일 페이지의 `pattern-rules.md`는 **후보**다. `./preview/*/pattern-rules.md` 중 같은 `PATTERN` 페이지가 **2개 이상** 쌓이면 공통 룰을 승격한다. 트리거: "패턴 룰 승격" (또는 새 페이지 완료 시 같은 패턴 기존 산출물 발견하면 승격 제안).

1. 같은 패턴의 `pattern-rules.md` 전부 수집 → rule 단위로 대조.
2. **N개 페이지 중 N개 모두 관측** → 공통 룰로 승격 (`level` 유지). **일부만** → `SHOULD` 강등 + 예외 페이지 명기. **1개만** → 페이지 로컬 유지(승격 X).
3. 승격본 저장: `./preview/_pattern-rules/{PATTERN}.md` — id 재부여(`PTN-{PATTERN}-NN` 일련), 각 룰에 근거 페이지 slug 목록 + confidence 병기. **같은 `page_type` 이 2개 이상**이면 그 파일 안에 `## {PAGE_TYPE}` 하위 섹션으로 타입 전용 룰 분리(패턴 공통 룰과 중복 기재 X — 공통은 위로, 타입 고유만 아래로).
4. 승격본의 룰은 이후 **같은 패턴 신규 페이지의 Step 3 빌드 입력 + Step 4 QA 체크 항목**으로 사용 (assertion 있는 룰은 contract 검증 4.2에 합류).
5. 충돌(같은 관계를 페이지마다 다르게 구현) 발견 시 → 승격 보류, `conflict` 표기 + 사용자에게 보고(디자인 결정 필요 — 정책 가이드 문서의 합의 트랙으로 위임).

## Step 4.7 디자인 QA 자가개선 루프 — qa-history.md + 공통 룰 승격 (필수, 신규 페이지)

> Step 4 의 1회 측정에서 멈추지 않고, **mobile-first(375×812)로 캡처 → diff 대조 → 디자인 깨짐 재수정 → 이력 기록 → 원인분석 → 공통 QAGuide 룰 승격**까지 자가개선 루프를 돈다. 목적: 같은 깨짐(ODS 미적용·아이콘 색·pseudo 미측정 등)이 다른 페이지에서 재발하지 않게 룰로 박제. (worked example: community 칩 `#E0E0E0` 근사 → 재수정 → CR-10·CR-11 승격.)

### 4.7a 캡처 · diff · 재수정 루프 (mobile-first)
1. **mobile 375×812 우선 캡처**: prod vs prototype 동일 viewport(무한스크롤은 고정 뷰포트 영역 N장, §4.0). 추가 해상도는 보조.
2. **diff 대조**: 시각 비교 + 요소단위 computed-style diff(§4.4/4.5) + **CR-1~CR-N 게이트**(`qa-common-rules.md`)로 디자인 깨짐 이슈를 severity 로 수집.
3. **재수정(diff-driven, 최대 2~3패스)**: 자동 수정 가능 항목(토큰·치수·색·**ODS 실토큰값**)을 prototype(+source HTML)에 적용 → **재캡처·재측정으로 검증**. 🔴high·CR 위반이 0 이 될 때까지(또는 "디자인 결정 필요" 항목만 남을 때까지). prototype 과 source(예: `htmlviaTrueSource-samples`) 둘 다 동기화.
4. 각 패스의 이슈·원인·조치·검증 캡처를 4.7b 에 기록.

### 4.7b `qa-history.md` 작성 (필수 산출물)
페이지별 디자인 QA 자가개선 이력. `qa.md`(1회 측정 스냅샷)와 별개로 **수정 흐름·원인·승격**을 누적한다. 형식:
```
# qa-history — {slug}
> mobile-first(375) 디자인 QA 자가개선 이력. 공통 이슈는 원인분석 후 QAGuide.md CR 룰로 승격.
> 공통 게이트: ~/.claude/skills/htmlviaTrueSource/references/qa-common-rules.md (CR-1~CR-N)

## 루프 요약
- 패스 N회 · 최종 🔴high N / 🟡med N / 🟢low N / ✅fixed N · 캡처: qa/(prod-* · prototype-* · fix-*)

## 수정 이력
### [H-1] [🔴|🟡][CR-#] 이슈 제목
- 증상: 무엇이 깨졌나 (캡처 ref)
- 원인(root cause): 왜 발생 (근사·측정누락·ODS 미적용·MCP 미가용 등)
- 조치: before → after (값/토큰)
- 검증: 재측정 결과(일치 확인)
- 승격: CR-# 신규/기존(4.7c) 또는 page-local
```

### 4.7c 원인분석 → 공통 QA 룰 승격 (필수)
> 단일 수정으로 끝내지 말 것. **구조적 원인**이거나 **2개 이상 페이지에서 재발 가능**한 이슈는 공통 룰로 승격해 재발 차단.
1. 각 `[H-*]` 의 root cause 분류: ① **page-local**(1회성) ② **구조적/cross-page**(근사·측정누락·ODS 미적용 류).
2. ②면 `references/qa-common-rules.md` 에 **새 CR 규칙**(원인 → 검사(자동) → 판정) 추가 + `§1 매트릭스` 행 등록 + `ohouse-prototypes/QAGuide.md` **동기화**.
3. 이미 있는 CR 의 미적용이면 그 CR 의 검사 절차를 **보강**.
4. 승격된 CR 은 이후 **모든 페이지 Step 4 QA 게이트**로 자동 적용 → 같은 깨짐 재발 차단.
5. `qa-history.md` 의 해당 이슈에 승격된 `CR-#` 를 역참조.

(worked example: community 칩 ODS 근사 → **CR-10**(ODS 컴포넌트 selected/idle 을 `::before` pseudo 까지 노드 캡처) / 댓글 아이콘≠라벨 색 → **CR-11**(아이콘 fill = 라벨 color) 승격.)

## Step 5. 사용자 보고 (필수)

1-2단 요약으로 다음을 보고:

- 출력 디렉토리 경로 (`./preview/{slug}/`)
- 입력 모드 (A: URL / B: 북마클릿) + **소스 해석 결과**(케이스 a~d, groundTruth)
- spec.md 줄 수, 추출 이미지 N개, 데이터 항목 N개
- {slug}.html 사이즈
- **QA 결과 (high/med/low/missing 카운트)** — 반드시 포함
- **QA 자가개선(§4.7)**: `qa-history.md` 생성 + 재수정 패스 N회 + **승격된 CR-# 개수** — 반드시 포함
- **목적 B 산출물**: `components/*.md` N개 + `flow-guide.md` + `pattern-rules.md`(패턴 분류 + 룰 후보 N건) 생성 여부 — 반드시 포함
- 같은 패턴의 기존 산출물이 `./preview/` 에 있으면 **승격(4.6d) 가능 여부 안내**
- 다음 액션 안내: "자동 수정 가능 항목 적용해줘" / "QA 재실행" / "spec 보강" / "repo 권한 받음 → re-grounding" 등

QA를 건너뛰었거나 실패한 경우 보고에 명시: "⚠ QA 미수행 (이유)".

---

## 정리

- 임시 HTTP 서버 종료: `pkill -f "python3 -m http.server 8765"` 또는 PID 직접 kill
- Playwright 탭: `browser_close`
- 산출물 정책: **프로토타입 수준**. 실제 제품 머지 전에는 담당 FE가 접근성·상태관리·API 연동·앱 컨벤션 검토 필요.

---

## 추가 자동 트리거 (이후 호출)

사용자가 다음을 말하면 해당 step만 재실행:

| 표현 | 동작 |
|---|---|
| "spec만 다시" | Step 1 |
| "assets 재추출" | Step 2 |
| "HTML 재생성" | Step 3 (spec.md, data.json 변경 시) |
| "QA 다시" | Step 4 |
| "QA 자가개선" / "디자인 깨짐 재수정" / "qa-history" | Step 4.7 — mobile-first 캡처→diff→재수정 루프 + `qa-history.md` 기록 |
| "QA 룰 승격" / "공통 가이드에 추가" | Step 4.7c — qa-history 이슈 root cause 분석 → `qa-common-rules.md`/`QAGuide.md` 에 새 CR 승격 |
| "자동 수정 적용" | qa.md의 "자동 수정 가능 항목" CSS를 {slug}.html(+index.html 사본)에 적용 후 QA 재실행 |
| "패턴 룰 추출" / "패턴 룰만 다시" | Step 4.6c 재실행 — 기존 spec/flow-guide/components 산출물에서 pattern-rules.md 재생성 |
| "패턴 룰 승격" | Step 4.6d — `./preview/*/pattern-rules.md` 중 같은 패턴 수집·대조 → `_pattern-rules/{PATTERN}.md` 승격본 생성/갱신 |
| "prod와 정확히 동일하게" / "컴포넌트 정확 이식" / "CSS 스펙 맞춰" | 1b.5 computed-style 트랜스플랜트 → Step 3 재생성 → 4.4 요소 단위 diff (token 정합 vs 픽셀 퍼펙트 전략은 사용자에게 확인) |
| "모든 컴포넌트 동일 검증" | 1b.5를 카드뿐 아니라 전 콘텐츠 컴포넌트(탭·칩·배너·차트·footer 등)로 확장. ⚠ viewport 375 재확인 필수 |
| "[URL] 분석" + 다른 URL | 전체 파이프라인 새 슬러그로 재실행 |

---

## 트러블슈팅

- **추출 API 401/403**: keychain 키 만료/회수 — `security add-generic-password -s JINA_API_KEY ... -U`로 갱신
- **file:// 차단**: Step 4의 HTTP 서버 우회 사용 (필수)
- **CORS 오류 in 임베디드 데이터**: 페이지가 client-side fetch라면 `browser_network_requests`로 응답 캡처 후 `data.json`에 저장
- **이미지 잘림**: Step 3에서 `object-fit: cover` + `object-position`을 카드별로 조정
- **ODS 토큰 미매칭**: raw hex로 두고 spec §1.1에 "needsReview" 표기 + Appendix B에 QA 결정 사항 기록

---

## 동작 보장 범위

이 skill은 다음 유형의 페이지에서 검증됨:
- 모바일-우선 랜딩 페이지 (lifecycle.ohou.se/rental/internet)

다음은 추가 검증 필요:
- 데스크탑 전용 페이지 (breakpoint 분기 처리)
- SPA route navigation
- 로그인이 필요한 페이지
- WebGL/Canvas 인터랙션
- 비디오 콘텐츠
