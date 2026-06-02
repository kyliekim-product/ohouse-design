---
tier: 1
when-to-read: "코드 생성 / 파일 추가 / PR 전"
size: "~700 tokens"
owner: 요한
---

# CONVENTIONS.md — 네이밍·마커·코드 규칙

LLM과 PD가 공통으로 따르는 **형식 규칙**. 의미는 `knowledge/visual-system.md` + `knowledge/principles.md`.

---

## 📁 파일·폴더 네이밍

- 폴더: `kebab-case` (`product-detail/`, `category-home/`)
- ODS 컴포넌트 폴더: `kebab-case` (`box-button/`, `alert-dialog/`) — ods-docs 컨벤션
- MD 파일: `kebab-case.md` (`usage-rules.md`)
- 루트 문서: `UPPERCASE.md` (`README.md`, `CLAUDE.md`, `OWNERS.md` 등)
- 화면 도메인: `domains/<화면>/` (`home`, `product-detail`, `cart`, ...)
- 화면 variant: `domains/<화면>/screens/<variant>/` (`default`, `empty`, `loading`, `mobile`, ...)

---

## 🏷️ 주석 마커 (결과물 코드에 필수)

```tsx
{/* @ods-component:Button variant=primary size=md */}
<Button variant="primary" size="md">확인</Button>

{/* @domain-component:home/CategoryFeedCard */}
<CategoryFeedCard ... />

{/* @code-connect:1234:5678 */}
{/* @bds-component:LegacyCard reason=ODS 미대응 */}
{/* @use-tailwind reason=일회성 실험 */}
{/* @missing-ods:<설명> */}
```

**용도**: 다음 iteration에서 LLM이 재조회 생략 + Code Connect 매핑 + 마이그레이션 추적.
- `@ods-component` — ODS 컴포넌트 사용 (1순위)
- `@domain-component:<화면>/<Name>` — 화면 전용 컴포넌트 사용 (ODS에 없을 때)
- `@bds-component` — 레거시 BDS (마이그레이션 대상)
- `@use-tailwind` — 임시 Tailwind 처리
- `@missing-ods` — ODS에 추가되어야 할 컴포넌트 발견

---

## 📝 MD Frontmatter 표준

모든 MD 파일 상단:

```yaml
---
tier: 3
when-to-read: "한 줄로 — 언제 이 파일 읽어야 하는가"
size: "~500 tokens"
deps: [다른/파일.md]
owner: Tyler
---
```

- `tier`: 0~5 (CLAUDE.md 참조). `tier: 99` 는 governance 기록 — LLM·MCP 로드 금지
- `when-to-read`: LLM이 스킵 판단하는 핵심 신호
- `size`: 대략 토큰 수
- `deps`: 선행 로드 필요한 파일
- `owner`: 담당자
- `audience: human-only` (선택): MCP 서버 allowlist에서 제외 시그널. `_meta/decisions/`, `_meta/plans/`, `_meta/discussions/` 의 모든 파일에 필수.

---

## 🧩 컴포넌트 명세 규격 (ods-docs)

`ods-docs/content/components/<kebab>/` 아래 표준 파일:

### `meta.yaml`
```yaml
id: ods.component.button
title: Button
category: components
status: published   # draft | published
aliases:
  - 버튼
description: 사용자가 액션을 트리거할 때 사용하는 컨트롤입니다.
```

### `spec.md`
공식 명세. 다음 섹션 권장 — `0. Overview`, `1. Structure` (mermaid), `2. States`, `3. Props` (Variant/State/Field/Layout/Slot), `4. Behaviors`, `5. Constants` (토큰 매핑 표).

### `guide.md`
사용 가이드. Usage Guidelines / Decision Tree / 비교 컴포넌트 (Radio vs Checkbox 등) / Layout & Sizing / Anti-patterns(❌ 사례) 포함. anti-patterns는 별도 파일이 아닌 guide.md 내 섹션.

### `images/`
Figma export 비주얼. guide.md에서 `[![Title](./images/x.png)](figma-url)` 형태로 참조.

### `manifest.json` (선택)
컴포넌트가 sub-component를 가질 때 매니페스트 (예: product-card, section).

---

## 🎯 화면 산출물 규격

`domains/<화면>/screens/<variant-name>/` 아래:

