---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-05-18 ~
key_date: 2026-05-18
key_date_type: started
variants: [A (장바구니 내 쿠폰 다운로드 미제공), B (쿠폰 다운로드 제공, 쿠폰리스트 미노출), C (쿠폰 다운로드 제공, 쿠폰리스트 노출)]
winner: null
result: inconclusive
summary: "장바구니에서 적용 가능한 쿠폰 전체를 일괄 다운로드할 수 있는 버튼을 제공. 쿠폰리스트 노출 여부로 B/C 비교."
result_summary: "실험 진행 중. 2026-05-18~19 비공개형 쿠폰 다운로드 버그로 일시 중단 → 로직 재검토 및 QA 후 6/1~ 재개."
insight: "장바구니에서 쓸 수 있는 쿠폰을 전부 다운로드할 방법이 없어 유저가 PDP를 왕복하며 탐색. 쿠폰을 인지하지 못한 유저는 적용 전 가격으로 판단 → 가격 경쟁력이 있어도 구매 전환 못함."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1779081808300559
  notion: https://www.notion.so/350a597878a080cea982d0b5f3044c86
  prd: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
  figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
  xpc: https://xpc.dailyhou.se/experiments/2196
team: Commerce
owner: Kaya
---

# 장바구니 내 쿠폰 다운로드 버튼

## 배경
- 현재 장바구니에서 쓸 수 있는 쿠폰을 전부 다운로드할 방법이 없어, 유저가 쿠폰 탐색을 위해 장바구니를 이탈하며 PDP를 불필요하게 왕복
- 쿠폰을 인지하지 못한 유저는 쿠폰 적용 전 가격으로 구매 판단 → 가격 경쟁력이 있어도 구매 전환 못함
- 2025년부터 장바구니 내 쿠폰 다운로드 VOC가 꾸준히 인입

## 가설
장바구니 내에서 적용 가능한 쿠폰 전체를 다운로드할 수 있다면, 쿠폰 탐색을 위한 이탈이 줄고 할인 혜택을 인지한 유저의 결제 전환율이 높아질 것이다.

## 해결 방향
- **A**: 쿠폰 다운로드 미제공 (AS-IS)
- **B**: 쿠폰 다운로드 제공 (쿠폰리스트 미노출)
- **C**: 쿠폰 다운로드 제공 (쿠폰리스트 노출)

## 결과 (진행 중)

| 지표 | 변화 | 유의성 |
|---|---|---|
| 장바구니 to 구매전환율 | 측정 중 | - |
| Buyer Conversion / GMV/C / 광고+커머스 합계이익 | 가드레일 | - |

→ 실험 진행 중. 5/18~5/19 비공개형 쿠폰이 의도치 않게 다운로드되는 버그로 일시 중단(약 3.7만건 오발행, 미사용 회수 완료) → 로직 재검토 및 QA 후 6/1~ 재시작 예정.

## 인사이트

**쿠폰 정보 접근성이 결제 전환을 막는 핵심 마찰점. 장바구니 단계에서 일괄 다운로드만 가능해져도 PDP 왕복 마찰 제거 + 가격 인지 효과 동시 기대.**

- XPC 2124 (장바구니 쿠폰 할인가 표기)와 동선 연결: 할인가 노출 → 다운로드 액션
- 쿠폰 적용가 인지 → 가격 신뢰 → 결제 전환의 가격 기반 동선 완성

## 디자인 고려사항
1. **쿠폰리스트 노출 여부** (B vs C) — 리스트로 보여줄 때 정보 과부하 vs 한 번에 다운로드만 가능할 때 투명성 부족 → 실험으로 판단
2. **비공개형 쿠폰 처리** — 배너 노출은 다운로드형만 집계되나 다운로드 액션에 비공개 포함되는 버그 발생 → 비공개/공개 명확히 분리 필요

## 출처
- 노션: https://www.notion.so/350a597878a080cea982d0b5f3044c86
- Slack 시작 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1779081808300559
- PRD: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
- Figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
