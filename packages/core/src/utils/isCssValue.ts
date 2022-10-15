import type { CssValue, SupportStyle } from '../types/style';
import type { AndArray, ValueOf } from '../types/utils';

export const isCssValue = (
  styleValue: ValueOf<SupportStyle>,
): styleValue is AndArray<CssValue> => {
  return (
    typeof styleValue === 'string' ||
    typeof styleValue === 'number' ||
    Array.isArray(styleValue)
  );
};
