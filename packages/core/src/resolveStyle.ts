import type { ClassName } from './ClassName';
import type { CssRuleObject } from './styleOrder';
import type { Selectors } from './types/common';
import type { SupportStyle, KeyframesRules } from './types/style';
import { checkStyleOrder } from './utils/checkStyleOrder';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { isCssValue } from './utils/isCssValue';
import { isObject } from './utils/isObject';
import { resolveSelectors } from './utils/resolveSelectors';
import { styleDeclarationStringify } from './utils/styleDeclarationStringify';

type ResolvedStyle = {
  classNameObject: ClassName['object'];
  cssRuleObjects: CssRuleObject[];
};

type Args = {
  style: SupportStyle;
  selectors?: Selectors;
  resolvedStyle?: ResolvedStyle;
};

export const resolveStyle = ({
  style,
  selectors = { nested: '', atRules: [] },
  resolvedStyle = {
    classNameObject: {},
    cssRuleObjects: [],
  },
}: Args): ResolvedStyle => {
  for (const _property in style) {
    const property = _property as keyof SupportStyle;
    const styleValue = style[property];
    if (isCssValue(styleValue)) {
      const className = hashClassName({
        selectors,
        property,
        styleValue,
      });
      const selector = hashSelector({
        selectors,
        property,
      });
      const rule = compileCss({
        selector: `.${className}`,
        selectors,
        declaration: styleDeclarationStringify({
          property,
          styleValue,
        }),
      });

      const order = checkStyleOrder({ selectors });

      resolvedStyle.cssRuleObjects.push({ rule, order });
      Object.assign(resolvedStyle.classNameObject, { [selector]: className });
    } else if (isObject(styleValue)) {
      if (property === 'animationName') {
        const animationNameValue = styleValue as KeyframesRules;
        const { keyframesRule, keyframeName } =
          compileKeyFrameCss(animationNameValue);
        resolvedStyle.cssRuleObjects.push({
          rule: keyframesRule,
          order: 'keyframes',
        });
        Object.assign(resolvedStyle.classNameObject, {
          [keyframeName]: keyframeName,
        });
        resolveStyle({
          style: { animationName: keyframeName },
          selectors,
          resolvedStyle,
        });
      } else {
        resolveStyle({
          style: styleValue,
          selectors: resolveSelectors({ property, selectors }),
          resolvedStyle,
        });
      }
    }
  }
  return resolvedStyle;
};
