import type { KazeStyle, SupportedShorthandProperties } from '../types/style';
import { supportedShorthandProperties } from '../types/style';

export const isShortHandProperty = (
  property: keyof KazeStyle,
): property is SupportedShorthandProperties => {
  return supportedShorthandProperties.some(
    (supportedProperty) => supportedProperty === property,
  );
};
