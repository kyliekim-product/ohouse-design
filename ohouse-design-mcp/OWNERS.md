# OWNERS — 화면별 담당자 마스터

> 화면 단위로 오너 관리. 한 사람이 여러 화면을 담당할 수 있음.
> 오너는 화면이 너무 많아 대부분 **TBD**. 작업 시작하는 사람이 자기 화면에 owner 등록.

---

## 🗺️ 화면별 담당 (18)

| 화면 | 폴더 | Primary Owner | Reviewer | 메모 |
|---|---|---|---|---|
| 홈 | `home/` | TBD | TBD | |
| 집구경 | `house-tour/` | TBD | TBD | |
| 쇼핑 | `shopping/` | TBD | TBD | |
| 인테리어/생활 | `interior-life/` | TBD | TBD | |
| 마이페이지 | `mypage/` | TBD | TBD | |
| 검색 | `search/` | TBD | TBD | |
| 패키지 | `package/` | TBD | TBD | |
| 멤버십 | `membership/` | TBD | TBD | |
| 라이프서비스 | `life-service/` | TBD | TBD | |
| 전체페이지 | `all-page/` | TBD | TBD | |
| 북마크 | `bookmark/` | TBD | TBD | |
| 장바구니 | `cart/` | TBD | TBD | |
| 상품 상세페이지 | `product-detail/` | TBD | TBD | |
| 콘텐츠 상세페이지 | `content-detail/` | TBD | TBD | |
| 카테고리 홈 | `category-home/` | TBD | TBD | |
| 바이너리 홈 | `binary-home/` | TBD | TBD | |
| 3D 방꾸미기 | `room-3d/` | TBD | TBD | |
| 기획전 | `promotion/` | TBD | TBD | |

---

## 🧱 다른 영역 오너

| 영역 | 폴더 | Owner |
|---|---|---|
| ODS (디자인 시스템) | `ods-docs/` | **Tyler** (`U06T6NEQ0M8`) |
| ODS Hermes MCP | `mcp-servers/ods-hermes/` | **Tyler** |
| 메타·룰 | `_meta/`, `CLAUDE.md`, `INDEX.md`, `CONVENTIONS.md`, `README.md` | **요한** (`U06PVRTFW4D`) |
| 디자인 지식 | `knowledge/` (principles, visual-system) | **요한** |
| Claude Code skills | `.claude/skills/` | **요한** |

---

## 📇 Slack ID 레퍼런스 (참고)

| 담당자 | User ID |
|---|---|
| Tyler | `U06T6NEQ0M8` |
| 요한 | `U06PVRTFW4D` |
| Jack | `U05SH5S3Z8W` |
| Stella | `U04JG8UCPUG` |
| Jenna | `U04HPKBE8S1` |
| Lana | `U092GJY6KR8` |
| Deeer | `UK2DNAVF1` |
| Gongdee | `U013D45SC1Z` |
| Skamie | `U07EEGAD674` |
| Gina | `U0ADHJYLY2G` |
| Sun | `U03674Y2G01` |
| Selah | `U091ZKWFTPA` |

---

## 🔄 업데이트 규칙

- 화면 오너 변경 시 **이 파일 + `domains/<화면>/README.md` frontmatter** 갱신
- 화면 추가/제거 시 **이 파일 + `domains/README.md` + `.github/CODEOWNERS`** 함께 갱신
- 화면 이름(폴더명)은 이후 변경 가능하지만 변경 시 모든 참조 동기화 필요
