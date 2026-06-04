# Domain Policy Category Rationale

## Purpose

도메인 상세페이지의 `Policies` 탭은 여러 출처의 Markdown 문서를 그대로 나열하지 않고, 작업자가 판단에 필요한 정보를 빠르게 찾을 수 있도록 공통 카테고리로 재분류한다.

현재 입력 문서는 주로 `/Users/kylie.kim/Documents/GitHub/ohouse-design-context/tracks` 하위의 track context 문서다. 이 문서들은 사람이 작성하고 업데이트하는 single source of truth이며, 파일마다 상세도와 분리 수준이 다르다. 따라서 UI는 원본 파일 구조를 그대로 노출하기보다, 문서 안의 `##` 섹션을 공통 작업 의도별로 묶는다.

## Source Structure

`tracks/_index.md`는 track 문서의 기본 구조를 다음처럼 정의한다.

- `tracks/<track>.md`: 트랙 진입 인덱스, 라우팅용 공통 요약
- `tracks/<track>/policies.md`: 도메인 운영 정책
- `tracks/<track>/states.md`: 선택적 상태 처리 문서
- `tracks/<track>/interactions.md`: 선택적 인터랙션 문서
- `tracks/<track>/components/*.md`: 트랙 고유 컴포넌트 variant
- `tracks/<track>/screens/*.md`: 지면별 문서

현재 실제 데이터는 track마다 성숙도가 다르다.

- `contents.md`: 트랙 정체성, 디자인 원칙, 하위 문서 라우팅, 컴포넌트, 상태, 인터랙션, 참조, LLM 주의사항을 포함하는 track index
- `contents/policies.md`: AI 생성 콘텐츠, 신고/차단, 숨김/비공개, 미확정 항목 등 실제 운영 정책
- `commerce.md`: 아직 별도 `policies.md`가 없고, track index 안에 상태 처리와 도메인 고유 정책이 함께 존재

이 차이 때문에 공통 UI 카테고리는 파일 경로만으로 만들 수 없다. 같은 `tracks/<track>.md` 안에도 정책성 섹션이 있고, `policies.md` 안에도 출처/변경 이력처럼 정책 본문이 아닌 섹션이 있다.

## Current Categorization Flow

현재 사이트 구현은 다음 순서로 정책 정보를 만든다.

1. 도메인 slug를 track으로 매핑한다.
2. 도메인 자체 정책 문서와 track 문서를 함께 읽는다.
3. Markdown 본문을 `##` heading 단위로 나눈다.
4. 각 섹션의 제목과 본문 키워드를 기준으로 공통 카테고리를 부여한다.
5. 도메인 상세페이지의 `Policies` 탭에서 카테고리별 하위 탭으로 보여준다.

관련 구현 위치:

- `ohouse-design-site/src/lib/repo.js`: `POLICY_SECTION_GROUPS`, `splitMarkdownSections`, `classifyPolicySection`
- `ohouse-design-site/src/pages/d/[domain].astro`: `policyGroupOrder`, `policyGroups`, policy card/modal UI

## Category Model

### Rules

작업자가 설계나 검토 시 반드시 따라야 하는 정책/원칙/처리 규칙이다.

포함 기준:

- 제목이나 본문에 `정책`, `처리`, `권한`, `조건`, `제약`, `주의사항`, `원칙`, `구매 조건`, `할인`, `로직` 등이 있는 섹션
- 별도 카테고리로 강하게 분류되지 않은 정책성 섹션

예시:

- `contents/policies.md`의 `AI 생성 콘텐츠`
- `contents/policies.md`의 `본인 확인된 콘텐츠 요청 처리`
- `commerce.md`의 `도메인 고유 정책`
- `commerce.md`의 `LLM 작업 시 주의사항`

이 카테고리는 "작업자가 지금 결정에 반영해야 하는가?"에 초점이 있다.

### States

상태별 표시, 노출/미노출, 숨김, 비공개, Empty/Error처럼 UI 상태와 직접 연결되는 규칙이다.

포함 기준:

- `상태`, `empty`, `error`, `hidden`, `blocked`, `숨김`, `비공개`, `블라인드`, `미노출` 등이 있는 섹션

예시:

- `contents.md`의 `상태 처리`
- `contents/policies.md`의 `숨김(비공개) 게시글 시스템 제약`
- `commerce.md`의 `상태 처리`

이 카테고리는 "화면에 어떤 상태를 어떻게 보여줘야 하는가?"에 초점이 있다.

### Platform

iOS, Android, Web, Mobile Web처럼 플랫폼별 차이가 있는 정책이다.

포함 기준:

- 섹션 제목이나 본문에 `iOS`, `Android`, `Web`, `Mobile Web`, `플랫폼` 등이 있는 섹션

예시:

- `contents/policies.md`의 `신고·차단 (UGC / 댓글 / 사용자)`
- 신고 기능의 iOS 미지원, Android/Web 문구 차이, 댓글 신고 처리 방식 차이

이 카테고리는 "플랫폼별로 UI/문구/기능이 달라지는가?"에 초점이 있다.

### Open Questions

아직 정책이 확정되지 않았거나 owner 확인이 필요한 항목이다.

포함 기준:

