# site/ — 오늘의집 디자인 (Vision Site)

> repo 의 markdown 컨텐츠를 PD 가 브라우저로 탐색·공유할 수 있게 만든 사이트.
> 계획: [`_meta/plans/2026-05-vision-site.md`](../_meta/plans/2026-05-vision-site.md)

## 로컬 실행

```bash
cd site
npm install
npm run dev
# → http://localhost:4321
```

## 빌드

```bash
npm run build      # → dist/ 에 정적 HTML 출력
npm run preview    # 빌드 결과 미리보기
```

## 구조

```
site/
├── astro.config.mjs       — Astro 설정 (@repo alias 로 ../domains 접근)
├── src/
│   ├── layouts/Layout.astro      ← 공통 레이아웃 + 상단 nav
│   ├── components/               ← Nav, DomainCard, ScreenThumb 등
│   ├── pages/                    ← 라우트
│   │   ├── index.astro           ← 홈 (도메인 디스커버)
│   │   ├── d/[domain].astro      ← 도메인 상세
│   │   ├── d/[domain]/s/[screen].astro  ← Screen 상세
│   │   ├── knowledge/index.astro ← 지식 축 인덱스
│   │   ├── knowledge/[slug].astro ← 개별 지식 페이지
│   │   ├── vision.astro          ← 끝 그림 (_meta/VISION.md)
│   │   ├── ods.astro             ← ODS 인덱스 (Phase 2 placeholder)
│   │   ├── asset.astro           ← Asset (Phase 2 placeholder)
│   │   └── mcp.astro             ← MCP 설치 가이드 (Phase 2 placeholder)
│   ├── lib/                      ← markdown / git / prompt 헬퍼
│   └── styles/global.css         ← 디자인 토큰
└── public/                       ← 정적 자산
```

## 데이터 소스

| 사이트 element | repo path |
|---|---|
| 도메인 목록 | `../domains/*/README.md` |
| 도메인 카드 메타 | 위 frontmatter (`tier`, `owner` 등) |
| Screen 썸네일 | `../domains/<d>/screens/<s>/thumbnail.{png,webp}` (없으면 placeholder) |
| Knowledge | `../knowledge/*.md` |
| Vision | `../_meta/VISION.md` |
| Last updated | `git log -1 --format=%ai <path>` |

## Copy prompt

각 screen / component 카드의 [⟳ Copy prompt] 버튼 → 미리 빌드된 prompt 가 클립보드에 복사 → Claude / ChatGPT 에 붙여넣기.

prompt 형식은 `_meta/plans/2026-05-vision-site.md` §5.2 참조.
