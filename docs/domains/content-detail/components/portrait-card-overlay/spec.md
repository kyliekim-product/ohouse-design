---
type: domain-component-spec
parent: domains/content-detail/README.md
component: portrait-card-overlay
topic: component-variant
tier: 4
when-to-read: "Contents Portrait Card (3:4) 의 Media 슬롯 overlay 영역(작성자 정보·스크랩 등) 설계·검증 시"
size: "~1.5k tokens"
status: verified
owner: Deeer
last_verified: 2026-05-07
sources:
  - "Figma: Workflow_Test (Rhq24yUSskcByKWlASloRe), Section 1 (1:12608) — 오슬라이스 플러그인 정리본"
  - "관련: tracks/contents/components/author-info.md §3.1 (Landscape Card overlay)"
---

# Portrait Card Overlay (콘텐츠 트랙)

Contents Portrait Card (3:4) 의 Media 슬롯 overlay 영역 spec. **Landscape Card overlay (`author-info.md` §3.1) 와 다른 별도 트랙 컴포넌트**.

> **왜 별도 컴포넌트인가**
> - scrim gradient 패턴 자체가 다름 (Landscape: 0%→100% 전체 / Portrait: 71%→100% 부분만 — 거의 다른 시각 패턴)
> - **닉네임 max width 별도** (Landscape 160px / Portrait **120px** — 2026-05-07 디어 결정)
> - Overlay + Content slot **공존** (Landscape 는 Overlay 만, Portrait 는 둘 다 보유)
> - 콘텐츠 트랙 패턴 — ODS 또는 다른 트랙 컴포넌트 variant 로 표현 안 되는 케이스는 트랙 컴포넌트로 분리 (`contents-plain-tab` / `topic-chip` 과 동일 패턴)
> - (참고: Avatar size 18, User Information padding 10px 은 Landscape 와 동일 — 별도 spec 아님)

---

## 1. 사용처

- Contents Portrait Card (3:4) — 5 pattern (Photo · Video · Project · Knowhow · Pro Project) 중 Media slot 에 작성자 overlay 가 있는 케이스
- Figma 실측 위치: Workflow_Test (1:12608) Section 1 의 Thumbnail Accessory

> **Content slot 공존**: 본 컴포넌트는 Media slot overlay 만 다룸. 동일 카드 내 Content slot 의 작성자 정보는 [`author-info` §3.2](../author-info/spec.md) Info Below variant 와 함께 사용 (Overlay + Info Below 공존 케이스).

## 2. Overlay 영역 구조

```
Media 슬롯 (Thumbnail)
├─ User Information     ← 좌측 하단 overlay (Avatar + 닉네임)
├─ ODS Scrap Button     ← 우측 하단 overlay (drop-shadow 있음)
└─ scrim gradient       ← 위 두 요소 가독성 확보용 (부분 적용)
```

## 3. 시각 스펙

> 정확한 픽셀 값은 Figma 실측 기준이며 ODS 토큰명 매핑은 Tyler 협의 후 단일 출처로 확정 예정. 그 전까지 Figma 가 canonical.

| 요소 | spec (Figma 실측) | ODS 토큰 매핑 | 디자인 의도 |
|---|---|---|---|
| Avatar 사이즈 | 18px | ODS Avatar size=18 | Portrait 비율 안에서 시각적 weight 낮춤 |
| User Information padding | 실측 10px (bottom·left) | TBD | overlay 가 카드 가장자리에 너무 붙지 않게 |
| Avatar - 닉네임 gap | 4px | TBD | Avatar 와 닉네임 시각적 묶음 |
| 닉네임 typography | Detail12L16 Medium (12 / 16 line-height / weight 500 / letter-spacing −0.3px) | ODS Detail12L16 Medium | Portrait 비율 안에서 가독성 + 시각적 weight 낮춤 |
| 닉네임 max 너비 | **120px 고정** (디어 결정 2026-05-07) | TBD | Portrait 비율 안에서 적정 길이. Figma Workflow_Test 의 64px 와 Landscape author-info §3.1 의 160px 의 균형값 |
| Scrim gradient | 시작점 71% → 100%, opacity 26% (`rgba(0,0,0,0.26)`) | TBD — 트랙 컴포넌트 내부 hex 직접 허용 | 작성자 영역만 부분 강조. 미디어 가독성 우선 |
| Scrap Button 위치 | bottom·right 10px (User Info 와 동일) | TBD | overlay 가 가장자리에 너무 붙지 않게 |
| Scrap Button size | 24x24px | TBD | 미디어 위 인터랙션 hit area 확보 |
| Scrap drop-shadow | `0px 4px 5px rgba(0,0,0,0.12)` | TBD | scrim 적용 안 된 영역에서 버튼 가시성 확보 |
| 텍스트 색상 | white 고정 | ODS color/static-white | overlay 위 가독성 |

