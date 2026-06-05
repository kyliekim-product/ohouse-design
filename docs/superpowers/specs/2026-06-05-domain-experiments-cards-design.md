# 도메인 상세 — Experiments 인사이트 카드

- **작성일**: 2026-06-05
- **브랜치**: `site-optimization-design-tuning-v.1`
- **참고**: 실험 데이터 레이어(`~/Downloads/실험인사이트-노출/작업과정.md`, test-site 카드 디자인) — frontmatter 스키마가 사이트 카드와의 계약.

## 목표

도메인 상세페이지의 **Experiments 탭**을, 각 실험 `*.md`의 frontmatter/본문을 활용한 **인사이트 카드**로 채운다. cart 도메인을 첫 대상으로 실데이터(11건)를 반입하고, 카드 렌더는 모든 도메인에 일반 적용한다.

## 배경 / 현황

- 실험 데이터: `ohouse-design-mcp/domains/<domain>/experiments/<name>.md`. 커밋 `def5436`에 cart 11건이 있으나 현재 워킹트리엔 INDEX.md만.
- 실험 frontmatter(실데이터 확인): `title, domain, period, key_date, key_date_type(started|launched|ended), variants[], winner, result(win|loss|inconclusive|running), summary, result_summary, insight, sources{slack,notion,prd,figma,xpc}, team, owner`. 본문: 배경/가설/해결방향/결과(표)/인사이트/향후/출처.
- 참고 카드(test-site): `[상태 배지 · 제목 · 상대날짜] / 요약 / 팀·오너` (완료 실험은 결과·인사이트 섹션 추가). status→배지, key_date→상대시간, linked_domains→`🔗 주 작업` 라벨 매핑이 데이터 레이어에 정의됨.
- 현재 `getDomainExperiments`(repo.js)는 `{slug,label,summary,result,updated}`만 읽고, `[domain].astro` Experiments 패널은 단순 `.lcard`(제목·result 배지·요약·상대시간). cart는 데이터 없어 empty.

## 결정 (사용자 확정)

1. 카드 깊이 = **요약 카드 + 출처 링크**, 추가 정보는 **아코디언**으로 펼쳐보기(별도 상세페이지 없음).
2. **정렬 = key_date 최신순**.
3. 참고 카드 표시 정보 **누락 없이 포함** + 유효한 보강(결과·인사이트·출처칩·기간/variants).

## 비목표 (YAGNI)

- 실험 전용 상세페이지/라우팅 — 아코디언으로 대체.
- 데이터 자동 적재 파이프라인(GitLab sync) — 데이터 레이어 팀 소관, 본 작업은 사이트 렌더만.

## 컴포넌트

### ① 데이터 반입
- `git checkout def5436 -- ohouse-design-mcp/domains/cart/experiments` 로 INDEX.md + 11개 `*.md` 반입.

### ② `getDomainExperiments(slug)` 확장 (repo.js)
- 각 실험에서 frontmatter 전체 + 본문 HTML 매핑:
  ```
  {
    slug, label(=title|slug), summary, result(기본 'inconclusive'),
    resultSummary, insight, period, keyDate, keyDateType, variants[],
    winner, team, owner, sources{xpc,slack,notion,prd,figma},
    bodyHtml(marked), updated, linkedFrom(null|주작업 도메인 라벨)
  }
  ```
- **정렬**: `keyDate` 내림차순(없으면 `updated`).
- **linked_domains**: `getDomainExperiments(slug)`는 자기 도메인 experiments + (전 도메인 스캔) `linked_domains`에 `slug`가 포함된 실험을 함께 반환. 후자는 `linkedFrom = 주작업 도메인 라벨` 세팅(카드에 `🔗 주 작업: {라벨}`). 자기 도메인 실험은 `linkedFrom=null`.

### ③ 카드 UI — `[domain].astro` Experiments 패널
- 카드(`.exp-card`) 구성:
  - 헤더: **결과 배지**(win/loss/inconclusive/`진행 중`) · 제목 · 날짜(`{타입라벨} · {keyDate 상대시간}`, 타입라벨: started=시작·launched=런칭·ended=종료) · (있으면) `🔗 주 작업: {linkedFrom}`
  - **요약**(summary) → **결과**(resultSummary, 있으면) → **💡 인사이트**(insight, 있으면)
  - 푸터: **팀 · 오너** + **출처 링크칩**(xpc/slack/notion/prd/figma 중 non-null만; 라벨 XPC·Slack·Notion·PRD·Figma, target=_blank)
  - **아코디언**: 네이티브 `<details><summary>자세히</summary>…</details>` 안에 `bodyHtml` + 메타(기간·variants·winner). 본문 없으면 아코디언 생략.
- 배지 색: win=`badge--success`, loss=`badge--fail`, inconclusive=중립, running=info 톤.
- empty 상태(실험 0건)는 기존 유지.

### ④ 스타일
- `[domain].astro` scoped `<style>`에 `.exp-grid`/`.exp-card*` 추가(기존 `.lcard` 톤·토큰 일관). 아코디언 본문은 `.prose`/기존 마크다운 스타일 재사용.

## 데이터 흐름

```
domains/<d>/experiments/*.md (frontmatter+본문)
        │ getDomainExperiments(slug): 자기 도메인 + linked_domains, keyDate desc
        ▼
[domain].astro Experiments 패널 → .exp-card (배지·요약·결과·인사이트·팀/오너·출처칩 + 아코디언 본문)
```

## 에러 처리 / 엣지

| 상황 | 처리 |
|---|---|
| frontmatter 필드 누락 | 해당 섹션/칩 미표시(조건부 렌더), 카드 자체는 표시 |
| result 없음 | 'inconclusive' 기본 |
| keyDate 없음 | updated 기준 정렬·표시 |
| 본문 없음 | 아코디언 생략 |
| sources 전부 null | 출처칩 행 생략 |
| INDEX.md | 카드 목록에서 제외(experiment 파일만) |

## 테스트 / 검증

- `getDomainExperiments('cart')` 11건, keyDate desc, 각 항목에 summary/result/insight/sources 매핑.
- `npx astro build` green; cart 페이지 Experiments 패널에 11개 `.exp-card`, win/loss/inconclusive/running 배지, 출처 링크(xpc.dailyhou.se 등), 아코디언 `<details>` 존재.
- 실험 없는 도메인: empty 상태 유지(회귀 없음).

## 참조
- `src/lib/repo.js` (`getDomainExperiments`, `getAllDomains`, `parseMd`, `marked`, `relTime`)
- `src/pages/d/[domain].astro` (Experiments 패널)
- 참고: `~/Downloads/실험인사이트-노출/작업과정.md`, `test-site/cart.html`
