# Playground Variant Targeting 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 유저가 "B안에 필터칩 추가해줘"처럼 특정 안을 언급하면, 해당 안만 정확히 수정하고 나머지 안은 보존한다.

**Architecture:** `parseIntent` 순수 함수가 메시지에서 타겟 안 ID · 소스 ID · 인텐트 타입을 추출한다. `PlaygroundRoot`가 `variants` 배열을 단일 진실의 원천으로 관리하고, 타겟 슬롯만 머지(merge)한다. 메시지 전송 즉시 낙관적 탭 전환으로 UX 투명성을 확보한다.

**Tech Stack:** React 18, Astro 5, TypeScript (API), Vitest (parseIntent 유닛 테스트)

**작업 디렉토리:** `ohouse-design-site/`

---

## 변경 파일 맵

| 파일 | 역할 |
|---|---|
| `src/lib/parse-intent.js` (신규) | 메시지 → 인텐트 파싱 순수 함수 |
| `src/lib/__tests__/parse-intent.test.js` (신규) | parseIntent 유닛 테스트 |
| `package.json` | vitest dev dep + test 스크립트 추가 |
| `src/components/PlaygroundRoot.jsx` | allVariants 단일 상태, 머지 핸들러, 탭 전환 콜백 |
| `src/components/PlaygroundPreview.jsx` | `activeVariantId` prop 추가, variantItems effect에서 setActiveIdx(0) 제거 |
| `src/components/PlaygroundChat.jsx` | parseIntent 통합, props 교체, API 요청 로직 수정 |
| `src/pages/api/playground.ts` | `intentType` 추가, `buildRefineContext` 분기 |
| `src/lib/playground-context.js` | 시스템 프롬프트 Refine 모드 규칙 추가 |

---

## Task 1: parseIntent 유틸 함수 (TDD)

**Files:**
- Create: `src/lib/parse-intent.js`
- Create: `src/lib/__tests__/parse-intent.test.js`
- Modify: `package.json`

- [ ] **Step 1: vitest 설치**

```bash
cd ohouse-design-site
npm install -D vitest
```

Expected: `node_modules/vitest` 생성, package.json devDependencies에 vitest 추가됨

- [ ] **Step 2: package.json에 test 스크립트 추가**

`package.json`의 `scripts` 블록에 아래 한 줄 추가:
```json
"test": "vitest run src/lib/__tests__"
```

- [ ] **Step 3: 테스트 파일 작성 (실패 상태로)**

`src/lib/__tests__/parse-intent.test.js` 생성:

```javascript
import { describe, it, expect } from 'vitest';
import { parseIntent } from '../parse-intent.js';

const variants = [
  { id: 'A', html: '<html>A</html>' },
  { id: 'B', html: '<html>B</html>' },
  { id: 'C', html: null },
];

describe('parseIntent', () => {
  it('B안 명시 + B안 html 있음 → refine', () => {
    expect(parseIntent('B안에 필터칩 추가해줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: null, intentType: 'refine',
    });
  });

  it('C안 명시 + C안 html 없음 → create_new', () => {
    expect(parseIntent('C안도 만들어줘', variants, 'A')).toEqual({
      targetId: 'C', sourceId: null, intentType: 'create_new',
    });
  });

  it('A안 기반으로 B안 → create_derived', () => {
    expect(parseIntent('A안 기반으로 B안 만들어줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: 'A', intentType: 'create_derived',
    });
  });

  it('안 언급 없음 → activeVariantId 폴백, refine', () => {
    expect(parseIntent('필터칩 추가해줘', variants, 'A')).toEqual({
      targetId: 'A', sourceId: null, intentType: 'refine',
    });
  });

  it('소문자 b안 → 대문자 B 정규화', () => {
    expect(parseIntent('b안 수정해줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: null, intentType: 'refine',
    });
  });

  it('A안 바탕으로 B안 → create_derived (바탕 키워드)', () => {
    expect(parseIntent('A안 바탕으로 B안 제작해줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: 'A', intentType: 'create_derived',
    });
  });
});
```

