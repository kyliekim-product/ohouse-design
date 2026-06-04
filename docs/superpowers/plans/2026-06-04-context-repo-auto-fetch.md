# Context Repo Auto-Fetch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 팀원이 `npm run build`/`npm run dev`만 실행해도 private `ohouse-design-context` 레포의 최신 `main` 콘텐츠가 자동 확보되어 콘텐츠 작성자와 동일한 화면이 렌더되게 한다.

**Architecture:** npm `prebuild`/`predev` 훅이 `ensure-context.mjs`를 실행한다. 스크립트는 `env > 형제 폴더 > 관리 캐시(.context/)` 우선순위로 콘텐츠를 확보하며, 캐시 경로일 때만 최신 main을 clone/pull한다. `repo.js`의 `resolveContextRoot()`는 동일 우선순위로 같은 경로를 찾는다.

**Tech Stack:** Node.js ESM(.mjs), `node:child_process`(execFileSync), `node:fs`, `node:assert/strict`, npm lifecycle 훅, git CLI. (Astro 빌드 자체는 변경 없음.)

작업 디렉토리는 모두 `ohouse-design-site/` 기준이다(명시된 경우 제외).

---

## File Structure

- `ohouse-design-site/scripts/ensure-context.mjs` (신규) — 부트스트랩. 순수 결정 함수 `decideContextStrategy()` + 실행 러너(git 호출).
- `ohouse-design-site/scripts/ensure-context.test.mjs` (신규) — `decideContextStrategy()` 분기 단위 테스트.
- `ohouse-design-site/package.json` (수정) — `bootstrap:context` 스크립트 + `prebuild`/`predev` 훅.
- `ohouse-design-site/src/lib/repo.js` (수정) — `resolveContextRoot()` 후보에 캐시 경로 추가.
- `ohouse-design-site/.gitignore` (수정) — `.context/` 추가.
- `ohouse-design-site/README.md` (수정) — 의존성/인증 안내 한 단락.

캐시 경로는 양쪽 파일에서 동일하게 `ohouse-design-site/.context/ohouse-design-context`를 가리킨다. 상대 깊이가 파일 위치마다 다르니 주의:
- `scripts/ensure-context.mjs`(dir=`scripts/`): `resolve(import.meta.dirname, '../.context/ohouse-design-context')`
- `src/lib/repo.js`(dir=`src/lib/`): `resolve(import.meta.dirname, '../../.context/ohouse-design-context')`

---

## Task 1: 순수 결정 함수 `decideContextStrategy` (TDD)

**Files:**
- Create: `ohouse-design-site/scripts/ensure-context.mjs`
- Test: `ohouse-design-site/scripts/ensure-context.test.mjs`

- [ ] **Step 1: Write the failing test**

Create `ohouse-design-site/scripts/ensure-context.test.mjs`:

```js
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
    hasTracks: (p) => p === '/sib/a',
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

testEnvWins();
testSiblingWins();
testPullWhenCacheExists();
testCloneWhenNothing();
console.log('ensure-context decision tests passed');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd ohouse-design-site && node scripts/ensure-context.test.mjs`
Expected: FAIL — `Cannot find module './ensure-context.mjs'` 또는 `decideContextStrategy is not a function` (파일 미존재).

- [ ] **Step 3: Write minimal implementation**

Create `ohouse-design-site/scripts/ensure-context.mjs` with ONLY the pure function for now:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd ohouse-design-site && node scripts/ensure-context.test.mjs`
Expected: PASS — `ensure-context decision tests passed`

- [ ] **Step 5: Commit**

```bash
git add ohouse-design-site/scripts/ensure-context.mjs ohouse-design-site/scripts/ensure-context.test.mjs
git commit -m "feat: add context fetch strategy decision function

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 실행 러너 (git clone/pull 부수효과)

**Files:**
- Modify: `ohouse-design-site/scripts/ensure-context.mjs`

순수 함수는 그대로 두고, 직접 실행될 때만 도는 러너를 추가한다.

- [ ] **Step 1: 러너 코드 추가**

`ohouse-design-site/scripts/ensure-context.mjs` 맨 위 import와 맨 아래 러너를 추가한다. 파일 최종 형태:

