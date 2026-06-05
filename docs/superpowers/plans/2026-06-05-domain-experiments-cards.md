# 도메인 상세 Experiments 인사이트 카드 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 도메인 상세 Experiments 탭을 실험 `*.md`의 frontmatter/본문 기반 인사이트 카드(배지·요약·결과·인사이트·팀/오너·출처칩 + 아코디언 본문)로 렌더하고, cart 실데이터 11건을 반입한다.

**Architecture:** `getDomainExperiments`가 자기 도메인 + `linked_domains` 실험의 frontmatter 전체와 본문 HTML을 매핑해 key_date 내림차순으로 반환. `[domain].astro`가 이를 `.exp-card` 그리드로 렌더(아코디언은 네이티브 `<details>`). 카드 데이터/스키마는 참고 데이터 레이어와 정합.

**Tech Stack:** Astro(scoped style), `marked`, 기존 `relTime`/`parseMd`/`getAllDomains`.

---

## File Structure
- **Add(반입)** `ohouse-design-mcp/domains/cart/experiments/*.md` (INDEX.md + 11건) — def5436에서.
- **Modify** `ohouse-design-site/src/lib/repo.js` — `getDomainExperiments` 확장 + `mapExperiment` 헬퍼.
- **Modify** `ohouse-design-site/src/pages/d/[domain].astro` — Experiments 패널 카드 UI + CSS (+ relTime import 보장).

---

## Task 1: cart 실험 데이터 반입

**Files:** `ohouse-design-mcp/domains/cart/experiments/` (git에서 반입).

- [ ] **Step 1: def5436에서 체크아웃**
```bash
cd /Users/kylie.kim/Documents/GitHub/ohouse-design
git checkout def5436 -- ohouse-design-mcp/domains/cart/experiments
```

- [ ] **Step 2: 반입 확인**
```bash
ls ohouse-design-mcp/domains/cart/experiments/ | sort
git status --short ohouse-design-mcp/domains/cart/experiments/
```
Expected: `INDEX.md` + 11개 `*.md`(coupon-download-button, cta-discount-info, empty-view-recommend, jp-bottomsheet-cross-recommend, jp-pdp-fbt-bulk-add, order-cancel-add-to-cart, package-builder-nudge-condition, recommend-sasrec, selection-ux-default, special-price-badge, today-departure-ux). git status에 신규/수정 파일로 스테이징됨.

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-mcp/domains/cart/experiments
git commit -m "data: import cart experiments (11) from def5436"
```

---

## Task 2: `getDomainExperiments` 확장 (repo.js)

**Files:** Modify `ohouse-design-site/src/lib/repo.js`.

- [ ] **Step 1: 기존 함수 교체 + 헬퍼 추가**

`getDomainExperiments`(현재 `slug`로 `listMd` 후 `{slug,label,summary,result,updated}` 매핑)를 아래로 교체. (READ로 현 위치 확인 후 함수 전체 교체.)
```js
function mapExperiment(domainSlug, file, linkedFrom) {
  const parsed = parseMd(join(ROOT, 'domains', domainSlug, 'experiments', file)) || {};
  const sources = parsed.sources || {};
  return {
    slug: file.replace(/\.md$/, ''),
    label: parsed.title || file.replace(/\.md$/, ''),
    summary: parsed.summary || null,
    result: parsed.result || 'inconclusive',
    resultSummary: parsed.result_summary || null,
    insight: parsed.insight || null,
    period: parsed.period || null,
    keyDate: parsed.key_date || null,
    keyDateType: parsed.key_date_type || null,
    variants: Array.isArray(parsed.variants) ? parsed.variants : [],
    winner: parsed.winner || null,
    team: parsed.team || null,
    owner: parsed.owner || null,
    sources: {
      xpc: sources.xpc || null,
      slack: sources.slack || null,
      notion: sources.notion || null,
      prd: sources.prd || null,
      figma: sources.figma || null,
    },
    bodyHtml: parsed.body ? marked.parse(parsed.body) : null,
    updated: lastModified(`domains/${domainSlug}/experiments/${file}`),
    linkedFrom: linkedFrom || null,
  };
}

