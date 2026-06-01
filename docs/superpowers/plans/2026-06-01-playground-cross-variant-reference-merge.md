# Playground Cross-Variant Reference Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** "B안 기반으로 A안에 구매 유도 배너를 추가"처럼 source variant를 참고하되 target variant의 기존 UI를 보존해야 하는 요청에서 target만 안전하게 수정한다.

**Architecture:** 기존 `create_derived` 하나로 처리하던 cross-variant 요청을 `create_derived`와 `refine_with_reference`로 분리한다. `refine_with_reference`는 source HTML에 사용자가 언급한 요소가 실제로 존재할 가능성이 높을 때만 선택하고, target HTML을 수정 베이스로, source HTML을 참고 자료로 API에 함께 전달한다. 테스트는 intent 분류, API request 빌드, target-only merge 보존을 순수 함수 단위로 먼저 고정한다.

**Tech Stack:** React 18, Astro 5, TypeScript API, Vitest

---

## Root Cause Summary

현재 문제 문장:

```text
B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘
```

현재 `parseIntent` 결과:

```json
{
  "targetId": "A",
  "sourceId": "B",
  "intentType": "create_derived"
}
```

이후 `PlaygroundChat.jsx`가 `create_derived`일 때 `sourceVariant.html`을 `currentHtml`로 전송한다. `playground.ts`의 `buildRefineContext`는 이 HTML을 "베이스로 A안을 새로 제작"하라고 지시한다. 따라서 A안의 기존 HTML은 모델 컨텍스트에 들어가지 않고, B 기반 전체 HTML이 A 슬롯에 저장된다.

보완 원칙:

1. target 슬롯 선택과 source 슬롯 선택은 현재처럼 유지한다.
2. source가 "전체 베이스"인지 "참고/이식 재료"인지 별도 intent로 분리한다.
3. `A안 기반으로 B안에 카테고리 필터칩 추가`처럼 source에 해당 요소가 없으면 기존 Case 3의 `create_derived` 동작을 유지한다.
4. `B안 기반으로 A안에 구매 유도 배너 추가`처럼 source에 해당 요소가 있으면 target 보존형 `refine_with_reference`로 처리한다.
5. target 보존형 요청에서는 target HTML을 반드시 수정 베이스로 전달한다.
6. source HTML은 reference로만 전달하고, prompt에서 "target 기존 구조 보존"을 명시한다.
7. target 외 variant는 응답 형태와 무관하게 절대 덮어쓰지 않는 회귀 테스트를 둔다.

## File Map

| File | Responsibility |
|---|---|
| `ohouse-design-site/src/lib/parse-intent.js` | `refine_with_reference` intent 추가 및 cross-variant 문장 분류 |
| `ohouse-design-site/src/lib/__tests__/parse-intent.test.js` | 문제 문장과 기존 Case 1-3 회귀 테스트 |
| `ohouse-design-site/src/lib/playground-request.js` | Chat API payload 빌드 순수 함수 신규 추가 |
| `ohouse-design-site/src/lib/__tests__/playground-request.test.js` | target/source HTML 선택 규칙 테스트 |
| `ohouse-design-site/src/lib/variant-merge.js` | target-only merge 순수 함수 신규 추가 |
| `ohouse-design-site/src/lib/__tests__/variant-merge.test.js` | non-target variant 보존 테스트 |
| `ohouse-design-site/src/components/PlaygroundChat.jsx` | request payload 빌드 로직을 순수 함수로 위임 |
| `ohouse-design-site/src/components/PlaygroundRoot.jsx` | target-only merge helper 사용 |
| `ohouse-design-site/src/pages/api/playground.ts` | `referenceHtml`, `sourceVariantId`, `intentType` 계약 확장 |

## Task 1: Lock the Reproduction in Intent Tests

**Files:**
- Modify: `ohouse-design-site/src/lib/__tests__/parse-intent.test.js`
- Modify: `ohouse-design-site/src/lib/parse-intent.js`

- [ ] **Step 1: Add failing tests for reference merge vs derived generation**

Append these tests inside the existing `describe('parseIntent', () => { ... })` block:

