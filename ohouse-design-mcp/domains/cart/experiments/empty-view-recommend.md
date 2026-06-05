---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-05-04 ~
key_date: 2026-05-06
key_date_type: started
variants: [A (기존 엠티뷰), B (최근 본 상품 모듈), C (오늘의딜 상품 모듈), D (스타일링샷 광고 상품 모듈)]
winner: null
result: inconclusive
summary: "빈 장바구니 진입 유저(일 평균 4.44%)에게 단순 '상품 담으러가기' CTA만 노출되던 엠티뷰에 상품 추천 모듈을 추가."
result_summary: "실험 진행 중. D안(스타일링샷광고) 구매전환율 +2.52%(p=0.12)로 가장 우세하나 모수 부족 → C안(오늘의딜) 광고이익 +3.42%(p=0.05) 유의 → C안 런칭 제안 (DA)."
insight: "엠티뷰 추천 상품은 별로일 것이라는 가설은 기각. 봤던 것 확신주기(B-최근본상품)는 PDP 전환만 도움, 새로운 것 탐색하게 해주기(C/D)가 광고이익·다양성 측면에서 우세."
sources:
  slack: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1778034808413429
  notion: https://www.notion.so/352a597878a08068a29ef46e8da606da
  prd: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
  figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
  xpc: https://xpc.dailyhou.se/experiments/2179
team: Commerce
owner: Kaya
---

# 장바구니 엠티뷰 내 상품 추천

## 배경
- 일별 장바구니 진입 유저 중 평균 4.44%(2주 11만명)가 빈 장바구니 화면을 봄
- 현재는 '상품 담으러가기' CTA만 노출
- 빈 장바구니를 본 유저 중 48%는 직후 탐색형 쇼핑 페이지(쇼핑홈, PDP, 기획전 등)로 이동 → 적절한 상품 추천으로 탐색 비용 절감 기대

## 가설
- **B(최근 본 상품)**: 진입 직전 관심 맥락을 이어받아 재탐색 비용 ↓
- **C(오늘의딜)**: 별도 탐색 없이도 좋은 가격 상품을 바로 발견
- **D(스타일링샷 광고)**: 실제 연출 컨텍스트로 인테리어 욕구 자극

## 해결 방향
- A(AS-IS): 기존 엠티뷰
- B: 최근 본 상품 모듈 추가
- C: 오늘의딜 상품 모듈 추가
- D: 스타일링샷 기반 상품 광고 모듈 추가

## 결과 (진행 중 / DA C안 런칭 제안)

| 지표 | B (최근본) | C (오늘의딜) | D (광고) |
|---|---|---|---|
| 엠티뷰 상품 CTR | 26.7% | 4.14% | 8.61% |
| PDP PV 전환율 | +0.79% (p=0.04) | -0.11% (p=0.79) | +0.36% (p=0.35) |
| 구매전환율 | +0.94% (p=0.56) | -0.22% (p=0.89) | +2.52% (p=0.12) |
| 장바구니 GMV | -5.77% (p=0.07) | -2.08% (p=0.51) | -5.91% (p=0.07) |
| 광고이익 | +1.62% (p=0.36) | **+3.42% (p=0.05)** | +2.13% (p=0.18) |

→ B/D는 장바구니 GMV 유의 근접 하락, C만 GMV neutral + 광고이익 유의 상승 → **DA C안 런칭 제안**.

## 인사이트

**고객 탐색은 두 갈래. '봤던 것 확신주기'(B) vs '새로운 것 탐색하게 해주기'(C/D). 빈 장바구니에서는 탐색 다양성 쪽이 우세.**

- B(최근본상품)은 자기 지면 CTR 26.7%로 최고지만 다른 지면의 탐색을 방해
- C(오늘의딜)은 [전체보기]로 다른 페이지 이동 → 카테고리·PDP·검색을 통해 더 많은 유저가 더 다양한 PDP에서 상품상세 추천광고 클릭
- D(광고)는 장바구니 스타일링샷에서 클릭 ↑지만 오가든 추천에서 클릭 ↓ → 광고이익 변화 없음
- "엠티뷰 추천 상품이 별로일 것" 가설 기각 (C 제외 모두 엠티뷰 CTR이 쇼핑홈보다 높음)

## 디자인 고려사항
1. **추천 콘텐츠 성격**: 개인화(최근본) > 가격 트리거(오늘의딜) > 인테리어 영감(광고) 중 '엠티뷰 진입자' 의도와 맞는 건 무엇인가
2. **타 지면 탐색 방해 여부**: 같은 화면에서 보여주는 상품 수와 종류, 이탈 동선(별도 페이지 이동 vs 인라인) 고려

## 출처
- 노션 인사이트: https://www.notion.so/352a597878a08068a29ef46e8da606da
- Slack 시작 공지: https://ohou-se.slack.com/archives/C06QW7LAVPS/p1778034808413429
- PRD: https://docs.google.com/document/d/15SMaZM16-B4YfeB3cHBcC61Y66FmVmpLL25XN2AypdI/edit
- Figma: https://www.figma.com/design/JZDE8DeiYUislHI9HB1zUX
