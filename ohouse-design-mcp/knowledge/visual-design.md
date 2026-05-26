---
tier: 1
when-to-read: "오늘의집 비주얼 정체성·스타일을 잡을 때 (모든 생성 작업의 맥락)"
size: "~1.5k tokens"
deps: [./principles.md, ../ods-docs/content/foundations/]
owner: 요한
---

# Visual System — 오늘의집 비주얼 에셋 마스터

> **Google Stitch 표준 / awesome-design-md 스펙 기반.**
> LLM이 오늘의집 UI를 생성할 때 **반드시 먼저** 참조하는 문서.

---

## 🏠 브랜드 정체성

**오늘의집 (OHOUSE)** — 인테리어·라이프스타일 커머스 플랫폼.
"집이라는 공간에서 누구나 영감을 얻고, 자기다운 삶을 설계한다"가 핵심 가치.

**비주얼 원칙 3가지**:
1. **따뜻함(Warm)** — 생활감 있는 톤, 과한 채도 회피
2. **정돈됨(Clean)** — 화이트 스페이스 충분, 정보 위계 명확
3. **영감을 주는(Inspiring)** — 사진·콘텐츠가 1순위, UI는 조연

---

## 🎨 컬러 시스템

> 상세는 `ods-docs/content/foundations/semantic-tokens/tokens.yaml` (+ `palette-tokens/tokens.yaml`) 참조. LLM은 여기서 토큰 이름만 기억.

### 핵심 토큰 (Primary)
- `--color-brand-primary` — 오늘의집 시그니처
- `--color-brand-secondary` — 보조 브랜드
- `--color-surface-default` — 기본 배경 (흰색 계열)
- `--color-surface-subtle` — 약한 배경 (카드, 섹션)
- `--color-text-default` — 기본 텍스트
- `--color-text-subtle` — 보조 텍스트
- `--color-border-default` — 기본 선
- `--color-accent-positive` — 긍정 (할인, 성공)
- `--color-accent-warning` — 경고
- `--color-accent-critical` — 에러, 삭제

**금지**:
- 하드코드된 hex (`#000`, `#FFF` 등) — 반드시 토큰 사용
- BDS 레거시 토큰 — `@bds-component` 주석으로만 허용

---

## 🔤 타이포그래피

> 상세: `ods-docs/content/foundations/typography/` (TBD — ods-docs에 이식 예정)

계층 5단계:
- `--text-display` — 랜딩, 핵심 후킹
- `--text-title-1` / `--text-title-2` / `--text-title-3` — 섹션/카드/서브
- `--text-body` — 본문
- `--text-caption` — 보조/메타
- `--text-label` — 버튼, 태그

**한글 우선**. Pretendard 패밀리. 영문은 동일 폰트 fallback.

---

## 📏 스페이싱 & 그리드

> 상세: `ods-docs/content/foundations/spacing/` (TBD — ods-docs에 이식 예정)

- 8pt 기반 스케일 (`--space-1` = 4px, `--space-2` = 8px, ...)
- 모바일 사이드 패딩: `--space-5` (20px) 기본
- 웹 최대 폭: 1200px 컨테이너

---

## 🎛️ 컴포넌트 사용 원칙

1. **ODS 컴포넌트 있으면 무조건 ODS** (`ods-docs/content/components/`에서 확인)
2. ODS에 없으면 → `ods-docs/content/patterns/` (ODS 표준 패턴) 또는 `domains/<화면>/components/` (화면 전용)에서 기존 구현 찾기
3. 둘 다 없으면 → Tailwind 직접 + `@use-tailwind` 마커
4. **임의 컴포넌트 발명 금지** — 피드백 루프로 요청

---

## 🖼️ 이미지·사진 원칙

- **실사 사진 우선**, 일러스트는 섹션 히어로에만
- 정사각 비율 기본, 콘텐츠 카드는 3:4
- alt 텍스트 필수, 한글

---

## 🎬 모션·인터랙션

- 기본 duration `200ms`, ease-out
- 페이지 전환 `300ms`
- 스켈레톤 로딩 `pulse` 1.5s
- 과한 애니메이션 금지 (1회 세션 3건 이하)

