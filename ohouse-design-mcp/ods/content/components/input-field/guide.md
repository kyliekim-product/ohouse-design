# InputField

단일 줄 텍스트를 입력받는 컴포넌트입니다. 이메일, 이름, 검색어 등 짧은 텍스트 입력에 사용합니다.

> **어떤 컴포넌트를 써야 할까?**
> - 한 줄 입력 (이름, 이메일, 검색어 등) → **InputField**
> - 여러 줄 입력 (후기, 문의, 자기소개 등) → [InputArea](../input-area/guide.md)
> - 비밀번호 입력 → [PasswordField](../password-field/guide.md)
> - 숫자 입력 (수량, 금액 등) → [NumberField](../number-field/guide.md)

## Usage Guidelines

### InputField vs InputArea

InputField와 InputArea의 핵심 차이는 **줄바꿈 지원 여부**입니다.

| | InputField | InputArea |
|---|---|---|
| 줄바꿈 | Enter = 제출 또는 다음 필드 이동 | Enter로 줄바꿈 |
| 높이 | 고정 1줄 | 가변 (rows / auto grow) |
| 용도 | 이름, 이메일, 검색어 등 단문 | 후기, 문의, 자기소개 등 장문 |

![InputField vs InputArea 비교](./images/vs-input-area.png)

---

### Variant 선택

| Variant | 사용 맥락 |
|---|---|
| normal | 일반적인 폼 입력. 테두리가 있어 입력 영역이 명확합니다. |
| subtle-pill | 둥근 모서리의 부드러운 스타일. 검색 바, 필터 등에 사용합니다. |
| transparent | 테두리/배경 없이 텍스트만 표시. 인라인 편집에 적합합니다. |

![Variant 비교](./images/variant.png)

---

### Size 선택

| Size | 사용 맥락 |
|---|---|
| medium | 일반적인 폼. 충분한 터치 영역이 필요한 경우 |
| small | 테이블 셀, 리스트 아이템 내부 등 공간이 제한된 경우 |

![Size 비교](./images/size.png)

---

### Left/Right 슬롯

대부분의 경우 슬롯 없이 사용합니다. 부가 기능이 필요할 때만 활용합니다.

| | 예시 |
|---|---|
| ✅ Left에 아이콘 | 검색 아이콘, 이메일 아이콘 |
| ✅ Left에 텍스트 | 국가 코드 "+82", 통화 "₩" |
| ✅ Right에 아이콘 | 캘린더 아이콘, 위치 아이콘 |
| ✅ Right에 텍스트 | 단위 "cm", "kg" |
| ❌ 양쪽 슬롯에 복잡한 UI | 입력 영역이 과도하게 줄어듦 |

슬롯은 icon, string, custom 세 가지 옵션을 지원합니다.

![Left/Right 슬롯 예시](./images/slots.png)

---

### Clear Button

`clearable`을 활성화하면 입력값이 있을 때 클리어 버튼이 표시됩니다.

| | 예시 |
|---|---|
| ✅ 검색어 입력 | 빠르게 검색어를 지우고 다시 입력 |
| ✅ 이름/닉네임 입력 | 입력 실수 시 한 번에 삭제 |
| ❌ 보존이 중요한 입력 | 실수로 지우면 복구가 어려운 경우 |

- 클리어 버튼은 값이 비어 있거나, disabled/readonly 상태에서는 표시되지 않습니다.
- 클리어 후 InputField는 자동으로 포커스 상태가 됩니다.

![Clear Button 예시](./images/clear.png)

---

### Error 상태

유효성 검증에 실패했을 때 사용합니다. 일반적으로 [HelperText](../helper-text/guide.md)와 함께 사용하여 에러 메시지를 표시합니다.

| | 예시 |
|---|---|
| ✅ | 이메일 형식 오류 시 error 활성화 + "올바른 이메일 형식을 입력해주세요" |
| ✅ | 중복 닉네임 시 error 활성화 + "이미 사용 중인 닉네임입니다" |
| ❌ | error만 활성화하고 메시지 없음 — 사용자가 원인을 알 수 없음 |

disabled + error 조합에서는 disabled가 시각적으로 우선합니다.

![Error 상태 예시](./images/error.png)

---

### Placeholder 작성

Placeholder는 입력 힌트를 제공합니다. 짧고 간결한 1문장으로 작성합니다.

| | 예시 |
|---|---|
| ✅ | "이메일 주소를 입력해주세요" |
| ✅ | "검색어를 입력해주세요" |
| ❌ | "여기에 이메일 주소를 입력하세요. 예: example@email.com" — 너무 깁니다 |

![Placeholder 예시](./images/placeholder.png)

## Figma

### 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Variant | Variant | `normal` / `subtle-pill` / `transparent` |
| Size | Variant | `small` / `medium` |
| State | Variant | `default` / `focused` |
| Disabled | Variant | 비활성화 |
| Error | Variant | 에러 상태 |
| Value | Variant | 입력값 유무 |
| Label | Boolean | 레이블 표시 |
| Helper Text | Boolean | 도움말 텍스트 표시 |
| Left | Boolean | 좌측 슬롯 표시 |
| Right | Boolean | 우측 슬롯 표시 |
| Clearable | Boolean | 클리어 버튼 표시 |
| Placeholder | Boolean | 플레이스홀더 표시 |

---

> 치수, 토큰, 애니메이션 등 상세 스펙은 [스펙 문서](spec.md)를 참고하세요.