export function getDomainExperiments(slug) {
  const all = [];
  // 자기 도메인 실험 (INDEX.md 제외)
  for (const file of listMd(join(ROOT, 'domains', slug, 'experiments'))) {
    if (file === 'INDEX.md') continue;
    all.push(mapExperiment(slug, file, null));
  }
  // 다른 도메인에서 linked_domains 로 본 도메인을 가리키는 실험
  for (const domain of getAllDomains()) {
    if (domain.slug === slug) continue;
    for (const file of listMd(join(ROOT, 'domains', domain.slug, 'experiments'))) {
      if (file === 'INDEX.md') continue;
      const fm = parseMd(join(ROOT, 'domains', domain.slug, 'experiments', file));
      const linked = fm && Array.isArray(fm.linked_domains) ? fm.linked_domains : [];
      if (linked.includes(slug)) all.push(mapExperiment(domain.slug, file, domain.label));
    }
  }
  // key_date 내림차순 (없으면 updated)
  return all.sort((a, b) => String(b.keyDate || b.updated || '').localeCompare(String(a.keyDate || a.updated || '')));
}
```
(`parseMd`, `join`, `ROOT`, `marked`, `lastModified`, `listMd`, `getAllDomains` 모두 기존 심볼.)

- [ ] **Step 2: 검증**
```bash
cd ohouse-design-site && node --input-type=module -e "
import { getDomainExperiments } from './src/lib/repo.js';
const x = getDomainExperiments('cart');
console.log('count:', x.length);
console.log('order(keyDate):', x.map(e => e.keyDate).join(', '));
console.log('first:', JSON.stringify({label:x[0].label,result:x[0].result,insight:!!x[0].insight,sources:x[0].sources,body:!!x[0].bodyHtml}));
console.log('has INDEX?', x.some(e => e.slug === 'INDEX'));
"
```
Expected: `count: 11`; keyDate 내림차순(2026-06-02 가장 먼저 … 2026-02-10 마지막); first 항목에 result/insight/sources/body 채워짐; `has INDEX? false`.

- [ ] **Step 3: 커밋**
```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: getDomainExperiments reads full frontmatter + body, sorts by key_date, supports linked_domains"
```

---

## Task 3: Experiments 카드 UI ([domain].astro)

**Files:** Modify `ohouse-design-site/src/pages/d/[domain].astro`.

- [ ] **Step 1: relTime import 보장**

상단 `import { ... } from '../../lib/repo.js'`에 `relTime`이 없으면 추가(READ로 확인). 있으면 생략.

- [ ] **Step 2: 카드 마크업 교체**

Experiments 패널의 비어있지 않은 분기(현재 `.lgrid` + `.lcard` map)를 아래로 교체:
```astro
          <div class="exp-grid">
            {experiments.map((e) => (
              <article class="exp-card">
                <div class="exp-card__head">
                  <span class={`badge ${e.result === 'win' ? 'badge--success' : e.result === 'loss' ? 'badge--fail' : e.result === 'running' ? 'badge--accent' : ''}`}>
                    {e.result === 'running' ? '진행 중' : e.result === 'win' ? 'Win' : e.result === 'loss' ? 'Loss' : 'Inconclusive'}
                  </span>
                  <h3 class="exp-card__title">{e.label}</h3>
                  {e.keyDate && (
                    <span class="exp-card__date">
                      {e.keyDateType === 'launched' ? '런칭' : e.keyDateType === 'started' ? '시작' : e.keyDateType === 'ended' ? '종료' : ''}{e.keyDateType ? ' · ' : ''}{relTime(e.keyDate)}
                    </span>
                  )}
                </div>
                {e.linkedFrom && <div class="exp-card__linked">🔗 주 작업: {e.linkedFrom}</div>}
                {e.summary && <p class="exp-card__summary">{e.summary}</p>}
                {e.resultSummary && (
                  <div class="exp-card__row"><span class="exp-card__rlabel">결과</span><p>{e.resultSummary}</p></div>
                )}
                {e.insight && <div class="exp-card__insight">💡 {e.insight}</div>}
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
                  <details class="exp-card__more">
                    <summary>자세히</summary>
                    {(e.period || e.variants.length > 0 || e.winner) && (
                      <div class="exp-card__meta">
                        {e.period && <span>기간: {e.period}</span>}
                        {e.variants.length > 0 && <span>variants: {e.variants.join(' / ')}</span>}
                        {e.winner && <span>winner: {e.winner}</span>}
                      </div>
                    )}
                    <div class="prose exp-card__body" set:html={e.bodyHtml} />
                  </details>
                )}
              </article>
            ))}
          </div>
