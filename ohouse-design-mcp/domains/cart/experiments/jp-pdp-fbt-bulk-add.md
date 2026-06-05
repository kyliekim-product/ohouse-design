---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-06-01 ~ 2026-06-14
key_date: 2026-06-02
key_date_type: started
variants: [A (FBT 캐러샐 미노출), B (FBT 캐러샐 + 체크박스 일괄 담기 + 합산 CTA)]
winner: null
result: inconclusive
summary: "JP PDP 옵션 영역 아래 Frequently Bought Together 캐러샐을 추가하고, 메인 상품 + 추천 상품을 체크박스로 골라 한 번에 장바구니 담는 합산 CTA를 도입."
result_summary: "실험 진행 중 (2026-06-01 시작, 2주 예정). 평균 주문 상품 수 1.5개 → 1.6~1.7개 목표."
insight: "JPC는 평균 주문 상품 수 1.5개로 크로스셀 여지가 큼. 옵션 선택 직후가 구매 의도 최고조 시점이며, 일괄 담기 UI로 PDP 왕복 마찰을 제거하는 것이 핵심."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1780375467333089
  notion: https://www.notion.so/35da597878a081a792ccd843ff2951e6
  prd: null
  figma: https://www.figma.com/design/wIoSEyhwKrDy9IXyTzbzQ1
  xpc: https://xpc.dailyhou.se/experiments/2233
team: Commerce
owner: Terry
---

# JP PDP Frequently Bought Together 캐러샐 + 한꺼번에 담기

## 배경
- JP MAU 절반이 상품 2개만 조회. 평균 주문 상품 수 1.5개 → 크로스셀 여지 큼
- 4주 분석: CART 방문 후 12.4%가 PDP로 재이동해 다른 상품 추가 탐색 중
- 정성 리서치: 일본 유저는 "스크랩 → 비교 → 결정" 흐름에서 동일 브랜드/카테고리 연속 탐색 욕구 높지만 경로 미비
- 경쟁사(Low-ya "이 상품과 함께 구매하는 상품", Rasik "이 침대와 함께 구매되는 매트리스")는 이미 동일 패턴 운영 중

## 가설
다른 유저들이 함께 구매한 상품들을 PDP에 알려주면 유저의 상품 탐색량이 개선되고 장바구니에도 더 많은 제품을 담을 것이다.

## 해결 방향
- 옵션 선택 영역 ↓ / Details 섹션 ↑ 위치에 FBT 섹션 신설
- 카드 우측 체크박스로 선택/해제
- 하단 합산 CTA: "N개 같이 담기 ¥XX,XXX" (메인 + 선택 FBT 가격 합산)
- 추가 완료 바텀시트: 추가된 상품 미리보기 + "보러가기" CTA
- 100개 한도 초과 시 토스트 안내

## 결과 (진행 중)

| 지표 | 변화 | 유의성 |
|---|---|---|
| JP SELLING PDP VIEW PER USER | 측정 중 | - |
| GLOBAL JP SELLING PDP to CART CVR | 측정 중 | - |
| 평균 주문 상품 수 (목표) | 1.5 → 1.6~1.7 | (목표) |
| PDP → CART (목표) | 상대 +5~10% | (목표) |

→ 실험 진행 중. 2026-06-01 시작, 2주 예정.

## 인사이트

**옵션 선택 직후 = 구매 의도 최고조. 일괄 담기 UI로 PDP 왕복 마찰을 제거하는 것이 핵심 레버.**

- 추천이 있어도 "한 번에 담기" 일괄 액션 UI가 부재하면 사용자가 개별 PDP를 왕복해야 하는 번거로움이 남음
- 합산 가격 가시성 → 결정 비용 감소

## 출처
- 노션 PRD: https://www.notion.so/35da597878a081a792ccd843ff2951e6
- Slack 시작 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1780375467333089
- Figma: https://www.figma.com/design/wIoSEyhwKrDy9IXyTzbzQ1
- XPC: https://xpc.dailyhou.se/experiments/2233
