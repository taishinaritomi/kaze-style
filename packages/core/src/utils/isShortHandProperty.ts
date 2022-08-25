import type { KazeStyle, SupportedShorthandProperties } from '../types/Style';
import { supportedShorthandProperties } from '../types/Style';

export const isShortHandProperty = (
  property: keyof KazeStyle,
): property is SupportedShorthandProperties => {
  return supportedShorthandProperties.some(
    (supportedProperty) => supportedProperty === property,
  );
};
