import type { StyleOrder } from './styleOrder';
import type { CssRule } from './types/common';
import type { Selectors } from './types/common';
import type { KeyframesRules, SupportStyle } from './types/style';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { isCssValue } from './utils/isCssValue';
import { isObject } from './utils/isObject';
import { resolveDeclaration } from './utils/resolveDeclaration';
import { resolveSelectors } from './utils/resolveSelectors';

type Resolved = [cssRules: CssRule[]];

export const compileNotAtomicCss = (
  style: SupportStyle,
  styleOrder: StyleOrder,
  baseSelector: string,
  selectors: Selectors = ['', [], ''],
  resolved: Resolved = [[]],
) => {
  const cssDeclarations: string[] = [];
  const cssRules = resolved[0];
  for (const property in style) {
    const styleValue = style[property as keyof SupportStyle];
    if (isCssValue(styleValue)) {
      cssDeclarations.push(resolveDeclaration(property, styleValue));
    } else if (isObject(styleValue)) {
      if (property === 'animationName') {
        const animationNameValue = style[property] as KeyframesRules;
        const [keyframesName, keyframesRule] =
          compileKeyFrameCss(animationNameValue);
        cssRules.push([keyframesRule, 'keyframes']);
        cssDeclarations.push(
          resolveDeclaration('animationName', keyframesName),
        );
      } else {
        const [_cssRules] = compileNotAtomicCss(
          styleValue,
          styleOrder,
          baseSelector,
          resolveSelectors(selectors, property),
        );
        cssRules.push(..._cssRules);
      }
    }
  }

  if (cssDeclarations.length !== 0) {
    cssRules.unshift([
      compileCss(baseSelector, selectors, cssDeclarations.join('')),
      styleOrder,
    ]);
  }
  return resolved;
};
