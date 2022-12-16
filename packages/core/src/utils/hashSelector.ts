import { hash } from '../hash';
import type { Selectors } from '../types/common';

export const hashSelector = (
  [atRules, nest]: Selectors,
  property: string,
): string => {
  return `_${hash(`${atRules.join('')}${nest}${property}`)}`;
};
