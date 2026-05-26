---
tier: 99
when-to-read: "사람이 과거 아키텍처 결정의 근거를 확인할 때"
size: "~500 tokens"
audience: human-only
owner: 요한
---

# Decisions — Architecture Decision Records (ADR)

이 폴더는 **이미 내려진 결정의 근거**를 보존합니다. 화면/컴포넌트 같은 산출물이 아니므로 **LLM·MCP는 로드하지 않습니다.**

---

## 🎯 폴더의 목적

- 왜 A 대신 B를 선택했는지 기록 (git diff로는 의도가 안 보임)
- 나중에 동일 결정을 반복하지 않게 하기 위한 institutional memory
- 새로 들어온 사람이 "왜 이 구조?" 라는 질문에 자가 답변하게 하기 위함

## 📐 파일 규칙

- 파일명: `NNNN-kebab-case-title.md` (4자리 zero-padded sequence)
- **Immutable**: 한 번 `status: accepted` 된 ADR은 수정하지 않음. 결정이 바뀌면 새 ADR로 supersede.
- Frontmatter 필수 필드:
  ```yaml
  ---
  tier: 99                    # LLM 로드 대상 아님
  audience: human-only        # MCP allowlist에서 제외
  adr: 0001
  status: proposed | accepted | superseded | deprecated
  date: 2026-05-13
  supersedes: 0000            # 있을 때만
  superseded-by: 0002         # 있을 때만
  owner: 요한
  ---
  ```

## 📑 본문 템플릿

```markdown
# ADR-NNNN: <한 줄 결정>

## Context
무엇이 문제였나. 어떤 제약/이해관계가 있었나.

## Decision
무엇을 결정했나. 한 문단으로 명확하게.

## Alternatives Considered
- A안: ... — 선택 안 한 이유
- B안: ... — 선택 안 한 이유

## Consequences
- 좋은 점
- 나쁜 점 / 받아들이는 트레이드오프
- 후속 작업 (있다면 plans/ 로 링크)
```

## 🚫 ADR이 아닌 것

- 진행 중인 계획 → `_meta/plans/`
- 원본 대화/탐색 로그 → `_meta/discussions/`
- 컨벤션·규칙 → `CONVENTIONS.md`, `CLAUDE.md`
- 산출물 → `domains/`, `ods-docs/`
