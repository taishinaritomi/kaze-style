import { createStyle } from './createStyle';
import type { KazeStyle, ResolvedStyle } from './types/style';

export const __preStyle = <Key extends string>(
  stylesByKey: Record<Key, KazeStyle>,
  buildStyles: { fileName: string; resolvedStyles: ResolvedStyle[] },
  fileName: string,
  index: number,
): Record<Key, string> => {
  const { classes, cssRules } = createStyle(stylesByKey);

  if (buildStyles.fileName === fileName) {
    buildStyles.resolvedStyles.push({ classes, cssRules, index });
  }

  return classes;
};
