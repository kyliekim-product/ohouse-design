import { defineConfig } from 'astro/config';

export default defineConfig({
  // GitHub Pages sub-path 빌드 대응: env 로 주입, 없으면 root.
  // CI: PAGES_BASE=/ohouse-design/ PAGES_SITE=https://<org>.github.io
  base: process.env.PAGES_BASE || '/',
  site: process.env.PAGES_SITE || 'http://localhost:4321',
  server: { port: 4321, host: true },
  vite: {
    resolve: {
      // repo 루트의 markdown 파일들 접근용
      alias: { '@repo': new URL('../', import.meta.url).pathname },
    },
  },
});
