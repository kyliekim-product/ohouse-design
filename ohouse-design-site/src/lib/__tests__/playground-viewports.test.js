import { describe, it, expect } from 'vitest';
import { PLAYGROUND_VIEWPORT_SPECS } from '../playground-viewports.js';

describe('PLAYGROUND_VIEWPORT_SPECS', () => {
  it('includes desktop web as the fourth preview selector type', () => {
    expect(Object.keys(PLAYGROUND_VIEWPORT_SPECS)).toEqual(['ios', 'aos', 'web', 'desktop']);
    expect(PLAYGROUND_VIEWPORT_SPECS.desktop).toMatchObject({
      label: 'Desktop',
      device: 'Desktop Web',
      width: 1200,
      height: 780,
      chrome: 'browser',
    });
  });
});
