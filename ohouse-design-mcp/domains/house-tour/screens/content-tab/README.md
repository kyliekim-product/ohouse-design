---
tier: 4
when-to-read: "집구경 탭(콘텐츠 탭, 2탭) 관련 설계·Query 시"
size: "~2k tokens"
domain: house-tour
variant: content-tab
status: production
current_version: "26Q1 Migration"
released: 2026-03-30
owner: Deeer
linked_yaml_components: [ContentsLandscapeCard, ContentsPortraitCard]
prototype_html: tracks/contents/_pilot-load-test/result/attempt-1.html
prototype_url: https://deeer-glitch.github.io/ohouse-design-pilot-sandbox/
last_verified: 2026-04-22
---

# Screen · 집구경 탭 (Content Tab)

> GNB 2번째 탭. **현재 프로덕션**은 26Q1 Migration 버전.
> 다음 큰 개편: [Context Builder](../upcoming/context-builder/README.md) — 5월 초 라이브 QA 목표.

## 사용 컴포넌트

- @domain-component:house-tour/InterestFeed
- @domain-component:house-tour/HScroll
- @domain-component:house-tour/RecommendedProjectSection
- @domain-component:house-tour/TopicChip
- @domain-component:content-detail/ContentsPlainTab
- @domain-component:content-detail/AuthorInfo

## 진입/이탈

| 구분 | 경로 |
|---|---|
| 진입 | GNB 2번째 탭, 딥링크, 앱스킴 |
| 이탈 | 콘텐츠 상세페이지, 크리에이터 프로필, 검색/필터 결과, Context Builder |

## 정체성

- **페이지 ID**: `content_tab` *(로그센터 기준 확인 필요)*
- **역할**: 유저가 **원하는 탐색 맥락에 맞는 콘텐츠를 발견**하는 허브
- **진입**: GNB 2번째 탭 · 딥링크 · 앱스킴

## 현재 프로덕션 스펙 (26Q1 Migration)

### 기본 구조

```
[Topbar]
[상단 피드 칩] — 추천(default) / 커뮤니티 / 쇼츠
[필터 리스트]
[콘텐츠 피드 / 필터링 결과]
```

### 상단 피드 3종

| 피드 | 역할 | 비고 |
|------|------|------|
| **추천** (default) | 모듈 기반 콘텐츠 피드 | 아무 앱스킴 없이 진입 시 기본 |
| **커뮤니티** | 별도 탭 (클라이언트 변경 최소화) | 인기/최신/main category 구조 |
| **쇼츠** | 별도 피드 없음 | 쇼츠 플레이어로 이동, 뒤로가기 시 복귀 |

> 탭 스와이프 기획은 **취소**됨

### 추천 피드 구성

- **모듈 단위 노출** — 모든 콘텐츠는 섹션별 모듈
- **고정 모듈**:
  - `idx=1`: 운영 모듈
  - `idx=99`: 인피니티 피드 모듈
- **유동 모듈** (서버 드리븐 제어):
  - 노출 순서 / 타입 / 콘텐츠 노출 로직 / 섹션명 / '더 보기' 여부·랜딩
- **홈 피드와 모듈 리스트 공유** (Mobile API 공용)

### 필터 시스템

- **필터 리스트** (최상단): `[맞춤필터, 집들이, 공간, 평수, 주거형태, 가족형태]`
- **맞춤필터** — 첫 번째 고정, 강조 색상
  - 이름 서버 수정 가능
  - 최초 방문 시 힌트 메시지
  - 프리셋 필터(공간/평수 등) 선택 시 맞춤필터 바텀싯이 해당 영역 열림
  - 세부 구성: as-is 오늘의취향 필터와 동일
- **집들이 숏컷 = 집들이 모드**
  - 집들이 **단일 필터일 때만** "최신 집들이" 모듈 추가 노출
  - 타이틀: "취향만 쏙쏙 골라 담은 추천 집들이"
- **필터 적용 결과**
  - 필터 1개 이상 적용 → 모든 모듈 해제, **2grid 워터폴** 노출
  - 이미지 **3:4 고정** (Contents Portrait Card)
  - description 여부에 따라 추가 노출
  - 로직: as-is 오늘의취향과 동일
- **필터 UX**
  - 필터 칩 선택 순서대로 추가
  - X 버튼: 전체 해제 · 개별 칩 탭: 개별 제거
  - 세부 필터 없어도 '필터 해제' 전까지 필터 모드 유지

