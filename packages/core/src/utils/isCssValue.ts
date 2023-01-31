import type { CssValue } from '../types/style';
import type { AndArray, NestObj } from '../types/utils';

export const isCssValue = (
  styleValue: NestObj<AndArray<CssValue>> | AndArray<CssValue>,
): styleValue is AndArray<CssValue> => {
  return (
    typeof styleValue === 'string' ||
    typeof styleValue === 'number' ||
    Array.isArray(styleValue)
  );
};
