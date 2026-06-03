import { readFileSync } from 'fs';
import { resolve } from 'path';

const domainHtml = readFileSync(resolve(process.cwd(), 'dist/d/house-tour/index.html'), 'utf8');
const screenHtml = readFileSync(resolve(process.cwd(), 'dist/d/house-tour/s/content-tab/index.html'), 'utf8');
const screenSource = readFileSync(resolve(process.cwd(), 'src/pages/d/[domain]/s/[screen].astro'), 'utf8');

if (domainHtml.includes('Developer</span>') || domainHtml.includes('Screens</span>')) {
  throw new Error('Screen detail layout validation failed: domain detail metadata still includes Developer or Screens.');
}

const requiredScreenSnippets = [
  'class="screen-found"',
  'class="screen-detail"',
  'class="screen-detail__main wrap"',
  'class="screen-detail__preview"',
  'class="screen-detail__scroll"',
  'Found in',
  'Discovery',
  '집구경',
  'Production',
  'content-tab',
  'class="screen-usage__main"',
  'class="screen-usage__content"',
  'class="screen-usage__tabs dtabs"',
  'class="screen-usage__tabs-inner dtabs__inner"',
  'class="sechead__title">Components</div>',
  'data-prompt-preview-open',
  'class="btn-secondary btn-secondary--stroke"',
  'class="prompt-modal"',
  'role="dialog"',
  'class="prompt-modal__sheet"',
  'data-prompt-preview-close',
];

for (const snippet of requiredScreenSnippets) {
  if (!screenHtml.includes(snippet) && !screenSource.includes(snippet)) {
    throw new Error(`Screen detail layout validation failed: missing ${JSON.stringify(snippet)}.`);
  }
}

const lastUpdatedIndex = screenSource.indexOf('class="shead__time"');
const foundInIndex = screenSource.indexOf('class="screen-found"');
const actionsIndex = screenSource.indexOf('class="shead__actions"');
if (lastUpdatedIndex === -1 || foundInIndex === -1 || actionsIndex === -1 || foundInIndex < lastUpdatedIndex || foundInIndex > actionsIndex) {
  throw new Error('Screen detail layout validation failed: Found in metadata is not placed below Last updated and above actions.');
}

if (!screenSource.includes('font-size: 13px') || !screenSource.includes('min-height: 28px')) {
  throw new Error('Screen detail layout validation failed: Found in metadata does not match the Last updated information hierarchy.');
}

const forbiddenScreenSnippets = [
  'class="crumb"',
  'Domains</a>',
  'prompt-preview--inline',
  'class="wrap screen-usage__body"',
  'component-subtab',
];

for (const snippet of forbiddenScreenSnippets) {
  if (screenSource.includes(snippet) || screenHtml.includes(snippet)) {
    throw new Error(`Screen detail layout validation failed: found deprecated ${JSON.stringify(snippet)}.`);
  }
}

if (!screenSource.includes('grid-template-columns: 360px 1fr; gap: 48px')) {
  throw new Error('Screen detail layout validation failed: component section does not reuse the screen header grid width.');
}

if (!screenSource.includes('height: calc(100vh - 64px)') || !screenSource.includes('overflow: hidden')) {
  throw new Error('Screen detail layout validation failed: screen detail page does not lock document scrolling on desktop.');
}

if (!screenSource.includes('overflow-y: auto') || !screenSource.includes('overscroll-behavior: contain')) {
  throw new Error('Screen detail layout validation failed: right screen detail column is not the scroll container.');
}

if (!screenSource.includes('position: static')) {
  throw new Error('Screen detail layout validation failed: fixed screen detail layout is not disabled on mobile.');
}

if (!screenSource.includes('border: 1px solid var(--c-border)')) {
  throw new Error('Screen detail layout validation failed: prompt preview trigger is not a stroke button.');
}

if (!screenSource.includes('align-items: flex-end') || !screenSource.includes('border-radius: 24px 24px 0 0')) {
  throw new Error('Screen detail layout validation failed: prompt preview modal does not become a bottom sheet on mobile.');
}

console.log('Screen detail layout validation passed.');
