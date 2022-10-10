import type { AtRules } from '../resolveStyle';
import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';

type CompileCss = {
  className: string;
  pseudo: string;
  atRules: AtRules;
  property: string;
  styleValue: AndArray<CssValue>;
};

export const compileCss = ({
  className,
  pseudo,
  atRules,
  property,
  styleValue,
}: CompileCss): string => {
  let selector = '';
  let rule = '';

  if (!pseudo) {
    selector = `.${className}`;
  } else {
    selector = `.${className}${pseudo.replace(/&/g, `.${className}`)}`;
  }

  if (Array.isArray(styleValue)) {
    rule = `${selector}{${property}:${styleValue.join(' ')};}`;
  } else {
    rule = `${selector}{${property}:${styleValue};}`;
  }

  if (atRules.media) rule = `@media ${atRules.media} {${rule}}`;
  if (atRules.layer) rule = `@layer ${atRules.layer} {${rule}}`;
  if (atRules.support) rule = `@supports ${atRules.support} {${rule}}`;

  return rule;
};
