# Experiments 카드 v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 도메인 Experiments 카드를 (1) `status` 단일 소스화, (2) 인사이트 전구 아이콘+웨이트, (3) 결과 accent 블록, (4) "자세히" 모달, (5) 상태 필터 칩으로 개선.

**Architecture:** `getDomainExperiments`가 `status`(running/win/loss/inconclusive)를 파생. `[domain].astro`가 카드를 status 기반으로 렌더하고, "자세히"는 카드별 `<template>` + 단일 `#experiment-modal`(policy-modal 동형 JS)로, 상태 필터는 `.exp-card[data-status]`를 토글하는 칩(FilterBar 패턴)으로 구현. 인사이트 아이콘은 `Icon.astro`에 추가.

**Tech Stack:** Astro(scoped style + `<script>` TS), 기존 Icon/FilterBar/policy-modal 패턴.

---

## File Structure
- **Modify** `ohouse-design-site/src/lib/repo.js` — `mapExperiment`에 `status`.
- **Modify** `ohouse-design-site/src/components/Icon.astro` — `insight` 아이콘.
- **Modify** `ohouse-design-site/src/pages/d/[domain].astro` — 카드 rework + 모달 + 필터 + CSS + Icon import.

---

## Task 1: `status` 파생 필드 (repo.js)

**Files:** Modify `ohouse-design-site/src/lib/repo.js`.

- [ ] **Step 1:** `mapExperiment` 반환 객체에 `status` 추가. `result` 키 줄 아래(또는 객체 내 적절 위치)에 삽입:
```js
    status: (parsed.key_date_type === 'started')
      ? 'running'
      : (parsed.result === 'win' ? 'win' : parsed.result === 'loss' ? 'loss' : 'inconclusive'),
```
(READ로 `mapExperiment` 위치 확인. 다른 필드 유지.)

- [ ] **Step 2: 검증**
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getDomainExperiments } from './src/lib/repo.js';
const c = {}; for (const e of getDomainExperiments('cart')) c[e.status]=(c[e.status]||0)+1;
console.log(JSON.stringify(c));
"
```
Expected: `{"running":5,"win":4,"loss":1,"inconclusive":1}` (순서 무관).

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: derive experiment status (running/win/loss/inconclusive) in getDomainExperiments"
```

---

## Task 2: `insight` 아이콘 추가 (Icon.astro)

**Files:** Modify `ohouse-design-site/src/components/Icon.astro`.

- [ ] **Step 1:** 기존 아이콘 분기들 사이(예: `filter` 분기 뒤)에 추가:
```astro
{name === 'insight' && (
  <svg {...attrs}>
    <path d="M9 18h6" />
    <path d="M10 22h4" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
  </svg>
)}
```

