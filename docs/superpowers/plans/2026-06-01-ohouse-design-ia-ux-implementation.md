# Ohouse Design IA and UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the W2 IA update so Ohouse Design can be browsed by `Categories`, `Screens`, `UI Elements`, and `Flows`, with OS/source/status filtering and non-crowded detailed navigation.

**Architecture:** Add a small IA configuration layer in `src/lib/repo.js`, then reuse it across the global nav, home shortcuts, browse pages, and domain detail tabs. Keep the current domain-first content source intact; derived browse items and deterministic fallback metadata make the new IA visible before a full content migration.

**Tech Stack:** Astro 5, Astro components, React only where already used for ODS previews, vanilla client-side JavaScript for nav overlay and tabs, existing `npm run build` validation.

---

## File Structure

- Modify `ohouse-design-site/src/lib/repo.js`: add IA constants, derived browse item helpers, and metadata fallback functions.
- Modify `ohouse-design-site/src/components/Nav.astro`: replace the current two-tab product/design-system nav with Ohouse Design global axes plus a browse overlay.
- Modify `ohouse-design-site/src/components/FilterBar.astro`: replace `All / HTML / Figma` primary toggle with OS/source/status filter controls.
- Modify `ohouse-design-site/src/pages/index.astro`: restructure home around global axes, representative shortcuts, updated screens, and recommended browse cards.
- Create `ohouse-design-site/src/components/BrowseShell.astro`: shared layout for axis browse pages.
- Create `ohouse-design-site/src/components/AxisSidebar.astro`: axis-specific left navigation.
- Create `ohouse-design-site/src/components/ReferenceCard.astro`: reusable card for browse results.
- Create `ohouse-design-site/src/pages/categories.astro`: category/domain browse page.
- Create `ohouse-design-site/src/pages/screens.astro`: UX pattern browse page.
- Create `ohouse-design-site/src/pages/ui-elements.astro`: UI element browse page.
- Create `ohouse-design-site/src/pages/flows.astro`: flow browse page.
- Modify `ohouse-design-site/src/pages/d/[domain].astro`: add relationship-oriented tabs and replace `HTML / Figma` counts with OS/source metadata.
- Modify `ohouse-design-site/src/styles/global.css`: add styles for axis nav, overlay, browse shell, side nav, filter chips, and cards.

## Task 1: IA Config and Derived Browse Data

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js`

- [ ] **Step 1: Add IA constants near `CATEGORIES`**

Add these exports after the existing `CATEGORIES` export:

```js
export const OS_OPTIONS = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
  { value: 'mobile-web', label: 'Mobile Web' },
];

export const SOURCE_OPTIONS = [
  { value: 'html', label: 'HTML' },
  { value: 'figma', label: 'Figma' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'prototype', label: 'Prototype' },
];

export const STATUS_OPTIONS = [
  { value: 'verified', label: 'Verified' },
  { value: 'draft', label: 'Draft' },
  { value: 'missing-ods', label: 'Missing ODS' },
  { value: 'code-connect', label: 'Code Connect' },
];

export const DISCOVERY_AXES = [
  {
    id: 'categories',
    label: 'Categories',
    href: 'categories',
    summary: 'Browse by Ohouse product domains.',
    featured: ['home', 'shopping', 'content-detail', 'mypage', 'search'],
  },
  {
    id: 'screens',
    label: 'Screens',
    href: 'screens',
    summary: 'Browse reusable UX screen patterns.',
    featured: ['onboarding', 'product-detail', 'search-result', 'checkout', 'profile'],
  },
  {
    id: 'ui-elements',
    label: 'UI Elements',
    href: 'ui-elements',
    summary: 'Browse ODS and product component usage.',
    featured: ['cards', 'navigation', 'bottom-sheet', 'form', 'carousel'],
  },
  {
    id: 'flows',
    label: 'Flows',
    href: 'flows',
    summary: 'Browse multi-step user journeys.',
    featured: ['signup', 'login', 'purchase', 'bookmark', 'share'],
  },
];
```

- [ ] **Step 2: Add taxonomy constants**

Add these exports after `DISCOVERY_AXES`:

```js
export const SCREEN_PATTERNS = [
  { slug: 'onboarding', label: 'Onboarding', group: 'Account', countHint: 4 },
  { slug: 'product-detail', label: 'Product Detail', group: 'Commerce', countHint: 7 },
  { slug: 'search-result', label: 'Search Result', group: 'Discovery', countHint: 5 },
  { slug: 'checkout', label: 'Checkout', group: 'Commerce', countHint: 3 },
  { slug: 'profile', label: 'Profile', group: 'Account', countHint: 4 },
  { slug: 'feed', label: 'Feed', group: 'Content', countHint: 5 },
  { slug: 'settings', label: 'Settings', group: 'Account', countHint: 2 },
  { slug: 'empty-state', label: 'Empty State', group: 'System', countHint: 3 },
  { slug: 'error-state', label: 'Error State', group: 'System', countHint: 2 },
];

