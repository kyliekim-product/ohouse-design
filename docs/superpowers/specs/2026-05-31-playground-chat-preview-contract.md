---
title: Proto Playground — Chat/Preview Contract 개선 설계
created: 2026-05-31
status: draft
owner: kylie.kim
scope: playground
---

# Proto Playground — Chat/Preview Contract 개선 설계

## 배경

Proto Playground의 1차 구현은 사용자가 자연어로 요청하면 AI가 `prototype.html`을 생성하고, 우측 Preview iframe에 결과를 렌더링하는 구조다. 현재는 AI 응답 텍스트 전체를 채팅에 그대로 노출하고, 클라이언트가 응답 중 HTML code block을 regex로 추출해 Preview로 전달한다.

이 방식은 빠르게 동작하지만, 사용자가 기대하는 경험과 구현 책임이 섞여 있다.

- 채팅 패널은 사용자의 요청을 받고, 서비스가 무엇을 처리 중인지 설명하고, 요청에 자연어로 응답해야 한다.
- Preview 패널은 HTML 생성과 렌더링 과정을 그래픽 상태로 보여주고, 완성된 prototype을 조작 가능하게 보여줘야 한다.
- HTML 산출물은 내부 생성 결과이지, 채팅에서 사용자가 읽어야 하는 응답이 아니다.

## 판단

단순히 채팅에서 HTML 코드 블록을 숨기는 1차 개선만 진행하면 단기적으로는 화면이 정리된다. 그러나 이후 필수 기능인 A/B variant, 부분 수정, 에러 복구를 구현할 때 다시 응답 계약을 뜯어고쳐야 한다.

따라서 지금 필요한 방향은 "1차 UX를 만들되, 구현 토대는 2차 구조로 간다"이다. 즉, 전체 2차 기능을 한 번에 완성하지는 않지만, 스트림 이벤트와 variant 모델은 지금부터 구조화한다.

## 목표

1. 채팅에는 사용자-facing 자연어와 처리 상태만 표시한다.
2. HTML 생성물은 Preview로만 전달한다.
3. Preview는 생성 중, 렌더링 중, 완료, 실패 상태를 자체적으로 표현한다.
4. A/B/C variant를 단순 HTML 배열이 아니라 추후 수정 가능한 산출물 모델로 다룬다.
5. 부분 수정과 에러 복구를 위한 최소 컨텍스트 필드를 API 요청/응답 구조에 포함할 수 있게 한다.

## 비목표

- 이번 단계에서 완전한 부분 diff 편집 엔진을 만들지 않는다.
- 생성된 HTML의 자동 정적 분석/수정까지 포함하지 않는다.
- 프리뷰 내 DOM 조작 기반의 시각적 edit mode는 포함하지 않는다.
- 저장소 도메인 폴더에 prototype을 자동 저장하는 기능은 포함하지 않는다.

## 이벤트 계약

서버는 SSE로 이벤트를 전송한다. 클라이언트는 이벤트 타입에 따라 Chat과 Preview를 분리 업데이트한다.

```ts
type PlaygroundStage =
  | 'understanding'
  | 'retrieving'
  | 'generating'
  | 'rendering'
  | 'complete'
  | 'error';

type PlaygroundVariant = {
  id: 'A' | 'B' | 'C';
  label: string;
  summary?: string;
  html: string;
};

type PlaygroundStreamEvent =
  | { type: 'status'; stage: PlaygroundStage; message: string }
  | { type: 'assistant_text'; text: string }
  | { type: 'prototype_delta'; html: string; variantId?: 'A' | 'B' | 'C' }
  | { type: 'prototype_done'; html?: string; variants?: PlaygroundVariant[] }
  | { type: 'done' }
  | { type: 'error'; stage?: PlaygroundStage; message: string };
```

### 1차 호환 전략

OpenAI 스트림에서 바로 구조화된 이벤트를 안정적으로 받기 전까지, 서버는 기존 모델 출력에서 HTML code block을 파싱한다. 파싱 결과를 다음처럼 재발행한다.

