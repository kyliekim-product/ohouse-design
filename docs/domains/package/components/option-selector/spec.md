---
type: domain-component-spec
parent: domains/package/README.md
component: option-selector
topic: component-pattern
tier: 4
when-to-read: "글린다 패키지할인 상품 카드 옵션 셀렉터 바텀시트 설계·검증 시"
size: "~2k tokens"
status: draft
owner: Deeer
last_verified: 2026-05-21
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §7 옵션 셀렉터"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.5·§5.3"
---

# Option Selector (옵션 셀렉터)

패키지 메인 화면 상품 카드의 *옵션 영역*을 클릭하면 열리는 바텀시트. 이미 패키지에 담긴 상품의 옵션을 편집하는 **글린다 전용** 패턴.

> **option-modal과 구분**: `option-modal`은 PDP "패키지담기" 시 *처음 담을 때* 옵션 선택. `option-selector`는 메인 카드에서 *이미 담긴 상품*의 옵션 편집.

---

## 1. 정체성·역할

- 상품 카드 옵션 영역 클릭 시 열리는 바텀시트
- **목적**: 패키지에 담긴 상품의 필수옵션·추가옵션·수량·조립설치를 편집
- 글린다 전용 — 커머스 공통 옵션 UI와 별개

## 2. 구조

```
[상품 정보 영역]  브랜드명 / 상품명 / 배송비 정보
[옵션 드롭다운]   옵션1(필수) / 옵션2(필수, 있으면) / 추가상품(있으면)
[선택된 옵션 목록] 옵션명 + 수량조절(−, N, +) + 가격
                  조립/설치 신청 체크박스 + 안내
                  주문 메모 입력 필드 (있으면)
[하단]            상품 금액(선택 옵션 합계) + 취소 / 저장
```

- 품절·판매종료 옵션은 드롭다운에서 비활성 표시
- 상품 금액 = 선택된 옵션들의 합계

[출처: _commerce-ingest-raw §7]

## 3. 핵심 정책

- **필수옵션 우선**: 필수옵션(옵션1) 선택 후에만 추가상품 선택 가능. 미선택 상태로 추가상품 시도 시 "필수옵션을 먼저 선택해주세요" 얼럿
- **필수옵션 삭제 시 연쇄 삭제**: 필수옵션을 삭제하면 함께 추가된 추가옵션도 삭제 — confirm 얼럿 "필수옵션을 삭제하면 함께 추가된 추가옵션도 삭제됩니다"
- **옵션 표기 (카드 반영)**: 첫 번째 필수옵션명만 상품 카드에 노출. 추가 옵션이 있으면 "{옵션명} 외 N개" — 한 줄 초과 시 옵션명만 말줄임, "외 N개"는 항상 노출
- **조립/설치비**: 배송비 무료 조건에 불포함. 비용은 별도 상담 후 책정 케이스 있음

[출처: _commerce-ingest §3.5]

## 4. 상태별 표시

| 상태 | 옵션 셀렉터 동작 |
|---|---|
| 옵션 선택 완료 | 선택된 옵션 목록 노출, 합계 금액 표시 |
| 옵션 미선택 | 드롭다운만 노출, 선택 항목 없음, 상품 금액 0원 |
| 옵션 일부 품절 | 품절 옵션에 "품절" 태그 + 비활성, 나머지 선택 가능 |
| 상품 품절(판매종료) | 옵션을 확인할 수 있는 진입 자체 없음 |

[출처: _commerce-ingest §5.3]

## 5. 미해결·판단 필요

- [ ] 메모 옵션(주문 메모) 노출 조건 — 상품별 다름
- [ ] 조립/설치 서비스 안내 문구의 상품별 분기 기준
- [ ] Figma 대표 node URL (`_commerce-ingest §7 node-id=7202-183480` 참고)

## 6. LLM 작업 시 주의사항

- ⚠️ **필수옵션 우선 규칙** — 필수옵션 미선택 시 추가상품 차단 (§3)
- ⚠️ **연쇄 삭제 confirm** — 필수옵션 삭제는 추가옵션까지 삭제, 반드시 confirm
- ⚠️ `option-modal`(PDP 패키지담기용)과 혼동 금지 — 본 패턴은 이미 담긴 상품 편집용
- ⚠️ 카드 옵션 표기는 "외 N개" 규칙 — `product-item-package` §4와 일관
- ⚠️ 수치보다 정책 — spacing·typography는 ODS MCP·Figma 실측 우선

## ODS atoms 매핑

- ODS BottomSheet / Modal (바텀시트 컨테이너 — variant TBD)
- ODS Select / Dropdown (옵션 드롭다운)
- ODS Checkbox (조립/설치 신청)
- ODS TextField (주문 메모)
- ODS Stepper 또는 직접 구성 (수량 조절)
- ODS Button (취소 / 저장)

정확한 컴포넌트·variant는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-21 | 초안 작성 | 공디님 `_commerce-ingest-raw.md §7` + `_commerce-ingest.md §3.5·§5.3` distill |
