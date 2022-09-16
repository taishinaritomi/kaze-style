import { createGlobalStyle } from './createGlobalStyle';
import type { KazeGlobalStyle, ResolvedGlobalStyle } from './types/style';
import {
  GLOBAL_STYLE_START_COMMENT,
  GLOBAL_STYLE_END_COMMENT,
} from './utils/constants';

export const __preGlobalStyle = <Selector extends string>(
  globalStyles: Record<Selector, KazeGlobalStyle>,
  buildStyles: {
    fileName: string;
    resolvedGlobalStyles: ResolvedGlobalStyle[];
  },
  fileName: string,
  index: number,
): void => {
  const { cssRules } = createGlobalStyle(globalStyles);

  if (buildStyles.fileName === fileName) {
    buildStyles.resolvedGlobalStyles.push({
      cssRules: [
        GLOBAL_STYLE_START_COMMENT,
        ...cssRules,
        GLOBAL_STYLE_END_COMMENT,
      ],
      index,
    });
  }
};
