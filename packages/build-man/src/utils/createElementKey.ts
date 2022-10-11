import type { Element } from 'stylis';
import { KEYFRAMES, RULESET } from 'stylis';

export const createElementKey = (element: Element, suffix = ''): string => {
  if (element.type === RULESET || element.type === KEYFRAMES) {
    return element.value + suffix;
  }

  if (Array.isArray(element.children)) {
    return (
      element.value +
      '[' +
      element.children
        .map((child) => createElementKey(child, suffix))
        .join(',') +
      ']'
    );
  }
  return '';
};
