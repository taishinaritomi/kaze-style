import type { Selectors } from '../resolveStyle';
import type { StyleOrder } from '../styleOrder';

type Args = {
  selectors: Selectors;
};

export const checkStyleOrder = ({ selectors: { nested, atRules } }: Args) => {
  let order: StyleOrder = 'normal';

  if (atRules.length !== 0) {
    if (atRules.some((atRule) => atRule.includes('media'))) {
      order = 'media';
    } else {
      order = 'atRules';
    }
  } else if (nested.includes(':active')) {
    order = 'active';
  } else if (nested.includes(':hover')) {
    order = 'hover';
  } else if (nested.includes(':focus-visible')) {
    order = 'focusVisible';
  } else if (nested.includes(':focus')) {
    order = 'focus';
  } else if (nested.includes(':focus-within')) {
    order = 'focusWithin';
  } else if (nested.includes(':visited')) {
    order = 'visited';
  } else if (nested.includes(':link')) {
    order = 'link';
  }
  return order;
};