```javascript
  it('B안 기반으로 A안에 source에 존재하는 구매 유도 배너 추가 → refine_with_reference', () => {
    const variantsWithBanner = [
      { id: 'A', html: '<html><body><main>A existing UI</main></body></html>' },
      { id: 'B', html: '<html><body><section class="purchase-banner">첫 구매 혜택 CTA</section><main>B UI</main></body></html>' },
      { id: 'C', html: null },
    ];

    expect(parseIntent('B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘', variantsWithBanner, 'A')).toEqual({
      targetId: 'A',
      sourceId: 'B',
      intentType: 'refine_with_reference',
    });
  });

  it('A안 기반으로 B안에 source에 없는 신규 요소 추가 → create_derived 유지', () => {
    expect(parseIntent('A안 기반으로 B안에 카테고리 필터칩을 상단에 추가한 버전 만들어줘', variants, 'A')).toEqual({
      targetId: 'B',
      sourceId: 'A',
      intentType: 'create_derived',
    });
  });

  it('B안 기반으로 A안에 추가 요청이지만 source feature 근거가 없으면 create_derived 유지', () => {
    expect(parseIntent('B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘', variants, 'A')).toEqual({
      targetId: 'A',
      sourceId: 'B',
      intentType: 'create_derived',
    });
  });

  it('A안 기반으로 B안 새 버전 제작 → create_derived 유지', () => {
    expect(parseIntent('A안 기반으로 B안을 새로 재구성해줘', variants, 'A')).toEqual({
      targetId: 'B',
      sourceId: 'A',
      intentType: 'create_derived',
    });
  });
```

- [ ] **Step 2: Run the tests and verify the first new test fails**

Run:

```bash
cd ohouse-design-site
npm test
```

Expected: the new "B안 기반으로 A안에..." test fails because current code returns `create_derived`.

- [ ] **Step 3: Extend the JSDoc return type**

In `src/lib/parse-intent.js`, replace the return type line with:

```javascript
 * @returns {{ targetId: string|null, sourceId: string|null, intentType: 'refine'|'create_new'|'create_derived'|'refine_with_reference' }}
```

- [ ] **Step 4: Add intent classification helpers**

In `src/lib/parse-intent.js`, add these helpers above `export function parseIntent(...)`:

```javascript
function sourceHasReferencedFeature(message, sourceHtml) {
  if (!sourceHtml) return false;
  const html = sourceHtml.toLowerCase();
  const featureMatchers = [
    {
      message: /(?:구매\s*유도|첫\s*구매|구매|cta|CTA|배너)/u,
      html: /(?:purchase|cta|banner|구매|첫\s*구매|혜택|쿠폰)/u,
    },
    {
      message: /(?:필터\s*칩|필터칩|카테고리\s*필터)/u,
      html: /(?:filter|chip|category|카테고리|필터)/u,
    },
  ];

  return featureMatchers.some((matcher) => matcher.message.test(message) && matcher.html.test(html));
}
```

Inside `parseIntent`, after `const targetVariant = ...`, add `sourceVariant` and update the existing block:

```javascript
  const sourceVariant = sourceId ? variants?.find((v) => v.id === sourceId) : null;
  const hasReferenceMergeVerb = /(?:추가|붙여|넣어|반영|가져와|이식|적용)/u.test(message);
  const hasExplicitRebuildVerb = /(?:새로|재구성|전체|갈아엎|완전히|다시\s*만들|처음부터)/u.test(message);
  const targetMentionPattern = targetId ? new RegExp(`${targetId}안\\s*(?:에|에는|으로|쪽에)`, 'u') : null;
  const mentionsTargetAsEditSurface = Boolean(targetMentionPattern?.test(message));
  const sourceHasRequestedFeature = sourceHasReferencedFeature(message, sourceVariant?.html);
  const shouldRefineWithReference = Boolean(sourceId)
    && sourceId !== targetId
    && targetHasHtml
    && hasReferenceMergeVerb
    && mentionsTargetAsEditSurface
    && sourceHasRequestedFeature
    && !hasExplicitRebuildVerb;
```

- [ ] **Step 5: Update intent selection**

Replace:

```javascript
    intentType = isDerive
      ? 'create_derived'
      : targetHasHtml
        ? 'refine'
        : 'create_new';
```

with:

