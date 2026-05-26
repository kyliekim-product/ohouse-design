# NumberField

숫자 입력 전용 컴포넌트입니다. 좌우 StepButton으로 값을 증감할 수 있으며, 키보드 직접 입력도 지원합니다.

> **어떤 컴포넌트를 써야 할까?**
> - 숫자 입력 + StepButton 증감 → **NumberField**
> - 일반 텍스트 입력 → [InputField](../input-field/guide.md)
> - 전화번호, 인증코드 등 숫자 형태의 텍스트 → [InputField](../input-field/guide.md) (KeyboardType=number)

## Usage Guidelines

### NumberField vs InputField

NumberField와 InputField의 핵심 차이는 **StepButton 증감 기능**입니다.

| | NumberField | InputField |
|---|---|---|
| 입력 방식 | 직접 입력 + StepButton 증감 | 직접 입력만 |
| 입력 타입 | 숫자만 | 모든 텍스트 |
| 범위 제한 | min/max/step 지원 | 없음 |
| 용도 | 수량, 금액, 나이 등 | 전화번호, 인증코드, 우편번호 등 |

**NumberField를 사용하는 경우**

- "상품 수량" — StepButton으로 1씩 증감합니다. min=1, max=99.
- "배송비 금액" — step=1000 단위로 금액을 조정합니다.
- "인원수" — 예약 인원을 1명 단위로 증감합니다.
- "평수/면적" — step=0.5, precision=1로 소수점 입력을 지원합니다.

**NumberField를 사용하지 않는 경우**

- "전화번호" → InputField를 사용하세요. 증감이 필요 없는 숫자 형태 텍스트입니다.
- "인증코드" → InputField를 사용하세요. 6자리 고정 숫자입니다.
- "우편번호" → InputField를 사용하세요. 검색 기반 입력입니다.

![NumberField vs InputField 비교](./images/vs-input-field.png)

---

### StepButton

좌우의 - / + 버튼으로 값을 증감합니다.

- 버튼을 길게 누르면 연속으로 값이 변하며, 시간이 지남에 따라 속도가 빨라집니다.
- min에 도달하면 감소 버튼이 비활성화, max에 도달하면 증가 버튼이 비활성화됩니다.
- 빈 상태에서 StepButton을 누르면 0(또는 min/max 범위 내 가장 가까운 값)부터 시작합니다.

| | 예시 |
|---|---|
| ✅ | 상품 수량: step=1, min=1, max=99 |
| ✅ | 금액 조정: step=1000 |
| ✅ | 면적 입력: step=0.5, precision=1 |

![StepButton 예시](./images/step.png)

---

### min/max 범위

min과 max로 입력 가능한 범위를 제한합니다.

- 직접 입력 중에는 범위를 제한하지 않고, 포커스가 빠질 때(blur) 범위 내로 보정합니다.
- min만 지정하면 감소 방향만 제한, max만 지정하면 증가 방향만 제한됩니다.

| 사용 예시 | min | max | step |
|---|---|---|---|
| 상품 수량 | 1 | 99 | 1 |
| 예약 인원 | 1 | 10 | 1 |
| 할인율(%) | 0 | 100 | 5 |
| 면적(평) | 0.5 | — | 0.5 |

![min/max 범위 예시](./images/range.png)

---

### Error 상태

유효성 검증에 실패했을 때 사용합니다. [HelperText](../helper-text/guide.md)와 함께 에러 메시지를 표시합니다.

| | 예시 |
|---|---|
| ✅ | 최소 수량 미달 시 error + "최소 1개 이상 입력해주세요" |
| ✅ | 재고 초과 시 error + "재고가 부족합니다 (최대 5개)" |
| ❌ | error만 활성화하고 메시지 없음 |

disabled + error 조합에서는 disabled가 시각적으로 우선합니다.

![Error 상태 예시](./images/error.png)

---

### Size 선택

| Size | 사용 맥락 |
|---|---|
| medium | 일반적인 폼. 충분한 터치 영역이 필요한 경우 |
| small | 테이블 셀, 장바구니 아이템 등 공간이 제한된 경우 |

![Size 비교](./images/size.png)

## Figma

### 프로퍼티

| 프로퍼티 | 타입 | 설명 |
|---|---|---|
| Variant | Variant | `normal` |
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

---

> 치수, 토큰, 애니메이션 등 상세 스펙은 [스펙 문서](spec.md)를 참고하세요.
