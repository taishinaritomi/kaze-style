import type { SupportStyle } from '@kaze-style/core';
import { animation } from './theme/animation';
import { fontSize } from './theme/fontSize';
import { fontWeight } from './theme/fontWeight';
import { media } from './theme/media';
import { size } from './theme/size';

export const theme = {
  size: (num: keyof typeof size) => size[num],
  fontWeight: (weight: keyof typeof fontWeight) => fontWeight[weight],
  fontSize: (size: keyof typeof fontSize) => fontSize[size],
  media: (size: keyof typeof media) => media[size],
  animation: (name: keyof typeof animation): SupportStyle => animation[name],
};

/**
 * @deprecated
 * ```
 * import { theme } from '@kaze-style/themes'
 * theme.size()
 * ```
 */
export const token = {
  size: (num: keyof typeof size) => size[num],
  fontWeight: (weight: keyof typeof fontWeight) => fontWeight[weight],
  fontSize: (size: keyof typeof fontSize) => fontSize[size],
  media: (size: keyof typeof media) => media[size],
};

/**
 * @deprecated
 * ```
 * import { theme } from '@kaze-style/themes'
 * theme.animation()
 * ```
 */
export const tokens = {
  animation: (name: keyof typeof animation): SupportStyle => animation[name],
};
