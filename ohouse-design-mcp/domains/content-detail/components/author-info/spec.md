---
type: domain-component-spec
parent: domains/content-detail/README.md
component: author-info
topic: component-variant
tier: 4
when-to-read: "작성자 정보 표시가 필요한 콘텐츠 트랙 화면 설계 시 (피드 카드, 콘텐츠 상세, 쇼츠, 크리에이터 프로필 등)"
size: "~3k tokens"
status: verified
owner: Deeer
last_verified: 2026-05-07
sources:
  - "Notion: ODS Card Spec (1f8a597878a081ab83f7cf7fe9d4b485)"
  - "Figma: Ohouse-Track-Component (B3YByGbqAZHP1c39gV3a1V)"
  - "Figma nodes: 2375:29907 Contents Landscape Card · 2784:11413 Contents Portrait Card · 3040:56487 Contents Square Card · 2744:20425 Square Card > Post · 2364:45446 Module Usage"
---

# Author Info (콘텐츠 트랙)

콘텐츠 트랙에서 **작성자 정보**를 노출할 때 사용하는 4종 variant와 그 규칙.

> **3계층 경계**
> - **ODS atoms** (`Avatar`, `Badge`, `BoxButton`) — Tyler 담당. [ODS Card Spec](https://www.notion.so/ohouse/ODS-Card-Spec-1f8a597878a081ab83f7cf7fe9d4b485) 참조
> - **공통 패턴** (image overlay scrim·WCAG 등) — `patterns/` (일부 미작성)
> - **트랙 고유 조합** — **이 문서** (atom들을 콘텐츠 트랙 맥락에 맞게 배치하는 규칙)

> **ODS Card 슬롯 구조 (전제)**
> 모든 Card는 `Container`(Media + Seam + Content) 3슬롯. 작성자 variant는 이 슬롯 구조 위에서 정의된다:
> - **Overlay** = Media 슬롯 **위** absolute positioning
> - **Info Below** = Content 슬롯 **안** 배치

---

## 1. Variant 목록

| Variant | 주 사용처 (카드 비율) | 닉네임 max | 팔로우 버튼 |
|---------|---------|-----------|---------|
| **Overlay** | Contents Landscape Card (3:2) / 쇼츠 플레이어 / 풀스크린 이미지 뷰어 | **160px 고정** | 없음 |
| **Info Below** | Contents Portrait Card (3:4) · 5 pattern / Contents Square Card Post pattern (1:1) | 패딩 제외 **가용 너비 전부** | 없음 (카드 전체 탭 영역) |
| **Sticky Header** | 콘텐츠 상세 페이지 상단 | 제한 없음 | **있음** (본인 콘텐츠 제외) |
| **Profile Centric** | 크리에이터 프로필 / 크리에이터 추천 모듈 | 제한 없음 | **있음** (본인 프로필 제외) |

> **관련 별도 컴포넌트**: Contents Portrait Card (3:4) 의 **Media slot overlay 케이스** 는 별도 도메인 컴포넌트 [`portrait-card-overlay`](../portrait-card-overlay/spec.md) 참조. Avatar / scrim gradient / padding spec 이 Landscape overlay 와 다름 (예: scrim 시작점 71% vs 0%). Portrait Card 는 Media overlay (별도 컴포넌트) + Content slot Info Below (본 문서 §3.2) 공존 가능.

> **작성자 정보 없는 카드 (참고)**: Contents Square Card의 `Product` / `Product Rank` / `Material` / `Material Rank` / `O2OReview` pattern은 상품·자재 중심이라 작성자 정보 없음. 본 문서 범위 아님.

---

## 2. 공통 규칙 (모든 variant 적용)

### 배치 순서
**아바타 → 닉네임 → 배지 → (팔로우 버튼)**

### 전문가 / 일반 유저 구분
- 전문가: **닉네임 옆 파란색 인증 배지** 노출
- 일반: 배지 없음

### 본인 콘텐츠 처리
- **팔로우 버튼 숨김** (본인이 본인을 팔로우할 수 없으니)
- 다른 요소는 일반과 동일

### 차단·탈퇴 작성자 처리
- 아바타: **placeholder** (회색 기본 이미지)
- 닉네임: **"볼 수 없는 사용자"**
- 배지: 미노출
- 팔로우 버튼: 미노출

---

## 3. Variant별 상세 규칙

### 3.1 Overlay — Media 슬롯 위 absolute

**슬롯 위치**: Media 슬롯 내 **좌측 하단** absolute positioning

**사용처** (카드 비율 기준):
- **Contents Landscape Card (3:2)** — 썸네일 좌측 하단 (닉네임 포맷 `@handle` 형태)
- 쇼츠 플레이어 (하단 작성자 정보)
- 풀스크린 이미지 뷰어 내

**Figma 슬롯 구조** (2375:29907 기준):

```
Media
└─ Thumbnail
   ├─ Contents Landscape Card/Common
   │   ├─ ODS Scrap Button     ← 우측 하단 (variant="media")
   │   └─ User Information     ← 좌측 하단
   │       ├─ Avatar
   │       └─ @user_id
   ├─ dim                       ← scrim 레이어
   └─ @product_thumbnail        ← 썸네일 이미지
```

**시각 스펙**:
- 배경 처리: **ODS overlay/scrim 토큰** — 트랙 컴포넌트 내부 hex 사용 허용 (`dim` 레이어). gradient 패턴: 카드 하단 → 상단 전체 적용 (Figma 실측 black 60% → 0%, bottom-up). WCAG AA 대비 보장 의도. 정확한 토큰명 매핑 TBD — Tyler 협의 자리
- 텍스트 색상: ODS color/static-white (white 고정 — overlay 위 가독성)
- 아바타: **ODS Avatar size=18** — 카드 안 시각적 weight 낮춤 의도 (Figma 메인 컴포넌트 2951:21051 실측, 2026-05-07 확인)
- 닉네임 포맷: `user_id` 형태
- 닉네임 typography: **ODS Detail12L16 Medium** (12px / 16 line-height / weight 500 / letter-spacing −0.3px) — Figma 메인 컴포넌트 2951:21051 실측, 2026-05-07
- 닉네임 max 너비: **고정폭** (Figma 실측 160px) — 짧게 잘려도 가독성·균일한 카드 grid 유지 의도. ODS spacing 토큰 매핑 TBD
- 팔로우 버튼: **없음** (공간 부족)
- Overlay padding: **10px** — User Info (좌측·하단) 와 ScrapButton (우측·하단) 모두 카드 가장자리에서 동일하게 떨어짐. Figma 실측 2026-05-07
- Avatar-닉네임 gap: **4px** — Figma 실측 2026-05-07

**Landscape Card 의 두 overlay 슬롯 (모두 좌·우 하단)**:
- **User Information** (좌측 하단) — 본 §3.1 담당. Avatar + user_id
- **ODS ScrapButton** (우측 하단) — `ScrapButton` (variant="media", `selected` prop 으로 스크랩 상태 제어, `disabled` prop 지원). ODS Provider 필수 (`requiresProvider: true`). 가능 variant: `normal | media`. ⚠️ ODS `Thumbnail.accessory` prop 은 단일 슬롯이라 두 overlay 를 동시 표현 불가 → **Thumbnail 외부에 absolute wrapper 로 둘 다 배치**. Figma variant 정의: [ODS Library](https://www.figma.com/design/aTdWM1sgdScr68GZdQ2sWO/?node-id=57856-1413)

**탭 영역**:
- 작성자 영역 탭 → 크리에이터 프로필 이동 (선택 사항, 피쳐별 다름)
- 카드 전체 탭 → 콘텐츠 상세 이동 (기본)

**ODS atoms 매핑**:
- ODS Avatar atom (size=18)
- ODS `ScrapButton` (variant="media", `selected` prop). 정의: [Figma ODS Library](https://www.figma.com/design/aTdWM1sgdScr68GZdQ2sWO/?node-id=57856-1413)
  - **Selected 상태 색**: ODS brand color 토큰 (`genuineBlue.350`) — variant `media`·`normal` 공통
  - **Disabled 상태 색**: ODS gray 토큰 (`gray.250`) — variant 공통
  - *출처: ODS Figma Library, 2026-05-07 확인*
- 전문가 식별 표시 — 구체 컴포넌트 및 해당 배지 유지 여부 미정 (§7)

### 3.2 Info Below — Content 슬롯 안 배치

**슬롯 위치**: Media 슬롯 **아래** Content 슬롯 내부

#### 3.2.1 Contents Portrait Card (3:4)

**사용처** (5 pattern 공통):
- `Photo` (사진)
- `Video` (비디오)
- `Project` (집들이)
- `Knowhow` (노하우)
- `Pro Project` (시공사례)

**시각 스펙**:
- 배경: 카드 배경색과 동일 (투명)
- 텍스트 색상: ODS foreground 토큰
- 아바타: **ODS Avatar size=24 추정** — Overlay variant 와 다름 (Overlay §3.1 은 size=18 확정). Portrait Card 사용처 별도 검증 필요
- 닉네임 max 너비: **패딩 제외 가용 너비 전부** 사용 후 말줄임 — Content slot 안이라 고정폭 불필요, 가용 공간 활용 의도
- 팔로우 버튼: **없음** (카드 전체가 탭 영역)

**Content 높이 variant** (타이틀 × 리액션 조합):
| 타이틀 | 리액션 | Content 높이 |
|--------|--------|--------------|
| O | O | 56px |
| O | X | 36px |
| X | O | 16px |

**Media 슬롯 우측 상단 — 포맷 뱃지 (문서 타입별)**:
| 문서 타입 | 뱃지 |
|---|---|
| Video | duration `[00:00]` |
| Project | "집들이" |
| Pro Project | "시공사례" |
| Knowhow | "노하우" |
| CC / Card | 미노출 |

**기타 정책**:
- Project · Knowhow: 타이틀 최대 **2줄** 말줄임
- CC: description 미노출
- Video: description 최대 2줄 말줄임
- 리액션 카운트: On/Off에 따라 해당 영역 미노출

#### 3.2.2 Contents Square Card — Post pattern (1:1)

**사용처**: 커뮤니티 포스트 (Q&A, 포스트)

**미디어 / 태그 variant (3 Case)**:
| Case | 미디어 | 태그 | 설명 |
|------|--------|------|------|
| Case 1 | O | — | 썸네일 + Content |
| Case 2 | X | X | 말풍선형 텍스트 박스가 Media 슬롯 대체 |
| Case 3 | X | O | 태그 그리드 (1 / 2 / 3 / >3) |

**시각 스펙**:
- 메타 정보 포맷: **`닉네임 · 댓글 수`** (구분자 ` · `)
- 아바타: **ODS Avatar size=24 추정** (Portrait Card 와 동일, Figma 재확인 필요)
- 닉네임 max 너비: Portrait와 동일 방식 추정 (가용 너비 전부 사용 후 말줄임, Figma 재확인 필요)

**탭 영역** (Portrait · Square Post 공통):
- **카드 전체가 탭 영역** → 상세 페이지 이동
- 작성자 영역 별도 탭 불가

**ODS atoms 매핑**:
- ODS Avatar atom (size=24)
- ODS Badge atom (variant=expert, sm)

### 3.3 Sticky Header — 콘텐츠 상세 상단

**사용처**:
- 집들이 상세 페이지 상단
- 노하우 상세 페이지 상단
- 사진 상세 페이지 상단

**시각 스펙**:
- 배경: 투명 → 스크롤 시 불투명 전환 (ODS background 토큰)
- 텍스트 색상: ODS foreground 토큰
- 아바타: **ODS Avatar atom + ODS enum 외 콘텐츠 트랙 고유 size** (Figma 실측 32px, ODS enum 18/24/30/40/80 외 — 재확인 필요) — 상세 페이지에서 작성자 weight 강조 의도
- 닉네임: **max 제한 없음** (줄바꿈 or 말줄임은 공간에 맞춰) — 상세 페이지라 충분한 공간 확보
- **한 줄 소개** 노출 (있을 때만) — ODS foreground-subtle 토큰
- 팔로우 버튼: **있음** (본인 콘텐츠 아닐 때)
- three dots: **있음** (신고·차단 메뉴)

**탭 영역**:
- 작성자 영역 → 크리에이터 프로필 이동
- 팔로우 버튼 → 팔로우 액션 (비로그인 시 로그인 모달)
- three dots → 신고·차단 메뉴 바텀시트

**ODS atoms 매핑**:
- ODS Avatar atom (콘텐츠 트랙 고유 size — ODS enum 외, Figma 실측 32px 재확인 필요)
- ODS Badge atom (variant=expert)
- ODS Button atom (variant=follow, 본인 콘텐츠 제외)

### 3.4 Profile Centric — 작성자가 주인공

**사용처**:
- 크리에이터 프로필 화면
- 크리에이터 추천 모듈 (홈 피드 내 "이 크리에이터도 주목"류)

**시각 스펙**:
- 배경: 카드/섹션 기본
- 아바타: **ODS Avatar atom + ODS enum 외 콘텐츠 트랙 고유 size** (Figma 실측 48 또는 64px, ODS enum 18/24/30/40/80 외 — 재확인 필요) — 작성자가 주인공이라 시각적 weight 최대 의도
- 닉네임: **제한 없음** (크게 노출)
- 한 줄 소개: 노출
- 대표 콘텐츠 썸네일: 함께 배치 (최대 3~4개)
- 팔로우 버튼: **있음** (본인 프로필 제외)

**탭 영역**:
- 카드/블록 전체 → 크리에이터 프로필 이동

**ODS atoms 매핑**:
- ODS Avatar atom (콘텐츠 트랙 고유 size — ODS enum 외, Figma 실측 48 또는 64px 재확인 필요)
- ODS Badge atom (variant=expert)
- ODS Button atom (variant=follow)

---

## 4. Variant 선택 기준 (의사결정 트리)

```
작성자 정보를 어디에 노출하는가?
├── Media 슬롯 위 absolute (Landscape Card·쇼츠·풀스크린 등)
│    → Overlay (닉네임 160px 고정)
├── Content 슬롯 안 (Portrait Card·Square Post)
│    → Info Below (닉네임 가용 너비 전부)
├── 상세 페이지 Sticky Header
│    → Sticky Header (팔로우 버튼 포함)
└── 작성자가 주인공 (프로필·추천)
     → Profile Centric (팔로우 버튼 포함, 아바타 크게)
```

**카드 타입 → variant 빠른 매핑**:
| 카드 타입 | 비율 | variant |
|---|---|---|
| Contents Landscape Card | 3:2 | Overlay |
| Contents Portrait Card (Photo/Video/Project/Knowhow/Pro Project) | 3:4 | Info Below |
| Contents Square Card — Post | 1:1 | Info Below |
| Contents Square Card — Product/Product Rank/Material/Material Rank/O2O | 1:1 | **해당 없음** (작성자 정보 없는 카드) |

---

## 5. 공통 비로그인 처리

어느 variant든 팔로우 버튼 탭 시:
- **로그인 모달 노출** (즉시 팔로우 X)

---

## 6. LLM 작업 시 주의사항

- ⚠️ **카드 비율로 variant가 결정됨** — 단일 스타일로 가정 금지. **3:2 → Overlay / 3:4·1:1(Post) → Info Below**
- ⚠️ **닉네임 max 너비 차이** — Overlay: 160px 고정 / Info Below: 가용 너비 전부 / Sticky Header·Profile: 제한 없음
- ⚠️ **팔로우 버튼 유무 규칙** — Overlay/Info Below: 없음 / Sticky Header·Profile: 있음 (본인 제외)
- ⚠️ **Overlay는 WCAG AA 대비 필수** — scrim(black gradient 60%→0%) 없이 텍스트 얹으면 안 됨
- ⚠️ **아바타 크기 variant별 다름** — Overlay 는 ODS Avatar size=18 (Figma 메인 컴포넌트 2951:21051 실측 확정) / Info Below (Portrait·Square Post) 는 size=24 추정 (별도 검증 필요) / Sticky Header·Profile Centric 은 ODS enum (18/24/30/40/80) 외 콘텐츠 트랙 고유 size (Figma 실측 재확인 필요). ODS Figma Library 에는 small/medium/large 같은 토큰명 없음, size 픽셀 enum 직접 사용
- ⚠️ **본인 콘텐츠**: 팔로우 버튼 숨김. 이 분기 놓치는 경우 많음
- ⚠️ **차단·탈퇴 작성자**: placeholder + "볼 수 없는 사용자" — 배지/팔로우 모두 숨김

### 6.1 슬롯 레이어 혼동 금지

Media 슬롯 위 overlay 레이어는 **카드 타입별로 위치가 다름**:

**Landscape Card (3:2)** — 두 overlay 모두 **하단** (Figma 2375:29907 확인):
1. **User Information** (좌측 하단) — Avatar + @user_id (이 문서 §3.1 담당)
2. **ODS Scrap Button** (우측 하단) — `variant="media"`

**Portrait Card (3:4) — Content slot 의 작성자 정보**:
- Thumbnail Accessory (우측 상단) — 포맷 뱃지(duration / "집들이" / "노하우" 등) 배치
- 작성자 정보는 Content 슬롯으로 내려감 (§3.2)

**Portrait Card (3:4) — Media slot overlay 케이스**:
- 작성자(좌측 하단) + 스크랩(우측 하단) overlay 는 별도 도메인 컴포넌트 [`portrait-card-overlay`](../portrait-card-overlay/spec.md) 참조
- 동일 카드 내 Content slot 의 작성자 정보는 §3.2 Info Below 와 공존 가능 (Overlay + Info Below 둘 다 보유)
- Landscape overlay (본 §3.1) 와 spec 다름 — scrim gradient 패턴·Avatar 사이즈·padding 모두 별도

→ ⚠️ **"스크랩 = 우측 상단" 으로 일반화 금지.** Landscape Card 는 우측 하단. ODS `Thumbnail.accessory` prop 의 관례 위치(우측 상단)와 다르므로 외부 absolute wrapper 필수.

### 6.2 Card × Module 경계

- 이 문서는 **Card 레이어** responsibility (작성자 정보 표시)
- Module 레이어(섹션 타이틀 + 카드 HScroll 컨테이너)는 **별도** — 작성자 정보 규칙 없음
- 모듈별로 어떤 카드 타입을 쓰는지는 `tracks/contents/modules/` 참조 (작성 예정)

### 6.3 작성자 없는 카드 구분

Contents Square Card의 아래 pattern은 **상품·자재 중심 카드**이므로 작성자 정보 규칙 적용 **안 됨**:
- `Product` / `Product Rank` / `Material` / `Material Rank` / `O2OReview`

### 6.4 타 트랙·상위 레이어 경계

- **ODS atoms** (`Avatar`, `Badge`, `BoxButton`) 자체 규격 — [ODS Card Spec (Notion)](https://www.notion.so/ohouse/ODS-Card-Spec-1f8a597878a081ab83f7cf7fe9d4b485) · ODS MCP (`get_component`) 참조
- **이미지 overlay 일반 패턴** (scrim, WCAG) — 🚧 `patterns/image-overlay.md` 작성 예정 (Tyler 협의 대기). 그 전까지는 본 문서 §3.1 Overlay variant가 단일 출처
- 이 문서는 **콘텐츠 트랙 고유 조합·배치 규칙만** 다룸

---

## 7. 미확정 / 확인 필요

### 해결됨 (2026-04-24)
- [x] Overlay variant 닉네임 max 너비 → **160px 고정** 확정 (디어 측정 ground truth — 4/30 정정. 5/7 Figma 메인 컴포넌트 `2951:21051` 의 64 와 conflict 발견했으나 디어 측정 우선 결정)
- [x] Info Below 사용처 → **Contents Portrait Card (5 pattern) + Square Post pattern** 확정

### 여전히 미확정
- [ ] **전문가 식별 표시** — 기존 §3.1 의 `Badge(variant=expert, size=xs)` 표현은 ODS 에 매칭 컴포넌트 없음 확인됨. (1) 해당 표시를 Landscape Card overlay 에서 유지할지, (2) 유지한다면 ODS 어떤 컴포넌트로 매핑할지 미정
- [ ] **Contents Square Card Post pattern의 아바타·닉네임 규칙** — 1:1 카드에서 Portrait와 동일한지, 별도 스펙인지 Figma 재확인 필요
- [ ] Overlay variant에서 작성자 영역 탭 시 프로필 이동 여부 — 피쳐별 다른지 확인 필요
- [ ] 한 줄 소개 없는 작성자의 Sticky Header 레이아웃 (높이 줄어드는지)
- [ ] Profile Centric의 대표 콘텐츠 썸네일 최대 개수
- [ ] 공통 `patterns/image-overlay.md` 신설 여부 — Tyler와 협의 필요 (범위 = ODS atom만인가, molecule/pattern까지인가)
- [x] ~~`tracks/contents/modules/` 폴더 신설 여부~~ — **2026-04-27 신설 완료** (modules/hscroll.md 첫 파일)

### 해결됨 (2026-04-30 Portrait Card overlay 분리)

> 2026-04-27 Figma MCP 실측 발견 미스매치 6건은 모두 [`portrait-card-overlay`](../portrait-card-overlay/spec.md) 별도 도메인 컴포넌트 신설로 해결. Figma `Rhq24yUSskcByKWlASloRe` Section 1 (1:12608) 의 Portrait Card overlay 가 Landscape Card overlay 와 spec 충분히 달라서 별도 컴포넌트로 인정 (`contents-plain-tab` / `topic-chip` 분리 패턴과 동일).

- [x] **Avatar size 카드 타입별 차이** — Landscape (§3.1) 와 Portrait (별도 컴포넌트) 분리로 해결
- [x] **User Information overlay 패딩** — 별도 컴포넌트에서 자체 spec 유지
- [x] **Scrim opacity·시작점 차이** — 별도 컴포넌트에서 자체 spec 유지 (Landscape: 0%→100% 60% / Portrait: 71%→100% 26%)
- [x] **ODS Scrap Button drop-shadow** — 별도 컴포넌트에서 명시
- [x] **Portrait Card 의 Overlay variant 사용** — §1 variant 표 위 "관련 별도 컴포넌트" 안내 추가
- [x] **Overlay 와 Content slot 공존** — 별도 컴포넌트에서 공존 명시 (Portrait Card 는 Media overlay + Content Info Below 둘 다 가능)

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|------|------|------|
| 2026-04-23 | 초안 작성 (첫 트랙 컴포넌트 MD 파일럿) | 4/22 미팅 "트랙 컴포넌트 MD화" 액션 아이템 · `tracks/contents/components/` 구조 파일럿 |
| 2026-04-24 (AM) | H2: `patterns/image-overlay.md` dangling reference 정리 — "🚧 작성 예정 + 본 문서 §3.1 단일 출처" 마커로 명시 | |
| 2026-04-24 (PM) | **ODS 기반 전면 검증·확장** — Notion ODS Card Spec + Figma 5개 노드 교차검증 결과 반영 | 주요 변경: ① §1 variant 표 재구성 (카드 비율 × 슬롯 위치 매트릭스) · ② §3.1 Overlay 닉네임 `32~48px` → **`64px` 확정** · ③ §3.2 Info Below 재정의 (Portrait Card 5 pattern + Square Post pattern) · ④ ODS Card 3슬롯 구조(Media/Seam/Content) 전제 명시 · ⑤ §6 Thumbnail Accessory 슬롯 구분·Card×Module 경계 주의 추가 · ⑥ status `draft` → `verified` · ⑦ sources 필드에 Figma node ID 기록. Figma 노드: 2375:29907 · 2784:11413 · 3040:56487 · 2744:20425 · 2364:45446 |
| 2026-04-27 | **파일럿 시나리오 B (ODS MCP 결합) 결과 반영** | ① §3.1 Figma 슬롯 구조 명문화 (User Information / ODS Scrap Button / dim / @product_thumbnail) · ② Landscape Card 스크랩 위치 = **우측 하단** 명시 (이전 "Thumbnail Accessory = 우측 상단" 일반화 정정) · ③ scrim 은 트랙 컴포넌트 내부라 hex 직접 사용 허용 명시 · ④ 전문가 배지 표현 `Badge(variant=expert, size=xs)` → "전문가 식별 표시 미정" 으로 톤다운 (§7 미확정 후보로 이동) · ⑤ §6.1 Landscape vs Portrait 의 overlay 위치 차이 명시 |
| 2026-04-27 | **Phase 2: Figma MCP 실측 비교 결과 §7 신규 미확정 5건 추가** | Figma `Rhq24yUSskcByKWlASloRe` (Workflow_Test) Section 1 (1:12608) Portrait Card overlay 실측 → §3.1 명세와 미스매치 5건 발견: (1) Avatar size 24 vs 18 / (2) padding 8 vs 10 / (3) scrim 60% vs 26% / (4) Scrap drop-shadow 미명시 / (5) Portrait Card 도 Overlay variant 사용 사례 발견. **Figma MCP + ODS MCP + Track MD 3계층 결합으로만 잡히는 미스매치** — Track MD 신뢰성 자기검증 사례 |
| 2026-04-30 | **Portrait Card overlay 별도 도메인 컴포넌트 분리** | §7 미스매치 6건 모두 [`portrait-card-overlay`](../portrait-card-overlay/spec.md) 신설로 해결. Landscape overlay 와 spec 충분히 달라 별도 컴포넌트로 인정 (`contents-plain-tab` / `topic-chip` 분리 패턴과 동일). §1 variant 표에 안내 / §6.1 Portrait Card overlay 케이스 추가 / §7 해결됨으로 이동 |
| 2026-04-30 | **writing-principles 적용 — 정확한 픽셀 값을 ODS 토큰명·실측·의도 단위로 풀어씀** | §3.1·§3.2.1·§3.2.2·§3.3·§3.4 시각 스펙 + ODS atoms 매핑 + §6 LLM 주의사항 정정. 픽셀 값 박제 → ODS Avatar small/medium/large 토큰 + Figma 실측 + 디자인 의도. 정확한 토큰명 매핑은 ODS MCP 보안 검토 후 또는 Tyler 협의 자리 placeholder. [`schema/writing-principles.md`](../../../schema/writing-principles.md) 참조 |
| 2026-04-30 | 닉네임 포맷·max 너비·ScrapButton spec 정정 | 닉네임 포맷 `@user_id` → `user_id` (Figma 실측 기준) / max 너비 64px → **160px** / ODS `ScrapButton` variant("normal"/"media")·`selected` prop·Provider 필수 명시 + [Figma ODS Library variant 링크](https://www.figma.com/design/aTdWM1sgdScr68GZdQ2sWO/?node-id=57856-1413) 박제. ODS MCP `get_component("ScrapButton")` 결과 반영 |
| 2026-05-07 | ScrapButton selected·disabled 색 토큰 박제 | §3.1 ODS atoms 매핑 ScrapButton 라인에 sub-bullet 2건 추가. Selected = ODS brand color 토큰 (`genuineBlue.350`) / Disabled = ODS gray 토큰 (`gray.250`). 둘 다 variant `media`·`normal` 공통. ODS Figma Library [ScrapButton 정의 노드](https://www.figma.com/design/aTdWM1sgdScr68GZdQ2sWO/?node-id=63867-86) 직접 확인 |
| 2026-05-07 | Avatar size 토큰명 정정 | ODS Figma Library [Avatar 정의 노드](https://www.figma.com/design/aTdWM1sgdScr68GZdQ2sWO/?node-id=46763-55555) 직접 확인 결과 — ODS Avatar 는 size enum (18/24/30/40/80) 직접 사용, small/medium/large 같은 토큰명 없음. §3.1·§3.2.1·§3.2.2 의 "small 토큰" → "size=24" 정정. §3.3 (32px), §3.4 (48 또는 64px) 는 ODS enum 외라 "콘텐츠 트랙 고유 size" 로 표기 (디어 결정 — ODS 에 없는 크기는 콘텐츠 트랙 컴포넌트로). 픽셀 박제는 Figma 실측 재확인 필요. §6 LLM 주의사항도 동기화 |
| 2026-05-07 | Landscape Card 메인 컴포넌트 ([Figma 2951:21051](https://www.figma.com/design/B3YByGbqAZHP1c39gV3a1V/?node-id=2951-21051)) 실측 결과 §3.1 추가 정정 | (1) Avatar size: 24 → **18** (§3.1 시각 스펙 + ODS atoms 매핑) — 디어 결정: Figma 실측 기준 / (2) 닉네임 typography: **ODS Detail12L16 Medium** (12 / 16 / weight 500 / letter-spacing −0.3px) 신규 박제 (§3.1 시각 스펙) / (3) Overlay padding **10px** + Avatar-닉네임 gap **4px** 신규 박제 (§3.1 시각 스펙) / (4) 닉네임 max 너비 64 vs 160 conflict — 디어 결정: 디어 측정 (160) 이 ground truth, Figma 메인 컴포넌트 (64) 는 stale 로 간주, author-info.md 그대로 유지 / (5) §3.2 의 "Overlay 와 같은 사이즈" 메모 정정 (Overlay 는 size=18, Portrait 는 size=24 추정 — 별도 검증 필요) / (6) §6 LLM 주의사항 동기화 |
