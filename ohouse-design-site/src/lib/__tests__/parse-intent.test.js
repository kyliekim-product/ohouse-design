import { describe, it, expect } from 'vitest';
import { parseIntent } from '../parse-intent.js';

const variants = [
  { id: 'A', html: '<html>A</html>' },
  { id: 'B', html: '<html>B</html>' },
  { id: 'C', html: null },
];

describe('parseIntent', () => {
  it('B안 명시 + B안 html 있음 → refine', () => {
    expect(parseIntent('B안에 필터칩 추가해줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: null, intentType: 'refine',
    });
  });

  it('C안 명시 + C안 html 없음 → create_new', () => {
    expect(parseIntent('C안도 만들어줘', variants, 'A')).toEqual({
      targetId: 'C', sourceId: null, intentType: 'create_new',
    });
  });

  it('A안 기반으로 B안 → create_derived', () => {
    expect(parseIntent('A안 기반으로 B안 만들어줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: 'A', intentType: 'create_derived',
    });
  });

  it('안 언급 없음 → activeVariantId 폴백, refine', () => {
    expect(parseIntent('필터칩 추가해줘', variants, 'A')).toEqual({
      targetId: 'A', sourceId: null, intentType: 'refine',
    });
  });

  it('소문자 b안 → 대문자 B 정규화', () => {
    expect(parseIntent('b안 수정해줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: null, intentType: 'refine',
    });
  });

  it('A안 바탕으로 B안 → create_derived (바탕 키워드)', () => {
    expect(parseIntent('A안 바탕으로 B안 제작해줘', variants, 'A')).toEqual({
      targetId: 'B', sourceId: 'A', intentType: 'create_derived',
    });
  });

  it('소스만 있고 activeVariantId null → create_new', () => {
    const result = parseIntent('A안 기반으로 만들어줘', variants, null);
    expect(result.intentType).toBe('create_new');
    expect(result.targetId).toBeNull();
  });

  it('B안 기반으로 A안에 source에 존재하는 구매 유도 배너 추가 → refine_with_reference', () => {
    const variantsWithBanner = [
      { id: 'A', html: '<html><body><main>A existing UI</main></body></html>' },
      { id: 'B', html: '<html><body><section class="purchase-banner">첫 구매 혜택 CTA</section><main>B UI</main></body></html>' },
      { id: 'C', html: null },
    ];

    expect(parseIntent('B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘', variantsWithBanner, 'A')).toEqual({
      targetId: 'A',
      sourceId: 'B',
      intentType: 'refine_with_reference',
    });
  });

  it('A안 기반으로 B안에 source에 없는 신규 요소 추가 → create_derived 유지', () => {
    expect(parseIntent('A안 기반으로 B안에 카테고리 필터칩을 상단에 추가한 버전 만들어줘', variants, 'A')).toEqual({
      targetId: 'B',
      sourceId: 'A',
      intentType: 'create_derived',
    });
  });

  it('B안 기반으로 A안에 추가 요청이지만 source feature 근거가 없으면 create_derived 유지', () => {
    expect(parseIntent('B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘', variants, 'A')).toEqual({
      targetId: 'A',
      sourceId: 'B',
      intentType: 'create_derived',
    });
  });

  it('A안 기반으로 B안 새 버전 제작 → create_derived 유지', () => {
    expect(parseIntent('A안 기반으로 B안을 새로 재구성해줘', variants, 'A')).toEqual({
      targetId: 'B',
      sourceId: 'A',
      intentType: 'create_derived',
    });
  });
});
