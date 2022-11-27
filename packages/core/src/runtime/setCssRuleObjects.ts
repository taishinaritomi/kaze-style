import type { CssRule } from '../styleOrder';
import { getStyleElements } from './getStyleElements';

export const setCssRules = (cssRules: CssRule[]) => {
  const styleElements = getStyleElements();
  cssRules.forEach((cssRule) => {
    const style = styleElements[cssRule.order];
    style.rules = Array.from(new Set([...style.rules, cssRule.value]));
    style.innerText = style.rules.join('');
  });
};
