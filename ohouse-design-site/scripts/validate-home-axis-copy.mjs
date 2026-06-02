import { readFileSync } from 'fs';
import { resolve } from 'path';

const homePath = resolve(process.cwd(), 'dist/index.html');
const html = readFileSync(homePath, 'utf8');

const requiredSnippets = [
  '오늘의집 도메인 기준으로 화면과 정책, 실험, 컴포넌트 자산을 탐색합니다.',
  '도메인을 넘어서 재사용 가능한 UX 화면 패턴을 탐색합니다.',
  'ODS 컴포넌트와 제품 UI 요소의 활용 사례를 탐색합니다.',
  '여러 화면으로 이어지는 사용자 여정과 플로우를 탐색합니다.',
];

const forbiddenSnippets = [
  'Browse by Ohouse product domains.',
  'Browse reusable UX screen patterns.',
  'Browse ODS and product component usage.',
  'Browse multi-step user journeys.',
];

for (const snippet of requiredSnippets) {
  if (!html.includes(snippet)) {
    throw new Error(`Home axis copy validation failed: missing snippet ${JSON.stringify(snippet)}`);
  }
}

for (const snippet of forbiddenSnippets) {
  if (html.includes(snippet)) {
    throw new Error(`Home axis copy validation failed: found old snippet ${JSON.stringify(snippet)}`);
  }
}

console.log('Home axis copy validation passed.');
