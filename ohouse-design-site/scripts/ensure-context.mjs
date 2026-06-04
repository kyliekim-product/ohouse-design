// 빌드 직전 context 레포 콘텐츠를 확보한다.
// 우선순위: env > 형제 폴더 > 관리 캐시(.context/).

export function decideContextStrategy({ env, siblingCandidates, cachePath, hasTracks, cacheExists }) {
  if (env) return { mode: 'env', path: env };
  for (const p of siblingCandidates) {
    if (hasTracks(p)) return { mode: 'sibling', path: p };
  }
  if (cacheExists(cachePath)) return { mode: 'pull', path: cachePath };
  return { mode: 'clone', path: cachePath };
}
