import type { CssRuleObject } from './styleOrder';
import type { CssValue, KazeGlobalStyle } from './types/style';
import type { AndArray, NestedObj } from './types/utils';
import { compileObjectCss } from './utils/compileObjectCss';
import { cssRuleObjectsUniquify } from './utils/cssRuleObjectsUniquify';

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
    allCssRuleObjects.push(
      ...cssRules.map(
        (cssRule) =>
          ({
            rule: cssRule,
            order: 'global',
          } as const),
      ),
    );
  }
  return {
    cssRuleObjects: cssRuleObjectsUniquify(allCssRuleObjects),
  };
};
