# ODS Docs

오늘의집 디자인 시스템의 Figma 컴포넌트 작업 프로젝트.

# Figma 작업 규칙

## 컴포넌트 인스턴스 내부 건들지 않기

- `createInstance()` 후 컴포넌트 내부 slot/children을 수동으로 조작하지 않는다.
- 컴포넌트가 이미 갖고 있는 콘텐츠를 직접 넣으려 하지 않는다. 인스턴스를 만들면 컴포넌트 기본 콘텐츠가 자동으로 따라온다.
- 인스턴스 내부 노드의 크기(resize, maxWidth, layoutSizing)를 건드리지 않는다. 건드리면 컴포넌트 설계가 깨진다.
- 인스턴스 조작은 `setProperties()`로 노출된 component properties만 사용한다.

## "모르겠다/없다/안된다" 금지

"기억 못한다", "원본이 삭제됐다", "복구 불가능하다", **"API에서 지원 안 한다"** 하기 전에:
1. **현재 대화 컨텍스트**를 먼저 검색한다. 논의한 스펙, 결정사항, 디자인 값이 이미 있을 수 있다.
2. **프로젝트 파일**(`content/components/`, `content/patterns/`, `references/`, `AGENTS.md`)을 확인한다.
3. **API 레퍼런스**(`references/plugin-api-standalone.d.ts`)를 grep한다. 관련 키워드로 검색하면 대부분 나온다.
4. 전부 확인한 뒤에도 없으면 그때 사용자에게 물어본다.

"안 된다"고 단정하고 우회로를 만들지 않는다. 먼저 찾아본다.

## 기존 구조 수정 우선

새 프레임/노드를 만들기 전에, **기존 컴포넌트/sub-component를 수정해서 해결할 수 있는지 먼저 확인**한다. 기존 sub-component에 프로퍼티를 추가하거나, 내부 구조를 변경하는 것이 새로 만드는 것보다 항상 우선이다.

- raw Frame + raw TEXT로 구조를 대체하지 않는다. sub-component 체계를 유지한다.
- "이 기능을 기존 컴포넌트에 추가할 수 있는가?" 를 먼저 자문한다.

## 관계 조회 먼저

노드를 이동/생성/삭제하기 전에, **해당 노드의 관계를 use_figma로 먼저 조회**한다.

```js
// 이 스크립트를 실행해서 관계를 파악한 뒤 작업한다
const node = await figma.getNodeByIdAsync('대상 ID');
return {
  parent: { id: node.parent.id, name: node.parent.name, type: node.parent.type },
  siblings: node.parent.children.map(c => ({ id: c.id, name: c.name, type: c.type })),
  // component set이면 sub-component 찾기
  references: node.findAll ? node.findAll(n => n.type === 'INSTANCE').map(n => ({ id: n.id, mainComponent: n.mainComponent?.parent?.name })) : [],
};
```

조회 결과에서 **함께 처리해야 할 노드**(sub-component, 관련 인스턴스, 문서 등)를 나열하고, 사용자에게 제시한 뒤 진행한다. 실행부터 하지 않는다.

## use_figma 스크립트 구조 강제

모든 write(생성/수정/삭제) use_figma 스크립트는 **반드시 대상 노드 조회로 시작**한다. 조회 결과를 보고 변경을 결정한다. 조회 없이 바로 변경하는 스크립트 금지.

## Figma 작업 체크리스트

**모든 단계를 순서대로 수행. 예외 없음.**

### Phase 1: 분석 (작업 시작 전)

- [ ] **sub-component 내부 읽기**: `get_metadata`만으로 끝내지 않는다. 관련된 모든 sub-component에 대해 `get_design_context`로 **내부 프로퍼티, 레이어 구조, 숨겨진 토글**까지 확인한다. metadata는 껍데기만 보여준다.
- [ ] **프로퍼티 전수 조사**: 메인 컴포넌트와 각 sub-component의 프로퍼티를 모두 나열한 뒤, 사용자에게 현재 상태를 보고한다. "이런 것 같다"고 추측하지 않는다.
- [ ] **중복/불필요 프로퍼티 식별**: 부모-자식 간 같은 역할을 하는 프로퍼티가 있는지 확인한다. (예: 부모 Header 토글 + 자식 Title 토글 → 어정쩡한 중간 상태 발생)