- [ ] **Step 2: 확인**
```bash
cd ohouse-design-site && grep -c "name === 'insight'" src/components/Icon.astro
```
Expected: `1`.

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-site/src/components/Icon.astro
git commit -m "feat: add insight (lightbulb) icon to Icon set"
```

---

## Task 3: 카드 rework + 결과 블록 + 인사이트 아이콘 + 자세히 모달 ([domain].astro)

**Files:** Modify `ohouse-design-site/src/pages/d/[domain].astro`.

- [ ] **Step 1: Icon import 보장**

frontmatter import에 `import Icon from '../../components/Icon.astro';` 없으면 추가(READ 확인).

- [ ] **Step 2: 카드 블록 교체**

Experiments 패널의 `<article class="exp-card">…</article>` (배지~`<details>` 아코디언 포함) 전체를 아래로 교체:
```astro
              <article class="exp-card" data-status={e.status}>
                <div class="exp-card__head">
                  <span class={`badge ${e.status === 'running' ? 'badge--accent' : e.status === 'win' ? 'badge--success' : e.status === 'loss' ? 'badge--fail' : ''}`}>
                    {e.status === 'running' ? '진행 중' : e.status === 'win' ? 'Win' : e.status === 'loss' ? 'Loss' : 'Inconclusive'}
                  </span>
                  <h3 class="exp-card__title">{e.label}</h3>
                  {e.keyDate && (
                    <span class="exp-card__date">{e.keyDateType === 'launched' ? '런칭' : e.keyDateType === 'started' ? '시작' : e.keyDateType === 'ended' ? '종료' : ''}{e.keyDateType ? ' · ' : ''}{relTime(e.keyDate)}</span>
                  )}
                </div>
                {e.linkedFrom && <div class="exp-card__linked">🔗 주 작업: {e.linkedFrom}</div>}
                {e.summary && <p class="exp-card__summary">{e.summary}</p>}
                {e.resultSummary && (
                  <div class={`exp-card__result exp-card__result--${e.status}`}>
                    <span class="exp-card__result-label">결과</span>
                    <p>{e.resultSummary}</p>
                  </div>
                )}
                {e.insight && (
                  <div class="exp-card__insight">
                    <Icon name="insight" size={16} class="exp-card__insight-icon" />
                    <span>{e.insight}</span>
                  </div>
                )}
                <div class="exp-card__foot">
                  {(e.team || e.owner) && (
                    <span class="exp-card__by">{[e.team, Array.isArray(e.owner) ? e.owner.join(', ') : e.owner].filter(Boolean).join(' · ')}</span>
                  )}
                  <span class="exp-card__sources">
                    {e.sources.xpc && <a href={e.sources.xpc} target="_blank" rel="noopener">XPC</a>}
                    {e.sources.slack && <a href={e.sources.slack} target="_blank" rel="noopener">Slack</a>}
                    {e.sources.notion && <a href={e.sources.notion} target="_blank" rel="noopener">Notion</a>}
                    {e.sources.prd && <a href={e.sources.prd} target="_blank" rel="noopener">PRD</a>}
                    {e.sources.figma && <a href={e.sources.figma} target="_blank" rel="noopener">Figma</a>}
                  </span>
                </div>
                {e.bodyHtml && (
                  <>
                    <button type="button" class="exp-card__more-btn" data-exp-modal-open={`expm-${e.slug}`}>자세히 →</button>
                    <template id={`expm-${e.slug}`}>
                      <header class="experiment-modal__head">
                        <div class="experiment-modal__meta">
                          <span class={`badge ${e.status === 'running' ? 'badge--accent' : e.status === 'win' ? 'badge--success' : e.status === 'loss' ? 'badge--fail' : ''}`}>
                            {e.status === 'running' ? '진행 중' : e.status === 'win' ? 'Win' : e.status === 'loss' ? 'Loss' : 'Inconclusive'}
                          </span>
                          {e.keyDate && <span class="experiment-modal__date">{e.keyDateType === 'launched' ? '런칭' : e.keyDateType === 'started' ? '시작' : e.keyDateType === 'ended' ? '종료' : ''}{e.keyDateType ? ' · ' : ''}{relTime(e.keyDate)}</span>}
                        </div>
                        <h2 class="experiment-modal__title">{e.label}</h2>
                        <div class="experiment-modal__submeta">
                          {(e.team || e.owner) && <span>{[e.team, Array.isArray(e.owner) ? e.owner.join(', ') : e.owner].filter(Boolean).join(' · ')}</span>}
                          {e.period && <span>{e.period}</span>}
                          {e.winner && <span>winner: {e.winner}</span>}
                          {e.variants.length > 0 && <span>variants: {e.variants.join(' / ')}</span>}
                        </div>
                        <div class="experiment-modal__sources">
                          {e.sources.xpc && <a href={e.sources.xpc} target="_blank" rel="noopener">XPC</a>}
                          {e.sources.slack && <a href={e.sources.slack} target="_blank" rel="noopener">Slack</a>}
                          {e.sources.notion && <a href={e.sources.notion} target="_blank" rel="noopener">Notion</a>}
                          {e.sources.prd && <a href={e.sources.prd} target="_blank" rel="noopener">PRD</a>}
                          {e.sources.figma && <a href={e.sources.figma} target="_blank" rel="noopener">Figma</a>}
                        </div>
                      </header>
                      <div class="prose experiment-modal__body" set:html={e.bodyHtml} />
                    </template>
                  </>
                )}
              </article>
```

- [ ] **Step 3: 모달 마크업 추가**

`#policy-modal` `</div>` 뒤(또는 `</Layout>` 직전)에 추가:
```astro
  <div id="experiment-modal" class="experiment-modal" role="dialog" aria-modal="true" aria-hidden="true" hidden>
    <button type="button" class="experiment-modal__backdrop" data-exp-modal-close aria-label="Close experiment detail"></button>
    <article class="experiment-modal__panel" aria-label="experiment detail">
      <button type="button" class="experiment-modal__close" data-exp-modal-close aria-label="Close experiment detail">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="experiment-modal__content" data-exp-modal-content></div>
    </article>
  </div>
```

- [ ] **Step 4: 모달 JS 추가**

