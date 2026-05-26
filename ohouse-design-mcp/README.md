# Ohouse Product Design

오늘의집 디자인 자산 + ODS + 도메인 지식을 **LLM 친화적**으로 정리한 repo.
"Figma 화면 → 30초 코드" 와우 모먼트를 위한 공통 지식 베이스.

---

## 📂 구조

### 루트 문서 (Tier 0~1)
- **`CLAUDE.md`** — LLM 로딩 룰 (Claude Code가 자동 로드)
- **`knowledge/visual-system.md`** — 전사 비주얼 에셋 마스터 (여기부터 시작)
- **`knowledge/principles.md`** — 디자인 원칙
- **`CONVENTIONS.md`** — 네이밍, 마커, 코드 규칙
- **`INDEX.md`** — 전체 문서 메타 인덱스

### 레이어

| 폴더 | 레이어 | 오너 |
|---|---|---|
| `ods-docs/` | L1 Atoms — ODS 컴포넌트·토큰 문서 원천 + Hermes public index 생성 | **Tyler** |
| `mcp-servers/ods-hermes/` | ODS Hermes MCP npm 패키지 | **Tyler** |
| `domains/` | 화면 단위 18개 — screens / components / policies / experiments | **각 화면 오너 (TBD)** |
| `knowledge/` | 디자인 지식 축 (원칙·피드백) | 요한 |
| `_meta/` | LLM 가이드 — 로딩 순서, 결정 트리, 토큰 예산 | 요한 |
| `.claude/` | Claude Code skills / plugins | 요한 |
| `_archive/` | 레거시 | — |

---

## 🔍 LLM 첫 읽기 순서

1. `CLAUDE.md` (자동 로드)
2. `README.md` (지금)
3. `_meta/decision-tree.md` — 작업 유형 → 어디 볼지
4. 작업 대상 폴더만 (전체 읽지 말 것)

고정 비용 ~3k tokens + 작업별 동적. 전체 로드 시 50k+.

---

## 👥 오너십

- **메타** (`README`, `knowledge/`, `CONVENTIONS.md`, `_meta/`, `.claude/`) — 요한
- **ODS** (`ods-docs/`, `mcp-servers/ods-hermes/`) — Tyler
- **화면 18개** (`domains/<화면>/`) — 대부분 **TBD**. 작업 시작하는 사람이 자기 화면에 owner 등록.
- 상세는 `OWNERS.md`.

---

## 🚀 첫 커밋 기여 가이드 (PD용)

1. `CONVENTIONS.md` 읽고 네이밍/마커 규칙 숙지
2. 작업할 화면 폴더로 이동 (`domains/<화면>/`) — `README.md` 의 owner 필드를 본인 이름으로 (TBD인 경우)
3. 4 서브폴더 (`screens`/`components`/`policies`/`experiments`) 중 해당 위치에 파일 추가
4. `INDEX.md` 표에 1줄 추가
5. PR 올리기 — 리뷰는 요한 + (다른 오너 있으면 그 오너)

---

## 📅 상태

- **v0.1** (2026-04-17) — scaffold 초안, W1 킥오프
- 상위 플랜: `Design System/Plans/3개월 플랜.md` v2.0
