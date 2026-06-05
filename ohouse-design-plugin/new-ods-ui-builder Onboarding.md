# `/new-ods-ui-builder` 사용 가이드

> `/new-ods-ui-builder`는 **Figma 디자인을 ODS 디자인 시스템 기반의 살아있는 HTML 프로토타입으로 변환**하고, **pixel-diff + 구조 검증으로 디자인 일치도를 수치로 보장**하는 Claude Code 스킬입니다.

---

## 목차

1. [`/new-ods-ui-builder`가 해결하는 문제](#1-new-ods-ui-builder가-해결하는-문제)
2. [스킬 설치 (1회만)](#2-스킬-설치-1회만)
3. [4가지 핵심 도구](#3-4가지-핵심-도구)
   - [① checklist.js — 빌드 전 핵심 요소 자동 추출](#-checklistjs--빌드-전-핵심-요소-자동-추출)
   - [② HTML 빌드 — ODS 토큰/아이콘/컴포넌트 적용](#-html-빌드--ods-토큰아이콘컴포넌트-적용)
   - [③ diff-flat.js — alpha 평탄화 픽셀 비교](#-diff-flatjs--alpha-평탄화-픽셀-비교)
   - [④ inspect.js — 구조적 diff 시각화](#-inspectjs--구조적-diff-시각화)
4. [전체 사용 흐름 (5분 투어)](#4-전체-사용-흐름-5분-투어)
5. [부가 기능 — 배치 모드 (여러 화면 + hub 페이지)](#5-부가-기능--배치-모드-여러-화면--hub-페이지)
6. [자주 빠뜨리는 함정 체크리스트](#6-자주-빠뜨리는-함정-체크리스트)
7. [자주 묻는 질문 (FAQ)](#7-자주-묻는-질문-faq)
8. [참고 링크](#8-참고-링크)
9. [지속적인 업데이트 & 문의](#9-지속적인-업데이트--문의)

---

## 1. `/new-ods-ui-builder`가 해결하는 문제

디자이너/PD가 만든 Figma를 HTML 프로토타입으로 옮길 때 매번 같은 문제가 반복됩니다:

- 🎨 **수동으로 옮기면 디자인이 미묘하게 어긋남** — 색, 폰트, 간격, 모서리 둥글기가 한두 픽셀씩 어긋나는데 눈으로는 안 보임
- 🧩 **ODS 토큰/아이콘을 매번 직접 찾아야 함** — `#141414`인지 `#2F3438`인지, 어떤 아이콘 이름인지 매번 검색
- 🔍 **다 만들고 나서야 빠진 요소 발견** — 시트 핸들 바, 체크 아이콘, 검색창 라운드 등 디테일이 누락되어도 픽셀 평균만 보면 통과처럼 보임
- 🤷 **이미지 스크린샷으로 때우면 죽은 프로토타입** — 클릭 불가, 텍스트 검색 불가, 다음 화면 연결 불가

`/new-ods-ui-builder`는 이 4가지를 **Claude Code에서 `/new-ods-ui-builder` 한 줄**로 자동 처리합니다.

### 한 줄 가치

> "Figma 링크를 던지면, **ODS 토큰·아이콘·컴포넌트로 정확히 빌드된 살아있는 HTML + 디자인 일치도 수치 검증**까지 자동으로 받습니다."

---

## 2. 스킬 설치 (1회만)

> ⚠️ 이건 한 번만 설치하면 됩니다. 이후부터는 `/new-ods-ui-builder`만 호출하면 됨.

### Step 1 — zip 받기

Slack/공유 폴더에서 받은 **`new-ods-ui-builder.zip`** (약 140KB) 압축 해제.

### Step 2 — 스킬 폴더로 이동

압축 푼 `new-ods-ui-builder/` 폴더를 다음 경로로 이동:

```bash
~/.claude/skills/new-ods-ui-builder/
```

### Step 3 — 의존성 설치 (1회)

터미널에서:
```bash
cd ~/.claude/skills/new-ods-ui-builder/pixel-diff
npm install
```

> 📦 puppeteer, pixelmatch, pngjs 3개 설치 (약 200MB, 1~2분 소요)

### Step 4 — Figma 토큰 준비

Figma → 우측 상단 프로필 → **Settings** → **Security** 탭 → **Personal access tokens** → **Create new token**

- 권한: **File content (read)** 체크
- 만료: 30일~90일 권장
- 토큰값(`figd_...`) 메모장에 보관

> ⚠️ Figma 토큰은 30~90일 후 만료됩니다. 만료되면 다시 발급해서 사용.

### Step 5 — Claude Code에서 호출

```
/new-ods-ui-builder
```

(Cmd+K 같은 입력창에 입력)

→ 스킬 로드 완료. 이후 Figma URL을 던지면 빌드 시작.

---

## 3. 4가지 핵심 도구

### ① checklist.js — 빌드 전 핵심 요소 자동 추출

**무엇을?** Figma 노드 트리를 자동 분석해서 **"이 화면에 빠지면 안 되는 요소 N개"**를 마크다운 체크리스트로 출력.

**왜 필요한가?** pixel-diff는 "요소 자체가 빠진 경우"를 못 잡습니다 — 시트 핸들 32×4가 빠져도 0.01%, 체크 아이콘 9개가 빠져도 0.13%만 영향. 통계에 묻혀버림.

#### 자동 분류 카테고리 (9개)

- **System UI** — Status Bar / Dim / Sheet Handle / Home Indicator
- **Top Nav** — Standard Top Navigation / Pagination
- **Inputs** — Search Field / Chat Input / Text Field (정확한 cornerRadius/fill 포함)
- **Buttons** — Primary / Secondary Button
- **Chips** — 🌀 Chip × N
- **Selectable** — CheckBox / Radio / Switch
- **Icons** — `[Icon] *`, `[Asset] *` 인스턴스
- **Cards** — Item Module / Carousel Card
- **Other** — Divider / Tag / Badge

각 항목마다 **bbox · fill · cornerRadius · 텍스트** 자동 추출.

#### 효과

체크리스트만 옆에 두고 빌드하면 누락 거의 0건. 가장 강력한 사전 예방 도구입니다.

---

### ② HTML 빌드 — ODS 토큰/아이콘/컴포넌트 적용

**무엇을?** Figma 노드의 실측 좌표 · fill · font · 컴포넌트 정보를 ODS 디자인 시스템 자산으로 렌더링.

#### 자동 처리 내역

- 🎨 **디자인 토큰 자동 매핑** — `Brand/FG/foreground-brand` → `#00A1FF` 등 33개 semantic 색상을 CSS 변수로
- 🔤 **타이포 자동 클래스** — `text-Heading24_Bold`, `text-Body15L24_Medium` 등 64개 자동 생성
- 🎯 **아이콘 184개 SVG 번들** — `data-icon="chevron_right"` 한 줄로 주입
- 🧱 **43개 ODS 컴포넌트 매칭** — Figma 인스턴스의 componentId로 자동 식별 → 권장 DOM 구조로 렌더
- 📝 **헤더 자동 주석** — Figma 프레임명·node-id·URL 자동 포함 (브라우저 탭에서 식별 가능)

#### 절대 금지 사항 (스킬 내부 보호)

❌ 스크린샷을 bg 이미지로 박는 패턴 (`<img class="bg" src="screens/X.png">`)
❌ 토큰 값을 직접 하드코딩 (`#141414`)
❌ 아이콘 SVG를 손으로 그리기

→ 모두 **살아있는 DOM 요소**로 렌더. 텍스트 검색, 번역, 접근성, 클릭 이벤트 모두 동작.

---

### ③ diff-flat.js — alpha 평탄화 픽셀 비교

**무엇을?** Figma 렌더 PNG와 실제 HTML 캡처를 픽셀 단위로 비교, 일치도를 % 수치로 보고.

#### 왜 "flat"이 필요한가?

Figma export는 frame bbox 밖을 **투명(alpha=0)**으로 두는데, HTML body는 보통 흰색입니다. 그게 가짜 diff로 잡혀서 수치가 부풀려짐.

`diff-flat`은 두 PNG를 모두 흰색 위에 평탄화한 뒤 비교 → **진짜 시각 차이**만 측정. 같은 빌드에서 raw diff 12% → flat diff 3% 수준으로 감소.

#### 산출물

- `figma.png`, `actual.png` — 비교 원본
- `diff-flat.png` — 빨간 히트맵 (틀린 픽셀)
- `report-flat.json` — diff 비율 (**합격 판정 기준: `diffRatio ≤ 0.03`**)

---

### ④ inspect.js — 구조적 diff 시각화

**무엇을?** pixel-diff가 못 잡는 **구조적 이슈**를 시각화하는 3종 분석.

#### 산출물 3종

| 파일 | 보여주는 것 |
|---|---|
| `overlay-stripe.png` | figma ↔ actual을 20px 가로 줄무늬로 교차 합성. 요소 시프트가 줄무늬 경계에서 단절로 보임 |
| `region-grid.png` | 화면을 40×40 셀로 나눠 셀별 diff%를 빨간 강도로 표시. **국소 문제 영역 한눈에** |
| `region-report.json` | worst N개 셀의 디자인 좌표 + diff%. "여기 보세요" 가이드 |

#### 효과

전체 diff 평균이 2%여도 특정 셀이 80% 다르면 즉시 발견 → 좌표 짚어서 Figma 노드와 비교 → 수정.

---

## 4. 전체 사용 흐름 (5분 투어)

### 화면 ① — Claude Code에서 스킬 호출

```
/new-ods-ui-builder
```

스킬 로드 완료 메시지 표시.

### 화면 ② — Figma URL 던지기

```
https://www.figma.com/design/{fileKey}/...?node-id=1693-14921
이거 만들어줘
```

→ Claude가 자동으로:
1. **Step 1-2**: Figma API로 노드 트리 + 렌더 PNG 다운로드
2. **Step 3-1**: `checklist.js` 실행 → 핵심 요소 N개 추출
3. **Step 4**: HTML 빌드 (ODS 자산 적용)
4. **Step 5**: `diff-flat.js` 실행 → diff% 측정
5. **Step 5-1**: `inspect.js` 실행 → 구조 분석
6. **Step 6**: diff > 3%이면 worst 셀 좌표 짚어서 수정 → 재실행 (최대 8회)

### 화면 ③ — Figma 토큰 입력

처음에 토큰을 물어봅니다:
```
Figma token이 필요합니다. figd_... 보내주세요.
```

`figd_xxx...` 한 줄 보내면 진행.

> 💡 토큰은 휘발성으로 사용되고 파일에 저장되지 않음.

### 화면 ④ — 결과 보고

빌드 완료 후 자동 보고:

```
✅ Build 완료 — /Users/.../build-1693-14921/

검증 결과:
| 화면 | diff % | 합격 |
|------|--------|------|
| 인트로_1 | 1.42% | ✓ |

사용한 자산:
- 토큰 키 5개
- 아이콘 3개 (chevron_left, x, magnifying_glass)
- ODS 컴포넌트 2개 (Standard Top Nav, Primary Button)

브라우저로 열어드렸어요.
```

### 화면 ⑤ — 수정 요청

원하는 게 다르면 자연어로 요청:
```
"검색창 라운드값 9999로 바꿔줘"
"체크 아이콘 빠졌어"
"제품 카드 색이 달라"
```

→ Claude가 Figma 데이터 다시 확인 → CSS 수정 → diff 재실행.

---

## 5. 부가 기능 — 배치 모드 (여러 화면 + hub 페이지)

> ⚙️ **옵션 기능**. 단일 화면 빌드에는 자동 적용 안 됨.

여러 노드를 한 번에 빌드하고 카드 그리드 인덱스 페이지로 묶을 때 사용.

### 언제 쓰나?

- 인트로 1 → 2 → 3 같은 **시퀀스 화면**
- 온보딩 step 1~5 같은 **흐름 데모**
- 공유용 **데모 모음**

### 사용

```
"이 URL 3개 한 번에 만들어줘:
- https://figma.com/.../node-id=NODE1
- https://figma.com/.../node-id=NODE2
- https://figma.com/.../node-id=NODE3"
```

또는:
```
"이 화면들 만들고 허브 페이지로 묶어줘"
```

### 산출물

- 각 노드별 빌드 폴더 (`build-NODE1/`, `build-NODE2/`, ...)
- 허브 인덱스 페이지 (카드 그리드, 썸네일 + diff% 배지)
- 클릭하면 각 프로토타입으로 이동

### 플로우 연결 (이미지 첨부)

박스+화살표로 "이 버튼 → 저 화면" 표시한 이미지를 첨부하면 → 자동으로 `<a href>` 와이어업해서 클릭 가능한 인터랙티브 플로우로 변환.

---

## 6. 자주 빠뜨리는 함정 체크리스트

스킬 내부 `gotchas.md`에 정리된 19종 함정 중 PD가 자주 경험할 항목:

| # | 함정 | 자동 처리 여부 |
|---|------|---------------|
| #11 | pixel-diff의 구조적 맹점 (요소 누락 못 잡음) | `checklist.js`로 사전 차단 |
| #12 | 시트 라운딩이 안 보이는 함정 (배경 색 대비 필요) | 자동 적용 |
| #13 | iOS 상태바 (SF Pro + SF Symbols) 재현 불가 | Figma PNG export + `mix-blend-mode: multiply` 자동 |
| #14 | ODS 아이콘 `<mask>` 내부 fill 보존 | applyIcons 가드 자동 |
| #15 | Figma 회전된 사각형의 bbox는 회전 후 axis-aligned bbox | 실제 size 사용 |
| #16 | 멀티-fill 이미지의 보이는 이미지는 마지막 fill | 자동 선택 |
| #17 | **시트 드래그 핸들 바 누락** (32×4 #EAEDEF radius 6) | checklist가 강조 |
| #18 | **검색창 cornerRadius가 pill(9999)일 가능성** | checklist가 강조 |
| #19 | **체크박스/체크 아이콘 인스턴스 누락** | checklist가 강조 |

> 💡 **PD가 직접 확인할 거 없음** — 스킬이 사전 차단하거나 알아서 처리.

---

## 7. 자주 묻는 질문 (FAQ)

### Q1. 스킬 설치 후 매번 npm install 해야 하나요?
🙅 **아니요.** 처음 한 번만. 이후엔 `/new-ods-ui-builder` 호출만.

### Q2. Figma 토큰은 어디에 저장되나요?
🔒 어디에도 저장되지 않습니다. 매 빌드마다 한시적으로 입력 → 종료 시 휘발. 만료되면 새로 받으세요.

### Q3. diff %가 5% 나오면 실패인가요?
📊 케이스 바이 케이스:
- 카드 이미지 / 침대 일러스트 등 **이미지 내부 객체 윤곽선** 차이 → 불가피 (Figma 렌더러 vs 브라우저 차이)
- 시트 핸들이 빠짐 / 버튼 색이 다름 → 진짜 이슈, 수정 필요

스킬이 worst 셀 좌표를 알려주면, 어느 카테고리인지 즉시 판단 가능.

### Q4. 디자인이 바뀌면 어떻게 하나요?
🔄 같은 URL을 다시 던지면 새로 빌드. Figma 노드의 최신 상태 반영. (단, 자산 폴더는 수동으로 정리 권장)

### Q5. 진짜 이미지 링크(CDN)로 박을 수 있나요?
🌐 가능합니다. 다만 Figma S3 URL은 **약 30일 후 만료**, 실서비스 CDN URL은 imageRef↔제품 매핑이 필요. 일반적으로 **로컬 파일 권장** (안정성 ↑).

### Q6. 여러 화면을 한 번에 만들 수 있나요?
👥 가능. "이 URL 3개 만들어줘" 식으로 요청. **옵션 기능**이라 단일 화면 빌드에는 자동 적용 안 됨.

### Q7. 다른 사람과 공유하려면?
🔗 **Vercel 배포 추천**:
```bash
cd build-XXX
npx vercel --prod
```
→ `https://my-proto.vercel.app` 같은 영구 URL 생성. Slack/카톡 공유.

### Q8. ODS 토큰이나 아이콘이 업데이트되면?
🔄 스킬 자체를 새 zip으로 교체. `~/.claude/skills/new-ods-ui-builder/assets/` 안의 `design-tokens.js`, `icons.js`, `ods-components-index.json` 3개 파일이 갱신됨.

---

## 8. 참고 링크

스킬 내부 문서 (zip 풀면 다 들어있음):

- `SKILL.md` — 스킬 명세 (Step 1~7 워크플로우)
- `references/components.md` — **43개 ODS 컴포넌트 사용법**
- `references/tokens-usage.md` — 토큰/아이콘 사용 패턴
- `references/gotchas.md` — **함정 19종** (매 빌드 시 점검)
- `references/example-home.html` — 빌드 예시
- `pixel-diff/README.md` — diff 도구 파라미터
- `pixel-diff/checklist.js` — 체크리스트 생성기
- `pixel-diff/diff.js` — 기본 diff
- `pixel-diff/diff-flat.js` — 권장 diff (alpha 평탄화)
- `pixel-diff/inspect.js` — 구조 분석
- `pixel-diff/hub.js` — 배치/허브 페이지 생성

---

## 9. 지속적인 업데이트 & 문의

`/new-ods-ui-builder`는 **계속 개선되고 있는 살아있는 스킬**입니다.

### 🔄 정기 업데이트

- 🎨 **ODS 토큰/아이콘 자동 동기화** — 디자인 시스템이 업데이트되면 zip 새 버전 배포
- 🧩 **빌드 알고리즘 개선** — 실제 빌드 사례에서 발견된 패턴/함정을 계속 추가 (현재 함정 19종, 계속 증가 중)
- 🤖 **워크플로우 자동화** — checklist, diff-flat, inspect, hub 등 도구는 사례가 쌓이면서 정확도 ↑
- 📚 **gotchas.md 확장** — 새로운 디자인 케이스마다 학습된 함정 누적

### 💬 버그 / 요청 사항

사용 중 **버그 발견** 또는 **개선 요청**(예: "이 ODS 컴포넌트가 매칭 안 됨", "이 디자인 패턴에서 diff가 너무 높음", "이 토큰이 없어요" 등)이 생기면 → **수민한 / PD에게 슬랙**으로 알려주세요.

| 카테고리 | 예시 | 연락 |
|---|---|---|
| 🐛 버그 | 빌드 실패, diff 도구 에러, 토큰 만료 silent fail 등 | 수민한 / PD (Slack) |
| ✨ 기능 요청 | 새 ODS 컴포넌트 지원, 새 검증 도구 등 | 수민한 / PD (Slack) |
| 🎨 토큰/아이콘 추가 | ODS에 있는데 스킬에 없는 자산 | 수민한 / PD (Slack) |
| 📐 패턴 함정 | 자주 빠뜨리는 디자인 요소 발견 시 | 수민한 / PD (Slack) |

> 💡 제보 시 **Figma 노드 URL / 스크린샷 / 실제 빌드 폴더 경로**를 같이 주시면 훨씬 빠르게 처리됩니다.

---

**버전**: 2026-06-02 기준 / 함정 19종 / 도구 4개 (checklist · diff-flat · inspect · hub)
