# 스크린 실험/디벨롭 히스토리 (Screen Info 탭 재정의)

- **작성일**: 2026-06-05
- **브랜치**: `site-optimization-design-tuning-v.1`
- **관련**: 직전 작업(Screen Info 탭, 단계 뷰어). [[prototype-selfhost-2b]]

## 배경 / 문제

content-tab의 `prototype-meta.md`(현 Screen Info 탭 내용)는 *"콘텐츠 피드 프로토타입을 1차→3b로 **만든** 과정 — 단계별 입력·도구(Figma/ODS MCP, O!Slice)·결과물"*, 즉 **프로토타입 제작(빌드) 시도 내역**이다. 스크린의 디자인 실험/디벨롭 히스토리가 아니므로 사이트에 노출할 필요가 없다. 반면, 스크린이 실제로 **실험/디벨롭 단계별 히스토리**(화면+설명)를 가진 경우 이를 보여주는 기능은 유지·일반화한다.

## 결정 (사용자 확정)

1. Screen Info 탭 = **'스크린 실험/디벨롭 히스토리' 전용** 소스(별도 파일). `prototype-meta.md`(제작 메타)는 더 이상 탭에 렌더하지 않음(파일은 repo에 내부 문서로 유지).
2. 해당 히스토리가 **없으면 Screen Info 탭 미표시**(기존 조건부 로직 유지). → content-tab은 ODS/Domain 탭만.
3. 단계별 화면 제공 형식 = **마크다운 + 이미지 첨부**.
4. 이미지는 **스크린 폴더에 함께 첨부** → 빌드가 `public/`로 복사하고 마크다운 상대경로를 자동 치환.
5. 직전에 만든 "단계별 라이브" 버튼·프로토타입 `?stage=` 노출은 제거(빌드 시도 단계 노출이었음). 단, 구현(컴포넌트)은 **삭제하지 않고 휴면**.

## 비목표 (YAGNI)

- 단계별 라이브 전환/프로토타입 단계 스위처 노출 — 제거.
- 구조화 frontmatter/단계 폴더 스키마 — 채택 안 함(마크다운 자유 형식).
- content-tab용 히스토리 신규 작성 — 이번엔 없음(기능·가이드만 준비).

## 데이터 모델 / 파일 규약

- 스크린 폴더: `ohouse-design-mcp/domains/<domain>/screens/<screen>/`
  - `history.md` — (선택) 실험/디벨롭 히스토리 마크다운. 존재 시 Screen Info 탭에 렌더.
  - 이미지: 같은 폴더(또는 하위)에 첨부, 마크다운에서 **상대경로** `![설명](./stage-1.png)`로 참조.
- 빌드 산출: `ohouse-design-site/public/screen-history/<domain>/<screen>/<file>` — 첨부 이미지의 서빙 위치(static 사이트는 `public/`에서만 URL 서빙됨).

## 컴포넌트

### ① 이미지 동기화 스크립트 — `ohouse-design-site/scripts/sync-screen-history.mjs`
- 모든 `domains/*/screens/*/history.md`를 찾아, 그 옆 이미지 파일(`png|jpg|jpeg|webp|gif|svg`)을 `public/screen-history/<domain>/<screen>/`로 복사.
- 기존 `scripts/*.mjs`(무의존 ESM) 컨벤션. graceful: 대상 없으면 no-op, 실패 시 warn(빌드 안 깨짐).
- 빌드 연동: `package.json build`에 `astro build` **이전** 단계로 추가(예: `validate → snapshot:prototypes → sync-screen-history → astro build`). dev에서도 커밋된 산출물 사용(이미지 없으면 탭 자체가 없음).

