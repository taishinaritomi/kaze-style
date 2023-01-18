import { createStyle } from './createStyle';
import type { Classes, ForBuild } from './types/common';
import type { KazeStyle } from './types/style';

export const __preStyle = <K extends string>(
  styles: KazeStyle<K>,
  forBuild: ForBuild,
  filename: string,
  index: number,
): Classes<K> => {
  const [cssRules, classes, objectClasses] = createStyle(styles);
  if (forBuild[0] === filename) {
    forBuild[1].push(...cssRules);
    forBuild[2].push([objectClasses, index]);
  }

  return classes;
};
