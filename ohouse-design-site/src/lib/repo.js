// repo 의 markdown 컨텐츠를 사이트에서 읽기 위한 헬퍼.
// node 환경에서 build / dev 시점에 호출됨.

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { marked } from 'marked';
import yaml from 'js-yaml';
import { getOdsComponents } from './ods-content.js';

// 사이트는 ohouse-design-site/ 에 살고, 콘텐츠는 Claude_Study 의 SSOT 에서 읽는다.
// 폴더 이름이 'product-design' 또는 'product design' (스페이스) 둘 다 허용.
function resolveRoot() {
  const candidates = [
    // 현재/미래 레이아웃 공통: 사이트 폴더의 형제 ohouse-design-mcp/ 가 SSOT.
    resolve(import.meta.dirname, '../../../ohouse-design-mcp'),
    resolve(import.meta.dirname, '../../../docs'),
    resolve(import.meta.dirname, '../../../product-design'),
    resolve(import.meta.dirname, '../../../product design'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return candidates[0];
}
const ROOT = resolveRoot();

function resolveContextRoot() {
  const candidates = [
    process.env.OHOUSE_DESIGN_CONTEXT_ROOT,
    resolve(import.meta.dirname, '../../../../ohouse-design-context'),
    resolve(import.meta.dirname, '../../../ohouse-design-context'),
    // ensure-context.mjs 가 채우는 관리 캐시 (env·형제 폴더가 없을 때)
    resolve(import.meta.dirname, '../../.context/ohouse-design-context'),
  ].filter(Boolean);
  for (const p of candidates) {
    if (existsSync(join(p, 'tracks'))) return p;
  }
  return candidates[0];
}
const CONTEXT_ROOT = resolveContextRoot();

function resolveSiteBase() {
  const baseFromArg = process.argv.find((arg) => arg.startsWith('--base='));
  const baseFromSplitArg = process.argv.includes('--base')
    ? process.argv[process.argv.indexOf('--base') + 1]
    : null;
  return process.env.SITE_BASE || process.env.PAGES_BASE || baseFromArg?.slice('--base='.length) || baseFromSplitArg || '/';
}

// base path (사내 /deploy, preview sub-path 대응). 항상 끝에 '/' 가 오도록 정규화.
const BASE = resolveSiteBase().replace(/\/+$/, '') + '/';

// base + 경로 결합 (중복 슬래시 방지). path 는 'thumbnails/...' 처럼 슬래시 없이 시작.
function withBase(path) {
  return BASE + String(path).replace(/^\/+/, '');
}

// linked_yaml_components 이름을 ODS 카탈로그(slug/title)와 정규화 비교해 ODS slug 로 해석. 미매칭 null.
export function resolveOdsSlug(name, catalog) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const target = norm(name);
  if (!target) return null;
  for (const c of catalog) {
    if (norm(c.slug) === target || norm(c.title) === target) return c.slug;
  }
  return null;
}

// history.md 의 상대경로 이미지(<img src="./x.png">)를 public/screen-history 서빙 경로로 치환.
// 외부(http/protocol-relative)·절대(/)·data URL 은 그대로 둔다.
export function rewriteHistoryImages(html, domainSlug, screenSlug) {
  return String(html).replace(/(<img\b[^>]*?\bsrc=")([^"]+)(")/g, (m, pre, src, post) => {
    if (/^(https?:)?\/\//.test(src) || src.startsWith('/') || src.startsWith('data:')) return m;
    const basename = src.replace(/^\.\//, '').split('/').pop();
    return pre + withBase(`screen-history/${domainSlug}/${screenSlug}/${basename}`) + post;
  });
}

// 사이트 정적 자산 루트 (ohouse-design-site/public). static 빌드에선 여기 있는 파일만 URL 로 서빙됨.
const SITE_PUBLIC = resolve(import.meta.dirname, '../../public');

// 스크린 썸네일 URL. SSOT(ohouse-design-mcp) 안의 파일은 static 사이트에서 서빙되지 않으므로,
// 썸네일은 public/thumbnails/<domain>/<screen>.<ext> 에 두고 직접 경로로 참조한다.
export function screenThumbUrl(domainSlug, screenSlug, { publicDir = SITE_PUBLIC, existsFn = existsSync } = {}) {
  for (const ext of ['png', 'webp', 'jpg']) {
    const rel = `thumbnails/${domainSlug}/${screenSlug}.${ext}`;
    if (existsFn(join(publicDir, rel))) return withBase(rel);
  }
  return null;
}

const DOMAIN_LABELS = {
  // Discovery
  home: '홈',
  'house-tour': '집구경',
  'shopping-home': '쇼핑홈',
  category: '카테고리',
  // Shopping
  shopping: '쇼핑',
  'product-detail': '상품 상세',
  cart: '장바구니',
  promotion: '기획전',
  'binary-home': '바이너리 홈',
  // Life event
  'interior-life': '인테리어/생활',
  package: '패키지',
  membership: '멤버십',
  'internet-rental': '인터넷&렌탈',
  moving: '이사',
  // Core
  search: '검색',
  'content-detail': '콘텐츠 상세',
  mypage: '마이페이지',
  bookmark: '북마크',
  'all-page': '전체페이지',
  'room-3d': '3D 방꾸미기',
  // Global
  'search-jp': '검색-jp',
  'home-jp': '홈-jp',
  'shopping-jp': '쇼핑-jp',
  'content-jp': '콘텐츠-jp',
  'core-jp': 'Core-jp',
};

// 화면 분류 카테고리 (홈 페이지 상단 카테고리 바용)
// 디자인 사이트 nav 기준 5개 그룹.
export const CATEGORIES = {
  Discovery: ['home', 'house-tour', 'shopping-home', 'category'],
  Shopping: ['shopping', 'product-detail', 'cart', 'promotion', 'binary-home'],
  'Life event': ['interior-life', 'package', 'membership', 'internet-rental', 'moving'],
  Core: ['search', 'content-detail', 'mypage', 'bookmark', 'all-page', 'room-3d'],
  Global: ['search-jp', 'home-jp', 'shopping-jp', 'content-jp', 'core-jp'],
};

const DOMAIN_TRACK_MAP = {
  home: 'home',
  'house-tour': 'contents',
  'content-detail': 'contents',
  'interior-life': 'contents',
  shopping: 'commerce',
  'shopping-home': 'commerce',
  'product-detail': 'commerce',
  cart: 'commerce',
  package: 'commerce',
  promotion: 'commerce',
  'binary-home': 'commerce',
  search: 'search',
  mypage: 'mypage',
  bookmark: 'mypage',
};

export const OS_OPTIONS = [
  { value: 'ios', label: 'iOS' },
  { value: 'android', label: 'Android' },
  { value: 'web', label: 'Web' },
  { value: 'mobile-web', label: 'Mobile Web' },
];

export const SOURCE_OPTIONS = [
  { value: 'html', label: 'HTML' },
  { value: 'figma', label: 'Figma' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'prototype', label: 'Prototype' },
];

export const STATUS_OPTIONS = [
  { value: 'verified', label: 'Verified' },
  { value: 'draft', label: 'Draft' },
  { value: 'missing-ods', label: 'Missing ODS' },
  { value: 'code-connect', label: 'Code Connect' },
];

export const DISCOVERY_AXES = [
  { id: 'categories', label: 'Categories', href: 'categories', summary: '오늘의집 도메인 기준으로 화면과 정책, 실험, 컴포넌트 자산을 탐색합니다.', featured: ['home', 'shopping', 'content-detail', 'mypage', 'search'] },
  { id: 'screens', label: 'Patterns', href: 'screens', summary: '도메인을 넘어서 재사용 가능한 UX 화면 패턴을 탐색합니다.', featured: ['onboarding', 'product-detail', 'search-result', 'checkout', 'profile'] },
  { id: 'ui-elements', label: 'UI Elements', href: 'ui-elements', summary: 'ODS 컴포넌트와 제품 UI 요소의 활용 사례를 탐색합니다.', featured: ['cards', 'navigation', 'bottom-sheet', 'form', 'carousel'] },
  { id: 'flows', label: 'Flows', href: 'flows', summary: '여러 화면으로 이어지는 사용자 여정과 플로우를 탐색합니다.', featured: ['signup', 'login', 'purchase', 'bookmark', 'share'] },
];

export const SCREEN_PATTERNS = [
  { slug: 'onboarding', label: 'Onboarding', group: 'Account', countHint: 4 },
  { slug: 'product-detail', label: 'Product Detail', group: 'Commerce', countHint: 7 },
  { slug: 'search-result', label: 'Search Result', group: 'Discovery', countHint: 5 },
  { slug: 'checkout', label: 'Checkout', group: 'Commerce', countHint: 3 },
  { slug: 'profile', label: 'Profile', group: 'Account', countHint: 4 },
  { slug: 'feed', label: 'Feed', group: 'Content', countHint: 5 },
  { slug: 'settings', label: 'Settings', group: 'Account', countHint: 2 },
  { slug: 'empty-state', label: 'Empty State', group: 'System', countHint: 3 },
  { slug: 'error-state', label: 'Error State', group: 'System', countHint: 2 },
];

export const UI_ELEMENT_GROUPS = [
  { slug: 'ods-components', label: 'ODS Components', group: 'System', countHint: 12 },
  { slug: 'product-components', label: 'Product Components', group: 'Product', countHint: 8 },
  { slug: 'cards', label: 'Cards', group: 'Layout', countHint: 10 },
  { slug: 'navigation', label: 'Navigation', group: 'Navigation', countHint: 7 },
  { slug: 'bottom-sheet', label: 'Bottom Sheet', group: 'Overlay', countHint: 5 },
  { slug: 'modal', label: 'Modal', group: 'Overlay', countHint: 4 },
  { slug: 'toast', label: 'Toast', group: 'Feedback', countHint: 3 },
  { slug: 'form', label: 'Form', group: 'Input', countHint: 6 },
  { slug: 'carousel', label: 'Carousel', group: 'Content', countHint: 4 },
];

export const FLOW_GROUPS = [
  { slug: 'account', label: 'Account', group: 'Account', countHint: 5 },
  { slug: 'commerce', label: 'Commerce', group: 'Commerce', countHint: 8 },
  { slug: 'content', label: 'Content', group: 'Content', countHint: 4 },
  { slug: 'search', label: 'Search', group: 'Discovery', countHint: 3 },
  { slug: 'membership', label: 'Membership', group: 'Commerce', countHint: 3 },
  { slug: 'permission', label: 'Permission', group: 'System', countHint: 2 },
  { slug: 'order', label: 'Order', group: 'Commerce', countHint: 4 },
];

function safeRead(path) {
  try { return readFileSync(path, 'utf8'); } catch { return null; }
}

function safeStat(path) {
  try { return statSync(path); } catch { return null; }
}

export function relTime(isoOrAi) {
  if (!isoOrAi) return '';
  const d = new Date(isoOrAi.replace(' ', 'T'));
  if (isNaN(d.getTime())) return '';
  const diffSec = (Date.now() - d.getTime()) / 1000;
  if (diffSec < 60) return '방금 전';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}일 전`;
  if (diffSec < 86400 * 365) return `${Math.floor(diffSec / (86400 * 30))}개월 전`;
  return `${Math.floor(diffSec / (86400 * 365))}년 전`;
}

const lastModifiedCache = new Map();

function lastModifiedFrom(root, path) {
  const key = `${root}:${path}`;
  if (lastModifiedCache.has(key)) return lastModifiedCache.get(key);
  try {
    const out = execSync(`git log -1 --format=%ai -- "${path}"`, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const value = out || null;
    lastModifiedCache.set(key, value);
    return value;
  } catch {
    lastModifiedCache.set(key, null);
    return null;
  }
}

function lastModified(path) {
  return lastModifiedFrom(ROOT, path);
}

function lastModifiedContext(path) {
  return lastModifiedFrom(CONTEXT_ROOT, path);
}

function parseMd(filePath) {
  const raw = safeRead(filePath);
  if (!raw) return null;
  const parsed = matter(raw);
  return { ...parsed.data, body: parsed.content, _path: filePath };
}

function parseYaml(filePath) {
  const raw = safeRead(filePath);
  if (!raw) return null;
  try {
    return yaml.load(raw) || {};
  } catch {
    return null;
  }
}

export function isSelfContainedHtml(html) {
  const text = String(html || '');
  if (!text.trim()) return false;
  // 외부 스크립트 참조 (예: <script src="/src/main.tsx">)
  if (/<script\b[^>]*\bsrc\s*=/i.test(text)) return false;
  // 번들러 진입점 (예: <script type="module">)
  if (/<script\b[^>]*\btype\s*=\s*["']module["']/i.test(text)) return false;
  // 외부 스타일시트 (예: <link rel="stylesheet" href="/a.css">) — 속성 순서 무관
  for (const tag of text.match(/<link\b[^>]*>/gi) || []) {
    if (/\brel\s*=\s*["']stylesheet["']/i.test(tag) && /\bhref\s*=/i.test(tag)) return false;
  }
  return true;
}

export function resolveScreenPreviewHtml({ screenDir, frontmatter, contextRoot }) {
  const candidates = [];
  const ref = frontmatter && frontmatter.prototype_html;
  if (ref) candidates.push(join(contextRoot, String(ref)));
  candidates.push(join(screenDir, 'prototype.html'));
  candidates.push(join(screenDir, 'prototype.htm'));

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    const html = safeRead(candidate);
    if (html && isSelfContainedHtml(html)) return html;
  }
  return null;
}

export function isValidPrototypeUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

const POLICY_SECTION_GROUPS = [
  { id: 'principles', label: '디자인 원칙' },
  { id: 'operational', label: '운영 맥락' },
  { id: 'exceptions', label: '예외 케이스' },
  { id: 'decisions', label: '의사결정 배경' },
  { id: 'open-questions', label: '확인 필요' },
  { id: 'sources', label: '참조' },
];

export const POLICY_GROUP_LABELS = Object.fromEntries(POLICY_SECTION_GROUPS.map((group) => [group.id, group.label]));

function plainTextFromMarkdown(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[#>*_`|[\]-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function summarizeMarkdown(markdown, maxLength = 150) {
  const text = plainTextFromMarkdown(markdown);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trim()}...`;
}

function splitMarkdownSections(body) {
  const lines = String(body || '').split(/\r?\n/);
  const sections = [];
  let current = null;

  for (const line of lines) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      if (current) sections.push(current);
      current = { title: heading[1].trim(), body: '' };
      continue;
    }
    if (current) current.body += `${line}\n`;
  }

  if (current) sections.push(current);
  return sections.filter((section) => section.title || section.body.trim());
}

// Track Design Context — 트랙을 설계할 때 이해해야 하는 맥락 기준으로 섹션을 재분류.
// 운영 정책 원문이 아니라 "디자인에 영향을 주는 맥락"으로 보고 제목 위주로 분류한다.
function classifyPolicySection({ title, body }) {
  const t = String(title || '').toLowerCase();
  const haystack = `${title}\n${body}`.toLowerCase();

  // 제목 기반 분류를 우선한다 (본문 마커보다 우선).
  // 확인 필요 — 미확정·확인 마커 (제목)
  if (/미확정|확인 필요|확인 예정|문의 예정|tbd|todo/.test(t)) return 'open-questions';
  // 의사결정 배경 — 이력·결정·회고
  if (/변경 이력|의사결정|결정 배경|회고|learnings|changelog|history/.test(t)) return 'decisions';
  // 참조 — 출처·담당자·라우팅
  if (/참조|출처|레퍼런스|reference|source|담당자|문의처|하위 문서|라우팅|채널|링크/.test(t)) return 'sources';
  // 예외 케이스 — 상태·제약·주의사항
  if (/예외|상태|제약|주의사항|주의|엣지|edge|exception|숨김|블라인드|미노출/.test(t) || /empty|error|hidden|blocked/.test(haystack)) return 'exceptions';
  // 디자인 원칙 — 정체성·원칙·인터랙션·컴포넌트
  if (/디자인 원칙|원칙|정체성|범위|인터랙션|interaction|principle|컴포넌트|variant|지면/.test(t)) return 'principles';
  // 확인 필요 — 제목엔 없지만 본문에 명시적 확인 마커가 있는 경우
  if (/정책 확인 필요|작업 시 확인 필수/.test(haystack)) return 'open-questions';
  // 기본값 — 운영 맥락 (운영 정책 성격의 섹션)
  return 'operational';
}

function metadataDate(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
  return String(value);
}

function buildPolicySections(body, policyKind) {
  const sections = splitMarkdownSections(body);
  return sections.map((section, index) => {
    const category = classifyPolicySection({ ...section, policyKind });
    return {
      id: `${category}-${index}`,
      title: section.title,
      category,
      categoryLabel: POLICY_GROUP_LABELS[category] || category,
      summary: summarizeMarkdown(section.body),
      html: marked.parse(section.body),
    };
  });
}

function policyKindFromSource(relPath, source) {
  if (source === 'domain') return 'domain-policy';
  if (/^tracks\/[^/]+\/policies\.md$/.test(relPath)) return 'track-policy';
  if (/^tracks\/[^/]+\.md$/.test(relPath)) return 'track-context';
  return 'track-policy';
}

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => !name.startsWith('.') && !name.startsWith('_'))
    .filter((name) => {
      const s = safeStat(join(dir, name));
      return s && s.isDirectory();
    });
}

function listMd(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'README.md');
}

function trackPolicyDoc(track, filePath, relPath, slug) {
  const parsed = parseMd(filePath);
  if (!parsed) return null;
  const titleFromHeading = parsed.body.match(/^#\s+(.+)$/m)?.[1];
  const policyKind = policyKindFromSource(relPath, 'track');
  return {
    slug,
    label: parsed.title || titleFromHeading || slug,
    summary: parsed['when-to-read'] || parsed.summary || null,
    overrides: parsed.overrides || null,
    owner: parsed.owner || null,
    policyAuthority: parsed.policy_authority || null,
    lastVerified: metadataDate(parsed.last_verified),
    track,
    source: 'track',
    policyKind,
    sourcePath: relPath,
    html: marked.parse(parsed.body),
    sections: buildPolicySections(parsed.body, policyKind),
    updated: lastModifiedContext(relPath),
  };
}

function getTrackPoliciesForDomain(slug) {
  const track = DOMAIN_TRACK_MAP[slug];
  if (!track || !existsSync(join(CONTEXT_ROOT, 'tracks'))) return [];

  const docs = [];
  const trackIndexRel = `tracks/${track}.md`;
  const trackIndex = trackPolicyDoc(
    track,
    join(CONTEXT_ROOT, trackIndexRel),
    trackIndexRel,
    track,
  );
  if (trackIndex) docs.push(trackIndex);

  const policiesRel = `tracks/${track}/policies.md`;
  const policiesDoc = trackPolicyDoc(
    track,
    join(CONTEXT_ROOT, policiesRel),
    policiesRel,
    `${track}-policies`,
  );
  if (policiesDoc) docs.push(policiesDoc);

  return docs;
}

function fallbackOs(index) {
  return OS_OPTIONS[index % OS_OPTIONS.length].value;
}

function fallbackSource(index) {
  return SOURCE_OPTIONS[index % 2].value;
}

function markerStatus(markers) {
  if (markers.some((m) => m.kind === 'missing-ods')) return 'missing-ods';
  if (markers.some((m) => m.kind === 'code-connect')) return 'code-connect';
  return 'verified';
}

function browseCardStatus(screen, markers) {
  const status = markerStatus(markers);
  if (status !== 'verified') return status;
  if (!screen.prototype && !screen.thumb && markers.length === 0) return 'draft';
  return 'verified';
}

function findTaxonomyBySlug(slug, list) {
  return list.find((item) => slug.includes(item.slug) || item.slug.includes(slug));
}

// ─────────────────────────────────────────────
// 도메인 목록
// DOMAIN_LABELS 의 18 슬러그를 마스터 리스트로, 실제 폴더가 있으면 데이터로 채움.
// 폴더가 없는 도메인은 placeholder 로 노출 (디자인 리뉴얼/카드 그리드용).
// ─────────────────────────────────────────────
export function getAllDomains() {
  const dir = join(ROOT, 'domains');
  const folderSlugs = new Set(listDirs(dir));
  const masterSlugs = Object.keys(DOMAIN_LABELS);

  return masterSlugs.map((slug) => {
    const label = DOMAIN_LABELS[slug];
    if (folderSlugs.has(slug)) {
      const readme = parseMd(join(dir, slug, 'README.md')) || {};
      const screens = listDirs(join(dir, slug, 'screens'));
      const ownedComponents = listDirs(join(dir, slug, 'components'));
      const domainPolicies = listMd(join(dir, slug, 'policies'));
      const trackPolicies = getTrackPoliciesForDomain(slug);
      const experiments = listMd(join(dir, slug, 'experiments'));
      return {
        slug,
        label,
        owner: readme.owner || 'TBD',
        reviewer: readme.reviewer || null,
        developer: readme.developer || 'TBD',
        categories: readme.categories || [],
        description: readme.description || readme['when-to-read'] || null,
        counts: {
          screens: screens.length,
          components: ownedComponents.length,
          policies: domainPolicies.length + trackPolicies.length,
          experiments: experiments.length,
        },
        updated: lastModified(`domains/${slug}`),
      };
    }
    // placeholder
    return {
      slug,
      label,
      owner: 'TBD',
      reviewer: null,
      developer: 'TBD',
      categories: [],
      description: null,
      counts: { screens: 0, components: 0, policies: 0, experiments: 0 },
      updated: null,
    };
  });
}

export function getDomain(slug) {
  const all = getAllDomains();
  return all.find((d) => d.slug === slug) || null;
}

// ─────────────────────────────────────────────
// Screens · Components · Policies · Experiments
// ─────────────────────────────────────────────
export function getDomainScreens(slug) {
  const screensDir = join(ROOT, 'domains', slug, 'screens');
  return listDirs(screensDir).map((s) => {
    const readme = parseMd(join(screensDir, s, 'README.md')) || {};
    const prototypeHtml = ['prototype.html', 'prototype.tsx', 'prototype.htm']
      .map((f) => join(screensDir, s, f))
      .find((p) => existsSync(p));
    const markers = prototypeHtml
      ? extractMarkers(safeRead(prototypeHtml) || '')
      : [];
    return {
      slug: s,
      label: readme.title || s,
      summary: readme.summary || null,
      variant: readme.variant || s,
      status: readme.status || null,
      thumb: screenThumbUrl(slug, s),
      prototype: prototypeHtml ? prototypeHtml.replace(ROOT + '/', '') : null,
      previewHtml: resolveScreenPreviewHtml({
        screenDir: join(screensDir, s),
        frontmatter: readme,
        contextRoot: CONTEXT_ROOT,
      }),
      markers,
      updated: lastModified(`domains/${slug}/screens/${s}`),
    };
  });
}

function normalizeComponentKey(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function componentTitleFromBody(body) {
  return String(body || '').match(/^#\s+(.+)$/m)?.[1] || null;
}

function componentDefinition(domainSlug, componentSlug) {
  const dir = join(ROOT, 'domains', domainSlug, 'components', componentSlug);
  if (!existsSync(dir)) return null;
  const meta = parseYaml(join(dir, 'meta.yaml')) || {};
  const spec = parseMd(join(dir, 'spec.md'));
  const titleFromSpec = componentTitleFromBody(spec?.body);

  return {
    slug: componentSlug,
    ownerDomain: domainSlug,
    label: meta.title || titleFromSpec || componentSlug,
    type: meta.type || spec?.type || 'component',
    status: meta.status || spec?.status || null,
    summary: meta.description || spec?.['when-to-read'] || spec?.summary || null,
    owner: meta.owner || spec?.owner || null,
    source: 'domain',
    sourcePath: `domains/${domainSlug}/components/${componentSlug}/spec.md`,
    html: spec?.body ? marked.parse(spec.body) : null,
    updated: lastModified(`domains/${domainSlug}/components/${componentSlug}`),
  };
}

function resolveComponentDefinition(domainSlug, componentName) {
  const dir = join(ROOT, 'domains', domainSlug, 'components');
  const targetKey = normalizeComponentKey(componentName);
  const match = listDirs(dir).find((componentSlug) => {
    const meta = parseYaml(join(dir, componentSlug, 'meta.yaml')) || {};
    return normalizeComponentKey(componentSlug) === targetKey
      || normalizeComponentKey(meta.title) === targetKey;
  });

  if (match) return componentDefinition(domainSlug, match);

  const fallbackSlug = String(componentName || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
  return {
    slug: fallbackSlug,
    ownerDomain: domainSlug,
    label: componentName || fallbackSlug,
    type: 'component',
    status: 'planned',
    summary: null,
    owner: null,
    source: 'marker',
    sourcePath: null,
    html: null,
    updated: null,
  };
}

function dedupeComponents(components) {
  const seen = new Set();
  return components.filter((component) => {
    const key = `${component.ownerDomain}/${component.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getDomainComponents(slug) {
  const dir = join(ROOT, 'domains', slug, 'components');
  return listDirs(dir).map((c) => componentDefinition(slug, c)).filter(Boolean);
}

function parseDomainComponentMarker(value) {
  const [ownerDomain, componentName] = String(value || '').split('/');
  if (!ownerDomain || !componentName) return null;
  return { ownerDomain, componentName };
}

export function getScreenComponentUsage(domainSlug, screenSlug) {
  const dir = join(ROOT, 'domains', domainSlug, 'screens', screenSlug);
  const readme = parseMd(join(dir, 'README.md'));
  if (!readme) return { ods: [], domain: [] };

  const odsCatalog = getOdsComponents();
  const ods = (readme.linked_yaml_components || []).map((name) => {
    const odsSlug = resolveOdsSlug(name, odsCatalog);
    return {
      slug: name,
      label: name,
      type: 'ods',
      source: 'linked_yaml_components',
      odsSlug,
      href: odsSlug ? withBase(`ods/components/${odsSlug}`) : null,
    };
  });

  const domain = extractMarkers(readme.body)
    .filter((marker) => marker.kind === 'domain-component')
    .map((marker) => parseDomainComponentMarker(marker.value))
    .filter(Boolean)
    .map(({ ownerDomain, componentName }) => resolveComponentDefinition(ownerDomain, componentName));

  return { ods, domain: dedupeComponents(domain) };
}

// 주어진 ODS slug 를 linked_yaml_components 로 사용하는 모든 스크린 목록(역인덱스).
export function getOdsComponentScreens(odsSlug) {
  const catalog = getOdsComponents();
  const out = [];
  for (const domain of getAllDomains()) {
    for (const screen of getDomainScreens(domain.slug)) {
      const readme = parseMd(join(ROOT, 'domains', domain.slug, 'screens', screen.slug, 'README.md'));
      const names = readme?.linked_yaml_components || [];
      if (names.some((n) => resolveOdsSlug(n, catalog) === odsSlug)) {
        out.push({
          domain: domain.slug,
          slug: screen.slug,
          label: screen.label,
          domainLabel: domain.label,
          thumb: screenThumbUrl(domain.slug, screen.slug),
          href: withBase(`d/${domain.slug}/s/${screen.slug}`),
        });
      }
    }
  }
  return out;
}

export function getDomainComponentOverview(slug) {
  const owned = getDomainComponents(slug);
  const used = getDomainScreens(slug)
    .flatMap((screen) => getScreenComponentUsage(slug, screen.slug).domain);

  return {
    owned,
    used: dedupeComponents(used),
  };
}

export function getDomainPolicies(slug) {
  const dir = join(ROOT, 'domains', slug, 'policies');
  const domainPolicies = listMd(dir).map((file) => {
    const parsed = parseMd(join(dir, file)) || {};
    const sourcePath = `domains/${slug}/policies/${file}`;
    const policyKind = policyKindFromSource(sourcePath, 'domain');
    return {
      slug: file.replace(/\.md$/, ''),
      label: parsed.title || file.replace(/\.md$/, ''),
      summary: parsed['when-to-read'] || parsed.summary || null,
      overrides: parsed.overrides || null,
      owner: parsed.owner || null,
      policyAuthority: parsed.policy_authority || null,
      lastVerified: metadataDate(parsed.last_verified),
      source: 'domain',
      policyKind,
      sourcePath,
      html: parsed.body ? marked.parse(parsed.body) : null,
      sections: parsed.body ? buildPolicySections(parsed.body, policyKind) : [],
      updated: lastModified(sourcePath),
    };
  });
  return domainPolicies.concat(getTrackPoliciesForDomain(slug));
}

export function getDomainExperiments(slug) {
  const dir = join(ROOT, 'domains', slug, 'experiments');
  return listMd(dir).map((file) => {
    const parsed = parseMd(join(dir, file)) || {};
    return {
      slug: file.replace(/\.md$/, ''),
      label: parsed.title || file.replace(/\.md$/, ''),
      summary: parsed.summary || null,
      result: parsed.result || 'inconclusive', // win / loss / inconclusive
      updated: lastModified(`domains/${slug}/experiments/${file}`),
    };
  });
}

export function getAxisSidebarItems(axis) {
  if (axis === 'categories') {
    const domains = getAllDomains();
    const domainBySlug = new Map(domains.map((domain) => [domain.slug, domain]));
    const groups = Object.entries(CATEGORIES).map(([label, slugs]) => ({
      label,
      items: slugs.map((slug) => {
        const domain = domainBySlug.get(slug);
        return {
          slug,
          label: domain?.label || DOMAIN_LABELS[slug] || slug,
          count: domain?.counts?.screens || 0,
          href: withBase(`d/${slug}`),
        };
      }),
    }));
    return [{ slug: 'all', label: 'All Categories', count: domains.length, groups }];
  }
  if (axis === 'screens') {
    return [{ slug: 'all', label: 'All Patterns', count: getAllBrowseCards('screens').length }]
      .concat(SCREEN_PATTERNS.map((p) => ({ slug: p.slug, label: p.label, count: p.countHint })));
  }
  if (axis === 'ui-elements') {
    return [{ slug: 'all', label: 'All Elements', count: getAllBrowseCards('ui-elements').length }]
      .concat(UI_ELEMENT_GROUPS.map((p) => ({ slug: p.slug, label: p.label, count: p.countHint })));
  }
  if (axis === 'flows') {
    return [{ slug: 'all', label: 'All Flows', count: getAllBrowseCards('flows').length }]
      .concat(FLOW_GROUPS.map((p) => ({ slug: p.slug, label: p.label, count: p.countHint })));
  }
  return [];
}

export function getAllBrowseCards(axis = 'screens') {
  const domains = getAllDomains();
  const cards = [];
  domains.forEach((domain) => {
    getDomainScreens(domain.slug).forEach((screen) => {
      const index = cards.length;
      const pattern = findTaxonomyBySlug(screen.slug, SCREEN_PATTERNS) || SCREEN_PATTERNS[index % SCREEN_PATTERNS.length];
      const element = UI_ELEMENT_GROUPS[index % UI_ELEMENT_GROUPS.length];
      const flow = FLOW_GROUPS[index % FLOW_GROUPS.length];
      const markers = screen.markers || [];
      cards.push({
        id: `${domain.slug}-${screen.slug}`,
        label: screen.label,
        summary: screen.summary || `${domain.label} · ${pattern.label}`,
        href: withBase(`d/${domain.slug}/s/${screen.slug}`),
        domain: domain.label,
        domainSlug: domain.slug,
        os: fallbackOs(index),
        source: screen.prototype ? 'prototype' : fallbackSource(index),
        status: browseCardStatus(screen, markers),
        pattern: pattern.label,
        element: element.label,
        flow: flow.label,
        thumb: screen.thumb,
        previewHtml: screen.previewHtml,
        markers,
        updated: screen.updated,
      });
    });
  });

  if (axis === 'ui-elements') {
    return cards.map((card) => ({ ...card, label: card.element, summary: `${card.element} usage in ${card.domain}` }));
  }
  if (axis === 'flows') {
    return cards.map((card) => ({ ...card, label: card.flow, summary: `${card.flow} flow reference in ${card.domain}` }));
  }
  return cards;
}

export function getOverlayGroups(axis) {
  const source = axis === 'screens' ? SCREEN_PATTERNS : axis === 'ui-elements' ? UI_ELEMENT_GROUPS : axis === 'flows' ? FLOW_GROUPS : [];
  if (axis === 'categories') {
    return Object.entries(CATEGORIES).map(([group, slugs]) => ({
      group,
      items: slugs.map((slug) => {
        const domain = getDomain(slug);
        return { slug, label: domain?.label || slug, count: domain?.counts?.screens || 0, href: withBase(`d/${slug}`) };
      }),
    }));
  }
  const grouped = new Map();
  source.forEach((item) => {
    if (!grouped.has(item.group)) grouped.set(item.group, []);
    grouped.get(item.group).push({
      slug: item.slug,
      label: item.label,
      count: item.countHint,
      href: withBase(`${axis}?item=${item.slug}`),
    });
  });
  return Array.from(grouped.entries()).map(([group, items]) => ({ group, items }));
}

// ─────────────────────────────────────────────
// Screen 상세
// ─────────────────────────────────────────────
export function getScreen(domainSlug, screenSlug) {
  const dir = join(ROOT, 'domains', domainSlug, 'screens', screenSlug);
  if (!existsSync(dir)) return null;
  const readme = parseMd(join(dir, 'README.md')) || {};
  const prototypePath = ['prototype.html', 'prototype.tsx']
    .map((f) => join(dir, f))
    .find((p) => existsSync(p));
  const protoContent = prototypePath ? safeRead(prototypePath) : null;
  const markers = protoContent ? extractMarkers(protoContent) : [];
  const historyDoc = parseMd(join(dir, 'history.md'));

  return {
    domain: domainSlug,
    slug: screenSlug,
    label: readme.title || screenSlug,
    variant: readme.variant || screenSlug,
    status: readme.status || null,
    owner: readme.owner || null,
    body: readme.body || '',
    markers,
    thumb: screenThumbUrl(domainSlug, screenSlug),
    prototype: prototypePath ? prototypePath.replace(ROOT + '/', '') : null,
    previewHtml: resolveScreenPreviewHtml({
      screenDir: dir,
      frontmatter: readme,
      contextRoot: CONTEXT_ROOT,
    }),
    prototypeUrl: isValidPrototypeUrl(readme.prototype_url)
      ? readme.prototype_url
      : (typeof readme.prototype_app === 'string' && readme.prototype_app.trim()
          ? withBase(readme.prototype_app)
          : null),
    historyHtml: historyDoc?.body ? rewriteHistoryImages(marked.parse(historyDoc.body), domainSlug, screenSlug) : null,
    updated: lastModified(`domains/${domainSlug}/screens/${screenSlug}`),
  };
}

// ─────────────────────────────────────────────
// 마커 추출 (@ods-component:, @code-connect:, @missing-ods: 등)
// ─────────────────────────────────────────────
export function extractMarkers(content) {
  const re = /@(ods-component|bds-component|code-connect|use-tailwind|missing-ods|domain-component):([^\s<>"'`]+)/g;
  const out = [];
  let m;
  while ((m = re.exec(content)) !== null) {
    out.push({ kind: m[1], value: m[2] });
  }
  return out;
}

// ─────────────────────────────────────────────
// Knowledge
// ─────────────────────────────────────────────
export function getKnowledgeList() {
  const dir = join(ROOT, 'knowledge');
  return listMd(dir).map((file) => {
    const parsed = parseMd(join(dir, file)) || {};
    return {
      slug: file.replace(/\.md$/, ''),
      label: parsed.title || file.replace(/\.md$/, ''),
      summary: parsed['when-to-read'] || parsed.summary || null,
      updated: lastModified(`knowledge/${file}`),
    };
  });
}

export function getKnowledge(slug) {
  const path = join(ROOT, 'knowledge', `${slug}.md`);
  const parsed = parseMd(path);
  if (!parsed) return null;
  return {
    slug,
    label: parsed.title || slug,
    html: marked.parse(parsed.body),
    updated: lastModified(`knowledge/${slug}.md`),
  };
}

// ─────────────────────────────────────────────
// Vision
// ─────────────────────────────────────────────
export function getVision() {
  const path = join(ROOT, '_meta/VISION.md');
  const parsed = parseMd(path);
  if (!parsed) return null;
  return {
    html: marked.parse(parsed.body),
    updated: lastModified('_meta/VISION.md'),
  };
}

// ─────────────────────────────────────────────
// Copy prompt 생성
// ─────────────────────────────────────────────
export function buildPrompt({ kind, domain, screen, markers = [] }) {
  const lines = [];
  if (kind === 'screen') {
    lines.push(`오늘의집 [${DOMAIN_LABELS[domain] || domain}] 도메인의 [${screen}] 화면을 만들어줘.`);
    lines.push('');
    lines.push('## 화면 컨벤션');
    lines.push(`domains/${domain}/README.md 의 owner / categories / 정책 적용.`);
    lines.push('');
    if (markers.length > 0) {
      lines.push('## 사용 컴포넌트 (prototype 마커 기준)');
      for (const m of markers) {
        lines.push(`- @${m.kind}:${m.value}`);
      }
      lines.push('');
    }
    lines.push('## 관련 정책 · 실험');
    lines.push(`- domains/${domain}/policies/`);
    lines.push(`- domains/${domain}/experiments/`);
    lines.push(`- knowledge/principles.md`);
    lines.push('');
    lines.push('## 산출물 위치');
    lines.push(`domains/${domain}/screens/${screen}/prototype.html`);
    lines.push('');
    lines.push('## 요청');
    lines.push('[여기에 자유롭게 추가 — 예: 다크모드 변형도 같이 / 빈 상태 추가 / 모바일 반응형 등]');
  } else if (kind === 'component') {
    lines.push(`오늘의집 ODS 또는 도메인 컴포넌트 [${screen}] 의 사용 예시를 만들어줘.`);
    lines.push('');
    lines.push('## 컴포넌트 위치');
    lines.push(`(ods 또는 domain) components/${screen}/`);
    lines.push('');
    lines.push('## 요청');
    lines.push('[여기에 사용 시나리오 추가]');
  }
  return lines.join('\n');
}
