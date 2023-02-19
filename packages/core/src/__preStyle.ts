import { resolveStyle } from './resolveStyle';
import type { BuildNew, Classes, ForBuild } from './types/common';
import type { KazeStyle } from './types/style';
import { classesSerialize } from './utils/classesSerialize';

export const __preStyle = <K extends string>(
  styles: KazeStyle<K>,
  forBuild: ForBuild<K>,
  filename: string,
  index: number,
): Classes<K> => {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);
  if (forBuild[0] === filename) {
    forBuild[1].push(...cssRules);
    forBuild[2].push([staticClasses, index]);
  }

  return classes;
};

type BuildArgs = {
  filename: string;
  index: number;
  build: BuildNew;
};

export const __preStyleNew = <K extends string>(
  styles: KazeStyle<K>,
  buildArgs: BuildArgs,
): Classes<K> => {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);
  if (buildArgs.filename === buildArgs.build.filename) {
    buildArgs.build.cssRules.push(...cssRules);
    buildArgs.build.injects.push({
      args: [classesSerialize(staticClasses)],
      index: buildArgs.index,
    });
  }
  return classes;
};
