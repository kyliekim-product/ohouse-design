---
title: Proto Playground — Beta v1 PRD & 구현 계획
created: 2026-05-30
status: draft
branch: proto-beta-v.1
owner: kylie.kim
audience: human-only
---

# Proto Playground — Beta v1

> **한 줄 요약**: ohouse-design 지식을 탑재한 자연어 프로토타입 생성 도구.
> "여기서 시작하면 내 Claude보다 빠르다"는 감각 전달.

---

## 1. 배경과 문제

### 현황
- `ohouse-design-mcp`에는 ODS 컴포넌트, 도메인 패턴, 디자인 원칙, 실험 결과가 축적되어 있음
- `ohouse-design-site`에는 Copy Prompt 기능이 구현되어 있음 — 클릭 1번으로 화면 관련 프롬프트 복사
- 그러나 복사한 프롬프트를 **별도의 Claude 채팅**으로 가져가야 함 → 컨텍스트 단절, 결과물 품질 편차

### 해결하지 못한 페인
1. **비디자이너(PO, 리서처)가 1차 초안을 만들기까지 리소스 낭비**
   - ohouse 패턴을 Claude에 직접 먹이려면 매번 같은 컨텍스트 준비 필요
2. **분산된 화면 히스토리·정책을 알 수 없음**
   - 작업 중 "이 화면 관련 실험 있었나?" 를 찾아다녀야 함
3. **나 혼자 빠른 UT가 어려움**
   - 디자이너 없이 프로토타입을 만들어 고객반응 확인하는 흐름 부재

### 1-Pager 기준 우선순위
| 기능 | 우선순위 | 이번 범위 |
|---|---|---|
| 1차 프로토타입 제작 Playground | ⏫ 40% | **✅ Beta v1** |
| 디자인·지식 베이스 Agent Chat | 🔼 15% | ❌ v2 |

---

## 2. 목표와 성공 지표

### 목표 (Beta v1)
> "ohouse-design 안에서 자연어로 요청하면 ODS를 아는 prototype.html이 바로 나온다"

### 와우 모먼트 (1-pager 그대로)
- **"1차 작업물 제작까지 시간이 확연히 줄었어"** — 1차 prototype 생성: 60분 → **15분 이하**
- **"그만 찾아다녀도 돼서 좋다"** — ohouse 컨텍스트가 이미 탑재되어 있음
- **"나 혼자도 빠르게 UT가 가능해"** — 비디자이너도 초안 즉시 생성

### 측정 지표
| 지표 | 기준치 | 목표 |
|---|---|---|
| 1차 prototype 생성 소요 시간 | ~60분 (기존) | ≤ 15분 |
| 생성 prototype의 ODS 마커 정확도 | — | ≥ 80% |
| 베타 기간 weekly active users | 0 | ≥ 3명 |
| 세션당 평균 iteration 횟수 | — | ≥ 2회 (수정 시도 = 가치 인식) |

---

## 3. 사용자와 시나리오

### Primary: PD (Stella, Jenna, ...)
**시나리오**: 카테고리 화면 리뉴얼 아이디어 빠르게 검증
```
1. /playground 접속
2. "쇼핑 카테고리 화면에서 서브카테고리 탐색 방식을 개선하고 싶어"
3. Bot 질문 3개 → 요구사항 명확화
4. prototype.html 즉시 생성 → 오른쪽 preview
5. "서브카테고리를 칩 대신 가로 스크롤 그리드로 바꿔줘" → 수정
6. Copy HTML → Figma/notion에 붙여넣기
```

### Secondary: PO (팀장급, ...)
**시나리오**: UT 자료 24시간 안에 혼자 만들기
```
1. 간단한 PRD 초안 텍스트 붙여넣기 (컨텍스트 업로드)
2. Bot이 질문 1-2개로 gap 보완
3. A안 · B안 동시 생성 → 좌우 비교
4. HTML 다운로드 → UT 세션 진행
```

---

## 4. 기능 명세 (Beta v1 스코프)

### F1. 채팅 인터페이스 ✅ 필수
**목적**: 자연어로 요청하고 대화로 iterate

