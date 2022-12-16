import type { Selectors } from '../types/common';
import { isNestSelector } from './isNestSelector';
import { normalizeNestSelector } from './normalizeNestSelector';

export const resolveSelectors = (
  selectors: Selectors,
  property: string,
): Selectors => {
  const atRules = [...selectors[0]];
  let nest = selectors[1];
  if (property.substring(0, 1) === '@') {
    atRules.unshift(property);
  } else if (isNestSelector(property)) {
    nest = normalizeNestSelector(nest, property);
  }
  return [atRules, nest];
};