```javascript
    intentType = shouldRefineWithReference
      ? 'refine_with_reference'
      : isDerive
        ? 'create_derived'
        : targetHasHtml
          ? 'refine'
          : 'create_new';
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test
```

Expected: all `parse-intent` tests pass.

## Task 2: Extract API Payload Building Into a Pure Function

**Files:**
- Create: `ohouse-design-site/src/lib/playground-request.js`
- Create: `ohouse-design-site/src/lib/__tests__/playground-request.test.js`
- Modify: `ohouse-design-site/src/components/PlaygroundChat.jsx`

- [ ] **Step 1: Write failing tests**

Create `src/lib/__tests__/playground-request.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { buildPlaygroundRequestPayload } from '../playground-request.js';

const variants = [
  { id: 'A', html: '<html><body><main>A content</main></body></html>' },
  { id: 'B', html: '<html><body><section class="purchase-banner">B banner</section><main>B content</main></body></html>' },
  { id: 'C', html: null },
];

const messages = [
  { role: 'user', content: '장바구니 빈 상태 화면 A안·B안 두 가지 만들어줘' },
  { role: 'assistant', content: 'A안과 B안을 만들었어요.' },
];

describe('buildPlaygroundRequestPayload', () => {
  it('refine_with_reference uses target html as currentHtml and source html as referenceHtml', () => {
    const payload = buildPlaygroundRequestPayload({
      userText: 'B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘',
      messages,
      variants,
      activeVariantId: 'A',
      userContext: undefined,
    });

    expect(payload.mode).toBe('refine');
    expect(payload.targetVariantId).toBe('A');
    expect(payload.sourceVariantId).toBe('B');
    expect(payload.intentType).toBe('refine_with_reference');
    expect(payload.currentHtml).toContain('A content');
    expect(payload.referenceHtml).toContain('B banner');
  });

  it('create_derived keeps source html as currentHtml for explicit rebuild requests', () => {
    const payload = buildPlaygroundRequestPayload({
      userText: 'A안 기반으로 B안을 새로 재구성해줘',
      messages,
      variants,
      activeVariantId: 'A',
      userContext: undefined,
    });

    expect(payload.targetVariantId).toBe('B');
    expect(payload.sourceVariantId).toBe('A');
    expect(payload.intentType).toBe('create_derived');
    expect(payload.currentHtml).toContain('A content');
    expect(payload.referenceHtml).toBeUndefined();
  });

  it('plain target refine uses target html only', () => {
    const payload = buildPlaygroundRequestPayload({
      userText: 'B안에 필터칩 추가해줘',
      messages,
      variants,
      activeVariantId: 'A',
      userContext: undefined,
    });

    expect(payload.targetVariantId).toBe('B');
    expect(payload.intentType).toBe('refine');
    expect(payload.currentHtml).toContain('B content');
    expect(payload.referenceHtml).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test
```

Expected: fails because `src/lib/playground-request.js` does not exist.

- [ ] **Step 3: Implement the pure request builder**

Create `src/lib/playground-request.js`:

```javascript
import { parseIntent } from './parse-intent.js';

export function buildPlaygroundRequestPayload({
  userText,
  messages,
  variants,
  activeVariantId,
  userContext,
}) {
  const { targetId, sourceId, intentType } = parseIntent(userText, variants, activeVariantId);
  const hasExistingVariants = variants.some((v) => v.html);
  const mode = hasExistingVariants ? 'refine' : 'generate';
  const targetVariant = targetId ? variants.find((v) => v.id === targetId) : null;
  const sourceVariant = sourceId ? variants.find((v) => v.id === sourceId) : null;

  const currentHtml = intentType === 'create_derived'
    ? (sourceVariant?.html ?? null)
    : (targetVariant?.html ?? null);

  const referenceHtml = intentType === 'refine_with_reference'
    ? (sourceVariant?.html ?? null)
    : null;

  return {
    messages: messages
      .filter(({ role }) => role === 'user' || role === 'assistant')
      .map(({ role, content }) => ({ role, content })),
    userContext,
    mode,
    targetVariantId: mode === 'refine' ? targetId : undefined,
    sourceVariantId: mode === 'refine' && sourceId ? sourceId : undefined,
    intentType: mode === 'refine' ? intentType : undefined,
    currentHtml: currentHtml ?? undefined,
    referenceHtml: referenceHtml ?? undefined,
  };
}
```

