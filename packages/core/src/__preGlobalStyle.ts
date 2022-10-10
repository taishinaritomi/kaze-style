import { createGlobalStyle } from './createGlobalStyle';
import type { CssRuleObject } from './styleOrder';
import type { KazeGlobalStyle } from './types/style';

export type ForBuildGlobalStyle = {
  cssRuleObjects: CssRuleObject[];
  index: number;
};

export const __preGlobalStyle = (
  globalStyles: KazeGlobalStyle,
  forBuild: {
    fileName: string;
    globalStyles: ForBuildGlobalStyle[];
  },
  fileName: string,
  index: number,
): void => {
  const { cssRuleObjects } = createGlobalStyle(globalStyles);

  if (forBuild.fileName === fileName) {
    forBuild.globalStyles.push({ cssRuleObjects, index });
  }
};
