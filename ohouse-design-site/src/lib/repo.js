// repo 의 markdown 컨텐츠를 사이트에서 읽기 위한 헬퍼.
// node 환경에서 build / dev 시점에 호출됨.

import { readFileSync, readdirSync, existsSync, statSync } from 'fs';
import { join, resolve, basename, dirname } from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import { marked } from 'marked';

// 사이트는 ohouse-design-site/ 에 살고, 콘텐츠는 Claude_Study 의 SSOT 에서 읽는다.
// 폴더 이름이 'product-design' 또는 'product design' (스페이스) 둘 다 허용.
function resolveRoot() {
  const candidates = [
    // 현재/미래 레이아웃 공통: 사이트 폴더의 형제 docs/ 가 SSOT.
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

// base path (GitHub Pages sub-path 대응). astro.config.mjs 의 PAGES_BASE 와 동일.
// 항상 끝에 '/' 가 오도록 정규화 (예: '/' 또는 '/ohouse-design/').
const BASE = (process.env.PAGES_BASE || '/').replace(/\/+$/, '') + '/';

// base + 경로 결합 (중복 슬래시 방지). path 는 보통 'api/asset?...' 처럼 슬래시 없이 시작.
function withBase(path) {
  return BASE + String(path).replace(/^\/+/, '');
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

function lastModified(path) {
  try {
    const out = execSync(`git log -1 --format=%ai -- "${path}"`, {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    return out || null;
  } catch {
    return null;
  }
}

function parseMd(filePath) {
  const raw = safeRead(filePath);
  if (!raw) return null;
  const parsed = matter(raw);
  return { ...parsed.data, body: parsed.content, _path: filePath };
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
      const components = listDirs(join(dir, slug, 'components'));
      const policies = listMd(join(dir, slug, 'policies'));
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
          components: components.length,
          policies: policies.length,
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
    const thumb = ['thumbnail.png', 'thumbnail.webp', 'thumbnail.jpg']
      .map((f) => join(screensDir, s, f))
      .find((p) => existsSync(p));
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
      thumb: thumb ? withBase(`api/asset?path=${encodeURIComponent(thumb.replace(ROOT + '/', ''))}`) : null,
      markers,
      updated: lastModified(`domains/${slug}/screens/${s}`),
    };
  });
}

export function getDomainComponents(slug) {
  const dir = join(ROOT, 'domains', slug, 'components');
  return listDirs(dir).map((c) => {
    const meta = parseMd(join(dir, c, 'meta.yaml'));
    const readme = parseMd(join(dir, c, 'README.md'));
    const m = meta || readme || {};
    return {
      slug: c,
      label: m.title || c,
      type: m.type || 'component',
      summary: m.summary || null,
      updated: lastModified(`domains/${slug}/components/${c}`),
    };
  });
}

export function getDomainPolicies(slug) {
  const dir = join(ROOT, 'domains', slug, 'policies');
  return listMd(dir).map((file) => {
    const parsed = parseMd(join(dir, file)) || {};
    return {
      slug: file.replace(/\.md$/, ''),
      label: parsed.title || file.replace(/\.md$/, ''),
      summary: parsed['when-to-read'] || parsed.summary || null,
      overrides: parsed.overrides || null,
      updated: lastModified(`domains/${slug}/policies/${file}`),
    };
  });
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
  const thumb = ['thumbnail.png', 'thumbnail.webp']
    .map((f) => join(dir, f))
    .find((p) => existsSync(p));

  return {
    domain: domainSlug,
    slug: screenSlug,
    label: readme.title || screenSlug,
    body: readme.body || '',
    markers,
    thumb: thumb ? `/api/asset?path=${encodeURIComponent(thumb.replace(ROOT + '/', ''))}` : null,
    prototype: prototypePath ? prototypePath.replace(ROOT + '/', '') : null,
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
