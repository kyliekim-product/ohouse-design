import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve(process.cwd(), 'dist/screens/index.html'), 'utf8');

const requiredSnippets = [
  'class="ref-card__canvas"',
  'class="ref-card__pill"',
  'class="ref-card__phone"',
  'class="ref-card__placeholder"',
  'class="ref-card__identity"',
  'class="ref-card__identity-badges"',
];

const forbiddenSnippets = [
  'class="ref-card__preview"',
  'class="ref-card__meta"',
  'class="ref-card__state"',
  'class="ref-card__taxonomy"',
  'class="ref-card__pill">HTML</span>',
  'class="ref-card__pill">FIGMA</span>',
  '<span>draft</span>',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`Reference card layout validation failed: missing snippet ${JSON.stringify(snippet)}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (html.includes(snippet)) {
    throw new Error(`Reference card layout validation failed: found deprecated snippet ${JSON.stringify(snippet)}`);
  }
}

console.log('Reference card layout validation passed.');
