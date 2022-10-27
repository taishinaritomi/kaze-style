import type { Selectors } from '../resolveStyle';
import { isNestedSelector } from './isNestedSelector';
import { normalizeNestedProperty } from './normalizeNestedProperty';

type Args = {
  property: string;
  selectors: Selectors;
};

export const resolveSelectors = ({ property, selectors }: Args) => {
  if (property.substring(0, 1) === '@') {
    return Object.assign({}, selectors, {
      atRules: ([property] as string[]).concat(selectors.atRules),
    });
  } else if (isNestedSelector(property)) {
    return Object.assign({}, selectors, {
      nested: normalizeNestedProperty(property, selectors.nested),
    });
  } else {
    return selectors;
  }
};
