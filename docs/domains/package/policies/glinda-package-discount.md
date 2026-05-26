---
type: domain-policy
domain: package
scope: glinda-package-discount-pilot
tier: 3
when-to-read: "패키지 도메인에서 글린다 패키지할인 관련 설계·검토·Query 시"
size: "~3k tokens"
deps:
  - knowledge/principles.md
owner: Deeer
last_verified: 2026-04-30
sources:
  - "ohouse-design-context/patterns/_commerce-ingest.md (표준 ingest, 공디님 정리)"
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md (raw 정리본)"
---

# Glinda Package Discount

> 현 시점 스코프: **글린다 패키지할인 (Glinda Package Discount)** 한정. 패키지 도메인의 다른 영역이나 단일 상품 PDP·결제·검색·찜 등은 본 문서 범위 아님.

## 1. 정체성·범위

- **한 줄 정의**: 서로 다른 카테고리 5개 이상(가구 2개 필수)을 한 패키지로 묶어 추가 할인을 받는 서비스
- **포함 범위**: 패키지할인 메인 화면 / 상품 리스트 / 옵션 셀렉터(글린다 전용) / 패키지 할인가 모달 / 브랜드 할인 / maxmerge 로직
- **제외 범위**: 단일 상품 PDP·결제 등 커머스 공통 영역 (본 문서 범위 아님)

## 2. 도메인 고유 디자인 원칙

1. **할인 강조 색상 일관**: 할인율은 critical 색상 토큰(빨간색 계열) 으로 강조 — 사용자 인지 강화 의도
2. **로그인 후 사용**: 전 화면 로그인 유저만 이용 가능, 전 화면 웹뷰 구현
3. **reco-card 기준은 추가된 상품**: 선택/체크 기준 X — 자주 헷갈리는 지점

## 3. 핵심 컴포넌트 (도메인 variant)

자세한 spec 은 sub 참조. 본 진입 인덱스는 카탈로그 역할만.

| 컴포넌트 | 타입 | 역할 |
|---|---|---|
| [`product-item-package`](../components/product-item-package/spec.md) | component | 패키지 메인 화면 안 상품 카드 |
| [`package-reco-card`](../components/package-reco-card/spec.md) | component | 카테고리 추천 카드 (추가된 상품 기준 매트릭스) |
| [`package-progress-bar`](../components/package-progress-bar/spec.md) | component | 하단 진행바 + 조건 충족 3단계 애니메이션 |
| [`brand-discount-banner`](../components/brand-discount-banner/spec.md) | component | 상품 카드 하단 브랜드 할인 넛지 배너 |
| [`option-selector`](../components/option-selector/spec.md) | pattern | 메인 카드 옵션 편집 바텀시트 (글린다 전용) |
| [`option-modal`](../components/option-modal/spec.md) | pattern | PDP 패키지담기 옵션 선택 모달 |
| [`package-price-modal`](../components/package-price-modal/spec.md) | pattern | 패키지 할인가 보기 모달 |
| [`confirm-toast`](../components/confirm-toast/spec.md) | component | 담기 확인 토스트 (maxmerge 문구) |

## 4. 상태 처리

> 공통 디폴트는 `knowledge/principles.md`와 ODS 기준을 우선. 패키지 도메인 고유만:

- **Empty (패키지할인 메인)**: 상품 0개일 때 일러스트 + "상품을 추가해보세요" + CTA 비활성화
- **옵션 미선택**: 빨간색 텍스트, 드롭다운 화살표 항상 표시. 자주 검증 누락되는 케이스
- **CTA 비활성화 분기**: "조합 저장"(상품 1개+) / "패키지 할인가 보기"(구매조건 충족) 두 조건 다름

자세한 표·문구는 `ohouse-design-context/patterns/_commerce-ingest.md` §5 참조.

## 5. 도메인 고유 정책

핵심 정책만 함축. 자세한 매트릭스는 `ohouse-design-context/patterns/_commerce-ingest.md` §3 참조.

