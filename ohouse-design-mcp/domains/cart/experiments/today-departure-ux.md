---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-05-26 ~
key_date: 2026-05-26
key_date_type: started
variants:
  - 'A (기존 "오늘출발 마감 {date} 발송 예정" 부정 문구)'
  - 'B (PDP와 동일한 "지금 주문시 {date} 출발" 긍정 문구 + info 아이콘)'
winner: null
result: inconclusive
summary: "장바구니 오늘출발 마감 시 부정적 문구를 PDP와 동일한 긍정적 발송 예정일 안내로 통일하고, info 아이콘으로 오늘출발 서비스 툴팁 제공."
result_summary: "실험 진행 중. PDP는 마감 이후 CVR +16.48% 상승하는데 장바구니는 변화 없음 → 갭 해소 목표."
insight: "장바구니가 PDP보다 마감 이후 구매 전환에 둔감한 이유는 부정 문구('기회를 놓쳤다' 인식). 동일 정보라도 긍정적 프레이밍으로 바꾸면 구매 확신 유지 가능."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1779775644236979
  notion: https://www.notion.so/368a597878a0808ebd66f74651c60a8e
  prd: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
  figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
  xpc: https://xpc.dailyhou.se/experiments/2211
team: Commerce
owner: Daisy
---

# 장바구니 오늘출발 UX 개선

## 배경
- 현재 장바구니는 오늘출발 마감 시 "오늘출발 마감 {month/day(date)} 발송 예정" 부정 문구를 노출 → 유저는 "기회를 이미 놓쳤다"는 인식
- 반면 PDP는 동일 상황에서 "지금 주문시 내일출발"이라는 긍정 표현 사용
- 실제 데이터: PDP는 마감 이후 구매전환율 +16.48% 상승, 장바구니는 거의 변화 없음
- 동일 시점·동일 상품에 대해 PDP-장바구니가 다른 메시지를 전달하는 일관성 문제

## 가설
장바구니에서도 마감 이후 발송 예정일을 직관적으로 안내하는 긍정적 문구와 오늘출발 서비스 info를 제공하면, 마감 이후 시간대의 장바구니 구매 전환율이 상승할 것이다.

## 해결 방향
- 오늘출발 마감 시 PDP와 동일한 발송 예정일 문구로 통일: "지금 주문시 {date} 출발 ℹ️"
- info 아이콘 선택 시 오늘출발 서비스 안내 툴팁 제공

## 결과 (진행 중)

| 지표 | 변화 | 유의성 |
|---|---|---|
| (오늘출발 마감 상품) 장바구니 to 구매전환율 | 측정 중 | - |
| (전체) 장바구니 to 구매전환율 | 측정 중 | - |
| (전체) 장바구니 to 주문서 전환율 | 측정 중 | - |
| Buyer Conversion / GMV per Customer | 가드레일 | - |

→ 실험 진행 중. QA 완료 후 운영 실험 진행 중 (운영 노션 기록: B100으로 통합 진행 방향).

## 인사이트

**동일 정보라도 프레이밍이 다르면 전환에 큰 차이. PDP-장바구니 메시지 일관성 자체가 전환 손실 요인.**

- PDP에서 "지금 주문시 내일출발"로 구매 확신을 가졌던 유저가 장바구니에서 "오늘출발 마감"을 보면 인식 단절 발생
- 부정적 마감 표현 → 긍정적 다음 발송일 안내로 전환 시 구매 확신 유지

## 출처
- 노션: https://www.notion.so/368a597878a0808ebd66f74651c60a8e
- Slack 시작 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1779775644236979
- PRD: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
- Figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
