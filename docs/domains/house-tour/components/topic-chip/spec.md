---
type: domain-component-spec
parent: domains/house-tour/README.md
component: topic-chip
topic: component-variant
tier: 4
when-to-read: "콘텐츠 트랙 필터 영역 '내 조건 맞추기' 같은 Topic 진입점 chip 사용 시"
size: "~1k tokens"
status: draft
owner: Deeer
last_verified: 2026-04-27
sources:
  - "Figma: Workflow_Test 1:12606 내부 '🟣 Contents Filter > Topic > 🌀 Chip' (Rhq24yUSskcByKWlASloRe)"
non_ods: true
---

# Component · Topic Chip (도메인 컴포넌트)

콘텐츠 트랙 필터 영역 **좌측 항상 노출**되는 진입점 chip. 일반 필터 chip 과 시각적으로 구분되는 prominent 스타일.

> ⚠️ **이 컴포넌트는 ODS atom 이 아님**. ODS `<Chip variant="normal">` 와 다른 외곽선·텍스트 색·아이콘 컬러 조합. 필터 영역 자체도 트랙 컴포넌트(`Contents Filter`).

---

## 1. 시각 스펙

| 요소 | 스펙 |
|---|---|
| 컨테이너 | 흰 배경 + **보라 외곽선** 1px solid (`accent-purple` = `purple.550` = `#6F3DDE`) |
| 형태 | rounded 50px (pill) |
| 높이 | 32px |
| padding | 4px 12px |
| 좌측 아이콘 | 12×12 보라 컬러 dot/icon |
| 텍스트 | Pretendard Regular 14px / lineHeight 18px |
| 텍스트 color | **`accent-purple`** (#6F3DDE) |
| gap (아이콘↔텍스트) | 4px |

---

## 2. 사용처 / 배치

- **Contents Filter 영역의 좌측 첫 번째**에 항상 노출
- 우측에 **divider** + 일반 필터 chip 들이 가로 스크롤
- 좌측 dim 56px (foregroundInverse 80% opacity, `Contents Filter` 의 `dim` 레이어) — Topic Chip 항상 노출 보장 (가로 스크롤로 가려지지 않게)

---

## 3. 행위 명세

| 액션 | 결과 |
|---|---|
| chip 탭 | "내 조건 맞추기" 바텀시트/페이지 이동 (조건 입력 진입점) |
| 조건 설정 후 돌아옴 | 우측 일반 필터 chip 들 갱신 |

---

## 4. ODS `<Chip>` 과의 차이

| 항목 | ODS `<Chip variant="normal">` | Topic Chip (본 문서) |
|---|---|---|
| 외곽선 | gray | **purple (accent-purple)** |
| 텍스트 색 | `foreground` | **`accent-purple`** |
| 좌측 아이콘 | 흑백 모노 | **컬러 (보라)** |
| 토글 상태 | active/inactive 모두 사용 | **항상 prominent** (단일 상태) |

→ ODS Chip 을 변형해 사용 가능하지만, **트랙 컴포넌트로 명시**하면 컨벤션 흩어지지 않음. 일반 필터 chip 은 ODS `<Chip>` 그대로 사용 OK.

---

## 5. LLM 작업 시 주의사항

- ⚠️ Topic Chip 은 **단일 항목** — Contents Filter 안에 1개만 (왼쪽 고정)
- ⚠️ 일반 필터 chip 들과 시각적으로 구분 — 보라 외곽선·텍스트·아이콘 모두 다름
- ⚠️ **dim 레이어** 함께 사용 — 가로 스크롤 시 첫 chip 가려지지 않도록 좌측 56px 흰 dim

---

## 6. 미확정

- [ ] 좌측 컬러 아이콘 → 어떤 의미·이름인지 확정 (현재 12×12 컬러 dot 추정)
- [ ] 조건 미설정 vs 설정됨 시각 차이 여부 (조건 설정 후 chip 모양 바뀌는지)
- [ ] 다크 모드 시 보라 색상 처리

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 초안 — Figma Workflow_Test 1:12606 실측 + sandbox 1차 결과물 미스매치 발견 시 신설 |
