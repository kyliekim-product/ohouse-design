---
title: Playground — Variant Targeting 설계
created: 2026-06-01
status: approved
branch: proto-beta-v.1
owner: kylie.kim
---

# Playground Variant Targeting

> **한 줄 요약**: 유저가 "B안에 필터칩 추가해줘"처럼 특정 안을 언급하면, 해당 안만 정확히 수정하고 나머지 안은 보존한다.

---

## 1. 문제

유저가 A·B·C안 중 하나만 업데이트를 요청해도 현재 구조에서는 두 가지 이유로 의도하지 않은 안까지 교체된다.

1. **잘못된 타겟 전달**: `targetVariantId`가 유저가 언급한 안이 아닌 현재 활성 탭 기준으로 결정된다.
2. **AI 다중 응답**: 시스템 프롬프트에 단일 반환 규칙이 없어 AI가 A/B/C 전체를 새로 생성해 돌려보내면 전체 variants 상태가 덮어씌워진다.

---

## 2. 해결 방향

**B+C 조합**: NLP로 타겟을 파싱하되, 탭도 신호로 활용. 낙관적 탭 전환으로 UX 투명성 확보.

> **범위**: 이 설계는 variants가 하나 이상 존재하는 상태에서의 수정/파생 요청에만 적용된다. 최초 생성(`generate` 모드, variants 없음)은 기존 동작을 유지한다.

---

## 3. 아키텍처 & 데이터 흐름

```
사용자 메시지 입력
       ↓
[1] parseIntent(message, variants)
    → { targetId, sourceId, intentType }
       ↓
[2] 낙관적 탭 전환 → activeTab = targetId
    상태바: "B안을 수정하고 있어요…"
       ↓
[3] API 요청 빌드
    - refine         → currentHtml = variants[targetId].html
    - create_derived → currentHtml = variants[sourceId].html
    - create_new     → currentHtml = undefined
       ↓
[4] API 응답: 단일 HTML (항상)
       ↓
[5] variants[targetId].html 만 업데이트 (나머지 보존)
```

**상태 구조 변경**: `PlaygroundRoot`가 `allVariants` 배열 전체를 관리하고 `PlaygroundChat`에도 전달해 [1]~[3]에서 올바른 소스 HTML을 꺼낼 수 있도록 한다.

---

## 4. 인텐트 파싱 로직

`PlaygroundChat`에서 키워드 기반으로 분류. 별도 AI 호출 없이 프론트엔드에서 처리.

```javascript
function parseIntent(message, variants) {
  // 1. 타겟 안 추출
  const targetMatch = message.match(/([A-Ca-c])안/);
  const targetId = targetMatch ? targetMatch[1].toUpperCase() : null;

  // 2. 소스 안 추출 ("A안 기반으로", "A안 베이스로")
  const sourceMatch = message.match(/([A-Ca-c])안\s*(?:기반|베이스|참고|바탕)/);
  const sourceId = sourceMatch ? sourceMatch[1].toUpperCase() : null;

  // 3. 인텐트 분류
  const isDerive = Boolean(sourceId) && sourceId !== targetId;
  const targetHasHtml = targetId && variants[targetId]?.html;

  const intentType = isDerive
    ? 'create_derived'   // "A안 기반으로 B안 만들어줘"
    : targetHasHtml
      ? 'refine'         // 기존 안 수정
      : 'create_new';    // 빈 슬롯 신규 생성

  return { targetId, sourceId, intentType };
}
```

**엣지 케이스:**

| 메시지 예시 | targetId | intentType | sourceHtml |
|---|---|---|---|
| "B안에 필터칩 추가" (B안 있음) | B | refine | B안 HTML |
| "C안도 만들어줘" (C안 비어있음) | C | create_new | 없음 |
| "A안 기반으로 B안 만들어줘" | B | create_derived | A안 HTML |
| "수정해줘" (A안 탭 활성) | A (폴백) | refine | A안 HTML |

---

## 5. API 계약 변경

### 요청 타입 (`PlaygroundRequest`)

```typescript
interface PlaygroundRequest {
  messages: PlaygroundMessage[];
  userContext?: string;
  mode: 'generate' | 'refine';
  targetVariantId?: 'A' | 'B' | 'C';
  currentHtml?: string;
  intentType?: 'refine' | 'create_new' | 'create_derived';
}
```

### `buildRefineContext` 분기

```typescript
const prefix = body.intentType === 'create_derived'
  ? `참고 소스: 아래 HTML을 베이스로 ${target}을 새로 제작하세요.`
  : `수정 대상: ${target}. 아래 HTML에 요청사항을 반영해 수정하세요.`;
```

### 시스템 프롬프트 추가 규칙

```
## Refine 모드 응답 규칙 (엄수)
수정 대상이 명시된 경우(수정 대상: X안), 반드시 해당 안의 HTML 하나만 반환합니다.
다른 안(A/B/C)을 함께 생성하거나 ### A안: 형식의 다중 변형 응답은 금지입니다.
단일 ```html ... ``` 블록으로만 응답하세요.
```

---

## 6. UX 피드백 (낙관적 탭 전환)

| 타이밍 | 동작 |
|---|---|
| 메시지 전송 즉시 | 타겟 탭으로 자동 전환 |
| 로딩 중 | 상태바 "B안을 수정하고 있어요…" |
| 응답 도착 | 타겟 슬롯 HTML만 교체, 나머지 보존 |

---

## 7. 변경 파일 요약

| 파일 | 변경 내용 |
|---|---|
| `PlaygroundChat.jsx` | `parseIntent` 함수 추가, `allVariants` prop 수신, API 요청 빌드 로직 수정 |
| `PlaygroundRoot.jsx` | `allVariants` 상태 관리, Chat에 전달, 단일 HTML 머지 핸들러 수정 |
| `PlaygroundPreview.jsx` | 외부에서 activeTab 제어 가능하도록 prop 추가 |
| `pages/api/playground.ts` | `intentType` 처리, `buildRefineContext` 분기 수정 |
| `lib/playground-context.js` | 시스템 프롬프트에 Refine 모드 규칙 추가 |
