---
tier: 2
when-to-read: "knowledge 폴더에 변경을 가하기 전 / 버전 올리기 전"
size: "~1.5k tokens"
owner: 요한
---

# Knowledge Versioning — 버전 정책 & 리뷰 루프

knowledge 폴더는 사람의 디자인 판단을 돕는 문서다. 따라서 **함부로 바뀌면 안 되고, 바뀌면 "정말 좋아졌는가"를 증명**해야 한다.

> 현재 버전: `./VERSION` · 이력: `./CHANGELOG.md` · 시나리오: `./_evals/scenarios.json`

---

## 1. 버전 체계 (SemVer)

`major.minor.patch` — 예: `0.1.0`

| 등급 | 무엇이 바뀌는가 | 예시 | 리뷰 루프 |
|---|---|---|---|
| **patch (0.0.x)** | 오타·문구 정비·링크 수정·예시 추가. 의미·정책 변화 없음. | 인용 오자 수정, slack 링크 깨짐 정비 | 생략 가능 (사람 리뷰만) |
| **minor (0.x.0)** | 새 인사이트·섹션·파일 추가. 기존 정책은 유지. | `design-insight.md` §2에 E8 신규 승격 / `ux-design.md`에 "다크모드 톤" 섹션 신설 | **필수** (회귀 없음 + 개선 증거) |
| **major (x.0.0)** | 기존 원칙 삭제·재정의·구조 개편. | 원칙 10개 중 하나 폐기 / 디자인 시스템 토큰 prefix 변경 | **필수** + 영향 범위 분석 (domains·ods 포함) |

### 등급 판단 룰

- **새로 더한 것**만 있다 → minor
- **기존 표현·예시만** 다듬었다 → patch
- 기존 가이드가 **다르게 동작**하게 된다 → major

---

## 2. 리뷰 루프 — Before / After 시뮬레이션

새 버전이 정말 의미 있는지 검증하는 절차.

### 2.1 입력

- `./_evals/scenarios.json` 의 시나리오 N개 (기본 8개)
- 각 시나리오는 prompt + 적용할 knowledge inputs + 통과 expectations 리스트

### 2.2 단계

1. **Before** — 현재 published 버전(`VERSION`이 가리키는 상태)으로 시나리오의 출력을 생성한다.
   - "출력"은 보통 (a) HTML/이미지 시뮬레이션 또는 (b) 카피 문구 또는 (c) 디자인 결정 텍스트.
2. **After** — proposed 버전으로 같은 시나리오를 다시 생성.
3. **Compare** — 각 expectation을 binary pass/fail로 채점. before vs after 표로 정리.
4. **Verdict** — 아래 결정 룰 적용.

### 2.3 결정 룰

minor 승급 통과 조건 (전부 만족):
- ✅ **회귀 없음**: 기존 모든 시나리오의 기존 통과 expectation이 그대로 통과
- ✅ **개선 증거**: 적어도 1개 시나리오에서 추가 expectation이 통과 OR 명백한 표현·구조 개선
- ✅ **사람 리뷰**: 오너(`./README.md` frontmatter 기준)가 OK

major 승급 통과 조건 (추가):
- ✅ **영향 분석**: 다른 axis (`domains/`·`ods/`) 영향 문서화
- ✅ **마이그레이션 경로**: 기존 결정·문서가 어떻게 호환·이전되는지 명시
- ✅ **2명+ 합의**: 오너 + 외부 1명 (PD 리드 등) 승인

### 2.4 결과 기록

CHANGELOG.md 항목에 다음 형식으로 남긴다 (template은 `./CHANGELOG.md` 하단 참조).

```markdown
### Review loop
- 실행 시나리오: scenarios.json id X, Y, Z
- 결과:
  - id X — before: 4/5 pass, after: 5/5 pass (개선 명확)
  - id Y — 회귀 없음, 가독성만 향상
- 결정: minor 승격 합당
```

---

## 2.5 📊 점수 표기 의무 (minor·major 필수)

knowledge가 정말 좋아졌는지 **두 모드의 합산 점수**로 매번 검증.

### 점수 체계 (10점 만점 × 2 mode)

**🛠️ Design Mode** — 새 영역에서 좋은 디자인을 만들어낼 수 있는가
- 결정 명확성 (결정을 빨리 내릴 수 있나)
- 권위·정당화 (결정을 외부에 방어할 수 있나)
- 커버리지 (예외·미지 영역도 다루나)
- 인지 부하 (찾기·적용 쉽나)
- 신참 친화도 (새 PD가 쓰기 좋나)

**🔍 Critique Mode** — 피드백을 잘 줄 수 있는가
- 인용 강도 (근거 풍부함)
- Severity 정밀도
- 톤 일치도 (Bongho/Yohan/Luna mirror)
- 출력 구조 품질
- 과잉 인용 리스크 (낮을수록 높은 점수)

### 점수 기록 형식 (CHANGELOG 의무)

