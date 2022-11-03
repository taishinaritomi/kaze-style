import { fontSize } from './token/fontSize';
import { fontWeight } from './token/fontWeight';
import { media } from './token/media';
import { size } from './token/size';

export const token = {
  size: (num: keyof typeof size) => size[num],
  fontWeight: (weight: keyof typeof fontWeight) => fontWeight[weight],
  fontSize: (size: keyof typeof fontSize) => fontSize[size],
  media: (size: keyof typeof media) => media[size],
};