export const UI_ELEMENT_GROUPS = [
  { slug: 'ods-components', label: 'ODS Components', group: 'System', countHint: 12 },
  { slug: 'product-components', label: 'Product Components', group: 'Product', countHint: 8 },
  { slug: 'cards', label: 'Cards', group: 'Layout', countHint: 10 },
  { slug: 'navigation', label: 'Navigation', group: 'Navigation', countHint: 7 },
  { slug: 'bottom-sheet', label: 'Bottom Sheet', group: 'Overlay', countHint: 5 },
  { slug: 'modal', label: 'Modal', group: 'Overlay', countHint: 4 },
  { slug: 'toast', label: 'Toast', group: 'Feedback', countHint: 3 },
  { slug: 'form', label: 'Form', group: 'Input', countHint: 6 },
  { slug: 'carousel', label: 'Carousel', group: 'Content', countHint: 4 },
];

export const FLOW_GROUPS = [
  { slug: 'account', label: 'Account', group: 'Account', countHint: 5 },
  { slug: 'commerce', label: 'Commerce', group: 'Commerce', countHint: 8 },
  { slug: 'content', label: 'Content', group: 'Content', countHint: 4 },
  { slug: 'search', label: 'Search', group: 'Discovery', countHint: 3 },
  { slug: 'membership', label: 'Membership', group: 'Commerce', countHint: 3 },
  { slug: 'permission', label: 'Permission', group: 'System', countHint: 2 },
  { slug: 'order', label: 'Order', group: 'Commerce', countHint: 4 },
];
```

- [ ] **Step 3: Add metadata helpers before `getAllDomains()`**

```js
function fallbackOs(index) {
  return OS_OPTIONS[index % OS_OPTIONS.length].value;
}

function fallbackSource(index) {
  return SOURCE_OPTIONS[index % 2].value;
}

function markerStatus(markers) {
  if (markers.some((m) => m.kind === 'missing-ods')) return 'missing-ods';
  if (markers.some((m) => m.kind === 'code-connect')) return 'code-connect';
  return 'verified';
}

function findTaxonomyBySlug(slug, list) {
  return list.find((item) => slug.includes(item.slug) || item.slug.includes(slug));
}
```

- [ ] **Step 4: Add browse helper exports near screen helpers**

```js
export function getAxisSidebarItems(axis) {
  if (axis === 'categories') {
    return [{ slug: 'all', label: 'All Categories', count: getAllDomains().length }]
      .concat(getAllDomains().map((d) => ({ slug: d.slug, label: d.label, count: d.counts.screens })));
  }
  if (axis === 'screens') {
    return [{ slug: 'all', label: 'All Screens', count: getAllBrowseCards('screens').length }]
      .concat(SCREEN_PATTERNS.map((p) => ({ slug: p.slug, label: p.label, count: p.countHint })));
  }
  if (axis === 'ui-elements') {
    return [{ slug: 'all', label: 'All Elements', count: getAllBrowseCards('ui-elements').length }]
      .concat(UI_ELEMENT_GROUPS.map((p) => ({ slug: p.slug, label: p.label, count: p.countHint })));
  }
  if (axis === 'flows') {
    return [{ slug: 'all', label: 'All Flows', count: getAllBrowseCards('flows').length }]
      .concat(FLOW_GROUPS.map((p) => ({ slug: p.slug, label: p.label, count: p.countHint })));
  }
  return [];
}

export function getAllBrowseCards(axis = 'screens') {
  const domains = getAllDomains();
  if (axis === 'categories') {
    return domains.map((domain, index) => ({
      id: domain.slug,
      label: domain.label,
      summary: domain.description || `${domain.label} domain references`,
      href: withBase(`d/${domain.slug}`),
      domain: domain.label,
      os: fallbackOs(index),
      source: fallbackSource(index),
      status: domain.counts.screens > 0 ? 'verified' : 'draft',
      count: domain.counts.screens,
    }));
  }

  const cards = [];
  domains.forEach((domain) => {
    getDomainScreens(domain.slug).forEach((screen, localIndex) => {
      const index = cards.length + localIndex;
      const pattern = findTaxonomyBySlug(screen.slug, SCREEN_PATTERNS) || SCREEN_PATTERNS[index % SCREEN_PATTERNS.length];
      const element = UI_ELEMENT_GROUPS[index % UI_ELEMENT_GROUPS.length];
      const flow = FLOW_GROUPS[index % FLOW_GROUPS.length];
      const markers = screen.markers || [];
      cards.push({
        id: `${domain.slug}-${screen.slug}`,
        label: screen.label,
        summary: screen.summary || `${domain.label} · ${pattern.label}`,
        href: withBase(`d/${domain.slug}/s/${screen.slug}`),
        domain: domain.label,
        os: fallbackOs(index),
        source: screen.prototype ? 'prototype' : fallbackSource(index),
        status: markerStatus(markers),
        pattern: pattern.label,
        element: element.label,
        flow: flow.label,
        thumb: screen.thumb,
        markers,
      });
    });
  });

  if (axis === 'ui-elements') {
    return cards.map((card) => ({ ...card, label: card.element, summary: `${card.element} usage in ${card.domain}` }));
  }
  if (axis === 'flows') {
    return cards.map((card) => ({ ...card, label: card.flow, summary: `${card.flow} flow reference in ${card.domain}` }));
  }
  return cards;
}