- **구매 조건**: 카테고리 5개 이상 (서로 다른 2depth) + 가구 2개 필수 [출처: _commerce-ingest §3.1]
- **브랜드 할인 (수량별)**: 2개 5% / 3개 10% / 4개+ 15% — 쿠폰 적용가 기준. 최소 50만원·최대 1,000만원·예산 소진 시 종료 [출처: [브랜드할인 MVP 기획서](https://docs.google.com/document/d/1pf1-9_D1H6zh8_7RDYKTunPbLC5cuQ-q-OvUNLscfwI/edit?tab=t.0#heading=h.8jprid95ty4d)]
- **maxmerge (중복 상품 담기)**: 동일 옵션 → 수량 max, 신규 → 추가, 메모옵션 → update [출처: [PRD-[Commerce]-[2025H2]-Glinda](https://docs.google.com/document/d/1-Tc5LtwzF7TGrY88UozzS3DNmeA4HlBxPwTkGWWWHPo/edit?tab=t.ddxcneo46ggz#heading=h.xgb5v7l4b0ux)]
- **할인 상세 0원 항목 미노출**
- **조합 탭**: 최대 5개 → 10개 확장 예정 / 조합당 옵션 최대 30개

## 6. 주요 인터랙션

- **상품 카드 영역별 클릭 분리**: 썸네일·체크박스 → 토글 / 브랜드명·상품명·가격 → PDP / 옵션 → 옵션 셀렉터 / X → 삭제. 매우 세밀하게 분리됨
- **조건 충족 3단계 애니메이션**: 즉시 → 500ms 후 슬라이드 → 800ms 후 문구 변경 + 더 담기 칩 등장 + 자동 스크롤
- **maxmerge 트리거**: PDP "패키지담기" / 장바구니에서 패키지로 담기

## 7. 주요 지면 (시간축)

### Current (프로덕션)
- 패키지할인 메인 / 상품 리스트 / 옵션 셀렉터 / 할인가 모달 / 브랜드 할인 화면

### Next (개발 중)
- maxmerge 로직 변경 — AS-IS "장바구니에 담았어요" → TO-BE "상품을 패키지에 반영했어요" [출처: PRD-[Commerce]-[2025H2]-Glinda]
- 조합 탭 5개 → 10개 확장
- 조합명 수정 기능 추가

### Planned (로드맵)
- (TBD — 공디님 인계 자료에서 명시 안 됨)

## 8. 권위 있는 참조

### Figma
- (TBD — 글린다 메인 Figma 노드. 공디님 인계 자료에 일부 노드 링크 있음, _commerce-ingest §5.4 참조)

### PRD / 기획
- [브랜드할인 MVP 기획서](https://docs.google.com/document/d/1pf1-9_D1H6zh8_7RDYKTunPbLC5cuQ-q-OvUNLscfwI/edit?tab=t.0#heading=h.8jprid95ty4d)
- [PRD-[Commerce]-[2025H2]-Glinda 중복 상품 패키지 담기 로직 변경](https://docs.google.com/document/d/1-Tc5LtwzF7TGrY88UozzS3DNmeA4HlBxPwTkGWWWHPo/edit?tab=t.ddxcneo46ggz#heading=h.xgb5v7l4b0ux)
- 추천 카테고리 로직 [COMMPO-1650](https://ohouse.atlassian.net/browse/COMMPO-1650)
- 상품카드 브랜드할인 넛지 [COMMPO-1057](https://ohouse.atlassian.net/browse/COMMPO-1057)

### 정책 담당자
- (TBD — 공디님 인계 자료에 명시 없음. [GLINDA] 백로그 관리 시트에서 추적 가능)

## 9. LLM 작업 시 주의사항

- ⚠️ **스코프**: 현 시점 *글린다 패키지할인 한정*. 단일 상품 PDP·결제 등 커머스 공통 영역은 범위 아님
- ⚠️ **reco-card 기준**: *추가된 상품 기준*, 선택/체크 기준 X
- ⚠️ **상품 카드 영역별 클릭 분리** 매우 세밀 — 일반화 금지
- ⚠️ **CTA 두 종류 분리**: "조합 저장" / "패키지 할인가 보기" 비활성화 조건 다름
- ⚠️ **수치보다 정책·토큰명**: 정확한 픽셀 값은 ODS MCP 또는 Figma 실측 우선. 본 문서는 정책·맥락 단위
- ⚠️ **상품 삭제 분기**: 전체 선택 vs 일부 선택 vs 카드 X 아이콘 — 각 confirm 문구 다름

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-04-30 | 커머스 트랙 진입 인덱스 초안 작성 | 공디님 `_commerce-ingest.md` 표준 ingest 받아서 distill 시작. 글린다 패키지할인 한정 스코프. components / modules / sections / screens sub 는 점진적으로 |
| 2026-05-15 | product-design Package 도메인으로 이관 | `tracks/commerce.md` → `domains/package/policies/glinda-package-discount.md` |
| 2026-05-21 | GitLab bucketplace-knowledge 이관 + 잔여 컴포넌트 7종 distill | reco-card·progress-bar·brand-discount-banner·option-selector·option-modal·package-price-modal·confirm-toast 추가 |
