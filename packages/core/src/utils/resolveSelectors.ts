import type { Selectors } from '../types/common';
import { isNestedSelector } from './isNestedSelector';
import { normalizeNestedSelector } from './normalizeNestedSelector';

type Args = {
  property: string;
  selectors: Selectors;
};

export const resolveSelectors = ({ property, selectors }: Args) => {
  if (property.substring(0, 1) === '@') {
    return Object.assign({}, selectors, {
      atRules: [property].concat(selectors.atRules),
    });
  } else if (isNestedSelector(property)) {
    return Object.assign({}, selectors, {
      nested: normalizeNestedSelector({
        current: selectors.nested,
        nested: property,
      }),
    });
  } else {
    return selectors;
  }
};
