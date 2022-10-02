import type { CssRules, KazeGlobalStyle } from './types/style';
import type { ValueOf } from './types/utils';
import { compileObjectCSS } from './utils/compileObjectCSS';

type Result = {
  cssRules: CssRules;
};

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): Result => {
  const allCSS = new Set<string>();
  for (const selector in globalStyles) {
    const selectorStyle =
      globalStyles[selector as keyof ValueOf<KazeGlobalStyle>];
    const compiledStyle = compileObjectCSS(selectorStyle);
    compiledStyle !== '' && allCSS.add(`${selector} {${compiledStyle}}`);
  }
  return {
    cssRules: Array.from(allCSS),
  };
};
