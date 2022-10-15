import { createStyle } from './createStyle';
import type { CssRuleObject } from './styleOrder';
import type { Classes, ClassesObject, KazeStyle } from './types/style';

export type ForBuildStyle<K extends string> = {
  classesObject: ClassesObject<K>;
  cssRuleObjects: CssRuleObject[];
  index: number;
};

export const __preStyle = <K extends string>(
  styles: KazeStyle<K>,
  forBuild: { fileName: string; styles: ForBuildStyle<K>[] },
  fileName: string,
  index: number,
): Classes<K> => {
  const { classes, classesObject, cssRuleObjects } = createStyle(styles);

  if (forBuild.fileName === fileName) {
    forBuild.styles.push({ classesObject, cssRuleObjects, index });
  }

  return classes;
};
