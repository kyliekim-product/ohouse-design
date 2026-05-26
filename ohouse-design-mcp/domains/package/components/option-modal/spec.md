---
type: domain-component-spec
parent: domains/package/README.md
component: option-modal
topic: component-pattern
tier: 4
when-to-read: "PDP 패키지담기 옵션 선택 모달 설계·검증 시"
size: "~1.6k tokens"
status: draft
owner: Deeer
last_verified: 2026-05-21
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §6 옵션 선택 모달"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.10"
---

# Option Modal (옵션 선택 모달)

PDP에서 "패키지담기"를 누르면 열리는 하단 시트. 옵션을 선택해 *처음으로* 패키지에 담는 모달.

> **option-selector와 구분**: `option-modal`은 PDP에서 처음 담을 때. `option-selector`는 메인 카드에서 이미 담긴 상품 편집.

---

## 1. 정체성·역할

- PDP "패키지담기" 클릭 시 열리는 하단 시트
- **목적**: 옵션을 선택하고 패키지(및 선택 시 장바구니)에 담기

## 2. 구조

```
[옵션 드롭다운]   사이즈 드롭다운(강조 border) + 추가상품 드롭다운(기본 border)
[선택된 옵션]     옵션명 + X 삭제 + 수량 조절(−, N, +) + 정가(취소선)/쿠폰가
[가격 요약]       주문 금액 + 쿠폰 할인가
                  "결제할 때 쿠폰가에서 더 할인돼요" 안내
[토글]            "장바구니에 함께 담기" (기본 ON)
[CTA]             "나만의 패키지 담기" → 패키지 추가 + 확인 토스트(confirm-toast)
```

[출처: _commerce-ingest-raw §6]

## 3. 핵심 정책

- **장바구니 함께 담기 토글**: 기본 ON. 켜져 있으면 패키지와 장바구니에 동시 반영
- **패키지 할인가 계산 기준** (옵션 선택 상태별):
  - 옵션 모두 선택된 상품: 선택한 옵션 기준으로 마진 할인 계산 → 패키지 할인 적용
  - 옵션 미선택 상품: 대표옵션 기준으로 마진 할인 계산 → 패키지 할인 적용
- 담기 완료 시 확인 토스트(`confirm-toast`) 노출

[출처: _commerce-ingest §3.10]

## 4. 미해결·판단 필요

- [ ] "결제할 때 더 할인" 안내 문구의 할인율 산출 기준
- [ ] 사이즈 드롭다운 강조 border의 ODS 토큰 매핑
- [ ] Figma 대표 node URL

## 5. LLM 작업 시 주의사항

- ⚠️ `option-selector`(메인 카드 편집용)와 혼동 금지 — 본 패턴은 PDP 최초 담기용
- ⚠️ "장바구니 함께 담기" 토글 기본값 ON
- ⚠️ 담기 후 `confirm-toast` 연결 — maxmerge 트리거 경로 중 하나
- ⚠️ 수치보다 정책 — 가격·할인율 표기는 정책 단위, 정확 값은 런타임 산출

## ODS atoms 매핑

- ODS BottomSheet / Modal (하단 시트 컨테이너)
- ODS Select / Dropdown (사이즈·추가상품 드롭다운)
- ODS Toggle / Switch ("장바구니에 함께 담기")
- ODS Stepper 또는 직접 구성 (수량 조절)
- ODS Button (CTA)

정확한 컴포넌트·variant는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-21 | 초안 작성 | 공디님 `_commerce-ingest-raw.md §6` + `_commerce-ingest.md §3.10` distill |
