import type { CssRule } from './types/common';
import { getStyleElements } from './utils/getStyleElements';

export const setCssRules = (cssRules: CssRule[]) => {
  const styleElements = getStyleElements();
  cssRules.forEach(([rule, order]) => {
    const styleElement = styleElements[order];
    styleElement.r = Array.from(new Set([...styleElement.r, rule]));
    styleElement.innerText = styleElement.r.join('');
  });
};
