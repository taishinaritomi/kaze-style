import type { CssValue, SupportStyle } from '../types/style';
import type { ArrayOr, ValueOf } from '../types/utils';

export const isCssValue = (
  styleValue: ValueOf<SupportStyle>,
): styleValue is ArrayOr<CssValue> => {
  return (
    typeof styleValue === 'string' ||
    typeof styleValue === 'number' ||
    Array.isArray(styleValue)
  );
};
