import { hash } from '../hash';
import type { SupportStyle } from '../types/style';

export const hashStyle = (style: SupportStyle): string => {
  return `_${hash(JSON.stringify(style))}`;
};
