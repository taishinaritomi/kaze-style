import type { Selectors } from './types/common';

export const styleOrder = [
  /** global */
  'g',
  /** normal */
  'n',
  /** link */
  'l',
  /** visited */
  'v',
  /** focusWithin */
  'w',
  /** focus */
  'f',
  /** focusVisible */
  'o',
  /** hover */
  'h',
  /** active */
  'c',
  /** keyframes */
  'k',
  /** atRules */
  'a',
  /** media */
  'm',
] as const;

export const getStyleOrder = ([atRules, nest]: Selectors): StyleOrder => {
  if (atRules.length !== 0) {
    if (atRules.some((atRule) => atRule.includes('@media'))) {
      return 'm';
    } else {
      return 'a';
    }
  } else if (nest.includes(':active')) {
    return 'c';
  } else if (nest.includes(':hover')) {
    return 'h';
  } else if (nest.includes(':focus-visible')) {
    return 'o';
  } else if (nest.includes(':focus')) {
    return 'f';
  } else if (nest.includes(':focus-within')) {
    return 'w';
  } else if (nest.includes(':visited')) {
    return 'v';
  } else if (nest.includes(':link')) {
    return 'l';
  } else {
    return 'n';
  }
};

export type StyleOrder = typeof styleOrder[number];
export type CssRule = [value: string, order: StyleOrder];
