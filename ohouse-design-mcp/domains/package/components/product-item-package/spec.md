---
type: domain-component-spec
parent: domains/package/README.md
component: product-item-package
topic: component-variant
tier: 4
when-to-read: "글린다 패키지할인 안 상품 카드 (패키지 메인 화면 안) 설계·검증 시"
size: "~2.5k tokens"
status: verified
owner: Deeer
last_verified: 2026-04-30
sources:
  - "ohouse-design-context/patterns/_commerce-ingest-raw.md §3-4 상품 카드 (product-item)"
  - "ohouse-design-context/patterns/_commerce-ingest.md §3.5·§3.7·§3.8·§5.1·§5.2"
---

# Product Item — Package (패키지 도메인)

글린다 패키지할인 안 *상품 카드* 의 도메인 컴포넌트 spec. 패키지 메인 화면 (상품 탭·조합 탭) 에서 사용.

> **3계층 경계**
> - **ODS atoms**: Checkbox·Icon·Badge·Text 등 — ODS Library 참조 (정확한 매핑은 §"ODS atoms 매핑")
> - **공통 패턴**: 카드 flex 레이아웃 — 일반 패턴
> - **도메인 고유 조합** — 본 문서 (atom 을 글린다 맥락에 맞게 배치하는 규칙)

---

## 1. 사용처 (위치별)

| 위치 | 카드 형태 | 본 문서 범위 |
|---|---|---|
| **패키지 메인 화면 (상품 탭·조합 탭)** | 가로 배치 (썸네일 좌·정보 우·X 우끝) | ✅ 본 문서 주 영역 |
| 상품 리스트 화면 (add-product) | 2열 그리드 (별도 spec) | ❌ 범위 외 (별도 컴포넌트 후보 — §7) |
| PDP·옵션 모달 안 상품 표기 | 또 다른 contexts | ❌ 범위 외 (글린다 한정 vs 공통 미정 — §7) |

## 2. 레이아웃·구조

```
[썸네일(체크박스 좌상단)]  [브랜드 + 상품명] ───────  [X 삭제(우상단)]
                          [옵션 ▼]
                          [가격  쿠폰뱃지]
[──────  브랜드 할인 배너 (조건부, 썸네일 제외 가로 풀) ──────]
```

**썸네일**
- 1:1 비율, 좌측 고정 (`flex-shrink: 0`)
- 사이즈: 작은 카드용 토큰 (Figma 실측 76×76px)
- 모서리: ODS rounded 토큰 (작은 값, Figma 실측 4px)
- **체크박스**: 썸네일 좌상단 overlay, 작은 padding (Figma 실측 4px)

**텍스트 영역 (한 줄 노출 규칙)**
- 브랜드명 + 상품명: 한 줄 (`white-space: nowrap`)
- 브랜드명: ODS 작은 medium 토큰. **항상 전체 노출** (`flex-shrink: 0`, 절대 줄지 않음)
- 상품명: ODS 작은 regular 토큰 (foregroundWeak). 남은 공간 채우며 말줄임 (`flex: 1`, ellipsis)
- 옵션: 한 줄 노출 + 드롭다운 ▼
- 가격: ODS 본문 semibold 토큰. 쿠폰 뱃지와 인라인

**X 삭제**
- 우측 상단 정렬, ODS 작은 icon 토큰 (foregroundWeak)

[출처: _commerce-ingest-raw §3-4]

## 3. 영역별 클릭 분리 (⚠️ 매우 세밀)

> **단일 카드를 한 번 누르면 PDP** 식 일반화 금지. 글린다 카드는 영역별 액션 분리.

| 영역 | 액션 |
|---|---|
| 썸네일 / 체크박스 | 체크 on/off 토글 (PDP 이동 X) |
| 브랜드명 + 상품명 | PDP 오픈 |
| 옵션 영역 | 옵션 셀렉터 바텀시트 |
| 가격 영역 | PDP 오픈 |
| X 버튼 | 카드 1개 삭제 (confirm "이 상품을 삭제할까요?") |

[출처: _commerce-ingest-raw §3-4, _commerce-ingest §3.8]

## 4. 옵션 표기 규칙

- **첫 번째 필수옵션명만 노출** (한 줄, 말줄임)
- 추가 옵션이 있으면: `{첫 번째 옵션명} 외 N개`. 한 줄 초과 시에도 *"외 N개" 는 항상 노출*, 옵션명만 말줄임
- **옵션 미지정**: "기본 옵션" 표기
- **옵션 미선택 (need-select)**: 빨간색 텍스트 (ODS critical 토큰), 드롭다운 ▼ 항상 표시
- 추가 옵션 = 필수옵션 2개 이상 / 조립비 / 추가옵션 등

