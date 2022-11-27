import type { CssRule, StyleOrder } from '@kaze-style/core';
import { sortCssRules, uniqueCssRules } from '@kaze-style/core';
import type { Element } from 'stylis';
import { serialize, stringify, compile } from 'stylis';
import { layerPrefix } from './constants';

export const sortCss = (css: string): string => {
  const otherElements: Element[] = [];
  const cssRules: CssRule[] = [];

  compile(css).forEach((element) => {
    if (element.value.startsWith(`@layer ${layerPrefix}`)) {
      const order = element.value.substring(
        `@layer ${layerPrefix}`.length,
      ) as StyleOrder;
      cssRules.push({
        order,
        value: serialize(element.children as Element[], stringify),
      });
    } else {
      otherElements.push(element);
    }
  });

  const _uniqueCssRules = uniqueCssRules(cssRules);
  const sortedCssRules = sortCssRules(_uniqueCssRules);
  return (
    sortedCssRules.map((cssRule) => cssRule.value).join('') +
    serialize(otherElements, stringify)
  );
};
