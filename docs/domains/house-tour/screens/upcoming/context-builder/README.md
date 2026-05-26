---
tier: 4
when-to-read: "Context Builder(집구경 탭 차세대 개편) 관련 설계·Query 시"
size: "~2k tokens"
domain: house-tour
variant: upcoming/context-builder
status: development
supersedes: domains/house-tour/screens/content-tab/README.md
target_release: "2026-05 초 (라이브 QA)"
owner: Deeer
linked_yaml_components: [ContextBuilder, ContextChip, ContentsPortraitCard]
last_verified: 2026-04-22
---

# Screen (Upcoming) · Context Builder

> **개발 중** · 집구경 탭을 **정적 탐색 → Guided Navigation (LLM 기반 자연어 탐색)** 으로 전환하는 대규모 개편.
> 프로덕션 런칭 시 [`screens/content-tab`](../../content-tab/README.md) 로 merge 예정.

## 사용 컴포넌트

- @domain-component:house-tour/TopicChip
- @domain-component:house-tour/InterestFeed
- @domain-component:content-detail/ContentsPlainTab
- @domain-component:content-detail/AuthorInfo
- @domain-component:house-tour/ContextBuilder (planned)
- @domain-component:house-tour/ContextChip (planned)

## 진입/이탈

| 구분 | 경로 |
|---|---|
| 진입 | 집구경 탭 최상위 gateway, 직접 찾아보기, 추천 컨텍스트 칩 |
| 이탈 | 탐색 결과 CLP, 콘텐츠 상세페이지, 기존 추천 피드 바텀싯 |

## 개요

- **배경**: "어떻게 찾아야 할지 모르는" 유저의 막연함 문제 해결 (특히 LE 유저의 목적 탐색)
- **방향**: 유저 context를 LLM이 생성/제안 + 사용자 탐색 inquiry 데이터 수집 자산화
- **솔루션 포지션**: 통합검색과 다른 시퀀스 (막연한 심상 → 맥락 형성) — GNB 검색바와 다른 진입 맥락

## 진입 시점 구조

### Context Builder 화면

- **집구경 탭 최상위 gateway**
- **추천 컨텍스트 칩**: 3 rows × 5 = **15개** (PoDAU 세팅 100개 풀에서 랜덤, 좌우 스크롤)
- **"직접 찾아보기" 버튼** → 자연어 입력 페이지
- **기존 추천 피드**: 하단 바텀싯으로 수납 (끌어올려 볼 수 있음)

### 직접 탐색 페이지

- **자동완성 placeholder**: 1,000 → **10,000개 프리셋** 중 랜덤 8개 순환 (일정 시간마다 변경)
- **추천 컨텍스트 칩**: 7개 (기본 칩 풀과 공유)
- **자동완성 리스트**: 입력 한 글자씩 실시간
- **초기화 / X 버튼**: 입력값 있으면 초기화 / 없으면 X (탭 초기 화면으로)

### 개인화 placeholder (히든, 향후 활성화)

- "누구와 함께 거주중이신가요?"
- "{이름}님이 사는 공간에 맞는 콘텐츠를 추천드려요"
- Figma 상 `hidden="true"` — LSG 연동 후 개인화 디벨롭 시 활성화

## 탐색 결과 CLP

### 쿼리 결과 피드
- **2grid 무한 스크롤** (별도 '더보기' 없음)
- **CC(콘텐츠 카드)만 노출** (추후 확대)
- **사용 카드**: `🟣 Contents Portrait Card` (165.5px × 가변) — ⚠️ Landscape Card 아님

### 3종 추천칩 (LLM 생성, 고정 위치)

| 위치 | 개수 | 역할 |
|------|------|------|
| 탐색바 | 7개 | 탐색 맥락 **좁히기** (좌우 스크롤) |
| 피드 중간 | 10개 (최초 3 + 더보기 7) | 맥락 **확장** |
| 하단 인터럽트 | 10개 (최초 5 + 더보기 5) | **재탐색 제안** |