- [ ] **Step 4: Replace inline payload logic in PlaygroundChat**

In `src/components/PlaygroundChat.jsx`, add import:

```javascript
import { buildPlaygroundRequestPayload } from '../lib/playground-request.js';
```

Inside `sendMessage`, keep the existing `parseIntent` call for optimistic tab switching, but replace the `body: JSON.stringify({ ... })` object with:

```javascript
        body: JSON.stringify(buildPlaygroundRequestPayload({
          userText,
          messages: history,
          variants,
          activeVariantId,
          userContext: buildUserContext(),
        })),
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

## Task 3: Extend the API Contract for Reference HTML

**Files:**
- Modify: `ohouse-design-site/src/pages/api/playground.ts`

- [ ] **Step 1: Update `PlaygroundRequest`**

Replace the interface with:

```typescript
export interface PlaygroundRequest {
  messages: PlaygroundMessage[];
  userContext?: string;
  mode?: 'generate' | 'refine';
  targetVariantId?: 'A' | 'B' | 'C';
  sourceVariantId?: 'A' | 'B' | 'C';
  currentHtml?: string;
  referenceHtml?: string;
  intentType?: 'refine' | 'create_new' | 'create_derived' | 'refine_with_reference';
}
```

- [ ] **Step 2: Update `buildRefineContext` for `refine_with_reference`**

Replace `buildRefineContext` with:

```typescript
function buildRefineContext(body: PlaygroundRequest): PlaygroundMessage[] {
  if (body.mode !== 'refine' || !body.currentHtml?.trim()) return body.messages;
  const target = body.targetVariantId ? `${body.targetVariantId}안` : '현재 prototype';
  const source = body.sourceVariantId ? `${body.sourceVariantId}안` : '참고 prototype';

  let prefix: string;
  let refineContext: string;

  if (body.intentType === 'refine_with_reference' && body.referenceHtml?.trim()) {
    prefix = [
      `수정 대상: ${target}.`,
      `참고 소스: ${source}.`,
      '아래 [수정 대상 HTML]의 기존 레이아웃, 콘텐츠, 스타일, CTA 흐름을 보존하세요.',
      '사용자의 최신 요청에 필요한 요소만 [참고 소스 HTML]에서 참고하거나 이식하세요.',
      'target의 기존 UI를 source 전체 UI로 교체하면 안 됩니다.',
      '부분 코드나 diff가 아닌 수정 대상의 완전한 HTML 문서 하나만 생성하세요.',
    ].join(' ');

    refineContext = [
      prefix,
      '',
      '[수정 대상 HTML]',
      '```html',
      body.currentHtml.trim(),
      '```',
      '',
      '[참고 소스 HTML]',
      '```html',
      body.referenceHtml.trim(),
      '```',
    ].join('\n');
  } else {
    prefix = body.intentType === 'create_derived'
      ? `참고 소스: 아래 HTML을 베이스로 ${target}을 새로 제작하세요. 사용자의 최신 요청을 반영한 완전한 HTML 문서를 생성하세요.`
      : `수정 대상: ${target}. 아래 HTML에 사용자의 최신 요청을 반영해 수정하세요. 부분 코드나 diff가 아닌 완전한 HTML 문서만 생성해야 합니다.`;

    refineContext = [
      prefix,
      '```html',
      body.currentHtml.trim(),
      '```',
    ].join('\n');
  }

  const refineMessage: PlaygroundMessage = { role: 'user', content: refineContext };
  return [refineMessage, ...body.messages];
}
```

- [ ] **Step 3: Run tests**

Run:

```bash
npm test
```

Expected: all tests still pass.

## Task 4: Add Target-Only Merge Tests and Helper

**Files:**
- Create: `ohouse-design-site/src/lib/variant-merge.js`
- Create: `ohouse-design-site/src/lib/__tests__/variant-merge.test.js`
- Modify: `ohouse-design-site/src/components/PlaygroundRoot.jsx`

- [ ] **Step 1: Write tests**

Create `src/lib/__tests__/variant-merge.test.js`:

```javascript
import { describe, it, expect } from 'vitest';
import { mergeTargetVariantHtml } from '../variant-merge.js';

