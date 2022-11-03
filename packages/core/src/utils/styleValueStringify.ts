import type { CssValue } from '../types/common';
import type { AndArray } from '../types/utils';

export const styleValueStringify = (
  styleValue: AndArray<CssValue>,
): CssValue => {
  return Array.isArray(styleValue) ? styleValue.join(' ') : styleValue;
};
