import type { CssRuleObject } from '@kaze-style/core';
import { styleOrder } from '@kaze-style/core';
import { layerPrefix } from './utils/constants';

export const cssRuleObjectsToCssString = (cssRuleObjects: CssRuleObject[]) => {
  return `
    @layer ${styleOrder.map((order) => `${layerPrefix}${order}`).join(',')};
    ${cssRuleObjects
      .map(({ order, rule }) => {
        return `@layer ${layerPrefix}${order}{${rule}}`;
      })
      .join('')}
  `;
};
