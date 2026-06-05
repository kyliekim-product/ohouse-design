# Experiments 카드 v2 — 모달·아이콘·결과 강조·상태 필터

- **작성일**: 2026-06-05
- **브랜치**: `site-optimization-design-tuning-v.1`
- **선행**: 도메인 Experiments 인사이트 카드(2026-06-05) 개선.

## 목표

도메인 상세 Experiments 카드를 4가지로 개선한다: ① "자세히"를 아코디언 → **모달**(Track Design Context/policy-modal 패턴), ② 인사이트 OS 이모지(💡) → **레포 Icon 컴포넌트** + 텍스트 weight 1단계↑, ③ **결과(result_summary) 강조 블록**, ④ **상태 필터**(진행 중/Win/Loss/Inconclusive) — 메인 스크린 리스트 FilterBar 칩 패턴 참고.

## 현황 / 참고 패턴

- 카드: `[domain].astro` `.exp-card`(배지·제목·날짜·요약·결과 row·`💡`인사이트·팀·오너·출처칩·`<details>자세히` 아코디언). 데이터: `getDomainExperiments`(result/resultSummary/insight/keyDate/keyDateType/sources/bodyHtml/...).
- 모달: `#policy-modal` ("Track Design Context") — 트리거 `data-policy-modal-open={id}` + 콘텐츠 `<template id>` + 하단 단일 dialog + JS(클론·열기/닫기/ESC/백드롭). 라인 ~299/321/402, JS ~526.
- 아이콘: `src/components/Icon.astro`(직접 SVG, lucide 스타일; 현재 chevron-down/arrow-up-right/arrow-right/sort/filter — **전구 없음**). `<Icon name=.. size=.. />`.
- 필터: `FilterBar.astro`의 OS 토글 칩 `.fbar__pf`(`data-filter-key`/`data-filter-value`/`is-active`) + index.astro 클라 JS가 `data-filter-*` 항목 show/hide.

## 결정 (사용자 확정)

1. 자세히 = **모달**(전용 `#experiment-modal`, policy-modal 메커니즘), 아코디언 제거.
2. 인사이트 = **`Icon name="insight"`(전구) 추가** + 인사이트 텍스트 weight ↑.
3. 결과 = **결과색 accent 블록**(좌측 결과색 바 + 연한 틴트 배경 + 굵은 '결과' 라벨).
4. 상태 = **필터 칩**(전체/진행 중/Win/Loss/Inconclusive, 카운트 포함) 단일선택, 카드 `data-status` + 클라 JS.

## 비목표 (YAGNI)
- 다중선택/소스·정렬 필터(메인 FilterBar 전체) — 상태 단일선택만.
- result_summary 수치 파싱 강조 — 채택 안 함.
- 실험 전용 라우트/URL — 모달로 충분.

## 컴포넌트

### ① `getDomainExperiments` — `status` 파생 필드 (repo.js)
- `mapExperiment`에 `status` 추가: `keyDateType === 'started' ? 'running' : (result === 'win' ? 'win' : result === 'loss' ? 'loss' : 'inconclusive')`.
- 카드 배지·`data-status`·필터 카운트가 모두 `e.status`를 단일 소스로 사용(기존 인라인 휴리스틱 대체).

### ② Icon — 전구 추가 (Icon.astro)
- `name === 'insight'` 분기 추가(lucide bulb 계열 stroke SVG, 기존 attrs 재사용).

### ③ 상태 필터 (`[domain].astro` Experiments 패널 상단)
- astro에서 상태별 카운트 집계(`experiments`에서 status별 개수).
- 칩 행: `[전체(N) · 진행 중(n) · Win(n) · Loss(n) · Inconclusive(n)]`, `.fbar__pf` 스타일 재사용, `data-exp-filter={status|'all'}`, 기본 `all` is-active. 카운트 0인 상태 칩은 비표시.
- 클라 JS `initExperimentFilter`: 칩 클릭 → is-active 토글 + `.exp-card[data-status]` show/hide(단일선택, 'all'=전체). astro:page-load 재바인딩.

### ④ 카드 개선 + 모달 (`[domain].astro`)
- 카드 root: `<article class="exp-card" data-status={e.status}>`.
- 배지: `e.status`로 라벨/색(running→'진행 중'/accent, win→Win/success, loss→Loss/fail, inconclusive→Inconclusive/중립).
- **결과 블록**: `e.resultSummary` 있으면 `.exp-card__result` (좌측 `data-status`별 accent 바 + 틴트 배경 + 굵은 '결과' 라벨 + 텍스트).
- **인사이트**: `<Icon name="insight"/>` + 텍스트, weight ↑.
- **자세히 버튼**: `e.bodyHtml` 있으면 `<button data-exp-modal-open={id}>자세히</button>` + 카드 내 `<template id={id}>`에 모달 본문 HTML(헤더: 배지·제목·날짜·팀·오너·출처칩 / 본문: 기간·variants·winner 메타 + `bodyHtml` prose) 보관. (`<details>` 제거)
- 하단 단일 `#experiment-modal`(dialog, 백드롭, 닫기 버튼) + JS `initExperimentModal`: 트리거 클릭 → 해당 `<template>` 내용을 `[data-exp-modal-content]`에 클론, 모달 열기. 백드롭/ESC/닫기버튼으로 닫기. policy-modal JS와 동형.
- 출처칩은 카드 푸터에 유지(빠른 접근) + 모달 헤더에도 표기.

### ⑤ CSS
- `.exp-filter`(칩 행), `.exp-card__result`(+ status별 accent 색 변형), `.exp-card__insight`(weight/아이콘 정렬), `.experiment-modal*`(policy-modal 톤 재사용/참조). scoped `<style>`.

## 데이터 흐름
```
getDomainExperiments → e.status(파생) → 카드 data-status/배지 + 필터 카운트
자세히 버튼 → <template id> 본문 → #experiment-modal (JS clone+open)
필터 칩(data-exp-filter) → JS → .exp-card[data-status] show/hide
```

## 에러 처리 / 엣지
| 상황 | 처리 |
|---|---|
| bodyHtml 없음 | 자세히 버튼·template 생략 |
| resultSummary 없음 | 결과 블록 생략 |
| 특정 status 0건 | 해당 필터 칩 비표시 |
| 필터로 0건 표시 | 빈 안내(또는 그냥 빈 그리드) |
| 모달 JS 미바인딩(SPA 네비) | astro:page-load 재바인딩 |

## 테스트 / 검증
- `getDomainExperiments('cart')[*].status` = running×5/win×4/loss×1/inconclusive×1.
- `npx astro build` green; cart 페이지: 필터 칩(전체/진행 중/Win/Loss/Inconclusive + 카운트), 각 카드 `data-status`, 결과 accent 블록, 인사이트에 `<svg class="icon">`(이모지 아님), 자세히 버튼 + `#experiment-modal` 1개 + 카드별 `<template>`.
- 아코디언(`<details class="exp-card__more">`) 제거 확인(0).
- 실험 없는 도메인: empty 유지(회귀 없음).

## 참조
- `src/pages/d/[domain].astro`(카드·policy-modal·필터 JS), `src/components/Icon.astro`, `src/components/FilterBar.astro`, `src/lib/repo.js`(getDomainExperiments).