```js
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
```

- [ ] **Step 2: 결정 테스트가 여전히 통과하는지 확인 (회귀)**

Run: `cd ohouse-design-site && node scripts/ensure-context.test.mjs`
Expected: PASS — `ensure-context decision tests passed` (러너는 직접 실행이 아니므로 import 시 돌지 않음).

- [ ] **Step 3: 실제 실행 — 형제 폴더 분기 확인**

이 개발 환경에는 형제 `ohouse-design-context`가 있으므로 sibling 모드여야 한다.

Run: `cd ohouse-design-site && node scripts/ensure-context.mjs`
Expected: `[context] 형제 폴더 사용(자동 갱신 안 함): /Users/kylie.kim/Documents/GitHub/ohouse-design-context` 출력, exit 0, 형제 폴더 변경 없음.

- [ ] **Step 4: Commit**

```bash
git add ohouse-design-site/scripts/ensure-context.mjs
git commit -m "feat: add context repo bootstrap runner (clone/pull latest main)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: npm 훅 연결

**Files:**
- Modify: `ohouse-design-site/package.json`

- [ ] **Step 1: scripts 블록 수정**

`ohouse-design-site/package.json`의 `scripts`를 아래로 교체한다(나머지 키·dependencies는 그대로):

```json
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "npm run validate:ods-previews && astro build",
    "preview": "astro preview",
    "astro": "astro",
    "bootstrap:context": "node scripts/ensure-context.mjs",
    "predev": "npm run bootstrap:context",
    "prebuild": "npm run bootstrap:context",
    "validate:ods-previews": "node scripts/validate-ods-previews.mjs",
    "validate:repo-metadata-cache": "node scripts/validate-repo-metadata-cache.mjs"
  },
```

- [ ] **Step 2: prebuild 훅이 build 전에 도는지 확인**

Run: `cd ohouse-design-site && npm run bootstrap:context`
Expected: `[context] 형제 폴더 사용...` 출력, exit 0.

- [ ] **Step 3: Commit**

```bash
git add ohouse-design-site/package.json
git commit -m "build: run context bootstrap before dev and build

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `resolveContextRoot()` 에 캐시 경로 추가

**Files:**
- Modify: `ohouse-design-site/src/lib/repo.js` (현재 28-38행, `resolveContextRoot`)

- [ ] **Step 1: 후보 목록에 캐시 경로 추가**

`ohouse-design-site/src/lib/repo.js`의 `resolveContextRoot` 함수를 아래로 교체한다:

```js
function resolveContextRoot() {
  const candidates = [
    process.env.OHOUSE_DESIGN_CONTEXT_ROOT,
    resolve(import.meta.dirname, '../../../../ohouse-design-context'),
    resolve(import.meta.dirname, '../../../ohouse-design-context'),
    // ensure-context.mjs 가 채우는 관리 캐시 (env·형제 폴더가 없을 때)
    resolve(import.meta.dirname, '../../.context/ohouse-design-context'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(join(p, 'tracks'))) return p;
  }
  return candidates[0];
}
```

- [ ] **Step 2: 기존 콘텐츠 테스트로 회귀 확인**

이 환경엔 형제 폴더가 있어 `CONTEXT_ROOT` 해석이 바뀌지 않아야 한다(기존 동작 보존 검증).

Run: `cd ohouse-design-site && node scripts/repo-context.test.mjs`
Expected: PASS — `repo context tests passed`

- [ ] **Step 3: Commit**

```bash
git add ohouse-design-site/src/lib/repo.js
git commit -m "feat: resolve context root from managed cache fallback

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: gitignore + README 안내

**Files:**
- Modify: `ohouse-design-site/.gitignore`
- Modify: `ohouse-design-site/README.md`

- [ ] **Step 1: .gitignore 에 캐시 추가**

`ohouse-design-site/.gitignore` 끝에 한 줄 추가:

```
.context/
```

- [ ] **Step 2: README 에 안내 단락 추가**

`ohouse-design-site/README.md` 끝에 다음 섹션을 추가한다:

```markdown
## Content source (ohouse-design-context)

