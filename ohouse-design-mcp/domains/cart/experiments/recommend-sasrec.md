---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-03-27 ~ 2026-05-13
key_date: 2026-05-13
key_date_type: launched
variants: [A (기존 session_based 프로듀서), B (기존 + sasrec 구매 기반 프로듀서 round-robin)]
winner: B
result: win
summary: "장바구니 추천 영역('다른 고객이 함께 구매한 상품')에 sasrec(시퀀셜 행동 기반) 구매 프로듀서를 추가하여 추천 품질 개선."
result_summary: "장바구니pv → 주문완료pv +3.80% (p=0.041). 가드레일 손실 없음 → B 100% 런칭."
insight: "sasrec은 자기 지면 직클릭 CTR은 열위(3.12% vs 3.22%)지만, 세션 전체 구매 intent를 priming → downstream(cart→order)에서 유의미한 상승. 추천 효과는 직접 클릭이 아닌 'priming'으로도 작동."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1778658440071359
  notion: https://www.notion.so/34ca597878a0816fae8fe2fa90b12db9
  prd: null
  figma: null
  xpc: https://xpc.dailyhou.se/experiments/2094
team: Commerce
owner: Kao
---

# 장바구니 추천 영역 sasrec 프로듀서 추가

## 배경
- 장바구니 추천 영역('다른 고객이 함께 구매한 상품')에 노출되는 추천 상품의 품질 개선 필요
- 기존 session_based 프로듀서 외에 시퀀셜 행동 기반(sasrec) 모델로 보강

## 가설
sasrec 구매 기반 프로듀서로 추천 상품의 품질이 개선되어, 장바구니에 담긴 상품이 실제 주문 완료까지 이어지는 비율이 상승할 것이다.

## 해결 방향
- 기존 session_based 프로듀서에 sasrec round-robin 추가
- WEB / KR 100% 적용

## 결과 (B Winner)

| 지표 | 변화 | 유의성 |
|---|---|---|
| 장바구니pv → 주문완료pv (action) | 0.050 → 0.052 **(+3.80%)** | p=0.041 |
| KR GMV per customer | 가드레일 무해 | - |
| 광고+커머스 합계이익 | 가드레일 무해 | - |

→ 핵심 지표가 유의하게 상승하고 가드레일 손실 없어 **B 100% 런칭**.

## 인사이트

**sasrec은 직접 클릭률(CTR)이 아니라 '세션 priming'으로 구매 전환 기여. 추천 효과 측정 시 자기 지면 CTR만 보면 과소평가될 수 있음.**

- 자기 지면 per-producer 분석에서 sasrec CTR(3.12%) < session_based(3.22%), click→purchase(8.45%) < session_based(9.14%) → 직접 시그널은 열위
- 그러나 cart→order +6.86% (p=0.065), 검색 광고 CTR +2.57% (p=0.04) 등 downstream/cross-surface에서 positive 신호 일관적
- "앞선 노출이 뒤이은 행동에 영향" priming 메커니즘 — 즉 sasrec 노출이 세션 전체의 구매 의사결정을 끌어올리는 효과

## 향후 방향
- user-side tower 추가로 모델 보강 (현재는 유저 프로필·멀티 행동 시퀀스 부재)
- 다른 프로듀서(ALSO_BOUGHT, SAME_SERIES 등)로도 동일한 priming 효과 재현 검증

## 출처
- 노션 인사이트(v4 별도 의사결정 문서): https://www.notion.so/34ca597878a0816fae8fe2fa90b12db9
- Slack 종료/런칭 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1778658440071359
- XPC: https://xpc.dailyhou.se/experiments/2094
