import type { CssRuleObject } from '@kaze-style/core';
import { styleOrder } from '@kaze-style/core';

export const cssRuleObjectsToCssString = (cssRuleObjects: CssRuleObject[]) => {
  return `
    @layer ${styleOrder.map((order) => `kaze${order}`).join(',')};
    ${cssRuleObjects
      .map((cssRuleObject) => {
        return `@layer kaze${cssRuleObject.order}{${cssRuleObject.cssRule}}`;
      })
      .join('')}
  `;
};
