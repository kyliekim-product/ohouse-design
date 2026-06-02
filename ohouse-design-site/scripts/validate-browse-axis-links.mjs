import { readFileSync } from 'fs';
import { resolve } from 'path';

const pages = ['categories', 'screens', 'ui-elements', 'flows'];

for (const page of pages) {
  const html = readFileSync(resolve(process.cwd(), `dist/${page}/index.html`), 'utf8');

  if (html.includes('class="browse-axis"')) {
    throw new Error(`${page}: deprecated browse-axis pill navigation is still rendered`);
  }

  if (!html.includes('class="browse-title-menu"')) {
    throw new Error(`${page}: missing clickable title dropdown`);
  }

  if (!html.includes('data-close-on-outside')) {
    throw new Error(`${page}: title dropdown does not opt into outside-click close`);
  }

  if (!html.includes('class="browse-title-link"')) {
    throw new Error(`${page}: missing clickable title link`);
  }

  if (!html.includes('class="browse-title-link__arrow"')) {
    throw new Error(`${page}: missing clickable title arrow affordance`);
  }

  if (!html.includes('class="icon"')) {
    throw new Error(`${page}: missing SVG icon asset`);
  }

  if (html.includes('>↗<')) {
    throw new Error(`${page}: found text arrow glyph`);
  }

  for (const target of pages.filter((item) => item !== page)) {
    if (!html.includes(`href="/${target}"`)) {
      throw new Error(`${page}: missing title dropdown link to /${target}`);
    }
  }
}

console.log('Browse axis link validation passed.');
