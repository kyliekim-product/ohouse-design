---
tier: 3
when-to-read: "도메인(화면) 탐색 / 어느 화면 작업인지 판단 시"
size: "~600 tokens"
owner: 요한
---

# Domains — 화면 단위

**도메인 = 화면**. 조직 구조가 아닌 **실제 화면 단위**로 관리. 한 사람이 여러 화면을 담당할 수 있는 유연한 구조.

오너는 화면이 너무 많아 일단 모두 **TBD**. 화면별로 작업 시작하는 사람이 owner 등록.

---

## 🗺️ 화면 목록 (25)

오늘의집 디자인 사이트(`ohouse-design-site`)의 화면 분류 기준. 5개 그룹.

### Discovery
| 화면 | 폴더 | Owner | 상태 |
|---|---|---|---|
| 홈 | `home/` | TBD | 🕳️ |
| 집구경 | `house-tour/` | TBD | 🕳️ |
| 쇼핑홈 | `shopping-home/` | TBD | 🕳️ |
| 카테고리 | `category/` | TBD | 🕳️ |

### Shopping
| 화면 | 폴더 | Owner | 상태 |
|---|---|---|---|
| 쇼핑 | `shopping/` | TBD | 🕳️ |
| 상품 상세 | `product-detail/` | TBD | 🕳️ |
| 장바구니 | `cart/` | TBD | 🕳️ |
| 기획전 | `promotion/` | TBD | 🕳️ |
| 바이너리 홈 | `binary-home/` | TBD | 🕳️ |

### Life event
| 화면 | 폴더 | Owner | 상태 |
|---|---|---|---|
| 인테리어/생활 | `interior-life/` | TBD | 🕳️ |
| 패키지 | `package/` | TBD | 🕳️ |
| 멤버십 | `membership/` | TBD | 🕳️ |
| 인터넷&렌탈 | `internet-rental/` | TBD | 🕳️ |
| 이사 | `moving/` | TBD | 🕳️ |

### Core
| 화면 | 폴더 | Owner | 상태 |
|---|---|---|---|
| 검색 | `search/` | TBD | 🕳️ |
| 콘텐츠 상세 | `content-detail/` | TBD | 🕳️ |
| 마이페이지 | `mypage/` | TBD | 🕳️ |
| 북마크 | `bookmark/` | TBD | 🕳️ |
| 전체페이지 | `all-page/` | TBD | 🕳️ |
| 3D 방꾸미기 | `room-3d/` | TBD | 🕳️ |

### Global
| 화면 | 폴더 | Owner | 상태 |
|---|---|---|---|
| 검색-jp | `search-jp/` | TBD | 🕳️ |
| 홈-jp | `home-jp/` | TBD | 🕳️ |
| 쇼핑-jp | `shopping-jp/` | TBD | 🕳️ |
| 콘텐츠-jp | `content-jp/` | TBD | 🕳️ |
| Core-jp | `core-jp/` | TBD | 🕳️ |

화면 추가/제거는 이 표 + 폴더 생성/삭제 동시에. CODEOWNERS와 OWNERS.md도 함께 갱신.

---

## 📂 화면 도메인 표준 구조 (모두 동일)

```
domains/<화면>/
├── README.md            # 화면 개요·오너·관련 화면
├── screens/             # 화면 산출물 (variant별)
│   ├── INDEX.md         # variant 카탈로그
│   └── <variant-name>/  # default / empty / loading / error / mobile / web 등
│       ├── README.md       # variant 개요 + Figma + 썸네일 + 사용 컴포넌트
│       ├── prototype.html  # 또는 prototype.tsx (택1)
│       └── thumbnail.png   # (선택)
├── components/          # 이 화면 전용 컴포넌트·패턴
│   ├── INDEX.md
│   └── <name>/
│       ├── meta.yaml       # id, title, type: component|pattern, status
│       ├── spec.md
│       └── guide.md
├── policies/            # 이 화면 디자인 정책
│   ├── INDEX.md
│   └── <policy>.md
└── experiments/         # 이 화면 실험·인사이트
    ├── INDEX.md
    └── <experiment>.md
```

**규격 준수 이유**: LLM이 어느 화면이든 동일한 4-서브폴더 구조로 읽음. 토큰 예측 가능.

---

## 📐 각 서브폴더 룰

### `screens/` — 화면 산출물
- 한 화면 안 **여러 variant** 보관 (default, empty, loading, error, mobile, web 등).
- 각 variant = 폴더. `prototype.html` 또는 `prototype.tsx` 택1 (혼용 금지).
- `README.md`에 **반드시** 포함: Figma URL · 썸네일 · 사용 컴포넌트 마커 (`@ods-component`, `@track-component`) · 진입/이탈 경로.

### `components/` — 화면 컴포넌트·패턴
- ODS에 **없거나** 이 화면 특수 변형이 필요한 경우만.
- 컴포넌트와 패턴 모두 여기. `meta.yaml`의 `type: component | pattern`으로 구분.
- 구조는 `ods-docs/content/components/<name>/`과 동일.
- 5+ 화면에서 중복 생기면 ODS 승격 후보.

### `policies/` — 화면 디자인 정책
- 전사 원칙(`knowledge/principles.md`)에서 **벗어나거나 보강**하는 화면별 룰.
- 각 정책 = 1 카드. frontmatter에 `overrides: [knowledge/principles.md#N]` 명시.

### `experiments/` — 실험·인사이트
- A/B 결과, 사용자 리서치, 정성 인터뷰 정리.
- frontmatter: `period`, `variants: [...]`, `result: win|loss|inconclusive`, `insight`.
- **인사이트**(전환률 외 발견) 별도 표기 — 향후 컴포넌트/정책 후보.

---

## 🚦 화면 간 참조 규칙

- 한 화면 작업 중 다른 화면 폴더 접근 **금지** (토큰 낭비).
- 다른 화면 컴포넌트·패턴 참조만, 복사 금지 — 진짜 동일하면 ODS 승격 절차로.
- 화면 간 진입/이탈 관계는 각 화면의 `README.md` "관련 화면" 섹션에 기록.

---

## 🎯 작업 시작 시

1. 작업할 화면 폴더로 이동: `domains/<화면>/`
2. `README.md` 의 owner 항목을 본인 이름으로 변경 (오너 TBD 일 경우)
3. 4 서브폴더 INDEX.md 표에 작업 결과 1줄 추가
4. PR 올리기 — 리뷰는 요한 + (다른 오너 있는 화면이면 그 오너)

---

## 🔗 관련

- `../OWNERS.md` — 화면 기준 마스터 표 (전체 화면 + 오너)
- `../.github/CODEOWNERS` — GitHub PR 자동 라우팅
- `../ods-docs/content/components/` — ODS 컴포넌트 (화면 컴포넌트 만들기 전 반드시 확인)
- `../ods-docs/content/patterns/` — ODS 표준 패턴
- `../CONVENTIONS.md` — 네이밍·마커 규칙