### 커뮤니티 피드

- **탭 구조**: `[인기] [최신] [main category…]` (칩 형태)
- **인기**
  - 일간 필터 기본, 기존 커뮤니티 홈 로직 유지
  - 기간별 인기 게시글 100개
  - **부스터 뱃지** (서버 제어 — 아이콘/텍스트/컬러):
    - `curated_hot` "지금 주목받는" — 쇼핑수다 모아보기 중 랜덤
    - `rec_general` "내 취향 추천" — 개인화 추천
- **최신**: 모든 게시판 최신순
- **main category**: Admin 순서대로 (sub category 미노출)
  - `sub_category` 파라미터 딥링크 클릭 시 `{main_category}_all` CLP로

### 기술 요건

- **Mobile API 기반** (홈 공용) — [문서](https://docs.google.com/document/d/1S1MA5DU1AJ27PjTZ5faW4TGCa0HgfDVzbeoHcqISQ8A)
- **웹뷰 전환**: 진행 안 함
- **광고 모듈**: 런칭 버전 제외
- **로그 V2**: 사용 가능

### 미해결 이슈 (Open)

- [ ] 글쓰기 버튼 위치 (홈 / 2탭 / 둘 다)
- [ ] 딥링크 호환 정책 세부
- [ ] 콘텐츠 피드 내 영상 모듈 간 자동재생 정책

## 주요 버전 이력

| 시점 | 버전 | 핵심 변화 |
|------|------|---------|
| 2026-03-30 | **26Q1 Migration** (현재) | GNB 2탭 신설, 홈/오늘의취향 콘텐츠 통합, 모듈 기반 피드, Mobile API 공용화 |
| (예정) 2026-05 초 | Context Builder | → [upcoming/context-builder](../upcoming/context-builder/README.md) |

## 권위 있는 참조

- **PRD**: [Google Doc - 26Q1 콘텐츠 탭 migration](https://docs.google.com/document/d/1M1KqLW-di303yS94d_pgpauNL5hgVCFxKqlnM-IZnmk)
- **1-Pager**: [Notion](https://www.notion.so/ohouse/Product-Planning-Content-Tab-2b8a597878a08044b749cbb1fc767d86)
- **Figma**: [26Y1H Contents 마스터](https://www.figma.com/design/TFu6sdq4Cf4yRfJLU0KqyQ/-26Y1H--Contents) · [Summary 섹션](https://www.figma.com/design/TFu6sdq4Cf4yRfJLU0KqyQ/?node-id=1594-91534)
- **Notion 상위**: [집구경 탭(콘텐츠 탭)](https://www.notion.so/2d9a597878a0802497cef16547fa4e74)
- **담당**: Blake (PO, 피드·탭 기획) · Hopes (PO, 커뮤니티 피드) · MJ Lee (TPM) · Genie (DA)

## LLM 작업 시 주의사항

- ⚠️ **카드 이미지 비율 위치별로 다름**: 피드 내 카드 3:2 (Landscape) / 필터링 결과 3:4 (Portrait)
- ⚠️ **커뮤니티는 별도 탭**: 콘텐츠 피드 로직과 분리. 커뮤니티 고유 컴포넌트(부스터 뱃지 등)를 추천 피드에 관성적으로 쓰지 말 것
- ⚠️ **5월 초 Context Builder 런칭 예정**: 새 기능 기획 시 CB와 간섭 여부 체크 ([upcoming](../upcoming/context-builder/README.md))
- ⚠️ **정책 관련 기획** (차단·탈퇴·신고·비공개 등): [`content-detail/policies`](../../../content-detail/policies/policies.md) 확인 후 미확정 항목은 `[⚠️ 정책 확인 필요]` 마커

## 업데이트 규칙

- **Minor** (문구·규칙·하위 정책): 본문 수정 + "버전 이력" 한 줄
- **Feature 단위** (모듈 추가·변경): 섹션 수정 + last_verified 갱신
- **Major** (탭 재구조화 등): `upcoming/` 병렬 문서 → 런칭 시 본 문서로 merge + 이전 내용 "버전 이력"에 요약

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|------|------|------|
| 2026-04-22 | 초안 작성 (첫 screen 세분화 파일) | `patterns/_content-ingest.md §9` 에서 distill |