describe('mergeTargetVariantHtml', () => {
  it('updates only target variant html', () => {
    const prev = [
      { id: 'A', html: '<html>A old</html>', label: 'A' },
      { id: 'B', html: '<html>B old</html>', label: 'B' },
    ];

    const next = mergeTargetVariantHtml(prev, 'A', '<html>A new</html>');

    expect(next).toEqual([
      { id: 'A', html: '<html>A new</html>', label: 'A' },
      { id: 'B', html: '<html>B old</html>', label: 'B' },
    ]);
  });

  it('returns previous variants unchanged when target is missing', () => {
    const prev = [{ id: 'A', html: '<html>A old</html>', label: 'A' }];
    expect(mergeTargetVariantHtml(prev, 'B', '<html>B new</html>')).toBe(prev);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
npm test
```

Expected: fails because `src/lib/variant-merge.js` does not exist.

- [ ] **Step 3: Implement merge helper**

Create `src/lib/variant-merge.js`:

```javascript
export function mergeTargetVariantHtml(variants, targetVariantId, html) {
  if (!targetVariantId || !html) return variants;
  let didUpdate = false;
  const next = variants.map((variant) => {
    if (variant.id !== targetVariantId) return variant;
    didUpdate = true;
    return { ...variant, html };
  });
  return didUpdate ? next : variants;
}
```

- [ ] **Step 4: Use helper in PlaygroundRoot**

In `src/components/PlaygroundRoot.jsx`, add import:

```javascript
import { mergeTargetVariantHtml } from '../lib/variant-merge.js';
```

Replace:

```javascript
      setVariants((prev) => prev.map((v) => v.id === targetVariantId ? { ...v, html } : v));
```

with:

```javascript
      setVariants((prev) => mergeTargetVariantHtml(prev, targetVariantId, html));
```

Replace:

```javascript
      setVariants((prev) => prev.map((v) => v.id === activeVariantIdRef.current ? { ...v, html } : v));
```

with:

```javascript
      setVariants((prev) => mergeTargetVariantHtml(prev, activeVariantIdRef.current, html));
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm test
```

Expected: all tests pass.

## Task 5: Manual Regression Scenarios

**Files:**
- No code changes

- [ ] **Step 1: Start the dev server**

Run:

```bash
cd ohouse-design-site
npm run dev
```

Expected: Astro dev server starts and prints a local URL, usually `http://localhost:4321/`.

- [ ] **Step 2: Verify Case 1 refine**

Manual flow:

```text
장바구니 빈 상태 화면 A안·B안 두 가지 만들어줘
```

Click A tab, then send:

```text
B안에 첫 구매 유도 배너를 상단에 추가해줘
```

Expected:
- B tab becomes active.
- Loading status says `B안을 수정하고 있어요.`
- B changes.
- A remains unchanged.

- [ ] **Step 3: Verify Case 2 create_new**

Manual flow:

```text
C안도 만들어줘. 다크 테마로 구성해줘
```

Expected:
- C tab becomes active.
- C receives new dark-theme HTML.
- A and B remain unchanged.

- [ ] **Step 4: Verify Case 3 derived generation**

Manual flow:

```text
A안 기반으로 B안을 새로 재구성하고 카테고리 필터칩을 상단에 추가한 버전 만들어줘
```

Expected:
- B tab becomes active.
- B is regenerated using A as base.
- A remains unchanged.

- [ ] **Step 5: Verify reported reference-merge bug**

Manual flow:

```text
B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘
```

Expected:
- A tab becomes active.
- A keeps its existing layout and content.
- Only the requested purchase banner/reference element is added near the top.
- B remains unchanged.

## Self-Review Checklist

- The reported sentence is covered by a failing-then-passing intent test.
- The request payload test proves A HTML is sent as `currentHtml` and B HTML as `referenceHtml`.
- API prompt explicitly forbids replacing target UI with source UI in `refine_with_reference`.
- Variant merge test proves non-target variants are preserved.
- Existing Case 1, Case 2, and Case 3 remain covered by tests or manual regression steps.
