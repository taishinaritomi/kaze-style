import type { KazeGlobalStyle, KazeStyle } from '../types/style';
import { hyphenateProperty } from './hyphenateProperty';

export const compileObjectCSS = (
  style: KazeStyle | KazeGlobalStyle,
): string => {
  const rules: string[] = [];
  for (const property in style) {
    const value = style[property as keyof (KazeStyle | KazeGlobalStyle)];
    if (typeof value === 'string' || typeof value === 'number') {
      rules.push(hyphenateProperty(property) + ':' + value + ';');
    }
  }
  return rules.join('');
};
