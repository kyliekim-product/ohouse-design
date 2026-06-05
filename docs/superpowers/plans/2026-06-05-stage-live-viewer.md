# 단계별 시안(1/2/3a/3b) 라이브 열람 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 스크린 상세페이지 Screen Info 탭의 '단계별 상세'에서 각 단계(1차/2차/3a/3b)의 디벨롭 정보와 함께 **그 단계 화면을 라이브로 전환해 확인**할 수 있게 한다. (정적 단계별 썸네일은 만들지 않음 — 라이브 전환만.)

**Architecture:** self-host 프로토타입(`prototypes/contents-feed`)에는 이미 `Stage1~3bContent`·`StageSelector`·`renderTopNav(stage)`가 모두 존재하나, self-host 시 `App()`이 `Stage3bContent` 단독으로 축소되어 1/2/3a 화면을 볼 수 없다. `App()`을 **`?stage=` URL 파라미터로 초기 단계를 정하고 `StageSelector`로 라이브 전환**하도록 복원하고(단, 제작 메타 `StageMeta`는 사이트 문서와 중복이라 복원 안 함), 사이트의 '단계별 상세'에 **각 단계로 점프하는 라이브 링크**를 추가해 라이브 프리뷰 iframe을 해당 단계로 전환한다.

**Tech Stack:** React 18 + Vite (프로토타입), Astro (사이트), 기존 `snapshot-prototypes.mjs`(3b 기본 썸네일만 유지).

---

## 배경 / 조사 결과

- `prototypes/contents-feed/src/App.tsx`: `type Stage = '1'|'2'|'3a'|'3b'`, `Stage1Content`(1710)·`Stage2Content`(1768)·`Stage3aContent`(1889)·`Stage3bContent`(1975), `StageSelector`(1247, 라벨 1차/2차/3a 초안/3b 디벨롭), `renderTopNav(stage)`(2049), `STAGE_META`/`LAYER_MATRIX`/`StageMeta` 모두 존재.
- 포크 원본(`_pilot-sandbox/src/App.tsx`)의 `App()`:
  ```jsx
  const [stage, setStage] = useState<Stage>('3b');
  return (
    <ScreenShell topNavigation={renderTopNav(stage)}>
      <StageSelector active={stage} onChange={setStage} />
      <StageMeta stage={stage} />
      {stage === '1' && <Stage1Content />} ... {stage === '3b' && <Stage3bContent />}
    </ScreenShell>
  );
  ```
- 현재 포크 `App()`은 `<ScreenShell topNavigation={renderTopNav('3b')}><Stage3bContent/></ScreenShell>` 로 고정 → 1/2/3a 미노출.
- 사이트 라이브 프리뷰: `[screen].astro`의 `iframe.shead__live[data-live-frame][data-src=prototypeUrl]`, `[data-live-toggle]` 버튼이 토글. `prototypeUrl = /prototypes/contents-feed/index.html`.
- 단계 정보 SSOT: `prototype-meta.md`의 '## 단계별 상세'(각 단계 입력/결합계층/결과물/핵심발견). 이미 Screen Info 탭에 렌더됨.

## 비목표 (YAGNI)

- 단계별 정적 썸네일 캡처 — 라이브 전환만 (사용자 결정). `snapshot-prototypes.mjs`의 3b 기본 썸네일은 그대로.
- `StageMeta`(프로토타입 내 메타 카드) 복원 — 사이트 '단계별 상세'와 중복.
- 단계별 상세를 별도 최상위 탭으로 분리 — Screen Info 내 '단계별 상세' 강화로 유지 (사용자 결정).

---

## Task 1: 프로토타입 — `?stage=` 초기화 + StageSelector 라이브 전환 복원

**Files:**
- Modify: `prototypes/contents-feed/src/App.tsx` (App() 함수, 현재 ~2093)

- [ ] **Step 1: App() 복원 (URL 시드 + StageSelector)**

`App()`을 아래로 교체. `StageSelector`만 복원하고 `StageMeta`는 제외(사이트 문서와 중복). 초기 stage는 `?stage=`(유효값 1/2/3a/3b)에서, 없으면 '3b'. 전환 시 URL 동기화(딥링크/공유).
```jsx
const STAGES: Stage[] = ['1', '2', '3a', '3b'];

function initialStage(): Stage {
  const p = new URLSearchParams(window.location.search).get('stage');
  return (STAGES as string[]).includes(p ?? '') ? (p as Stage) : '3b';
}

export function App(): JSX.Element {
  const [stage, setStage] = useState<Stage>(initialStage);
  const onChange = (s: Stage) => {
    setStage(s);
    const url = new URL(window.location.href);
    url.searchParams.set('stage', s);
    window.history.replaceState({}, '', url);
  };
  return (
    <ScreenShell topNavigation={renderTopNav(stage)}>
      <StageSelector active={stage} onChange={onChange} />
      {stage === '1' && <Stage1Content />}
      {stage === '2' && <Stage2Content />}
      {stage === '3a' && <Stage3aContent />}
      {stage === '3b' && <Stage3bContent />}
    </ScreenShell>
  );
}
```
(주의: 기존 self-host 주석은 "StageMeta 제거, 3b만"이었으나 이제 StageSelector를 의도적으로 복원하므로 주석도 갱신.)

