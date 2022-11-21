import { createStyle } from './createStyle';
import type { CssRuleObject } from './styleOrder';
import type { ClassesObject, Classes, ForBuild } from './types/common';
import type { KazeStyle } from './types/style';

export type ForBuildStyle<K extends string> = {
  classesObject: ClassesObject<K>;
  cssRuleObjects: CssRuleObject[];
  index: number;
};

export const __preStyle = <K extends string>(
  styles: KazeStyle<K>,
  forBuild: ForBuild,
  filename: string,
  index: number,
): Classes<K> => {
  const { classes, classesObject, cssRuleObjects } = createStyle(styles);

  if (forBuild.filename === filename) {
    forBuild.styles.push({ classesObject, cssRuleObjects, index });
  }

  return classes;
};
