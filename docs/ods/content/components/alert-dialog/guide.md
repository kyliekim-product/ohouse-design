# Alert Dialog

사용자가 반드시 선택해야 하는 상황에서 사용합니다. Close Button이 없으며 외부 탭으로 닫을 수 없습니다.

> 사용자가 자유롭게 닫을 수 있어야 하는 경우에는 [Dialog](../dialog/guide.md)를 사용하세요.

## Dialog와의 차이

| | Dialog | Alert Dialog |
|---|---|---|
| Close Button (×) | 항상 표시 | 없음 |
| 외부 탭/ESC 닫기 | 가능 | 불가 |
| Button 배치 | Single / Horizontal / Vertical | Vertical 전용 (2~3개) |
| 예시 | 업데이트 안내, 쿠폰 안내, 이벤트 | 삭제 확인, 약관 동의 |

컴포넌트를 선택하는 것만으로 올바른 동작이 적용됩니다. 별도의 설정이 필요 없습니다.

## 구조

```
Alert Dialog
├── Title             ← optional, 좌측 정렬
├── Body              ← 본문 텍스트 또는 커스텀 콘텐츠
├── Sub Text          ← optional, 보조 설명
└── Button            ← Vertical 2Button / Vertical 3Button
```

## Usage Guidelines

### Title

- 좌측 정렬합니다.
- 문장 형태는 사용하지 않습니다. 구체적 명사나 키워드만 사용합니다.
- 반드시 한 줄로 작성합니다.
- 이모지, 아이콘, 특수기호는 사용하지 않습니다.

### Body

- '해요체'의 문장을 사용합니다.
- 아이콘, 이모지를 사용하지 않습니다.
- 3줄 이내로 작성하는 것이 가장 적절합니다.
- 3줄까지는 중앙정렬, 4줄부터는 좌측정렬을 사용합니다.
  - 자동 줄바꿈되므로 임의로 줄바꿈하지 않습니다.

### Sub Text

- 텍스트만으로는 설명이 부족할 시에만 사용하며, 되도록 사용하지 않는 것을 권장합니다.
- 1줄 이내로 핵심 내용만 간결하게 작성합니다.
- 문장 앞에서 특수기호(*, ·)나 이모지를 붙이지 않습니다.
- 텍스트와 문장기호, /, > 만 사용합니다.

### Button

Vertical 배치만 사용합니다.

- **Vertical (2Button)**: 두 가지 선택지를 수직 배치
- **Vertical (3Button)**: 세 가지 선택지를 수직 배치 (예: 저장/저장 안함/취소)

## Specs

### Size

- App은 300 사이즈를 사용합니다.
- 화면 좌우에 10 여백을 확보한 상태로 디바이스 너비에 따라 자동 확장되며, 최대 너비는 300을 초과하지 않습니다.
- Web은 해상도에 따라 300/400/500 사이즈 사용 가능하도록 정의되어 있습니다.

### Height

- Max Height는 별도로 지정되어 있지 않으며, 필요한 경우 해당 과업에서 별도 정의해 적용합니다.

## Figma

### 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Title | Boolean | 타이틀 표시 여부 |
| Sub Text | Boolean | 보조 텍스트 표시 여부 |
| Body Text | Text | 본문 텍스트 내용 |
| Children | Slot | 본문 영역 커스텀 콘텐츠 |
| Button | Variant | Vertical 2Button / Vertical 3Button |

> Close Button이 필요하면 [Dialog](../dialog/guide.md)를 사용하세요.

### Private Sub-Components

| sub-component | 용도 |
|---|---|
| .Alert Dialog Title | Alert Dialog 전용 타이틀 |
| .Alert Dialog Button | Alert Dialog 전용 버튼 영역 (Vertical 2Button / Vertical 3Button) |
