---
tier: 4
when-to-read: "패키지 화면 작업 시"
size: "~300 tokens"
screen: package
owner: Deeer
---

# 패키지 (package)

오늘의집 패키지 도메인. 현재 이관 범위는 **글린다 패키지할인** 한정 — 서로 다른 카테고리 5개 이상(가구 2개 필수)을 한 패키지로 묶어 추가 할인을 받는 서비스.

---

## 👤 오너십

- **Owner**: Deeer
- **Reviewer**: TBD
- 한 명이 여러 화면을 관리할 수 있음. 오너 확정 시 frontmatter `owner` 와 이 섹션 갱신.

---

## 📂 폴더 구조 (4-서브폴더)

| 서브폴더 | 용도 | 상태 |
|---|---|---|
| `screens/` | 화면 산출물 — package-home / add-product / brand-discount | draft |
| `components/` | 패키지 도메인 컴포넌트·패턴 8종 | draft (product-item-package는 verified) |
| `policies/` | 패키지 디자인 정책 — glinda-package-discount | draft |
| `experiments/` | 이 화면 관련 실험·인사이트 | 🕳️ TBD |

규격은 `../README.md` 참조.

---

## 🗺️ 관련 화면

- 상품 상세페이지 (`product-detail/`) — PDP "패키지담기" 진입. 범위·소유권 추가 확인 필요
- 장바구니 (`cart/`) — 장바구니 → 패키지 담기, maxmerge 트리거와 연결

---

## 📝 메모

- 진입 정책: `policies/glinda-package-discount.md`
- raw ingest 원본: `ohouse-design-context/patterns/_commerce-ingest.md`, `_commerce-ingest-raw.md` (공디님 작성 → Deeer distill)
- 2026-05-21 GitLab `bucketplace-knowledge` 이관 + 잔여 컴포넌트 7종 distill 완료
