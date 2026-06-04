// 빌드 직전 context 레포 콘텐츠를 확보한다.
// 우선순위: env > 형제 폴더 > 관리 캐시(.context/).
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const CONTEXT_REPO_URL = 'https://github.com/Ohouse-product-design/ohouse-design-context.git';
const CONTEXT_BRANCH = 'main';

export function decideContextStrategy({ env, siblingCandidates, cachePath, hasTracks, cacheExists }) {
  if (env) return { mode: 'env', path: env };
  for (const p of siblingCandidates) {
    if (hasTracks(p)) return { mode: 'sibling', path: p };
  }
  if (cacheExists(cachePath)) return { mode: 'pull', path: cachePath };
  return { mode: 'clone', path: cachePath };
}

function git(args, opts = {}) {
  execFileSync('git', args, { stdio: 'inherit', ...opts });
}

function run() {
  const dir = import.meta.dirname;
  const cachePath = resolve(dir, '../.context/ohouse-design-context');
  const strategy = decideContextStrategy({
    env: process.env.OHOUSE_DESIGN_CONTEXT_ROOT,
    siblingCandidates: [
      resolve(dir, '../../../ohouse-design-context'),
      resolve(dir, '../../ohouse-design-context'),
    ],
    cachePath,
    hasTracks: (p) => existsSync(join(p, 'tracks')),
    cacheExists: (p) => existsSync(join(p, '.git')),
  });

  if (strategy.mode === 'env') {
    console.log(`[context] OHOUSE_DESIGN_CONTEXT_ROOT 사용: ${strategy.path}`);
    return;
  }
  if (strategy.mode === 'sibling') {
    console.log(`[context] 형제 폴더 사용(자동 갱신 안 함): ${strategy.path}`);
    return;
  }
  if (strategy.mode === 'clone') {
    try {
      console.log(`[context] 캐시에 최신 main clone: ${strategy.path}`);
      git(['clone', '--depth', '1', '--branch', CONTEXT_BRANCH, CONTEXT_REPO_URL, strategy.path]);
    } catch {
      console.error(
        '[context] 레포 접근 실패. Ohouse-product-design org 권한과 git 인증을 확인하거나, ' +
          'OHOUSE_DESIGN_CONTEXT_ROOT 로 로컬 경로를 지정하세요.',
      );
      process.exit(1);
    }
    return;
  }
  // pull: 캐시가 이미 있으면 최신 main 으로 갱신. 실패해도 기존 캐시로 진행.
  try {
    console.log(`[context] 캐시를 최신 main 으로 갱신: ${strategy.path}`);
    git(['-C', strategy.path, 'fetch', '--depth', '1', 'origin', CONTEXT_BRANCH]);
    git(['-C', strategy.path, 'reset', '--hard', 'FETCH_HEAD']);
  } catch {
    console.warn('[context] 갱신 실패(오프라인?). 기존 캐시로 진행합니다.');
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  run();
}