- [ ] **Step 2: 빌드 → public 반영**

Run: `cd prototypes/contents-feed && node_modules/.bin/vite build`
Expected: `ohouse-design-site/public/prototypes/contents-feed/` 갱신(`assets/index-*.js` 해시 변경), exit 0. (네트워크: VPN 필요 — CDN 이미지)

- [ ] **Step 3: 단계 전환 수동 검증**

`http://localhost:4321/prototypes/contents-feed/index.html?stage=1` … `?stage=3a` 등을 열어 각 단계 화면이 다르게 렌더되고, StageSelector 클릭 시 라이브 전환 + URL `?stage=` 갱신되는지 확인.

- [ ] **Step 4: 커밋**
```bash
git add prototypes/contents-feed/src/App.tsx ohouse-design-site/public/prototypes/contents-feed
git commit -m "feat: restore stage switching (?stage + StageSelector) in contents-feed prototype"
```

---

## Task 2: 사이트 — '단계별 상세'에 단계별 라이브 링크 추가

각 단계로 라이브 프리뷰를 전환하는 링크 행을 Screen Info '단계별 상세' 위에 추가한다. 클릭 시 라이브 iframe을 `prototypeUrl?stage=X`로 띄우고 라이브 뷰를 활성화한다.

**Files:**
- Modify: `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`
- (가능하면) Modify: `ohouse-design-mcp/.../content-tab/prototype-meta.md` — 단계별 라이브 링크용 마커는 사이트가 stage 목록을 알면 불필요. 데이터는 고정 STAGES로 처리.

- [ ] **Step 1: Screen Info 패널 상단에 단계 링크 행 마크업**

`screen.prototypeUrl` 존재 시, Screen Info 패널(`data-screen-info-panel="screen-info"`)의 `set:html` 위에 단계 링크 행 삽입:
```astro
{screen.prototypeUrl && (
  <div class="stage-live-row" aria-label="단계별 라이브">
    <span class="stage-live-row__label">단계별 라이브</span>
    {[['1','1차'],['2','2차'],['3a','3a 초안'],['3b','3b 디벨롭']].map(([id, label]) => (
      <button type="button" class="stage-live-link" data-stage-live={id}>{label}</button>
    ))}
  </div>
)}
```

- [ ] **Step 2: 단계 링크 → 라이브 iframe 전환 JS**

스크립트에 추가: 단계 버튼 클릭 시 `[data-live-frame]`의 src를 `prototypeUrl?stage=X`로 설정하고 표시(기존 토글과 동일 동작) + 토글 버튼 상태 동기화. (기존 `data-live-toggle` 로직 재사용/공유)
```js
document.querySelectorAll('[data-stage-live]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const frame = document.querySelector('[data-live-frame]');
    const base = frame?.getAttribute('data-src');
    if (!frame || !base) return;
    const sep = base.includes('?') ? '&' : '?';
    frame.setAttribute('src', `${base}${sep}stage=${btn.dataset.stageLive}`);
    frame.removeAttribute('hidden');
    const thumb = frame.closest('.shead__thumb'); if (thumb) thumb.style.position = 'relative';
    const toggle = document.querySelector('[data-live-toggle]');
    if (toggle) { toggle.setAttribute('aria-pressed', 'true'); toggle.textContent = '■ 정적 프리뷰로 돌아가기'; }
  });
});
```

- [ ] **Step 3: 스타일**

`.stage-live-row`(flex, gap, 하단 여백), `.stage-live-link`(pill 버튼, `--c-bg-elev` 배경, hover) 추가. 기존 `.dtab`/badge 톤과 일관.

- [ ] **Step 4: 검증**

`npx astro build` green. content-tab Screen Info에 단계 링크 행 노출, 클릭 시 라이브 iframe이 해당 단계로 전환되는지 dev에서 확인. 외부 요청 없음(같은 same-origin prototype).

- [ ] **Step 5: 커밋**
```bash
git add "ohouse-design-site/src/pages/d/[domain]/s/[screen].astro"
git commit -m "feat: per-stage live links in screen-info 단계별 상세"
```

---

## 확정된 결정 / 열린 고려사항

- **결정(사용자)**: 라이브 전환만(정적 단계 썸네일 없음) · Screen Info '단계별 상세' 내 강화.
- **고려**: 라이브 프리뷰 기본은 3b 유지. StageSelector가 라이브 뷰 상단에 칩으로 노출됨(원본과 동일) — 3b 기본 화면에 약간의 chrome 추가. 거슬리면 StageSelector를 접이식/우상단 컴팩트로 조정 가능(후속).
- **고려**: 단계 링크를 새 탭으로 열지(`<a target=_blank href=prototypeUrl?stage=X>`) vs iframe in-place 전환. 본 계획은 in-place. 새 탭 병행도 1줄로 추가 가능.

## Self-Review

- Spec 커버리지: 1/2/3a 미노출 원인(App 고정) → Task1에서 해소. '단계별 상세에서 정보+화면 확인' → Task1(화면 전환 가능) + Task2(단계별 상세에서 라이브 점프). 라이브 전환만/Screen Info 내 강화 결정 반영.
- Placeholder: 없음(코드·명령 구체화).
- 의존: Task2는 Task1의 `?stage=` 지원에 의존(순서 고정).