---

## 🌓 다크 모드

- 현재: 라이트 모드 우선, 다크 기본 지원
- 토큰 시스템 이원화 — `--color-*-default` / `--color-*-dark` 자동 매핑
- 하드코드 색상 쓰지 않으면 다크 모드 자동 대응

---

## 📱 플랫폼

- **Web** (Phase 1~2 우선)
- **iOS / Android** (Phase 3 확장)
- 반응형: mobile-first, tablet 768px+, desktop 1024px+

---

## 🎨 크리틱 누적 — 색·뱃지·구분선 실사용 원칙

`#des_pd_design_critique` 2024–2025년 크리틱에서 반복적으로 합의된 비주얼 판단 기준. 전체 근거·인용·슬랙 링크는 `./design-insight.md` §1 인사이트 1~4.

### 색을 절제한다 (design-insight #1)
- **이미 흔한 색은 더 쓰지 않는다** — 오늘의집은 블루가 많다. 블루를 또 쓸 자리면 블랙을 먼저 검토.
- **색으로 위계·구분을 만들지 않는다** — 변별력이 낮고 디자인 룰에 어긋난다 (`principles.md` #4). 영업/운영 같은 구분을 빨강·파랑으로 나누는 식은 지양.
- **배경색은 강조의 적** — 배경색을 깔면 그 위 볼드 텍스트의 contrast가 오히려 떨어진다. 강조가 목적이면 배경색 대신 weight·크기.
- **레드는 의도가 분명할 때만** — "지금 이 정보에 시선을 끌겠다"가 명확할 때(예: 종료 임박 카운트다운)만 정당하다.
- 색상은 반드시 토큰 사용 (위 §컬러 시스템). 하드코드 hex 금지.

### 뱃지·라벨은 형태를 늘리지 않는다 (design-insight #2)
- 새 표기 니즈가 생겨도 **새 뱃지를 만들기 전에 기존 형태로 흡수** 가능한지 본다 (예: 레드 뱃지 → 그레이=무료배송 / 화이트=카드할인으로 재배치).
- 형태가 늘면 제품 복잡도가 오른다. 형태별 사용 케이스를 문서로 정의한다.
  - outline 라벨 — PLP 등 다수 반복 노출
  - black bg 라벨 — 단건 화면(리뷰 등) 강조

### 정보는 1~2개만 강조한다 (design-insight #3)
- 한 요소에 정보가 3개 이상 몰리면 우선순위를 강제로 매겨 1~2개만 강조, 나머지는 건조하게(텍스트만, 또는 weight만).
- 중복·파생 정보(할인가+기존가+할인금액 등)는 압축한다.

### 구분은 디바이더보다 여백 (design-insight #4)
- 영역 구분은 **여백(spacing) 우선**. 디바이더는 여백으로 안 될 때만.
- 디바이더가 꼭 필요한 케이스는 별도 정의해 일관되게 쓴다.

---

## 📚 학계 근거 — Visual Design 이론

오늘의집 비주얼 판단의 외부 학술적 뿌리. 그래픽 디자인·정보 디자인·타이포그래피·색채학의 표준.

### 1. Gestalt 지각 원리 (Wertheimer·Köhler·Koffka, 1920s, Berlin School)

인간이 시각 요소를 어떻게 그룹·관계로 지각하는지의 6대 원칙. 카드·리스트·그리드 레이아웃의 근본 원리.

| 원리 | 정의 | 오늘의집 적용 |
|---|---|---|
| **Proximity** 근접성 | 가까운 요소는 한 그룹으로 인식 | 그룹 구분은 보더보다 여백 (`principles.md` #1 · `ux-design.md` 정보구조) |
| **Similarity** 유사성 | 유사한 색·모양은 한 그룹으로 인식 | 같은 카드 컴포넌트 = 같은 의미 (일관성 #9) |
| **Continuity** 연속성 | 시선이 직선·곡선을 따라 이동 | Z-pattern 카드 피드 (위 정보구조 스캔 패턴) |
| **Closure** 폐쇄성 | 끊긴 도형을 완성된 것으로 인식 | 카드 모서리 라운드만으로도 컨테이너로 인식 — 보더 없어도 됨 |
| **Figure-Ground** 도형-배경 | 전경과 배경의 분리 | 콘텐츠(사진/상품)가 figure, UI는 ground (#1) |
| **Common Fate** 공동 운명 | 같이 움직이는 요소는 한 그룹 | 캐러셀·stagger 애니메이션 |
| **Symmetry / Prägnanz** 대칭·간결 | 가장 단순한 형태로 지각 | 임의 홀수 px·비대칭 레이아웃 지양 |

> 원전: Wertheimer (1923) *Untersuchungen zur Lehre von der Gestalt*. 현대 UX 적용: NN/g 'Gestalt Principles' 시리즈.

### 2. C.R.A.P. — Robin Williams *The Non-Designer's Design Book* (1994)

비전공자도 따라할 수 있는 4대 시각 원칙. 오늘의집 컴포넌트 디테일 검수의 기본.

- **Contrast** 대비 — 다른 것은 명확히 다르게. 비슷하게 만들지 말 것. (밝기·크기·weight)
- **Repetition** 반복 — 일관된 요소(컬러·서체·간격)를 화면 전반에 반복.
- **Alignment** 정렬 — 모든 요소는 시각적 연결선을 갖는다. 임의 배치 금지.
- **Proximity** 근접성 — 관련된 정보는 가깝게, 무관한 것은 멀게.

→ `design-insight.md` #4 (디바이더보다 여백) · `ux-design.md` 정보구조 위계 3원소가 CRAP의 한국식 표현.

### 3. Edward Tufte — *The Visual Display of Quantitative Information* (1983)

데이터 시각화의 표준. UI에서도 "정보 잉크 비율"은 그대로 통한다.

- **Data-Ink Ratio** — 화면 픽셀 중 정보를 전달하는 비율을 최대화. UI 장식(그림자·테두리·배경 색띠)은 줄여라. → `design-insight.md` #3 (정보 1~2개만 강조)
- **Chartjunk** — 의미 없는 시각 노이즈(3D 효과·과한 그라디언트·장식적 일러스트) 금지.
- **Small Multiples** — 같은 형식 카드를 반복해 비교를 쉽게. → ProductCard 그리드의 원리.
- **1+1 = 3** — 두 요소가 만나면 그 사이에 의도 없는 시각 강조선이 생긴다. 인접 요소의 간섭을 의식적으로 통제.

### 4. John Maeda — *The Laws of Simplicity* (MIT Press, 2006)

오늘의집 #1(콘텐츠 우선)·#2(결정 피로)의 사상 원천.

10 Laws: **Reduce · Organize · Time · Learn · Differences · Context · Emotion · Trust · Failure · The One**.

핵심:
- "단순함의 가장 단순한 방법은 사려 깊은 제거이다" — Reduce
- "The One — 가치 있는 단 하나로 환원하라"
- "복잡함이 더 가치 있어 보이게 만들 수도 있다" (Failure) — 단순함이 항상 정답은 아니다. *Clarity over simplicity*.

### 5. 그리드 시스템 — Müller-Brockmann *Grid Systems in Graphic Design* (1981)

스위스 타이포그래피 학파의 정전. 모듈 그리드·gutter·column의 수학적 정합성.

- 모든 요소는 그리드 위에 — 임의 배치 금지
- gutter는 contents flow의 호흡
- 그리드는 자유를 제약하는 게 아니라 의사결정을 줄인다

→ §스페이싱 & 그리드의 근거. design.md §4.3 Grid·§4.2 4의 배수 스케일도 이 사상.

### 6. 타이포그래피 — 표준 저작

| 책 | 저자 | 핵심 |
|---|---|---|
| *The Elements of Typographic Style* (1992) | Robert Bringhurst | 활자의 미세 단위(자간·행간·hanging punctuation)·역사·윤리 — 타이포그래피의 정전 |
| *Stop Stealing Sheep & Find Out How Type Works* | Erik Spiekermann · E.M. Ginger | 실무자를 위한 활자 인식론 |
| *Thinking with Type* (2004) | Ellen Lupton | 문자·텍스트·그리드의 디자인 사용법 |
| *The Crystal Goblet* (1932 에세이) | Beatrice Warde | "타이포그래피는 와인을 담는 투명한 잔 — 내용을 가리지 말라" |
| *The New Typography* | Jan Tschichold | 모던 타이포그래피 운동 |

오늘의집 한글 우선(`principles.md` #3)의 디테일:
- 자간(letter-spacing) `-0.3px` 전역 고정 (design.md §3)
- 행간 1.5~1.7 (한글 가독성)
- `word-break: keep-all` (한국어는 단어 단위 줄바꿈)
- 영문 기준 스케일 그대로 적용 금지

### 7. 색채학 — Bauhaus & 현대

- **Johannes Itten** — *The Art of Color* (1961). 7대 색 대비, 12색 색상환. 색은 따뜻함·차가움·명도·채도·면적의 상호작용.
- **Josef Albers** — *Interaction of Color* (1963). "색은 절대값이 아니라 상대값이다 — 인접한 색이 지각을 바꾼다." → `design-insight.md` #1 (배경색이 강조 텍스트 contrast를 떨어뜨림)의 학문적 근거.
- **Goethe / Munsell / Newton** — 색채 이론 전사. Munsell의 hue/value/chroma 3축은 현대 디자인 토큰의 원형.

→ design.md의 light/dark 토큰 자동 매핑, 시멘틱 토큰(`backgroundCritical` vs hex)이 모두 색의 상대성 원리에 기반.

### 8. 정보 디자인·인터페이스 미학

- **Massimo Vignelli** — *The Vignelli Canon* (2010, 무료 PDF). "Design is one. Discipline is one." 활자 6개로 충분, 그리드는 자유의 토대, 디테일에 광신적이어라.
- **Karl Gerstner** — *Designing Programmes* (1964). 프로그램적·시스템적 디자인의 원형. 디자인 시스템의 사상적 시조.
- **Kenya Hara** — *White* / *Designing Design* (2007/2017). MUJI 아트디렉터. "백색의 농도", 비움의 디자인. 오늘의집 따뜻함·정돈됨 톤과 결이 가까움.

### 9. 한 줄 정리 — 어디서 무엇을 끌어쓰나

| 판단 상황 | 1차 인용 학계 |
|---|---|
| 그룹·여백 결정 | Gestalt (Proximity) + Tufte (Data-Ink) |
| 카드·정렬·반복 | C.R.A.P. (Robin Williams) |
| 색을 줄일지 더할지 | Albers (인접 색의 상대성) + Itten (색 대비) |
| 타이포 사이즈·자간·행간 | Bringhurst / Spiekermann / Lupton |
| 그리드·gutter | Müller-Brockmann |
| 단순화 의사결정 | Maeda *Laws of Simplicity* |
| 비움·여백·톤 | Kenya Hara / Vignelli Canon |

---

## 🔗 관련 문서

- `./principles.md` — UX 원칙 (행동 지침)
- `./design-insight.md` — 크리틱·실험 누적 인사이트 (위 크리틱 섹션의 근거 원천)
- `./ux-design.md` — UX 학계 근거 (Norman·Nielsen·UX 법칙)
- `./principles.md` — 50+ 회사 디자인 시스템 압축
- `../CONVENTIONS.md` — 코드·네이밍 규칙
- `../ods-docs/` — 컴포넌트·토큰 소스 오브 트루스 (Hermes 빌드 원천)
- `../ods-docs/content/patterns/` — ODS 표준 패턴

---

## 📌 TBD (미정, 추가 예정)

- [ ] 오늘의집 로고 사용 규칙 (BI 가이드)
- [ ] 일러스트 스타일 가이드
- [ ] 사진 톤앤매너 가이드
- [ ] 접근성 체크리스트 (WCAG 2.1 AA)