`<script>` 내 `initPolicyModal` 등록부 근처에 추가하고 호출+page-load 등록:
```js
  function initExperimentModal() {
    const modal = document.getElementById('experiment-modal');
    if (!modal || (modal as HTMLElement).dataset.bound) return;
    (modal as HTMLElement).dataset.bound = '1';
    const content = modal.querySelector<HTMLElement>('[data-exp-modal-content]');
    function close() {
      (modal as HTMLElement).hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (content) content.innerHTML = '';
    }
    document.addEventListener('click', (event) => {
      const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-exp-modal-open]');
      if (trigger) {
        event.preventDefault();
        const tpl = document.getElementById(trigger.dataset.expModalOpen || '') as HTMLTemplateElement | null;
        if (tpl && content) {
          content.innerHTML = tpl.innerHTML;
          (modal as HTMLElement).hidden = false;
          modal.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
          modal.querySelector<HTMLElement>('[data-exp-modal-close]')?.focus();
        }
        return;
      }
      if ((event.target as HTMLElement).closest('[data-exp-modal-close]')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !(modal as HTMLElement).hidden) close();
    });
  }
  initExperimentModal();
  document.addEventListener('astro:page-load', initExperimentModal);
```

- [ ] **Step 5: CSS 추가**

`<style>` 블록에서 구 `.exp-card__row`/`.exp-card__rlabel`/`.exp-card__more`/`.exp-card__meta` 규칙 삭제(있으면), `.exp-card__insight`는 아래로 갱신, 그리고 추가:
```css
  .exp-card__insight { margin-top: 12px; padding: 12px; background: var(--c-bg-elev); border-radius: 10px; font-size: 13px; font-weight: 500; line-height: 1.6; color: var(--c-text); display: flex; gap: 8px; align-items: flex-start; }
  .exp-card__insight-icon { flex-shrink: 0; margin-top: 2px; color: var(--c-accent); }
  .exp-card__result { margin-top: 12px; padding: 10px 12px 10px 14px; border-left: 3px solid var(--c-border); border-radius: 0 8px 8px 0; background: var(--c-bg-soft); }
  .exp-card__result--win { border-left-color: var(--c-success); background: #e6f7ec; }
  .exp-card__result--loss { border-left-color: var(--c-fail); background: #fdecec; }
  .exp-card__result--running { border-left-color: var(--c-accent); background: var(--c-accent-soft); }
  .exp-card__result-label { display: block; font-size: 11px; font-weight: 700; letter-spacing: .02em; color: var(--c-text-soft); margin-bottom: 3px; }
  .exp-card__result p { margin: 0; font-size: 13px; color: var(--c-text); line-height: 1.6; }
  .exp-card__more-btn { margin-top: 14px; background: none; border: 0; padding: 0; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-text-muted); }
  .exp-card__more-btn:hover { color: var(--c-text); }
  .experiment-modal { position: fixed; inset: 0; z-index: 90; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .experiment-modal[hidden] { display: none; }
  .experiment-modal__backdrop { position: absolute; inset: 0; background: rgba(10,10,10,.5); border: 0; }
  .experiment-modal__panel { position: relative; z-index: 1; width: min(680px, 100%); max-height: 85vh; overflow-y: auto; background: var(--c-bg); border-radius: 20px; padding: 28px; box-shadow: var(--sh-lg); }
  .experiment-modal__close { position: absolute; top: 16px; right: 16px; background: none; border: 0; cursor: pointer; color: var(--c-text-muted); }
  .experiment-modal__meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .experiment-modal__date { font-size: 12px; color: var(--c-text-soft); }
  .experiment-modal__title { font-size: 20px; font-weight: 800; margin: 10px 0 8px; }
  .experiment-modal__submeta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px; color: var(--c-text-soft); }
  .experiment-modal__sources { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
  .experiment-modal__sources a { font-size: 12px; font-weight: 600; color: var(--c-accent); text-decoration: none; padding: 2px 10px; border: 1px solid var(--c-border); border-radius: 999px; }
  .experiment-modal__body { margin-top: 16px; }
```

- [ ] **Step 6: 빌드 + e2e**
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
PG=dist/d/cart/index.html
echo 'data-status:'; grep -oE 'data-status="[a-z]+"' "$PG" | sort | uniq -c
echo 'result blocks:'; grep -c 'exp-card__result ' "$PG"
echo 'insight icon (svg, not emoji):'; grep -c 'exp-card__insight-icon' "$PG"; grep -c '💡' "$PG"
echo 'more buttons + templates:'; grep -c 'data-exp-modal-open' "$PG"; grep -c '<template id="expm-' "$PG"
echo 'modal present:'; grep -c 'id="experiment-modal"' "$PG"
echo 'accordion gone:'; grep -c 'exp-card__more"' "$PG" || true
```
Expected: build `Complete!`; data-status running/win/loss/inconclusive 분포; result blocks ≥1; insight-icon ≥1, `💡`=0; more buttons 11 + templates 11; modal 1; accordion(`exp-card__more"` = the `<details>` class) 0.

