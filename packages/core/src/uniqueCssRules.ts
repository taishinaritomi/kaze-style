import type { CssRule } from './types/common';

export const uniqueCssRules = (cssRules: CssRule[]) => {
  return Array.from(
    new Map(cssRules.map((cssRule) => [cssRule[0], cssRule])).values(),
  );
};
