import type { Selectors } from '../resolveStyle';
import type { CssValue } from '../types/style';
import type { AndArray } from '../types/utils';
import { styleValueStringify } from './styleValueStringify';

type CompileCss = {
  className: string;
  selectors: Selectors;
  property: string;
  styleValue: AndArray<CssValue>;
};

export const compileCss = ({
  className,
  selectors: { pseudo, media, layer, support },
  property,
  styleValue,
}: CompileCss): string => {
  let selector = '';
  let rule = '';

  if (!pseudo) {
    selector = `.${className}`;
  } else {
    selector = `${pseudo.replace(/&/g, `.${className}`)}`;
  }

  rule = `${selector}{${property}:${styleValueStringify(styleValue)};}`;

  if (media) rule = `@media ${media} {${rule}}`;
  if (layer) rule = `@layer ${layer} {${rule}}`;
  if (support) rule = `@supports ${support} {${rule}}`;

  return rule;
};
