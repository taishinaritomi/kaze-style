import type { CssRuleObject } from './styleOrder';
import type { CssValue, KazeGlobalStyle } from './types/style';
import type { AndArray, NestedObj } from './types/utils';
import { compileObjectCss } from './utils/compileObjectCss';

type Result = {
  cssRuleObjects: CssRuleObject[];
};

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): Result => {
  const allCssRuleObjects: CssRuleObject[] = [];
  for (const selector in globalStyles) {
    const selectorStyle = globalStyles[selector] as NestedObj<
      AndArray<CssValue>
    >;
    const cssRules = compileObjectCss({
      style: selectorStyle || {},
      selector,
    });
    cssRules.forEach((cssRule) => {
      allCssRuleObjects.push({
        rule: cssRule,
        order: 'global',
      });
    });
  }
  return {
    cssRuleObjects: Array.from(new Set(allCssRuleObjects)),
  };
};