- [ ] **Step 4: 테스트 실행 → 실패 확인**

```bash
npm test
```

Expected: `Error: Cannot find module '../parse-intent.js'`

- [ ] **Step 5: parseIntent 구현**

`src/lib/parse-intent.js` 생성:

```javascript
/**
 * 유저 메시지에서 수정 의도와 대상 안을 파싱한다.
 * @param {string} message - 유저 입력 메시지
 * @param {Array<{id: string, html: string|null}>} variants - 현재 variants 배열
 * @param {string|null} activeVariantId - 현재 활성 탭 ID (언급 없을 때 폴백)
 * @returns {{ targetId: string|null, sourceId: string|null, intentType: 'refine'|'create_new'|'create_derived' }}
 */
export function parseIntent(message, variants, activeVariantId) {
  const targetMatch = message.match(/([A-Ca-c])안/);
  const targetId = targetMatch ? targetMatch[1].toUpperCase() : (activeVariantId ?? null);

  // "A안 기반으로", "A안 베이스로", "A안 바탕으로", "A안 참고해서"
  const sourceMatch = message.match(/([A-Ca-c])안\s*(?:기반|베이스|참고|바탕)/);
  const sourceId = sourceMatch ? sourceMatch[1].toUpperCase() : null;

  const isDerive = Boolean(sourceId) && sourceId !== targetId;
  const targetVariant = targetId ? variants.find((v) => v.id === targetId) : null;
  const targetHasHtml = Boolean(targetVariant?.html);

  const intentType = isDerive
    ? 'create_derived'
    : targetHasHtml
      ? 'refine'
      : 'create_new';

  return { targetId, sourceId, intentType };
}
```

- [ ] **Step 6: 테스트 실행 → 통과 확인**

```bash
npm test
```

Expected: `6 passed`

- [ ] **Step 7: 커밋**

```bash
git add src/lib/parse-intent.js src/lib/__tests__/parse-intent.test.js package.json package-lock.json
git commit -m "feat: add parseIntent utility with vitest tests"
```

---

## Task 2: PlaygroundRoot — allVariants 단일 상태 통합

**Files:**
- Modify: `src/components/PlaygroundRoot.jsx`

- [ ] **Step 1: 파일 상단 상수 추가 + 상태 교체**

현재 `PlaygroundRoot.jsx`의 상태 선언 전체를 아래로 교체:

```javascript
const VARIANT_LABELS = ['A', 'B', 'C'];

export default function PlaygroundRoot({ hasServerKey }) {
  const [variants, setVariants] = useState([{ id: 'A', html: null, label: 'A' }]);
  const [activeVariantId, setActiveVariantId] = useState('A');
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewStatusMessage, setPreviewStatusMessage] = useState('');
  const [previewError, setPreviewError] = useState(null);
```

(기존 `generatedHtml`, `generatedHtmls`, `generatedVariants`, `currentHtml`, `currentVariantId` 5개 state 모두 제거)

- [ ] **Step 2: handleHtmlGenerated 교체**

기존 `handleHtmlGenerated` 전체를 아래로 교체:

```javascript
const handleHtmlGenerated = useCallback((html, _htmls, variantItems, targetVariantId) => {
  setPreviewError(null);
  if (variantItems?.length) {
    setVariants(variantItems.map((v, i) => ({
      id: v.id ?? VARIANT_LABELS[i] ?? String(i + 1),
      html: v.html,
      label: v.id ?? v.label ?? VARIANT_LABELS[i] ?? String(i + 1),
      summary: v.summary,
    })));
    setActiveVariantId(variantItems[0]?.id ?? 'A');
  } else if (html && targetVariantId) {
    setVariants((prev) => prev.map((v) => v.id === targetVariantId ? { ...v, html } : v));
  } else if (html) {
    setVariants((prev) => prev.map((v) => v.id === activeVariantId ? { ...v, html } : v));
  }
}, [activeVariantId]);
```

- [ ] **Step 3: handleOptimisticTabSwitch 추가**

