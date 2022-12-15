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

export const checkStyleOrder = ([atRules, nested]: Selectors) => {
  let order: StyleOrder = 'n';

  if (atRules.length !== 0) {
    if (atRules.some((atRule) => atRule.includes('media'))) {
      order = 'm';
    } else {
      order = 'a';
    }
  } else if (nested.includes(':active')) {
    order = 'c';
  } else if (nested.includes(':hover')) {
    order = 'h';
  } else if (nested.includes(':focus-visible')) {
    order = 'o';
  } else if (nested.includes(':focus')) {
    order = 'f';
  } else if (nested.includes(':focus-within')) {
    order = 'w';
  } else if (nested.includes(':visited')) {
    order = 'v';
  } else if (nested.includes(':link')) {
    order = 'l';
  }
  return order;
};

export type StyleOrder = typeof styleOrder[number];
export type CssRule = [value: string, order: StyleOrder];
