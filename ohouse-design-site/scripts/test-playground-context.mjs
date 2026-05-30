// Sprint 1 완료 기준 검증 스크립트
// 실행: node scripts/test-playground-context.mjs
// 목적: ohouse-design-mcp 컨텍스트 로딩 + 시스템 프롬프트 생성이 정상 동작하는지 확인

import { buildSystemPrompt, getContext } from '../src/lib/playground-context.js';

console.log('=== Playground Context 검증 ===\n');

const ctx = getContext();

// 1. 원칙 로딩
console.log(`✅ 디자인 원칙: ${ctx.principles.length > 100 ? '로드됨' : '❌ 짧음 — 파일 경로 확인 필요'}`);

// 2. ODS 컴포넌트
console.log(`✅ ODS 컴포넌트: ${ctx.odsComponents.length}개 로드`);
if (ctx.odsComponents.length > 0) {
  console.log(`   예시: ${ctx.odsComponents.slice(0, 3).map((c) => c.title).join(', ')}`);
}

// 3. 토큰
const semanticCount = Object.keys(ctx.semanticTokens).length;
const paletteCount = Object.keys(ctx.paletteTokens).length;
console.log(`✅ Semantic 토큰: ${semanticCount}개, Palette 토큰: ${paletteCount}개`);

// 4. 기존 prototype 패턴
console.log(`✅ Prototype 패턴: ${ctx.examplePrototypes.length}개`);
ctx.examplePrototypes.forEach((e) => console.log(`   - ${e.domain}/${e.variant}`));

// 5. 시스템 프롬프트 생성
const systemPrompt = buildSystemPrompt('테스트 컨텍스트');
const tokenEstimate = Math.round(systemPrompt.length / 4); // 대략적인 토큰 추정
console.log(`\n✅ 시스템 프롬프트: ${systemPrompt.length}자 (~${tokenEstimate} tokens 추정)`);

if (tokenEstimate > 8000) {
  console.warn('⚠️  토큰 예산 초과 가능성 — 컨텍스트 압축 검토 필요');
} else {
  console.log(`   토큰 예산 OK (목표: ~5,000 tokens)`);
}

console.log('\n=== 검증 완료 ===');
