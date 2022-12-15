import type { CssRule } from './styleOrder';
import { getStyleElements } from './utils/getStyleElements';

export const setCssRules = (cssRules: CssRule[]) => {
  const styleElements = getStyleElements();
  cssRules.forEach(([rule, order]) => {
    const style = styleElements[order];
    style.r = Array.from(new Set([...style.r, rule]));
    style.innerText = style.r.join('');
  });
};
