import type { CssValue, Selectors } from '../types/common';
import type { AndArray, NestedObj } from '../types/utils';
import { compileCss } from './compileCss';
import { isCssValue } from './isCssValue';
import { isObject } from './isObject';
import { resolveSelectors } from './resolveSelectors';
import { styleDeclarationStringify } from './styleDeclarationStringify';

type ResolvedStyle = [rules: string[]];

export const compileObjectCss = (
  style: NestedObj<AndArray<CssValue>>,
  selector: string,
  selectors: Selectors = [[], ''],
  resolvedStyle: ResolvedStyle = [[]],
) => {
  const cssBlock: string[] = [];
  for (const property in style) {
    const value = style[property];
    if (isCssValue(value)) {
      cssBlock.push(styleDeclarationStringify(property, value));
    } else if (isObject(value)) {
      compileObjectCss(
        value,
        selector,
        resolveSelectors(selectors, property),
        resolvedStyle,
      );
    }
  }

  if (cssBlock.length !== 0) {
    const cssRule = compileCss(selector, selectors, cssBlock.join(''));
    resolvedStyle[0].push(cssRule);
  }
  return resolvedStyle[0];
};
