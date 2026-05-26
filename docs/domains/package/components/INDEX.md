---
tier: 4
when-to-read: "패키지 전용 컴포넌트·패턴 탐색"
size: "~150 tokens"
screen: package
owner: TBD
---

# 패키지 — Components & Patterns

ODS에 **없거나** 이 화면 특수 변형이 필요한 재사용 단위만. ODS에 있으면 무조건 `ods-docs/content/`.

`meta.yaml`의 `type` 필드로 구분:
- `type: component` — 재사용 UI 블록
- `type: pattern` — 이 화면 안 반복 UI 해결책

| 이름 | type | 상태 | 요약 |
|---|---|---|---|
| [product-item-package](product-item-package/spec.md) | component | verified | 패키지 메인 화면 안 상품 카드 |
| [package-reco-card](package-reco-card/spec.md) | component | draft | 카테고리 추천 카드 (추가된 상품 기준 매트릭스) |
| [package-progress-bar](package-progress-bar/spec.md) | component | draft | 하단 진행바 + 조건 충족 3단계 애니메이션 |
| [brand-discount-banner](brand-discount-banner/spec.md) | component | draft | 상품 카드 하단 브랜드 할인 넛지 배너 |
| [option-selector](option-selector/spec.md) | pattern | draft | 메인 카드 옵션 편집 바텀시트 (글린다 전용) |
| [option-modal](option-modal/spec.md) | pattern | draft | PDP 패키지담기 옵션 선택 모달 |
| [package-price-modal](package-price-modal/spec.md) | pattern | draft | 패키지 할인가 보기 모달 |
| [confirm-toast](confirm-toast/spec.md) | component | draft | 담기 확인 토스트 (maxmerge 문구) |

## 추가 방법

1. ODS에 정말 없는지 `ods-docs/content/` 확인
2. `<kebab-name>/` 폴더 생성
3. `meta.yaml` 작성 (id: `domain.package.<name>`, `type: component` 또는 `pattern` — id 규격은 `../../../CONVENTIONS.md` 참조)
4. `spec.md` + `guide.md` 작성
5. 5+ 화면에서 중복 발견되면 ODS 승격 후보

규격: `ods-docs/content/components/`와 동일.
