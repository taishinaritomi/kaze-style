import type { CssRules, KazeGlobalStyle } from './types/style';
import { compileObjectCss } from './utils/compileObjectCss';

type Result = {
  cssRules: CssRules;
};

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): Result => {
  const allCss = new Set<string>();
  for (const selector in globalStyles) {
    const selectorStyle = globalStyles[selector as keyof KazeGlobalStyle];
    const compiledStyle = compileObjectCss(selectorStyle || {});
    compiledStyle !== '' && allCss.add(`${selector} {${compiledStyle}}`);
  }
  return {
    cssRules: Array.from(allCss),
  };
};
