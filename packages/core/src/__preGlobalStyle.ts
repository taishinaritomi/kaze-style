import { resolveGlobalStyle } from './resolveGlobalStyle';
import type { BuildNew, ForBuild } from './types/common';
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

type BuildArgs = {
  filename: string;
  index: number;
  build: BuildNew;
};

export const __preGlobalStyleNew = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
  buildArgs: BuildArgs,
): void => {
  const [cssRules] = resolveGlobalStyle(globalStyles);
  if (buildArgs.filename === buildArgs.build.filename) {
    buildArgs.build.cssRules.push(...cssRules);
  }
};
