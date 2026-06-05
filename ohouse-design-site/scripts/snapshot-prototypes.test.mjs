import assert from 'node:assert/strict';
import { contentTypeFor, resolveChromeBinary } from './snapshot-prototypes.mjs';

// ① 확장자별 MIME
assert.equal(contentTypeFor('/x/index.html'), 'text/html');
assert.equal(contentTypeFor('/x/app.js'), 'text/javascript');   // ES module은 JS mime 필수
assert.equal(contentTypeFor('/x/a.mjs'), 'text/javascript');
assert.equal(contentTypeFor('/x/pic.webp'), 'image/webp');
assert.equal(contentTypeFor('/x/style.CSS'), 'text/css');        // 대소문자 무시
assert.equal(contentTypeFor('/x/unknown.xyz'), 'application/octet-stream');

// ② Chrome 바이너리 해석: 존재하는 첫 후보 반환, 없으면 null
assert.equal(resolveChromeBinary(['/a', '/b'], (p) => p === '/b'), '/b');
assert.equal(resolveChromeBinary(['/a', '/b'], () => false), null);

console.log('snapshot-prototypes unit tests passed');
