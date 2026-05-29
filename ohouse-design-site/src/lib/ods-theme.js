import { FONT_WEIGHT, LIGHT_THEME } from '@bucketplace/design-system';

export const odsTheme = LIGHT_THEME;
export const odsFontWeight = FONT_WEIGHT;

function textStyleVars(prefix, textStyle) {
  return {
    [`--${prefix}-font-size`]: textStyle.fontSize,
    [`--${prefix}-line-height`]: textStyle.lineHeight,
    [`--${prefix}-letter-spacing`]: textStyle.letterSpacing,
  };
}

export const odsThemeStyle = {
  '--ods-background': odsTheme.colors.background,
  '--ods-background-weak': odsTheme.colors.backgroundWeak,
  '--ods-background-disabled': odsTheme.colors.backgroundDisabled,
  '--ods-background-brand-weak': odsTheme.colors.backgroundBrandWeak,
  '--ods-border': odsTheme.colors.border,
  '--ods-foreground': odsTheme.colors.foreground,
  '--ods-foreground-weak': odsTheme.colors.foregroundWeak,
  '--ods-foreground-disabled': odsTheme.colors.foregroundDisabled,
  '--ods-foreground-brand': odsTheme.colors.foregroundBrand,
  '--ods-font-regular': odsFontWeight.regular,
  '--ods-font-semibold': odsFontWeight.semibold,
  '--ods-font-bold': odsFontWeight.bold,
  ...textStyleVars('ods-heading32', odsTheme.text.heading32),
  ...textStyleVars('ods-heading24', odsTheme.text.heading24),
  ...textStyleVars('ods-heading20', odsTheme.text.heading20),
  ...textStyleVars('ods-heading18', odsTheme.text.heading18),
  ...textStyleVars('ods-heading17', odsTheme.text.heading17),
  ...textStyleVars('ods-body17-l22', odsTheme.text.body17L22),
  ...textStyleVars('ods-body16-l28', odsTheme.text.body16L28),
  ...textStyleVars('ods-body16-l24', odsTheme.text.body16L24),
  ...textStyleVars('ods-body15-l24', odsTheme.text.body15L24),
  ...textStyleVars('ods-body14-l20', odsTheme.text.body14L20),
  ...textStyleVars('ods-detail13-l18', odsTheme.text.detail13L18),
  ...textStyleVars('ods-detail12-l16', odsTheme.text.detail12L16),
};
