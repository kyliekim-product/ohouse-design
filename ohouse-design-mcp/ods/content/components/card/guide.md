# Card

콘텐츠를 카드 형태로 묶어 표시하는 범용 컨테이너 컴포넌트입니다.

> **어떤 컴포넌트를 써야 할까?**
> - 대부분의 상품 카드 → [Product Card](../../patterns/product-card/pattern.md)
> - Product Card 패턴에 없는 상품 카드 조합 → [Product Card 커스텀 조합](../../patterns/product-card/pattern.md#커스텀-조합)
> - 상품 외 콘텐츠 카드 → **Card**

## Usage Guidelines

### 언제 Card를 직접 쓰는가

[Product Card](../../patterns/product-card/pattern.md) 패턴으로 해결되지 않는 경우에만 Card를 직접 사용합니다.

| 상황 | 사용할 컴포넌트 |
|---|---|
| 일반적인 상품 카드 | Product Card |
| 패턴에 없는 상품 카드 조합 | Card + sub-component |
| 상품 외 콘텐츠 카드 | Card |

![Card 사용 판단](./images/card-when-to-use.png)

### Slot 구성

Card는 3개의 slot으로 구성됩니다. 각 slot에 원하는 컴포넌트를 배치합니다.

- **media** — 이미지, 썸네일 등 시각 콘텐츠
- **seam** — media와 content 사이 보조 UI (optional)
- **content** — 정보 콘텐츠

![Slot 구성](./images/card-slots.png)

### Layout

| Layout | 설명 | 용도 |
|---|---|---|
| `vertical` (기본) | slot이 세로로 쌓임 | 일반적인 카드 형태 |
| `horizontal` | slot이 가로로 나열 | 리스트형 카드 |

![Layout 비교](./images/card-layout.png)

## 조합 예시

### 상품 카드 커스텀

Product Card 패턴에 없는 상품 카드를 Card + sub-component로 직접 조합할 수 있습니다.
자세한 방법은 [Product Card 커스텀 조합](../../patterns/product-card/pattern.md#커스텀-조합)을 참고하세요.

## Figma

### 프로퍼티

| Property | Type | Default | Description |
|---|---|---|---|
| Layout | `vertical` · `horizontal` | `vertical` | 카드 방향 |
| Gap | `number` | `8` | slot 간 간격 |

---

> 상세 스펙은 [Card 스펙](spec.md)을 참고하세요.
