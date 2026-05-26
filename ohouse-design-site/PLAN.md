---
title: Ohouse Design — 사이트 계획서
created: 2026-05-20
status: active
owner: 요한
stack: Astro 5 + Pretendard
---

# Ohouse Design — 사이트 계획서

## 0. 결정사항 (확정)
| 항목 | 결정 |
|---|---|
| 사이트 이름 | **Ohouse Design** |
| 폴더 | `/Users/yohan.lee/Desktop/Claude_Study/ohouse-design-site/` |
| 데이터 소스 | `Claude_Study/product design/` (스페이스 폴더, SSOT) |
| 스택 | Astro 5 + Pretendard |
| 톤 | Mobbin 그대로 — 라이트 only, 그레이스케일, 액센트=검정 |
| 다크 모드 | 없음 |
| 로고 | `ohouse-design-md/site/ohouse-3d.png` 를 `public/ohouse-3d.png` 로 복사 |

## 1. 역사 / 정리
- `2026-05-14`: atlas/plans/2026-05-vision-site.md 작성 — 초기 기획서 (Mobbin 스타일 도메인→화면 브라우저)
- `2026-05-20`: `ohouse-design-atlas/site/` → `ohouse-design-site/` 로 통째 이동, Mobbin 톤 리뉴얼
- `2026-05-20`: vision-site.md 의 큰 그림을 이 PLAN.md 에 흡수, atlas 폴더 자체는 폐기 (휴지통)
- 이 문서가 SSOT. 이전 vision-site.md / EFFICIENCY.md / reviews 등 atlas 메타는 모두 후순위로 회수됨

## 2. 정보 구조 (sitemap)
```
/                       홈 — 4열 메뉴 (4 도메인 그룹) + 필터 row + 카드 그리드
/d/<domain>             도메인 상세 (Screens / Components / Policies / Experiments 4탭)
/d/<domain>/s/<screen>  Screen 상세 + Copy prompt + 라이트박스 (P5)
/ods                    ODS 탭 (Foundations / Components / Patterns)
/knowledge              지식 4축 (principles / visual / ux / insight)
/knowledge/<slug>       지식 상세
/mcp                    MCP 가이드
/vision                 끝 그림
/asset                  Asset (P5)
```

## 3. 홈 레이아웃 (Mobbin 그대로)
```
┌──────────────────────────────────────────────────────────────┐
│ [🅞로고] Ohouse Design   Design|ODS   ⌕ 검색   🔖 GitHub 👤 │ 헤더 64px
├──────────────────────────────────────────────────────────────┤
│  홈·탐색         커머스        콘텐츠        마이              │ 4열 메뉴
│  ─────          ─────         ─────         ─────            │
│  홈              쇼핑          콘텐츠 상세    마이페이지        │
│  검색            장바구니       인테리어·생활  북마크          │
│  카테고리 홈      상품 상세      3D 방꾸미기   전체페이지       │
│  바이너리 홈      패키지        라이프서비스   멤버십          │
│  집구경          기획전                                       │
├──────────────────────────────────────────────────────────────┤
│ [App|Web]  Latest · Recently updated · Most viewed · All  ≡ │ 필터 row
├──────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐                                   │ 카드 그리드
│ │ [N]  │ │      │ │      │   …                              │ 3 cols
│ │ 📱   │ │ 📱   │ │ 📱   │                                   │
│ └──────┘ └──────┘ └──────┘                                   │
└──────────────────────────────────────────────────────────────┘
```

## 4. 4열 메뉴 매핑 (18 도메인 전체)

| 그룹 | 도메인 (slug) |
|---|---|
| **홈·탐색** (5) | 홈(home) / 검색(search) / 카테고리 홈(category-home) / 바이너리 홈(binary-home) / 집구경(house-tour) |
| **커머스** (5) | 쇼핑(shopping) / 장바구니(cart) / 상품 상세(product-detail) / 패키지(package) / 기획전(promotion) |
| **콘텐츠** (4) | 콘텐츠 상세(content-detail) / 인테리어·생활(interior-life) / 3D 방꾸미기(room-3d) / 라이프서비스(life-service) |
| **마이** (4) | 마이페이지(mypage) / 북마크(bookmark) / 전체페이지(all-page) / 멤버십(membership) |

= 18개 전체 노출