### Phase 2: 스크립트 작성 전

- [ ] **API 레퍼런스 먼저**: `references/plugin-api-standalone.d.ts`에서 사용할 속성/메서드의 타입을 grep으로 확인한다. **추측 금지**. 특히:
  - 레이아웃 관련: `primaryAxisSizingMode`, `counterAxisSizingMode`, `layoutMode`, `layoutAlign` 등 현재 값을 조회 스크립트로 먼저 확인
  - 노드 삭제/추가 후 부모 크기 변화: sizing mode가 `FIXED`면 자동 축소 안 됨. `AUTO`(HUG)인지 확인 필수
  - 처음 쓰는 API는 반드시 d.ts에서 시그니처 확인 후 사용
- [ ] **auto-layout 프레임 스펙 필수 속성**: 새 auto-layout 프레임을 스펙/스크립트에 기술할 때 다음 4개를 반드시 명시한다. 하나라도 빠지면 Figma 기본값(CENTER 등)이 적용되어 의도와 다를 수 있다:
  - `primaryAxisSizingMode` (AUTO / FIXED)
  - `counterAxisSizingMode` (AUTO / FIXED)
  - `primaryAxisAlignItems` (MIN / CENTER / MAX / SPACE_BETWEEN)
  - `counterAxisAlignItems` (MIN / CENTER / MAX / BASELINE)
- [ ] **구조 변경 전 사고**: 레이아웃/위치/크기/부모-자식 관계를 바꾸기 전에 직접 수행한다:
  1. **역할**: "이 노드는 실제 제품에서 뭐야?"
  2. **동작**: "사용자가 값을 바꾸면? 텍스트가 길어지면? variant를 전환하면?" 시뮬레이션
  3. **도출**: 1+2에서 구현 방향을 결정한 뒤 실행

### Phase 3: use_figma 호출 시

- [ ] 라이브러리 모드: 인스턴스를 넣을 부모 프레임에 `setExplicitVariableModeForCollection()` 설정했는가?
- [ ] 노드 배치: `parent.children`의 위치를 먼저 스캔하고 겹치지 않는 곳에 배치했는가?
- [ ] 부모 리사이즈: 자식 노드를 추가/삭제/이동했으면 부모의 bounds를 `resizeWithoutConstraints`로 조정했는가?
- [ ] private sub-component: 메인 컴포넌트별 전용으로 만들었는가? 다른 컴포넌트와 공유하지 않았는가?
- [ ] 노드 ID 공유: raw ID가 아닌 **사용자가 준 원본 URL의 전체 경로**에 `node-id=`만 교체한 형태로 제공했는가? 축약 URL 금지.
- [ ] Component variant 추가: clone 대신 `createComponent()` + 수동 조립 + `appendChild` 패턴인가?
- [ ] **생성 노드 추적**: 모든 `use_figma` 스크립트에서 생성(create)/복제(clone)한 노드 ID를 반드시 return한다. 테스트·시행착오로 만든 노드는 해당 작업 완료 시 즉시 삭제한다. 다음 단계로 넘어가기 전에 "내가 만든 노드 중 안 쓰는 게 있는가?" 확인한다.

### Phase 4: 실행 후 검증

- [ ] **반환값 검증**: `use_figma` 반환값에서 의도한 변경이 실제 적용됐는지 확인한다. 예상과 다르면 "완료"라고 하지 않는다.
- [ ] **완료 검증 스킬**: `figma-conventions` 스킬을 invoke하여 검증 스크립트(고아 스캔, 부모 레이아웃, 잔여물 점검, 확대 스크린샷, 메타속성 일치)를 실행한다.
- [ ] **문서 인스턴스 파급 확인**: 컴포넌트 프로퍼티를 추가/삭제/변경했으면, Documentation 페이지의 **모든 인스턴스**를 스크린샷으로 확인한다.
  - property table의 행/열이 여전히 유효한지
  - Usage Guidelines의 샘플 인스턴스가 깨지지 않았는지
  - Dim/오버레이 배경이 적절히 보이는지 (Dialog 등 오버레이 컴포넌트는 인스턴스가 card에 딱 맞게 축소되면 Dim이 안 보임. 반드시 원본 비율로 여백 포함)
  - Sample Box가 인스턴스 크기에 맞는지

