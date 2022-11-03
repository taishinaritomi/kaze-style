import type { SupportStyle } from '@kaze-style/core';
import { animation } from './tokens/animation';

export const tokens = {
  animation: (name: keyof typeof animation): SupportStyle => animation[name],
};
