import { createGlobalStyle } from './createGlobalStyle';
import type { ForBuild } from './types/common';
import type { KazeGlobalStyle } from './types/globalStyle';

export const __preGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
  forBuild: ForBuild,
  filename: string,
  _index: number,
): void => {
  const [cssRules] = createGlobalStyle(globalStyles);
  if (forBuild[0] === filename) {
    forBuild[1].push(...cssRules);
  }
};
