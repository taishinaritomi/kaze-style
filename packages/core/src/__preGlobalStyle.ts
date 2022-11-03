import { createGlobalStyle } from './createGlobalStyle';
import type { CssRuleObject } from './styleOrder';
import type { KazeGlobalStyle } from './types/globalStyle';

export type ForBuildGlobalStyle = {
  cssRuleObjects: CssRuleObject[];
  index: number;
};

export const __preGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
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
