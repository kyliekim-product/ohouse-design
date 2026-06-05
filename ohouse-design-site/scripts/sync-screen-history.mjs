import { existsSync, readdirSync, statSync, mkdirSync, copyFileSync, rmSync } from 'node:fs';
import { join, resolve, extname } from 'node:path';

const SITE_ROOT = resolve(import.meta.dirname, '..');
const MCP_ROOT = resolve(SITE_ROOT, '../ohouse-design-mcp');
const OUT_ROOT = join(SITE_ROOT, 'public', 'screen-history');
const IMG_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg']);

function listDirs(p) {
  if (!existsSync(p)) return [];
  return readdirSync(p).filter((n) => statSync(join(p, n)).isDirectory());
}

function main() {
  const domainsRoot = join(MCP_ROOT, 'domains');
  if (!existsSync(domainsRoot)) { console.warn('[screen-history] domains 없음 — skip'); return; }
  // 매 빌드마다 새로 복사 (삭제·이름변경된 이미지가 public 에 stale 로 남지 않도록)
  rmSync(OUT_ROOT, { recursive: true, force: true });
  let copied = 0;
  for (const domain of listDirs(domainsRoot)) {
    const screensRoot = join(domainsRoot, domain, 'screens');
    for (const screen of listDirs(screensRoot)) {
      const dir = join(screensRoot, screen);
      if (!existsSync(join(dir, 'history.md'))) continue;
      const imgs = readdirSync(dir).filter((f) => IMG_EXT.has(extname(f).toLowerCase()));
      if (imgs.length === 0) continue;
      const outDir = join(OUT_ROOT, domain, screen);
      mkdirSync(outDir, { recursive: true });
      for (const img of imgs) { copyFileSync(join(dir, img), join(outDir, img)); copied++; }
      console.log(`[screen-history] ${domain}/${screen}: ${imgs.length} image(s)`);
    }
  }
  console.log(`[screen-history] done (${copied} file(s))`);
}

try { main(); } catch (e) { console.warn(`[screen-history] 실패: ${e.message} — 빌드 계속`); }
