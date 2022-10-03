import type { CssRules, KazeGlobalStyle } from './types/style';
import { compileObjectCSS } from './utils/compileObjectCSS';

type Result = {
  cssRules: CssRules;
};

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): Result => {
  const allCSS = new Set<string>();
  for (const selector in globalStyles) {
    const selectorStyle = globalStyles[selector as keyof KazeGlobalStyle];
    const compiledStyle = compileObjectCSS(selectorStyle || {});
    compiledStyle !== '' && allCSS.add(`${selector} {${compiledStyle}}`);
  }
  return {
    cssRules: Array.from(allCSS),
  };
};
