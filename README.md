# ohouse-design

오늘의집 Product Design — 디자인 도메인 사이트.

- `ohouse-design-mcp/` — 도메인(화면) 지식·정책·실험·컴포넌트 (SSOT)
- `ohouse-design-site/` — Astro 기반 디자인 사이트 (위 콘텐츠를 읽어 렌더)
- `dashboard/` — 도메인 운영 대시보드(생성기 + 리포트 + 운영정책)

## 배포

GitHub Pages 자동 배포는 사내 Nexus 패키지 접근 제약 때문에 사용하지 않는다.
사이트는 사내 WiFi/VPN 환경에서 `/deploy` 스킬로 정적 빌드 산출물을 배포한다.

- 프로젝트 경로: `ohouse-design-site/`
- 권장 팀 폴더: `common`
- 현재 preview: https://static-contents.datapl.datahou.se/v2/common/ohouse-design-preview/

ODS 문서는 Nexus의 `@bucketplace/ods-site-content` 패키지를 exact version으로 받아 렌더한다.

## 로컬 실행

```bash
cd ohouse-design-site
npm install
npm run dev   # http://localhost:4321
```

콘텐츠는 `../ohouse-design-mcp` 를 읽는다 (repo.js `resolveRoot`). 사이트 코드만 수정해도 도메인 데이터는 자동 반영.

> 이 repo 는 `bucketplace-knowledge/orgs/Product/Product Design/{ohouse-design-mcp, ohouse-design-site}` 를 동기화한 배포용 미러.
