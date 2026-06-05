# htmlviaTrueSource

임의 HTML URL(또는 북마클릿 JSON)을 받아 **prod-동등 프로토타입 + 재사용 컴포넌트 docs + QA 리포트**를 한 번에 생성하는 Claude Code 스킬.
> 소개 요약본(노션): https://www.notion.so/ohouse/HTMLviaTrueSource-36da597878a080b7afdce3a7e5b7f517 — 본 README 와 동기화.

## 요약
- 임의 HTML 페이지 기반으로 **단일 경험 단위(1-depth flow) 프로토타입**을 구성.
- 실제 repo(React·SDUI) 구성을 참조해 **prod 과 99% 동일한 동작**을 하되, 코드 구조와 독립된 **페이지/컴포넌트 공통 룰**을 가진 프로토타입을 생성.
- prod 에만 존재하는 스펙을 재사용 가능한 구조(spec·components·flow-guide)로 추출 + ODS 토큰·컴포넌트 매핑 자동화 + prod 대조 QA 자동화.

## 사전 조건 (필수)
| 항목 | 요구 |
|---|---|
| Node.js | **>= 20.17.0** (`nvm` 권장) |
| Python | **3.x** (임시 HTTP 서버 + JSON 처리) |
| Claude Code | 0.x+ |
| **Playwright MCP plugin** | **필수** — 캡처·measure·QA·설치검증이 의존 |

## 설치
```bash
# 1. 다운로드 — htmlviaTrueSource/ 패키지
# 2. 설치 — ~/.claude/skills/ 아래로 복사
cp -R htmlviaTrueSource ~/.claude/skills/
```

### 3. (모드별 선택) 입력 소스 셋업 — 페이지 유형에 따라 택1
- **모드 A · URL 입력** (public 페이지): 추가 셋업 불필요.
  - (선택) 추출 API 키 등록 시 속도↑: `bash ~/.claude/skills/htmlviaTrueSource/setup-jina.sh`
  - 키 없어도 **무인증 20 RPM** 으로 동작(세션당 1–3회면 충분). 키 저장 우선순위: keychain → `$JINA_API_KEY` → `.env`.
- **모드 B · 북마클릿 입력** (로그인 필요·내부망·관리자·QA env 페이지): 브라우저 세션을 활용해 추출.
  ```bash
  open ~/.claude/skills/htmlviaTrueSource/bookmarklet/install.html
  ```
  → 브라우저에서 "📋 추출하기" 버튼을 북마크바로 드래그(1회) → 대상 페이지에서 클릭 → `~/Downloads/extraction-{slug}.json`.

### 4. (권장) 설치 검증
새 Claude Code 세션에서:
```
htmlviaTrueSource 설치 검증해줘
```
Playwright MCP 기반 5단계 스모크 테스트(사전조건·추출 API·렌더·추출 로직·북마클릿)가 자동 실행.

### 5. (권장) ODS Plugin — 토큰·컴포넌트 QA 정합
```bash
npm config set @bucketplace:registry https://nexus.co-workerhou.se/repository/npm-private/
```
Claude Code Marketplace 에서 `bucketplace-product-design` plugin 활성화. (미연결 시 `@bucketplace/ods-prototype/src/catalog/*.json` 오프라인 카탈로그로 대체)

## 트리거
| 표현 | 동작 |
|---|---|
| "[URL] 프로토타입 만들어줘" / "htmlviaTrueSource 실행" / "[URL] 페이지 분석해서 프리뷰" | 전체 파이프라인 자동 (Step 1.4 ~ 4.7) |
| "extraction-*.json 으로 프로토타입" | 모드 B (북마클릿 JSON) |
| "spec만 다시" / "HTML 재생성" / "QA 다시" | 특정 구간만 재실행 |
| "QA 자가개선" / "디자인 깨짐 재수정" / "qa-history" | Step 4.7 자가개선 루프 |
| "QA 룰 승격" / "공통 가이드에 추가" | Step 4.7c — CR 승격 |
| "htmlviaTrueSource 설치 검증" / "skill 셋업 확인" | 5단계 스모크 테스트 |

## 파이프라인 (Step 1.4 ~ 4.7)
```
URL 입력
 → Step 1.4 Source Resolution Gate (slug→repo 해석·gh 검증·접근체크, 4케이스 라우팅)
 → Step 1.5 Discovery (래퍼체인·leaf·상태머신, 코드렌더=repo 1순위 읽기)
 → Step 1 Spec MD  → Step 2 자산·데이터
 → Step 3.5.0 ODS 컴포넌트 인벤토리 게이트(빌드 전: 추출→ODS 대조→실토큰값 확보)
 → Step 3 재조립(self-contained HTML / ODS React)
 → Step 3.5 ODS-first 검증·치환(이름매핑≠통과·실토큰값 적용)
 → Step 4 Design QA (QAGuide CR-1~CR-11 게이트)
 → Step 4.6 목적 B 산출물(flow-guide.md + components.tsx)
 → Step 4.7 디자인 QA 자가개선 루프(mobile-first 캡처→diff→깨짐 재수정→qa-history→원인분석→공통 CR 승격)
```
- **두-축 ground truth**: 동작·정책·IA·카피 = repo / 시각·토큰·동적데이터 = Playwright 런타임.
- **provenance 정직성**: "prod 99% 동일" 클레임은 repo-grounded 항목만, runtime-fallback 동작은 `inferred`.
- 정본 명세: `SKILL.md`. 공통 QA 규칙: `references/qa-common-rules.md` (CR-1~CR-11).

## 산출물 (`./preview/{slug}/`)
`{slug}.html`(프로토타입) · `spec.md` · `data.json` · `catalog.json` · `assets.json` · `manifest.json`(repo 매핑·provenance) · `qa.md`(1회 측정) · **`qa-history.md`**(자가개선 이력·CR 승격) · `flow-guide.md` · `pattern-rules.md` · `components/*.md` · `qa/`(prod 대조 캡처)
> 아카이브 예시: `~/ohouse-prototypes/` (4 샘플 + README·QAGuide·Components.tsx).

## 제약 (MVP)
- MobileWeb-First(375×812) 최적화.
- 정확한 플로우 구현은 해당 repo read 권한 필요(권한 결손이면 runtime fallback + `inferred` 표기, 추후 re-grounding).
- 외부 로그인(OAuth) 필요 public 페이지는 모드 A 접근 불가 → 모드 B(북마클릿) 사용.

## 산출물 정책
이 스킬의 산출물은 **프로토타입 코드**입니다. 실제 제품 머지 전 담당 FE 가 접근성·상태관리·API 연동·성능·앱 컨벤션을 검토해야 합니다.
