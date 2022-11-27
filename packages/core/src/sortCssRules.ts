import type { CssRule } from './styleOrder';
import { styleOrder } from './styleOrder';

export const sortCssRules = (cssRules: CssRule[]) => {
  return cssRules.sort((ruleA, ruleB) => {
    if (ruleA.order === ruleB.order) return 0;
    return styleOrder.indexOf(ruleA.order) - styleOrder.indexOf(ruleB.order);
  });
};
