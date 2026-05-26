---
type: domain-pattern-spec
parent: domains/house-tour/README.md
topic: section
section_id: recommended-project-section
tier: 4
when-to-read: "집구경 탭 추천 피드 내 '추천 집들이' Section 설계 시"
size: "~2k tokens"
status: draft
owner: Deeer
last_verified: 2026-04-27
sources:
  - "Figma: 1066:79545 (취향만 쏙쏙 골라 담은 추천 집들이)"
  - "Pilot Test 1차: tracks/contents/_pilot-test.md (2026-04-23)"
  - "Pilot Test 2차 ODS MCP: tracks/contents/_pilot-test-ods-mcp.md (2026-04-27)"
linked_md:
  - domains/content-detail/components/author-info/spec.md
  - domains/house-tour/components/hscroll/spec.md
---

# Section · 추천 집들이 (Recommended Project Section)

집구경 탭 추천 피드 내 **집들이 모드(집들이 단일 필터) 활성화 시**에만 노출되는 Section.

> **3계층 구조 (4/27 스레드 합의 기준)**
> ```
> Screen (집구경 탭 추천 피드)
> └─ Section · 본 문서                         ← Header + Module 한 덩어리
>    ├─ Section.Header (타이틀 + chevron)
>    └─ Module · hscroll                       ← modules/hscroll.md
>       └─ Card × N (Contents Landscape)        ← components/author-info.md §3.1 Overlay
> ```

---

## 1. 노출 조건

- **집들이 모드** (집들이 단일 필터) 활성화 시에만 노출
- 다른 필터(쇼츠/포스트/사진 등) 또는 전체 탭에서는 미노출
- as-is "오늘의취향 / 오늘 올라온 집들이" 로직 그대로 사용

## 2. Section 구조

### 2.1 Section.Header

| 요소 | 스펙 |
|---|---|
| 타이틀 | "취향만 쏙쏙 골라 담은 추천 집들이" (고정 문구) |
| 우측 chevron | `>` 모양. **🚧 미확정** — "더보기" 링크인지 단순 시각 요소인지 확인 필요 |
| 타이포 | `heading18` (Pretendard, 18px / 24px) |
| 색상 | `foreground` |

### 2.2 Module 슬롯

→ `modules/hscroll.md` 의 HScroll 패턴 그대로 사용
- 카드 폭: `284px`
- 카드 간 gap: `6px`
- 카드 타입: `Contents Landscape Card` (3:2 비율)

---

## 3. 패딩 컨벤션 (4/27 스레드 합의 반영)

| 위치 | 좌우 패딩 |
|---|---|
| Screen 최상단 | **16px 강제** (모든 Section 공통) |
| Section.Header | 0 (Screen 패딩에 의존) |
| Module HScroll 영역 | 0 (Screen 패딩에 의존) — **단, 카드는 첫 카드부터 화면 좌측 16px 거리 유지** |

> ⚠️ **이전 잘못된 컨벤션**: `(16px + 타이틀 + 16px) + (16px + 콘텐츠 + 16px)` — 각 영역이 자체 패딩을 갖는 방식 → **폐기**
>
> ✅ **새 컨벤션**: `16px + (타이틀 + 콘텐츠) + 16px` — Section 묶음에 외곽 패딩 한 번만 적용 (Screen 레벨)

---

## 4. 동작 (행위 명세)

| 액션 | 결과 |
|---|---|
| Section 진입 (스크롤 도달) | 노출 로깅 (impression) |
| 카드 가로 스와이프 | HScroll 이동, 스냅 동작은 `modules/hscroll.md` 참조 |
| 카드 탭 | 상세 페이지 이동 (`/projects/{id}`) |
| 카드 내 스크랩 버튼 탭 | 스크랩 토글 (카드 이동 X), 비로그인 시 로그인 모달 |
| chevron 탭 | **🚧 미확정** — 더보기 페이지 이동 여부 확인 필요 |

---

## 5. Section 단위 SDUI 매핑 (4/27 합의 반영)

> **개발팀 미팅 결과 (4/24 금)**: SDUI 환경에서 **컴포넌트 단위 정의 유지**가 적절. Section 은 컴포넌트들을 묶는 큰 경계로만 활용.

본 Section 의 SDUI 표현:

```yaml
type: section
section_id: recommended-project-section
visibility:
  required_filter: project_only  # 집들이 단일 필터
header:
  title: "취향만 쏙쏙 골라 담은 추천 집들이"
  trailing: chevron_right
modules:
  - type: hscroll
    card_type: contents_landscape
    data_source: as_is_today_taste_today_uploaded_project
```

→ 클라이언트는 이 Section JSON 한 덩어리 받아서 렌더링 가능.

---

## 6. LLM 작업 시 주의사항

- ⚠️ **노출 조건 분기 필수** — 다른 필터에서는 미노출. 무조건 보이는 모듈로 가정 금지
- ⚠️ **카드 타입 = Landscape 고정** — Portrait/Square 로 바꾸려는 시도 금지 (Section 자체가 Landscape 전용)
- ⚠️ **타이틀 문구 고정** — "취향만 쏙쏙 골라 담은 추천 집들이" 외 문구 사용 금지 (운영 모듈 idx=1 외 인피니티 idx=99 외)
- ⚠️ **chevron 의미 확인 전까지 추측 금지** — §7 미확정 참조

---

## 7. 미확정 / 확인 필요

- [ ] **chevron 의미** — 더보기 페이지로 이동인지, 단순 시각 요소인지
- [ ] **HScroll 스냅 동작** — `scroll-snap` 사용 여부 (`modules/hscroll.md` 와 함께 결정)
- [ ] **노출 모듈 idx 정책** — 운영 모듈 1, 인피니티 99 외 가변. 추천 집들이가 몇 번째 idx 로 들어가는지

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 초안 작성 — 4/24 회의·4/27 스레드 합의(Section 단위 명세 + 16px 패딩 컨벤션) 반영. tracks/contents/sections/ 폴더 첫 파일 |
