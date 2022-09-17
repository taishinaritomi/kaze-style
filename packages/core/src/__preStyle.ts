import { createStyle } from './createStyle';
import type { KazeStyle, ResolvedStyle } from './types/style';
import { STYLE_START_COMMENT, STYLE_END_COMMENT } from './utils/constants';

export const __preStyle = <Key extends string>(
  stylesByKey: Record<Key, KazeStyle>,
  buildStyles: { fileName: string; resolvedStyles: ResolvedStyle[] },
  fileName: string,
  index: number,
): Record<Key, string> => {
  const { classes, cssRules } = createStyle(stylesByKey);

  if (buildStyles.fileName === fileName) {
    buildStyles.resolvedStyles.push({
      classes,
      cssRules: [STYLE_START_COMMENT, ...cssRules, STYLE_END_COMMENT],
      index,
    });
  }

  return classes;
};
