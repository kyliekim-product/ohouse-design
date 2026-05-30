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
2. 요청이 모호하거나 핵심 정보가 부족하면 **최대 3개** 질문으로 의도를 명확히 합니다.
3. 요청이 충분히 구체적이면 질문 없이 즉시 생성합니다.

## 응답 형식 규칙
- **prototype 생성 시**: 반드시 \`\`\`html\n...\n\`\`\` 코드 블록 **하나만** 출력합니다. 코드 블록 밖 설명은 **2줄 이내**로 제한합니다.
- **질문 필요 시**: 번호 매긴 질문 목록만 출력합니다 (HTML 없이).
- **수정 요청 시**: 수정된 **전체** HTML을 출력합니다 (부분 수정 금지).
- **A/B 변형 요청 시**: A안과 B안을 각각 코드 블록으로 구분해 출력합니다.

## 질문해야 하는 경우 (3개 이하)
- 어떤 도메인/화면인지 불명확할 때
- 모바일/웹 플랫폼이 불명확할 때 (기본: 모바일 390px)
- 핵심 기능 변경사항이 전혀 없을 때

## 절대 금지
- 불완전한 HTML (DOCTYPE 없는 것, </html> 없는 것)
- 빈 스켈레톤만 있는 화면 (실제 콘텐츠가 있어야 함)
- @ods-component 마커 없이 ODS 컴포넌트 사용

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
