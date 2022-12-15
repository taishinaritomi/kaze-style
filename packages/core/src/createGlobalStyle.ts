import type { CssRule } from './styleOrder';
import type { CssValue } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';
import type { AndArray, NestedObj } from './types/utils';
import { uniqueCssRules } from './uniqueCssRules';
import { compileObjectCss } from './utils/compileObjectCss';

type Result = [cssRules: CssRule[]];

export const createGlobalStyle = <T extends string>(
  _styles: KazeGlobalStyle<T>,
): Result => {
  const cssRules: CssRule[] = [];
  const styles = _styles as Record<T, NestedObj<AndArray<CssValue>>>;
  for (const selector in styles) {
    const style = styles[selector];
    const rules = compileObjectCss(style, selector);
    cssRules.push(...rules.map((rule): CssRule => [rule, 'g']));
  }
  return [uniqueCssRules(cssRules)];
};
