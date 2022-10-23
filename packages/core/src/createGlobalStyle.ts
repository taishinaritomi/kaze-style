import type { CssRuleObject } from './styleOrder';
import type { KazeGlobalStyle } from './types/style';
import { compileObjectCss } from './utils/compileObjectCss';

type Result = {
  cssRuleObjects: CssRuleObject[];
};

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): Result => {
  const allCssRuleObjects: CssRuleObject[] = [];
  for (const selector in globalStyles) {
    const selectorStyle = globalStyles[selector as keyof KazeGlobalStyle];
    const compiledStyle = compileObjectCss(selectorStyle || {});
    if (compiledStyle !== '') {
      allCssRuleObjects.push({
        rule: `${selector} {${compiledStyle}}`,
        order: 'global',
      });
    }
  }
  return {
    cssRuleObjects: Array.from(new Set(allCssRuleObjects)),
  };
};
