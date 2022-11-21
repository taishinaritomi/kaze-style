import { createGlobalStyle } from './createGlobalStyle';
import type { CssRuleObject } from './styleOrder';
import type { ForBuild } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';

export type ForBuildGlobalStyle = {
  cssRuleObjects: CssRuleObject[];
  index: number;
};

export const __preGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
  forBuild: ForBuild,
  filename: string,
  index: number,
): void => {
  const { cssRuleObjects } = createGlobalStyle(globalStyles);

  if (forBuild.filename === filename) {
    forBuild.globalStyles.push({ cssRuleObjects, index });
  }
};
