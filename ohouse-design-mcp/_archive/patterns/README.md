---
tier: 3
when-to-read: "화면 디자인 중 '이거 전에 본 것 같은데' 싶을 때"
size: "~500 tokens"
owner: 공통 (C 트랙)
---

# Patterns — L2 Cross-Cutting

**여러 도메인에 공통으로 나타나는 패턴**을 기록하는 공간. 도메인 고유 패턴은 `domains/<도메인>/patterns.md`.

---

## 📌 Cross-Cutting 태그란?

화면을 3개 이상 수집하다 보면 "어? 이 빈 상태 처리, 저 도메인에서도 봤는데" 싶은 순간이 옴. 그게 cross-cutting 패턴.

**추출 기준**:
- 2개 이상 도메인에서 동일 문제 → 동일 해결
- 또는 3개 이상 화면에서 반복

**Month 1 단계**: 아직 화면 축적 부족 → `TBD`. W3~W6 본격 추출.

---

## 🧬 패턴 카드 목록 (TBD)

| 카드 | 상태 | 출현 도메인 |
|---|---|---|
| `empty-states.md` | 🕳️ TBD | contents, space-ai, ... |
| `bottom-sheets.md` | 🕳️ TBD | 전 도메인 |
| `loading.md` | 🕳️ TBD | 전 도메인 |
| `error-recovery.md` | 🕳️ TBD | 전 도메인 |
| `confirm-destructive.md` | 🕳️ TBD | shopping, mypage |
| `form-submit.md` | 🕳️ TBD | contents, mypage |
| `pull-to-refresh.md` | 🕳️ TBD | 전 도메인 |
| `infinite-scroll.md` | 🕳️ TBD | contents, shopping |

---

## 📝 패턴 카드 작성 규격

각 파일 프론트매터 + 본문 구조:

```markdown
---
tier: 4
name: 패턴 이름
source-domains: [contents, space-ai]
status: draft | stable
owner: 공통 (C 트랙)
---

## 🎯 언제 쓰는가
(상황 정의)

## ✅ 해결
(UI 접근)

## 🧩 구성 컴포넌트
- @ods-component:X
- @ods-component:Y

## 📸 예시
(도메인별 실제 화면 링크)

## ⚠️ 안티 패턴
```

---

## 🔄 도메인 고유 → Cross-cutting 승격 기준

1. 2개 이상 도메인에서 동일 문제 발견
2. 해결 방식이 80%+ 일치
3. C 트랙 리뷰 + PD 합의
→ 도메인 `patterns.md`에서 이 폴더로 승격

---

## 🔗 관련

- `ods-docs/content/components/` — 컴포넌트 Atoms
- `domains/<도메인>/patterns.md` — 도메인 고유
- `CONVENTIONS.md` — 마커 규칙
