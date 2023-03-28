import type { CssRule, StyleOrder } from '@kaze-style/core';
import { sortCssRules, uniqueCssRules } from '@kaze-style/core';
import { styleOrder } from '@kaze-style/core';
import { LAYER_PREFIX } from './constants';

const getLayers = () => {
  return `@layer ${styleOrder
    .map((order) => `${LAYER_PREFIX}${order}`)
    .join(',')};`;
};

type Options = {
  layer?: boolean;
  layerBundle?: boolean;
};

export const cssRulesToString = (
  _cssRules: CssRule[],
  { layer = false, layerBundle = false }: Options = {},
) => {
  let css = '';

  if (layer) css += getLayers();

  const cssRules = sortCssRules(uniqueCssRules(_cssRules));

  if (layer === true) {
    if (layerBundle) {
      const cssObject = {} as Record<StyleOrder, string[]>;
      cssRules.forEach(([value, order]) => {
        (cssObject[order] ??= []).push(value);
      });
      for (const order in cssObject) {
        const cssRules = cssObject[order as keyof typeof cssObject];
        const layerCss = `@layer ${LAYER_PREFIX}${order}{${cssRules.join('')}}`;
        css += layerCss;
      }
    } else {
      css += cssRules
        .map(([value, order]) => {
          return `@layer ${LAYER_PREFIX}${order}{${value}}`;
        })
        .join('');
    }
  } else {
    css += cssRules.map(([value]) => value).join('');
  }
  return css;
};
