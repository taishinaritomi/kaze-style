import type { CSSKeyframes, CssRules, KazeStyle } from './types/style';
import type { ValueOf } from './types/utils';
import type { ClassName } from './utils/ClassName';
import { combinedQuery } from './utils/combinedQuery';
import { compileCSS } from './utils/compileCSS';
import { compileKeyFrameCSS } from './utils/compileKeyFrameCSS';
import { hashClassName } from './utils/hashClassName';
import { hashSelector } from './utils/hashSelector';
import { hyphenateProperty } from './utils/hyphenateProperty';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isObject } from './utils/isObject';
import { isShortHandProperty } from './utils/isShortHandProperty';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';
import { omit } from './utils/omit';
import { resolveShortHandStyle } from './utils/resolveShortHandStyle';

export type ResolvedStyle = {
  classNameObject: ClassName['object'];
  cssRules: CssRules;
};

type Args = {
  style: KazeStyle;
  pseudo?: string;
  media?: string;
  resolvedStyle?: ResolvedStyle;
};

export const resolveStyle = ({
  style,
  pseudo = '',
  media = '',
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
          media,
          resolvedStyle,
        });
      } else {
        const hyphenatedProperty = hyphenateProperty(property);
        const className = hashClassName({
          media,
          pseudo,
          property: hyphenatedProperty,
          styleValue,
        });
        const selector = hashSelector({
          media,
          pseudo,
          property: hyphenatedProperty,
        });
        const cssRule = compileCSS({
          media,
          pseudo,
          property: hyphenatedProperty,
          styleValue,
          className,
        });
        resolvedStyle.cssRules.push(cssRule);
        Object.assign(resolvedStyle.classNameObject, { [selector]: className });
      }
    } else if (property === 'animationName') {
      const animationNameValue = styleValue as CSSKeyframes;
      const { keyframesRule, keyframeName } =
        compileKeyFrameCSS(animationNameValue);
      resolvedStyle.cssRules.push(keyframesRule);
      Object.assign(resolvedStyle.classNameObject, {
        [keyframeName]: keyframeName,
      });
      resolveStyle({
        style: { animationName: keyframeName },
        pseudo,
        media,
        resolvedStyle,
      });
    } else if (isObject(styleValue)) {
      if (isMediaQuerySelector(property)) {
        const combinedMediaQuery = combinedQuery(
          media,
          property.slice(6).trim(),
        );
        resolveStyle({
          style: styleValue,
          pseudo,
          media: combinedMediaQuery,
          resolvedStyle,
        });
      } else if (isNestedSelector(property)) {
        resolveStyle({
          style: styleValue,
          pseudo: pseudo + normalizeNestedProperty(property),
          media,
          resolvedStyle,
        });
      }
    }
  }
  return resolvedStyle;
};