## 5. 메인 유저 시나리오
| # | 시나리오 | 경로 | KPI |
|---|---|---|---|
| **S1** | 빠른 prompt 복사 | 홈 → 카드 hover → [⟳ Copy prompt] | < 15초 |
| **S2** | 신규 PD 온보딩 | 홈 → 4열 메뉴 → 도메인 → Screens 탭 | 5분 |
| **S3** | 유사 화면 참고 | 홈 → 도메인 그룹에서 같은 카테고리 도메인 비교 | 한 화면 |
| **S4** | ODS 컴포넌트 적용 | 헤더 `ODS` 탭 → Component → Copy prompt | 1클릭 |

## 6. 디자인 토큰 (확정)
```css
--c-bg:           #ffffff;
--c-bg-elev:      #f5f5f7;   /* 카드 배경 */
--c-bg-elev-2:    #ececef;   /* 카드 호버 */
--c-border:       #ebebed;
--c-text:         #0a0a0a;
--c-text-muted:   #6b6b75;
--c-text-soft:    #a0a0a8;
--c-accent:       #0a0a0a;   /* 흑백 */
--r-card:         24px;
--r-pill:         999px;
```

## 7. 구현 상태 (2026-05-20)
| Phase | 내용 | 상태 |
|---|---|---|
| **P0** | atlas/site → ohouse-design-site/ 이동, PLAN.md 저장 | ✅ |
| **P1** | 로고 PNG 헤더 적용, 4열 메뉴 = 4 도메인 그룹 매핑 | ✅ |
| **P2** | 도메인 상세 페이지 Mobbin 톤 정렬 (탭 underline, 아이콘 그레이) | ✅ |
| **P3** | Screen 상세 — 라운드 24px, pill 버튼, 액션 정리 | ✅ |
| **P4** | Knowledge/MCP 카드 톤 통일 (bg-elev + r-card), badge--accent 누락 보강 | ✅ |
| **P5** | 라이트박스 (Screen 상세 이미지 확대), Asset 페이지 콘텐츠 채움 | ✅ |

