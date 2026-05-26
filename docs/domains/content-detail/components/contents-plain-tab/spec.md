---
type: domain-component-spec
parent: domains/content-detail/README.md
component: contents-plain-tab
topic: component-variant
tier: 4
when-to-read: "콘텐츠 트랙 화면 상단 추천/커뮤니티/쇼츠 등 Plain 스타일 탭 사용 시"
size: "~1k tokens"
status: draft
owner: Deeer
last_verified: 2026-04-27
sources:
  - "Figma: Workflow_Test 1:12606 내부 '🟣 Contents Plain Tab' (Rhq24yUSskcByKWlASloRe)"
non_ods: true
---

# Component · Contents Plain Tab (도메인 컴포넌트)

콘텐츠 탭 상단 **"추천 / 커뮤니티 / 쇼츠"** 같은 큰 카테고리 전환에 사용하는 Plain 스타일 탭.

> ⚠️ **이 컴포넌트는 ODS atom 이 아님** (Figma 마커 🟣 = 트랙 PD 컴포넌트). ODS `<Tab>` 은 active item 아래 underline 자동 추가하는데, Contents Plain Tab 은 **underline 없이 weight + color 만으로 active 표시**. 별도 트랙 컴포넌트로 관리.

> **Figma 마커 컨벤션** (4/27 확인)
> - 🌀 = ODS atom (`<Tab>`, `<Chip>` 등)
> - 🟣 = **트랙 컴포넌트** (이 문서 같은 것)
> - 🪩 = OS 시스템 컴포넌트 (Status Bar 등)
> - 🏗️ = 일반 컴포넌트 슬롯

---

## 1. 시각 스펙

| 요소 | 스펙 |
|---|---|
| 컨테이너 | 가로 flex, gap 6px, padding `10px 16px 0` |
| 탭 항목 | 높이 44px, 좌우 padding 4px, gap 6px |
| 폰트 | Pretendard 20px / lineHeight 28px / letterSpacing -0.3px |
| **Active**: weight | **600 (SemiBold)** |
| **Active**: color | `foreground` (#141414) |
| **Inactive**: weight | 500 (Medium) |
| **Inactive**: color | `foregroundWeak` (#8C8C8C) |
| 언더라인 | **없음** |
| 활성 표시 | weight + color 변화만 |

---

## 2. ODS `<Tab>` 과의 차이

| 항목 | ODS `<Tab>` | Contents Plain Tab (본 문서) |
|---|---|---|
| Active 표시 | underline 자동 | weight + color |
| 폰트 사이즈 | (variant 별) | 20px 고정 |
| 사용처 | 일반 (탭형 UI) | **콘텐츠 트랙 상단 카테고리** 한정 |
| 컴파일 | `<Tab.Root>` compound | 트랙 자체 구현 (단순 div + 텍스트) |

→ ODS Tab 을 Plain 처럼 보이게 하려면 `style={{ borderBottom: 'none' }}` 같은 override 필요. 그것보다 **별도 트랙 컴포넌트로 명시**하는 게 명확.

---

## 3. 행위 명세

| 액션 | 결과 |
|---|---|
| 탭 항목 탭 | active 변경 + 본 화면 콘텐츠 영역 갱신 |
| "쇼츠" 탭 | 별도 피드 없이 **쇼츠 플레이어로 이동** (../../../house-tour/screens/content-tab/README.md §"상단 피드 3종") |
| "커뮤니티" 탭 | **별도 화면**으로 이동 (탭 스와이프 X) |

---

## 4. LLM 작업 시 주의사항

- ⚠️ ODS `<Tab>` 사용 금지 — underline 강제로 그려짐
- ⚠️ "추천 / 커뮤니티 / 쇼츠" 외 탭 추가 금지 (정책 합의 사항)
- ⚠️ 폰트 사이즈 20 고정 — 16/18 같은 값 사용 시 다른 카드들과 톤 안 맞음

---

## 5. 미확정

- [ ] 모바일웹 vs iOS / Android 동작 차이 (커뮤니티 탭 라우팅 방식)
- [ ] 탭 active 전환 시 애니메이션 여부

---

## 변경 이력

| 날짜 | 변경 |
|---|---|
| 2026-04-27 | 초안 — Figma Workflow_Test 1:12606 실측 + 1차 결과물 (sandbox) 의 ODS Tab 사용 미스매치 발견 시 신설. 트랙 컴포넌트 vs ODS atom 구분 명시 |
