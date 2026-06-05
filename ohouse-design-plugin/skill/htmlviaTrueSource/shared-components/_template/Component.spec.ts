// {ComponentName} Playwright 정합성 검증
// 기준: ODS 카탈로그(catalog.json). expected = ODS 토큰값, actual = computed style.
import { test, expect } from '@playwright/test';

const URL = process.env.HARNESS_URL || 'http://localhost:8765/preview-harness.html';

test.describe('{ComponentName} ODS 정합성', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(URL);
  });

  test('토큰: 색·타이포가 ODS 카탈로그와 일치', async ({ page }) => {
    const el = page.getByTestId('component-root');
    // 예: 텍스트 색 = foreground(#141414)
    await expect(el).toHaveCSS('color', 'rgb(20, 20, 20)');
    // 예: 타이포 textStyle
    // await expect(el).toHaveCSS('font-size', '14px');
  });

  test('상태: hover/focus/disabled 스타일', async ({ page }) => {
    // const el = page.getByTestId('component-root');
    // await el.hover(); await expect(el).toHaveCSS('background-color', '...');
  });

  test('a11y: role/name·focus 가시성', async ({ page }) => {
    // await expect(page.getByRole('...', { name: '...' })).toBeVisible();
  });

  test('에셋: 이모지/임의 글리프 미사용', async ({ page }) => {
    const html = await page.content();
    const emoji = html.match(/[\u{1F000}-\u{1FAFF}☀-➿★☆]/u);
    expect(emoji, `이모지/글리프 잔존: ${emoji}`).toBeNull();
  });
});