### ② getScreen 히스토리 렌더 — `ohouse-design-site/src/lib/repo.js`
- 신규 필드 `historyHtml`: `history.md` 존재 시 `marked`로 렌더, 없으면 `null`.
- **이미지 src 치환**: 렌더 시 상대경로 이미지(`http`/`/`로 시작 안 함)를 `withBase('screen-history/<domain>/<screen>/<basename>')`로 변환(`marked` image renderer 오버라이드). 절대/외부 URL은 그대로.
- `getScreen`의 기존 `prototypeMetaHtml`(= `prototype-meta.md`) → **탭에서 제거**. (필드/소스 삭제; `prototype-meta.md` 파일 자체는 유지.)

### ③ 스크린 상세 UI — `ohouse-design-site/src/pages/d/[domain]/s/[screen].astro`
- Screen Info 탭/패널 조건을 `screen.prototypeMetaHtml` → `screen.historyHtml`로 교체. 라벨 'Screen Info' 유지. 없으면 탭 미표시(ODS가 첫 탭) — 기존 로직 그대로.
- **단계별 라이브 행 제거**: `.stage-live-row` 마크업 + `initStageLiveLinks` JS + `.stage-live-*` CSS 삭제. 기존 `[data-live-toggle]` 라이브 프리뷰 토글은 유지(최종 화면 미리보기).
- (프로토타입 `App.tsx`의 단계 컴포넌트·`?stage=`는 변경 없음 — 휴면. 라이브 프리뷰는 기본 3b 화면.)

### ④ 담당자 포맷 가이드 (#2 산출물) — `ohouse-design-mcp/screen-history-format.md`
- 대상: 화면 자료 준비 담당자(비-엔지니어 포함).
- 내용:
  - 어디에: `domains/<domain>/screens/<screen>/history.md` 작성.
  - 어떻게: 마크다운 자유 형식(단계별 `##`/`###` 섹션 권장), 각 단계 화면은 같은 폴더에 이미지 첨부 후 `![설명](./파일.png)` 상대경로로 삽입.
  - 표시 위치: 스크린 상세페이지 우측 'Screen Info' 탭(파일 없으면 탭 자체가 안 보임).
  - 주의: 이미지는 상대경로만(빌드가 public으로 복사·치환). 외부 URL/절대경로도 가능.
  - 예시 템플릿 1개 포함.

## 데이터 흐름

```
domains/<d>/screens/<s>/history.md  +  같은 폴더 이미지   [담당자 작성·커밋]
        │ build: sync-screen-history (이미지 복사)
        ↓
public/screen-history/<d>/<s>/<img>
        │ astro build: getScreen.historyHtml (상대 img → /screen-history/... 치환)
        ↓
스크린 상세 'Screen Info' 탭 렌더 (history.md 없으면 탭 미표시)
```

## 에러 처리 / 엣지

| 상황 | 처리 |
|---|---|
| `history.md` 없음 | `historyHtml=null` → Screen Info 탭 미표시 |
| 이미지 누락/깨진 상대경로 | 치환은 basename 기준; 파일 없으면 빈 이미지(빌드는 green). 가이드에 경로 규칙 명시 |
| `public/screen-history` 미존재 | sync 스크립트가 생성 |
| sync 스크립트 실패 | warn + exit 0(빌드 유지) |

## 테스트 / 검증

- 임시 `history.md`+이미지를 한 스크린에 두고: 빌드 시 `public/screen-history/<d>/<s>/`로 복사, Screen Info 탭에 렌더, 이미지 src가 `/screen-history/...`로 치환, `npx astro build` green.
- content-tab: Screen Info 탭 미표시(ODS 첫 탭), `prototype-meta.md` 파일은 존재, 단계별 라이브 버튼 없음.
- 히스토리 없는 스크린: 회귀 없음(ODS/Domain만).
- `getScreen(...).historyHtml === null` (content-tab), 임시 스크린은 비-null.

## 참조

- 프리뷰/탭: `src/pages/d/[domain]/s/[screen].astro`
- 데이터: `src/lib/repo.js` (`getScreen`)
- 정적 자산 서빙 제약: `public/` 직접 경로 (썸네일 수정과 동일 맥락)
