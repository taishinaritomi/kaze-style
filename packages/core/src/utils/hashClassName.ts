import { hash } from '../hash';
import type { CssValue, Selectors } from '../types/common';
import type { AndArray } from '../types/utils';
import { styleValueStringify } from './styleValueStringify';

type Args = {
  selectors: Selectors;
  property: string;
  styleValue: AndArray<CssValue>;
};

export const hashClassName = ({
  selectors: { nested, atRules },
  property,
  styleValue,
}: Args): string => {
  return `_${hash(
    `${property}${nested}${atRules.join('')}${styleValueStringify(styleValue)}`,
  )}`;
};
