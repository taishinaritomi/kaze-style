import { createGlobalStyle } from './createGlobalStyle';
import type { CssRules, KazeGlobalStyle } from './types/style';
import {
  GLOBAL_STYLE_START_COMMENT,
  GLOBAL_STYLE_END_COMMENT,
} from './utils/constants';

export type ForBuildGlobalStyle = {
  cssRules: CssRules;
  index: number;
};

export const __preGlobalStyle = <Selector extends string>(
  globalStyles: Record<Selector, KazeGlobalStyle>,
  forBuild: {
    fileName: string;
    globalStyles: ForBuildGlobalStyle[];
  },
  fileName: string,
  index: number,
): void => {
  const { cssRules } = createGlobalStyle(globalStyles);

  if (forBuild.fileName === fileName) {
    forBuild.globalStyles.push({
      cssRules: [
        GLOBAL_STYLE_START_COMMENT,
        ...cssRules,
        GLOBAL_STYLE_END_COMMENT,
      ],
      index,
    });
  }
};
