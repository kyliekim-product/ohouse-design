import { readFileSync } from 'fs';
import { resolve } from 'path';

const html = readFileSync(resolve(process.cwd(), 'dist/d/house-tour/index.html'), 'utf8');
const source = readFileSync(resolve(process.cwd(), 'src/pages/d/[domain].astro'), 'utf8');
const dtabsStart = html.indexOf('id="dtabs"');
const dtabsEnd = html.indexOf('</nav>', dtabsStart);
const dtabs = html.slice(dtabsStart, dtabsEnd);

const tabOrder = ['Policies', 'Experiments', 'Components', 'Screens'];
const tabPositions = tabOrder.map((label) => dtabs.indexOf(`> ${label} `));

for (let i = 0; i < tabPositions.length; i += 1) {
  if (tabPositions[i] === -1) {
    throw new Error(`Domain tabs validation failed: missing ${tabOrder[i]} tab.`);
  }
  if (i > 0 && tabPositions[i] <= tabPositions[i - 1]) {
    throw new Error(`Domain tabs validation failed: ${tabOrder.join(', ')} order was not preserved.`);
  }
}

if (!source.includes("class={`dtab${t.id === 'policies' ? ' is-active' : ''}`}")) {
  throw new Error('Domain tabs validation failed: Policies is not the initial active tab.');
}

if (!source.includes("data-panel=\"policies\"") || !source.includes("data-panel=\"screens\" hidden")) {
  throw new Error('Domain tabs validation failed: Policies panel is not the initial visible panel.');
}

if (!source.includes("get('tab') || 'policies'")) {
  throw new Error('Domain tabs validation failed: client-side default tab is not policies.');
}

console.log('Domain tabs validation passed.');
