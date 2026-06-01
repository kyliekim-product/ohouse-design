import { describe, it, expect } from 'vitest';
import { mergeTargetVariantHtml } from '../variant-merge.js';

describe('mergeTargetVariantHtml', () => {
  it('updates only target variant html', () => {
    const prev = [
      { id: 'A', html: '<html>A old</html>', label: 'A' },
      { id: 'B', html: '<html>B old</html>', label: 'B' },
    ];

    const next = mergeTargetVariantHtml(prev, 'A', '<html>A new</html>');

    expect(next).toEqual([
      { id: 'A', html: '<html>A new</html>', label: 'A' },
      { id: 'B', html: '<html>B old</html>', label: 'B' },
    ]);
  });

  it('returns previous variants unchanged when target is missing', () => {
    const prev = [{ id: 'A', html: '<html>A old</html>', label: 'A' }];
    expect(mergeTargetVariantHtml(prev, 'B', '<html>B new</html>')).toBe(prev);
  });
});
