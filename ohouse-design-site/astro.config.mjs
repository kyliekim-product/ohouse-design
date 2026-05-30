import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  // Sub-path hosting 대응: /deploy는 CLI --base를 주입하고,
  // 로컬/레거시 CI는 env로 같은 값을 줄 수 있다.
  base: process.env.SITE_BASE || process.env.PAGES_BASE || '/',
  site: process.env.PAGES_SITE || 'http://localhost:4321',
  server: { port: 4321, host: true },
  // 기존 페이지는 static, /api/* endpoint는 prerender=false로 server-side 동작
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    resolve: {
      // repo 루트의 markdown 파일들 접근용
      alias: { '@repo': new URL('../', import.meta.url).pathname },
    },
    // @bucketplace/* 패키지는 클라이언트 전용 — SSR 번들에서 제외
    ssr: {
      external: [
        '@bucketplace/design-system',
        '@bucketplace/tokens',
        '@bucketplace/ui',
        '@bucketplace/lib',
        '@bucketplace/ods-site-content',
        '@bucketplace/ods-web-preview',
        '@emotion/react',
        '@emotion/styled',
      ],
    },
  },
});