[출처: _commerce-ingest §3.5, §5.1]

## 5. 상태별 표시

| 상태 | 옵션 영역 | 가격 | 썸네일 |
|---|---|---|---|
| 옵션 선택 완료 | `{옵션명}` 또는 `{옵션명} 외 N개` | 정상 노출 | 정상 |
| 옵션 미선택 | "옵션을 선택해주세요" 빨간색 | 빨간색 | 정상 |
| 선택한 필수옵션 모두 품절 | "품절: {옵션명}" 빨간색 | **미노출** | 정상 |
| 상품 전체 품절 (판매종료) | 클릭 불가 | 미노출 | "판매종료" 오버레이 |

[출처: _commerce-ingest §5.2]

## 6. 브랜드 할인 배너 (조건부)

- **노출 조건**: 카드 상품의 브랜드가 글린다 브랜드 할인 프로모션 대상일 때만
- **위치**: 카드 하단, 썸네일 제외 가로 풀 너비
- **스타일**: 연한 파란 배경 (`backgroundBrandWeak` 토큰, Figma 실측 #f0f8fc). 작은 텍스트 + 셰브론
- **문구**: "이 브랜드 2개 이상 구매시, **{최소~최대}% 더 할인**" — 할인율 텍스트는 *고정값 X*. 브랜드별 구매 수량 단계표의 min/max 에서 산출 (예: 2개 5%·3개 10%·4개+ 15% → "5~15%")
- **클릭**: 브랜드 할인 상세 화면 오픈

[출처: _commerce-ingest-raw §3-4, _commerce-ingest §3.5]

## 7. 미해결·판단 필요

- [ ] **상품 리스트 화면 카드 (2열 그리드)**: 본 문서 §1 표만으로 충분한지, 별도 컴포넌트 `product-item-list` 분리 필요한지 — 별도 컴포넌트화 패턴(`contents-plain-tab` / `topic-chip` / `portrait-card-overlay`) 적용 후보
- [ ] **PDP·옵션 모달 안 상품 표기**: 글린다 한정인지 커머스 공통인지 확인 후 본 문서 범위 결정
- [ ] **쿠폰 뱃지 spec**: 정확한 ODS 컴포넌트·variant TBD. raw 에 작은 semibold·border pill 만 명시
- [ ] **체크박스**: ODS Checkbox 사용 여부·variant TBD (overlay 위치라 special?)
- [ ] **X 아이콘**: ODS Icon 정확한 이름 TBD (Close 계열)

## 8. LLM 작업 시 주의사항

- ⚠️ **영역별 클릭 분리** 매우 세밀 — 일반화 금지. 썸네일·텍스트·옵션·X 모두 다른 액션 (§3)
- ⚠️ **옵션 미선택 = 빨간색** (need-select). 자주 누락되는 케이스
- ⚠️ **브랜드명 vs 상품명 한 줄 규칙** — 브랜드명은 절대 줄지 않음 (`flex-shrink: 0`), 상품명만 말줄임
- ⚠️ **품절 분기** — 일부 옵션 품절(가격 미노출) vs 상품 전체 품절(판매종료 오버레이) 다름
- ⚠️ **수치보다 정책·토큰명** — 정확한 픽셀은 ODS MCP 또는 Figma 실측 우선
- ⚠️ **본 문서 범위**: *패키지 메인 화면 안 카드* 한정. 상품 리스트·PDP·모달은 별도 (§7)
- ⚠️ **브랜드 할인 배너 할인율** 고정값 X — 브랜드별 단계표 min/max 산출

## ODS atoms 매핑

- ODS image / Avatar (썸네일)
- ODS Checkbox (체크박스, 정확한 variant TBD)
- ODS Badge (쿠폰 뱃지, "기본 옵션" — 정확한 variant TBD)
- ODS Icon (X 삭제·드롭다운 ▼ — Close·ChevronDown 계열, 정확한 이름 TBD)
- ODS Text 또는 직접 typography (브랜드명·상품명·옵션·가격)

정확한 컴포넌트·variant 는 ODS MCP `get_component` 호출로 확인. 본 문서는 정책·맥락 단위.

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|---|---|---|
| 2026-04-30 | 초안 작성 | 공디님 `_commerce-ingest.md` §3.5·§3.7·§3.8·§5.1·§5.2 + raw §3-4 distill. 위치별 variant 다양 케이스 (메인·리스트·PDP·모달) 중 메인 카드 한정으로 시작 — 다른 위치는 §7 미해결 |
