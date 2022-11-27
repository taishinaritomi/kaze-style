import type { CssRule } from './styleOrder';
import type { CssValue } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';
import type { AndArray, NestedObj } from './types/utils';
import { uniqueCssRules } from './uniqueCssRules';
import { compileNestedCss } from './utils/compileNestedCss';

type Result = {
  cssRules: CssRule[];
};

export const createGlobalStyle = <T extends string>(
  _styles: KazeGlobalStyle<T>,
): Result => {
  const allCssRules: CssRule[] = [];
  const styles = _styles as Record<T, NestedObj<AndArray<CssValue>>>;
  for (const selector in styles) {
    const style = styles[selector];
    const rules = compileNestedCss({
      style: style,
      selector,
    });
    allCssRules.push(
      ...rules.map(
        (rule) =>
          ({
            value: rule,
            order: 'global',
          } as const),
      ),
    );
  }
  return {
    cssRules: uniqueCssRules(allCssRules),
  };
};
