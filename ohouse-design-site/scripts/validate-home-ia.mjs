import { readFileSync } from 'fs';
import { resolve } from 'path';

const homePath = resolve(process.cwd(), 'dist/index.html');
const homeSourcePath = resolve(process.cwd(), 'src/pages/index.astro');
const referenceCardSourcePath = resolve(process.cwd(), 'src/components/ReferenceCard.astro');
const html = readFileSync(homePath, 'utf8');
const source = `${readFileSync(homeSourcePath, 'utf8')}\n${readFileSync(referenceCardSourcePath, 'utf8')}`;
const css = readFileSync(resolve(process.cwd(), 'src/styles/global.css'), 'utf8');

const requiredSnippets = [
  'class="wrap home home-v2"',
  'Find screens, elements, flows, and domains in one place.',
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
  'class="browse__layout home-browse__layout"',
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
  'class="ref-grid"',
];

const forbiddenSnippets = [
  'class="home-axis-switch"',
  'class="home-axis-switch__item',
  'class="axis-grid"',
  'class="menu5"',
  'class="banner banner--guide"',
  '상세 페이지</strong>',
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
  '<p>{axis.summary}</p>',
  '</header>',
  '<FilterBar sort="latest" />',
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

if (!css.includes('.domain-entry-banner{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:16px 18px;border:0;')) {
  throw new Error('Home IA validation failed: domain entry banner border was not removed.');
}

if (!css.includes('.domain-entry-badge{display:inline-flex;align-items:center;gap:6px;background:var(--c-text);color:#fff;')) {
  throw new Error('Home IA validation failed: domain entry metadata is not rendered as black badges.');
}

console.log('Home IA validation passed.');
