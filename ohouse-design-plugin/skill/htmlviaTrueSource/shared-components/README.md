# 공통 컴포넌트 소스 (shared-components)

> **모든 프로토타입 아웃풋 공통 소스.** badge·card·list·divider·chip·tab 등은 **무조건 ODS 정의 컴포넌트로 매핑·치환**한다. ODS에 없는 **신규 패턴**만 여기서 단일 컴포넌트로 관리하여, 여러 프로토타입이 동일 구현을 재사용한다.

## 원칙

1. **ODS-first.** 새 요소가 필요하면 먼저 `ods-prototype.list_components` / `list_recipes` / `search_*` 로 매칭 시도. 매칭되면 ODS를 쓰고 여기 등록하지 않는다.
2. **신규 패턴만 등록.** ODS에 동등 컴포넌트가 없는 "공통화 가치가 있는" 패턴만 후보로 추가. 1회성 레이아웃은 등록 금지(프로토타입 로컬에 둠).
3. **삼중 산출물 필수.** 후보 1개당 아래 3개를 같은 폴더에 둔다:
   - `*.tsx` — ODS 토큰/컴포넌트 기반 React 구현 (production 후보)
   - `*.usage.md`(또는 `.mdx`) — 사용 규칙·props·do/don't·ODS 토큰 매핑
   - `*.spec.ts` — Playwright 컴포넌트 정합성 검증 (token/state/a11y)
4. **카탈로그 등재.** `CATALOG.md` 에 1줄 등록(상태: candidate → reviewing → promoted/ODS-신청).
5. **승격 경로.** 여러 프로토타입에서 반복되면 ODS팀에 신규 컴포넌트로 신청(promoted). 신청 후엔 ODS 컴포넌트로 치환하고 여기서는 deprecated 표기.

## 폴더 규약
```
shared-components/
├── README.md            # 이 문서 (규약)
├── CATALOG.md           # 후보 레지스트리 (1행/컴포넌트)
├── _template/           # 신규 후보 스캐폴드 복사용
│   ├── Component.tsx
│   ├── Component.usage.md
│   └── Component.spec.ts
└── {ComponentName}/
    ├── {ComponentName}.tsx
    ├── {ComponentName}.usage.md
    └── {ComponentName}.spec.ts
```

## 신규 후보 추가 절차
1. ODS 매칭 실패 확인(근거: 어떤 `list_components`/`list_recipes` 쿼리로 못 찾았는지 기록).
2. `_template/` 를 `{ComponentName}/` 로 복사.
3. `*.tsx` 구현 — **색은 `LIGHT_THEME.colors.*`, 타이포는 ODS textStyle, 아이콘/에셋은 @bucketplace/icons·assets**. raw hex/px는 ODS 미매칭분만 허용 + 주석.
4. `*.usage.md` 에 props·상태·do/don't·ODS 토큰 매핑 작성.
5. `*.spec.ts` 에 Playwright 정합성 테스트(토큰 computed 대조 + 상태 + a11y) 작성.
6. `CATALOG.md` 에 등재.
7. 프로토타입(self-contained HTML)에서는 해당 패턴을 이 구현과 **동일 스펙**으로 인라인하고, 출처를 `spec.md §8`/`qa.md` 에 기록.

## self-contained HTML 프로토타입과의 관계
프로토타입 1차 산출물은 self-contained HTML이라 TSX를 직접 import하지 않는다. 그러나 **시각 스펙(토큰·치수·상태)은 이 공통 컴포넌트와 1:1 일치**해야 한다. HTML 인라인 구현은 TSX의 computed 스펙을 그대로 복제하고, Playwright QA(§design-qa-prompt)가 두 산출물의 정합성을 검증한다.