`handlePreviewStatus` 아래에 추가:

```javascript
const handleOptimisticTabSwitch = useCallback((targetId) => {
  setActiveVariantId(targetId);
}, []);
```

- [ ] **Step 4: handleActiveVariantChange 단순화**

기존 `handleActiveVariantChange` 전체를 아래로 교체:

```javascript
const handleActiveVariantChange = useCallback((variant) => {
  if (!variant) return;
  setActiveVariantId(variant.id ?? variant.label ?? 'A');
}, []);
```

- [ ] **Step 5: JSX return 교체**

`return` 블록 전체를 아래로 교체:

```jsx
return (
  <div className="pg">
    <PlaygroundChat
      onHtmlGenerated={handleHtmlGenerated}
      onPreviewStatus={handlePreviewStatus}
      onPreviewError={handlePreviewError}
      variants={variants}
      activeVariantId={activeVariantId}
      onOptimisticTabSwitch={handleOptimisticTabSwitch}
      hasServerKey={hasServerKey}
    />
    <PlaygroundPreview
      variantItems={variants}
      activeVariantId={activeVariantId}
      status={previewStatus}
      statusMessage={previewStatusMessage}
      error={previewError}
      onActiveVariantChange={handleActiveVariantChange}
    />
  </div>
);
```

- [ ] **Step 6: 커밋**

```bash
git add src/components/PlaygroundRoot.jsx
git commit -m "refactor(root): unify variant state, add merge handler and optimistic tab switch"
```

---

## Task 3: PlaygroundPreview — activeVariantId prop 추가

**Files:**
- Modify: `src/components/PlaygroundPreview.jsx`

- [ ] **Step 1: props에 activeVariantId 추가**

`export default function PlaygroundPreview({` 블록을 아래로 교체:

```javascript
export default function PlaygroundPreview({
  html,
  htmls,
  variantItems,
  activeVariantId,
  status = 'idle',
  statusMessage = '',
  error = null,
  onActiveVariantChange,
}) {
```

- [ ] **Step 2: variantItems effect에서 setActiveIdx(0) 제거**

현재 코드 (약 299~308번 줄):
```javascript
useEffect(() => {
  if (!variantItems?.length) return;
  setVariants(variantItems.map((variant, i) => ({
    id: variant.id ?? VARIANT_LABELS[i] ?? String(i+1),
    html: variant.html,
    label: variant.id ?? variant.label ?? VARIANT_LABELS[i] ?? String(i+1),
    summary: variant.summary,
  })));
  setActiveIdx(0);  // ← 이 줄만 제거
}, [variantItems]);
```

`setActiveIdx(0);` 한 줄을 삭제해 아래처럼 만든다:

```javascript
useEffect(() => {
  if (!variantItems?.length) return;
  setVariants(variantItems.map((variant, i) => ({
    id: variant.id ?? VARIANT_LABELS[i] ?? String(i+1),
    html: variant.html,
    label: variant.id ?? variant.label ?? VARIANT_LABELS[i] ?? String(i+1),
    summary: variant.summary,
  })));
}, [variantItems]);
```

- [ ] **Step 3: activeVariantId 동기화 effect 추가**

위 `variantItems` effect 바로 아래에 추가:

```javascript
useEffect(() => {
  if (!activeVariantId) return;
  const idx = variants.findIndex((v) => v.id === activeVariantId);
  if (idx >= 0 && idx !== activeIdx) setActiveIdx(idx);
}, [activeVariantId, variants]);
```

- [ ] **Step 4: dev 서버 기동 후 기존 동작 확인**

```bash
npm run dev
```

브라우저에서 `/playground` 접속 → 최초 생성 요청 → A안 탭 표시 확인

- [ ] **Step 5: 커밋**

```bash
git add src/components/PlaygroundPreview.jsx
git commit -m "feat(preview): add activeVariantId prop for controlled tab switching"
```

---

## Task 4: PlaygroundChat — parseIntent 통합 + 낙관적 탭 전환

**Files:**
- Modify: `src/components/PlaygroundChat.jsx`

