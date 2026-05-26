---
tier: 2
when-to-read: "작업 유형 → 로드 대상 매핑이 필요할 때"
size: "~500 tokens"
deps: [CLAUDE.md]
owner: 요한
---

# Decision Tree — 작업 유형 → 로드 대상

LLM이 사용자 요청을 받았을 때 **어느 폴더·파일을 로드할지** 결정하는 규칙.

---

## 🌳 1단계: 작업 유형 분류

```
사용자 요청
 ├── 디자인 원칙/철학 질문?           → A
 ├── 특정 컴포넌트 사용법 질문?       → B (ODS) / B' (화면 컴포넌트)
 ├── 새 화면 디자인 요청?             → C
 ├── 기존 화면 수정 요청?             → D
 ├── 패턴/재사용 단위 찾기?           → E
 ├── 화면 정책 확인?                  → P
 ├── 실험/인사이트 조회?              → F
 └── ODS에 없는 것 요청?              → G (피드백 루프)
```

---

## 🎯 케이스별 로드

### A — 원칙/철학 질문
로드: `knowledge/principles.md` + `knowledge/visual-system.md`
**Skip**: ods, domains

### B — ODS 컴포넌트 사용법
로드: `ods-docs/content/components/<kebab>/meta.yaml` + `spec.md`
**Skip**: `guide.md` (사용 가이드·예시 필요할 때만 추가 로드)

### B' — 화면 컴포넌트 사용법
로드: `domains/<화면>/components/<kebab>/meta.yaml` + `spec.md`
**전제**: 어느 화면인지 알아야 함. 모르면 사용자에게 확인.

### C — 새 화면 디자인
로드 순서:
1. `knowledge/visual-system.md` + `knowledge/principles.md` (맥락)
2. `domains/<화면>/README.md` (화면 컨벤션·오너)
3. `domains/<화면>/policies/INDEX.md` → 관련 정책만 (전사 원칙 override 확인)
4. `ods-docs/content/components/` 디렉토리 훑기 → 필요한 컴포넌트만 개별 로드
5. (필요 시) `domains/<화면>/components/INDEX.md` — 화면 전용 컴포넌트·패턴
6. (필요 시) `ods-docs/content/patterns/` — ODS 표준 패턴
7. 같은 화면 기존 `screens/` 2~3개 README.md 참고

### D — 기존 화면 수정
로드:
1. `domains/<화면>/screens/<screen>/README.md` + `prototype.html|tsx`
2. 사용 컴포넌트 마커(`@ods-component`/`@domain-component`)로 필요한 것만 추가 로드
3. 원칙 충돌 판단 시 `knowledge/principles.md` + 화면 `policies/`

### E — 패턴 찾기
1. `ods-docs/content/patterns/` — ODS 표준 패턴 먼저 확인
2. 없으면 → `domains/<화면>/components/INDEX.md` 에서 화면 전용 컴포넌트·패턴 탐색
3. 둘 다 없으면 → 새 컴포넌트/패턴 후보 (화면 안 2화면+ 반복 시 카드화)

### P — 화면 정책 확인
로드: `domains/<화면>/policies/INDEX.md` → 관련 카드
- frontmatter `overrides`가 있으면 전사 원칙보다 우선
- 정책 없으면 전사 `knowledge/principles.md`로 폴백

### F — 실험·인사이트 조회
로드: `domains/<화면>/experiments/INDEX.md` → 카드 (Tier 5, 명시 요청 시만)
- `result: win`만 보고 싶으면 INDEX에서 필터

### G — ODS 미대응 요청 (피드백 루프)
1. `ods-docs/content/components/`, `ods-docs/content/patterns/` 둘 다 없음 확인
2. `domains/<화면>/components/` 화면 전용에도 없음 확인 (가까운 화면 1개만)
3. `@missing-ods:<설명>` 또는 `@domain-component:<신규>` 마커 삽입
4. Tailwind 임시 구현 + `@use-tailwind` 마커

---

## 🤔 모호한 요청 처리

"콘텐츠 홈 디자인해줘" — 도메인 명시 없음? → C + 콘텐츠 도메인
"좀 더 깔끔하게" — 원칙 참조 → A
"ODS로 만들 수 있어?" — B + INDEX.md로 탐색

---

## 📏 토큰 예산 원칙

**하나의 세션에서 같은 파일 2번 로드 금지** — 이미 컨텍스트에 있으면 참조.

**의심스러울 땐 작게** — 필요하면 추가 로드. 선제적 로드 지양.