**동작**:
- 빈 채팅창 + 예시 프롬프트 3개 (온보딩)
- 사용자 입력 → AI 응답 (텍스트 또는 HTML 생성)
- 이전 대화 스크롤 가능
- 스트리밍 응답 (타이핑 효과)

**예시 프롬프트 (빈 화면 진입 시 노출)**:
- "장바구니 화면 빈 상태 prototype 만들어줘"
- "카테고리 홈에서 서브카테고리 탐색 방식 개선 아이디어 보여줘"
- "상품 상세 페이지에서 리뷰 섹션 variant 2개 만들어줘"

---

### F2. 의도 파악 질문 플로우 ✅ 필수
**목적**: PRD 없을 때 3-5개 질문으로 요구사항 명확화 (Superpower 방식)

**질문 항목** (상황에 따라 선택적):
1. **도메인**: "어떤 화면/도메인인가요?" (기존 25개 도메인 또는 신규)
2. **기능**: "어떤 기능을 추가/변경하고 싶으신가요?"
3. **플랫폼**: "모바일 앱 / 웹 / 둘 다?" (기본: 모바일)
4. **참고화면**: "기존 ohouse 화면 중 참고하고 싶은 것이 있나요?"
5. **제약**: "특별한 제약이나 고려사항이 있나요?"

**트리거 조건**:
- 요청이 명확하면 (도메인 + 기능 특정) → 바로 생성
- 모호하거나 신규 기능이면 → 질문 플로우 시작
- 사용자가 직접 "질문 없이 만들어줘" → 추론 기반 즉시 생성

---

### F3. Prototype 즉시 생성 + Preview ✅ 필수
**목적**: 생성된 prototype을 그 자리에서 확인

**Preview 패널**:
- 오른쪽 패널 — 390px 너비 iPhone 프레임 (category-default와 동일)
- iframe으로 생성된 HTML 렌더링
- 새 prototype 생성 시 자동 업데이트

**생성 결과물 품질 기준**:
- ODS CSS 변수 토큰 사용 (`--color-foreground`, `--color-background-weak` 등)
- `@ods-component:`, `@missing-ods:` 마커 포함
- `word-break: keep-all`, `letter-spacing: -0.3px` 한글 타이포
- 터치 타깃 min-height: 44px
- 접근성: aria-label, role, focus-visible

---

### F4. ohouse Context Bundle ✅ 핵심 차별점
**목적**: "내 Claude보다 ohouse를 더 잘 안다"는 신뢰 형성

**빌드 시점 추출 항목** (`scripts/build-context.mjs`):

| 항목 | 출처 | 토큰 예산 |
|---|---|---|
| 디자인 원칙 10개 | `knowledge/principles.md` | ~800 tokens |
| ODS 컴포넌트 목록 + 핵심 Props | `ods/content/components/*/meta.yaml` + spec.md 요약 | ~2,000 tokens |
| 디자인 토큰 (semantic) | `ods/content/foundations/semantic-tokens/tokens.yaml` | ~600 tokens |
| 팔레트 토큰 (핵심 컬러) | `ods/content/foundations/palette-tokens/tokens.yaml` (gray + red + genuineBlue) | ~400 tokens |
| CONVENTIONS 핵심 규칙 | `CONVENTIONS.md` (마커 규칙, 금지사항) | ~300 tokens |
| 기존 prototype 패턴 (최대 3개) | `domains/*/screens/*/prototype.html` (CSS vars + 구조) | ~1,500 tokens |
| **총계** | | **~5,600 tokens** |

**런타임에 추가되는 컨텍스트**:
- 사용자가 붙여넣은 PRD/기획 텍스트
- 대화 히스토리 (최근 5턴)

---

### F5. 산출물 액션 ✅ 필수
| 액션 | 동작 | 우선순위 |
|---|---|---|
| **HTML 복사** | `navigator.clipboard.writeText(html)` + 토스트 | Beta v1 |
| **Download** | `prototype.html`로 파일 다운로드 | Beta v1 |
| **도메인 폴더에 저장** | MCP 연결 필요 → `domains/<d>/screens/<s>/prototype.html` 생성 | v2 |

---