- [ ] **Step 1: parseIntent import 추가**

파일 최상단 import 목록에 추가:

```javascript
import { parseIntent } from '../lib/parse-intent.js';
```

- [ ] **Step 2: props 교체**

`export default function PlaygroundChat({` 블록을 아래로 교체:

```javascript
export default function PlaygroundChat({
  onHtmlGenerated,
  onPreviewStatus,
  onPreviewError,
  variants,
  activeVariantId,
  onOptimisticTabSwitch,
  apiKey: propApiKey,
  hasServerKey,
}) {
```

(기존 `currentHtml`, `currentVariantId` props 제거)

- [ ] **Step 3: sendMessage 내부 로직 교체 (두 군데)**

**[3-A] `const shouldRefine = ...` 한 줄**을 아래 블록으로 교체 (`try` 블록 바깥, `const newUserMsg` 바로 위):

```javascript
  const { targetId, sourceId, intentType } = parseIntent(userText, variants, activeVariantId);
  const hasExistingVariants = variants.some((v) => v.html);
  const mode = hasExistingVariants ? 'refine' : 'generate';

  if (mode === 'refine' && targetId) {
    onOptimisticTabSwitch?.(targetId);
    onPreviewStatus?.('generating', `${targetId}안을 수정하고 있어요.`);
  }

  const targetVariant = targetId ? variants.find((v) => v.id === targetId) : null;
  const sourceVariant = sourceId ? variants.find((v) => v.id === sourceId) : null;
  const sourceHtml = intentType === 'create_derived'
    ? (sourceVariant?.html ?? null)
    : (targetVariant?.html ?? null);
```

**[3-B] `try` 블록 안의 `body: JSON.stringify({...})` 부분**을 아래로 교체:

```javascript
        body: JSON.stringify({
          messages: history
            .filter(({ role }) => role === 'user' || role === 'assistant')
            .map(({ role, content }) => ({ role, content })),
          userContext: buildUserContext(),
          mode,
          targetVariantId: mode === 'refine' ? targetId : undefined,
          intentType: mode === 'refine' ? intentType : undefined,
          currentHtml: sourceHtml ?? undefined,
        }),
```

- [ ] **Step 4: handleEvent의 prototype_done 분기 교체**

`handleEvent` 함수 내 `} else if (evt.type === 'prototype_done') {` 블록을 아래로 교체:

```javascript
        } else if (evt.type === 'prototype_done') {
          if (evt.variants?.length) {
            if (mode === 'refine' && targetId) {
              const match = evt.variants.find((v) => v.id === targetId) ?? evt.variants[0];
              onHtmlGenerated?.(match.html, null, null, targetId);
            } else {
              onHtmlGenerated?.(null, null, evt.variants, null);
            }
          } else if (evt.html) {
            onHtmlGenerated?.(evt.html, null, null, targetId ?? activeVariantId);
          }
```

- [ ] **Step 5: useCallback 의존성 배열 업데이트**

`sendMessage`의 `useCallback` 의존성 배열을 아래로 교체:

```javascript
  }, [
    messages,
    streaming,
    contextItems,
    variants,
    activeVariantId,
    onOptimisticTabSwitch,
    effectiveApiKey,
    hasServerKey,
    onHtmlGenerated,
    onPreviewStatus,
    onPreviewError,
  ]);
```

- [ ] **Step 6: 커밋**

```bash
git add src/components/PlaygroundChat.jsx
git commit -m "feat(chat): integrate parseIntent with optimistic tab switch and merge API request"
```

---

## Task 5: API — intentType 처리 + 시스템 프롬프트 Refine 규칙

**Files:**
- Modify: `src/pages/api/playground.ts`
- Modify: `src/lib/playground-context.js`

- [ ] **Step 1: PlaygroundRequest 인터페이스에 intentType 추가**

`playground.ts`의 `PlaygroundRequest` 인터페이스를 아래로 교체:

