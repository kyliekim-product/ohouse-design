---
tier: 5
when-to-read: "패키지/메인 화면 작업 시"
size: "~1.5k tokens"
domain: package
variant: package-home
figma: "Needs confirmation"
thumbnail: ""
status: draft
owner: Deeer
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §3"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3·§5"
---

# 패키지 — Package Home

글린다 패키지할인의 메인 화면. 상품 탭·조합 탭, 구매 조건 안내, 상품 카드, 하단 진행바와 CTA를 포함한다.

## 사용 컴포넌트

- @domain-component:package/ProductItemPackage
- @domain-component:package/PackageRecoCard (planned)
- @domain-component:package/PackageProgressBar (planned)
- @domain-component:package/BrandDiscountBanner (planned)

## 진입/이탈

| 구분 | 경로 |
|---|---|
| 진입 | PDP `패키지담기`, 장바구니 패키지 전환, 패키지 랜딩 |
| 이탈 | 상품 리스트, PDP, 옵션 셀렉터, 패키지 할인가 모달, 브랜드 할인 화면, 장바구니 |

## 화면 구조

```
[Header: back + 나만의 패키지 + cart]
[Title: 많이 살수록 커지는 할인, 최저가 패키지]
[Toolbar: 상품/조합 탭 + 전체 체크 + 선택 삭제 + 상품 추가]
[Reco Card: 구매 조건 완성 가이드]
[Category Cards]
[Product Item Package × N]
[Bottom Progress Bar]
[CTA: 조합 저장 + 패키지 할인가 보기]
```

## 핵심 정책

- 구매 조건은 **추가된 상품 기준**으로 판단한다. 선택/체크 상태 기준이 아니다.
- 구매 조건은 서로 다른 2depth 카테고리 5개 이상, 그중 가구 2개 필수다.
- `조합 저장`은 상품 1개 이상 선택 시 활성화한다.
- `패키지 할인가 보기`는 구매 조건 충족 시 활성화한다.
- 상품 카드 안 클릭 영역은 썸네일/체크박스, 텍스트, 옵션, 가격, 삭제 버튼이 모두 다른 액션을 가진다.

## 주요 상태

| 상태 | 처리 |
|---|---|
| 상품 0개 | Empty 상태. 일러스트, "상품을 추가해보세요", 상품 추가 CTA, 하단 CTA 비활성 |
| 조건 미충족 | progress-bar에 남은 카테고리/가구 슬롯 표시, 패키지 할인가 보기 비활성 |
| 조건 충족 | 3단계 애니메이션 후 "지금부터 모든 상품 최저가로 구매 가능" 문구와 더 담기 칩 노출 |
| 옵션 미선택 상품 포함 | 옵션 영역 빨간색, 패키지 할인가 계산은 대표옵션 기준 |

## Needs Confirmation

- Figma 대표 node URL
- `PackageRecoCard`, `PackageProgressBar`, `BrandDiscountBanner`를 별도 컴포넌트로 분리할 시점
- 조합 탭 최대 개수 5개 → 10개 확장 반영 시점

