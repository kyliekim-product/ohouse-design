---
type: domain-component-spec
parent: domains/package/README.md
component: confirm-toast
topic: component-variant
tier: 4
when-to-read: "패키지 담기 확인 토스트·maxmerge 안내 문구 설계·검증 시"
size: "~1.4k tokens"
status: draft
owner: Deeer
last_verified: 2026-05-21
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §8 확인 모달 / §11 maxmerge"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.4"
---

# Confirm Toast (담기 확인 토스트)

상품을 패키지에 담은 직후 노출되는 확인 하단 시트. 일정 시간 후 자동으로 닫힘.

---

## 1. 정체성·역할

- 패키지 담기 액션 완료 직후 노출되는 하단 시트
- **목적**: 담기 결과를 확인시키고, 패키지/장바구니로 이동할 동선 제공
- 일정 시간(raw 기준 약 3초) 후 자동 닫힘

## 2. 구조

```
[타이틀]      담기 결과 안내 문구
[서브텍스트]  확인 유도 안내
[버튼]        "장바구니 가기" + "나만의 패키지 가기"
```

[출처: _commerce-ingest-raw §8]

## 3. 문구 정책 — maxmerge 반영

중복 상품 담기 로직(maxmerge) 변경에 따라 문구가 개정됨:

| 구분 | 타이틀 | 서브텍스트 |
|---|---|---|
| AS-IS | "나만의 패키지, 장바구니에 담았어요" | "가구 N개 포함, 5개 카테고리 이상 채우면 최저가 수준의 혜택을 받을 수 있어요" |
| **TO-BE** | **"상품을 패키지에 반영했어요"** | **"변경된 상품과 수량을 다시 한번 확인해 주세요"** |

> TO-BE 문구는 maxmerge 도입으로 "담았다"가 아니라 "수량이 병합·반영됐다"는 의미를 정확히 전달하기 위함. [출처: [PRD-[Commerce]-[2025H2]-Glinda 중복 상품 패키지 담기 로직 변경](https://docs.google.com/document/d/1-Tc5LtwzF7TGrY88UozzS3DNmeA4HlBxPwTkGWWWHPo/edit?tab=t.ddxcneo46ggz#heading=h.xgb5v7l4b0ux)]

## 4. 트리거

- PDP "패키지담기"로 담는 경우 (`option-modal` 경유)
- 장바구니에서 패키지로 담는 경우
- → 두 경로 모두 maxmerge 로직(동일 옵션 수량 max 병합)을 거침. 상세는 [`policies/glinda-package-discount.md`](../../policies/glinda-package-discount.md) §5 참조

## 5. 미해결·판단 필요

- [ ] 자동 닫힘 시간(약 3초)의 ODS 모션·타이밍 토큰 매핑
- [ ] AS-IS → TO-BE 문구 적용 시점 (maxmerge 릴리스와 연동)
- [ ] Figma 대표 node URL

## 6. LLM 작업 시 주의사항

- ⚠️ **문구는 TO-BE 기준** — maxmerge 반영. "담았어요"가 아니라 "반영했어요"
- ⚠️ 자동 닫힘 — 유저 액션 없이 사라지므로 핵심 정보는 짧고 명확하게
- ⚠️ 토스트라는 이름이지만 버튼 2개를 가진 하단 시트 형태 — 단순 스낵바와 구분

## ODS atoms 매핑

- ODS BottomSheet (하단 시트 컨테이너)
- ODS Text 또는 직접 typography (타이틀·서브텍스트)
- ODS Button (장바구니 가기 / 나만의 패키지 가기)

정확한 컴포넌트·variant는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-21 | 초안 작성 | 공디님 `_commerce-ingest-raw.md §8·§11` + `_commerce-ingest.md §3.4` distill |
