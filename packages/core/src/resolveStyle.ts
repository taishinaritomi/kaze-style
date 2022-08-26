import type { CSSKeyframes, KazeStyle } from './types/Style';
import type { ValueOf } from './types/Utils';
import { combinedQuery } from './utils/combinedQuery';
import { compileCSS } from './utils/compileCSS';
import { compileKeyFrameCSS } from './utils/compileKeyFrameCSS';
import { hashClassName } from './utils/hashClassName';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isObject } from './utils/isObject';
import { isShortHandProperty } from './utils/isShortHandProperty';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';
import { omit } from './utils/omit';
import { resolveShortHandStyle } from './utils/resolveShortHandStyle';

type Args = {
  style: KazeStyle;
  pseudo?: string;
  media?: string;
  resultStyle?: Record<string, string>;
};

type Result = {
  resultStyle: Record<string, string>;
};

export const resolveStyle = ({
  style,
  pseudo = '',
  media = '',
  resultStyle = {},
}: Args): Result => {
  for (const _property in style) {
    const property = _property as keyof KazeStyle;
    const styleValue: ValueOf<KazeStyle> = style[property];
    if (
      typeof styleValue === 'string' ||
      typeof styleValue === 'number' ||
      Array.isArray(styleValue)
    ) {
      if (isShortHandProperty(property)) {
        const resolvedStyle = resolveShortHandStyle(property, styleValue);
        resolveStyle({
          style: Object.assign(omit(style, [property]), resolvedStyle),
          pseudo,
          media,
          resultStyle,
        });
      } else {
        const className = hashClassName({
          property,
          pseudo,
          media,
          styleValue,
        });
        const rule = compileCSS({
          className,
          property,
          styleValue,
          media,
          pseudo,
        });
        Object.assign(resultStyle, { [className]: rule });
      }
    } else if (property === 'animationName') {
      const animationNameValue = styleValue as CSSKeyframes;
      const { keyframesRule, keyframeName } =
        compileKeyFrameCSS(animationNameValue);
      resolveStyle({
        style: { animationName: keyframeName },
        pseudo,
        media,
        resultStyle: Object.assign(resultStyle, {
          [keyframeName]: keyframesRule,
        }),
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
          resultStyle,
        });
      } else if (isNestedSelector(property)) {
        resolveStyle({
          style: styleValue,
          pseudo: pseudo + normalizeNestedProperty(property),
          media,
          resultStyle,
        });
      }
    }
  }
  return { resultStyle };
};