- **`prototype.html` 또는 `prototype.tsx`** — 프로토타입 (택1, 혼용 금지)
- `README.md` — variant 개요 + Figma URL + 썸네일 경로 + 사용 컴포넌트(`@ods-component`/`@domain-component` 목록) + 진입/이탈 경로
- `thumbnail.png` (선택) — 미리보기 이미지

### README.md 템플릿
```markdown
---
tier: 5
when-to-read: "<화면>/<variant> 작업 시"
size: "~400 tokens"
domain: home
variant: default
figma: https://www.figma.com/file/.../?node-id=...
thumbnail: ./thumbnail.png
status: draft | review | published
owner: <PD name>
---

# <화면 이름> — <variant>

(한 문장 요약)

## 사용 컴포넌트
- @ods-component:Button
- @ods-component:Card
- @domain-component:home/CategoryFeedCard

## 진입/이탈
- 진입: ...
- 이탈: ...

## 상태 전이 / 노트
...
```

---

## 🧬 화면 컴포넌트 규격

`domains/<화면>/components/<kebab>/` — `ods-docs/content/components/`와 동일 구조 (`meta.yaml` + `spec.md` + `guide.md`). `meta.yaml`의 `id`는 `domain.<화면>.<name>` (예: `domain.home.category-feed-card`), `type: component | pattern`.

## 📜 화면 정책 규격

`domains/<화면>/policies/<name>.md`:

```yaml
---
tier: 4
when-to-read: "<화면>에서 ... 관련 결정 시"
size: "~300 tokens"
domain: shopping
overrides: [knowledge/principles.md#1]   # 전사 원칙을 override하면 명시
owner: <PD name>
---
```

## 🧪 실험 규격

`domains/<화면>/experiments/<name>.md`:

```yaml
---
tier: 5
when-to-read: "유사 결정 근거 찾을 때"
size: "~500 tokens"
domain: cart
period: 2026-02-01 ~ 2026-02-28
key_date: 2026-02-28                # 카드 "X일 전" 렌더용 (단일 날짜)
key_date_type: launched             # started | launched | ended
variants: [A (기존), B (변경)]
winner: B                            # A | B | C | null (없거나 미정)
result: win | loss | inconclusive
summary: "한 줄로 무엇을 바꿨는지"   # 카드 요약 슬롯
result_summary: "핵심 지표 한 줄"     # 카드 결과 슬롯
insight: "주요 발견 1줄"             # 카드 인사이트 슬롯
sources:                             # 자세히보기 링크
  slack: <url> | null
  notion: <url> | null
  prd: <url> | null
  figma: <url> | null
  xpc: <url> | null
team: Commerce                       # 카드 푸터용 (도메인 상위 팀)
owner: Jenna
---
```

**필드 그룹**:
- **표준 (필수)**: `tier` · `when-to-read` · `size` · `domain` · `period` · `variants` · `result` · `insight` · `owner`
- **카드 자동 렌더 확장 (권장)**: `key_date` · `key_date_type` · `winner` · `summary` · `result_summary` · `sources` · `team`

확장 필드는 디자인 Atlas 카드 자동 렌더(요약·결과·인사이트 3섹션 + 뱃지·날짜·자세히보기 링크)를 위해 추가됨. 없어도 본문 휴리스틱 파싱으로 fallback 가능하지만, 명시하면 안정성↑.

---

## 🔀 Git 커밋 규칙

```
<type>(<scope>): <summary>

<body>
```

**type**: `add` / `update` / `fix` / `docs` / `chore`
**scope**: `ods-docs:button` / `domain:home` / `meta` / `knowledge`

예:
```
add(ods-docs:button): spec/guide 초안
update(domain:product-detail): 결제 진입 동선 보강
```

---

## 🔍 PR 체크리스트

- [ ] Frontmatter 채워짐
- [ ] 마커 4종 규칙 위반 없음
- [ ] `INDEX.md` 업데이트 (새 문서 추가 시)
- [ ] 리뷰어: 요한 + 해당 레이어 오너

---

## ❌ 금지 사항

- 하드코드 hex 색 (`#fff`, `#000`)
- 매직 픽셀 (`padding: 13px` — 토큰 없으면 가장 가까운 스케일로)
- `_archive/` 내 파일 참조 (legacy)
- 마커 없는 컴포넌트 사용
