import { readFileSync } from 'fs';
import { resolve } from 'path';

const homePath = resolve(process.cwd(), 'dist/index.html');
const homeSourcePath = resolve(process.cwd(), 'src/pages/index.astro');
const axisSidebarSourcePath = resolve(process.cwd(), 'src/components/AxisSidebar.astro');
const referenceCardSourcePath = resolve(process.cwd(), 'src/components/ReferenceCard.astro');
const filterBarSourcePath = resolve(process.cwd(), 'src/components/FilterBar.astro');
const html = readFileSync(homePath, 'utf8');
const source = `${readFileSync(homeSourcePath, 'utf8')}\n${readFileSync(axisSidebarSourcePath, 'utf8')}\n${readFileSync(referenceCardSourcePath, 'utf8')}\n${readFileSync(filterBarSourcePath, 'utf8')}`;
const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8');

const requiredSnippets = [
  'class="wrap home home-v2"',
  'Find screens, elements, flows, and domains in one place.',
  'Patterns',
  'data-home-browse-root',
  'data-home-axis-option="categories"',
  'data-home-axis-option="screens"',
  'data-home-axis-option="ui-elements"',
  'data-home-axis-option="flows"',
  'data-home-axis-panel="categories"',
  'data-home-axis-panel="screens"',
  'data-home-axis-panel="ui-elements"',
  'data-home-axis-panel="flows"',
  'class="browse-title-menu"',
  'class="browse-title-link"',
  'class="browse-title-link__arrow"',
  'class="browse-title-menu__item"',
  'class="home-browse__sticky"',
  'class="browse__layout home-browse__layout"',
  'class="fbar__mobile-icon"',
  'data-home-category-sidebar',
  'data-domain-entry-banner',
  'data-domain-entry-href',
  'data-domain-slug',
  'data-home-results-title',
  '의 정책 · 실험 · 패턴',
  'data-domain-entry-badges',
  'Policies',
  'Experiments',
  'Components',
  'class="axis-side"',
  'class="axis-side__details axis-side__details--mobile"',
  'class="axis-side__summary"',
  'class="axis-side__nav axis-side__nav--desktop"',
  'data-axis-current',
  'class="ref-grid"',
];

const forbiddenSnippets = [
  'class="home-axis-switch"',
  'class="home-axis-switch__item',
  'class="axis-grid"',
  'class="menu5"',
  'class="banner banner--guide"',
  'class="axis-side__title"',
  '<details class="axis-side__details" open>',
  '<details class="axis-side__details axis-side__details--mobile" open>',
  '상세 페이지</strong>',
  'Screens</strong>',
  'Screens</h1>',
  'Screens</span>',
  'screens</small>',
  'id="grid"',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet) && !source.includes(snippet)) {
    throw new Error(`Home IA validation failed: missing snippet ${JSON.stringify(snippet)}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (html.includes(snippet)) {
    throw new Error(`Home IA validation failed: found deprecated snippet ${JSON.stringify(snippet)}`);
  }
}

const filterBetweenTitleAndLayout = [
  '<div class="home-browse__sticky">',
  '<header class="browse__head home-browse__head">',
  '<FilterBar sort="latest" />',
  '</div>',
  '<div class="browse__layout home-browse__layout">',
].every((snippet) => source.includes(snippet));

if (!filterBetweenTitleAndLayout) {
  throw new Error('Home IA validation failed: FilterBar is not placed between the axis title and browse layout.');
}

if (!css.includes('.browse-title-menu__item{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;text-align:left;')) {
  throw new Error('Home IA validation failed: title dropdown items are not left-aligned full-width controls.');
}

if (!css.includes('.browse-title-menu__item span:first-child{display:flex;flex-direction:column;align-items:flex-start;text-align:left;')) {
  throw new Error('Home IA validation failed: title dropdown text content is not explicitly left-aligned.');
}

if (!css.includes('.home-hero{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:40px;align-items:end;margin-bottom:160px}')) {
  throw new Error('Home IA validation failed: home hero bottom spacing was not expanded.');
}

if (!css.includes('.home-browse__head .browse__title-row{margin-bottom:18px}')) {
  throw new Error('Home IA validation failed: home axis title and summary spacing was not expanded.');
}

if (!source.includes('<span class="sechead__count" data-home-results-count>{axis.items.length}</span>')) {
  throw new Error('Home IA validation failed: results count is not rendered inline as a number-only value.');
}

if (!source.includes('if (count) count.textContent = String(visible.length);')) {
  throw new Error('Home IA validation failed: filtered results count is not updated as a number-only value.');
}

if (!css.includes('.domain-entry-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:16px 18px;border:0;border-radius:16px;background:#2f3338;color:#fff}')) {
  throw new Error('Home IA validation failed: domain entry banner is not styled as a dark gray callout.');
}

if (!css.includes('.domain-entry-badge span{color:rgba(255,255,255,.58);font-variant-numeric:tabular-nums}')) {
  throw new Error('Home IA validation failed: domain entry metadata counts are not muted numeric values.');
}

if (!css.includes('.axis-side__details:not([open]) .axis-side__nav{display:none}')) {
  throw new Error('Home IA validation failed: mobile sidebar is not collapsible.');
}

if (!source.includes('const activeLabel = findActiveLabel();') || !source.includes('<span class="axis-side__current" data-axis-current>{activeLabel}</span>')) {
  throw new Error('Home IA validation failed: collapsed sidebar does not show the current menu label.');
}

if (!source.includes('return group ? `${group} · ${label}` : label;')) {
  throw new Error('Home IA validation failed: category accordion label does not include parent group text.');
}

if (!css.includes('.axis-side__details{display:none}') || !css.includes('.axis-side__nav--desktop{display:none}')) {
  throw new Error('Home IA validation failed: desktop and mobile sidebar render modes are not separated.');
}

if (!css.includes('.axis-side__current{display:block;font-size:14px;font-weight:750;color:var(--c-text);')) {
  throw new Error('Home IA validation failed: current sidebar label is not styled for the collapsed mobile summary.');
}

if (
  !source.includes('function closeMobileSidebarMenu') ||
  !source.includes("closest<HTMLDetailsElement>('.axis-side__details--mobile[open]')") ||
  !source.includes('closeMobileSidebarMenu(categoryLink);')
) {
  throw new Error('Home IA validation failed: mobile sidebar accordion does not close after menu selection.');
}

if (!css.includes('.home-browse__sticky{position:sticky;top:64px;z-index:24;background:rgba(255,255,255,.92);backdrop-filter:saturate(180%) blur(12px);-webkit-backdrop-filter:saturate(180%) blur(12px);padding-top:1px}')) {
  throw new Error('Home IA validation failed: home browse controls are not sticky below the hero with nav-style blur.');
}

if (!css.includes('.home-browse__layout .axis-side{top:276px;max-height:calc(100vh - 300px);overflow:auto}')) {
  throw new Error('Home IA validation failed: home sidebar is not sticky under the browse controls.');
}

if (!css.includes('.fbar__sort-trigger,.fbar__filter{width:40px;height:40px;padding:0;justify-content:center}')) {
  throw new Error('Home IA validation failed: mobile sort and filter controls are not icon buttons.');
}

if (!css.includes('.fbar__label,.fbar__sort-trigger > .icon:last-child,.fbar__filter > .icon:last-child{display:none}')) {
  throw new Error('Home IA validation failed: mobile sort and filter text labels are not hidden.');
}

console.log('Home IA validation passed.');
