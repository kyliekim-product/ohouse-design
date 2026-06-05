# ohouse-design-plugin

오늘의집 Product Design 도메인용 Claude Code 플러그인/스킬 모음 (골격).

현재는 빈 골격이며, 아래 디렉토리에 내용을 채워 넣는다.

- `.claude-plugin/plugin.json` — 플러그인 매니페스트 (이름·버전·설명)
- `commands/` — 슬래시 커맨드 (`/명령어`)
- `skill/` — SKILL.md 기반 스킬
- `agents/` — 서브에이전트 정의

## 구조

```
ohouse-design-plugin/
├── .claude-plugin/
│   └── plugin.json
├── commands/        # *.md 커맨드
├── skill/           # <skill-name>/SKILL.md
└── agents/          # *.md 에이전트
```

## 설치 (참고)

플러그인 내용을 채운 뒤, Claude Code 마켓플레이스/로컬 경로로 등록해 사용한다.