이 사이트는 빌드/실행 시 별도 private 레포
[`Ohouse-product-design/ohouse-design-context`](https://github.com/Ohouse-product-design/ohouse-design-context)
의 콘텐츠를 읽는다. `npm run dev`/`npm run build`는 시작 전에 `scripts/ensure-context.mjs`를
자동 실행해 콘텐츠를 확보한다:

1. `OHOUSE_DESIGN_CONTEXT_ROOT` 가 설정돼 있으면 그 경로를 사용한다(오프라인/커스텀).
2. 형제 폴더 `../ohouse-design-context` 가 있으면 그대로 사용한다(콘텐츠 작성자).
3. 둘 다 없으면 `.context/` 캐시에 최신 `main` 을 clone/pull 한다.

따라서 **Ohouse-product-design org 접근 권한과 git 인증**이 필요하다. 인증이 없으면
빌드는 명확한 에러로 중단된다. (CI/Pages 에서 돌리려면 별도 deploy token/SSH key 주입이 필요하다.)
```

- [ ] **Step 3: Commit**

```bash
git add ohouse-design-site/.gitignore ohouse-design-site/README.md
git commit -m "docs: ignore context cache and document content source

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 수동 통합 검증 (팀원 시나리오 재현)

형제 폴더가 없는 팀원 환경을 흉내 내어 캐시 분기가 실제로 동작하는지 확인한다.

**Files:** (변경 없음 — 검증만)

- [ ] **Step 1: 형제 폴더를 임시로 숨겨 clone 분기 유도**

```bash
mv /Users/kylie.kim/Documents/GitHub/ohouse-design-context /Users/kylie.kim/Documents/GitHub/ohouse-design-context.bak
cd /Users/kylie.kim/Documents/GitHub/ohouse-design/ohouse-design-site && node scripts/ensure-context.mjs
```
Expected: `[context] 캐시에 최신 main clone: .../ohouse-design-site/.context/ohouse-design-context` 출력 후, 해당 경로에 `tracks/` 가 생성됨. (git 인증 필요)

- [ ] **Step 2: 캐시 존재 시 pull 분기 확인**

Run: `cd /Users/kylie.kim/Documents/GitHub/ohouse-design/ohouse-design-site && node scripts/ensure-context.mjs`
Expected: `[context] 캐시를 최신 main 으로 갱신:` 출력, exit 0.

- [ ] **Step 3: 캐시만으로 콘텐츠 해석되는지 확인**

Run: `cd /Users/kylie.kim/Documents/GitHub/ohouse-design/ohouse-design-site && node scripts/repo-context.test.mjs`
Expected: PASS — `repo context tests passed` (이제 `CONTEXT_ROOT` 가 `.context/` 캐시로 해석됨).

- [ ] **Step 4: 형제 폴더 원복**

```bash
rm -rf /Users/kylie.kim/Documents/GitHub/ohouse-design/ohouse-design-site/.context
mv /Users/kylie.kim/Documents/GitHub/ohouse-design-context.bak /Users/kylie.kim/Documents/GitHub/ohouse-design-context
```
Expected: 형제 폴더 복구, `.context/` 캐시 제거(다음 빌드에서 sibling 모드로 복귀). `.context/`는 gitignore라 커밋 영향 없음.

- [ ] **Step 5: 정리 커밋 불필요 확인**

Run: `cd /Users/kylie.kim/Documents/GitHub/ohouse-design && git status -s`
Expected: 출력 없음(작업트리 클린 — 검증은 추적 파일을 바꾸지 않음).

---

## Self-Review 메모

- **Spec 커버리지:** 동작 흐름(Task 2·3), 5개 컴포넌트(Task 1-5), 에러 처리(Task 2: clone fail-fast / pull warn / env trust), 영향 범위(Task 2 sibling 비파괴, Task 6 검증) 모두 태스크에 매핑됨.
- **타입/이름 일관성:** `decideContextStrategy` 시그니처(`hasTracks`, `cacheExists`, `siblingCandidates`, `cachePath`)가 Task 1 테스트·구현, Task 2 러너에서 동일. 캐시 경로 상대 깊이는 파일별로 명시(scripts=`../.context`, src/lib=`../../.context`).
- **Placeholder:** 없음. 모든 코드 블록은 실제 내용.
