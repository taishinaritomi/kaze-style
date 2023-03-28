import type { CssRule, StyleOrder } from '@kaze-style/core';
import { uniqueCssRules, sortCssRules } from '@kaze-style/core';
import type { Element } from 'stylis';
import { serialize, stringify, compile } from 'stylis';
import { LAYER_PREFIX } from './constants';

export const stringToCssRules = (
  src: string,
): [cssRules: CssRule[], other: string] => {
  const otherElements: Element[] = [];
  const cssRules: CssRule[] = [];

  compile(src).forEach((element) => {
    if (element.value.startsWith(`@layer ${LAYER_PREFIX}`)) {
      const order = element.value.substring(
        `@layer ${LAYER_PREFIX}`.length,
      ) as StyleOrder;
      cssRules.push([
        serialize(element.children as Element[], stringify),
        order,
      ]);
    } else {
      otherElements.push(element);
    }
  });
  return [
    sortCssRules(uniqueCssRules(cssRules)),
    serialize(otherElements, stringify),
  ];
};