### F6. 컨텍스트 붙여넣기 ✅ 포함
**목적**: PRD 초안, Notion 내용, 기획 메모를 가져와서 컨텍스트로 활용

**UI**: 채팅창 위 "컨텍스트 추가" 접기/펼치기 영역
- textarea: 자유 텍스트 붙여넣기
- 문자 제한: 5,000자
- "컨텍스트 초기화" 버튼

---

### F7. A/B Variant 비교 ✅ 심화 포함
**목적**: "A안B안 둘 다 만들어줘" 빠른 비교

**동작**:
- 사용자 요청: "A안 B안 비교해줘" / "2가지 변형 만들어줘"
- Preview 패널: 탭 전환 (A | B | C)
- localStorage에 세션 variant 저장 (브라우저 새로고침 후 복원)

---

## 5. 아키텍처

### 시스템 구조
```
ohouse-design-site/
├── src/
│   ├── pages/
│   │   ├── playground.astro          ← 신규: Playground 페이지
│   │   └── api/
│   │       └── playground.ts         ← 신규: Claude API 서버 엔드포인트
│   ├── components/
│   │   ├── PlaygroundChat.jsx        ← 신규: 채팅 UI (React)
│   │   ├── PlaygroundPreview.jsx     ← 신규: iframe 프리뷰 (React)
│   │   └── PlaygroundContext.jsx     ← 신규: 컨텍스트 붙여넣기 패널
│   └── lib/
│       └── playground-context.js     ← 신규: context bundle 읽기 + 시스템 프롬프트 조합
└── scripts/
    └── build-context.mjs             ← 신규: 빌드 시점 context bundle 추출

ohouse-design-mcp/
└── (기존 그대로 — SSOT)

docs/superpowers/specs/
└── 2026-05-30-proto-playground-design.md  ← 이 파일
```

### 데이터 흐름
```
[빌드 시점]
ohouse-design-mcp/ → build-context.mjs → playground-context.json (public/)

[런타임 — 사용자 요청]
User 입력
  → PlaygroundChat (React)
  → POST /api/playground
    → playground-context.js (context bundle 로드)
    → Anthropic SDK (Claude API 호출)
    → 스트리밍 응답
  → PlaygroundChat (스트리밍 렌더)
  → HTML 감지 시 PlaygroundPreview (iframe 업데이트)
```

### API 엔드포인트 설계 (`/api/playground`)
```typescript
POST /api/playground
Body: {
  messages: Message[],  // 대화 히스토리
  userContext?: string, // 붙여넣은 PRD/기획 텍스트
  mode: 'chat' | 'generate' | 'refine'
}
Response: ReadableStream (SSE)  // 스트리밍 텍스트
```

### 환경 변수
```
ANTHROPIC_API_KEY=sk-ant-...   # 서버사이드만
MODEL=claude-sonnet-4-6        # default
MAX_TOKENS=8192
```

---

## 6. UI 레이아웃

```
/playground
┌──────────────────────────────────────────────────────────┐
│ [🅞] Ohouse Design    Design|ODS   Playground  ⌕  🔖 Git │ 헤더 (기존)
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐  ┌──────────────────────────┐  │
│  │ CHAT                │  │ PREVIEW           [A][B]  │  │
│  │                     │  │                           │  │
│  │ [컨텍스트 추가 ▼]   │  │  ┌─────────────────────┐  │  │
│  │                     │  │  │                     │  │  │
│  │ ──────────────────  │  │  │   390px iPhone      │  │  │
│  │                     │  │  │   prototype frame   │  │  │
│  │ [예시 프롬프트 칩]  │  │  │                     │  │  │
│  │                     │  │  │                     │  │  │
│  │ ──────────────────  │  │  │                     │  │  │
│  │ [입력창            ]│  │  └─────────────────────┘  │  │
│  │            [→ 전송]  │  │                           │  │
│  │                     │  │  [📋 Copy HTML] [⬇ 저장]  │  │
│  └─────────────────────┘  └──────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

**반응형**: 모바일(< 768px)에서는 채팅 → preview 탭 전환

---

## 7. 시스템 프롬프트 구조

```
당신은 오늘의집(Ohouse) 디자인 시스템 전문 프로토타입 생성 AI입니다.

