---
tier: 4
when-to-read: "장바구니 실험·인사이트 조회"
size: "~150 tokens"
screen: cart
owner: TBD
---

# 장바구니 — Experiments

A/B 결과·사용자 리서치·인사이트.

| 실험 | 기간 | result | 인사이트 |
|---|---|---|---|
| [JP PDP FBT 함께 담기](jp-pdp-fbt-bulk-add.md) | 2026-06-01 ~ 2026-06-14 | running | 옵션 선택 직후 = 구매 의도 최고조, 일괄 담기 UI로 PDP 왕복 마찰 제거가 핵심 |
| [장바구니 오늘출발 UX 개선](today-departure-ux.md) | 2026-05-26 ~ | running | 동일 정보라도 프레이밍이 다르면 전환에 큰 차이 — PDP-장바구니 메시지 일관성이 전환 손실 요인 |
| [장바구니 특별인증가 뱃지 넛징](special-price-badge.md) | 2026-05-26 ~ | running | 특별인증가는 상품수 15%지만 임프레션 38% — 핵심 상품 정조준 넛징 |
| [장바구니 내 쿠폰 다운로드](coupon-download-button.md) | 2026-05-18 ~ | running | 쿠폰 정보 접근성이 결제 전환을 막는 핵심 마찰점, 장바구니 일괄 다운로드로 PDP 왕복 제거 |
| [장바구니 추천 영역 sasrec](recommend-sasrec.md) | 2026-03-27 ~ 2026-05-13 | win | sasrec은 직접 클릭 CTR이 아니라 '세션 priming'으로 구매 전환 기여 |
| [CTA/할인 정보 인지 개선](cta-discount-info.md) | 2026-04-20 ~ 2026-05-15 | win | 장바구니가 '담아두는 곳' → '판단하는 곳'으로 확장 |
| [장바구니 엠티뷰 상품 추천](empty-view-recommend.md) | 2026-05-04 ~ | inconclusive | '봤던 것 확신주기' vs '새로운 것 탐색하게 해주기' — 엠티뷰는 탐색 다양성(C/오늘의딜) 쪽 우세 |
| [패키지빌더 지면5 노출조건 변경](package-builder-nudge-condition.md) | 2026-03-11 ~ 2026-04-03 | win | 넛징 도달률 2.24배 늘었지만 패키지 추가만 개선, 이후 단계는 NEUTRAL → 광역 GMV 이동은 어려움 |
| [주문취소 후 장바구니 담기](order-cancel-add-to-cart.md) | 2026-01-01 ~ 2026-03-04 | win | 취소 직후 = 재구매 의도 최고조, 마찰 단계 제거만으로 장바구니→구매 전환율 +3.38% |
| [JP 장바구니 담기 후 바텀시트 교차 추천](jp-bottomsheet-cross-recommend.md) | ~ 2026-02-19 | loss | 장바구니 담기 직후 강한 개입(바텀시트)은 의사결정 완료된 흐름을 깨는 방해 요소 |
| [장바구니 선택 UX 개선 (체크박스 default)](selection-ux-default.md) | 2026-01-12 ~ 2026-01-25 | inconclusive | 전환은 NEUTRAL이지만 '의도 기반 선택' UX 가치 우선 → D안 런칭. 데이터 vs UX 가치 트레이드오프 사례 |

## 추가 방법

1. `<experiment-name>.md` 작성 (kebab-case)
2. frontmatter: `period`, `variants`, `result: win|loss|inconclusive`, `insight`
3. **인사이트**(전환률 외 발견) 별도 표기

규격: `../../../CONVENTIONS.md` "실험 규격" 섹션.
