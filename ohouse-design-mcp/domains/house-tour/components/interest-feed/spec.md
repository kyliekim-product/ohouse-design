---
type: domain-pattern-spec
parent: domains/house-tour/README.md
topic: module
module_id: interest-feed
tier: 4
when-to-read: "집구경 추천 피드 하단 무한 스크롤 모듈 설계 시"
size: "~2k tokens"
status: draft
owner: Deeer
last_verified: 2026-04-27
sources:
  - "Figma: 1:12614 🟣 [Module] Interest Feed (Workflow_Test, Rhq24yUSskcByKWlASloRe)"
linked_md:
  - domains/content-detail/components/author-info/spec.md
non_ods: true
---

# Module · Interest Feed (도메인 패턴)

집구경 추천 피드 하단의 **2열 그리드 무한 스크롤** 메인 피드 모듈. 화면 전체 높이의 **3000+ px**를 차지하는 가장 큰 모듈.

> **위치**: 모든 Section 들 아래, BottomNavigation 바로 위
> **Figma 노드**: 1:12614 (3044h × 375w, y=1966)

---

## 1. 패턴 명세

| 속성 | 값 |
|---|---|
| 컨테이너 | 2열 CSS Grid (또는 masonry 유사) |
| 컬럼 폭 | (375 − 좌우패딩 16 − gap) / 2 ≈ **172px** |
| 카드 간 가로 gap | **추정 7~8px** (Figma 1:12614 design context 추가 확인 필요) |
| 카드 간 세로 gap | **추정 16~24px** |
| 좌우 패딩 | 16px (Screen 기본) |
| 스크롤 | 세로 무한 스크롤 (페이지네이션) |

> ⚠️ 실측 값 미수집 상태. design context 추가 호출 후 보강 필요.

---

## 2. 카드 구성

각 카드는 Portrait 비율(3:4 추정) 의 콘텐츠 카드. 다음 컴포넌트 조합:

```
Card (Portrait, ~172px width)
├─ Media (Thumbnail + User Information overlay + Scrap Button overlay)
└─ Content
   ├─ 타이틀 (1~2줄)
   └─ 메타 (조회수·스크랩 또는 reaction count)
```

→ author-info.md §3.1 (Overlay) 또는 §3.2 (Info Below) 적용 — 실측 후 결정.

---

## 3. 동작

| 액션 | 결과 |
|---|---|
| 세로 스크롤 | 다음 페이지 카드 자동 로드 (무한 스크롤) |
| 카드 탭 | 콘텐츠 상세 페이지 이동 |
| 카드 내 스크랩 탭 | 스크랩 토글, 카드 이동 X |
| 끝 도달 | "더 이상 콘텐츠 없음" placeholder or 다른 추천 |

---

## 4. 데이터 소스

- as-is 추천 시스템의 **메인 피드 결과**
- 집들이·사진·노하우·시공사례 mix
- 필터 적용 시 결과 동기화

> 🚧 **API 명세 확인 필요** — SDUI 응답 구조에 맞는 카드 타입 분기 처리

---

## 5. LLM 작업 시 주의사항

- ⚠️ **2열 고정** — 1열·3열 변형 없음
- ⚠️ **세로 스크롤 / 가로 스크롤 X** — HScroll Module 과 정반대 패턴
- ⚠️ **모듈 자체 패딩 0** — Screen 의 16px 패딩에 의존
- ⚠️ **카드 폭 컬럼 grid 기준** — 직접 px 지정 금지 (반응형 깨짐)

---

## 6. 미확정

- [ ] Figma 1:12614 design context 추가 호출 → grid gap·카드 비율 확정
- [ ] Portrait Card overlay variant 인지, Info Below variant 인지
- [ ] 무한 스크롤 페이지 사이즈 (10? 20?)
- [ ] "끝 도달" 처리
- [ ] 광고·프로모션 카드 끼어들기 정책 (몇 번째마다)

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 초안 — Phase 2 sandbox 작업 중 placeholder 명세로 신설. design context 추가 호출 시 보강 예정 |