## 역할
- 자연어 요청을 받아 ohouse 디자인 패턴에 맞는 prototype.html을 생성합니다.
- 요청이 모호하면 3-5개 질문으로 의도를 명확히 합니다.
- 생성된 prototype은 반드시 ohouse의 디자인 원칙과 ODS 규칙을 따릅니다.

## 오늘의집 디자인 원칙 (요약)
[principles.md에서 추출된 10개 원칙]

## 사용 가능한 ODS 컴포넌트
[ods/content/components/*/meta.yaml에서 추출된 컴포넌트 목록]
- Chip (variant: solid|normal|outlined|subtle, size: sm|md)
- ProductCard (서브컴포넌트: product-card-price, -review, -delivery-info, -scrap, -sold-out-banner, -benefit, -product-title)
- Section (서브: section-header, section-title, section-action, section-arrow-button)
- BoxButton (variant: primary|secondary|ghost, size: sm|md|lg)
- ...

## 디자인 토큰 (CSS 변수 — 반드시 사용)
[semantic-tokens에서 추출]
--color-foreground, --color-foreground-weak, --color-foreground-brand,
--color-foreground-critical, --color-background, --color-background-weak,
--color-background-brand, --color-border, --color-border-thumbnail ...

## 팔레트 토큰 (CSS 변수 정의용)
gray.950: #0a0a0a | gray.500: #737373 | gray.50: #f5f5f5
genuineBlue.400: #0497ef | red.400: #fd3d4a | ...

## 코드 컨벤션
- @ods-component:<name> 마커 필수
- @missing-ods:<설명> — ODS에 없는 컴포넌트
- word-break: keep-all (한글 줄바꿈)
- letter-spacing: -0.3px
- 터치 타깃 최소 44px
- hex 하드코딩 금지 (CSS 변수만 사용)
- 금지: padding: 13px → 4pt grid 스케일 사용

## 기존 패턴 예시
[category-default/prototype.html의 핵심 구조 발췌]
```

---

## 8. 구현 계획 (Sprint)

> **전제**: `proto-beta-v.1` 브랜치에서 진행. git 명령어 사용 가능 시 commit/PR.

### Sprint 1 (D1~D2): 뼈대 + 컨텍스트 엔진
**목표**: API가 Claude를 호출하고 응답을 돌려주는 것까지

| Task | 파일 | 설명 |
|---|---|---|
| T1 | `scripts/build-context.mjs` | ohouse-design-mcp 읽어 `public/playground-context.json` 생성 |
| T2 | `src/lib/playground-context.js` | context.json 로드 + 시스템 프롬프트 조합 함수 |
| T3 | `src/pages/api/playground.ts` | POST 엔드포인트 — Claude API 스트리밍 호출 |
| T4 | `astro.config.mjs` 수정 | output: 'hybrid' 추가 (서버 엔드포인트 지원) |
| T5 | `package.json` 수정 | `@anthropic-ai/sdk` 의존성 추가 |

**Sprint 1 완료 기준**: `curl -X POST /api/playground -d '{"messages":[{"role":"user","content":"카테고리 화면 만들어줘"}]}'` → Claude 스트리밍 응답 확인

---

### Sprint 2 (D3~D4): 채팅 UI + Preview
**목표**: 브라우저에서 채팅하고 prototype preview가 나오는 것까지

| Task | 파일 | 설명 |
|---|---|---|
| T6 | `src/components/PlaygroundChat.jsx` | 채팅 UI — 입력창, 메시지 목록, 스트리밍 렌더 |
| T7 | `src/components/PlaygroundPreview.jsx` | iframe 프리뷰 + 390px 폰 프레임 |
| T8 | `src/components/PlaygroundContext.jsx` | 컨텍스트 붙여넣기 패널 (접기/펼치기) |
| T9 | `src/pages/playground.astro` | 2패널 레이아웃 + 컴포넌트 조합 |
| T10 | `src/styles/playground.css` | 플레이그라운드 전용 스타일 (ODS 토큰 기반) |

**Sprint 2 완료 기준**: 브라우저에서 "카테고리 화면 만들어줘" → prototype HTML이 오른쪽 iframe에 렌더링

---

### Sprint 3 (D5): 질문 플로우 + A/B + 액션
**목표**: 의도 파악 질문 + A/B 비교 + 복사/다운로드

| Task | 파일 | 설명 |
|---|---|---|
| T11 | 시스템 프롬프트 개선 | 질문 플로우 트리거 로직 (모호할 때 질문, 명확할 때 즉시 생성) |
| T12 | PlaygroundPreview 탭 | A / B / C 탭 전환 + localStorage 저장 |
| T13 | Copy/Download 버튼 | HTML 복사 + `prototype.html` 파일 다운로드 |
| T14 | 예시 프롬프트 칩 | 빈 화면에 3개 예시 칩 노출 → 클릭 시 자동 입력 |

**Sprint 3 완료 기준**: 
- 모호한 요청 → 질문 3개 → prototype 생성
- A/B 탭에 각각 다른 variant prototype 표시
- Copy HTML 버튼 클릭 → 클립보드 복사 + 토스트

---

### Sprint 4 (D6): 검증 + 폴리시
**목표**: 5개 시나리오 모두 동작, 베타 배포 가능 상태

| Task | 내용 |
|---|---|
| 시나리오 검증 | § 3의 PD/PO 시나리오 실제 실행 → 각 15분 이내 달성 여부 |
| 토큰 예산 검증 | 세션당 평균 토큰 측정 → 비용 추정 (월 3 user × 10 session/week × 4주 = 120 sessions) |
| 에러 처리 | API 실패 / 타임아웃 / 빈 응답 fallback |
| 네비게이션 통합 | 헤더에 "Playground" 링크 추가 |
| 환경변수 문서화 | `.env.example` 업데이트 |

---

## 9. 스코프 경계 (Beta v1 명시적 제외)

| 항목 | 이유 | 목표 버전 |
|---|---|---|
| MCP 연동 (도메인 폴더 직접 저장) | MCP 연결 불가 | v2 |
| 파일 업로드 (PDF/이미지) | 복잡도 증가 | v2 |
| Figma Export/Sync | Figma API 연결 필요 | v3 |
| 멀티유저/공유 URL | 백엔드 DB 필요 | v2 |
| Agent Chat (지식베이스 질답) | 15% 우선순위 기능 | v2 |
| prototype.tsx (React) | HTML로 검증 먼저 | v2 |
| 검색 (도메인/컴포넌트 탐색) | Pagefind 별도 작업 | v2 |

---

## 10. 열린 질문 (결정 필요)

| # | 질문 | 옵션 | 추천 |
|---|---|---|---|
| Q1 | Claude API Key 관리 | 팀 공용 Key / 개인 Key 입력 | 개인 Key 입력 (베타 기간 보안·비용 제어) |
| Q2 | Astro rendering mode | static + server endpoint / full SSR | hybrid (기존 static 유지, endpoint만 server) |
| Q3 | 사용 모델 | claude-sonnet-4-6 (현재) / claude-opus-4-7 | sonnet-4-6 (속도·비용 균형) |
| Q4 | context bundle 업데이트 주기 | 빌드시마다 / 주기적 cron | 빌드시마다 (Astro 빌드 훅) |
| Q5 | 베타 접근 제어 | 무인증 / API Key 입력 화면으로 대체 | Q1과 연동 — API Key 입력이면 무인증 가능 |

---

## 11. 참고 자료

- [1-pager 원문](../../../../Desktop/Ohouse%20Design/proto%20demo/개인%20페이지%20%26%20공유된%20페이지/%5B%20W1%20%5D%201-pager%2036fa597878a0808aa85cc89674ab3bd2.md)
- `ohouse-design-mcp/CLAUDE.md` — LLM 로딩 규칙 (context bundle 구성에 활용)
- `ohouse-design-site/PLAN.md` — 사이트 계획서 (§ 14 "사이트 안 Claude Code 입력창" = 이 기능의 원형)
- `ohouse-design-mcp/knowledge/principles.md` — 디자인 원칙
- `ohouse-design-mcp/domains/category/screens/category-default/prototype.html` — 기존 prototype 레퍼런스
