import { readFileSync } from 'fs';
import { resolve } from 'path';

const cssPath = resolve(process.cwd(), 'src/styles/global.css');
const css = readFileSync(cssPath, 'utf8').toLowerCase();

const forbiddenOrange = ['#ff6f0f', '#fff5e6', '#e85f00', '#ffd9a8', '#ffaf68', '#6b3a0a'];

for (const color of forbiddenOrange) {
  if (css.includes(color)) {
    throw new Error(`Grayscale theme validation failed: found orange color ${color}`);
  }
}

console.log('Grayscale theme validation passed.');