- 제목에 `미확정`, `확인 필요`, `TBD`, `TODO`, `예정` 등이 있는 섹션
- 본문에 `정책 확인 필요`, `작업 시 확인 필수` 같은 강한 확인 요청이 있는 섹션

예시:

- `contents/policies.md`의 `미확정 (Yong 문의 예정)`
- `commerce.md`의 `Planned (로드맵)`은 정책 확인이 필요한 경우 이 성격에 가까울 수 있지만, 현재 구현상 제목의 `Planned`만으로는 자동 분류하지 않는다.

이 카테고리는 "작업 전에 확인해야 하는가?"에 초점이 있다.

### Track Context

track index 문서의 배경 정보다. 정책 본문으로 직접 다루기보다, 해당 도메인이 어떤 track 문맥에 속하는지 이해시키는 보조 정보다.

포함 기준:

- `tracks/<track>.md` 형태의 track index 파일에서 나온 섹션
- 구현상 `policyKind === 'track-context'`이면 우선적으로 이 카테고리에 둔다.

예시:

- `contents.md`의 `정체성`
- `contents.md`의 `트랙 고유 디자인 원칙`
- `commerce.md`의 `정체성·범위`
- `commerce.md`의 `핵심 컴포넌트`

이 카테고리는 "이 정책이 어떤 제품/트랙 맥락에서 나온 것인가?"에 초점이 있다.

### Sources

정책 판단의 근거가 되는 참조, 출처, 변경 이력이다.

포함 기준:

- 제목에 `변경 이력`, `권위 있는 참조`, `주요 참조`, `참조`, `출처`, `source` 등이 있는 섹션

예시:

- `contents/policies.md`의 `변경 이력`
- `contents.md`의 `권위 있는 참조`
- `commerce.md`의 `권위 있는 참조`

이 카테고리는 "이 정책을 어디서 검증할 수 있는가?"에 초점이 있다.

## Why These Categories Work Across Track Docs

track 문서들은 파일 구조는 다르지만, 작업자가 소비하는 정보의 목적은 반복된다.

| 작업 목적 | 공통 카테고리 | 이유 |
|---|---|---|
| 어떤 규칙을 따라야 하는가 | Rules | 정책, 처리 조건, 제약, 주의사항이 설계 판단의 직접 근거가 된다. |
| 화면 상태를 어떻게 보여줘야 하는가 | States | Empty/Error/숨김/비공개/미노출은 UI 상태와 직접 연결된다. |
| 플랫폼별로 달라지는가 | Platform | iOS/Android/Web 차이는 같은 정책이라도 UI 구현을 바꾼다. |
| 아직 확인해야 하는가 | Open Questions | 미확정 항목은 작업자가 그대로 적용하면 위험하다. |
| 이 정보의 배경은 무엇인가 | Track Context | track index는 정책 본문이 아니라 해석을 돕는 배경이다. |
| 근거는 어디인가 | Sources | Slack, PRD, Figma, 변경 이력은 신뢰도와 최신성을 판단하게 한다. |

즉, 현재 분류는 원본 문서의 작성 방식이 아니라 작업자의 사용 목적을 기준으로 정제한 것이다.

## Known Limitations

현재 분류는 Markdown `##` 섹션과 키워드 기반 heuristic이다. 문서가 계속 늘어나면 다음 한계가 있다.

- 섹션 하나에 정책, 상태, 플랫폼 차이가 함께 있으면 하나의 대표 카테고리로만 들어간다.
- `commerce.md`처럼 track index와 정책이 섞인 문서는 일부 정책성 섹션이 `Track Context`로 묶일 수 있다.
- `출처` 링크가 본문 곳곳에 있어도 `Sources`로 분류하지 않도록 제목 중심으로 제한했기 때문에, 출처가 많은 정책 본문은 정책 카테고리에 남는다.
- 장기적으로는 frontmatter나 섹션 단위 metadata가 있으면 더 정확하게 분류할 수 있다.

## Recommended Authoring Guidance

작업자가 `tracks` 문서를 계속 업데이트할 때는 다음 규칙을 지키면 도메인 상세페이지에서 더 안정적으로 분류된다.

- 실제 운영 정책은 가능하면 `tracks/<track>/policies.md`로 분리한다.
- 상태 처리만 다루는 내용은 제목에 `상태 처리`, `Empty`, `Error`, `숨김`, `비공개` 같은 표현을 포함한다.
- 플랫폼 차이가 있으면 제목 또는 본문에 `iOS`, `Android`, `Web`, `플랫폼`을 명시한다.
- 미확정 항목은 제목에 `미확정` 또는 `확인 필요`를 명시한다.
- 참조와 변경 이력은 `권위 있는 참조`, `변경 이력` 제목으로 분리한다.
- track 전체 배경은 `tracks/<track>.md`에 두고, 정책 본문과 섞지 않는 방향으로 점진 분리한다.

## Current Interpretation

현재 `Rules ~ Sources` 하위 탭은 `/tracks` 문서의 원래 파일 분류를 그대로 복제한 것이 아니다. 여러 track 문서가 서로 다른 세분화 상태에 있어도 도메인 상세페이지에서 일관되게 소비할 수 있도록, 섹션을 "작업자가 무엇을 판단하려는가" 기준으로 재배열한 정보 구조다.

