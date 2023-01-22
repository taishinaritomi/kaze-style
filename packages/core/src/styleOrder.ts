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

export const getStyleOrder = ([atRules, nest]: Selectors): StyleOrder => {
  if (atRules.length !== 0) {
    if (atRules.some((atRule) => atRule.includes('@media'))) {
      return 'media';
    } else {
      return 'atRules';
    }
  } else if (nest.includes(':active')) {
    return 'active';
  } else if (nest.includes(':hover')) {
    return 'hover';
  } else if (nest.includes(':focus-visible')) {
    return 'focusVisible';
  } else if (nest.includes(':focus')) {
    return 'focus';
  } else if (nest.includes(':focus-within')) {
    return 'focusWithin';
  } else if (nest.includes(':visited')) {
    return 'visited';
  } else if (nest.includes(':link')) {
    return 'link';
  } else {
    return 'normal';
  }
};

export type StyleOrder = typeof styleOrder[number];
export type CssRule = [value: string, order: StyleOrder];
