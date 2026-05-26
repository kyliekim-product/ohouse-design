---
type: domain-component-spec
parent: domains/package/README.md
component: brand-discount-banner
topic: component-variant
tier: 4
when-to-read: "글린다 패키지할인 상품 카드 브랜드 할인 배너·넛지 설계·검증 시"
size: "~1.6k tokens"
status: draft
owner: Deeer
last_verified: 2026-05-21
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §3-4 브랜드 할인 배너 / §10"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.3"
---

# Brand Discount Banner (브랜드 할인 배너)

글린다 패키지할인 상품 카드 하단에 노출되는 *브랜드 수량별 추가 할인* 유도 배너. 클릭 시 브랜드 할인 화면(`screens/brand-discount`)으로 진입.

> 관련 화면: [`screens/brand-discount`](../../screens/brand-discount/README.md) — 배너 클릭 후 도착하는 상세 화면

---

## 1. 정체성·역할

- 상품 카드(`product-item-package`) 하단에 붙는 조건부 배너
- **목적**: 같은 브랜드 상품을 더 담으면 추가 할인이 커진다는 것을 카드 맥락에서 넛지
- **노출 조건**: 카드 상품의 브랜드가 글린다 브랜드 할인 프로모션 대상일 때만

## 2. 레이아웃·구조

```
[상품 카드 ────────────────]
[──── 브랜드 할인 배너 (썸네일 제외 가로 풀) ────]
```

- **위치**: 상품 카드 하단, 썸네일 영역을 제외한 가로 풀 너비 (텍스트 영역과 좌측 정렬)
- **스타일**: 연한 파란 배경 — `backgroundBrandWeak` 토큰 (Figma 실측 #f0f8fc). 작은 텍스트 + 셰브론
- **문구**: "이 브랜드 2개 이상 구매시, **{최소~최대}% 더 할인**"

[출처: _commerce-ingest-raw §3-4]

## 3. 할인율 표기 규칙

- ⚠️ **할인율은 고정값이 아님** — 브랜드별 구매 수량 단계표의 min/max에서 산출
- 예: 2개 5% · 3개 10% · 4개+ 15% → 배너에는 "5~15%"로 표기
- 단계별 할인율(쿠폰 적용가 기준): 2개 개당 5% / 3개 개당 10% / 4개 이상 개당 15%

[출처: _commerce-ingest §3.3, [브랜드할인 MVP 기획서](https://docs.google.com/document/d/1pf1-9_D1H6zh8_7RDYKTunPbLC5cuQ-q-OvUNLscfwI/edit?tab=t.0#heading=h.8jprid95ty4d)]

## 4. 동작

| 영역 | 액션 |
|---|---|
| 배너 전체 | 브랜드 할인 상세 화면(`screens/brand-discount`) 진입 |

## 5. 대상 브랜드

- 프로모션 기반으로 매번 변경 (MD·사업팀 지정)
- 해당 브랜드의 상품이 패키지에 담겨 있을 때만 배너 노출
- 상품카드 브랜드할인 넛지 관련: [COMMPO-1057](https://ohouse.atlassian.net/browse/COMMPO-1057)

## 6. 관련 — 메인 하단 브랜드 섹션 ("지면4")

메인 화면 최하단에는 브랜드별 가로 스크롤 섹션이 별도로 존재 (팀 내부 명칭 "지면4"):
- 서브텍스트: "2개 이상 구매하면 쿠폰가에서 더 할인" 또는 "나만의패키지에서만 가능해요"
- 라벨: "{브랜드명} 브랜드 할인받기" + 셰브론
- 브랜드별 가로 스크롤 썸네일

> 이 하단 섹션은 `screens/package-home`의 화면 구조에 포함. 본 컴포넌트(카드 하단 배너)와 진입 목적지(브랜드 할인 화면)는 동일. [출처: _commerce-ingest-raw §10-4]

## 7. 미해결·판단 필요

- [ ] 카드 하단 배너와 메인 하단 "지면4" 섹션을 같은 컴포넌트로 볼지, 분리할지
- [ ] 대상 브랜드 목록의 최신성·관리 주체
- [ ] Figma 대표 node URL

## 8. LLM 작업 시 주의사항

- ⚠️ **할인율 고정값 X** — 브랜드별 단계표 min/max로 산출 (§3)
- ⚠️ 조건부 노출 — 프로모션 대상 브랜드일 때만 (§1·§5)
- ⚠️ 배경색은 `backgroundBrandWeak` 토큰 — 하드코드 hex 금지
- ⚠️ 수치보다 정책 — spacing·typography는 ODS MCP·Figma 실측 우선

## ODS atoms 매핑

- ODS Text 또는 직접 typography (배너 문구)
- ODS Icon (셰브론 — ChevronRight 계열, variant TBD)
- 배경: `backgroundBrandWeak` 토큰

정확한 컴포넌트·variant는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-21 | 초안 작성 | 공디님 `_commerce-ingest-raw.md §3-4·§10` + `_commerce-ingest.md §3.3` distill |
