---
title: Proto Playground — Preview Annotation 1차 설계
created: 2026-05-31
status: draft
owner: kylie.kim
scope: playground-preview
---

# Proto Playground — Preview Annotation 1차 설계

## 배경

Proto Playground는 자연어 요청으로 생성한 prototype을 우측 Preview에서 확인하고 반복 수정하는 도구다. 다음 단계에서는 사용자가 Preview 위에 직접 annotation을 남겨, "어느 부분을 왜 수정하고 싶은지"를 화면 맥락과 함께 표현할 수 있어야 한다.

Figma Dev Mode의 annotation처럼 화면 위에 marker를 배치하고 note를 남기는 경험을 참고하되, 1차에서는 DOM 요소 인식이나 정교한 anchor 연결보다 빠른 피드백 흐름을 우선한다.

## 결정

1차 annotation은 좌표 기반 free annotation으로 구현한다.

- 사용자는 프리뷰 화면 안 원하는 위치 어디든 annotation을 추가할 수 있다.
- 추가된 marker는 드래그로 위치를 조정할 수 있다.
- annotation은 prototype HTML 내부 DOM과 연결하지 않는다.
- annotation 좌표는 현재 phone frame 기준 `%`로 저장한다.
- marker와 editor UI는 phone frame 내부가 아니라 Preview frame-area overlay에 렌더링한다.
- annotation은 현재 variant 기준으로 분리해서 표시한다.

이 방식은 구현 복잡도를 낮추면서도, 사용자가 시각적 맥락 위에 피드백을 남기는 핵심 경험을 빠르게 제공한다.

## 1차 사용자 흐름

1. Preview에 prototype이 렌더링된다.
2. 우측 하단에 annotation 추가 floating button이 표시된다.
3. 버튼을 누르면 annotation 추가 모드로 진입한다.
4. annotation 추가 모드에서는 마우스 포인터를 따라다니는 `+` cursor indicator가 보인다.
5. `Esc`를 누르면 annotation 추가 모드가 종료된다.
6. phone frame 안 원하는 위치를 클릭하면 해당 위치 근처에 note editor가 열린다.
7. 사용자가 note를 입력하고 저장하면 numbered marker가 생성된다.
8. marker를 드래그하면 위치가 조정된다.
9. marker를 클릭하면 note editor가 다시 열린다.

## 데이터 모델

```ts
type PreviewAnnotation = {
  id: string;
  variantId: string;
  x: number; // phone width 기준 %
  y: number; // phone height 기준 %
  text: string;
  createdAt: number;
};
```

좌표는 pixel이 아니라 phone frame 기준 `%`로 저장한다. Preview는 OS, zoom, responsive layout에 따라 크기가 바뀌므로 상대 좌표가 가장 단순하고 안정적이다.

## UI 구조

`PlaygroundPreview` 내부에 다음 레이어를 추가한다.

```jsx
<div className="pg__phone" ref={phoneRef}>
  <iframe />
</div>
<AnnotationLayer />
<AnnotationFab />
<AnnotationCursor />
```

`AnnotationLayer`는 phone frame 내부가 아니라 `.pg__frame-area`의 absolute overlay로 둔다. marker는 phone frame 기준 좌표를 frame-area 좌표로 변환해 iframe 위에 맞춰 표시하고, editor는 phone의 `overflow: hidden`에 갇히지 않는 별도 popover로 표시한다. 평상시 prototype 조작을 막지 않도록 pointer event를 제한하고, annotation 추가/편집/드래그 중에만 상호작용을 받는다.

## 1차 범위

- annotation 추가 mode toggle
- `Esc`로 mode 종료
- mouse follower `+` indicator
- phone frame 기준 클릭 위치 계산
- note editor 표시
- note 저장/취소
- numbered marker 표시
- marker drag로 위치 조정
- marker 클릭으로 editor 재오픈
- active variant별 annotation 필터링

## 비범위

- iframe 내부 DOM 요소 자동 인식
- 특정 컴포넌트/요소에 annotation anchor 연결
- annotation을 AI 수정 요청에 자동 주입
- annotation persistence/localStorage 저장
- multi-user collaboration
- property form, category selector 같은 심화 annotation metadata

## 구현 순서

1. `PlaygroundPreview.jsx`에 `phoneRef`, annotation state, 좌표 변환 helper를 추가한다.
2. annotation floating button과 mode toggle을 추가한다.
3. `Esc` key handler와 mouse follower를 추가한다.
4. frame-area annotation overlay click으로 draft annotation editor를 연다.
5. editor 저장/취소 로직을 구현한다.
6. marker rendering과 click-to-edit을 구현한다.
7. pointer drag로 marker 좌표를 갱신한다.
8. `playground.css`에 FAB, marker, editor, cursor indicator 스타일을 추가한다.
9. esbuild 문법 검증으로 변경 파일을 확인한다.

## 이후 확장

2차에서는 annotation을 채팅 요청과 연결할 수 있다. 예를 들어 "이 annotation 반영해서 수정해줘"를 누르면 annotation text와 좌표 맥락을 `/api/playground` refine 요청에 포함한다. 더 정교한 단계에서는 iframe 내부 요소 hit-test나 DOM selector anchor를 추가할 수 있다.