- [ ] **Step 7: 커밋**
```bash
git add "ohouse-design-site/src/pages/d/[domain].astro"
git commit -m "feat: experiment cards use status, result accent block, insight icon, detail modal"
```

---

## Task 4: 상태 필터 칩 ([domain].astro)

**Files:** Modify `ohouse-design-site/src/pages/d/[domain].astro`.

- [ ] **Step 1: 카운트 집계 (frontmatter)**

`const experiments = getDomainExperiments(slug);` 아래에 추가:
```js
const expCounts = experiments.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {});
```

- [ ] **Step 2: 필터 칩 마크업**

Experiments 패널의 `<div class="exp-grid">` **바로 앞**에 추가:
```astro
          <div class="exp-filter" id="exp-filter" role="group" aria-label="실험 상태 필터">
            <button type="button" class="exp-chip is-active" data-exp-filter="all">전체 <span class="exp-chip__n">{experiments.length}</span></button>
            {expCounts.running > 0 && <button type="button" class="exp-chip" data-exp-filter="running">진행 중 <span class="exp-chip__n">{expCounts.running}</span></button>}
            {expCounts.win > 0 && <button type="button" class="exp-chip" data-exp-filter="win">Win <span class="exp-chip__n">{expCounts.win}</span></button>}
            {expCounts.loss > 0 && <button type="button" class="exp-chip" data-exp-filter="loss">Loss <span class="exp-chip__n">{expCounts.loss}</span></button>}
            {expCounts.inconclusive > 0 && <button type="button" class="exp-chip" data-exp-filter="inconclusive">Inconclusive <span class="exp-chip__n">{expCounts.inconclusive}</span></button>}
          </div>
```

- [ ] **Step 3: 필터 JS**

`<script>`에 추가 + 호출/page-load 등록:
```js
  function initExperimentFilter() {
    const bar = document.getElementById('exp-filter');
    if (!bar || (bar as HTMLElement).dataset.bound) return;
    (bar as HTMLElement).dataset.bound = '1';
    const chips = Array.from(bar.querySelectorAll<HTMLElement>('.exp-chip'));
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.exp-card'));
    bar.addEventListener('click', (event) => {
      const chip = (event.target as HTMLElement).closest<HTMLElement>('.exp-chip');
      if (!chip) return;
      const value = chip.dataset.expFilter || 'all';
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      cards.forEach((card) => { card.hidden = !(value === 'all' || card.dataset.status === value); });
    });
  }
  initExperimentFilter();
  document.addEventListener('astro:page-load', initExperimentFilter);
```

- [ ] **Step 4: CSS**
```css
  .exp-filter { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .exp-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid var(--c-border); border-radius: 999px; background: var(--c-bg); color: var(--c-text-muted); font-size: 13px; font-weight: 600; cursor: pointer; }
  .exp-chip:hover { background: var(--c-bg-elev); }
  .exp-chip.is-active { background: var(--c-text); color: var(--c-bg); border-color: var(--c-text); }
  .exp-chip__n { font-size: 11px; opacity: .8; }
```

- [ ] **Step 5: 빌드 + e2e**
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
PG=dist/d/cart/index.html
echo 'filter chips:'; grep -oE 'data-exp-filter="[a-z]+"' "$PG" | sort -u
echo 'all count:'; grep -oE 'data-exp-filter="all">전체 <span class="exp-chip__n">[0-9]+' "$PG"
```
Expected: build `Complete!`; chips all/running/win/loss/inconclusive; 전체 카운트 11.

- [ ] **Step 6: 커밋**
```bash
git add "ohouse-design-site/src/pages/d/[domain].astro"
git commit -m "feat: status filter chips for experiment cards"
```

---

## Self-Review (작성자 체크)
- **Spec 커버리지**: status=Task1 / insight 아이콘=Task2 / 카드·결과·인사이트·모달=Task3 / 필터=Task4. 아코디언 제거·이모지 제거=Task3 e2e.
- **Placeholder**: 코드·명령·기대출력 구체화.
- **일관성**: `e.status`(running/win/loss/inconclusive)를 배지·data-status·result accent·필터·카운트 전부 사용. `expm-${slug}` template id ↔ `data-exp-modal-open`. 의존: Task3←Task1·2, Task4←Task3(data-status).
- **주의**: 모달/필터 JS는 `astro:page-load` 재바인딩 + dataset.bound 가드(중복 방지). result accent 색은 기존 토큰(--c-success/fail/accent-soft) 사용.
