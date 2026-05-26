# Switch

On/Off 두 가지 상태를 즉시 전환할 수 있는 토글 컨트롤입니다. 사용자의 선택이 **즉시 반영**되는 설정에 사용합니다.

> **어떤 컴포넌트를 써야 할까?**
> - 선택 후 폼을 제출해야 반영되는 경우 → [Checkbox](../checkbox/guide.md)
> - 즉시 반영되는 On/Off 설정 → **Switch**

## Usage Guidelines

### Switch vs Checkbox

Switch와 Checkbox의 핵심 차이는 **반영 시점**입니다.

| | Switch | Checkbox |
|---|---|---|
| 반영 시점 | 즉시 (탭하는 순간) | 폼 제출 후 |
| 예시 | 알림 받기, 다크 모드 | 이용약관 동의, 선호 카테고리 |

**Switch를 사용하는 경우**

- "알림 받기" — 켜는 순간 서버에 바로 반영됩니다.
- "다크 모드" — 전환하는 즉시 UI가 바뀝니다.
- "위치 서비스 허용" — 탭하는 순간 권한 상태가 변경됩니다.

**Switch를 사용하지 않는 경우**

- "이용약관 동의" → Checkbox를 사용하세요. 가입 완료 버튼을 눌러야 반영됩니다.
- "선호 카테고리 선택" → Checkbox를 사용하세요. 저장 버튼이 있는 설정 폼입니다.

### 레이블 작성

Switch 자체가 On/Off를 나타내므로, 레이블에 상태를 설명하는 동사를 추가하지 않습니다.

| | 레이블 예시 |
|---|---|
| ✅ | "푸시 알림" |
| ✅ | "다크 모드" |
| ✅ | "위치 서비스" |
| ❌ | "푸시 알림 켜기" — "켜기"는 Switch가 이미 표현합니다. |
| ❌ | "다크 모드 활성화" — "활성화"도 마찬가지입니다. |

Switch는 항상 레이블과 함께 배치합니다. 레이블 없이 단독으로 사용하지 않습니다.

### Size 선택

| Size | 사용 맥락 |
|---|---|
| medium | 기본 크기. 특별한 이유가 없으면 medium을 사용합니다. |
| small | 행 높이가 제한된 밀집 레이아웃(데이터 테이블, 툴바 등)에서 사용합니다. |

[![Size 비교](./images/size.png)](https://www.figma.com/design/F6L3NF3Ts9nbxQt7etAiq2?node-id=64341-30)

### Disabled

상위 설정이 꺼져 있어 하위 항목을 변경할 수 없는 경우처럼, 사용자가 변경할 수 없는 이유가 명확할 때만 사용합니다.

> 예: "알림 받기"가 꺼져 있으면, "마케팅 알림", "주문 알림" 등 하위 Switch는 disabled 처리합니다.

가능하면 비활성화 이유를 레이블 아래 보조 텍스트로 안내합니다.

[![Disabled 상태 비교](./images/disabled.png)](https://www.figma.com/design/F6L3NF3Ts9nbxQt7etAiq2?node-id=64341-30)

## Figma

### 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Size | Variant | `medium` / `small` |
| Checked | Boolean | 선택 상태 |
| Disabled | Boolean | 비활성화 |

### Private Sub-Components

| sub-component | 용도 |
|---|---|
| .Switch Container | Switch 전용 트랙(배경) 영역 |
| .Switch Thumb | Switch 전용 원형 핸들 |

---

> 치수, 토큰, 애니메이션 등 상세 스펙은 [스펙 문서](spec.md)를 참고하세요.
