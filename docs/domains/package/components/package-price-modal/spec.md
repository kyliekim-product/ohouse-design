---
type: domain-component-spec
parent: domains/package/README.md
component: package-price-modal
topic: component-pattern
tier: 4
when-to-read: "패키지 할인가 보기 모달·할인 상세 내역 설계·검증 시"
size: "~1.8k tokens"
status: draft
owner: Deeer
last_verified: 2026-05-21
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §9 패키지 할인가 보기 모달"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.6"
---

# Package Price Modal (패키지 할인가 보기 모달)

메인 화면 CTA "패키지 할인가 보기"를 누르면 열리는 모달. 패키지로 구매할 때의 할인가와 *할인 상세 내역*을 보여줌.

---

## 1. 정체성·역할

- 구매 조건 충족 후 "패키지 할인가 보기" CTA로 진입
- **목적**: 패키지 구매가 vs 일반 구매가를 비교하고, 할인이 어디서 오는지 상세 내역으로 설득

## 2. 구조

```
[상품 영역 (토글)]   썸네일 스택 + "선택한 옵션이 맞는지 확인하세요" + "N개 상품" + 셰브론
                    펼치면 상품 목록 (썸네일 + 브랜드/상품명/옵션 + 가격, 스크롤)
[가격 영역]          "패키지로 구매하면" — 쿠폰+패키지 할인 적용가 (강조, 빨간 큰 텍스트)
                    "N원 더 아낄 수 있어요" + "(결제 수단에 따라 여기서 더 할인)"
[할인 상세 내역 (토글)] 상품쿠폰 / 장바구니쿠폰 / 패키지 / 시공상담 / 결제시 추가 할인
[그냥 구매하면]       할인 전 판매가 합계 + "판매가 기준"
[CTA]               "패키지 구매하기"
```

[출처: _commerce-ingest-raw §9]

## 3. 할인 상세 내역 정책

- **항목**: 상품 쿠폰 할인 / 장바구니 쿠폰 할인 / 패키지 할인 / 시공 상담 할인 / 결제시 추가 할인
- **0원 항목**: 미노출
- **총 할인금액(N원)** = 상품쿠폰 + 장바구니쿠폰 + 패키지할인 + 시공상담할인 + 브랜드할인 합계
- **N원 = 0**이면 할인 영역 자체를 숨김
- **시공 상담 할인**: 설치/시공 카테고리 상품이 있고, 유저가 시공 상담 신청을 완료했을 때 제공
- **결제시 추가 할인**: 금액이 아니라 *결제수단명* 표시 — 적용 가능한 혜택 결제수단 최대 2개 노출, 3개 이상이면 "등" 추가 (예: "네이버페이, 카카오페이 등")

[출처: _commerce-ingest §3.6, _commerce-ingest-raw §9]

## 4. 미해결·판단 필요

- [ ] 패키지 할인 vs 브랜드 할인의 상세 내역 표기 분리 여부 (브랜드할인이 합계에는 포함)
- [ ] 상품 영역 펼침 시 스크롤 영역 최대 높이의 ODS 토큰 매핑
- [ ] Figma 대표 node URL

## 5. LLM 작업 시 주의사항

- ⚠️ **0원 항목 미노출** — 자주 누락되는 케이스
- ⚠️ **결제시 추가 할인은 금액 아닌 결제수단명** — 다른 할인 항목과 표기 방식 다름
- ⚠️ 총 할인금액이 0이면 할인 영역 전체 숨김
- ⚠️ 수치보다 정책 — 가격은 런타임 산출, 본 문서는 노출 규칙 단위

## ODS atoms 매핑

- ODS BottomSheet / Modal (모달 컨테이너)
- ODS Text 또는 직접 typography (가격·할인 내역)
- ODS Icon (셰브론 — 토글 영역)
- ODS Button (CTA)

정확한 컴포넌트·variant는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-05-21 | 초안 작성 | 공디님 `_commerce-ingest-raw.md §9` + `_commerce-ingest.md §3.6` distill |
