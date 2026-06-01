import { describe, it, expect } from 'vitest';
import { buildPlaygroundRequestPayload } from '../playground-request.js';

const variants = [
  { id: 'A', html: '<html><body><main>A content</main></body></html>' },
  { id: 'B', html: '<html><body><section class="purchase-banner">B banner</section><main>B content</main></body></html>' },
  { id: 'C', html: null },
];

const messages = [
  { role: 'user', content: '장바구니 빈 상태 화면 A안·B안 두 가지 만들어줘' },
  { role: 'assistant', content: 'A안과 B안을 만들었어요.' },
];

describe('buildPlaygroundRequestPayload', () => {
  it('refine_with_reference uses target html as currentHtml and source html as referenceHtml', () => {
    const payload = buildPlaygroundRequestPayload({
      userText: 'B안 기반으로 A안에 구매 유도 배너를 상단에 추가한 버전 만들어줘',
      messages,
      variants,
      activeVariantId: 'A',
      userContext: undefined,
    });

    expect(payload.mode).toBe('refine');
    expect(payload.targetVariantId).toBe('A');
    expect(payload.sourceVariantId).toBe('B');
    expect(payload.intentType).toBe('refine_with_reference');
    expect(payload.currentHtml).toContain('A content');
    expect(payload.referenceHtml).toContain('B banner');
  });

  it('create_derived keeps source html as currentHtml for explicit rebuild requests', () => {
    const payload = buildPlaygroundRequestPayload({
      userText: 'A안 기반으로 B안을 새로 재구성해줘',
      messages,
      variants,
      activeVariantId: 'A',
      userContext: undefined,
    });

    expect(payload.targetVariantId).toBe('B');
    expect(payload.sourceVariantId).toBe('A');
    expect(payload.intentType).toBe('create_derived');
    expect(payload.currentHtml).toContain('A content');
    expect(payload.referenceHtml).toBeUndefined();
  });

  it('plain target refine uses target html only', () => {
    const payload = buildPlaygroundRequestPayload({
      userText: 'B안에 필터칩 추가해줘',
      messages,
      variants,
      activeVariantId: 'A',
      userContext: undefined,
    });

    expect(payload.targetVariantId).toBe('B');
    expect(payload.intentType).toBe('refine');
    expect(payload.currentHtml).toContain('B content');
    expect(payload.referenceHtml).toBeUndefined();
  });
});
