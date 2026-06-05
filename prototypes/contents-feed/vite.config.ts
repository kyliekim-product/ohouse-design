import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ODS 는 @emotion/react 기반이므로 jsxImportSource 를 emotion 으로 지정.
export default defineConfig({
  // self-host: 사이트 public/prototypes/contents-feed/ 아래 임의 subpath에서 동작하도록 상대경로 base.
  base: './',
  // 빌드 산출물을 사이트의 public/ 로 직접 출력해 same-origin 으로 서빙한다.
  build: {
    outDir: '../../ohouse-design-site/public/prototypes/contents-feed',
    emptyOutDir: true,
  },
  define: {
    'process.env.APP_PROFILE': JSON.stringify(
      process.env.APP_PROFILE ?? 'prod',
    ),
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV ?? 'development',
    ),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        'process.env.APP_PROFILE': JSON.stringify(
          process.env.APP_PROFILE ?? 'prod',
        ),
        'process.env.NODE_ENV': JSON.stringify(
          process.env.NODE_ENV ?? 'development',
        ),
      },
    },
  },
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
