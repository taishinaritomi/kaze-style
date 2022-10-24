import type { ClassName } from './ClassName';
import type { CssRuleObject } from './styleOrder';
import type { CssKeyframesRules, SupportStyle } from './types/style';
import { checkStyleOrder } from './utils/checkStyleOrder';
import { combinedQuery } from './utils/combinedQuery';
import { compileCss } from './utils/compileCss';
import { compileKeyFrameCss } from './utils/compileKeyFrameCss';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { hyphenateProperty } from './utils/hyphenateProperty';
import { isCssValue } from './utils/isCssValue';
import { isLayerSelector } from './utils/isLayerSelector';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isObject } from './utils/isObject';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';

type ResolvedStyle = {
  classNameObject: ClassName['object'];
  cssRuleObjects: CssRuleObject[];
};

export type Selectors = {
  media: string;
  layer: string;
  support: string;
  pseudo: string;
};

type Args = {
  style: SupportStyle;
  selectors?: Selectors;
  resolvedStyle?: ResolvedStyle;
};

export const resolveStyle = ({
  style,
  selectors = { media: '', layer: '', support: '', pseudo: '' },
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
      } else if (isMediaQuerySelector(property)) {
        const combinedMediaQuery = combinedQuery(
          selectors.media,
          property.slice(6).trim(),
        );
        resolveStyle({
          style: styleValue,
          selectors: Object.assign({}, selectors, {
            media: combinedMediaQuery,
          }),
          resolvedStyle,
        });
      } else if (isLayerSelector(property)) {
        const combinedLayerQuery =
          (selectors.layer ? `${selectors.layer}.` : '') +
          property.slice(6).trim();
        resolveStyle({
          style: styleValue,
          selectors: Object.assign({}, selectors, {
            layer: combinedLayerQuery,
          }),
          resolvedStyle,
        });
      } else if (isSupportQuerySelector(property)) {
        const combinedSupportQuery = combinedQuery(
          selectors.support,
          property.slice(9).trim(),
        );
        resolveStyle({
          style: styleValue,
          selectors: Object.assign({}, selectors, {
            support: combinedSupportQuery,
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