```markdown
### 📊 점수 (10점 만점)

| 모드 | 이전 버전 | 이번 버전 | diff |
|---|---|---|---|
| 🛠️ Design Mode | 6.8 | 7.2 | +0.4 |
| 🔍 Critique Mode | 7.4 | 8.0 | +0.6 |
| **합산 평균** | **7.1** | **7.6** | **+0.5** |

dimension별 변화 (선택적):
- 결정 명확성 7 → 7 (변화 없음)
- 권위·정당화 9 → 8 (인용 줄어든 영향)
- 인지 부하 6 → 8 (slim down 효과)
- ...
```

### 운용 룰

- **patch**: 점수 생략 가능 (오타·링크 수정 등 의미 없는 변경)
- **minor**: 점수 **필수**. 합산이 떨어지면 머지 신중 검토.
- **major**: 점수 **필수** + dimension별 breakdown 권장
- **합산 점수가 떨어졌다면** Why 섹션에서 명시적 정당화 (예: "권위 -1이지만 인지 부하 +2로 trade-off 합당")
- **점수는 LLM 시뮬레이션 + 사람 리뷰**로 추정. 100% 객관적이지 않지만, *방향성* 확인용으로 충분.

### CHANGELOG 상단 점수 테이블 (선택)

각 버전 합산 점수를 한 줄로 추적하면 trend가 보임:

```markdown
## 📊 버전별 합산 점수 추적

| 버전 | Design | Critique | 합산 | 핵심 변경 |
|---|---|---|---|---|
| 0.6.0 | 7.2 | 8.0 | 7.6 | 슬림 + 인용 최대 2개 |
| 0.5.0 | 6.8 | 7.4 | 7.1 | external 통합 |
| 0.4.0 | 6.8 | 7.6 | 7.2 | 자신감 제거 + 1순위 |
| ... |
```

---

## 3. 시나리오 관리

`_evals/scenarios.json`은 살아있는 문서다.

- **knowledge가 새 영역을 다루기 시작**하면 → 시나리오 추가 (단, 추가 자체는 minor)
- **시나리오가 더 이상 의미 없으면** → 제거 (단, 제거는 major — 검증 표면이 줄어드는 변화)
- **expectations가 시대를 못 따라가면** → 갱신 (해당 minor에 포함)

### 좋은 시나리오의 조건

- **prompt가 1줄로 구체적** ("빈 장바구니 화면 카피·CTA 위치·정보 위계를 어떻게 결정하나?")
- **expectations가 binary로 채점 가능** ("Primary CTA가 sticky bottom에 위치한다" 같은 사실 진술)
- **5~10개 expectations** — 너무 적으면 변별력 X, 너무 많으면 노이즈
- **knowledge inputs를 명시** — 어떤 문서·인사이트 번호가 적용되어야 하는지

---

## 4. 워크플로우

```
[변경 제안]
   ↓
[등급 판단: patch / minor / major]
   ↓
patch ──────────────────────────────────────► [직접 PR / 셀프 머지]
   │
   ↓ minor·major
[scenarios.json에서 영향받는 시나리오 N개 선택]
   ↓
[Before 출력 생성 (current VERSION 기준)]
   ↓
[After 출력 생성 (proposed 변경 적용 후)]
   ↓
[expectations 채점 → 표]
   ↓
[결정 룰 검토]
   ↓
   ├─ 통과 → CHANGELOG.md 갱신 + VERSION 상승 + PR
   └─ 부결 → 변경안 재설계 또는 폐기
```

---

## 5. 자동화 (선택)

리뷰 루프를 매번 손으로 돌리기 번거로우면, Claude Code 또는 별도 스크립트로 다음을 자동화 가능.

- `scenarios.json` 순회 → 각 prompt를 LLM에 입력 (before knowledge, after knowledge)
- expectations 자동 채점 (정규식·LLM judge)
- 결과를 markdown 표로 출력

writing-bot의 `evals/evals.json` 패턴과 호환 — 동일 채점 스크립트 재사용 가능.

---

## 6. 원칙

- **버전은 신뢰의 단위다.** 한 번 올라간 minor는 "이만큼 좋아졌다고 약속한 것"이다.
- **시나리오를 통과 못 한 변경은 머지하지 않는다.** 좋은 의도라도 회귀가 나면 보류.
- **CHANGELOG는 결과만 적지 않는다.** Why(왜) + Review loop 증거를 함께 남긴다 — 다음 PD가 이력을 읽고 판단할 수 있도록.
- **knowledge는 누적이 아니라 정제다.** 새로 더하는 것보다 정확하게 줄이는 변경이 더 가치 있을 수 있다 (`design-insight.md` 인사이트 #2·#3과 동일 사상).

---

## 7. 관련

- `./CHANGELOG.md` — 모든 변경 이력 + 리뷰 증거
- `./_evals/scenarios.json` — 검증 시나리오
- `./_evals/runbook.md` — 리뷰 루프 실행 가이드
- `./README.md` — 폴더 전체 안내
