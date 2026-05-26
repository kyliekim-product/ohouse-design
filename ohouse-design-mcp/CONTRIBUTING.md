---
tier: 1
when-to-read: "이 repo에 처음 기여할 때 / PR 만드는 방법이 헷갈릴 때"
size: "~1.2k tokens"
owner: 요한
audience: human-only
---

# CONTRIBUTING — PD가 이 repo에 안전하게 기여하는 법

> **대상:** 오늘의집 프로덕트 디자이너. **개발자 아님.** Git/터미널 몰라도 됨.
>
> **핵심:** 직접 push 하지 말고 **PR(Pull Request)** 로만 변경. 머지는 다른 PD 1명이 approve 해주면 됨. 구조·문법 오류는 자동 CI가 잡고, Claude AI가 PR마다 자동 리뷰함.

---

## 🚀 처음이라면

### 0. 준비물 (1회)
1. [GitHub 가입](https://github.com/) (회사 메일 권장) → 본인 GitHub 사용자명을 `#des-product-design` Slack에 공유 → 요한이 CODEOWNERS·권한 등록
2. **Claude Code 설치** (선택, 강력 권장) — [claude.com/code](https://claude.com/code)
3. `gh` CLI 설치 (Claude Code 쓸 거면 필수): Mac이면 `brew install gh` → `gh auth login`

설치 안 하고도 **GitHub 웹 에디터만으로 작은 수정은 충분히 가능**합니다.

---

## 🌱 3가지 기여 방법 (난이도 순)

### 방법 A — 웹 에디터 (가장 쉬움, 1줄 수정용)

1. github.com 에서 수정하려는 파일 열기
2. 우상단 ✏️ 연필 아이콘 → 수정
3. 페이지 아래 **"Commit changes" → "Create a new branch"** 선택 → "Propose changes" → "Create pull request"
4. PR 제목·설명 작성 → "Create pull request"
5. 다른 PD 1명 approve + CI 통과되면 본인이 "Merge" 클릭

**언제 쓰나:** 오타 수정, frontmatter 1줄 변경, README 짧은 보강.
**한계:** 여러 파일 동시 수정 / 새 폴더 만들기는 불편.

### 방법 B — Claude Code (가장 추천)

본인 컴퓨터에 repo 클론해 두고, Claude Code 안에서 자연어로 작업.

```bash
# 처음 1회만
gh repo clone bucketplace/product-design
cd product-design

# Claude Code 실행 후 자연어로 요청
# 예: "홈 화면 README 의 owner 를 본인으로 바꾸고 PR 만들어줘"
# 예: "/contribute" 스킬 사용 — branch 생성 → 편집 → push → PR까지 자동
```

`.claude/skills/contribute/SKILL.md` 가 이 흐름을 자동화합니다. 자세한 사용은 [그 스킬 문서](.claude/skills/contribute/SKILL.md) 참고.

**언제 쓰나:** 화면 1~2개 새로 만들기, 컴포넌트 spec 작성, 정책 추가 등 대부분의 작업.

### 방법 C — 터미널 직접 (개발자 협업 / 충돌 해결 시)

git 익숙하면 그냥 평소대로:

```bash
git checkout -b yohan/edit-home-readme
# 수정
git add -A && git commit -m "edit: home README owner update"
git push -u origin yohan/edit-home-readme
gh pr create
```

---

## 🛡️ 4가지 규칙 (꼭 지키기)

### 규칙 1 — `main` 에 직접 push 금지

Branch protection으로 막혀 있음. 모든 변경은 PR 거치기.

### 규칙 2 — PR은 작게

- **1 PR = 1 화면 or 1 컴포넌트 or 1 정책**
- 100줄 미만 변경 권장. 큰 작업은 잘게 쪼개기.
- 이유: 리뷰어가 코드 못 읽어도 변경 의도 한눈에 파악 가능해야 함.

### 규칙 3 — 자기 오너 영역 안에서만 수정

[`OWNERS.md`](OWNERS.md) 또는 [`.github/CODEOWNERS`](.github/CODEOWNERS) 에 본인 영역 확인.
다른 오너 영역 건드리면 그 오너 approve 필수.

### 규칙 4 — Frontmatter / 마커 규칙 지키기

- 새 `.md` 파일 만들면 상단 frontmatter (`tier`, `when-to-read`, `owner` 등) 필수 — `CLAUDE.md` 참조
- LLM이 생성한 HTML/TSX에 마커 (`@ods-component:` 등) 붙이기 — `CONVENTIONS.md` 참조
- 못 지키면 CI가 PR을 빨갛게 만들고 머지 막음 (걱정 안 해도 됨, 봇이 다 알려줌)

---

## 🤖 자동으로 일어나는 일들 (안심하세요)

PR 만들면 알아서 돌아갑니다:

| 시점 | 무엇이 자동으로 | 실패 시 |
|---|---|---|
| PR 열림 | CODEOWNERS 기반 리뷰어 자동 배정 | — |
| PR 열림 | CI: frontmatter / 마커 / 깨진 링크 검사 | PR 머지 버튼 비활성 |
| PR 열림 | Claude AI 자동 리뷰 코멘트 (CLAUDE.md 규칙 위반·일관성 체크) | 코멘트만, 차단 X |
| approve + CI 통과 | 본인이 "Merge" 클릭 가능 | — |
| 머지 후 | main 브랜치 자동 보호. revert 필요 시 GitHub UI에서 "Revert" 버튼 | — |

> 결론: **PD가 git 명령어 몰라도, 코드리뷰 못 해도 안전합니다.** CI + Claude AI가 1차 방어선, 동료 PD 1명 approve가 2차.

---

## 🆘 막혔을 때

| 상황 | 액션 |
|---|---|
| PR이 빨갛게 됨 (CI 실패) | PR 화면 "Details" 클릭 → 봇이 알려준 메시지 그대로 수정 |
| Merge 충돌 | Slack `#des-product-design` 채널에 PR 링크 공유 + 요한 mention |
| 누구한테 리뷰 받아야 할지 모름 | CODEOWNERS 자동 배정 따라가면 됨. 안 보이면 요한 ping |
| 머지하고 보니 잘못 머지함 | PR 화면 "Revert" 버튼 → 새 PR 자동 생성 → 그것도 머지 |

---

## 📚 더 읽을 거리

- [`CLAUDE.md`](CLAUDE.md) — LLM 로딩 룰 + frontmatter 규칙
- [`CONVENTIONS.md`](CONVENTIONS.md) — 네이밍·마커·코드 규칙
- [`OWNERS.md`](OWNERS.md) — 화면별 담당자
- [`INDEX.md`](INDEX.md) — 전체 문서 인덱스
- [`.claude/skills/contribute/SKILL.md`](.claude/skills/contribute/SKILL.md) — Claude Code로 PR 자동 생성하는 스킬
