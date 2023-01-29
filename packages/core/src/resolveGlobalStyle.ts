import { compileNotAtomicCss } from './compileNotAtomicCss';
import type { CssRule } from './styleOrder';
import type { CssValue } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';
import type { AndArray, NestObj } from './types/utils';
import { uniqueCssRules } from './uniqueCssRules';

type Result = [cssRules: CssRule[]];

export const resolveGlobalStyle = <T extends string>(
  _globalStyles: KazeGlobalStyle<T>,
): Result => {
  const cssRules: CssRule[] = [];
  const globalStyles = _globalStyles as Record<T, NestObj<AndArray<CssValue>>>;
  for (const selector in globalStyles) {
    const globalStyle = globalStyles[selector];
    const [_cssRules] = compileNotAtomicCss(globalStyle, 'global', selector);
    cssRules.push(..._cssRules);
  }
  return [uniqueCssRules(cssRules)];
};
