# contents-feed (self-host 프로토타입 포크)

`ohouse-design-context/tracks/contents/_pilot-sandbox`를 포크한 React/Vite 콘텐츠 피드 프로토타입. 사이트(`ohouse-design-site`) 상세페이지의 live 프리뷰에서 **same-origin self-host**로 쓰기 위한 사본이다.

## 원본과의 차이 (이미 적용됨)
- `src/App.tsx`: 시안 전환 탭(`StageSelector`)과 제작 메타 카드(`StageMeta`)를 화면에서 제거하고 최종 `Stage3bContent`(피드 한 판)만 렌더. 제작 메타는 사이트 우측 컬럼(`prototype-meta.md`)에서 문서로 보여준다.
- `vite.config.ts`: `base: './'`(임의 subpath 동작), `build.outDir`을 `../../ohouse-design-site/public/prototypes/contents-feed`로(사이트 public에 직접 출력).

## 빌드 (사내망/VPN 필요)
`@bucketplace/*`는 사내 Nexus(`nexus.co-workerhou.se`)에서 받으므로 **사내망/VPN 연결 상태**여야 한다.

```bash
# pnpm은 corepack으로 사용 (전역 pnpm 미설치 가정)
corepack pnpm install            # 주의: 출력에 | tail 붙이지 말 것 (exit code 가려짐)
corepack pnpm exec vite build    # 산출물 → ohouse-design-site/public/prototypes/contents-feed/
```

빌드 후 사이트에서 연결: `domains/house-tour/screens/content-tab/README.md`의 frontmatter를
`prototype_url: https://…` → `prototype_app: prototypes/contents-feed/`로 교체.

## 유지보수 루프
소스 수정 → 위 빌드 재실행 → `ohouse-design-site/public/prototypes/contents-feed/` 산출물 재커밋.
