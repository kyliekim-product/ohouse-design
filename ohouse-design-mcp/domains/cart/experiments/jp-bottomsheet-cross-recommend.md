---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: ~ 2026-02-19
key_date: 2026-02-19
key_date_type: ended
variants: [A (기존 장바구니 담기 후 토스트), B (장바구니 담기 후 바텀시트 내 교차 구매 상품 추천)]
winner: A
result: loss
summary: "JP에서 장바구니 담기 후 바텀시트에 교차 구매 상품을 추천. PDP→Cart 전환율을 끌어올리려 했으나 오히려 -14% 하락 → A 100% 종료."
result_summary: "SELLING PDP to CART CVR -14.09% (p=0). Buyer Conversion·GMV는 neutral. 강한 개입이 의사결정 완료 순간의 구매 흐름을 방해."
insight: "장바구니 담기 직후는 고객 의사결정이 완료된 순간. 강한 추천 개입은 오히려 전환 저해 리스크. 추천 적합도가 충분하지 않으면 흐름을 깬다."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1771475309159099
  notion: null
  prd: null
  figma: null
  xpc: null
team: Commerce
owner: Selah
---

# JP 장바구니 담기 후 바텀시트 교차 구매 추천

## 배경
- JPC에서 장바구니 담기 직후 시점을 활용해 교차 구매(cross-sell)를 시도하려 함
- 평균 주문 상품 수가 낮은 JP에서 추가 담기 유도 필요성

## 가설
장바구니 담기 직후 바텀시트로 교차 구매 상품을 추천하면, 자연스럽게 추가 상품 탐색·담기로 이어져 PDP→Cart 전환율과 평균 주문 상품 수가 상승할 것이다.

## 해결 방향
- 장바구니 담기 액션 직후 바텀시트 노출
- 바텀시트 내 교차 구매 상품 캐러샐 표시

## 결과 (A 100% 종료 — Loss)

| 지표 | 변화 | 유의성 |
|---|---|---|
| SELLING PDP TO CART RATE | +1.69% | p=0.701 (Neutral) |
| **SELLING PDP to CART CVR** | **-14.09%** | **p=0** (유의 하락) |
| CART to CHECKOUT CVR | +5.45% | p=0.138 |
| SELLING PDP VIEW PER USER | -3.8% | p=0.419 |
| Buyer Conversion | +2.81% | p=0.531 (Neutral) |
| GMV per User | +0.76% | p=0.91 (Neutral) |

→ 핵심 PDP→Cart CVR 유의 하락 → **A 100% 종료**.

## 인사이트

**장바구니 담기 직후 = 고객 의사결정이 완료된 순간. 강한 개입(바텀시트)은 구매 흐름을 깨는 방해 요소.**

- 추천 상품의 개입 강도가 높은 구조에서 적합도·설득력이 충분하지 않으면 전환 저해 리스크
- "담았다"는 만족감 → 다음 행동(장바구니 이동, 결제) 자연스러운 흐름이 끊김
- 교차 구매 추천은 옳지만 **타이밍과 강도**가 핵심: 바텀시트는 강도가 너무 셌음
- 후속: 추천 적합도 개선 + 노출 타이밍 재설계 (예: 토스트 + 인라인 캐러샐, PDP 내 FBT — XPC 2233 참조)

## 디자인 고려사항
1. **개입 강도**: 토스트 < 인라인 캐러샐 < 바텀시트 < 풀스크린 모달. 의사결정 완료 시점일수록 약한 개입이 안전
2. **타이밍**: 담기 직후 vs 장바구니 진입 시 vs 주문서 진입 전 — 각 시점의 유저 mental model 달라짐
3. **추천 적합도**: 동일 카테고리/같이 구매(co-purchase)/동일 브랜드 중 어느 시그널이 cart 컨텍스트에 맞는지 사전 검증 필요

## 출처
- Slack 종료 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1771475309159099
- 노션: null (없음)
