# CLAUDE.md — LLM 로딩 룰

**이 파일은 Claude Code가 이 repo에서 작업할 때 자동 로드됩니다.**

---

## 🎯 로딩 원칙: Progressive Disclosure

전체 repo 읽지 말 것. Tier 순서로 **필요한 만큼만** 로드.

### Tier 0 (매 세션 고정, ~200 tokens)
- `README.md`
- 이 파일 (`CLAUDE.md`)

### Tier 1 (작업 맥락 필요 시, ~2k tokens)
- `knowledge/visual-system.md` — 전사 비주얼 에셋
- `knowledge/principles.md` — 원칙
- `CONVENTIONS.md` — 네이밍/마커 규칙

### Tier 2 (작업 라우팅, ~500 tokens)
- `_meta/decision-tree.md`

### Tier 3 (대상 식별, ~500 tokens)
- `ods-docs/content/components/` (ODS 컴포넌트 필요 시 — 디렉토리 = 카탈로그)
- `domains/README.md` (도메인 작업 시)

### Tier 4 (대상 폴더, 가변)
- `domains/<도메인>/README.md`
- `ods-docs/content/components/<kebab>/meta.yaml` (+ `spec.md`)
- `ods-docs/content/foundations/<name>/meta.yaml` (+ `tokens.yaml`)
- `ods-docs/content/patterns/<pattern>/` (ODS 표준 패턴)

### Tier 5 (deep dive, 명시 요청 시만)
- `ods-docs/content/components/<kebab>/guide.md` (사용 가이드, anti-patterns 포함)
- `domains/<도메인>/screens/<screen>/`
- `domains/<도메인>/experiments/`, `prds/`

---

## 🧭 작업 유형별 라우팅

| 작업 | 로드 | 예상 토큰 |
|---|---|---|
| 새 화면 디자인 | Tier 0~3 + `domains/<D>/README` + `ods-docs/content/components/` | ~6k |
| 기존 화면 수정 | Tier 0~2 + `domains/<D>/screens/<S>/` | ~5k |
| ODS 컴포넌트 사용법 | Tier 0 + `ods-docs/content/components/<kebab>/spec.md` + `meta.yaml` | ~2k |
| 디자인 원칙 확인 | Tier 0 + `knowledge/principles.md` | ~1.5k |
| 전체 ODS 훑기 | Tier 0 + `ods-docs/content/components/` 목록 + 상위 10 `meta.yaml` | ~8k |

---

## 🏷️ 주석 마커 4종 (결과물에 삽입)

LLM이 생성하는 HTML/TSX에 다음 마커를 주석으로 붙일 것. 다음 iteration에서 재조회 생략 가능.

- `@code-connect:<figma-node-id>` — Figma Code Connect 매핑
- `@ods-component:<name>` — ODS 컴포넌트 사용
- `@bds-component:<name>` — BDS (레거시) 컴포넌트
- `@use-tailwind` — 임시 Tailwind 처리 (ODS 외)

예시:
```tsx
{/* @ods-component:Button variant=primary size=md */}
<Button variant="primary" size="md">확인</Button>
```

---

## 🚫 하지 말 것

- 전체 `domains/` 훑기 (작업 대상 도메인만 로드)
- 모든 `ods-docs/content/components/*` 로드 (반드시 디렉토리 목록 또는 `meta.yaml`만 먼저)
- `_archive/` 로드 (레거시, 작업 무관)
- `_meta/decisions/`, `_meta/plans/`, `_meta/discussions/` 로드 (사람용 governance 기록 — LLM·MCP 노출 금지)
- frontmatter `audience: human-only` 또는 `tier: 99` 파일 로드
- `CONVENTIONS.md`의 마커 규칙 위반한 코드 출력

---

## 🔄 작업 결과 피드백 루프

클로드코드 작업 중 **ODS에 없는 컴포넌트/색/토큰** 발견 시:

1. 결과물에 `@missing-ods:<설명>` 마커 삽입
2. `_archive/feedback-loop/<yyyy-mm-dd>.md`에 추가 (있으면)
3. Slack `#ds-feedback-loop` 채널로 연결 (MVP 단계)

---

## 📌 Frontmatter 규칙

모든 MD 파일 상단에 메타데이터:

```yaml
---
tier: 3
when-to-read: "ODS 컴포넌트 이름을 알 때"
size: "~500 tokens"
deps: [ods-docs/content/components/]
owner: Tyler
---
```

LLM은 frontmatter만 읽고 **지금 필요 없으면 스킵** 판단 가능.

### MCP/LLM 노출 제어

- `tier: 99` — 산출물·콘텐츠가 아닌 governance 기록. **LLM·MCP 로드 금지.**
- `audience: human-only` — 사람이 보는 용도. MCP 서버 allowlist에서 제외.

두 시그널 중 하나라도 있으면 절대 컨텍스트에 넣지 말 것. 사용자가 명시적으로 경로를 지정해도 "이 문서는 audience: human-only 입니다, 정말 로드할까요?" 한 번 확인.
