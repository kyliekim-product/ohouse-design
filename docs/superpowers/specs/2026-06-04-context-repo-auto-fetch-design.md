# Context Repo Auto-Fetch Design

## Purpose

사이트 빌드는 콘텐츠 일부를 별도 private 레포 `Ohouse-product-design/ohouse-design-context`에서 읽는다. 현재는 이 레포가 **로컬 형제 폴더로 미리 clone돼 있어야만** 빌드가 콘텐츠(특히 screen prototype HTML)를 채울 수 있다. 그 결과 형제 폴더가 없는 팀원이 `ohouse-design`만 clone해서 빌드하면, 동일 코드인데도 **프리뷰가 비거나 다른 화면**으로 렌더된다.

목표는 한 가지다: **팀원이 `npm run build`(또는 `npm run dev`)만 실행해도, context 레포의 최신 `main` 콘텐츠가 자동으로 확보되어 본인(콘텐츠 작성자)과 동일한 화면이 렌더된다.**

이번 범위는 **콘텐츠 확보(부트스트랩) 배관**이며, 콘텐츠 자체나 렌더링 로직 변경은 포함하지 않는다.

## Background

### 현재 구조 (확인된 사실)

- 사이트는 빌드 타임에 두 콘텐츠 소스를 디스크에서 직접 읽는다 (`ohouse-design-site/src/lib/repo.js`):
  - `ROOT` = `ohouse-design-mcp/` — **이 레포 안**에 있어 clone 시 같이 옴.
  - `CONTEXT_ROOT` = `ohouse-design-context/` — **이 레포 바깥의 별도 private 레포**. 서브모듈 아님(`.gitmodules` 없음).
- `resolveContextRoot()` (repo.js:28) 현재 후보 순서:
  1. `process.env.OHOUSE_DESIGN_CONTEXT_ROOT`
  2. `../../../../ohouse-design-context` (형제 레이아웃)
  3. `../../../ohouse-design-context`
  - `tracks/` 하위 폴더 존재로 유효성 판별. 모두 없으면 첫 후보(존재하지 않는 경로)로 fallback → `existsSync` 실패 → 콘텐츠 null.
- `CONTEXT_ROOT` 사용처: repo.js의 lastModified(225), tracks/track index/policies(402·408·417), screen prototype HTML(534·821).
- screen 프리뷰는 빌드 타임에 `resolveScreenPreviewHtml()`이 `prototype_html`이 가리키는 HTML을 읽어 iframe `srcdoc`로 인라인한다. → 콘텐츠 파일이 디스크에 없으면 프리뷰가 비어버린다.

### 결정에 영향을 준 제약

- **context 레포는 private**(GitHub API 403)다. 자동 fetch는 팀원의 기존 git 인증(HTTPS credential helper / SSH)에 의존한다. 팀원은 org 멤버라 이미 접근 권한이 있고, 어차피 로컬에서 clone+빌드하므로 git 인증·네트워크가 존재하는 환경이다.
- 레포 크기 1.5M / 97파일로 작아 **얕은 clone(`--depth 1`)**으로 충분히 빠르다.
- 콘텐츠 작성자(본인)는 자기 작업용 형제 폴더 `ohouse-design-context`를 직접 편집한다. **이 working copy를 자동 fetch가 덮어쓰면 안 된다.**
- 자동화 인프라(CI/Actions/Pages 빌드)가 현재 없다. 팀원의 수동 clone+빌드가 유일한 경로다.

### 선택한 방향

재현성(서브모듈 고정)이 아니라 **최신성(빌드 시 항상 최신 main)**을 택했다. 지금 문제의 본질이 "콘텐츠 동기화 누락"이므로, 빌드마다 최신을 끌어오면 그 실패 모드 자체가 사라진다. 서브모듈 방식은 "포인터 bump 커밋을 깜빡하면 또 옛날 콘텐츠"라는 같은 실패 모드를 옮길 뿐이다. 이건 디자인 레퍼런스 사이트라 결정론적 재현보다 최신 콘텐츠가 원하는 동작이다.

## Design

### 동작 흐름

```
npm run build
  └─ (npm 자동 prebuild 훅) → npm run bootstrap:context → node scripts/ensure-context.mjs
       ├─ ① env OHOUSE_DESIGN_CONTEXT_ROOT 있으면 → 신뢰하고 종료 (오프라인/커스텀 탈출구)
       ├─ ② 형제 ../ohouse-design-context 가 tracks/ 와 함께 존재 → 건드리지 않고 그대로 사용 (콘텐츠 작성자 본인)
       └─ ③ 둘 다 없으면(팀원) → 관리 캐시에 최신 main clone/pull
  └─ astro build → resolveContextRoot() 가 동일 우선순위로 같은 경로를 찾아 prototype HTML 을 srcdoc 로 인라인
```

