import type { CssRuleObject } from './styleOrder';
import type { CssValue } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';
import type { AndArray, NestedObj } from './types/utils';
import { compileObjectCss } from './utils/compileObjectCss';
import { cssRuleObjectsUniquify } from './utils/cssRuleObjectsUniquify';

type Result = {
  cssRuleObjects: CssRuleObject[];
};

export const createGlobalStyle = <T extends string>(
  _styles: KazeGlobalStyle<T>,
): Result => {
  const allCssRuleObjects: CssRuleObject[] = [];
  const styles = _styles as Record<T, NestedObj<AndArray<CssValue>>>;
  for (const selector in styles) {
    const style = styles[selector];
    const cssRules = compileObjectCss({
      style: style,
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
