import { hyphenateProperty } from './hyphenateProperty';
import { serializeCSS } from './serializeCSS';

type CompileCSS = {
  className: string;
  property: string;
  styleValue: string;
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
  rule = `${selector}${pseudo}{${hyphenateProperty(property)}:${styleValue};}`;
  if (media) rule = `@media ${media} {${rule}}`;

  return serializeCSS(rule);
};
