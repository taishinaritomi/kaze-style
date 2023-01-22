import type { StyleOrder, CssRule } from './styleOrder';
import type { CssValue, Selectors } from './types/common';
import type { KeyframesRules } from './types/style';
import type { AndArray, NestObj } from './types/utils';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { isCssValue } from './utils/isCssValue';
import { isObject } from './utils/isObject';
import { resolveSelectors } from './utils/resolveSelectors';
import { styleDeclarationStringify } from './utils/styleDeclarationStringify';

type ResolvedStyle = [rules: CssRule[]];

export const compileNotAtomicCss = (
  style: NestObj<AndArray<CssValue>>,
  styleOrder: StyleOrder,
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
      if (property === 'animationName') {
        const animationNameValue = style[property] as KeyframesRules;
        const [keyframesName, keyframesRule] =
          compileKeyFrameCss(animationNameValue);
        resolvedStyle[0].push([keyframesRule, 'keyframes']);
        cssBlock.push(
          styleDeclarationStringify('animationName', keyframesName),
        );
      } else {
        compileNotAtomicCss(
          value,
          styleOrder,
          selector,
          resolveSelectors(selectors, property),
          resolvedStyle,
        );
      }
    }
  }

  if (cssBlock.length !== 0) {
    resolvedStyle[0].push([
      compileCss(selector, selectors, cssBlock.join('')),
      styleOrder,
    ]);
  }
  return resolvedStyle;
};
