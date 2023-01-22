import { hash } from '../hash';
import type { CssValue } from '../types/common';
import type { NestObj, AndArray } from '../types/utils';

export const hashStyle = (style: NestObj<AndArray<CssValue>>): string => {
  return `_${hash(JSON.stringify(style))}`;
};
