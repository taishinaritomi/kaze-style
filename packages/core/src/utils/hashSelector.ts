import { hash } from '../hash';
import type { Selectors } from '../resolveStyle';

type Args = {
  selectors: Selectors;
  property: string;
};

export const hashSelector = ({
  selectors: { nested, atRules },
  property,
}: Args): string => {
  return `_${hash(`${property}${nested}${atRules.join('')}`)}`;
};
