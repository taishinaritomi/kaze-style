import type { CSSValue, KazeStyle } from '../types/style';
import type { AndArray, ValueOf } from '../types/utils';

export const isCSSValue = (styleValue: ValueOf<KazeStyle>): styleValue is AndArray<CSSValue> => {
  return (
    typeof styleValue === 'string' ||
    typeof styleValue === 'number' ||
    Array.isArray(styleValue)
  );
};
