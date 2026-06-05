# {ComponentName} — 사용 규칙

- **상태**: candidate
- **ODS 매칭 실패 근거**: (어떤 `list_components`/`list_recipes`/`search_*` 쿼리로 못 찾았는지)
- **최초 사용처**: preview/{slug}

## 언제 쓰나
(공통화 가치가 있는 신규 패턴인 이유. 1회성이면 등록 금지.)

## Props
| prop | type | default | 설명 |
|---|---|---|---|
| variant | `'default'` | `'default'` | … |

## ODS 토큰 매핑
| 용도 | 값 | ODS 토큰 |
|---|---|---|
| 텍스트 | #141414 | `foreground` |
| 강조 | #00A1FF | `backgroundBrand` / `foregroundBrand` |
| radius | 12px | (ODS 미보유 — raw, 사유) |

## Do / Don't
- ✅ 색은 `LIGHT_THEME.colors.*`, 타이포는 textStyle, 아이콘은 @bucketplace/icons.
- ❌ 이모지·임의 글리프·임의 hex 직접 사용 금지(미매칭분만 주석과 함께 raw).

## 상태(state)
default / hover / focus / active / disabled / selected 중 해당하는 것 명세.
