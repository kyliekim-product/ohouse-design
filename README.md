# ohouse-design

오늘의집 Product Design — 디자인 도메인 사이트.

- `ohouse-design-mcp/` — 도메인(화면) 지식·정책·실험·컴포넌트 (SSOT)
- `ohouse-design-site/` — Astro 기반 디자인 사이트 (위 콘텐츠를 읽어 렌더)
- `dashboard/` — 도메인 운영 대시보드(생성기 + 리포트 + 운영정책)

## 배포

`main` 에 푸시되면 GitHub Actions(`.github/workflows/deploy.yml`)가 Astro 사이트를 빌드해 GitHub Pages 로 배포한다.

- 공개 주소: https://ohouse-product-design.github.io/ohouse-design/

## 로컬 실행

```bash
cd ohouse-design-site
npm install
npm run dev   # http://localhost:4321
```

콘텐츠는 `../ohouse-design-mcp` 를 읽는다 (repo.js `resolveRoot`). 사이트 코드만 수정해도 도메인 데이터는 자동 반영.

> 이 repo 는 `bucketplace-knowledge/orgs/Product/Product Design/{ohouse-design-mcp, ohouse-design-site}` 를 동기화한 배포용 미러.
