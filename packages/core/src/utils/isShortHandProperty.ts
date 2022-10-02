import type { KazeStyle, SupportShorthandProperties } from '../types/style';

export const isShortHandProperty = (
  property: keyof KazeStyle,
): property is keyof SupportShorthandProperties => {
  return property.startsWith('$');
};
