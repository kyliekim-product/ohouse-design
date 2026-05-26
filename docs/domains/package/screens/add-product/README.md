---
tier: 5
when-to-read: "패키지/상품 리스트 화면 작업 시"
size: "~900 tokens"
domain: package
variant: add-product
figma: "Needs confirmation"
thumbnail: ""
status: draft
owner: Deeer
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §4"
---

# 패키지 — Add Product

패키지에 담을 상품을 탐색하고 추가하는 상품 리스트 화면.

## 사용 컴포넌트

- @domain-component:package/ProductItemPackage (reference only)
- @domain-component:package/ProductGridItem (planned)

## 진입/이탈

| 구분 | 경로 |
|---|---|
| 진입 | package-home의 상품 추가 버튼, reco-card 검색칩, 카테고리 카드 `+` 버튼 |
| 이탈 | package-home, PDP, 옵션 선택/담기 플로우 |

## 화면 구조

```
[Full-screen overlay]
[1depth tabs: 전체/가구/가전/조명/패브릭/주방용품/설치·시공]
[2depth tabs]
[Search field]
[2-column product grid]
```

## 핵심 정책

- 검색은 상품명/브랜드명 기준으로 필터링한다.
- 카테고리 카드 `+` 버튼에서 진입하면 해당 카테고리가 선택된 상태로 랜딩한다.
- 상품 그리드 카드는 메인 화면의 `product-item-package`와 형태가 다르므로 별도 컴포넌트 후보로 둔다.
- 썸네일 클릭은 PDP 오픈, 담기 버튼은 패키지에 직접 추가한다.

## Needs Confirmation

- 상품 리스트 카드 spec을 `ProductGridItem`으로 분리할지 여부
- 검색창 포커스/키보드 노출 조건
- Figma 대표 node URL

