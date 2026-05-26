---
tier: 4
when-to-read: "집구경 화면 산출물 카탈로그"
size: "~150 tokens"
screen: house-tour
owner: Deeer
---

# 집구경 — Screens

화면 산출물 카탈로그. 각 variant = `<variant-name>/` 폴더 (`prototype.html` 또는 `prototype.tsx` + `README.md`).

| Variant | 상태 | Figma | 썸네일 |
|---|---|---|---|
| content-tab | production | (frontmatter 참조) | — |
| upcoming/context-builder | upcoming | (frontmatter 참조) | — |

## 추가 방법

1. `<variant-name>/` 폴더 생성 (예: `default`, `empty`, `loading`, `error`, `mobile`, `web`)
2. `prototype.html` 또는 `prototype.tsx` 1개 (택1)
3. `README.md` — frontmatter(figma URL, status, owner) + 사용 컴포넌트 마커 + 진입/이탈
4. (선택) `thumbnail.png`
5. 이 INDEX.md 표에 1줄 추가

규격: `../../../CONVENTIONS.md` "화면 산출물 규격" 섹션.
