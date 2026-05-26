#!/usr/bin/env node
// 도메인 운영 대시보드 생성기 (의존성 없음 · git + frontmatter 만 사용)
//
//   node dashboard/generate.mjs
//
// ohouse-design-mcp/domains/* 의 git 히스토리와 README.md frontmatter(owner)를 읽어
// dashboard/DASHBOARD.md 를 새로 생성한다. 데이터 소스는 커밋되어 있어야 정확하다
// (방금 만든 파일은 커밋 전이면 "수정 기록 없음" 으로 나온다).

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const ROOT = resolve(import.meta.dirname, '..');       // repo 루트
const MCP = 'ohouse-design-mcp';                        // SSOT 폴더명
const DOMAINS_REL = `${MCP}/domains`;
const DOMAINS_ABS = join(ROOT, DOMAINS_REL);
const OUT = join(import.meta.dirname, 'DASHBOARD.md');

// 화면 슬러그 → 한글 라벨 (repo.js 와 동기화)
const LABELS = {
  home: '홈', 'house-tour': '집구경', 'shopping-home': '쇼핑홈', category: '카테고리',
  shopping: '쇼핑', 'product-detail': '상품 상세', cart: '장바구니', promotion: '기획전', 'binary-home': '바이너리 홈',
  'interior-life': '인테리어/생활', package: '패키지', membership: '멤버십', 'internet-rental': '인터넷&렌탈', moving: '이사',
  search: '검색', 'content-detail': '콘텐츠 상세', mypage: '마이페이지', bookmark: '북마크', 'all-page': '전체페이지', 'room-3d': '3D 방꾸미기',
  'search-jp': '검색-jp', 'home-jp': '홈-jp', 'shopping-jp': '쇼핑-jp', 'content-jp': '콘텐츠-jp', 'core-jp': 'Core-jp',
};

// 방치 기준 (일). POLICY.md 와 동기화.
const FRESH = 14;   // 🟢 최근
const WARN = 30;    // 🟡 점검
const STALE = 90;   // 🟠 방치 / 🔴 장기방치

