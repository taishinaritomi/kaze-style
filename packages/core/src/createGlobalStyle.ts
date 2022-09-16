import type { KazeGlobalStyle } from './types/style';
import { compileObjectCSS } from './utils/compileObjectCSS';

type Result = {
  cssRules: string[];
};

export const createGlobalStyle = <Selector extends string>(
  globalStyles: Record<Selector, KazeGlobalStyle>,
): Result => {
  const allCSS = new Set<string>();
  for (const selector in globalStyles) {
    const selectorStyle: KazeGlobalStyle = globalStyles[selector];
    const compiledStyle = compileObjectCSS(selectorStyle);
    compiledStyle !== '' && allCSS.add(`${selector} {${compiledStyle}}`);
  }
  return {
    cssRules: Array.from(allCSS),
  };
};
