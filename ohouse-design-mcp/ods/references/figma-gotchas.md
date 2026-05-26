# Figma Plugin API Gotchas (프로젝트 로컬)

> `figma:figma-use` 스킬의 `references/gotchas.md`에 없는, 프로젝트에서 발견한 추가 함정들.

## Grid 인스턴스에서 `gridRowCount`/`gridColumnCount` 수정 불가

컴포넌트 인스턴스에서는 `gridRowCount`, `gridColumnCount`를 변경할 수 없다. 마스터 컴포넌트에서만 가능.

```js
// WRONG — 인스턴스에서 Grid 행/열 수 변경 시도 → 에러
const tableComp = await figma.importComponentByKeyAsync(TABLE_KEY);
const tableInst = tableComp.createInstance();
tableInst.layoutMode = 'GRID';
tableInst.gridRowCount = 5; // ❌ 에러: 인스턴스에서 수정 불가

// CORRECT — SLOT 기반 컨테이너 + raw GRID 프레임 패턴
const tableInst = tableComp.createInstance();
const slot = tableInst.findOne(n => n.name === 'SLOT');
const grid = figma.createFrame();
grid.fills = [];
grid.layoutMode = 'GRID';
grid.gridRowCount = 5;      // ✅ raw 프레임이므로 자유롭게 설정
grid.gridColumnCount = 3;
slot.appendChild(grid);
```

**해결 패턴:** 마스터 컴포넌트는 스타일(border, radius, clip)만 담당하고, 내부 SLOT에 raw GRID 프레임을 삽입한다.

## `importVariableByKeyAsync`는 발행된 라이브러리 변수 전용

로컬(미발행) 변수에는 `importVariableByKeyAsync`가 작동하지 않는다.

```js
// WRONG — 로컬 변수를 key로 import 시도
const colorVar = await figma.variables.importVariableByKeyAsync('local-var-key');
// ❌ 실패: 발행된 라이브러리 변수만 지원

// CORRECT — 로컬 변수는 ID로 직접 조회
const colorVar = await figma.variables.getVariableByIdAsync('VariableID:25715:18263');
```

**판단 기준:** 토큰 헬퍼(`applyColorVar`, `createStyledText`)가 `importVariableByKeyAsync`를 쓰는 건 라이브러리 변수 대상이라 정상. 직접 호출이 필요하면 변수가 발행 상태인지 먼저 확인.

## Grid 속성 변경 시 "object is not extensible" 에러

`gridColumnSizes`/`gridRowSizes` 수정을 다른 Grid 속성 변경과 같은 `use_figma` 호출에 몰아넣으면 발생할 수 있다.

```js
// WRONG — 한 스크립트에서 Grid 설정 + 크기 변경 동시 수행
grid.layoutMode = 'GRID';
grid.gridRowCount = 3;
grid.gridColumnCount = 2;
grid.gridColumnSizes[0].type = 'FLEX'; // ❌ "object is not extensible"

// CORRECT — Grid 생성과 크기 설정을 분리
// 호출 1: Grid 생성 + 행/열 수 설정
grid.layoutMode = 'GRID';
grid.gridRowCount = 3;
grid.gridColumnCount = 2;

// 호출 2: 별도 use_figma에서 크기 설정
grid.gridColumnSizes[0].type = 'FLEX';
grid.gridRowSizes[0].type = 'HUG';
```

**또는** `createDocTable` 헬퍼처럼 Grid 생성 직후 바로 설정하면 동작하는 경우도 있다. 에러 발생 시 호출을 분리할 것.

## Grid 셀 인스턴스의 `layoutSizingHorizontal` 누락

Grid에 `appendChildAt`로 셀 인스턴스를 배치하면 기본값이 HUG로 남아 셀이 열 너비를 채우지 않는다.

```js
// WRONG — 셀이 HUG 상태로 남음
const cell = headerComp.createInstance();
grid.appendChildAt(cell, 0, 0);
// → 셀 너비가 텍스트 크기만큼만 차지

// CORRECT — appendChildAt 후 FILL 설정
const cell = headerComp.createInstance();
grid.appendChildAt(cell, 0, 0);
cell.layoutSizingHorizontal = 'FILL'; // ✅ 열 전체 너비 채움
```

**주의:** 텍스트 설정은 `appendChildAt` 전에 해야 한다 (compound ID 무효화 방지). FILL 설정은 `appendChildAt` 후에 해야 한다.

## 인스턴스 중첩 시 `appendChild` 불가 (FRAME vs SLOT 타입)

컴포넌트 내부의 FRAME 타입 노드에는 인스턴스 중첩 환경에서 `appendChild`가 불가능하다. 반드시 `ComponentNode.createSlot()`으로 생성한 진짜 SLOT 타입이어야 한다.

```js
// WRONG — FRAME 타입은 중첩 인스턴스 안에서 자식 추가 불가
// .Doc/Table 컴포넌트 내부:
const container = figma.createFrame();
container.name = 'SLOT';
comp.appendChild(container);
// → Quote 안에 넣으면 "Cannot move node. New parent is inside of an instance" 에러

// CORRECT — createSlot()으로 진짜 SLOT 생성
const slot = comp.createSlot('Slot');
// → 인스턴스 중첩 환경에서도 appendChild 가능
```

## Plugin API 변경 후 캔버스 렌더링 지연 (Figma 버그)

Plugin API로 Grid 셀의 레이아웃(FILL, 정렬 등)을 변경하면, API 속성은 즉시 반영되지만 **캔버스 렌더링이 갱신되지 않는** 경우가 있다. 사용자가 해당 노드를 클릭하면 그제서야 올바르게 렌더링된다.

- **증상:** 텍스트가 가운데 정렬로 보이지만 API는 LEFT+MIN+FILL로 보고. 클릭하면 좌측 정렬로 바뀜.
- **원인:** Figma의 렌더링 캐시가 Plugin API 변경을 즉시 반영하지 않음 (Figma 측 버그)
- **대응:** 우리 코드 문제가 아님. 속성이 정확하면 무시해도 됨. 파일 저장/리로드 또는 수동 클릭 시 정상 반영됨.
- **우회법:** 텍스트 내용을 수정하면 해당 텍스트 노드의 렌더링이 갱신됨. 공백 추가→제거(`t.characters += ' '; t.characters = t.characters.trimEnd()`)로 실질적 변경 없이 갱신 가능. `createDocTable` 헬퍼에 이미 포함됨.
- **효과 없는 방법:** `figma.currentPage.selection`, Grid 열 크기 토글은 캔버스 렌더링을 갱신하지 않음.
