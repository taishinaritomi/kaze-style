import type { Selectors } from '../types/common';

export const resolveSelectors = (
  [selector, atRules, groups]: Selectors,
  property: string,
): Selectors => {
  if (property.substring(0, 1) === '@') {
    return [selector, [property, ...atRules], groups];
  } else if (isGroups(property)) {
    return [selector, atRules, groups];
  } else if (isSelector(property)) {
    return [normalizeSelector(selector, property), atRules, groups];
  }
  return [selector, atRules, groups];
};

const isSelector = (property: string): boolean => {
  return /(:|&| |,|>|~|\+|\[|\.|#|)/.test(property);
};

const isGroups = (property: string): boolean => {
  return property.startsWith('(') && property.endsWith(')');
};

const normalizeSelector = (current: string, property: string): string => {
  if (current) {
    return (
      current + (property.charAt(0) === '&' ? property.slice(1) : property)
    );
  } else {
    return property.includes('&') ? property : '&' + property;
  }
};
