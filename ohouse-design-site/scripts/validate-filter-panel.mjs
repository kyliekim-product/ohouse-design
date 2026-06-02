import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve(process.cwd(), 'dist/index.html'), 'utf8');

const requiredSnippets = [
  'class="fbar__sortbox"',
  'class="fbar__sort-panel"',
  'class="fbar__sort-option is-active"',
  'class="fbar__filterbox"',
  'class="fbar__filter-panel"',
  'Sources',
  'Status',
  'type="checkbox"',
  'data-filter-key="source"',
  'data-filter-key="status"',
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

console.log('Filter panel validation passed.');
