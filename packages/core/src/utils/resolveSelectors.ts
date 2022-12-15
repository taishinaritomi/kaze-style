import type { Selectors } from '../types/common';
import { isNestedSelector } from './isNestedSelector';
import { normalizeNestedSelector } from './normalizeNestedSelector';

export const resolveSelectors = (
  selectors: Selectors,
  property: string,
): Selectors => {
  const atRules = [...selectors[0]];
  let nested = selectors[1];
  if (property.substring(0, 1) === '@') {
    atRules.unshift(property);
  } else if (isNestedSelector(property)) {
    nested = normalizeNestedSelector(nested, property);
  }
  return [atRules, nested];
};
