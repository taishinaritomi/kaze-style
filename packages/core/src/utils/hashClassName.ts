import { hash } from '../hash';
import type { Selectors } from '../types/common';
import type { CssValue } from '../types/style';
import type { ArrayOr } from '../types/utils';
import { resolveDeclaration } from './resolveDeclaration';

export const hashClassName = (
  [selector, atRules]: Selectors,
  property: string,
  styleValue: ArrayOr<CssValue>,
): string => {
  return `_${hash(
    `${selector}${atRules.join('')}${resolveDeclaration(property, styleValue)}`,
  )}`;
};
