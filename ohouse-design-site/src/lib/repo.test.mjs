import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isSelfContainedHtml, resolveScreenPreviewHtml, isValidPrototypeUrl } from './repo.js';

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

const SELF_HTML = '<!doctype html><html><head><style>.a{color:red}</style></head><body>ok</body></html>';
const EXTERNAL_HTML = '<html><body><script type="module" src="/src/main.tsx"></script></body></html>';

test('resolveScreenPreviewHtml: 로컬 prototype.html이 self-contained면 내용 반환', () => {
  const dir = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    writeFileSync(join(dir, 'prototype.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({ screenDir: dir, frontmatter: {}, contextRoot: dir });
    assert.equal(out, SELF_HTML);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: 로컬 prototype.html이 외부 참조면 null', () => {
  const dir = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    writeFileSync(join(dir, 'prototype.html'), EXTERNAL_HTML);
    const out = resolveScreenPreviewHtml({ screenDir: dir, frontmatter: {}, contextRoot: dir });
    assert.equal(out, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: frontmatter.prototype_html을 contextRoot 기준으로 읽음', () => {
  const ctx = mkdtempSync(join(tmpdir(), 'ctx-'));
  const screen = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    mkdirSync(join(ctx, 'tracks'), { recursive: true });
    writeFileSync(join(ctx, 'tracks', 'card.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({
      screenDir: screen,
      frontmatter: { prototype_html: 'tracks/card.html' },
      contextRoot: ctx,
    });
    assert.equal(out, SELF_HTML);
  } finally {
    rmSync(ctx, { recursive: true, force: true });
    rmSync(screen, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: frontmatter 참조가 로컬보다 우선', () => {
  const ctx = mkdtempSync(join(tmpdir(), 'ctx-'));
  const screen = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    const ctxHtml = '<!doctype html><html><head><style>.ctx{}</style></head><body>ctx</body></html>';
    writeFileSync(join(ctx, 'card.html'), ctxHtml);
    writeFileSync(join(screen, 'prototype.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({
      screenDir: screen,
      frontmatter: { prototype_html: 'card.html' },
      contextRoot: ctx,
    });
    assert.equal(out, ctxHtml);
  } finally {
    rmSync(ctx, { recursive: true, force: true });
    rmSync(screen, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: 후보 파일 없으면 null', () => {
  const dir = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    const out = resolveScreenPreviewHtml({ screenDir: dir, frontmatter: {}, contextRoot: dir });
    assert.equal(out, null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('resolveScreenPreviewHtml: frontmatter ref가 self-contained 아니면 로컬로 폴백', () => {
  const ctx = mkdtempSync(join(tmpdir(), 'ctx-'));
  const screen = mkdtempSync(join(tmpdir(), 'screen-'));
  try {
    writeFileSync(join(ctx, 'bad.html'), EXTERNAL_HTML);
    writeFileSync(join(screen, 'prototype.html'), SELF_HTML);
    const out = resolveScreenPreviewHtml({
      screenDir: screen,
      frontmatter: { prototype_html: 'bad.html' },
      contextRoot: ctx,
    });
    assert.equal(out, SELF_HTML);
  } finally {
    rmSync(ctx, { recursive: true, force: true });
    rmSync(screen, { recursive: true, force: true });
  }
});

test('isValidPrototypeUrl: https URL이면 true', () => {
  assert.equal(isValidPrototypeUrl('https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/'), true);
});

test('isValidPrototypeUrl: http URL이면 false', () => {
  assert.equal(isValidPrototypeUrl('http://example.com/'), false);
});

test('isValidPrototypeUrl: 비문자열이면 false', () => {
  assert.equal(isValidPrototypeUrl(null), false);
  assert.equal(isValidPrototypeUrl(undefined), false);
  assert.equal(isValidPrototypeUrl(123), false);
});

test('isValidPrototypeUrl: 빈/공백 문자열이면 false', () => {
  assert.equal(isValidPrototypeUrl(''), false);
  assert.equal(isValidPrototypeUrl('   '), false);
});

test('isValidPrototypeUrl: URL 파싱 불가 문자열이면 false', () => {
  assert.equal(isValidPrototypeUrl('not a url'), false);
});
