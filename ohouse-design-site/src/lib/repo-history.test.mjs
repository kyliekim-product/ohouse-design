import assert from 'node:assert/strict';
import { rewriteHistoryImages } from './repo.js';

const out = rewriteHistoryImages('<p><img src="./stage-1.png" alt="1차"></p>', 'house-tour', 'content-tab');
assert.ok(out.includes('src="/screen-history/house-tour/content-tab/stage-1.png"'), out);

assert.ok(rewriteHistoryImages('<img src="imgs/a.webp">', 'd', 's').includes('src="/screen-history/d/s/a.webp"'));
assert.ok(rewriteHistoryImages('<img src="https://x/y.png">', 'd', 's').includes('src="https://x/y.png"'));
assert.ok(rewriteHistoryImages('<img src="/already/abs.png">', 'd', 's').includes('src="/already/abs.png"'));
assert.ok(rewriteHistoryImages('<img src="data:image/png;base64,AAAA">', 'd', 's').includes('src="data:image/png;base64,AAAA"'));

console.log('repo-history tests passed');
