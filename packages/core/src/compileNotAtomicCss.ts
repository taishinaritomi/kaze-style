import type { StyleOrder, CssRule } from './styleOrder';
import type { Selectors } from './types/common';
import type { KeyframesRules, SupportStyle } from './types/style';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { isCssValue } from './utils/isCssValue';
import { isObject } from './utils/isObject';
import { resolveSelectors } from './utils/resolveSelectors';
import { styleDeclarationStringify } from './utils/styleDeclarationStringify';

type Resolved = [rules: CssRule[]];

export const compileNotAtomicCss = (
  style: SupportStyle,
  styleOrder: StyleOrder,
  selector: string,
  selectors: Selectors = [[], ''],
  resolved: Resolved = [[]],
) => {
  const cssDeclarations: string[] = [];
  for (const property in style) {
    const styleValue = style[property as keyof SupportStyle];
    if (isCssValue(styleValue)) {
      cssDeclarations.push(styleDeclarationStringify(property, styleValue));
    } else if (isObject(styleValue)) {
      if (property === 'animationName') {
        const animationNameValue = style[property] as KeyframesRules;
        const [keyframesName, keyframesRule] =
          compileKeyFrameCss(animationNameValue);
        resolved[0].push([keyframesRule, 'keyframes']);
        cssDeclarations.push(
          styleDeclarationStringify('animationName', keyframesName),
        );
      } else {
        compileNotAtomicCss(
          styleValue,
          styleOrder,
          selector,
          resolveSelectors(selectors, property),
          resolved,
        );
      }
    }
  }

  if (cssDeclarations.length !== 0) {
    resolved[0].push([
      compileCss(selector, selectors, cssDeclarations.join('')),
      styleOrder,
    ]);
  }
  return resolved;
};
