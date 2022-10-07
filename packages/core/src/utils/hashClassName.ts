import { hash } from '../hash';
import type { AtRules } from '../resolveStyle';
import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';

type Args = {
  pseudo: string;
  atRules: AtRules;
  property: string;
  styleValue: AndArray<CssValue>;
};

export const hashClassName = ({
  pseudo,
  atRules,
  property,
  styleValue,
}: Args): string => {
  return `_${hash(
    `${property}${pseudo}${atRules.media}${atRules.layer}${atRules.support}${
      Array.isArray(styleValue) ? styleValue.join(' ') : styleValue
    }`,
  )}`;
};
