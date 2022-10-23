import { hash } from '../hash';
import type { Selectors } from '../resolveStyle';
import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';
import { normalizeStyleValue } from './normalizeStyleValue';

type Args = {
  selectors: Selectors;
  property: string;
  styleValue: AndArray<CssValue>;
};

export const hashClassName = ({
  selectors: { pseudo, media, layer, support },
  property,
  styleValue,
}: Args): string => {
  return `_${hash(
    `${property}${pseudo}${media}${layer}${support}${normalizeStyleValue(
      styleValue,
    )}`,
  )}`;
};
