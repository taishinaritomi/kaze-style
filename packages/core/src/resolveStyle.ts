import type { ClassName } from './ClassName';
import type { CSSKeyframesRules, CssRules, KazeStyle } from './types/style';
import type { ValueOf } from './types/utils';
import { combinedQuery } from './utils/combinedQuery';
import { compileCSS } from './utils/compileCSS';
import { compileKeyFrameCSS } from './utils/compileKeyFrameCSS';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { hyphenateProperty } from './utils/hyphenateProperty';
import { isLayerSelector } from './utils/isLayerSelector';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isObject } from './utils/isObject';
import { isShortHandProperty } from './utils/isShortHandProperty';
import { isSupportQuerySelector } from './utils/isSupportQuerySelector';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';
import { omit } from './utils/omit';
import { resolveShortHandStyle } from './utils/resolveShortHandStyle';

type ResolvedStyle = {
  classNameObject: ClassName['object'];
  cssRules: CssRules;
};

export type AtRules = {
  media: string;
  layer: string;
  support: string;
};

type Args = {
  style: KazeStyle;
  pseudo?: string;
  atRules?: AtRules;
  resolvedStyle?: ResolvedStyle;
};

export const resolveStyle = ({
  style,
  pseudo = '',
  atRules = { media: '', layer: '', support: '' },
  resolvedStyle = { classNameObject: {}, cssRules: [] },
}: Args): ResolvedStyle => {
  for (const _property in style) {
    const property = _property as keyof KazeStyle;
    const styleValue: ValueOf<KazeStyle> = style[property];
    if (
      typeof styleValue === 'string' ||
      typeof styleValue === 'number' ||
      Array.isArray(styleValue)
    ) {
      if (isShortHandProperty(property)) {
        const resolvedShortHandStyle = resolveShortHandStyle(
          property,
          styleValue,
        );
        resolveStyle({
          style: Object.assign(omit(style, [property]), resolvedShortHandStyle),
          pseudo,
          atRules,
          resolvedStyle,
        });
      } else {
        const hyphenatedProperty = hyphenateProperty(property);
        const className = hashClassName({
          pseudo,
          atRules,
          property: hyphenatedProperty,
          styleValue,
        });
        const selector = hashSelector({
          pseudo,
          atRules,
          property: hyphenatedProperty,
        });
        const cssRule = compileCSS({
          className,
          pseudo,
          atRules,
          property: hyphenatedProperty,
          styleValue,
        });
        resolvedStyle.cssRules.push(cssRule);
        Object.assign(resolvedStyle.classNameObject, { [selector]: className });
      }
    } else if (property === 'animationName') {
      const animationNameValue = styleValue as CSSKeyframesRules;
      const { keyframesRule, keyframeName } =
        compileKeyFrameCSS(animationNameValue);
      resolvedStyle.cssRules.push(keyframesRule);
      Object.assign(resolvedStyle.classNameObject, {
        [keyframeName]: keyframeName,
      });
      resolveStyle({
        style: { animationName: keyframeName },
        pseudo,
        atRules,
        resolvedStyle,
      });
    } else if (isObject(styleValue)) {
      if (isMediaQuerySelector(property)) {
        const combinedMediaQuery = combinedQuery(
          atRules.media,
          property.slice(6).trim(),
        );
        resolveStyle({
          style: styleValue,
          pseudo,
          atRules: Object.assign(atRules, { media: combinedMediaQuery }),
          resolvedStyle,
        });
      } else if (isLayerSelector(property)) {
        const combinedLayerQuery =
          (atRules.layer ? `${atRules.layer}.` : '') + property.slice(6).trim();
        resolveStyle({
          style: styleValue,
          pseudo,
          atRules: Object.assign(atRules, { layer: combinedLayerQuery }),
          resolvedStyle,
        });
      } else if (isSupportQuerySelector(property)) {
        const combinedSupportQuery = combinedQuery(
          atRules.support,
          property.slice(9).trim(),
        );
        resolveStyle({
          style: styleValue,
          pseudo,
          atRules: Object.assign(atRules, { support: combinedSupportQuery }),
          resolvedStyle,
        });
      } else if (isNestedSelector(property)) {
        resolveStyle({
          style: styleValue,
          pseudo: pseudo + normalizeNestedProperty(property),
          atRules,
          resolvedStyle,
        });
      }
    }
  }
  return resolvedStyle;
};