```

- [ ] **Step 3: CSS 추가**

`<style>` 블록에 추가:
```css
  .exp-grid { display: grid; gap: 16px; }
  .exp-card { border: 1px solid var(--c-border); border-radius: 16px; padding: 20px; background: var(--c-bg); }
  .exp-card__head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .exp-card__title { font-size: 16px; font-weight: 700; margin: 0; flex: 1; min-width: 0; }
  .exp-card__date { font-size: 12px; color: var(--c-text-soft); white-space: nowrap; }
  .exp-card__linked { margin-top: 8px; font-size: 12px; color: var(--c-text-muted); }
  .exp-card__summary { margin: 12px 0 0; font-size: 14px; line-height: 1.6; color: var(--c-text-muted); }
  .exp-card__row { margin-top: 10px; }
  .exp-card__rlabel { display: inline-block; font-size: 12px; font-weight: 600; color: var(--c-text-soft); margin-bottom: 2px; }
  .exp-card__row p { margin: 0; font-size: 13px; color: var(--c-text-muted); line-height: 1.6; }
  .exp-card__insight { margin-top: 12px; padding: 12px; background: var(--c-bg-elev); border-radius: 10px; font-size: 13px; line-height: 1.6; color: var(--c-text); }
  .exp-card__foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
  .exp-card__by { font-size: 12px; color: var(--c-text-soft); }
  .exp-card__sources { display: flex; flex-wrap: wrap; gap: 8px; }
  .exp-card__sources a { font-size: 12px; font-weight: 600; color: var(--c-accent); text-decoration: none; padding: 2px 10px; border: 1px solid var(--c-border); border-radius: 999px; }
  .exp-card__sources a:hover { background: var(--c-bg-elev); }
  .exp-card__more { margin-top: 14px; border-top: 1px solid var(--c-border-soft); padding-top: 10px; }
  .exp-card__more summary { cursor: pointer; font-size: 13px; font-weight: 600; color: var(--c-text-muted); }
  .exp-card__meta { display: flex; flex-wrap: wrap; gap: 12px; margin: 10px 0; font-size: 12px; color: var(--c-text-soft); }
  .exp-card__body { margin-top: 8px; }
```

- [ ] **Step 4: 빌드 + e2e 검증**
```bash
cd ohouse-design-site && npx astro build 2>&1 | tail -3
PG=dist/d/cart/index.html
echo 'cards:'; grep -c 'exp-card"' "$PG"
echo 'badges:'; grep -oE '진행 중|>Win<|>Loss<|>Inconclusive<' "$PG" | sort | uniq -c
echo 'insight:'; grep -c 'exp-card__insight' "$PG"
echo 'source link (xpc):'; grep -o 'href="https://xpc.dailyhou.se/[^"]*"' "$PG" | head -1
echo 'accordion:'; grep -c 'exp-card__more' "$PG"
echo 'no INDEX card:'; grep -c '>INDEX<' "$PG" || true
```
Expected: build `Complete!`; cards 11; 배지에 Win/Loss/Inconclusive/진행 중 혼재; insight ≥1; xpc 링크 존재; accordion ≥1; INDEX 카드 없음(0).

- [ ] **Step 5: 커밋**
```bash
git add "ohouse-design-site/src/pages/d/[domain].astro"
git commit -m "feat: render domain Experiments as insight cards with accordion"
```

---

## Self-Review (작성자 체크)
- **Spec 커버리지**: 반입=Task1 / getDomainExperiments 확장(frontmatter·body·정렬·linked_domains·INDEX 제외)=Task2 / 카드 UI(배지·요약·결과·인사이트·팀오너·출처칩·아코디언)=Task3. 누락 없음.
- **Placeholder**: 코드·명령·기대출력 구체화. 없음.
- **일관성**: `mapExperiment` 반환 키(result/resultSummary/insight/keyDate/keyDateType/variants/winner/team/owner/sources/bodyHtml/linkedFrom)가 Task3 마크업과 1:1. owner는 string/array 모두 처리. 의존: Task3←Task2←Task1.
- **주의**: cart 데이터엔 linked_domains 없음 → 해당 분기는 무동작(향후 대비). INDEX.md 제외로 기존 잠재버그도 정리.
