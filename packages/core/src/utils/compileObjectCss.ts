import type { SupportProperties } from '../types/style';
import { hyphenateProperty } from './hyphenateProperty';
import { styleValueStringify } from './styleValueStringify';

export const compileObjectCss = (style: SupportProperties): string => {
  const cssRules: string[] = [];
  for (const property in style) {
    const value = style[property as keyof SupportProperties];
    if (typeof value === 'string' || typeof value === 'number') {
      cssRules.push(
        hyphenateProperty(property) + ':' + styleValueStringify(value) + ';',
      );
    }
  }
  return cssRules.join('');
};
