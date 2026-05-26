---
tier: 5
when-to-read: "패키지/브랜드 할인 화면 작업 시"
size: "~1k tokens"
domain: package
variant: brand-discount
figma: "Needs confirmation"
thumbnail: ""
status: draft
owner: Deeer
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §10"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.4"
---

# 패키지 — Brand Discount

패키지에 담긴 브랜드 상품의 수량별 추가 할인 조건과 대상 상품을 보여주는 화면.

## 사용 컴포넌트

- @domain-component:package/BrandDiscountBanner (planned)
- @domain-component:package/ProductGridItem (planned)

## 진입/이탈

| 구분 | 경로 |
|---|---|
| 진입 | package-home의 상품 카드 하단 브랜드 할인 배너 |
| 이탈 | package-home, PDP, 상품 추가 |

## 화면 구조

```
[Header: back + {브랜드명} 브랜드 할인]
[Brand sale notice]
[Guide box]
[Category tabs]
[2-column product grid]
```

## 핵심 정책

- 브랜드 할인 배너는 프로모션 대상 브랜드의 상품에만 노출한다.
- 할인율은 쿠폰 적용가 기준이다.
- 구매 수량별 할인율은 2개 5%, 3개 10%, 4개 이상 15%다.
- 최소 금액은 할인 상품 금액 50만원 이상, 최대 할인 금액은 1,000만원이다.
- 행사는 예산 소진에 따라 고지 없이 종료될 수 있다.

## Needs Confirmation

- 대상 브랜드 목록의 최신성
- 브랜드 할인 배너를 컴포넌트로 분리할 시점
- Figma 대표 node URL

