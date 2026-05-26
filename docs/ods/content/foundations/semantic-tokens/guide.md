# Semantic Tokens

Semantic token은 화면 요소의 실제 색상값이 아니라, UI에서 맡는 역할과 의미를 기준으로 선택하는 토큰입니다. 토큰을 선택할 때는 적용 대상, 의미, 위계를 함께 고려합니다.

## 선택 기준

### 표현하려는 대상부터 고릅니다

먼저 색상을 적용할 대상이 무엇인지 정합니다.

| 대상 | group |
|---|---|
| 화면이나 요소의 배경 | `background` |
| 텍스트와 아이콘 | `foreground` |
| stroke, divider, outline | `border` |
| 독립적인 강조색 | `accent` |

예를 들어 보조 설명 텍스트에는 `foregroundWeak`를 사용하고, 약한 배경 영역에는 `backgroundWeak`를 사용합니다. 텍스트에 배경 토큰을 사용하거나, 배경에 foreground 토큰을 사용하는 방식은 피합니다.

### 의미를 고릅니다

대상의 역할을 정한 뒤, UI가 전달해야 하는 의미를 고릅니다.

| intent | 사용 기준 |
|---|---|
| `neutral` | 기본 정보, 일반 배경, 기본 경계처럼 감정이나 상태를 강조하지 않는 경우 |
| `brand` | ODS 또는 오늘의집 브랜드 행동, 브랜드 영역, 브랜드 강조를 표현하는 경우 |
| `emphasis` | 주요 행동, 선택 상태, 높은 주목도가 필요한 강조를 표현하는 경우 |
| `critical` | 오류, 삭제, 실패, 위험처럼 즉시 주의가 필요한 부정 상태 |
| `attention` | 경고, 주의, 확인 필요처럼 critical보다 낮은 단계의 주의 상태 |
| `inverse` | 어두운 배경 위 밝은 요소처럼 일반 표면과 반전된 관계 |
| `overlay` | dim, scrim, overlay처럼 다른 콘텐츠 위에 올라가는 층 |
| `disabled` | 사용자가 조작할 수 없는 비활성 상태 |
| `accent` | 정보 상태보다 색상 자체의 구분이나 장식적 강조가 필요한 경우 |

Critical과 attention은 구분해서 사용합니다. 사용자가 즉시 오류를 인지하고 수정해야 하는 상태는 critical이고, 선택 전에 확인하거나 주의를 기울이면 되는 상태는 attention입니다.

### 강도를 고릅니다

같은 group과 intent 안에서도 위계에 따라 strength를 고릅니다.

| strength | 사용 기준 |
|---|---|
| `default` | 기본 위계 |
| `weak` | 보조 정보, 낮은 대비의 표면, 가벼운 강조 |
| `strong` | 일반 토큰보다 강한 경계나 강조 |
| `inverse` | 반전된 표면 위에서 쓰는 토큰 |
| `disabled` | 비활성 상태 |
| `dim` | 배경 콘텐츠를 눌러주는 overlay |
| `overlay` | 콘텐츠 위에 얹히는 overlay layer |

보조 텍스트에는 `foregroundWeak`를 사용하고, 주요 제목이나 핵심 값에는 `foreground`를 사용합니다. 비활성 상태를 단순히 약하게 보이게 하려고 `weak` 토큰으로 대체하지 말고, 상호작용이 불가능한 상태라면 disabled 토큰을 사용합니다.

## 토큰 Spec

토큰별 spec은 [`tokens.yaml`](tokens.yaml)에 정의합니다. `name`은 문서에서 사용하는 토큰 이름이며, `implementation`은 design-assets 구현체와 연결되는 경로입니다.

`tokens.yaml`은 실제 light/dark 값, palette alias, hex 값을 포함하지 않습니다.
