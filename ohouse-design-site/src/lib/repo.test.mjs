import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSelfContainedHtml } from './repo.js';

test('isSelfContainedHtml: inline style만 있으면 true', () => {
  const html = '<!doctype html><html><head><style>.a{color:red}</style></head><body><div class="a">x</div></body></html>';
  assert.equal(isSelfContainedHtml(html), true);
});

test('isSelfContainedHtml: 외부 script src면 false', () => {
  const html = '<html><body><script src="/src/main.tsx"></script></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});

test('isSelfContainedHtml: module script면 false', () => {
  const html = '<html><body><script type="module">import x from "y"</script></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});

test('isSelfContainedHtml: 외부 stylesheet link면 false', () => {
  const html = '<html><head><link rel="stylesheet" href="/a.css" /></head><body></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});

test('isSelfContainedHtml: 빈 문자열이면 false', () => {
  assert.equal(isSelfContainedHtml(''), false);
  assert.equal(isSelfContainedHtml(null), false);
});

test('isSelfContainedHtml: inline script(외부 참조 없음)는 true', () => {
  const html = '<html><body><script>console.log(1)</script></body></html>';
  assert.equal(isSelfContainedHtml(html), true);
});

test('isSelfContainedHtml: href가 rel보다 앞서도 외부 stylesheet면 false', () => {
  const html = '<html><head><link href="/a.css" rel="stylesheet" /></head><body></body></html>';
  assert.equal(isSelfContainedHtml(html), false);
});
