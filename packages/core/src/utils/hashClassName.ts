import { hash } from '../hash';
import type { Selectors } from '../resolveStyle';
import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';
import { styleValueStringify } from './styleValueStringify';

type Args = {
  selectors: Selectors;
  property: string;
  styleValue: AndArray<CssValue>;
};

export const hashClassName = ({
  selectors: { pseudo, atRules },
  property,
  styleValue,
}: Args): string => {
  return `_${hash(
    `${property}${pseudo}${atRules.join('')}${styleValueStringify(styleValue)}`,
  )}`;
};
