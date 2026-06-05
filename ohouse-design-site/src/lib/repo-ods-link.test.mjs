import assert from 'node:assert/strict';
import { resolveOdsSlug } from './repo.js';

const catalog = [
  { slug: 'tab', title: 'Tab' },
  { slug: 'chip', title: 'Chip' },
  { slug: 'thumbnail', title: 'Thumbnail' },
  { slug: 'scrap-button', title: 'Scrap Button' },
  { slug: 'product-card', title: 'Product Card' },
];

assert.equal(resolveOdsSlug('Tab', catalog), 'tab');
assert.equal(resolveOdsSlug('chip', catalog), 'chip');
assert.equal(resolveOdsSlug('Thumbnail', catalog), 'thumbnail');
assert.equal(resolveOdsSlug('ScrapButton', catalog), 'scrap-button');
assert.equal(resolveOdsSlug('Scrap Button', catalog), 'scrap-button');
assert.equal(resolveOdsSlug('ProductCard', catalog), 'product-card');
assert.equal(resolveOdsSlug('ContentsLandscapeCard', catalog), null);
assert.equal(resolveOdsSlug('', catalog), null);

console.log('repo-ods-link tests passed');
