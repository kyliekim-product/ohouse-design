import { readFileSync } from 'fs';
import { resolve } from 'path';

const homePath = resolve(process.cwd(), 'dist/index.html');
const html = readFileSync(homePath, 'utf8');

const requiredSnippets = [
  'class="wrap home home-v2"',
  'Ohouse Design Reference',
  'Find screens, elements, flows, and domains in one place.',
  'class="axis-grid"',
  'Recently updated references',
  'class="ref-grid"',
];

const forbiddenSnippets = [
  'class="menu5"',
  'class="banner banner--guide"',
  'id="grid"',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`Home IA validation failed: missing snippet ${JSON.stringify(snippet)}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (html.includes(snippet)) {
    throw new Error(`Home IA validation failed: found deprecated snippet ${JSON.stringify(snippet)}`);
  }
}

console.log('Home IA validation passed.');
