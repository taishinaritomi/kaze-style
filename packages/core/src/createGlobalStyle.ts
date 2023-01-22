import { compileNotAtomicCss } from './compileNotAtomicCss';
import type { CssRule } from './styleOrder';
import type { CssValue } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';
import type { AndArray, NestObj } from './types/utils';
import { uniqueCssRules } from './uniqueCssRules';

type Result = [cssRules: CssRule[]];

export const createGlobalStyle = <T extends string>(
  _styles: KazeGlobalStyle<T>,
): Result => {
  const cssRules: CssRule[] = [];
  const styles = _styles as Record<T, NestObj<AndArray<CssValue>>>;
  for (const selector in styles) {
    const style = styles[selector];
    const [_cssRules] = compileNotAtomicCss(style, 'global', selector);
    cssRules.push(..._cssRules);
  }
  return [uniqueCssRules(cssRules)];
};