```typescript
export interface PlaygroundRequest {
  messages: PlaygroundMessage[];
  userContext?: string;
  mode?: 'generate' | 'refine';
  targetVariantId?: 'A' | 'B' | 'C';
  currentHtml?: string;
  intentType?: 'refine' | 'create_new' | 'create_derived';
}
```

- [ ] **Step 2: buildRefineContext 수정**

기존 `buildRefineContext` 함수 전체를 아래로 교체:

```typescript
function buildRefineContext(body: PlaygroundRequest): PlaygroundMessage[] {
  if (body.mode !== 'refine' || !body.currentHtml?.trim()) return body.messages;
  const target = body.targetVariantId ? `${body.targetVariantId}안` : '현재 prototype';

  const prefix = body.intentType === 'create_derived'
    ? `참고 소스: 아래 HTML을 베이스로 ${target}을 새로 제작하세요. 사용자의 최신 요청을 반영한 완전한 HTML 문서를 생성하세요.`
    : `수정 대상: ${target}. 아래 HTML에 사용자의 최신 요청을 반영해 수정하세요. 부분 코드나 diff가 아닌 완전한 HTML 문서만 생성해야 합니다.`;

  const refineContext = [
    prefix,
    '```html',
    body.currentHtml.trim(),
    '```',
  ].join('\n');

  const refineMessage: PlaygroundMessage = { role: 'user', content: refineContext };
  return [refineMessage, ...body.messages];
}
```

- [ ] **Step 3: playground-context.js 시스템 프롬프트에 규칙 추가**

`buildSystemPrompt` return 문 안에서 `## 절대 금지` 섹션의 마지막 항목(`- 매직 픽셀 ...`) 바로 다음 줄, `---` 구분선 직전에 아래를 삽입한다.

찾을 문자열:
```
- 매직 픽셀 (4pt 그리드 스케일 벗어나는 임의 수치)

---
```

교체할 문자열:
```
- 매직 픽셀 (4pt 그리드 스케일 벗어나는 임의 수치)

## Refine 모드 응답 규칙 (엄수)
수정 대상이 명시된 경우(수정 대상: X안), 반드시 해당 안의 HTML **하나만** 반환합니다.
다른 안(A/B/C)을 함께 생성하거나 ### A안: 형식의 다중 변형 응답은 금지입니다.
단일 \\\`\\\`\\\`html ... \\\`\\\`\\\` 블록으로만 응답하세요.

---
```

- [ ] **Step 4: 커밋**

```bash
git add src/pages/api/playground.ts src/lib/playground-context.js
git commit -m "feat(api): add intentType to request, fix buildRefineContext branching, add refine-mode prompt rule"
```

---

## Task 6: 수동 통합 테스트

- [ ] **Step 1: dev 서버 기동**

```bash
npm run dev
```

브라우저에서 `http://localhost:4321/playground` 접속

- [ ] **Step 2: Case 1 — 기존 안 수정**

1. "A안·B안 두 가지 장바구니 화면 만들어줘" 전송 → A·B안 생성 확인
2. A안 탭 클릭해 활성화
3. "B안에 빈 장바구니 일러스트 추가해줘" 전송
4. 확인: B안 탭으로 자동 전환되고, 로딩 중 "B안을 수정하고 있어요" 노출
5. 확인: B안 HTML만 업데이트, A안 탭 클릭하면 이전 A안 그대로

- [ ] **Step 3: Case 2 — 빈 슬롯 신규 생성**

1. 단일 안 생성 후 C안 슬롯이 비어있는 상태에서
2. "C안도 만들어줘, 다크 테마로" 전송
3. 확인: C안 탭으로 전환, C안 신규 생성, A·B안 보존

- [ ] **Step 4: Case 3 — 파생 생성**

1. A·B안 있는 상태에서
2. "A안 기반으로 B안에 필터칩 추가한 버전 만들어줘" 전송
3. 확인: B안 탭 전환, A안 HTML 소스로 B안 생성

- [ ] **Step 5: 최종 커밋 & 요약**

모든 케이스 통과 확인 후:

```bash
git add -A
git status  # 잔여 변경 없음 확인
```
