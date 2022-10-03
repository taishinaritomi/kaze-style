import type { CssRules, SupportedCSSProperties } from '../types/style';
import { hyphenateProperty } from './hyphenateProperty';

export const compileObjectCSS = (style: SupportedCSSProperties): string => {
  const cssRules: CssRules = [];
  for (const property in style) {
    const value = style[property as keyof SupportedCSSProperties];
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
