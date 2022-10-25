import type { ClassName } from './ClassName';
import type { CssRuleObject } from './styleOrder';
import type { CssKeyframesRules, SupportStyle } from './types/style';
import { checkStyleOrder } from './utils/checkStyleOrder';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { hyphenateProperty } from './utils/hyphenateProperty';
import { isCssValue } from './utils/isCssValue';
import { isNestedSelector } from './utils/isNestedSelector';
import { isObject } from './utils/isObject';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';

type ResolvedStyle = {
  classNameObject: ClassName['object'];
  cssRuleObjects: CssRuleObject[];
};

export type Selectors = {
  pseudo: string;
  atRules: string[];
};

type Args = {
  style: SupportStyle;
  selectors?: Selectors;
  resolvedStyle?: ResolvedStyle;
};

export const resolveStyle = ({
  style,
  selectors = { pseudo: '', atRules: [] },
  resolvedStyle = {
    classNameObject: {},
    cssRuleObjects: [],
  },
}: Args): ResolvedStyle => {
  for (const _property in style) {
    const property = _property as keyof SupportStyle;
    const styleValue = style[property];
    if (isCssValue(styleValue)) {
      const hyphenatedProperty = hyphenateProperty(property);
      const className = hashClassName({
        selectors,
        property: hyphenatedProperty,
        styleValue,
      });
      const selector = hashSelector({
        selectors,
        property: hyphenatedProperty,
      });
      const rule = compileCss({
        className,
        selectors,
        property: hyphenatedProperty,
        styleValue,
      });

      const order = checkStyleOrder({ selectors });

      resolvedStyle.cssRuleObjects.push({ rule, order });
      Object.assign(resolvedStyle.classNameObject, { [selector]: className });
    } else if (isObject(styleValue)) {
      if (property === 'animationName') {
        const animationNameValue = styleValue as CssKeyframesRules;
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
      } else if (property.substring(0, 1) === '@') {
        resolveStyle({
          style: styleValue,
          selectors: Object.assign({}, selectors, {
            atRules: ([property] as string[]).concat(selectors.atRules),
          }),
          resolvedStyle,
        });
      } else if (isNestedSelector(property)) {
        resolveStyle({
          style: styleValue,
          selectors: Object.assign({}, selectors, {
            pseudo: normalizeNestedProperty(property, selectors.pseudo),
          }),
          resolvedStyle,
        });
      }
    }
  }
  return resolvedStyle;
};
