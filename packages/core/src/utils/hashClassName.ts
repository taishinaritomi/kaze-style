import { hash } from '../hash';
import type { CSSValue } from '../types/Style';
import type { AndArray } from '../types/Utils';

type Args = {
  property?: string;
  pseudo?: string;
  media?: string;
  styleValue?: AndArray<CSSValue>;
};

export const hashClassName = ({
  property = '',
  pseudo = '',
  styleValue = '',
  media = '',
}: Args): string => {
  if (Array.isArray(styleValue)) {
    return `k-${hash(property + pseudo + media)}-${hash(
      `${styleValue.join(' ')}`,
    )}`;
  } else {
    return `k-${hash(property + pseudo + media)}-${hash(`${styleValue}`)}`;
  }
};
