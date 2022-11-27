import type { CssRule } from './styleOrder';

export const uniqueCssRules = (cssRules: CssRule[]) => {
  return Array.from(
    new Map(cssRules.map((cssRule) => [cssRule.value, cssRule])).values(),
  );
};
