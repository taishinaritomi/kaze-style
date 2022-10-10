import { hash } from '../hash';
import type { AtRules } from '../resolveStyle';

type Args = {
  pseudo?: string;
  atRules: AtRules;
  property?: string;
};

export const hashSelector = ({ pseudo, atRules, property }: Args): string => {
  return `_${hash(
    `${property}${pseudo}${atRules.media}${atRules.layer}${atRules.support}`,
  )}`;
};
