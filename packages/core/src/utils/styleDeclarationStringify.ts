import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';
import { hyphenateProperty } from './hyphenateProperty';

export const styleDeclarationStringify = (
  property: string,
  styleValue: AndArray<CssValue>,
) => {
  return `${hyphenateProperty(property)}:${
    Array.isArray(styleValue) ? styleValue.join(' ') : styleValue
  };`;
};
