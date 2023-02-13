import type { Selectors } from './types/common';

export const styleOrder = [
  'global',
  'notAtomic',
  'normal',
  'link',
  'visited',
  'focusWithin',
  'focus',
  'focusVisible',
  'hover',
  'active',
  'keyframes',
  'atRules',
  'media',
] as const;

export const getStyleOrder = ([selector, atRules]: Selectors): StyleOrder => {
  if (atRules.length !== 0) {
    if (atRules.some((atRule) => atRule.includes('@media'))) {
      return 'media';
    } else {
      return 'atRules';
    }
  } else if (selector.includes(':active')) {
    return 'active';
  } else if (selector.includes(':hover')) {
    return 'hover';
  } else if (selector.includes(':focus-visible')) {
    return 'focusVisible';
  } else if (selector.includes(':focus')) {
    return 'focus';
  } else if (selector.includes(':focus-within')) {
    return 'focusWithin';
  } else if (selector.includes(':visited')) {
    return 'visited';
  } else if (selector.includes(':link')) {
    return 'link';
  } else {
    return 'normal';
  }
};

export type StyleOrder = (typeof styleOrder)[number];
export type CssRule = [value: string, order: StyleOrder];