- code block 밖의 자연어: `assistant_text`
- 생성 시작/종료 단계: `status`
- 단일 HTML: `prototype_done.html`
- A/B/C HTML: `prototype_done.variants`
- 파싱 실패: `error(stage: 'error')`

이 호환 레이어는 이후 모델 응답을 JSON schema 또는 tool-call 기반으로 바꿀 때 제거할 수 있다.

## 요청 모델

```ts
type PlaygroundRequest = {
  messages: PlaygroundMessage[];
  userContext?: string;
  mode?: 'generate' | 'refine';
  targetVariantId?: 'A' | 'B' | 'C';
  currentHtml?: string;
};
```

`mode: 'refine'`은 부분 수정 요청의 기반이다. 초기 구현에서는 active variant의 전체 HTML을 `currentHtml`로 보내고, 서버는 수정된 전체 HTML을 다시 반환한다. UI는 이를 "부분 수정"처럼 보여주되, 데이터 계약은 전체 HTML 교체로 단순하게 유지한다.

## 클라이언트 책임

### Chat

- `user`, `assistant`, `status`, `error` 메시지를 렌더링한다.
- HTML code block은 절대 채팅에 표시하지 않는다.
- `assistant_text`는 하나의 assistant bubble에 누적한다.
- `status`는 일반 메시지보다 가벼운 처리 상태 row로 표시한다.

### Preview

- `idle`: 아직 생성물이 없는 상태
- `understanding`: 요청 분석 중
- `retrieving`: ohouse context 확인 중
- `generating`: prototype HTML 생성 중
- `rendering`: iframe 반영 중
- `complete`: 렌더링 완료
- `error`: 생성/파싱/렌더링 실패

Preview는 생성 중에도 화면 중심에 그래픽 상태를 보여준다. 완성된 HTML이 이미 있는 상태에서 refine 중이면 기존 iframe은 유지하고, 프레임 위에 얇은 생성 상태 overlay를 표시한다.

### Variant

Preview 내부 데이터는 다음 형태를 기준으로 한다.

```ts
type PreviewVariant = {
  id: 'A' | 'B' | 'C';
  label: string;
  summary?: string;
  html: string | null;
};
```

이 구조를 쓰면 이후 다음 요청을 자연스럽게 지원할 수 있다.

- "B안을 더 과감하게 바꿔줘"
- "A안 CTA만 더 명확하게 바꿔줘"
- "두 안을 합쳐서 C안으로 만들어줘"

## 에러 복구 기준

에러는 최소한 단계와 함께 보여준다.

- `understanding`: 요청 이해 실패
- `generating`: 모델 생성 실패
- `rendering`: HTML은 받았으나 Preview 반영 실패
- `error`: 단계 특정이 어려운 일반 실패

채팅에는 복구 가능한 자연어 메시지를 보여주고, Preview는 가능하면 마지막 정상 결과를 유지한다.

## 구현 순서

1. 서버 SSE 이벤트를 `status`, `assistant_text`, `prototype_done`, `error`, `done`으로 재발행한다.
2. 기존 HTML regex 파싱은 서버 호환 레이어로 이동한다.
3. Chat은 `assistant_text`와 `status`만 표시하도록 바꾼다.
4. Root는 `previewStatus`, `previewError`, `variants` 흐름을 중계한다.
5. Preview는 variant object와 상태 UI를 렌더링한다.
6. `mode`, `targetVariantId`, `currentHtml` 요청 필드를 추가해 partial edit의 기반을 만든다.

## 성공 기준

- 단일 prototype 생성 시 채팅에 HTML code block이 보이지 않는다.
- 생성 중 Chat에는 처리 상태와 짧은 자연어 응답이 보인다.
- 생성 중 Preview에는 그래픽 상태가 보인다.
- 완료 후 Preview iframe이 업데이트되고 Copy/Download가 동작한다.
- A/B 요청 시 Preview 탭에 각 variant가 들어간다.
- 기존 구현의 example prompt, context upload, API key fallback은 유지된다.
