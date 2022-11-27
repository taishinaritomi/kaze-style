import type { CssRule } from '@kaze-style/core';
import { styleOrder } from '@kaze-style/core';
import { layerPrefix } from './constants';

export const cssRulesToString = (cssRules: CssRule[]) => {
  return `
    @layer ${styleOrder.map((order) => `${layerPrefix}${order}`).join(',')};
    ${cssRules
      .map(({ order, value }) => {
        return `@layer ${layerPrefix}${order}{${value}}`;
      })
      .join('')}
  `;
};
