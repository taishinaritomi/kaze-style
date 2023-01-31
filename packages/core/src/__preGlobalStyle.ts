import { resolveGlobalStyle } from './resolveGlobalStyle';
import type { ForBuild } from './types/common';
import type { KazeGlobalStyle } from './types/style';

export const __preGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
  forBuild: ForBuild,
  filename: string,
  _index: number,
): void => {
  const [cssRules] = resolveGlobalStyle(globalStyles);
  if (forBuild[0] === filename) {
    forBuild[1].push(...cssRules);
  }
};
