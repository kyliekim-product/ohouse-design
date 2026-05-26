# Label

폼 입력 필드의 제목을 표시하는 컴포넌트입니다. 필수/선택 여부를 시각적으로 안내합니다.

> **관련 컴포넌트**
> - 입력 필드 아래 도움말/에러 메시지 → [HelperText](../helper-text/guide.md)
> - Label + Input + HelperText 조합 → FormField (Notion 스펙 참고)

## Usage Guidelines

### 레이블 작성

Label은 입력 필드가 무엇을 입력받는지 명확하게 알려야 합니다.

| | 예시 |
|---|---|
| ✅ | "이메일" |
| ✅ | "비밀번호" |
| ✅ | "배송지 주소" |
| ❌ | "정보를 입력하세요" — 무엇을 입력하는지 알 수 없음 |
| ❌ | "이메일 주소를 입력해주세요" — Placeholder와 역할이 겹침 |

- Label은 명사형으로 간결하게 작성합니다.
- 동사형("~를 입력하세요")은 Placeholder에 맡깁니다.
- 모든 입력 필드에는 Label을 함께 배치합니다. Label 없이 입력 필드만 단독으로 사용하지 않습니다.

![레이블 작성 예시](./images/writing.png)

---

### 필수/선택 표시 (necessity)

| necessity | 표시 | 사용 맥락 |
|---|---|---|
| `--` (기본) | 표시 없음 | 대부분의 필드가 필수인 폼 — 필수가 기본이므로 별도 표시 불필요 |
| `required` | * 표시 | 선택 필드가 대부분인 폼에서 필수 필드를 강조 |
| `optional` | (선택) 표시 | 필수 필드가 대부분인 폼에서 선택 필드를 구분 |

**어떤 방식을 사용할지는 폼 전체 맥락에서 결정합니다.**

| 폼 구성 | 권장 방식 |
|---|---|
| 대부분 필수 (로그인, 회원가입) | 선택 필드에만 `optional` 표시 |
| 대부분 선택 (프로필 편집, 설정) | 필수 필드에만 `required` 표시 |
| 필수/선택 혼재 | 둘 다 명시하거나, 소수 쪽만 표시 |

![necessity 예시](./images/necessity.png)

---

### Label + Input 조합

Label은 항상 입력 컴포넌트 **위에** 배치합니다. FormField 안에서 사용하면 error/disabled 상태가 자동으로 동기화됩니다.

| | 예시 |
|---|---|
| ✅ | Label("이메일") + InputField |
| ✅ | Label("비밀번호", required) + PasswordField |
| ✅ | Label("수량") + NumberField |
| ❌ | Label 없이 InputField만 단독 배치 |

![Label + Input 조합 예시](./images/combination.png)

## Figma

### 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| necessity | Variant | `--` / `required` / `optional` |
| Optional Text | Text | 선택 표시 텍스트 (기본값: "(선택)") |

---

> 치수, 토큰 등 상세 스펙은 [스펙 문서](../form-field/spec.md)를 참고하세요.
