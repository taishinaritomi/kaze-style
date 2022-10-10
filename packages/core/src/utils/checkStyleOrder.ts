import type { AtRules } from '../resolveStyle';
import type { StyleOrder } from '../styleOrder';

type Args = {
  pseudo: string;
  atRules: AtRules;
};

export const checkStyleOrder = ({ pseudo, atRules }: Args) => {
  let order: StyleOrder = 'normal';

  if (atRules.media) {
    order = 'media';
  } else if (atRules.support) {
    order = 'atRules';
  } else if (atRules.layer) {
    order = 'atRules';
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
