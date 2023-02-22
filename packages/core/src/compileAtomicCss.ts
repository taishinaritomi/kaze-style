import type { ClassName } from './ClassName';
import { getStyleOrder } from './styleOrder';
import type { CssRule } from './types/common';
import type { Selectors } from './types/common';
import type { KeyframesRules, SupportStyle } from './types/style';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { isCssValue } from './utils/isCssValue';
import { isObject } from './utils/isObject';
import { resolveDeclaration } from './utils/resolveDeclaration';
import { resolveSelectors } from './utils/resolveSelectors';

type Resolved = [cssRules: CssRule[], classNameStatic: ClassName['Static']];

export const compileAtomicCss = (
  style: SupportStyle,
  selectors: Selectors = ['', [], ''],
  resolved: Resolved = [[], {}],
): Resolved => {
  const cssRules = resolved[0];
  const classNameStatic = resolved[1];
  for (const property in style) {
    const styleValue = style[property as keyof SupportStyle];
    if (isCssValue(styleValue)) {
      const className = hashClassName(selectors, property, styleValue);
      const selector = hashSelector(selectors, property);
      cssRules.push([
        compileCss(
          `.${className}`,
          selectors,
          resolveDeclaration(property, styleValue),
        ),
        getStyleOrder(selectors),
      ]);
      Object.assign(classNameStatic, { [selector]: className });
    } else if (isObject(styleValue)) {
      if (property === 'animationName') {
        const animationNameValue = styleValue as KeyframesRules;
        const [keyframesName, keyframesRule] =
          compileKeyFrameCss(animationNameValue);
        cssRules.push([keyframesRule, 'keyframes']);
        Object.assign(classNameStatic, { [keyframesName]: keyframesName });
        compileAtomicCss({ animationName: keyframesName }, selectors, resolved);
      } else {
        compileAtomicCss(
          styleValue,
          resolveSelectors(selectors, property),
          resolved,
        );
      }
    }
  }
  return resolved;
};