- **AI 요약 라벨**: 추천칩 상단 보라색(`--accent/accent-purple` #6F3DDE) "AI 요약" 배지 — LLM 기반임을 시각적으로 표시

### Social proof 태그
- 런칭 시점 **"지금 주목받는"** 만 (최근 7일 조회수 상위, 기준 TBD)

### 필터
- 기존 집구경 탭 필터 유지 · **종류 필터 제거** (CC만 노출이라)
- CTA 문구: "N개 콘텐츠 보기" → **"적용하기"**

### 탐색바 플로팅 동작
- 최상단 표기 → 스크롤 중 숨김 → 역스크롤 시 재표기
- Figma: "Result Feed 스크롤 동작 스펙" 섹션

## 상태 처리 (Figma 최종 기준)

| 상태 | 컴포넌트 | 문구 / lokalize key | CTA |
|------|---------|-------------------|-----|
| **쿼리 로딩** | Skeleton UI | - | - |
| **필터 결과 없음** | ODS `<Empty>` + `<BoxButton>` | `COMMON__EMPTY__FILTER_NORESULTS` / "선택한 필터에 맞는 결과가 없어요.\n다른 필터로 변경해보세요." | "필터 초기화" |
| **연결 오류** | ODS `<Empty>` + `<BoxButton>` | `COMMON__ERROR_CONNECTION__TITLE` / "연결 중 문제가 발생했어요." · `COMMON__ERROR_CONNECTION__SUBTITLE` / "잠시 후 다시 시도해주세요." | `COMMON__ERROR__CONNECTION_RETRY__BUTTON` / "다시 시도" |

## 기술 구조

- **LLM 프롬프트 2회/쿼리** 호출
  - 탐색 키워드 생성 (자연어 → vector search 키워드)
  - 추천 컨텍스트 칩 3종 동시 생성
- **Vector DB**: SigLIP 임베딩 기반 이미지 검색 (CC 7만 개 사전 임베딩)
- **LLM 기반이 아닌 Vector search가 메인** → 탐색 자체에 LLM 비용 최소화
- **결과 노출 개수**: 최초 최대 50개 (이후 파인튜닝)

### XPC 분리 운영
- A (45%): 없는 버전 (baseline)
- B (45%): 베스트 버전
- C (10%): PoDAU 제어 가능 (프롬프트 실험)

### 예상 비용
- LLM API: Daily 10~15만원
- 집구경 DAU 20K × 사용률 20% × 1인 3회 × 2회 호출 ≈ 24,000회/일

## 의사결정 근거

- **PoC (26.03, 60명)**: 만족도 4.0/5 · 75% 새 탐색 방식 선호 · 평균 2.5회 인터랙션으로 발견
- **UT 1차 (26.03.12)**: 자연어 재생성보다 스크롤 다운이 유저 비용 낮음 → 피드 중심
- **UT 2차 (26.03.27)**: CC 전용, 무한 스크롤, 추천칩 3종 역할 확정

## Key Metrics (목표)

- 유의미한 콘텐츠 조회자 비율 (mCAU% / 탭 진입자) **+15%**
- 탭 방문자 중 Guided Navigation 사용 비율 **20%**

## 런칭 시 merge 플로우

프로덕션 런칭 확정 시:

1. [`screens/content-tab`](../../content-tab/README.md) 의 "주요 버전 이력"에 26Q1 Migration 요약 추가
2. `content-tab/README.md` 본문을 Context Builder 스펙으로 교체
3. `content-tab/README.md` frontmatter 업데이트:
   - `current_version: "Context Builder"`
   - `released: 2026-05-XX`
4. **본 폴더 (`upcoming/context-builder/`) 정리**
5. 외부 링크 갱신 (policies.md, contents.md 등에서 참조 확인)

## 권위 있는 참조

- **PRD**: [Google Doc - Context Builder](https://docs.google.com/document/d/1YBfxWUFUXFZ_6MNC51-DvDmdvDfBHXmrXwFVy4U_7AM)
- **Figma 최종 스펙**: [26Y1H Contents / Context Builder](https://www.figma.com/design/TFu6sdq4Cf4yRfJLU0KqyQ/?node-id=5971-91272)
- **담당**: Blake (PO) · Deeer (Design) · Genie (DA)

## LLM 작업 시 주의사항

- ⚠️ **개발 중 문서**: 프로덕션 반영 전. 기획 변경 가능성 있음. `last_verified` 확인
- ⚠️ **Contents Portrait Card** 사용 (Landscape 아님)
- ⚠️ **AI 요약 라벨**(#6F3DDE): **Context Builder 한정**. 타 화면에 관성적으로 적용 금지
- ⚠️ **추천칩 3종 구조**는 타 트랙에 없는 콘텐츠 고유 variant → 공통 승격 보다는 variant로 취급
- ⚠️ **탐색바 플로팅**은 일반 sticky header와 동작 다름 (스크롤 방향 감지)
- ⚠️ **개인화 placeholder는 히든**: 현재 버전에는 노출 금지

---

## 변경 이력

| 날짜 | 변경 | 비고 |
|------|------|------|
| 2026-04-22 | 초안 작성 (upcoming 파일럿) | `patterns/_content-ingest.md §8` 에서 distill |