function git(args) {
  try {
    return execSync(`git ${args}`, { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function listDirs(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((n) => {
    if (n.startsWith('.') || n.startsWith('_')) return false;
    try { return statSync(join(dir, n)).isDirectory(); } catch { return false; }
  });
}

function countMd(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'INDEX.md' && f !== 'README.md').length;
}

// README.md frontmatter 에서 owner 한 줄만 가볍게 파싱
function ownerOf(domainDir) {
  const p = join(domainDir, 'README.md');
  if (!existsSync(p)) return 'TBD';
  const raw = readFileSync(p, 'utf8');
  const fm = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return 'TBD';
  const m = fm[1].match(/^owner:\s*(.+)$/m);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : 'TBD';
}

function daysSince(iso) {
  // git 날짜는 "2026-05-26 13:25:26 +0900" 형태 — 날짜 부분만 사용 (일 단위 기준이므로 충분).
  const m = (iso || '').match(/^(\d{4}-\d{2}-\d{2})/);
  if (!m) return null;
  const d = new Date(`${m[1]}T00:00:00`);
  if (isNaN(d)) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

function statusEmoji(days, hasContent) {
  if (days === null) return '⚫'; // 수정 기록 없음
  if (!hasContent) return '📭';   // 폴더만 있고 산출물 없음
  if (days <= FRESH) return '🟢';
  if (days <= WARN) return '🟡';
  if (days <= STALE) return '🟠';
  return '🔴';
}

const today = new Date().toISOString().slice(0, 10);
const slugs = listDirs(DOMAINS_ABS).sort();

const rows = slugs.map((slug) => {
  const dir = join(DOMAINS_ABS, slug);
  const rel = `${DOMAINS_REL}/${slug}`;
  const last = git(`log -1 --format="%ai|%an|%s" -- "${rel}"`);
  const [date = '', author = '', ...subjParts] = last.split('|');
  const subject = subjParts.join('|');
  const commits = git(`rev-list --count HEAD -- "${rel}"`) || '0';
  const counts = {
    screens: listDirs(join(dir, 'screens')).length,
    components: listDirs(join(dir, 'components')).length,
    policies: countMd(join(dir, 'policies')),
    experiments: countMd(join(dir, 'experiments')),
  };
  const hasContent = counts.screens + counts.components + counts.policies + counts.experiments > 0;
  const days = daysSince(date);
  return {
    slug,
    label: LABELS[slug] || slug,
    owner: ownerOf(dir),
    date: date ? date.slice(0, 10) : '—',
    days,
    author: author || '—',
    commits: Number(commits),
    counts,
    hasContent,
    subject: subject || '—',
    status: statusEmoji(days, hasContent),
  };
});

// 기여자 집계 (domains 범위)
const authorLog = git(`log --format="%an" -- "${DOMAINS_REL}"`).split('\n').filter(Boolean);
const byAuthor = {};
for (const a of authorLog) byAuthor[a] = (byAuthor[a] || 0) + 1;
const ownedBy = {};
for (const r of rows) {
  if (r.owner && r.owner !== 'TBD') ownedBy[r.owner] = (ownedBy[r.owner] || 0) + 1;
}
const contributors = [...new Set([...Object.keys(byAuthor), ...Object.keys(ownedBy)])]
  .map((name) => ({ name, commits: byAuthor[name] || 0, owns: ownedBy[name] || 0 }))
  .sort((a, b) => b.commits - a.commits);

// 요약 수치
const total = rows.length;
const ownerSet = rows.filter((r) => r.owner !== 'TBD').length;
const fresh = rows.filter((r) => r.days !== null && r.days <= FRESH && r.hasContent).length;
const stale = rows.filter((r) => r.days !== null && r.days > WARN).length;
const empty = rows.filter((r) => !r.hasContent).length;

// ── 렌더 ──
const L = [];
L.push('# 📊 도메인 운영 대시보드');
L.push('');
L.push(`> 생성: **${today}** · 소스: \`git log\` + \`${DOMAINS_REL}/*/README.md\` (owner)`);
L.push('> 수동 생성: `node dashboard/generate.mjs` · 기준·정책: [POLICY.md](./POLICY.md)');
L.push('> ⚠️ 이 파일은 자동 생성됩니다. 직접 수정 금지 (다음 생성 시 덮어씌워짐).');
L.push('');
L.push('## 한눈에');
L.push('');
L.push('| 지표 | 값 |');
L.push('|---|---|');
L.push(`| 전체 도메인 | ${total} |`);
L.push(`| 오너 지정 / TBD | ${ownerSet} / ${total - ownerSet} |`);
L.push(`| 🟢 최근(≤${FRESH}일) 업데이트 | ${fresh} |`);
L.push(`| 🟠🔴 ${WARN}일+ 방치 | ${stale} |`);
L.push(`| 📭 산출물 없음(폴더만) | ${empty} |`);
L.push('');
L.push(`상태 범례 — 🟢 ≤${FRESH}일 · 🟡 ≤${WARN}일 · 🟠 ≤${STALE}일 · 🔴 >${STALE}일 · 📭 산출물 없음 · ⚫ 수정 기록 없음`);
L.push('');

L.push('## 도메인별 현황');
L.push('');
L.push('| 상태 | 화면 | 오너 | 최종 수정 | 경과 | 수정자 | 커밋 | s/c/p/e | 최근 작업 |');
L.push('|:--:|---|---|---|--:|---|--:|:--:|---|');
for (const r of [...rows].sort((a, b) => (b.days ?? -1) - (a.days ?? -1))) {
  const c = r.counts;
  const sce = `${c.screens}/${c.components}/${c.policies}/${c.experiments}`;
  const ago = r.days === null ? '—' : `${r.days}일`;
  L.push(`| ${r.status} | ${r.label} \`${r.slug}\` | ${r.owner} | ${r.date} | ${ago} | ${r.author} | ${r.commits} | ${sce} | ${r.subject} |`);
}
L.push('');
L.push('`s/c/p/e` = screens / components / policies / experiments 산출물 수.');
L.push('');

const staleRows = rows.filter((r) => r.days !== null && r.days > WARN).sort((a, b) => b.days - a.days);
L.push(`## 🚨 방치 도메인 (${WARN}일 초과, 오래된 순)`);
L.push('');
if (staleRows.length === 0) {
  L.push('_없음 — 모든 도메인이 점검 주기 내에 있습니다._');
} else {
  L.push('| 화면 | 오너 | 경과 | 마지막 작업 |');
  L.push('|---|---|--:|---|');
  for (const r of staleRows) L.push(`| ${r.label} \`${r.slug}\` | ${r.owner} | ${r.days}일 | ${r.subject} |`);
}
L.push('');

const emptyRows = rows.filter((r) => !r.hasContent);
L.push('## 📭 산출물 없는 도메인 (폴더만 존재)');
L.push('');
if (emptyRows.length === 0) {
  L.push('_없음._');
} else {
  L.push(emptyRows.map((r) => `\`${r.slug}\`(${r.label})`).join(' · '));
}
L.push('');

const tbd = rows.filter((r) => r.owner === 'TBD');
L.push('## 👤 오너 미지정 (TBD)');
L.push('');
if (tbd.length === 0) {
  L.push('_없음 — 모든 도메인에 오너가 있습니다._');
} else {
  L.push(tbd.map((r) => `\`${r.slug}\`(${r.label})`).join(' · '));
}
L.push('');

L.push('## 🏅 기여자별 (domains 범위)');
L.push('');
L.push('| 기여자 | 커밋 수 | 오너 화면 수 |');
L.push('|---|--:|--:|');
for (const c of contributors) L.push(`| ${c.name} | ${c.commits} | ${c.owns} |`);
L.push('');
L.push('> "커밋 수" = `ohouse-design-mcp/domains` 를 건드린 커밋. "오너 화면 수" = README frontmatter `owner` 기준.');
L.push('');

writeFileSync(OUT, L.join('\n') + '\n');
console.log(`✓ ${OUT} 생성 — 도메인 ${total}개, 기여자 ${contributors.length}명`);
