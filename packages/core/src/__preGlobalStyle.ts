import { createGlobalStyle } from './createGlobalStyle';
import type { CssRule } from './styleOrder';
import type { ForBuild } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';

export type ForBuildGlobalStyle = {
  cssRules: CssRule[];
  index: number;
};

export const __preGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
  forBuild: ForBuild,
  filename: string,
  index: number,
): void => {
  const { cssRules } = createGlobalStyle(globalStyles);

  if (forBuild.filename === filename) {
    forBuild.globalStyles.push({ cssRules, index });
  }
};
