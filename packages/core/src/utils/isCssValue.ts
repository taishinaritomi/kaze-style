import type { CssValue } from '../types/style';
import type { AndArray, NestedObj } from '../types/utils';

export const isCssValue = (
  styleValue: NestedObj<AndArray<CssValue>> | AndArray<CssValue>,
): styleValue is AndArray<CssValue> => {
  return (
    typeof styleValue === 'string' ||
    typeof styleValue === 'number' ||
    Array.isArray(styleValue)
  );
};
