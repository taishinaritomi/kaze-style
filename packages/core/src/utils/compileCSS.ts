import type { CSSValue } from '../types/Style';
import type { AndArray } from '../types/Utils';
import { hyphenateProperty } from './hyphenateProperty';
import { serializeCSS } from './serializeCSS';

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
  pseudo = '',
  media,
}: CompileCSS): string[] => {
  const selector = `.${className}`;
  let rule = '';
  if (Array.isArray(styleValue)) {
    rule = `${selector}${pseudo}{${hyphenateProperty(
      property,
    )}:${styleValue.join(' ')};}`;
  } else {
    rule = `${selector}${pseudo}{${hyphenateProperty(
      property,
    )}:${styleValue};}`;
  }
  if (media) rule = `@media ${media} {${rule}}`;

  return serializeCSS(rule);
};
