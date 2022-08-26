import type { CSSValue } from '../types/Style';
import type { AndArray } from '../types/Utils';
import { hyphenateProperty } from './hyphenateProperty';

type CompileCSS = {
  className: string;
  property: string;
  styleValue: AndArray<CSSValue>;
  pseudo?: string;
  media?: string;
};

export const compileCSS = ({
  className,
  property,
  styleValue,
  pseudo,
  media,
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
    rule = `${selector}{${hyphenateProperty(property)}:${styleValue.join(
      ' ',
    )};}`;
  } else {
    rule = `${selector}{${hyphenateProperty(property)}:${styleValue};}`;
  }

  if (media) rule = `@media ${media} {${rule}}`;

  return rule;
};
