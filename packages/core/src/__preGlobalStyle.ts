import { createGlobalStyle } from './createGlobalStyle';
import type { CssRules, KazeGlobalStyle } from './types/style';

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
      cssRules,
      index,
    });
  }
};
