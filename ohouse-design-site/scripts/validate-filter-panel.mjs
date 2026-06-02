import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf8');

const requiredSnippets = [
  'class="fbar__sortbox"',
  'data-close-on-outside',
  'class="icon"',
  'class="fbar__sort-panel"',
  'class="fbar__sort-option is-active"',
  'class="fbar__filterbox"',
  'class="fbar__filter-panel"',
  'Sources',
  'Status',
  'type="checkbox"',
  'data-filter-key="source"',
  'data-filter-key="status"',
  'details[data-close-on-outside][open]',
];

const forbiddenSnippets = [
  'class="fbar__select"',
  'All Sources',
  'All Status',
  'Most viewed',
  'data-sort="popular"',
  'data-sort="all"',
  'data-filter-count hidden',
  'class="fbar__filter-count" data-filter-count hidden',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`Filter panel validation failed: missing snippet ${JSON.stringify(snippet)}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (html.includes(snippet)) {
    throw new Error(`Filter panel validation failed: found deprecated snippet ${JSON.stringify(snippet)}`);
  }
}

if (html.includes('>⌄<')) {
  throw new Error('Filter panel validation failed: found text chevron glyph.');
}

console.log('Filter panel validation passed.');
