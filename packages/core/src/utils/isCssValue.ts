import type { CssValue, KazeStyle } from '../types/style';
import type { AndArray, ValueOf } from '../types/utils';

export const isCssValue = (
  styleValue: ValueOf<KazeStyle>,
): styleValue is AndArray<CssValue> => {
  return (
    typeof styleValue === 'string' ||
    typeof styleValue === 'number' ||
    Array.isArray(styleValue)
  );
};
