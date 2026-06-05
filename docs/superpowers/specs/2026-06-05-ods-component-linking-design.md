# 스크린 ↔ Design System(ODS) 컴포넌트 링크

- **작성일**: 2026-06-05
- **브랜치**: `site-optimization-design-tuning-v.1`
- **관련**: Screen Info/컴포넌트 탭 작업 후속

## 목표

스크린 상세페이지의 **ODS Components 탭** 항목과 Design System(ODS) 컴포넌트 상세 페이지를 **양방향으로 링크**한다.
- 정방향: 스크린의 ODS 항목 → `/ods/components/<slug>`.
- 역방향: ODS 컴포넌트 상세 → "이 컴포넌트를 사용하는 스크린" 목록.

## 배경 / 현황

- 스크린의 ODS 사용 정보 = README frontmatter `linked_yaml_components` (현재 `content-tab` 1곳: `[ContentsLandscapeCard, ContentsPortraitCard]`). `@ods-component:` 마커는 없음.
- `getScreenComponentUsage(domainSlug, screenSlug).ods` = `linked_yaml_components`를 `{slug,label,type:'ods',source}`로 매핑.
- ODS 카탈로그 = npm `@bucketplace/ods-site-content` (`getOdsComponents()` → 20개, **kebab-case slug + title**: `card|Card`, `tab|Tab`, `thumbnail|Thumbnail`, `scrap-button|Scrap Button`, `product-card|Product Card`, `chip|Chip`, `dialog|Dialog` …). 상세 라우트 `/ods/components/[slug]`, 인덱스 `/ods`.
- **현 데이터 불일치**: `ContentsLandscapeCard`/`PortraitCard`는 카탈로그에 매칭 0건(합성/트랙 카드명).

## 결정 (사용자 확정)

1. **연결 키 = 이름 정규화 매칭** (slug·title 모두 정규화 비교). 미매칭은 링크 없이 평문.
2. **양방향 링크**.
3. **content-tab 데이터 보정**: `linked_yaml_components`를 실제 사용 ODS명으로 교체해 시연 가능하게.

## 비목표 (YAGNI)

- 합성 카드(ContentsLandscapeCard) → 구성 ODS 다중 매핑(별칭 맵) — 채택 안 함.
- ODS 카탈로그/패키지 변경 — 읽기만.
- `@ods-component:` 마커 신규 도입 — 이번 범위 아님(`linked_yaml_components` 유지).

## 컴포넌트

### ① 매칭 유틸 — `resolveOdsSlug(name, catalog)` (repo.js, export, 순수)
- `normalize(s) = String(s).toLowerCase().replace(/[^a-z0-9]/g, '')`.
- `catalog`(기본 `getOdsComponents()`)의 각 항목에 대해 `normalize(slug)` 또는 `normalize(title)` 가 `normalize(name)` 와 같으면 그 항목의 **slug** 반환. 없으면 `null`.
- 예: `Tab→tab`, `Chip→chip`, `Thumbnail→thumbnail`, `ScrapButton→scrap-button`, `Dialog→dialog`, `ProductCard→product-card`; `ContentsLandscapeCard→null`.
- 테스트 주입 위해 `catalog` 인자 + 기본값 패턴(기존 `screenThumbUrl`/`resolveChromeBinary` 컨벤션).

### ② 정방향 — `getScreenComponentUsage` ODS 항목 보강 (repo.js)
- 각 ODS 항목에 `odsSlug = resolveOdsSlug(name)` 와 `href = odsSlug ? withBase('ods/components/' + odsSlug) : null` 추가.

### ③ 정방향 렌더 — `[screen].astro` ODS 패널
- ODS 컴포넌트 카드: `component.href` 있으면 카드를 `<a href=...>`로 감싸 링크(링크 어포던스 ↗ 추가), 없으면 기존 평문 카드 유지.
- 도메인 패널·구조는 그대로.

### ④ 역방향 인덱스 — `getOdsComponentScreens(odsSlug)` (repo.js)
- 전 도메인(`getAllDomains`) → 각 도메인 스크린(`getDomainScreens`) → README `linked_yaml_components` → `resolveOdsSlug` 로 해석 → **slug별 스크린 목록** 구성.
- 반환: `[{ domain, slug, label, href: withBase('d/<domain>/s/<screen>') }]` (해당 ODS를 쓰는 스크린들). 내부적으로 인덱스 1회 구축 후 조회(메모이즈 가능).

### ⑤ 역방향 렌더 — `/ods/components/[slug].astro`
- 페이지에 "이 컴포넌트를 사용하는 스크린" 섹션 추가. `getOdsComponentScreens(slug)` 결과를 스크린 링크 리스트로 렌더. 결과 0건이면 섹션 숨김(또는 "사용 스크린 없음" 비표시).

### ⑥ 데이터 보정 — `content-tab/README.md`
- `linked_yaml_components`를 카탈로그 매칭되는 실제 ODS명으로 교체:
  `[Tab, Chip, Thumbnail, ScrapButton, Dialog]` (프로토타입 사용 + 화면 가시 요소 ∩ 카탈로그 20개 기준; 구현 시 프로토타입/카탈로그로 최종 확인, 매칭 안 되는 항목은 제외).

## 데이터 흐름

```
README.linked_yaml_components ──resolveOdsSlug──▶ ODS slug
        │ getScreenComponentUsage(+href)                 │ getOdsComponentScreens (전 스크린 역인덱스)
        ▼                                                ▼
스크린 ODS 탭 카드 → /ods/components/<slug>     ODS 상세 "사용 스크린" → /d/<d>/s/<s>
```

## 에러 처리 / 엣지

| 상황 | 처리 |
|---|---|
| 이름 미매칭 | 정방향 평문(링크 없음), 역방향 제외 |
| `linked_yaml_components` 없음 | ODS 항목 0개(현행 유지) |
| ODS 카탈로그 로드 실패(패키지 부재) | `getOdsComponents()` 동작에 의존(기존과 동일); 매칭 0 → 링크 없음, 빌드 유지 |
| 같은 ODS를 여러 스크린이 사용 | 역방향 목록에 모두 표시(중복 스크린은 dedupe) |

## 테스트 / 검증

- `resolveOdsSlug` 단위 테스트: `Tab→tab`, `ScrapButton→scrap-button`, `Product Card→product-card`, 대소문자/공백 무시, `ContentsLandscapeCard→null` (주입 catalog 사용).
- content-tab 보정 후: ODS 탭 항목이 `/ods/components/<slug>` 링크로 렌더(매칭된 것), `getScreenComponentUsage('house-tour','content-tab').ods[*].href` 비-null.
- ODS 상세(예: `/ods/components/tab`)에 content-tab이 "사용 스크린"으로 노출, `/d/house-tour/s/content-tab` 링크.
- `npx astro build` green.

## 참조

- `src/lib/repo.js` (`getScreenComponentUsage`, `getAllDomains`, `getDomainScreens`, `withBase`)
- `src/lib/ods-content.js` (`getOdsComponents`)
- `src/pages/d/[domain]/s/[screen].astro` (ODS 패널)
- `src/pages/ods/components/[slug].astro` (ODS 상세)
