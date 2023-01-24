import type { SupportStyle } from '@kaze-style/core';
import { animation } from './styles/animation';
import { fontSize } from './styles/fontSize';
import { fontWeight } from './styles/fontWeight';
import { media } from './styles/media';
import { size } from './styles/size';

export const s = {
  size: (num: keyof typeof size) => size[num],
  fontWeight: (weight: keyof typeof fontWeight) => fontWeight[weight],
  fontSize: (size: keyof typeof fontSize) => fontSize[size],
  media: (size: keyof typeof media) => media[size],
  animation: (name: keyof typeof animation): SupportStyle => animation[name],
};

/**
 * @deprecated
 * ```
 * import { s } from '@kaze-style/themes'
 * s.size()
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
 * import { s } from '@kaze-style/themes'
 * s.animation()
 * ```
 */
export const tokens = {
  animation: (name: keyof typeof animation): SupportStyle => animation[name],
};
