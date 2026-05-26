---
tier: 99
audience: human-only
adr: 0001
status: proposed
date: 2026-05-13
owner: 요한
---

# ADR-0001: 디자인 민주화를 위한 3-Layer MCP 아키텍처

## Context

오늘의집 디자인팀은 "모두가 디자인할 수 있도록"이라는 비전 하에 디자인 민주화 인프라(MCP + 웹사이트)를 만들고 있다. 이 인프라에 들어가는 콘텐츠는 다음 세 영역:

- `domain/` — 화면 정보 (PD가 프로토타입 프롬프트로 복사)
- `ods-docs/` — ODS 컴포넌트·토큰 문서 (#des_design_system_qna 문의봇 데이터)
- `knowledge/` — 디자인 원칙·리뷰 가이드 (#des_pd_design_critique 크리틱봇 데이터)

세 영역이 각자 다른 봇/소비자에게 노출되지만, **버전관리 분리는 동기화 지옥**이 된다. 동시에:

1. PD가 GitHub 원본을 직접 받아 자유롭게 fork하면 일관성이 깨진다 — 통제가 필요
2. 그러나 변형 prototype 자체는 막고 싶지 않다 — PD의 변형 작업은 권장
3. 변형의 결과가 디자인 시스템에 일관되려면 **원칙·컴포넌트가 변형 컨텍스트에 함께** 흘러야 한다

세 폴더는 **병렬 리소스가 아니라 의존 레이어**라는 통찰이 핵심.

## Decision

**단일 GitHub repo + 단일 MCP 서버**로 세 영역을 통합 관리하되, 세 폴더를 의존 레이어로 모델링한다.

### 레이어 구조

```
knowledge/          ← WHY (원칙) — 어떤 결정이 좋은 결정인가
    ↓
ods-docs/           ← WHAT (재료) — 허용된 컴포넌트/토큰
    ↓
domains/            ← HOW (현재 구현) — 화면이 지금 이렇게 생겼다
```

### MCP 서버 surface

MCP는 raw 폴더를 노출하지 않고 다음 curated tools만 제공:

```
- list_screens(domain?)
- get_screen_for_prototype(id)      # bundle 반환: screen + principles + components
- get_component(name)
- search_ods_docs(query)            # 문의봇
- search_design_knowledge(query)    # 크리틱봇
- critique(variant)                 # design-knowledge 기준 자동 리뷰
```

`get_screen_for_prototype`은 단순 markdown이 아니라 **screen + 적용 원칙 + 사용 컴포넌트 spec을 묶은 bundle**을 반환한다. PD가 Claude Code에서 변형할 때 항상 원칙과 컴포넌트가 컨텍스트에 함께 들어가도록 강제하는 게 핵심.

### Cross-reference 메커니즘

화면 markdown frontmatter에 명시적 의존을 선언:

```yaml
---
domain: home
applies_principles: [visual-hierarchy, information-density]
uses_components: [card, scroll-list, top-nav]
---
```

MCP가 frontmatter를 파싱해 bundle을 구성한다.

### 통제 메커니즘

| 통제 지점 | 구현 |
|---|---|
| 소스 수정 통제 | GitHub CODEOWNERS — 디자인시스템팀만 PR merge |
| 소비 형태 통제 | 모든 소비자가 MCP를 거침 (raw 파일 접근 금지) |
| 로컬 변형 차단 | MCP는 매번 latest canonical 반환, 버전 핀 가능 |
| 사후 검증 | `critique()` 도구로 변형 결과를 design-knowledge에 대조 |

## Alternatives Considered

### A. Repo 3개 분리 (도메인별)
- ❌ 세 repo 간 cross-reference 깨짐
- ❌ 한 화면 추가 시 여러 PR 필요
- ❌ 버전 동기화 지옥 (싱종님이 우려한 지점)

### B. 단일 repo + raw GitHub 노출 (n8n + GitHub MCP)
- ✅ 인프라 가벼움 (싱종님 초기 제안)
- ❌ PD가 raw markdown을 fork할 수 있어 일관성 통제 어려움
- ❌ Cross-layer composition을 봇이 직접 해야 함

### C. 단일 repo + curated MCP (선택)
- ✅ 통제·일관성·composition을 MCP 레이어가 흡수
- ✅ 세 봇이 같은 MCP의 다른 도구를 호출 → 자동 동기화
- ❌ MCP 서버 운영 비용 (사내 배포 필요)
- ❌ MCP가 첫 진입 장벽

C가 "일관성 통제" 요구사항을 만족하는 유일한 안. MCP 비용은 정당화 가능.

## Consequences

### 좋은 점
- 디자인 시스템 변경 시 PR 하나로 모든 소비자에 반영
- PD 자유도(변형 가능) + 일관성(컨텍스트 강제 주입) 동시 달성
- 크리틱봇이 채널 외 self-check 단계에서도 호출 가능

### 받아들이는 트레이드오프
- **큐레이션 비용**: 화면 frontmatter의 `applies_principles`/`uses_components` 매핑을 누군가 수동 관리. 초기엔 시스템팀이 채우고, 후속으로 LLM 자동 제안 + 승인 워크플로우 가능
- **원칙 granularity**: design-knowledge가 "좋은 디자인을 하자" 같은 추상 수준이면 무용. 검증 가능한 조항화 필요 (예: "리스트 아이템 간 여백 8/12/16dp")
- **MCP 인프라 운영**: 누가 배포·유지보수할지 합의 필요 (싱종님과 다음주 미팅 안건)

### 후속 작업
→ `_meta/plans/2026-05-mcp-design-democratization.md`

## 다음주 미팅 (싱종님 + 요한) 안건 후보

1. design-knowledge를 **검증 가능한 조항 형태**로 쓸 수 있나
2. screen frontmatter의 cross-reference를 **누가/어떻게** 채울 건가
3. MCP bundle tool vs 단순 폴더 노출 — **어느 수준의 인프라부터** 시작할 건가
4. MCP 서버 **운영 주체·배포 환경** (오아시스 사내 배포?)
