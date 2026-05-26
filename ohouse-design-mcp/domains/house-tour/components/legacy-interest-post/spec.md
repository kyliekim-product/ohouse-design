---
type: domain-pattern-spec
parent: domains/house-tour/README.md
topic: section
section_id: legacy-interest-post
tier: 4
when-to-read: "집구경 추천 피드 내 'Legacy Interest Post' Section 설계 시"
size: "~1.5k tokens"
status: draft
owner: Deeer
last_verified: 2026-04-27
sources:
  - "Figma: 1:12610 Section/🟣 Legacy Interest Post (Workflow_Test, Rhq24yUSskcByKWlASloRe)"
non_ods: true
---

# Section · Legacy Interest Post (도메인 패턴)

> 🚧 **Draft 명세** — Figma 1:12610 노드의 design context 미수집 상태. 메타데이터(330h × 420w, y=650) + 스크린샷 기반 추정 명세. 디테일은 design context 추가 호출 후 보강.

집구경 추천 피드 내 **legacy(이전 명세) 기반의 Interest Post** 섹션. 새 추천 시스템 도입 후에도 일부 콘텐츠는 이 섹션 형태로 유지됨.

> Figma 컴포넌트 이름에 "Legacy" 접두어 → 명세 자체가 deprecated 후보. 추후 새 Section 으로 흡수될 가능성 있음.

---

## 1. 노출 조건

- 추천 탭 기본 노출 (필터 무관)
- 추후 deprecated 가능성 있음 — 디자이너 협의 필요

## 2. Section 구조

```
Section · Legacy Interest Post
├─ Section.Header (타이틀 + chevron)
└─ Module · HScroll (../hscroll/spec.md)
   └─ Card × N (Legacy 형식 카드)
```

**🚧 카드 명세 추가 확인 필요**:
- 카드 비율
- 카드 폭
- 카드 내부 레이아웃 (Body 텍스트 풍부 추정)

---

## 3. 시각 스펙 (메타데이터 기반 추정)

| 요소 | 추정 값 |
|---|---|
| Section 높이 | 330px (1:12610 metadata) |
| Section 폭 | 420px (오버해서 — 화면 폭 375 와 차이) |
| 헤더 패딩 | 좌우 16px (Screen 기본) |
| 카드 컨테이너 | HScroll (../hscroll/spec.md) |

---

## 4. LLM 작업 시 주의사항

- ⚠️ **Legacy 마커 명시** — 새 카드 패턴과 혼용 금지
- ⚠️ **명세 미완성** — 코드 구현 전 디자이너 디테일 확인 필수

---

## 5. 미확정

- [ ] Figma 1:12610 design context 추가 호출 → 카드 비율·폭·레이아웃 확정
- [ ] "Legacy" deprecated 일정 확인 (Tyler·지나)
- [ ] 새 추천 시스템과의 통합 계획

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 초안 — Phase 2 sandbox 작업 중 placeholder 명세로 신설. design context 추가 호출 시 보강 예정 |
