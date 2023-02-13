import { hash } from '../hash';
import type { Selectors } from '../types/common';

export const hashSelector = (
  [selector, atRules]: Selectors,
  property: string,
): string => {
  return `_${hash(`${selector}${atRules.join('')}${property}`)}`;
};
