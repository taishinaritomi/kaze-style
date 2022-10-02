import type { KazeStyle, SolveShorthandProperties } from '../types/style';

export const isShortHandProperty = (
  property: keyof KazeStyle,
): property is keyof SolveShorthandProperties => {
  return property.startsWith('$');
};
