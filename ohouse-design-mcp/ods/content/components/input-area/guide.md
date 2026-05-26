# InputArea

여러 줄 텍스트를 입력받는 컴포넌트입니다. 줄바꿈을 지원하며, props 조합에 따라 높이 동작이 결정됩니다.

> **어떤 컴포넌트를 써야 할까?**
> - 한 줄 입력 (이름, 이메일, 검색어 등) → InputField
> - 여러 줄 입력 (후기, 문의, 자기소개 등) → **InputArea**

## Usage Guidelines

### InputArea vs InputField

InputArea와 InputField의 핵심 차이는 **줄바꿈 지원 여부**입니다.

| | InputArea | InputField |
|---|---|---|
| 줄바꿈 | Enter로 줄바꿈 | Enter = 제출 또는 다음 필드 이동 |
| 높이 | 가변 (rows / auto grow) | 고정 1줄 |
| 용도 | 후기, 문의, 자기소개 등 장문 | 이름, 이메일, 검색어 등 단문 |

**InputArea를 사용하는 경우**

- "상품 후기 작성" — 여러 줄에 걸쳐 상세한 리뷰를 작성합니다.
- "시공 문의" — 요청 사항을 자유롭게 기술합니다.
- "자기소개" — 프로필에 여러 줄의 자기소개를 입력합니다.
- "채팅 메시지" — 줄바꿈이 가능한 메시지를 입력합니다.
- "콘텐츠 작성" — 집들이, 노하우 등 본문을 작성합니다.

**InputArea를 사용하지 않는 경우**

- "이메일 주소" → InputField를 사용하세요. 한 줄이면 충분합니다.
- "검색어 입력" → InputField를 사용하세요. 줄바꿈이 필요 없습니다.
- "전화번호" → InputField를 사용하세요. 짧은 단일 값입니다.

![InputArea vs InputField 비교](./images/vs-input-field.png)

---

### 높이 동작

높이는 개별 props가 아닌 **props 조합**으로 결정됩니다. `rows`와 `minRows`/`maxRows`는 동시에 사용할 수 없습니다.

| props 조합 | 동작 | 사용 예시 |
|---|---|---|
| `rows: 5` | 항상 5줄 높이 고정. 초과 시 내부 스크롤 | 상품 후기(rows=5), 한줄평(rows=2) |
| `minRows: 1, maxRows: 5` | 1줄에서 시작, 입력에 따라 5줄까지 자동 확장. 초과 시 내부 스크롤 | 채팅 입력(1→5), 댓글(1→3) |
| `minRows: 1` (maxRows 없음) | 1줄에서 시작, 무제한 확장 | 긴 메모, 일기 |
| 모두 미지정 | 높이를 외부 스타일에 위임. 부모 컨테이너가 결정 | 전체 화면 에디터 |

**주의사항**

- `maxRows`를 지정하지 않으면 무제한으로 늘어납니다. ScrollView 내부에서 사용할 때 레이아웃 충돌에 주의하세요.
- Figma에서는 🌀 Input Area (Fixed Rows)와 🌀 Input Area (Flexible Rows) 두 컴포넌트로 분리되어 있습니다. 코드에서는 하나의 InputArea에 props 조합으로 동작이 결정됩니다.

![높이 동작 비교](./images/height.png)

---

### Left/Right 슬롯

대부분의 경우 슬롯 없이 사용합니다. 부가 기능이 필요할 때만 활용합니다.

| | 예시 |
|---|---|
| ✅ Right에 글자수 카운터 | "42/500" 표시 |
| ✅ Right에 첨부 버튼 | 이미지 첨부 아이콘 |
| ✅ Left에 카테고리 표시 | 입력 유형 아이콘 |
| ❌ 양쪽 슬롯에 복잡한 UI | textarea 영역이 과도하게 줄어듦 |

슬롯 콘텐츠는 textarea 상단에 정렬됩니다. 텍스트가 길어져도 슬롯 위치는 고정됩니다.

![Left/Right 슬롯 예시](./images/slots.png)

---

### maxLength와 글자수 카운터

maxLength를 설정하면 최대 입력 가능 문자 수가 제한됩니다.

- 카운팅 기준은 Unicode Extended Grapheme Cluster(UAX #29)입니다. 이모지(👨‍👩‍👧‍👦)도 1자로 카운트합니다.
- 카운터는 Right 슬롯에 "현재/최대" 형태로 표시합니다. 예: "42/500"

| 사용 예시 | maxLength |
|---|---|
| 상품 후기 | 500 |
| 한줄평 | 100 |
| 닉네임 소개 | 50 |

![글자수 카운터 예시](./images/counter.png)

---

### Error 상태

유효성 검증에 실패했을 때 사용합니다. 일반적으로 InputArea 외부의 HelperText와 함께 사용하여 에러 메시지를 표시합니다.

| | 예시 |
|---|---|
| ✅ | 최소 글자수 미달 시 error 활성화 + "최소 10자 이상 입력해주세요" |
| ✅ | 금칙어 포함 시 error 활성화 + "사용할 수 없는 표현이 포함되어 있습니다" |
| ❌ | error만 활성화하고 메시지 없음 — 사용자가 원인을 알 수 없음 |

disabled + error 조합에서는 disabled가 시각적으로 우선합니다. 조작할 수 없는 상태에서 에러를 표시할 실익이 없습니다.

![Error 상태 예시](./images/error.png)

---

### Variant 선택

| Variant | 사용 맥락 |
|---|---|
| normal | 일반적인 폼 입력. 테두리가 있어 입력 영역이 명확합니다. |
| subtle | 배경과 어우러지는 부드러운 스타일. 설정 화면 등에서 사용합니다. |
| transparent | 테두리/배경 없이 텍스트만 표시. 인라인 편집에 적합합니다. |

![Variant 비교](./images/variant.png)

## Figma

### 프로퍼티

**🌀 Input Area (Fixed Rows)**

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Variant | Variant | `normal` / `subtle` / `transparent` |
| Focused | Boolean | 포커스 상태 |
| Disabled | Boolean | 비활성화 |
| Rows | Variant | `1` ~ `7` |
| Value | Boolean | 입력값 유무 |
| Error | Boolean | 에러 상태 |

**🌀 Input Area (Flexible Rows)**

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Variant | Variant | `normal` |
| Focused | Boolean | 포커스 상태 |
| Min Rows / Max Rows | Variant | 시작 줄 수 (1~6) |
| Max Rows | Variant | 최대 줄 수 (2~8) |
| Value | Boolean | 입력값 유무 |

---

> 치수, 토큰, 애니메이션 등 상세 스펙은 [스펙 문서](spec.md)를 참고하세요.
