import { compileNotAtomicCss } from './compileNotAtomicCss';
import type { CssRule } from './styleOrder';
import type { KazeGlobalStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';

type Result = [cssRules: CssRule[]];

export const resolveGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
): Result => {
  const cssRules: CssRule[] = [];
  for (const selector in globalStyles) {
    const globalStyle = globalStyles[selector as keyof KazeGlobalStyle<T>];
    const [_cssRules] = compileNotAtomicCss(globalStyle, 'global', selector);
    cssRules.push(..._cssRules);
  }
  return [uniqueCssRules(cssRules)];
};