`dev`도 동일하게 `predev` 훅으로 보장한다.

### 컴포넌트

**1. `ohouse-design-site/scripts/ensure-context.mjs` (신규)**

부트스트랩 스크립트. `resolveContextRoot()`와 **동일한 우선순위**로 동작한다.

- 관리 캐시 경로: `ohouse-design-site/.context/ohouse-design-context` (gitignore)
- context 레포 URL: `https://github.com/Ohouse-product-design/ohouse-design-context.git`, 브랜치 `main`
- 로직:
  1. `OHOUSE_DESIGN_CONTEXT_ROOT` 설정됨 → 로그 남기고 종료.
  2. 형제 폴더(`../../../../ohouse-design-context` 또는 `../../../ohouse-design-context`)에 `tracks/` 존재 → 로그 남기고 종료(덮어쓰지 않음).
  3. 관리 캐시 존재 → `git -C <cache> fetch --depth 1 origin main && git -C <cache> reset --hard FETCH_HEAD` (항상 최신 main).
  4. 관리 캐시 없음 → `git clone --depth 1 --branch main <url> <cache>`.
- git 호출은 `child_process`(execFileSync)로 수행한다.

**2. `ohouse-design-site/package.json`**

```jsonc
"scripts": {
  "bootstrap:context": "node scripts/ensure-context.mjs",
  "prebuild": "npm run bootstrap:context",
  "predev": "npm run bootstrap:context",
  // 기존 dev/build/preview/validate:* 유지
}
```

npm은 `prebuild`/`predev`를 각각 `build`/`dev` 직전에 자동 실행한다.

**3. `ohouse-design-site/src/lib/repo.js` › `resolveContextRoot()`**

후보 목록에 관리 캐시 경로를 추가한다. 우선순위는 스크립트와 일치시킨다:

```
env  →  ../../../../ohouse-design-context  →  ../../../ohouse-design-context  →  <site>/.context/ohouse-design-context
```

판별 조건(`tracks/` 존재)과 fallback 동작은 기존 그대로 둔다.

**4. `ohouse-design-site/.gitignore`**

`.context/` 추가 — 관리 캐시는 커밋하지 않는다.

**5. `ohouse-design-site/README.md` (또는 루트 README)**

"빌드/실행 시 context 레포를 자동으로 가져온다. Ohouse-product-design org 접근 권한과 git 인증이 필요하다. 로컬 경로를 직접 쓰려면 `OHOUSE_DESIGN_CONTEXT_ROOT`를 지정한다." 한 단락.

### 에러 처리

조용히 틀린 화면을 내보내는 대신 **큰 소리로 실패**한다.

- **인증 실패/네트워크 불가 + 캐시 없음** → `exit 1`, 메시지: `context 레포 접근 실패. Ohouse-product-design org 권한과 git 인증을 확인하거나, OHOUSE_DESIGN_CONTEXT_ROOT 로 로컬 경로를 지정하세요.`
- **오프라인이지만 캐시 존재** → fetch 실패를 경고로만 출력하고 기존 캐시로 진행(빌드 막지 않음).
- **env 지정됨** → 신뢰하고 fetch 생략. env 경로가 없으면 repo.js의 기존 fallback이 처리(스크립트는 관여 안 함).

### 영향 범위

- **콘텐츠 작성자(본인)**: 형제 폴더를 그대로 사용 → 기존 워크플로 변화 없음, 작업 중 로컬 콘텐츠가 덮어써지지 않음.
- **팀원**: `npm run build`/`npm run dev` 한 번으로 최신 콘텐츠 자동 확보.
- **미래 CI/Pages**: 동일 스크립트가 CI에서도 동작한다. 단 private 레포라 CI에는 deploy token/SSH key 주입이 필요(이번 범위 밖, README에 한 줄 언급).

## Testing

- `scripts/ensure-context.mjs` 단위 검증: env 분기 / 형제 분기 / 캐시 분기 선택이 올바른지 (git 호출은 주입 가능한 형태로 분리해 모킹하거나, 분기 결정 함수만 순수 함수로 분리해 테스트).
- `resolveContextRoot()`가 관리 캐시 경로를 후보에 포함하고 우선순위가 스크립트와 일치하는지 확인 (기존 `scripts/repo-context.test.mjs` 연장).
- 수동 검증: 형제 폴더를 임시로 숨긴 상태에서 `npm run build` → 캐시가 생성되고 프리뷰가 정상 렌더되는지 확인.

## Out of Scope

- 콘텐츠(context 레포) 자체의 수정.
- 렌더링 로직(`resolveScreenPreviewHtml`, 컴포넌트) 변경.
- CI/CD·GitHub Pages 배포 파이프라인 구축(별도 작업).
- 서브모듈 전환(최신성 방향을 택했으므로 제외).
