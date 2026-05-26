---
type: domain-pattern-spec
parent: domains/house-tour/README.md
topic: module
module_id: hscroll
tier: 4
when-to-read: "콘텐츠 트랙에서 가로 스크롤 카드 모듈 사용 시"
size: "~1.5k tokens"
status: draft
owner: Deeer
last_verified: 2026-04-27
sources:
  - "Figma: SectionInterestProjectHScroll (1066:79545 내부)"
  - "Pilot Test 1차: tracks/contents/_pilot-test.md (2026-04-23)"
linked_md:
  - domains/house-tour/components/recommended-project-section/spec.md
  - domains/content-detail/components/author-info/spec.md
---

# Module · HScroll (가로 스크롤 카드 컨테이너)

콘텐츠 트랙에서 **카드 N장을 가로로 스크롤**해 보여주는 Module. Section 의 `modules` 슬롯 안에 들어간다.

> **3계층 위치**
> ```
> Section
> └─ Module · HScroll  ← 본 문서
>    └─ Card × N
> ```

---

## 1. 패턴 명세

| 속성 | 값 |
|---|---|
| 컨테이너 | 가로 스크롤 div / `<ScrollableList>` (ODS) 후보 |
| 첫 카드 좌측 여백 | 0 (Screen 16px 패딩이 시작점 잡음) |
| 카드 간 gap | **6px** (Landscape Card 기준 — Figma 확인됨) |
| 마지막 카드 우측 여백 | 16px (Screen 패딩 만큼 끝까지 보이도록) |
| 스크롤바 | 미노출 (`scrollbar-width: none`) |
| 스크롤 방향 | 가로 (overflow-x: auto) |

---

## 2. 카드 타입별 폭 (가로 스크롤 단위)

| 카드 타입 | 폭 | 비고 |
|---|---|---|
| Contents Landscape Card | **284px** | 3:2 비율 |
| Contents Portrait Card | **TBD** | 3:4 비율 — Figma 재확인 필요 |
| Contents Square Card | **TBD** | 1:1 비율 — Figma 재확인 필요 |

---

## 3. 동작

| 액션 | 결과 |
|---|---|
| 좌→우 스와이프 | 다음 카드 노출 |
| 우→좌 스와이프 | 이전 카드 노출 (첫 카드까지) |
| 카드 탭 | 카드 자체 onClick 동작 (Section 별로 다름) |
| 끝 도달 | **🚧 미확정** — 더 이상 스크롤 안 됨 / 무한 스크롤 / "더보기" 카드 노출 |

---

## 4. 스냅 동작

**🚧 미확정** — `scroll-snap` 사용 여부 결정 필요.

- 옵션 A: `scroll-snap-type: x mandatory` + 카드별 `scroll-snap-align: start`
- 옵션 B: 자유 스크롤 (현재 프로덕션 추정)

→ 디자이너·개발자 합의 후 본 문서에 확정.

---

## 5. ODS atoms 매핑

- ODS `<ScrollableList>` 컴포넌트 사용 후보. ⚠️ 실제 props·컨벤션은 ODS MCP 로 확인 필요 (`get_component('ScrollableList')`)
- 또는 일반 `<div>` + `overflow-x: auto` 직접 구현 (트랙 컴포넌트 책임 영역)

---

## 6. LLM 작업 시 주의사항

- ⚠️ **gap 6px 고정** (Landscape Card 기준) — 다른 값 사용 시 기존 카드들과 정렬 깨짐
- ⚠️ **첫 카드 좌측 여백 = 0** — Screen 16px 패딩이 잡고 있음. Module 내부에서 또 16px 주면 32px 가 되어 어긋남
- ⚠️ **카드 폭은 카드 타입이 결정** — Module 이 강제하지 않음. Landscape = 284px, 다른 타입은 §2 참조

---

## 7. 미확정 / 확인 필요

- [ ] HScroll 끝 도달 시 행동
- [ ] `scroll-snap` 사용 여부
- [ ] Portrait / Square 카드 폭 (현재 Landscape 만 확정)
- [ ] ODS `<ScrollableList>` 사용 여부 (vs 직접 구현)

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 초안 작성 — Section/Module/Card 3계층 명세화 (4/27 스레드 합의). tracks/contents/modules/ 폴더 첫 파일 |
