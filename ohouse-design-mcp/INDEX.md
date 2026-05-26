---
tier: 0
when-to-read: "전체 문서 목록이 필요할 때 / 검색 때"
size: "~1k tokens"
owner: 요한
---

# INDEX — 전체 문서 메타

LLM이 **파일 전체를 읽지 않고** 무엇이 있는지 파악하도록 하는 카탈로그. 새 문서 추가 시 이 파일도 업데이트.

---

## 📄 루트 문서

| 파일 | Tier | 용도 | 크기 |
|---|---|---|---|
| `README.md` | 0 | repo 진입점 | ~500t |
| `CLAUDE.md` | 0 | LLM 로딩 룰 | ~800t |
| `CONVENTIONS.md` | 1 | 네이밍/마커/코드 규칙 | ~600t |
| `INDEX.md` | 0 | 이 파일 | ~1k |
| `OWNERS.md` | 1 | 화면별 담당자 마스터 | ~600t |
| `CONTRIBUTING.md` | 1 | PD 용 기여 가이드 (PR 만드는 법) | ~1.2k |

## 🧠 `knowledge/` (디자인 지식 축)

| 파일 | Tier | 용도 | 크기 |
|---|---|---|---|
| `knowledge/README.md` | 2 | 지식 축 진입점·포인터 | ~300t |
| `knowledge/principles.md` | 1 | 오늘의집 디자인 원칙 10개 | ~800t |
| `knowledge/visual-system.md` | 1 | 전사 비주얼 시스템 (브랜드·컬러·타이포·모션) | ~1k |
| `knowledge/ux-design.md` | 1 | UX 설계 가이드 (플로우·정보구조·인터랙션·상태) | ~1k |
| `knowledge/design-insight.md` | 2 | 화면 실험 누적 인사이트 (전사 적용 가능한 발견) | ~400t |
| `.claude/skills/feedback/` (포인터) | — | 피드백 스킬 (Claude Code 메커니즘상 .claude/ 유지) | — |

## 🧭 `_meta/` (LLM 가이드 + 사람용 governance)

### LLM이 참조 가능한 가이드

| 파일 | 용도 |
|---|---|
| `_meta/decision-tree.md` | 작업 유형 → 로드 대상 |
| `_meta/token-budget.md` | 시나리오별 토큰 예산 |

> Tier 0~5 정의는 `CLAUDE.md` 단일 소스. 화면·사람 오너십은 `OWNERS.md` 단일 소스.

### 사람용 governance (LLM·MCP 로드 금지, tier 99)

| 폴더 | 용도 |
|---|---|
| `_meta/decisions/` | ADR — 결정 + 근거 (immutable, 결정이 바뀌면 새 ADR로 supersede) |
| `_meta/plans/` | 진행 중 계획 (status·체크리스트, 완료 시 ADR로 응결) |
| `_meta/discussions/` | 원본 탐색 로그 (append-only) |

## 🛡️ `.github/`

| 파일 | 용도 |
|---|---|
| `.github/CODEOWNERS` | GitHub PR 자동 리뷰어 할당 |
| `.github/PULL_REQUEST_TEMPLATE.md` | PR 작성 템플릿 (체크리스트·자동 동작 안내) |

## 🧩 `ods-docs/` (L1 Atoms — Tyler)

| 경로 | 용도 |
|---|---|
| `ods-docs/README.md` | ODS Docs 진입점 + Hermes 빌드 파이프라인 |
| `ods-docs/CLAUDE.md` | Figma 작업 규칙 (write 작업 가드) |
| `ods-docs/content/components/` | 컴포넌트 목록 (디렉토리 = 카탈로그, public-index가 인덱스 빌드) |
| `ods-docs/content/components/<kebab>/meta.yaml` | id, title, category, status, aliases |
| `ods-docs/content/components/<kebab>/spec.md` | 공식 명세 (구조, props, states, behaviors, constants) |
| `ods-docs/content/components/<kebab>/guide.md` | 사용 가이드 + 의사결정 + anti-patterns |
| `ods-docs/content/components/<kebab>/images/` | Figma export 비주얼 |
| `ods-docs/content/foundations/semantic-tokens/` | 시맨틱 토큰 (tokens.yaml) |
| `ods-docs/content/foundations/palette-tokens/` | 팔레트 토큰 (tokens.yaml) |
| `ods-docs/content/patterns/` | ODS 패턴 (예: product-card) |
| `ods-docs/scripts/build-public-index.mjs` | Hermes public index 빌드 |
| `ods-docs/references/` | Figma plugin api d.ts, design-tokens 참조 |

## 🧬 패턴

**ODS 표준 패턴** — `ods-docs/content/patterns/` (예: product-card).

화면별 재사용 단위(컴포넌트·패턴)는 `domains/<화면>/components/`에서 관리 (`meta.yaml`의 `type: component | pattern` 필드로 구분).

## 🗺️ `domains/` (화면 단위 18개)

**화면 = 도메인.** 조직 구조가 아닌 실제 화면 단위로 관리. 한 사람이 여러 화면 담당 가능. 오너는 대부분 TBD.

| 화면 | 폴더 |
|---|---|
| 홈 | `home/` |
| 집구경 | `house-tour/` |
| 쇼핑 | `shopping/` |
| 인테리어/생활 | `interior-life/` |
| 마이페이지 | `mypage/` |
| 검색 | `search/` |
| 패키지 | `package/` |
| 멤버십 | `membership/` |
| 라이프서비스 | `life-service/` |
| 전체페이지 | `all-page/` |
| 북마크 | `bookmark/` |
| 장바구니 | `cart/` |
| 상품 상세페이지 | `product-detail/` |
| 콘텐츠 상세페이지 | `content-detail/` |
| 카테고리 홈 | `category-home/` |
| 바이너리 홈 | `binary-home/` |
| 3D 방꾸미기 | `room-3d/` |
| 기획전 | `promotion/` |

**화면 도메인 표준 4-서브폴더** (모두 동일):

| 서브폴더 | 용도 |
|---|---|
| `screens/` | 화면 산출물 — variant별 (`default`/`empty`/`loading` 등), `prototype.html\|tsx` + `README.md` |
| `components/` | 이 화면 전용 컴포넌트·패턴 (ods-docs와 동일 구조, `type: component\|pattern`) |
| `policies/` | 이 화면 디자인 정책 (전사 원칙 override 가능, frontmatter `overrides` 명시) |
| `experiments/` | 이 화면 실험·인사이트 (frontmatter `result: win\|loss\|inconclusive`) |

상세는 `domains/README.md`. 오너십은 `OWNERS.md`.

## 🧪 `.claude/` (Claude Code)

| 경로 | 용도 |
|---|---|
| `.claude/skills/` | `/contribute`, `/feedback`, `/writing-bot` 등 |
| `.claude/skills/contribute/SKILL.md` | PD 가 PR 자동 생성하는 워크플로 스킬 |
| `.claude/plugins/` | figma-watcher, ds-feedback 등 (Phase 2) |

## 📦 `_archive/`

레거시 문서 + 피드백 루프 수집물. 기본적으로 LLM 로드 대상 아님.
