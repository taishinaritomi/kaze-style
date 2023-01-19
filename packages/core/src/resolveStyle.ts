import type { ClassNameRecord } from './ClassName';
import type { CssRule } from './styleOrder';
import { getStyleOrder } from './styleOrder';
import type { Selectors } from './types/common';
import type { SupportStyle, KeyframesRules } from './types/style';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { isCssValue } from './utils/isCssValue';
import { isObject } from './utils/isObject';
import { resolveSelectors } from './utils/resolveSelectors';
import { styleDeclarationStringify } from './utils/styleDeclarationStringify';

type ResolvedStyle = [classNameRecord: ClassNameRecord, cssRules: CssRule[]];

export const resolveStyle = (
  style: SupportStyle,
  selectors: Selectors = [[], ''],
  resolvedStyle: ResolvedStyle = [{}, []],
): ResolvedStyle => {
  const classNameRecord = resolvedStyle[0];
  const cssRules = resolvedStyle[1];
  for (const _property in style) {
    const property = _property as keyof SupportStyle;
    const styleValue = style[property];
    if (isCssValue(styleValue)) {
      const className = hashClassName(selectors, property, styleValue);
      const selector = hashSelector(selectors, property);
      cssRules.push([
        compileCss(
          `.${className}`,
          selectors,
          styleDeclarationStringify(property, styleValue),
        ),
        getStyleOrder(selectors),
      ]);
      Object.assign(classNameRecord, { [selector]: className });
    } else if (isObject(styleValue)) {
      if (property === 'animationName') {
        const animationNameValue = styleValue as KeyframesRules;
        const [keyframesName, keyframesRule] =
          compileKeyFrameCss(animationNameValue);
        cssRules.push([keyframesRule, 'keyframes']);
        Object.assign(classNameRecord, { [keyframesName]: keyframesName });
        resolveStyle(
          { animationName: keyframesName },
          selectors,
          resolvedStyle,
        );
      } else {
        resolveStyle(
          styleValue,
          resolveSelectors(selectors, property),
          resolvedStyle,
        );
      }
    }
  }
  return resolvedStyle;
};
