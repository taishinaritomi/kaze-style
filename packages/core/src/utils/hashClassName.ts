import { hash } from '../hash';
import type { CSSValue } from '../types/style';
import type { AndArray } from '../types/utils';

type Args = {
  property?: string;
  pseudo?: string;
  media?: string;
  layer?: string;
  support?: string;
  styleValue?: AndArray<CSSValue>;
};

export const hashClassName = ({
  property = '',
  pseudo = '',
  styleValue = '',
  media = '',
  layer = '',
  support = '',
}: Args): string => {
  return `_${hash(
    `${property}${pseudo}${media}${layer}${support}${
      Array.isArray(styleValue) ? styleValue.join(' ') : styleValue
    }`,
  )}`;
};
