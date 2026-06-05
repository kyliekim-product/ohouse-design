import assert from 'node:assert/strict';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { screenThumbUrl, getScreen } from './repo.js';

// ── screenThumbUrl: 정적 public 경로를 직접 반환해야 함 (존재하지 않는 /api/asset 엔드포인트 금지) ──
const present = { png: false, webp: false, jpg: false };
const existsFn = (p) =>
  p.endsWith('.png') ? present.png : p.endsWith('.webp') ? present.webp : p.endsWith('.jpg') ? present.jpg : false;
const opts = () => ({ publicDir: '/PUB', existsFn });

// png 우선
present.png = true; present.webp = true; present.jpg = false;
assert.equal(screenThumbUrl('house-tour', 'content-tab', opts()), '/thumbnails/house-tour/content-tab.png');

// png 없으면 webp
present.png = false; present.webp = true;
assert.equal(screenThumbUrl('house-tour', 'content-tab', opts()), '/thumbnails/house-tour/content-tab.webp');

// 아무것도 없으면 null
present.png = false; present.webp = false; present.jpg = false;
assert.equal(screenThumbUrl('house-tour', 'content-tab', opts()), null);

// 절대 /api/asset (존재하지 않는 엔드포인트)를 가리키면 안 됨
present.webp = true;
assert.ok(!screenThumbUrl('d', 's', opts()).includes('api/asset'));

// ── 통합: content-tab thumb 는 실제로 서빙되는 public 파일을 가리켜야 함 ──
const s = getScreen('house-tour', 'content-tab');
assert.ok(s.thumb, 'content-tab thumb must be set');
assert.ok(!s.thumb.includes('api/asset'), 'thumb must not use the nonexistent api/asset endpoint');
// thumb URL 이 가리키는 파일이 site public 에 실제로 존재해야 함
const rel = s.thumb.replace(/^\//, '');
assert.ok(existsSync(join(process.cwd(), 'public', rel.replace(/^.*?thumbnails\//, 'thumbnails/'))),
  `thumb file must exist under public/: ${s.thumb}`);

console.log('repo-thumb tests passed');
