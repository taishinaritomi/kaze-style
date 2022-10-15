import type { SupportStyle, SupportShorthandProperties } from '../types/style';

export const isShortHandProperty = (
  property: keyof SupportStyle,
): property is keyof SupportShorthandProperties => {
  return property.startsWith('$');
};