## 8. 다음 액션
- 사용자가 사이트 보고 Mobbin과 다른 부분 피드백
- 도메인 데이터 채우기 (현재 `product design/domains/` 비어있음 — placeholder만)
- 호스팅 결정 (Vercel 추천)
- `screens/INDEX.md` 컨벤션 확정 (§16 #9)

---

## 9. 왜 이 사이트가 필요한가 (배경)

### 팀 피드백 (2026-05)
> "프로젝트를 이해하기 어렵다. 끝 그림을 그려달라."
> "단계로 쪼개자 — 1차는 *프로토타입 쉽게 찾기*, 2차는 *그게 개발에 그대로*."

### 진단
1. **Markdown 만으로는 입문 비용이 높다.** GitHub 폴더 트리를 따라가야 전체 그림이 보임 → 비개발자 PD 진입 장벽.
2. **시각 디자인 산출물이 텍스트로만 표현됨.** 화면 디자인 repo 인데 화면을 *볼 수 없음*.
3. **LLM 활용을 PD 가 직접 시도하기 어려움.** 어떤 prompt 를 줘야 좋은지 모름.

### 사이트가 해결하는 것
- (1) **랜딩 홈** — 한 화면에 18 도메인 + 끝 그림 + 시작 가이드.
- (2) **화면 썸네일** — 직접 보고 비교.
- (3) **Copy prompt** — 클릭 한 번에 "이 화면 만들어줘" prompt 가 클립보드에. Claude/ChatGPT 에 바로 붙여넣기.

### 사이트가 해결하지 *않는* 것
- Repo 자체를 대체하지 않음. **컨텐츠 원본은 여전히 markdown.** 사이트는 *view*.
- Production 디자인 시스템 사이트가 아님 (ODS 의 사람 친화 면은 ods-docs 가 따로 책임).

---

## 10. 사용자 페르소나
| 페르소나 | 빈도 | 목적 |
|---|---|---|
| **PD (Stella, Jenna, …)** | 주 1~3 | 본인 화면 작업 시작점 / 다른 화면 참고 / prompt 복사 |
| **ODS 팀 (Tyler)** | 주 1 | ODS 컴포넌트 사용 현황 파악 |
| **개발자** | 월 1~2 | 화면 명세 확인, prototype 코드 참고 |
| **매니저 / 임원** | 분기 1 | 진행 상황 · 끝 그림 점검 |
| **신규 입사 PD** | 1 회 | 온보딩 |

(§5 의 시나리오 4 개와 함께 읽기. 시나리오에 빠진 5번째 — *MCP 설치*: `MCP` 탭 → ods-hermes 설치 가이드 → npm install · 설정 복사.)

---

## 11. Copy Prompt 명세

### 어디에 붙나
- ✅ 홈 도메인 카드 (썸네일 호버)
- ✅ 도메인 상세의 Screen 그리드
- ✅ Screen 상세 페이지의 큰 [⟳ Copy prompt] 버튼
- ✅ Component 카드 (ODS · 도메인 컴포넌트)
- ✅ Pattern 카드

### 복사되는 prompt 형식 (예: 홈 도메인의 default 화면)
```
오늘의집 [홈] 도메인의 [default] 화면을 만들어줘.

## 화면 컨벤션
domains/home/README.md 의 owner / categories / 정책 적용.

## 사용 컴포넌트 (prototype 마커 기준)
- @ods-component:Button variant=primary size=md
- @ods-component:Card
- @ods-component:Tab
- @missing-ods:CategoryFilter   ← ODS 에 없음. 새 후보.

## 관련 정책
- domains/home/policies/spacing.md
- knowledge/principles.md

## 관련 실험
- domains/home/experiments/card-spacing-ab.md (result: win)

## 산출물 위치
domains/home/screens/default/prototype.html

## 요청
[여기 자유롭게 추가 — 예: 다크모드 변형도 같이 / 빈 상태 추가 / 모바일 반응형 등]
```

### 동작 흐름
1. 버튼 클릭 → `navigator.clipboard.writeText(prompt)`
2. 토스트: "Prompt 복사됨 · Claude/ChatGPT 에 붙여넣으세요"
3. (선택) 호버 시 prompt 미리보기 (모달 또는 툴팁)

### 생성 로직
빌드 시점에 각 `screens/<screen>/README.md` + `prototype.html` 의 마커를 추출해 정적 JSON 으로 저장 → 클릭 시 그 JSON 을 클립보드에. 현 구현: `src/lib/repo.js` 의 `buildPrompt()` 가 런타임에 매번 조립.

---

## 12. 데이터 소스 매핑

| 사이트 element | 출처 | 자동/수동 |
|---|---|---|
| 도메인 목록 | `domains/*/` 폴더 스캔 (없으면 `DOMAIN_LABELS` placeholder) | 자동 |
| 도메인 카드 메타 | `domains/<d>/README.md` frontmatter | 자동 |
| Screen 썸네일 | `domains/<d>/screens/<s>/thumbnail.{png,jpg,webp}` | 수동 (없으면 placeholder) |
| Screen prototype | `domains/<d>/screens/<s>/prototype.html\|tsx` | 자동 |
| 사용 컴포넌트 | prototype 의 `@ods-component:` `@code-connect:` 마커 grep | 자동 |
| 정책 카드 | `domains/<d>/policies/<p>.md` frontmatter | 자동 |
| 실험 결과 | `domains/<d>/experiments/<e>.md` frontmatter `result` | 자동 |
| Last updated | `git log -1 --format=%ai <path>` | 자동 |
| Owner / Reviewer | `domains/<d>/README.md` frontmatter + `OWNERS.md` | 자동 |
| ODS 컴포넌트 | `ods-docs/content/components/*/meta.yaml` | 자동 |
| ODS 컴포넌트 이미지 | `ods-docs/content/components/*/images/` | 자동 |
| Knowledge 페이지 | `knowledge/*.md` 직접 렌더 | 자동 |
| MCP 가이드 | `mcp-servers/*/README.md` + `package.json` | 자동 |
| Categories 매핑 | `domains/<d>/README.md` frontmatter `categories: [...]` 신규 필드 | 수동 (한번만) |

> 데이터 ROOT 는 `Claude_Study/product design/` (스페이스 폴더) 또는 `product-design/` (하이픈) — `src/lib/repo.js` 의 `resolveRoot()` 가 자동 탐색.

---

## 13. 호스팅 · 배포 · 인증

### 후보
| 옵션 | 장점 | 단점 |
|---|---|---|
| **Vercel** (private repo 연결) | 간편, 무료 시작, 자동 PR preview | 외부 서비스, 사내 정책 확인 필요 |
| Netlify | 비슷 | 동상 |
| GitHub Pages (public 미러) | 무료, 공식 | 컨텐츠 public 노출 (내부 자료라면 X) |
| 사내 인프라 (bucketplace) | 정책 적합 | 운영 부담, 도메인·인증 협의 필요 |
| ohouse-design-md 같은 기존 정적 호스팅 활용 | 이미 있음 | 도메인 정리 필요 |

**추천**: Vercel + 사내 인증 게이트.

### 인증
PD 만 본다면 Google SSO (Bucketplace 계정) 게이트 권장. Vercel 이면 Cloudflare Access 같은 reverse proxy 가능.

---

## 14. 단계 로드맵 (1차 / 2차 / 후반)

### 1차 — 사이트 가동 (~2026-06-14)
> 목표: PD 가 사이트에서 **주요 화면 · 프로토타입 HTML 을 쉽게 찾을 수 있다.**

- [x] 사이트 골격 (Astro setup, 라우팅, top nav)
- [x] 홈 (도메인 카드 그리드, 4열 메뉴)
- [x] 도메인 상세 (4 탭 · Mobbin underline)
- [x] Screen 상세 (썸네일 + Copy prompt + 마커)
- [x] **Copy prompt 기능** (Clipboard API + 토스트)
- [ ] 도메인별 `screens/INDEX.md` (Figma 링크 + 프로토타입 위치) — 사이트가 빌드 시 읽음
- [x] Knowledge 4 페이지 (markdown 렌더)
- [x] Vision 페이지 (VISION.md 렌더)
- [x] 기본 디자인 (Pretendard, Mobbin 톤 토큰)
- [ ] 호스팅 결정 + 배포 (내부 공유 가능)

### 2차 — 프로토타입이 개발 입력으로
- [ ] `prototype.tsx` 표준 (React + ODS 토큰 + 트래킹/도메인 컴포넌트)
- [ ] Ohouse Design MCP (`get_screen_for_prototype`, `get_flow`)
- [ ] 도메인 1~2 개 reference 구현 → 개발팀 trial 인계
- [ ] 자연어 플로우 PoC ("장바구니 → 결제")

### 후반 — 사이트가 입력창이 된다
- [ ] ODS 상세 (컴포넌트별 페이지, Figma 이미지)
- [ ] MCP 설치 가이드 페이지 보강
- [ ] Asset 페이지 (정의 후)
- [ ] Pagefind 검색
- [ ] **사이트 안 Claude Code 입력창** → 즉시 수정 → HTML 다운로드
- [ ] 다크 모드 · 다국어 · Analytics

---

## 15. 마일스톤
| 주차 | 기간 | 마일스톤 |
|---|---|---|
| W1 | 5/14 ~ 5/18 | 계획 확정 + Astro scaffold |
| W2 | 5/19 ~ 5/25 | 홈 + 도메인 상세 + Mobbin 톤 리뉴얼 + 폴더 분리 ✓ |
| W3 | 5/26 ~ 6/1 | Screen 상세 + Copy prompt + 마커 추출 빌드 |
| W4 | 6/2 ~ 6/8 | Knowledge / Vision 통합 + 디자인 다듬기 + 배포 |
| W4.5 | 6/9 ~ 6/14 | 팀 피드백 흡수 + 콘텐츠 채움 + 안정화 — **1차 종료** |
| W5+ | 6/15 ~ | 2차 진입 (개발 인계 트랙) |

---

## 16. 미정 사항 (남은 결정)

| # | 항목 | 옵션 | 추천 |
|---|---|---|---|
| 1 | **호스팅** | Vercel / 사내 / GitHub Pages 미러 | Vercel + 사내 인증 |
| 2 | **사이트 도메인 이름** | `ohouse-design.bucketplace.com` / `design.bucketplace.com` / Vercel 기본 URL | 협의 필요 |
| 3 | **Asset 페이지 정의** | 로고 / Figma 라이브러리 / icon set / 템플릿 | placeholder + Phase 2 |
| 4 | **인증** | 무인증 / SSO / IP 제한 | SSO |
| 5 | **사이트 코드 위치 (장기)** | Claude_Study 하위 단일 / 별도 repo / bucketplace org | 별도 repo 후보 |
| 6 | **Copy prompt 호환 모델** | Claude / ChatGPT 양쪽 / Claude 전용 | 양쪽 호환 |
| 7 | **언어** | 한국어 / 한·영 병기 | 한국어 only (MVP) |
| 8 | **이름 정식 확정** | "Ohouse Design" / "Ohouse Design Site" / "오늘의집 디자인 허브" | Ohouse Design (현행) |
| 9 | **`screens/INDEX.md` 컨벤션** | 도메인별 화면 색인 형식 | 1차 종료 전 확정 |

> 결정되면 각 항목을 `§0. 결정사항` 표로 끌어올린다.

---

## 17. 데이터 0% 상태 진단 (2026-05-21)

### 데이터 소스 실측
| 폴더 | 상태 | 비고 |
|---|---|---|
| `product design/domains/` | **0개** | 18 슬러그 마스터는 사이트 상수, 폴더는 비어있음 |
| `product design/ods-docs/content/components/` | **20개** | 각 폴더에 `meta.yaml + guide.md + spec.md` |
| `product design/ods-docs/content/foundations/` | 2개 | palette-tokens, semantic-tokens |
| `product design/ods-docs/content/patterns/` | 1개 | product-card |
| `product design/mcp-servers/` | 2개 | ods-hermes, ods-prototype |
| `product design/knowledge/` | 4개 | 사이트가 이미 읽고 렌더 중 |
| `product design/_meta/VISION.md` | 있음 | /vision 작동 |

### 시나리오 5개 × 현재 달성도

| # | 시나리오 | 현재 상태 | 막힌 곳 |
|---|---|---|---|
| **S1** | 빠른 prompt 복사 (홈 카드 hover) | ❌ | DomainCard 가 `firstScreen` 없으면 Copy 버튼 자체를 안 그림 (`{prompt && ...}` 조건) |
| **S2** | 신규 PD 온보딩 (도메인 → Screens) | ❌ | 도메인 페이지 4 탭 전부 EmptyState. 볼 게 없음 |
| **S3** | 유사 화면 비교 (그룹 안에서 비교) | ❌ | 그룹별 보기 UI 없음. 카드 자체에 그룹 라벨도 없음 |
| **S4** | ODS 컴포넌트 적용 | ❌ | /ods 가 placeholder. 20 컴포넌트 데이터는 있는데 안 읽고 있음 |
| **S5** | MCP 설치 가이드 | ⚠️ | UX 흐름은 작동. 실제 ods-hermes/ods-prototype README 발췌·정확성 미검증 |

**총평**: 골격 100%, 컨텐츠 0%. 5개 중 1개(S5)만 부분 성공. 데이터 채우기 없이 시나리오 검증 자체가 불가능.

### 핵심 통찰
1. **이미 있는 데이터를 안 읽고 있다** — ODS 20개는 즉시 노출 가능. 비용은 `repo.js` 함수 추가뿐. **최저비용 최고가치**.
2. **domains 만 진짜로 비어있다** — 이건 PD가 채워야 하지만, 사이트가 *채우는 과정을 도와줄 수* 있음.
3. **"사이트가 자기 자신을 채운다"** — Copy prompt 의 진짜 활용처: 화면 만들기뿐 아니라 *도메인 README 만들기 prompt* 도 제공. PD가 사이트에서 1클릭으로 받은 prompt → Claude → 폴더 구조 + 첫 화면 생성 → commit → 사이트 자동 반영. 이게 §9 "Copy prompt" 의 진짜 형태.

---

## 18. 데이터 채우기 전략 (Phase A / B / C)

### Phase A — 이번 주 (~2026-05-27): 즉시 가치 최대화
**핵심**: 이미 있는 데이터 노출 + 빈 도메인이 "PD에게 길 안내" 역할.

1. **/ods 진짜 구현** (S4 해결, 최우선)
   - `repo.js` 에 `getOdsComponents()` / `getOdsFoundations()` / `getOdsPatterns()` 추가
   - ods-docs/content/* 의 meta.yaml + guide.md 스캔 → 카드 그리드
   - `/ods/c/<slug>` 컴포넌트 상세 (guide.md 렌더 + spec.md 탭 + Copy prompt)
   - buildPrompt({kind:'component'}) 진짜 구현 — Storybook · Figma URL 포함
   - **예상 작업량**: 0.5일

2. **DomainCard fallback prompt** (S1 부분 해결)
   - 빈 도메인 카드에도 Copy prompt 노출
   - prompt 내용: "오늘의집 [{도메인}] 도메인 폴더를 새로 만들어줘. README.md frontmatter (owner/categories), screens/default/ 1개, prototype.html placeholder 까지 — 이 사이트 빌드에 바로 반영되도록 컨벤션은 …" (메타-prompt)
   - **예상 작업량**: 0.5일

3. **도메인 페이지 Getting Started** (S2 부분 해결)
   - EmptyState 위에 "이 도메인 채우기 — 3단계" 카드
   - "도메인 prompt 받기" (위 메타-prompt) + "screens/INDEX.md 템플릿 받기" + "thumbnail 추가 가이드"
   - **예상 작업량**: 0.5일

4. **MCP 페이지 정확성 검증** (S5 완성)
   - mcp-servers/<slug>/README.md 와 package.json 발췌
   - 설치 prompt 실제 패키지명/명령어로 교체
   - **예상 작업량**: 0.3일

> **A 마치면**: S4 정상, S1/S2 메타-prompt 형태로 작동, S5 정확. 도메인 페이지 자체가 PD의 "다음 액션 가이드"가 된다.

### Phase B — 다음 주 (~2026-06-03): 시드 도메인 + 그룹 비교

5. **시드 도메인 1개 풀세트** — `home` 또는 `shopping`
   - README.md (owner, categories, description)
   - screens/default + screens/empty-state (각각 README + thumbnail.png + prototype.html)
   - components/ 1개 (예: `category-filter` = @missing-ods 마커 시연)
   - policies/spacing.md
   - experiments/card-spacing-ab.md (result: win)
   - **목적**: S2 진짜 검증. 다른 PD가 자기 도메인 채울 때 ctrl+c 템플릿.

6. **도메인 그룹 페이지** `/g/<group>` (S3 해결)
   - 4 그룹 (홈·탐색 / 커머스 / 콘텐츠 / 마이)
   - 같은 그룹 도메인 카드를 한 화면에 나열 (홈보다 narrow, 비교 강조)
   - 도메인 페이지 사이드바에 "같은 그룹" 도메인 링크
   - DomainCard 에 그룹 라벨 (작은 라벨, 카드 위)

7. **온보딩 페이지** `/start` (S2 깊이)
   - "처음이세요? 5분 투어"
   - 4 시나리오 흐름을 실제 페이지 링크로 시연
   - 홈 상단에 "처음이라면 →" 안내

### Phase C — 그 다음 (~2026-06-14): 1차 종료 준비

8. **screens/INDEX.md 컨벤션 확정** (§16 #9)
   - Figma 링크 + 프로토타입 위치 + 마지막 검토자
   - 사이트가 빌드 시 읽어 도메인 페이지 상단에 표시

9. **카테고리 우선순위 도메인 확장** — Phase B 시드를 템플릿으로
   - 커머스 3개 (shopping, cart, product-detail) 풀세트
   - 마이 1개 (mypage) 풀세트
   - 콘텐츠 1개 (content-detail) 풀세트

10. **검색** (Pagefind 추가) + **호스팅 결정/배포** (§13)

---

## 19. 이번 주 즉시 실행 (Phase A 우선순위)

| 순서 | 작업 | 이유 |
|---|---|---|
| 1 | /ods 컴포넌트 카탈로그 + 상세 | 데이터 풍부 + S4 해결 가장 빠름 |
| 2 | DomainCard fallback prompt (메타-prompt) | S1 부활 + 사이트가 self-serve 도구로 격상 |
| 3 | 도메인 페이지 Getting Started 카드 | S2 부분 해결 + PD 셀프서비스 흐름 명문화 |
| 4 | MCP 페이지 ods-hermes/ods-prototype 실측 발췌 | S5 정확성 + 신뢰도 |
| 5 | (시간 남으면) 시드 도메인 home 풀세트 | S2 진짜 검증 + Phase B 템플릿 |

> 1~4 합쳐 ~2일. 이걸 끝내면 5개 시나리오 중 4개가 "데모 가능" 상태. 그 다음 사용자 피드백 → Phase B.
