import { hash } from '../hash';
import type { Selectors } from '../types/common';

export const hashSelector = (
  [atRules, nested]: Selectors,
  property: string,
): string => {
  return `_${hash(`${atRules.join('')}${nested}${property}`)}`;
};