## Figma 용어

- Figma UI/기능 용어를 쓸 때 추측하지 않는다. `site:help.figma.com`에서 공식 명칭을 확인한 뒤 사용한다.
- sub-component: 다른 컴포넌트 내부에서 사용되는 컴포넌트 (공개 여부 무관)
- private sub-component: `.` 또는 `_` prefix로 asset panel에서 숨긴 sub-component

## Doc 카드 Slot 규칙

- Do/Don't 카드의 Slot에 컴포넌트 인스턴스만 넣지 않는다. 해당 섹션이 설명하는 맥락의 **실제 콘텐츠**(레이블 텍스트, 입력값 등)를 반드시 함께 포함한다.
  - 예: 레이블 가이드 섹션 → Slot에 "푸시 알림" 텍스트 + Switch. Switch만 단독 배치 금지.
- 가이드(`content/components/*/guide.md`)의 구체적 예시를 Figma 문서로 변환할 때, **원본의 각 예시 항목이 Figma에 대응되는지 1:1 대조** 검증한다. 특히 테이블 → 카드 변환 시 정보 유실 여부를 확인한다.
- **SLOT에 콘텐츠 추가 시 기존 placeholder 제거 필수**: `slot.appendChild()` 직접 호출 금지. `appendToSlot(slot, node)`를 사용하여 기존 children을 제거한 뒤 추가한다. placeholder를 숨기기(visible=false)가 아닌 **제거(remove)**가 올바른 처리.

## Figma 인스턴스 규칙

- 컴포넌트 인스턴스를 배치할 때 기본값(placeholder 텍스트, 기본 아이콘 등)을 그대로 두지 않는다. 반드시 맥락에 맞는 실제 값으로 채운다.
  - 텍스트: "Text", "Label", "Title", "Brand Name" 등 기본값 → 실제 콘텐츠로 교체
  - 아이콘: 불필요한 기본 아이콘은 비활성화
  - **아이콘 swap 필수**: Left/Right Boolean을 켜면 기본 `[Icon] Cube` placeholder가 표시된다. 반드시 sub-component(🔸 Left / 🔹 Right)의 `↳ icon` INSTANCE_SWAP 프로퍼티를 `setProperties()`로 맥락에 맞는 아이콘으로 교체한다. swap 없이 Left/Right만 켜는 행위 금지.
    - 아이콘 교체 방법: `leftArea.setProperties({ '↳ icon#58860:0': importedIconVariantId })`
    - 아이콘 ID 확인: `search_design_system`으로 Icon Library에서 검색 → `importComponentSetByKeyAsync` → monochrome/regular variant ID 사용
  - Boolean 옵션: 모든 인스턴스가 동일한 옵션 조합이면 안 된다. 실제 사용 패턴처럼 인스턴스마다 다르게 설정한다.

## Figma 컴포넌트 규칙

- 메인 컴포넌트(🌀)는 각각 전용 private sub-component를 가진다. 구조가 동일해도 공유 금지.
- 문서 예시(Sample)에서 private sub-component를 직접 인스턴스화하지 않는다. 반드시 메인 컴포넌트(🌀)를 인스턴스화한 뒤 nested instance 속성을 변경한다.
- 형제 컴포넌트에 동일 이유로 같은 변경이 필요하면 물어보지 말고 바로 적용한다.
- ◇ prefix 변수는 해당 컴포넌트 전용 토큰. 다른 컴포넌트에서 사용 금지. 범용 토큰(FG/, BG/, Brand/)을 사용할 것.
- sub-component 내 hidden layer는 잠근다(lock). 소비자가 실수로 건드리지 못하게 보호.
- 단, SLOT 타입 노드는 **잠그지 않는다**. 소비자가 콘텐츠를 넣어야 하므로 열어둬야 한다.