> **Landscape overlay 와의 차이 요약** (참고): Landscape 는 scrim 이 thumbnail 전체에 적용되고 (gradient 60%→0% 전체), Portrait 는 작성자 영역 부근에만 부분 적용 (71%→100%, opacity 더 낮음). 시각적으로 다른 패턴.

## 4. ODS atoms 매핑

- **Avatar**: ODS Avatar atom (size=18) — Figma 실측 2026-05-07 확정
- **ScrapButton**: ODS `ScrapButton` (variant="media", `selected` prop). 정의: [Figma ODS Library](https://www.figma.com/design/aTdWM1sgdScr68GZdQ2sWO/?node-id=57856-1413)
  - **Selected 상태 색**: ODS brand color 토큰 (`genuineBlue.350`) — variant `media`·`normal` 공통
  - **Disabled 상태 색**: ODS gray 토큰 (`gray.250`) — variant 공통
  - *출처: ODS Figma Library, 2026-05-07 확인 (author-info.md §3.1 과 sync)*
- **전문가 식별 표시**: 미정 — [`author-info` §7](../author-info/spec.md) 의 공통 미확정 항목으로 추적

## 5. LLM 작업 시 주의사항

- ⚠️ **Landscape Card overlay 와 다른 spec** — `author-info.md §3.1` Avatar/scrim/padding 그대로 따라가지 말 것
- ⚠️ **Overlay + Content slot 공존** — Media overlay 만 본 컴포넌트 책임, Content slot 의 Info Below 작성자 정보는 [`author-info` §3.2](../author-info/spec.md) 참조
- ⚠️ **scrim gradient 시작점** — Landscape (0%) 와 Portrait (71%) 다름. "전체 scrim" 으로 일반화 금지
- ⚠️ **정확한 토큰명은 ODS MCP 보안 검토 후 매핑** — 그 전까진 Figma 실측이 canonical, 트랙 컴포넌트 내부 hex 사용 허용

## 변경 이력

| 날짜 | 변경 | 비고 |
|------|------|------|
| 2026-04-30 | 초안 작성 — `author-info.md` §7 미스매치 6건 분리 처리 | Figma `Rhq24yUSskcByKWlASloRe` Section 1 (1:12608) 실측 기준. ODS atom·다른 트랙 variant 로 표현 안 되는 케이스 → 트랙 컴포넌트로 분리 패턴 적용 (`contents-plain-tab` / `topic-chip` 동일) |
| 2026-05-07 | Figma 재검증 + 시각 스펙 표 5행 추가 | Workflow_Test (1:12608) 재실측 결과 기존 박힌 5건 모두 sync 일치 ✅. 추가 박제 5건: (1) Avatar - 닉네임 gap (4px) / (2) 닉네임 typography (ODS Detail12L16 Medium) / (3) 닉네임 max 너비 (**120px 고정** — 디어 결정, Figma Workflow_Test 의 64 와 Landscape author-info §3.1 의 160 의 균형값) / (4) Scrap Button 위치 (bottom·right 10px) / (5) Scrap Button size (24x24px). Avatar 토큰 매핑도 "ODS Avatar size=18" 로 확정 (TBD 해제). last_verified 2026-04-27 → 2026-05-07 정정 |
| 2026-05-07 | §1·§4 정정 — author-info.md sync + 별도 컴포넌트 이유 정확화 | §1 "왜 별도 컴포넌트인가": "Avatar 사이즈·padding spec 모두 별도" 표현 정정 — 사실 Avatar (둘 다 size=18) 와 padding (둘 다 10px) 은 Landscape 와 동일. 별도인 건 **닉네임 max width** (Landscape 160 / Portrait 120) 와 scrim 패턴, Overlay+Content 공존. §4 ODS atoms 매핑: Avatar TBD 해제 → "size=18" 확정 / ScrapButton 의 selected (`genuineBlue.350`) · disabled (`gray.250`) 색 정보 추가 — author-info.md §3.1 과 sync |
