import type { CssRules, SupportedCssProperties } from '../types/style';
import { hyphenateProperty } from './hyphenateProperty';

export const compileObjectCss = (style: SupportedCssProperties): string => {
  const cssRules: CssRules = [];
  for (const property in style) {
    const value = style[property as keyof SupportedCssProperties];
    if (typeof value === 'string' || typeof value === 'number') {
      cssRules.push(
        hyphenateProperty(property) +
          ':' +
          (Array.isArray(value) ? value.join(' ') : value) +
          ';',
      );
    }
  }
  return cssRules.join('');
};
