---
tier: 4
when-to-read: "집구경 전용 컴포넌트·패턴 탐색"
size: "~150 tokens"
screen: house-tour
owner: Deeer
---

# 집구경 — Components & Patterns

ODS에 **없거나** 이 화면 특수 변형이 필요한 재사용 단위만. ODS에 있으면 무조건 `ods-docs/content/`.

`meta.yaml`의 `type` 필드로 구분:
- `type: component` — 재사용 UI 블록
- `type: pattern` — 이 화면 안 반복 UI 해결책

| 이름 | type | 상태 | 요약 |
|---|---|---|---|
| hscroll | pattern | verified | 가로 스크롤 모듈 (콘텐츠 카드 가로 나열 패턴) |
| interest-feed | pattern | verified | 관심사 피드 모듈 (집구경 메인 피드) |
| legacy-interest-post | pattern | verified | 레거시 관심사 포스트 섹션 (deprecated) |
| recommended-project-section | pattern | verified | 추천 집들이 섹션 |
| topic-chip | component | verified | 콘텐츠 트랙 고유 토픽 칩 |

## 추가 방법

1. ODS에 정말 없는지 `ods-docs/content/` 확인
2. `<kebab-name>/` 폴더 생성
3. `meta.yaml` 작성 (id: `domain.house-tour.<name>`, `type: component` 또는 `pattern`)
4. `spec.md` + `guide.md` 작성
5. 5+ 화면에서 중복 발견되면 ODS 승격 후보

규격: `ods-docs/content/components/`와 동일.
