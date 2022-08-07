import type { CSSKeyframes, KazeStyle } from './types/Style';
import type { ValueOf } from './types/Utils';
import { combinedQuery } from './utils/combinedQuery';
import { compileCSS } from './utils/compileCSS';
import { compileKeyFrameCSS } from './utils/compileKeyFrameCSS';
import { hashClassName } from './utils/hashClassName';
import { isMediaQuerySelector } from './utils/isMediaQuerySelector';
import { isNestedSelector } from './utils/isNestedSelector';
import { isObject } from './utils/isObject';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';

type Args = {
  style: KazeStyle;
  pseudo?: string;
  media?: string;
  resultStyle?: Record<string, string[]>;
};

type Result = {
  resultStyle: Record<string, string[]>;
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
    if (!styleValue) return { resultStyle };

    if (typeof styleValue === 'string' || typeof styleValue === 'number') {
      const className = hashClassName({ property, pseudo, media, styleValue });
      const rules = compileCSS({
        className,
        property,
        styleValue: styleValue.toString(),
        media,
        pseudo,
      });
      Object.assign(resultStyle, { [className]: rules });
    } else if (property === 'animationName') {
      const animationNameValue = styleValue as CSSKeyframes;
      const { keyframesRules, keyframeName } =
        compileKeyFrameCSS(animationNameValue);
      resolveStyle({
        style: { animationName: keyframeName },
        pseudo,
        media,
        resultStyle: Object.assign(resultStyle, {
          [keyframeName]: keyframesRules,
        }),
      });
    } else if (isObject(styleValue)) {
      if (isNestedSelector(property)) {
        resolveStyle({
          style: styleValue,
          pseudo: pseudo + normalizeNestedProperty(property),
          media,
          resultStyle,
        });
      } else if (isMediaQuerySelector(property)) {
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
      }
    }
  }
  return { resultStyle };
};
