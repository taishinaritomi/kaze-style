import type { CSSValue } from '../types/style';
import type { AndArray } from '../types/utils';

type CompileCSS = {
  className: string;
  property: string;
  styleValue: AndArray<CSSValue>;
  pseudo?: string;
  media?: string;
  layer?: string;
  support?: string;
};

export const compileCSS = ({
  className,
  property,
  styleValue,
  pseudo,
  media,
  layer,
  support,
}: CompileCSS): string => {
  let selector = '';
  let rule = '';

  if (!pseudo) {
    selector = `.${className}`;
  } else if (/^(:|\[|>|\ )/.test(pseudo)) {
    selector = `.${className}${pseudo.replace(/&/g, `.${className}`)}`;
  } else {
    selector = `${pseudo.replace(/&/g, `.${className}`)}`;
  }

  if (Array.isArray(styleValue)) {
    rule = `${selector}{${property}:${styleValue.join(' ')};}`;
  } else {
    rule = `${selector}{${property}:${styleValue};}`;
  }

  if (media) rule = `@media ${media} {${rule}}`;
  if (layer) rule = `@layer ${layer} {${rule}}`;
  if (support) rule = `@supports ${support} {${rule}}`;

  return rule;
};
