import type { Selectors } from '../resolveStyle';
import type { StyleOrder } from '../styleOrder';

type Args = {
  selectors: Selectors;
};

export const checkStyleOrder = ({ selectors: { pseudo, atRules } }: Args) => {
  let order: StyleOrder = 'normal';

  if (atRules.length !== 0) {
    if (atRules.some((atRule) => atRule.includes('media'))) {
      order = 'media';
    } else {
      order = 'atRules';
    }
  } else if (pseudo.includes(':active')) {
    order = 'active';
  } else if (pseudo.includes(':hover')) {
    order = 'hover';
  } else if (pseudo.includes(':focus-visible')) {
    order = 'focusVisible';
  } else if (pseudo.includes(':focus')) {
    order = 'focus';
  } else if (pseudo.includes(':focus-within')) {
    order = 'focusWithin';
  } else if (pseudo.includes(':visited')) {
    order = 'visited';
  } else if (pseudo.includes(':link')) {
    order = 'link';
  }
  return order;
};
