import type { CssRuleObject } from '../styleOrder';
import { getStyleElements } from './getStyleElements';

export const setCssRuleObjects = (cssRuleObjects: CssRuleObject[]) => {
  const styleElements = getStyleElements();
  cssRuleObjects.forEach((cssRuleObject) => {
    const style = styleElements[cssRuleObject.order];
    style.rules = Array.from(new Set([...style.rules, cssRuleObject.cssRule]));
    style.innerText = style.rules.join('');
  });
};
