import { resolveStyle } from './resolveStyle';
import type { Classes, ForBuild } from './types/common';
import type { KazeStyle } from './types/style';

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