export function getOverlayGroups(axis) {
  const source = axis === 'screens' ? SCREEN_PATTERNS : axis === 'ui-elements' ? UI_ELEMENT_GROUPS : axis === 'flows' ? FLOW_GROUPS : [];
  if (axis === 'categories') {
    return Object.entries(CATEGORIES).map(([group, slugs]) => ({
      group,
      items: slugs.map((slug) => {
        const domain = getDomain(slug);
        return { slug, label: domain?.label || slug, count: domain?.counts?.screens || 0, href: withBase(`d/${slug}`) };
      }),
    }));
  }
  const grouped = new Map();
  source.forEach((item) => {
    if (!grouped.has(item.group)) grouped.set(item.group, []);
    grouped.get(item.group).push({
      slug: item.slug,
      label: item.label,
      count: item.countHint,
      href: withBase(`${axis}?item=${item.slug}`),
    });
  });
  return Array.from(grouped.entries()).map(([group, items]) => ({ group, items }));
}
```

- [ ] **Step 5: Run build to catch export or path errors**

Run:

```bash
cd ohouse-design-site
npm run build
```

Expected: build completes. If it fails because newly added helpers reference functions before declaration, move helper definitions below the referenced functions without changing their exported names.

- [ ] **Step 6: Commit**

```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: add IA browse data helpers"
```

## Task 2: Global Axis Navigation and Browse Overlay

**Files:**
- Modify: `ohouse-design-site/src/components/Nav.astro`
- Modify: `ohouse-design-site/src/styles/global.css`

- [ ] **Step 1: Replace Nav data imports and tabs**

In `Nav.astro`, import the IA data:

```astro
import { DISCOVERY_AXES, getOverlayGroups } from '../lib/repo.js';
```

Replace the current `tabs` array with:

```js
const axes = DISCOVERY_AXES.map((axis) => ({
  ...axis,
  href: `${base}${axis.href}`,
  active: rel === `/${axis.href}` || rel.startsWith(`/${axis.href}/`),
  groups: getOverlayGroups(axis.id),
}));
const designSystemActive = rel.startsWith('/ods');
```

- [ ] **Step 2: Replace the `nav-tabs` markup**

Use this markup inside `.nav-left` after the brand link:

```astro
<nav class="nav-tabs" aria-label="Ohouse Design browse axes">
  {axes.map((axis) => (
    <div class="nav-axis" data-axis-root>
      <a href={axis.href} class={`nav-tab${axis.active ? ' is-active' : ''}`} data-axis-trigger={axis.id}>
        {axis.label}
      </a>
      <div class="nav-overlay" data-axis-overlay={axis.id} hidden>
        <div class="nav-overlay__rail">
          <div class="nav-overlay__eyebrow">Browse</div>
          {axes.map((item) => (
            <a class={`nav-overlay__rail-item${item.id === axis.id ? ' is-active' : ''}`} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <div class="nav-overlay__body">
          <div class="nav-overlay__head">
            <strong>{axis.label}</strong>
            <span>{axis.summary}</span>
          </div>
          <div class="nav-overlay__groups">
            {axis.groups.map((group) => (
              <section class="nav-overlay__group">
                <h3>{group.group}</h3>
                {group.items.map((item) => (
                  <a class="nav-overlay__item" href={item.href}>
                    <span>{item.label}</span>
                    <span>{item.count}</span>
                  </a>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  ))}
  <a href={`${base}ods`} class={`nav-tab nav-tab--system${designSystemActive ? ' is-active' : ''}`}>
    Design system
  </a>
</nav>
```

- [ ] **Step 3: Add overlay client script before `</header>`**

```astro
<script>
  function initAxisOverlay() {
    document.querySelectorAll<HTMLElement>('[data-axis-root]').forEach((root) => {
      if (root.dataset.bound) return;
      root.dataset.bound = '1';
      const trigger = root.querySelector<HTMLElement>('[data-axis-trigger]');
      const overlay = root.querySelector<HTMLElement>('[data-axis-overlay]');
      if (!trigger || !overlay) return;
      let closeTimer: number | null = null;
      function open() {
        if (closeTimer) window.clearTimeout(closeTimer);
        overlay.hidden = false;
      }
      function closeSoon() {
        closeTimer = window.setTimeout(() => { overlay.hidden = true; }, 120);
      }
      root.addEventListener('mouseenter', open);
      root.addEventListener('mouseleave', closeSoon);
      trigger.addEventListener('focus', open);
      root.addEventListener('focusout', (e) => {
        if (!root.contains(e.relatedTarget as Node | null)) overlay.hidden = true;
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') overlay.hidden = true;
      });
    });
  }
  initAxisOverlay();
  document.addEventListener('astro:page-load', initAxisOverlay);
</script>
```

- [ ] **Step 4: Add overlay CSS**

Append styles to `global.css` near the nav section:

```css
.nav-axis{position:relative}
.nav-overlay{
  position:absolute;top:42px;left:50%;transform:translateX(-18%);
  width:min(840px,calc(100vw - 48px));min-height:420px;
  display:grid;grid-template-columns:220px 1fr;gap:0;
  background:rgba(34,34,34,.96);color:#fff;border-radius:24px;
  box-shadow:0 28px 80px rgba(0,0,0,.24);overflow:hidden;padding:24px;z-index:80;
}
.nav-overlay[hidden]{display:none}
.nav-overlay__rail{display:flex;flex-direction:column;gap:8px;border-right:1px solid rgba(255,255,255,.12);padding-right:18px}
.nav-overlay__eyebrow{font-size:12px;font-weight:700;color:rgba(255,255,255,.45);text-transform:uppercase}
.nav-overlay__rail-item{padding:10px 12px;border-radius:12px;color:rgba(255,255,255,.72);font-weight:700}
.nav-overlay__rail-item:hover,.nav-overlay__rail-item.is-active{background:rgba(255,255,255,.12);color:#fff}
.nav-overlay__body{padding-left:24px;min-width:0}
.nav-overlay__head{display:flex;flex-direction:column;gap:4px;margin-bottom:20px}
.nav-overlay__head strong{font-size:20px}
.nav-overlay__head span{font-size:13px;color:rgba(255,255,255,.56)}
.nav-overlay__groups{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px 28px;max-height:330px;overflow:auto;padding-right:8px}
.nav-overlay__group h3{font-size:12px;color:rgba(255,255,255,.42);margin-bottom:8px}
.nav-overlay__item{display:flex;justify-content:space-between;gap:16px;padding:7px 0;color:rgba(255,255,255,.88);font-size:14px;font-weight:650}
.nav-overlay__item span:last-child{color:rgba(255,255,255,.42);font-variant-numeric:tabular-nums}
.nav-tab--system{color:var(--c-text-muted)}
@media (max-width:960px){.nav-overlay{display:none}.nav-overlay:not([hidden]){display:none}}
```

- [ ] **Step 5: Build and smoke-check nav**

Run:

```bash
cd ohouse-design-site
npm run build
```

Expected: build completes and no Astro syntax errors are reported.

- [ ] **Step 6: Commit**

```bash
git add ohouse-design-site/src/components/Nav.astro ohouse-design-site/src/styles/global.css
git commit -m "feat: add global IA navigation overlay"
```

## Task 3: Filter Bar Rework

**Files:**
- Modify: `ohouse-design-site/src/components/FilterBar.astro`
- Modify: `ohouse-design-site/src/styles/global.css`

- [ ] **Step 1: Replace filter data**

In `FilterBar.astro`, import filter options:

```astro
import { OS_OPTIONS, SOURCE_OPTIONS, STATUS_OPTIONS } from '../lib/repo.js';
```

Replace `types` with:

```js
const osOptions = [{ value: 'all', label: 'All OS' }, ...OS_OPTIONS];
const sourceOptions = [{ value: 'all', label: 'All Sources' }, ...SOURCE_OPTIONS];
const statusOptions = [{ value: 'all', label: 'All Status' }, ...STATUS_OPTIONS];
```

- [ ] **Step 2: Replace markup with OS/source/status controls**

```astro
<div class="fbar">
  <div class="fbar__platform" id="osToggle" aria-label="OS filter">
    {osOptions.map((t) => (
      <button type="button" class={`fbar__pf${t.value === 'all' ? ' is-active' : ''}`} data-filter-key="os" data-filter-value={t.value}>
        {t.label}
      </button>
    ))}
  </div>

  <div class="fbar__selects">
    <select class="fbar__select" data-filter-key="source" aria-label="Source filter">
      {sourceOptions.map((t) => <option value={t.value}>{t.label}</option>)}
    </select>
    <select class="fbar__select" data-filter-key="status" aria-label="Status filter">
      {statusOptions.map((t) => <option value={t.value}>{t.label}</option>)}
    </select>
  </div>

  <div class="fbar__sort">
    {sorts.map((s) => (
      <button type="button" class={`fbar__sort-item${s.value === sort ? ' is-active' : ''}`} data-sort={s.value}>
        {s.label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 3: Add select styling**

Append to `global.css` near existing `.fbar` rules:

```css
.fbar__selects{display:flex;align-items:center;gap:8px}
.fbar__select{
  height:36px;border:1px solid var(--c-border);border-radius:999px;background:#fff;
  padding:0 32px 0 12px;font-family:inherit;font-size:13px;font-weight:600;color:var(--c-text);
}
@media (max-width:760px){.fbar{align-items:flex-start}.fbar__selects{width:100%;overflow-x:auto}}
```

- [ ] **Step 4: Build**

Run:

```bash
cd ohouse-design-site
npm run build
```

Expected: build completes.

- [ ] **Step 5: Commit**

```bash
git add ohouse-design-site/src/components/FilterBar.astro ohouse-design-site/src/styles/global.css
git commit -m "feat: replace source toggle with IA filters"
```

## Task 4: Browse Components and Axis Pages

**Files:**
- Create: `ohouse-design-site/src/components/AxisSidebar.astro`
- Create: `ohouse-design-site/src/components/ReferenceCard.astro`
- Create: `ohouse-design-site/src/components/BrowseShell.astro`
- Create: `ohouse-design-site/src/pages/categories.astro`
- Create: `ohouse-design-site/src/pages/screens.astro`
- Create: `ohouse-design-site/src/pages/ui-elements.astro`
- Create: `ohouse-design-site/src/pages/flows.astro`
- Modify: `ohouse-design-site/src/styles/global.css`

- [ ] **Step 1: Create `AxisSidebar.astro`**

```astro
---
const { title, items = [], active = 'all' } = Astro.props;
---

<aside class="axis-side">
  <div class="axis-side__title">{title}</div>
  <nav class="axis-side__nav" aria-label={`${title} navigation`}>
    {items.map((item) => (
      <a class={`axis-side__item${item.slug === active ? ' is-active' : ''}`} href={item.href || `?item=${item.slug}`}>
        <span>{item.label}</span>
        <span>{item.count}</span>
      </a>
    ))}
  </nav>
</aside>
```

- [ ] **Step 2: Create `ReferenceCard.astro`**

```astro
---
const { item } = Astro.props;
const osLabel = String(item.os || '').replace('mobile-web', 'Mobile Web').replace('ios', 'iOS').replace('android', 'Android').replace('web', 'Web');
---

<a class="ref-card" href={item.href}>
  <div class="ref-card__preview">
    {item.thumb ? <img src={item.thumb} alt={item.label} /> : <span>{item.label.slice(0, 1)}</span>}
  </div>
  <div class="ref-card__body">
    <div class="ref-card__meta">
      <span>{osLabel}</span>
      <span>{item.source}</span>
      <span>{item.status}</span>
    </div>
    <h3>{item.label}</h3>
    <p>{item.summary}</p>
    <div class="ref-card__chips">
      {item.domain && <span>{item.domain}</span>}
      {item.pattern && <span>{item.pattern}</span>}
      {item.element && <span>{item.element}</span>}
      {item.flow && <span>{item.flow}</span>}
    </div>
  </div>
</a>
```

- [ ] **Step 3: Create `BrowseShell.astro`**

```astro
---
import Layout from '../layouts/Layout.astro';
import FilterBar from './FilterBar.astro';
import AxisSidebar from './AxisSidebar.astro';
import ReferenceCard from './ReferenceCard.astro';

const { title, eyebrow, summary, sidebarItems, items, active = 'all' } = Astro.props;
---

<Layout title={title}>
  <main class="browse">
    <div class="wrap">
      <header class="browse__head">
        <span class="browse__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{summary}</p>
      </header>
      <FilterBar sort="latest" />
      <div class="browse__layout">
        <AxisSidebar title={title} items={sidebarItems} active={active} />
        <section class="browse__results" aria-label={`${title} results`}>
          {items.length === 0 ? (
            <div class="empty">
              <div class="empty__title">표시할 항목이 없습니다</div>
              <div class="empty__hint">콘텐츠 메타데이터가 추가되면 여기에 표시됩니다.</div>
            </div>
          ) : (
            <div class="ref-grid">
              {items.map((item) => <ReferenceCard item={item} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  </main>
</Layout>
```

- [ ] **Step 4: Create axis pages**

Create `categories.astro`:

```astro
---
import BrowseShell from '../components/BrowseShell.astro';
import { getAllBrowseCards, getAxisSidebarItems } from '../lib/repo.js';
---

<BrowseShell
  title="Categories"
  eyebrow="Domain browsing"
  summary="오늘의집 도메인 기준으로 화면, 정책, 실험, 컴포넌트 자산을 탐색합니다."
  sidebarItems={getAxisSidebarItems('categories')}
  items={getAllBrowseCards('categories')}
/>
```

Create `screens.astro`:

```astro
---
import BrowseShell from '../components/BrowseShell.astro';
import { getAllBrowseCards, getAxisSidebarItems } from '../lib/repo.js';
---

<BrowseShell
  title="Screens"
  eyebrow="UX pattern browsing"
  summary="도메인을 넘어서 유사한 화면 패턴을 찾고 비교합니다."
  sidebarItems={getAxisSidebarItems('screens')}
  items={getAllBrowseCards('screens')}
/>
```

Create `ui-elements.astro`:

```astro
---
import BrowseShell from '../components/BrowseShell.astro';
import { getAllBrowseCards, getAxisSidebarItems } from '../lib/repo.js';
---

<BrowseShell
  title="UI Elements"
  eyebrow="Component browsing"
  summary="ODS 컴포넌트와 제품 전용 UI 요소의 활용처를 탐색합니다."
  sidebarItems={getAxisSidebarItems('ui-elements')}
  items={getAllBrowseCards('ui-elements')}
/>
```

Create `flows.astro`:

```astro
---
import BrowseShell from '../components/BrowseShell.astro';
import { getAllBrowseCards, getAxisSidebarItems } from '../lib/repo.js';
---

<BrowseShell
  title="Flows"
  eyebrow="Journey browsing"
  summary="가입, 구매, 저장, 공유처럼 여러 화면으로 이어지는 사용자 여정을 탐색합니다."
  sidebarItems={getAxisSidebarItems('flows')}
  items={getAllBrowseCards('flows')}
/>
```

- [ ] **Step 5: Add browse styles**

Append to `global.css`:

```css
.browse{padding:56px 0 96px}
.browse__head{max-width:720px;margin-bottom:24px}
.browse__eyebrow{display:block;font-size:12px;font-weight:800;color:var(--c-text-soft);text-transform:uppercase;margin-bottom:8px}
.browse__head h1{font-size:56px;line-height:1;font-weight:800;letter-spacing:-0.035em;margin-bottom:12px}
.browse__head p{font-size:17px;color:var(--c-text-muted)}
.browse__layout{display:grid;grid-template-columns:240px minmax(0,1fr);gap:32px;margin-top:24px;align-items:start}
.axis-side{position:sticky;top:120px;border-right:1px solid var(--c-border);padding-right:16px}
.axis-side__title{font-size:13px;font-weight:800;margin-bottom:10px;color:var(--c-text-soft)}
.axis-side__nav{display:flex;flex-direction:column;gap:4px}
.axis-side__item{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 10px;border-radius:10px;color:var(--c-text-muted);font-weight:650;font-size:14px}
.axis-side__item:hover,.axis-side__item.is-active{background:var(--c-bg-elev);color:var(--c-text)}
.axis-side__item span:last-child{font-size:12px;color:var(--c-text-soft);font-variant-numeric:tabular-nums}
.ref-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.ref-card{display:flex;flex-direction:column;background:#fff;border:1px solid var(--c-border-soft);border-radius:20px;overflow:hidden;box-shadow:var(--sh-sm);transition:transform .18s ease,box-shadow .18s ease}
.ref-card:hover{transform:translateY(-2px);box-shadow:var(--sh-md)}
.ref-card__preview{aspect-ratio:4/3;background:var(--c-bg-elev);display:flex;align-items:center;justify-content:center;overflow:hidden}
.ref-card__preview img{width:100%;height:100%;object-fit:cover}
.ref-card__preview span{font-size:44px;font-weight:800;color:var(--c-text-soft)}
.ref-card__body{padding:14px;display:flex;flex-direction:column;gap:8px}
.ref-card__meta{display:flex;flex-wrap:wrap;gap:6px}
.ref-card__meta span,.ref-card__chips span{font-size:11px;font-weight:700;color:var(--c-text-muted);background:var(--c-bg-elev);border-radius:999px;padding:3px 8px}
.ref-card h3{font-size:16px;line-height:1.25}
.ref-card p{font-size:13px;color:var(--c-text-muted);min-height:36px}
.ref-card__chips{display:flex;flex-wrap:wrap;gap:6px}
@media (max-width:860px){.browse__layout{grid-template-columns:1fr}.axis-side{position:static;border-right:0;padding-right:0}.axis-side__nav{flex-direction:row;overflow-x:auto}.axis-side__item{white-space:nowrap}}
```

- [ ] **Step 6: Build**

Run:

```bash
cd ohouse-design-site
npm run build
```

Expected: build completes and static routes include `/categories`, `/screens`, `/ui-elements`, and `/flows`.

- [ ] **Step 7: Commit**

```bash
git add ohouse-design-site/src/components/AxisSidebar.astro ohouse-design-site/src/components/ReferenceCard.astro ohouse-design-site/src/components/BrowseShell.astro ohouse-design-site/src/pages/categories.astro ohouse-design-site/src/pages/screens.astro ohouse-design-site/src/pages/ui-elements.astro ohouse-design-site/src/pages/flows.astro ohouse-design-site/src/styles/global.css
git commit -m "feat: add IA browse pages"
```

## Task 5: Home IA Update

**Files:**
- Modify: `ohouse-design-site/src/pages/index.astro`
- Modify: `ohouse-design-site/src/styles/global.css`

- [ ] **Step 1: Update imports**

Replace the import block in `index.astro` with:

```astro
import Layout from '../layouts/Layout.astro';
import FilterBar from '../components/FilterBar.astro';
import ReferenceCard from '../components/ReferenceCard.astro';
import { DISCOVERY_AXES, getAllBrowseCards, getOverlayGroups } from '../lib/repo.js';
```

- [ ] **Step 2: Replace page constants**

Replace domain/menu constants with:

```js
const base = import.meta.env.BASE_URL;
const axes = DISCOVERY_AXES.map((axis) => ({
  ...axis,
  href: `${base}${axis.href}`,
  groups: getOverlayGroups(axis.id),
}));
const recommended = getAllBrowseCards('screens').slice(0, 12);
```

- [ ] **Step 3: Replace home markup**

Use this body inside `<Layout>`:

```astro
<Layout title="Ohouse Design">
  <main class="wrap home home-v2">
    <section class="home-hero">
      <div>
        <span class="home-hero__eyebrow">Ohouse Design Reference</span>
        <h1>Find screens, elements, flows, and domains in one place.</h1>
      </div>
    </section>

    <section class="axis-grid" aria-label="Browse axes">
      {axes.map((axis) => (
        <a class="axis-card" href={axis.href}>
          <span class="axis-card__label">{axis.label}</span>
          <strong>{axis.summary}</strong>
          <div class="axis-card__links">
            {axis.featured.map((item) => <span>{item}</span>)}
          </div>
        </a>
      ))}
    </section>

    <FilterBar sort="latest" />

    <section class="home-section">
      <div class="sechead">
        <div class="sechead__title">Recently updated references</div>
        <div class="sechead__count">{recommended.length} items</div>
      </div>
      <div class="ref-grid">
        {recommended.map((item) => <ReferenceCard item={item} />)}
      </div>
    </section>
  </main>
</Layout>
```

- [ ] **Step 4: Remove old home script**

Delete the old script that binds `.dcard`, `#typeToggle`, and Figma move toast from `index.astro`. The new home uses simple links and shared filter controls.

- [ ] **Step 5: Add home IA styles**

Append to `global.css`:

```css
.home-v2{padding-top:56px;padding-bottom:96px}
.home-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:40px;align-items:end;margin-bottom:28px}
.home-hero__eyebrow{display:block;font-size:12px;font-weight:800;color:var(--c-text-soft);text-transform:uppercase;margin-bottom:10px}
.home-hero h1{font-size:64px;line-height:.98;font-weight:850;letter-spacing:-0.04em;max-width:760px}
.home-hero p{font-size:17px;color:var(--c-text-muted)}
.axis-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin:24px 0}
.axis-card{min-height:176px;border:1px solid var(--c-border);border-radius:20px;padding:18px;display:flex;flex-direction:column;gap:12px;background:#fff;transition:background .16s ease,transform .16s ease}
.axis-card:hover{background:var(--c-bg-soft);transform:translateY(-2px)}
.axis-card__label{font-size:13px;font-weight:800;color:var(--c-accent)}
.axis-card strong{font-size:19px;line-height:1.25}
.axis-card__links{display:flex;flex-wrap:wrap;gap:6px;margin-top:auto}
.axis-card__links span{font-size:11px;font-weight:700;color:var(--c-text-muted);background:var(--c-bg-elev);border-radius:999px;padding:3px 8px}
.home-section{margin-top:28px}
@media (max-width:960px){.home-hero{grid-template-columns:1fr}.axis-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.home-hero h1{font-size:48px}}
@media (max-width:560px){.axis-grid{grid-template-columns:1fr}.home-hero h1{font-size:40px}}
```

- [ ] **Step 6: Build**

Run:

```bash
cd ohouse-design-site
npm run build
```

Expected: build completes.

- [ ] **Step 7: Commit**

```bash
git add ohouse-design-site/src/pages/index.astro ohouse-design-site/src/styles/global.css
git commit -m "feat: redesign home around IA axes"
```

## Task 6: Domain Detail IA Update

**Files:**
- Modify: `ohouse-design-site/src/pages/d/[domain].astro`

- [ ] **Step 1: Replace tab labels**

Replace the `tabs` constant with:

```js
const tabs = [
  { id: 'overview', label: 'Overview', count: null },
  { id: 'screens', label: 'Screens', count: screens.length },
  { id: 'patterns', label: 'UX Patterns', count: Math.min(screens.length, 6) },
  { id: 'elements', label: 'UI Elements', count: components.length },
  { id: 'flows', label: 'Flows', count: Math.min(screens.length, 4) },
  { id: 'policies', label: 'Policies', count: policies.length },
  { id: 'experiments', label: 'Experiments', count: experiments.length },
];
```

- [ ] **Step 2: Add overview panel before Screens**

Add this panel before the existing Screens panel:

```astro
<div class="dpanel" data-panel="overview">
  <div class="sechead">
    <div class="sechead__title">Overview</div>
    <div class="sechead__count">{screens.length} screens · {components.length} elements</div>
  </div>
  <div class="lgrid">
    <div class="lcard">
      <div class="lcard__head"><span class="lcard__title">Browse by screens</span></div>
      <p class="lcard__summary">이 도메인의 최신 화면과 프로토타입 소스를 확인합니다.</p>
    </div>
    <div class="lcard">
      <div class="lcard__head"><span class="lcard__title">Find related UI elements</span></div>
      <p class="lcard__summary">ODS 적용 또는 도메인 전용 컴포넌트 사용처를 확인합니다.</p>
    </div>
    <div class="lcard">
      <div class="lcard__head"><span class="lcard__title">Connect flows</span></div>
      <p class="lcard__summary">가입, 구매, 저장, 공유처럼 화면을 넘나드는 여정과 연결합니다.</p>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Add patterns, elements, and flows panels**

Rename the current Components panel `data-panel` from `components` to `elements`, and change title from `Screen-only Components` to `UI Elements`.

Add these panels after Screens and before Elements:

```astro
<div class="dpanel" data-panel="patterns" hidden>
  <div class="sechead">
    <div class="sechead__title">UX Patterns</div>
    <div class="sechead__count">Derived from screen references</div>
  </div>
  <div class="lgrid">
    {screens.slice(0, 6).map((s) => (
      <div class="lcard">
        <div class="lcard__head"><span class="lcard__title">{s.label}</span><span class="badge">pattern</span></div>
        <p class="lcard__summary">유사 화면 패턴 탐색을 위한 도메인 내 참조입니다.</p>
      </div>
    ))}
  </div>
</div>

<div class="dpanel" data-panel="flows" hidden>
  <div class="sechead">
    <div class="sechead__title">Flows</div>
    <div class="sechead__count">Journey references</div>
  </div>
  <div class="lgrid">
    {['Purchase', 'Bookmark', 'Share', 'Account'].slice(0, Math.max(1, Math.min(screens.length, 4))).map((flow) => (
      <div class="lcard">
        <div class="lcard__head"><span class="lcard__title">{flow}</span><span class="badge badge--accent">flow</span></div>
        <p class="lcard__summary">이 도메인 화면과 연결되는 사용자 여정입니다.</p>
      </div>
    ))}
  </div>
</div>
```

- [ ] **Step 4: Change initial tab to overview**

Update the active tab class and initial script default:

```astro
class={`dtab${t.id === 'overview' ? ' is-active' : ''}`}
```

Update script:

```js
const initial = new URLSearchParams(window.location.search).get('tab') || 'overview';
if (initial !== 'overview') activate(initial);
```

- [ ] **Step 5: Build**

Run:

```bash
cd ohouse-design-site
npm run build
```

Expected: build completes and domain pages render with `Overview`, `UX Patterns`, `UI Elements`, and `Flows`.

- [ ] **Step 6: Commit**

```bash
git add 'ohouse-design-site/src/pages/d/[domain].astro'
git commit -m "feat: update domain detail IA"
```

## Task 7: End-to-End Verification

**Files:**
- No source edits expected unless verification reveals defects.

- [ ] **Step 1: Run production build**

```bash
cd ohouse-design-site
npm run build
```

Expected: `npm run validate:ods-previews` passes and Astro build completes.

- [ ] **Step 2: Start dev server**

```bash
cd ohouse-design-site
npm run dev -- --host 127.0.0.1
```

Expected: Astro prints a local URL, usually `http://127.0.0.1:4321/`.

- [ ] **Step 3: Manually check key routes**

Open the local URL and verify:

- `/` shows `Categories`, `Screens`, `UI Elements`, and `Flows` axis cards.
- Hovering top axis labels on desktop opens the browse overlay.
- `/categories`, `/screens`, `/ui-elements`, and `/flows` render a left side navigation and result grid.
- `/d/home` opens on `Overview` and can switch to `Screens`, `UX Patterns`, `UI Elements`, `Flows`, `Policies`, and `Experiments`.
- OS/source/status filters are visible and no longer present `HTML / Figma` as the main browse axis.

- [ ] **Step 4: Commit any verification fixes**

If source edits were required:

```bash
git add ohouse-design-site/src
git commit -m "fix: polish IA browse experience"
```

If no edits were required, do not create an empty commit.

## Self-Review

- Spec coverage: Tasks cover global axes, overlay, left side navigation, OS/source/status filters, home IA, browse pages, and domain detail IA.
- Deferred scope is explicit: full content metadata migration, real analytics, full search indexing, and production Figma deep links remain out of scope.
- Type consistency: Axis ids are `categories`, `screens`, `ui-elements`, and `flows` across helpers, nav, pages, and shell components.
- Verification: Every implementation task ends with `npm run build`; final verification includes dev-server route checks.

