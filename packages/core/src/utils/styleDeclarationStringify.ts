import type { CssValue } from '../types/common';
import type { AndArray } from '../types/utils';
import { hyphenateProperty } from './hyphenateProperty';
import { styleValueStringify } from './styleValueStringify';

export const styleDeclarationStringify = (
  property: string,
  styleValue: AndArray<CssValue>,
) => {
  return `${hyphenateProperty(property)}:${styleValueStringify(styleValue)};`;
};
