# dashboard/

`ohouse-design-mcp/domains/` 의 화면 도메인을 **누가·언제·무엇을** 관리하는지 추적하는 운영 도구.

| 파일 | 내용 |
|---|---|
| [`POLICY.md`](./POLICY.md) | 운영 정책 — 오너십·신선도 기준·업데이트 의무·운영 리듬 |
| [`generate.mjs`](./generate.mjs) | 대시보드 생성기 (의존성 없음, Node 20+) |
| [`DASHBOARD.md`](./DASHBOARD.md) | **자동 생성** 현황 리포트 (직접 수정 금지) |

## 사용법

```bash
# repo 루트에서
node dashboard/generate.mjs
```

`ohouse-design-mcp/domains/*` 의 git 히스토리 + 각 `README.md` frontmatter(`owner`)를 읽어
`DASHBOARD.md` 를 새로 만든다. 결과는 다음을 보여준다:

- **도메인별 현황** — 상태·오너·최종 수정일·경과일·수정자·커밋수·산출물 수·최근 작업
- **방치 도메인** — 30일 초과, 오래된 순
- **산출물 없는 도메인** / **오너 미지정(TBD)**
- **기여자별** — 커밋 수 · 오너 화면 수

## 정확도 노트

git 히스토리 기반이라 **커밋된 작업만** 반영된다. 새로 만들고 아직 커밋하지 않은 도메인은
"수정 기록 없음(⚫)" 으로 나온다. 권장 주기는 `POLICY.md` 4항(주 1회) 참고.
