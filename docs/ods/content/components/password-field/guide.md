# PasswordField

비밀번호 입력 전용 컴포넌트입니다. 마스킹/마스킹 해제 전환을 위한 Visibility Toggle을 내장하며, 플랫폼 네이티브 비밀번호 자동완성을 지원합니다.

> **어떤 컴포넌트를 써야 할까?**
> - 비밀번호 입력 → **PasswordField**
> - 일반 텍스트 입력 → [InputField](../input-field/guide.md)
> - 숫자 입력 (PIN 등) → [NumberField](../number-field/guide.md)

## Usage Guidelines

### PasswordField vs InputField

PasswordField는 InputField에 비밀번호 전용 기능이 추가된 컴포넌트입니다.

| | PasswordField | InputField |
|---|---|---|
| 마스킹 | 기본 마스킹 (••••••) | 없음 |
| Visibility Toggle | 내장 (눈 아이콘) | 없음 |
| 자동완성 | 비밀번호 전용 (current-password / new-password) | 일반 텍스트 |
| 용도 | 로그인, 회원가입, 비밀번호 변경 | 이메일, 이름, 검색어 등 |

**PasswordField를 사용하는 경우**

- "로그인 비밀번호" — 기존 비밀번호를 입력합니다.
- "회원가입 비밀번호" — 새 비밀번호를 설정합니다.
- "비밀번호 확인" — 비밀번호를 재입력하여 확인합니다.
- "비밀번호 변경" — 현재 비밀번호와 새 비밀번호를 입력합니다.

**PasswordField를 사용하지 않는 경우**

- "인증 코드 입력" → InputField를 사용하세요. 마스킹이 필요 없습니다.
- "카드 CVC" → InputField를 사용하세요. 3자리 숫자이며 별도 마스킹 규칙이 있습니다.

![PasswordField vs InputField 비교](./images/vs-input-field.png)

---

### Visibility Toggle

눈 아이콘을 탭하면 마스킹/마스킹 해제를 전환할 수 있습니다.

| 상태 | 아이콘 | 동작 |
|---|---|---|
| Masked | eye-off | 비밀번호가 ••••••으로 숨겨집니다 |
| Unmasked | eye-on | 비밀번호가 평문으로 표시됩니다 |

- disabled/readonly 상태에서도 Visibility Toggle은 작동합니다. 값 조작이 아닌 표시 방식 전환이기 때문입니다.
- 마스킹 전환 시 포커스와 커서 위치가 보존됩니다.

![Visibility Toggle 예시](./images/toggle.png)

---

### Error 상태

유효성 검증에 실패했을 때 사용합니다. [HelperText](../helper-text/guide.md)와 함께 에러 메시지를 표시합니다.

| | 예시 |
|---|---|
| ✅ | 비밀번호 조건 미충족 시 error + "영문, 숫자, 특수문자 포함 8자 이상" |
| ✅ | 비밀번호 불일치 시 error + "비밀번호가 일치하지 않습니다" |
| ❌ | error만 활성화하고 메시지 없음 |

![Error 상태 예시](./images/error.png)

---

### Size 선택

| Size | 사용 맥락 |
|---|---|
| medium | 로그인, 회원가입 등 일반적인 폼 |
| small | 설정 화면 등 공간이 제한된 경우 |

![Size 비교](./images/size.png)

## Figma

### 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Size | Variant | `small` / `medium` |
| State | Variant | `default` / `focused` |
| Disabled | Variant | 비활성화 |
| Error | Variant | 에러 상태 |
| Value | Variant | 입력값 유무 |
| Masked | Variant | 마스킹 상태 (`true` = 숨김, `false` = 표시) |
| Label | Boolean | 레이블 표시 |
| Helper Text | Boolean | 도움말 텍스트 표시 |
| Left | Boolean | 좌측 슬롯 표시 |
| Right | Boolean | 우측 슬롯 표시 |

---

> 치수, 토큰, 애니메이션 등 상세 스펙은 [스펙 문서](spec.md)를 참고하세요.
