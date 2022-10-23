import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';

export const styleValueToArray = (
  styleValue: AndArray<CssValue>,
): Array<string> => {
  return Array.isArray(styleValue)
    ? styleValue.map((v) => v.toString())
    : styleValue
        .toString()
        .split(' ')
        .filter((v) => v !== '');
};
