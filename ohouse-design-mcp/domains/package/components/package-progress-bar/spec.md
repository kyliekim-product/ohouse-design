---
type: domain-component-spec
parent: domains/package/README.md
component: package-progress-bar
topic: component-variant
tier: 4
when-to-read: "글린다 패키지할인 메인 화면 하단 진행바·조건 충족 애니메이션 설계·검증 시"
size: "~1.8k tokens"
status: draft
owner: Deeer
last_verified: 2026-05-21
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §3-5 하단 영역"
  - "ohouse-design-context/patterns/_commerce-ingest.md §5.1"
---

# Package Progress Bar (progress-bar)

글린다 패키지할인 메인 화면 하단에서 *구매 조건 충족 진행 상황*을 보여주는 진행바. CTA 바와 한 묶음(`bottom-section`)으로 동작.

---

## 1. 정체성·역할

- 메인 화면 하단 고정 영역. 진행 문구 + 카테고리 슬롯(slot-pill)으로 구성
- **목적**: 구매 조건(서로 다른 카테고리 5개 이상·가구 2개 필수)까지 남은 양을 시각화하고, 충족 시 "더 담기" 유도

## 2. 구조

```
[bottom-section]
  [progress-bar  (z: 아래)]  ← 진행 문구 + slot-pill
  [bottom-section-cta (z: 위)]  ← 조합 저장 / 패키지 할인가 보기 CTA
```

- CTA 바가 progress-bar 위에 겹쳐, 슬라이드 애니메이션 시 칩이 CTA 뒤로 가려지는 연출에 사용
- slot-pill: **채워진 카테고리**(채움 스타일) + **빈 슬롯**(점선 스타일)

## 3. 상태별 표시

| 상태 | 진행 문구 | slot-pill |
|---|---|---|
| 조건 미충족 | "카테고리 5개부터 구매할 수 있어요 (가구 2개 필수)" | 채워진 칩 + 빈 슬롯 (점선) |
| 조건 충족 직후 | 3단계 애니메이션 (§4) | 채워진 5개 칩 → "+ 더 담기" 칩 추가 |

- **빈 슬롯 문구**: 가구가 더 필요하면 "가구", 그 외에는 "카테고리"

[출처: _commerce-ingest-raw §3-5, _commerce-ingest §5.1]

## 4. 조건 충족 3단계 애니메이션

구매 조건을 충족하는 순간 다음 3단계로 진행:

1. **(즉시)** 문구 → "✓ 이제 패키지 구매 가능!" + 채워진 5개 칩 노출
2. **(약 0.5초 후)** 문구·칩이 함께 아래로 슬라이드 — 칩만 CTA 바 뒤로 가려지고 문구는 보임 (ease-out)
3. **(약 0.8초 후)** 문구 변경 → "🔥 지금부터 모든 상품 최저가로 구매 가능" + "N원 더 담으면" 서브텍스트 + 칩에 "+ 더 담기" 추가 + 다시 위로 올라옴. 올라온 후 "+ 더 담기" 칩으로 자동 스크롤

> 타이밍·duration은 raw 프로토타입 기준 근사값. 정확한 모션 스펙은 Figma·프로토타입 실측 우선. [출처: _commerce-ingest-raw §3-5]

## 5. 미해결·판단 필요

- [ ] 애니메이션 정확한 duration·easing — ODS 모션 토큰 매핑 필요
- [ ] "N원 더 담으면" 서브텍스트의 금액 산출 기준
- [ ] 조건 충족 후에도 진행바 계속 노출되는지(더 담기 유도) vs 일정 시간 후 사라지는지
- [ ] Figma 대표 node URL

## 6. LLM 작업 시 주의사항

- ⚠️ progress-bar와 CTA 바는 `bottom-section` 한 묶음 — z-index 겹침이 슬라이드 연출의 핵심 (§2)
- ⚠️ 빈 슬롯 문구는 "가구"/"카테고리" 분기 — 남은 가구 필요 수에 따라 다름
- ⚠️ 3단계 애니메이션은 순서·타이밍이 의도된 연출 — 단계 생략 금지 (§4)
- ⚠️ 수치보다 정책 — spacing·duration은 토큰·실측 우선

## ODS atoms 매핑

- ODS Chip (slot-pill — 채움/점선 variant TBD)
- ODS Text 또는 직접 typography (진행 문구·서브텍스트)

정확한 컴포넌트·variant는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-21 | 초안 작성 | 공디님 `_commerce-ingest-raw.md §3-5` + `_commerce-ingest.md §5.1` distill |
