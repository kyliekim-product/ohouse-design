# Section Arrow Button — Tokens

각 Token 이름은 `spec.md` Constants 표의 토큰과 1:1 매칭. 이 문서가 진실이며, Notion Token DB / `design-assets/tokens`는 이로부터 동기화되는 렌더본이다.
각 Component Token은 theme별로 alias 토큰과 hex를 해석한다. hex는 palette 상태에 따라 변하는 파생값.

### Container · Background

- `ODS Section Arrow Button Background Color Default`
  - light: `backgroundWeak` · `#f5f5f5`
  - dark: `backgroundWeak` · `#141414`

### Icon · Color

- `ODS Section Arrow Button Icon Color Default`
  - light: `foreground` · `#141414`
  - dark: `foreground` · `#f5f5f5`

### Interaction Layer · Background

- `ODS Section Arrow Button Interaction Layer Background Color Hovered`
  - light: `foreground` @ 4%
  - dark: `foreground` @ 4%
- `ODS Section Arrow Button Interaction Layer Background Color Pressed`
  - light: `foreground` @ 8%
  - dark: `foreground` @ 8%

### Focus Ring · Color

- `ODS Section Arrow Button Focus Ring Color Focused`
  - light: `focusRing.color` · `#141414`
  - dark: `focusRing.color` · `#f5f5f5`
