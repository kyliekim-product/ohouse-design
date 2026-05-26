---
tier: 4
when-to-read: "기획전 전용 컴포넌트·패턴 탐색"
size: "~150 tokens"
screen: promotion
owner: TBD
---

# 기획전 — Components & Patterns

ODS에 **없거나** 이 화면 특수 변형이 필요한 재사용 단위만. ODS에 있으면 무조건 `ods-docs/content/`.

`meta.yaml`의 `type` 필드로 구분:
- `type: component` — 재사용 UI 블록
- `type: pattern` — 이 화면 안 반복 UI 해결책

| 이름 | type | 상태 | 요약 |
|---|---|---|---|
| _(아직 없음)_ | — | — | — |

## 추가 방법

1. ODS에 정말 없는지 `ods-docs/content/` 확인
2. `<kebab-name>/` 폴더 생성
3. `meta.yaml` 작성 (id: `screen.promotion.<name>`, `type: component` 또는 `pattern`)
4. `spec.md` + `guide.md` 작성
5. 5+ 화면에서 중복 발견되면 ODS 승격 후보

규격: `ods-docs/content/components/`와 동일.
