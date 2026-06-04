---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-05-26 ~
key_date: 2026-05-26
key_date_type: started
variants: [A (특별인증가 뱃지 없음), B (특별인증가 + info 뱃지 단독), C (특별인증가 + "온라인 최저가" 문구 결합)]
winner: null
result: inconclusive
summary: "PDP/PLP에 노출되는 '특별인증가' 뱃지를 장바구니 상품 영역에도 노출하여, 구매 결정 최종 단계에서 가격 신뢰 시그널을 강화."
result_summary: "실험 진행 중. Stage=Launched(ABT 중). 상위 1% 상품의 62.8%가 특별인증가 → 노출 트래픽 38% 커버."
insight: "특별인증가는 전체 상품의 15%지만 노출 트래픽의 38%를 차지(평균 임프레션 3.6배). 장바구니 뱃지는 꼬리에 뿌리는 기능이 아니라 핵심 상품 정조준 넛징."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1779775607334329
  notion: https://www.notion.so/350a597878a0801b88d7eeccfc54a1a8
  prd: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
  figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
  xpc: https://xpc.dailyhou.se/experiments/2181
team: Commerce
owner: Daisy
---

# 장바구니 특별인증가 뱃지 넛징

## 배경
- 오늘의집은 네이버 최저가 검수 및 자체 검수로 검증된 상품에 '특별인증가' 뱃지를 PDP/PLP에 노출
- 그러나 구매 결정의 최종 검토 단계인 장바구니에서는 동일 정보가 전혀 표기되지 않음
- 유저는 장바구니에서 가격 경쟁력을 재확인할 수 없어 타 플랫폼 이동·PDP 재탐색 과정에서 이탈/보류 가능성 ↑

## 가설
'특별인증가'라는 가격 검증 신뢰 시그널을 장바구니에서도 명확히 노출하면, 유저의 가격 신뢰도와 구매 확신이 높아져 결제 전환율이 상승할 것이다.

## 해결 방향
- 장바구니 담은 옵션이 특별인증가인 경우 '특별인증가 + info' 뱃지를 상품 영역에 노출 (B)
- info 아이콘 선택 시 최저가 안내 툴팁
- C안은 특별인증가 뱃지가 단독 노출될 때 '온라인 최저가' 문구 결합

## 결과 (진행 중)

| 지표 | 변화 | 유의성 |
|---|---|---|
| (특별인증가 상품) 장바구니 to 구매전환율 | 측정 중 | - |
| (전체) 장바구니 to 구매전환율 | 측정 중 | - |
| (전체) 장바구니 to 주문서 전환율 | 측정 중 | - |
| Buyer Conversion / GMV per C | 가드레일 | - |

→ 실험 진행 중 (Stage=Launched ABT 중).

## 인사이트

**특별인증가 = 핵심 상품에 정조준되는 넛징. 상품수 기준 15%지만 임프레션 38% 커버 → 평균 임프레션 일반 상품의 3.6배.**

- 상위 20% 상품이 전체 노출의 79.6% 차지(파레토 구조)
- 상위 1% 상품의 62.8%가 특별인증가 (전체 평균 8.9%의 7배)
- 상위 10% 내 특별인증가 임프레션 비중 48.3% → 고객 관심 집중 구간일수록 특별인증가일 확률 압도적
- 장바구니 뱃지는 꼬리 상품에 흩뿌리는 기능이 아니라, 고객 관심이 쏠리는 핵심 상품을 정조준하는 넛징

## 출처
- 노션: https://www.notion.so/350a597878a0801b88d7eeccfc54a1a8
- Slack 시작 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1779775607334329
- PRD: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
- Figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
