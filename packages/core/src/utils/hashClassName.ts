import { hash } from '../hash';
import type { Selectors } from '../types/common';
import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';
import { styleDeclarationStringify } from './styleDeclarationStringify';

export const hashClassName = (
  [atRules, nest]: Selectors,
  property: string,
  styleValue: AndArray<CssValue>,
): string => {
  return `_${hash(
    `${atRules.join('')}${nest}${styleDeclarationStringify(
      property,
      styleValue,
    )}`,
  )}`;
};
