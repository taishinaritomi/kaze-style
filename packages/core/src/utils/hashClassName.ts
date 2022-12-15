import { hash } from '../hash';
import type { CssValue, Selectors } from '../types/common';
import type { AndArray } from '../types/utils';
import { styleValueStringify } from './styleValueStringify';

export const hashClassName = (
  [atRules, nested]: Selectors,
  property: string,
  styleValue: AndArray<CssValue>,
): string => {
  return `_${hash(
    `${atRules.join('')}${nested}${property}${styleValueStringify(styleValue)}`,
  )}`;
};
