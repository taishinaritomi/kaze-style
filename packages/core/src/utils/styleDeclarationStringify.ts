import type { CssValue } from '../types/common';
import type { AndArray } from '../types/utils';
import { hyphenateProperty } from './hyphenateProperty';
import { styleValueStringify } from './styleValueStringify';

type Args = {
  property: string;
  styleValue: AndArray<CssValue>;
};
export const styleDeclarationStringify = ({ property, styleValue }: Args) => {
  return `${hyphenateProperty(property)}:${styleValueStringify(styleValue)};`;
};
