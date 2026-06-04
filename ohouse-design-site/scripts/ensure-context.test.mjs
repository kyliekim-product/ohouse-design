import assert from 'node:assert/strict';
import { decideContextStrategy } from './ensure-context.mjs';

// ① env 지정 시 무조건 env 모드
function testEnvWins() {
  const s = decideContextStrategy({
    env: '/custom/path',
    siblingCandidates: ['/sib/a', '/sib/b'],
    cachePath: '/cache',
    hasTracks: () => true,
    cacheExists: () => true,
  });
  assert.deepEqual(s, { mode: 'env', path: '/custom/path' });
}

// ② env 없고 첫 형제에 tracks/ 있으면 sibling 모드
function testSiblingWins() {
  const s = decideContextStrategy({
    env: undefined,
    siblingCandidates: ['/sib/a', '/sib/b'],
    cachePath: '/cache',
    hasTracks: (p) => p === '/sib/a' || p === '/sib/b',
    cacheExists: () => true,
  });
  assert.deepEqual(s, { mode: 'sibling', path: '/sib/a' });
}

// ③ env·형제 없고 캐시 존재하면 pull 모드
function testPullWhenCacheExists() {
  const s = decideContextStrategy({
    env: undefined,
    siblingCandidates: ['/sib/a'],
    cachePath: '/cache',
    hasTracks: () => false,
    cacheExists: () => true,
  });
  assert.deepEqual(s, { mode: 'pull', path: '/cache' });
}

// ④ 아무것도 없으면 clone 모드
function testCloneWhenNothing() {
  const s = decideContextStrategy({
    env: undefined,
    siblingCandidates: ['/sib/a'],
    cachePath: '/cache',
    hasTracks: () => false,
    cacheExists: () => false,
  });
  assert.deepEqual(s, { mode: 'clone', path: '/cache' });
}

// ⑤ 형제 후보 없으면 clone 모드
function testEmptySiblings() {
  const s = decideContextStrategy({
    env: undefined,
    siblingCandidates: [],
    cachePath: '/cache',
    hasTracks: () => false,
    cacheExists: () => false,
  });
  assert.deepEqual(s, { mode: 'clone', path: '/cache' });
}

testEnvWins();
testSiblingWins();
testPullWhenCacheExists();
testCloneWhenNothing();
testEmptySiblings();
console.log('ensure-context decision tests passed');
