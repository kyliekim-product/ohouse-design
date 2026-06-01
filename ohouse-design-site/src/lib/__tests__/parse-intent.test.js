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
});
