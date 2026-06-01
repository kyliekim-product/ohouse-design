// ohouse-design-mcp 지식을 읽어 Playground 시스템 프롬프트를 조합합니다.
// 서버 엔드포인트(/api/playground)에서 호출되며, 첫 요청 후 in-memory 캐시됩니다.

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { load as yamlLoad } from 'js-yaml';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ohouse-design-mcp 루트 — repo.js와 동일한 탐색 로직
function resolveMcpRoot() {
  const candidates = [
    resolve(__dirname, '../../../ohouse-design-mcp'),
    resolve(__dirname, '../../../product-design'),
    resolve(__dirname, '../../../product design'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}
const MCP_ROOT = resolveMcpRoot();

function safeRead(path) {
  try { return readFileSync(path, 'utf8'); } catch { return null; }
}

function safeYaml(path) {
  const raw = safeRead(path);
  if (!raw) return null;
  try { return yamlLoad(raw); } catch { return null; }
}

// ─── 1. 디자인 원칙 ───────────────────────────────────────────────
function loadPrinciples() {
  const raw = safeRead(join(MCP_ROOT, 'knowledge/principles.md'));
  if (!raw) return '(principles.md 없음)';
  // frontmatter 제거, 본문만 반환
  return matter(raw).content.trim();
}

// ─── 2. ODS 컴포넌트 목록 ─────────────────────────────────────────
function loadOdsComponents() {
  const baseDir = join(MCP_ROOT, 'ods/content/components');
  if (!existsSync(baseDir)) return [];

  return readdirSync(baseDir)
    .filter((name) => !name.startsWith('.') && !name.startsWith('_'))
    .flatMap((name) => {
      const meta = safeYaml(join(baseDir, name, 'meta.yaml'));
      if (!meta) return [];
      return [{
        id: meta.id || name,
        title: meta.title || name,
        description: meta.description || '',
        aliases: (meta.aliases || []).join(', '),
        status: meta.status || 'published',
      }];
    });
}

// ─── 3. Semantic 토큰 (이름 + 역할만) ────────────────────────────
function loadSemanticTokens() {
  const data = safeYaml(join(MCP_ROOT, 'ods/content/foundations/semantic-tokens/tokens.yaml'));
  if (!data?.tokens) return {};
  return Object.fromEntries(
    data.tokens.map((t) => [t.name, t.role || t.implementation || ''])
  );
}

// ─── 4. 팔레트 토큰 (gray + genuineBlue + red 핵심 스케일만) ─────
function loadPaletteTokens() {
  const data = safeYaml(join(MCP_ROOT, 'ods/content/foundations/palette-tokens/tokens.yaml'));
  if (!data?.tokens) return {};
  const key_scales = new Set([50, 100, 150, 200, 300, 350, 400, 450, 500, 600, 700, 800, 850, 900, 950]);
  const key_families = new Set(['gray', 'genuineBlue', 'red', 'white', 'black']);
  return Object.fromEntries(
    data.tokens
      .filter((t) => key_families.has(t.family) && (t.scale == null || key_scales.has(t.scale)))
      .map((t) => [t.name, t.value?.hex || ''])
  );
}

// ─── 5. CONVENTIONS 핵심 (마커 규칙 + 금지사항) ──────────────────
function loadConventions() {
  const raw = safeRead(join(MCP_ROOT, 'CONVENTIONS.md'));
  if (!raw) return '(CONVENTIONS.md 없음)';
  // 마커 섹션과 금지 섹션만 추출
  const lines = matter(raw).content.split('\n');
  const sections = ['🏷️ 주석 마커', '❌ 금지 사항', '🎯 화면 산출물'];
  let inSection = false;
  const result = [];
  for (const line of lines) {
    const isHeader = sections.some((s) => line.includes(s));
    if (isHeader) { inSection = true; result.push(line); continue; }
    if (inSection && line.startsWith('## ') && !sections.some((s) => line.includes(s))) {
      inSection = false;
    }
    if (inSection) result.push(line);
  }
  return result.join('\n').trim();
}

// ─── 6. 기존 prototype 패턴 (CSS vars 섹션만) ────────────────────
function loadExamplePrototypes() {
  const domainsDir = join(MCP_ROOT, 'domains');
  if (!existsSync(domainsDir)) return [];

  const examples = [];
  const domains = readdirSync(domainsDir).filter((n) => !n.startsWith('.'));

  for (const domain of domains) {
    const screensDir = join(domainsDir, domain, 'screens');
    if (!existsSync(screensDir)) continue;
    const variants = readdirSync(screensDir).filter((n) => !n.startsWith('.') && n !== 'INDEX.md');
    for (const variant of variants) {
      const htmlPath = join(screensDir, variant, 'prototype.html');
      if (!existsSync(htmlPath)) continue;
      const html = safeRead(htmlPath);
      if (!html) continue;
      // CSS :root 변수 블록만 추출 (디자인 토큰 패턴 학습용)
      const rootMatch = html.match(/:root\s*\{([^}]+)\}/);
      if (rootMatch) {
        examples.push({
          domain,
          variant,
          cssVars: rootMatch[1].trim().split('\n').slice(0, 20).join('\n'), // 상위 20줄만
        });
      }
      if (examples.length >= 3) break; // 최대 3개
    }
    if (examples.length >= 3) break;
  }
  return examples;
}

// ─── Context 조합 (캐시) ─────────────────────────────────────────
let _cache = null;

function buildContext() {
  const principles = loadPrinciples();
  const odsComponents = loadOdsComponents();
  const semanticTokens = loadSemanticTokens();
  const paletteTokens = loadPaletteTokens();
  const conventions = loadConventions();
  const examplePrototypes = loadExamplePrototypes();

  return { principles, odsComponents, semanticTokens, paletteTokens, conventions, examplePrototypes };
}

export function getContext() {
  if (!_cache) _cache = buildContext();
  return _cache;
}

// ─── 시스템 프롬프트 조합 ─────────────────────────────────────────
export function buildSystemPrompt(userContext = '') {
  const ctx = getContext();

  const odsComponentList = ctx.odsComponents
    .map((c) => `- **${c.title}** (\`@ods-component:${c.id.replace('ods.component.', '')}\`): ${c.description}`)
    .join('\n');

  const semanticTokenLines = Object.entries(ctx.semanticTokens)
    .slice(0, 40) // 상위 40개만
    .map(([name, role]) => `--color-${name.replace(/([A-Z])/g, '-$1').toLowerCase()}: /* ${role.slice(0, 60)} */`)
    .join('\n');

  const paletteLines = Object.entries(ctx.paletteTokens)
    .map(([name, hex]) => `--palette-${name.replace('.', '-')}: ${hex};`)
    .join('\n');

  const exampleSection = ctx.examplePrototypes.length > 0
    ? ctx.examplePrototypes.map((e) =>
        `### ${e.domain}/${e.variant}\n\`\`\`css\n${e.cssVars}\n\`\`\``
      ).join('\n\n')
    : '(아직 없음)';

  const contextSection = userContext.trim()
    ? `\n\n## 사용자 제공 컨텍스트 (PRD/기획 초안)\n${userContext.trim().slice(0, 4000)}`
    : '';

  return `당신은 오늘의집(Ohouse) 디자인 시스템 전문 프로토타입 생성 AI입니다.

## 핵심 임무
1. 사용자의 자연어 요청을 받아 ohouse 디자인 패턴에 맞는 **완전한 prototype.html**을 생성합니다.
2. 아래 "질문 트리거" 규칙에 해당할 때만 질문합니다 — 기본값은 즉시 생성입니다.
3. 항상 ohouse 디자인 원칙(아래)과 ODS 규칙을 따릅니다.

## 질문 트리거 (해당할 때만 최대 3개 질문)
질문해야 할 때:
- 도메인과 기능이 **모두** 불명확할 때 (예: "뭔가 화면 만들어줘")
- 완전히 새로운 기능인데 맥락이 0%일 때

즉시 생성해야 할 때 (질문 금지):
- 도메인 **또는** 기능 중 하나라도 명확할 때 (예: "장바구니 빈 상태", "카테고리 리뉴얼")
- 기존 화면 수정/변형 요청일 때
- "바로", "즉시", "질문 없이" 표현이 있을 때
- A/B 변형 비교 요청일 때

## 응답 형식 — 엄수
중요: 채팅에 표시될 자연어 응답과 prototype HTML은 시스템이 분리합니다. 사용자가 읽을 자연어는 짧게 쓰고, HTML은 반드시 \`\`\`html code block 안에만 넣으세요.
자연어 응답은 "작업 결과 요약 본문 + 이어서 진행할 작업을 묻는 꼬리 질문"으로 작성하세요. 작업 결과 요약 본문은 한 버블에 함께 들어갈 수 있도록 1-3문장으로 묶고, 꼬리 질문은 마지막 문장 하나로만 작성하세요. 의미 없는 기호, 빈 code fence, \`\`\`만 단독 출력하는 응답은 금지합니다. "아래 코드/HTML을 확인하세요", "프리뷰에서 확인하세요"처럼 산출물 확인을 지시하는 표현 대신, 요청사항 반영 내용·프로토타이핑 작업 포인트·개선 포인트를 요약하세요.

**prototype 생성 (단일):**
- 코드 블록 앞: 사용자가 이해할 수 있는 1-2문장 자연어 요약
- \`\`\`html ... \`\`\` 블록 1개
- 코드 블록 뒤: 없음

**A/B 변형 비교 요청 시 — 반드시 이 형식:**
\`\`\`
### A안: [한 줄 설명]
\`\`\`html
(완전한 HTML)
\`\`\`

### B안: [한 줄 설명]
\`\`\`html
(완전한 HTML)
\`\`\`
\`\`\`

**질문 시:** 번호 매긴 질문 목록만 (HTML 없이)

**수정 시:** 수정된 전체 HTML 출력 (부분 수정 금지)

## 절대 금지
- 불완전한 HTML (DOCTYPE 없는 것, \`</html>\` 없는 것)
- 빈 플레이스홀더만 있는 화면 (실제 콘텐츠·데이터 필수)
- @ods-component 마커 없이 ODS 컴포넌트 사용
- hex 색상 하드코딩 (:root의 palette 정의 제외)
- 매직 픽셀 (4pt 그리드 스케일 벗어나는 임의 수치)

## Refine 모드 응답 규칙 (엄수)
수정 대상이 명시된 경우(수정 대상: X안), 반드시 해당 안의 HTML **하나만** 반환합니다.
다른 안(A/B/C)을 함께 생성하거나 ### A안: 형식의 다중 변형 응답은 금지입니다.
단일 \`\`\`html ... \`\`\` 블록으로만 응답하세요.

---

## 오늘의집 디자인 원칙
${ctx.principles}

---

## 사용 가능한 ODS 컴포넌트
${odsComponentList || '(컴포넌트 목록 로드 실패)'}

---

## 디자인 토큰 — CSS 변수 (반드시 사용)
### Semantic Tokens (의미 기반 — 실제 컴포넌트에 사용)
\`\`\`css
${semanticTokenLines}
\`\`\`

### Palette Tokens (시스템 레이어 — :root 정의에만 사용)
\`\`\`css
${paletteLines}
\`\`\`

---

## 코드 컨벤션 (CONVENTIONS.md 핵심)
${ctx.conventions}

---

## 기존 Prototype 패턴 (참고)
${exampleSection}
${contextSection}`;
}