## Figma 디자인 토큰 (필수)

`references/figma-design-tokens.md` 참조. 노드 생성 시점에 바인딩한다. 사후 수정이 아님.

## 근거 제시

- 디자인 가이드라인, 기술 문서 등을 인용할 때 반드시 사용자가 접속 가능한 원문 URL을 함께 제공한다.
- URL을 찾을 수 없으면 "확인이 필요합니다"라고 명시한다.


## Figma 비주얼 → 마크다운은 이미지 링크만

- variant 테이블, 인스턴스 예시 등 Figma 비주얼 콘텐츠를 마크다운에 텍스트 테이블로 표현하지 않는다.
- Figma 비주얼이 변경되면 `figma-example-images` 스킬로 이미지를 재export하고, 마크다운은 이미지 링크를 유지한다.
- `content/components/*/guide.md`의 `[![` 이미지 링크를 텍스트 테이블 `|...|`로 교체하는 행위 금지.

## Auto-layout 안 인스턴스 resize 주의

- auto-layout 컨테이너 안에서 `resize()`하면 primary axis 방향 크기가 안 바뀔 수 있다.
- 해결: `page.appendChild(node)` → `resize()` → `parent.insertChild(index, node)` 패턴 사용.

## Component variant clone 주의

- `clone()`은 component set 밖으로 빠지거나 빈 variant가 생기는 문제가 있다.
- 항상 `figma.createComponent()` → 수동 구성 → `componentSet.appendChild()` 패턴을 사용한다.

## Sub-component variant axis 삭제 금지

Sub-component(.Left, .Right 등)에서 variant axis를 삭제하면 연쇄 파괴가 발생한다:

1. axis 삭제 → 해당 variant을 참조하던 모든 인스턴스가 **Missing variant**
2. `swapComponent()`로 복구 시도 → **hidden layer 포함 모든 instance override 소실**
3. override 소실 → variant 전환 시 padding/color 등 값이 깨짐

Figma sub-component는 **모든 variant에 동일 레이어(String, Icon, ↳custom)를 두고 visibility만 다르게** 하는 패턴을 쓴다. 부모 컴포넌트 variant에서 hidden layer에 override를 걸어두면, 소비자가 variant를 전환해도 override가 유지된다. `swapComponent()`는 이 override를 전부 파괴한다.

**규칙:**
- sub-component에 variant axis를 추가하는 건 가능하지만, **삭제는 금지**
- 불가피하게 삭제해야 하면: swap 전에 모든 인스턴스의 override(hidden layer 포함)를 백업하고, swap 후 복원할 것

## 프로젝트 규칙은 AGENTS.md에 기록

- 프로젝트에 적용되는 규칙, 실수 방지책, 컨벤션은 **memory가 아닌 AGENTS.md**에 기록한다.
- memory는 사용자 프로필, 프로젝트 컨텍스트, 외부 참조 등 비규칙성 정보에만 사용한다.

# 프로젝트 컨텍스트

## 웹뷰 아키텍처

- Toolbar(Top Nav/iOS Toolbar): 네이티브 클라이언트에서 렌더링
- Body 영역: 웹뷰에서 렌더링
- Toolbar는 Liquid Glass 등 OS 스타일에 자동 대응
- 네이티브/웹뷰 간 UI 일관성 유지가 핵심 제약
- Dialog, ActionSheet 등 논의 시 "Toolbar=네이티브, Body=웹뷰" 경계를 기준으로 판단

# Superpowers 경로

- plans → .superpowers/plans/
- specs → .superpowers/specs/
- `docs/superpowers/` 아래에 superpowers 산출물을 두지 않는다.
- superpowers 관련 spec/plan 저장 위치 결정과 숨김 경로 관리는 superpowers 쪽 책임으로 본다.
