import { createStyle } from './createStyle';
import type {
  Classes,
  ClassesObject,
  CssRules,
  KazeStyle,
} from './types/style';

export type ForBuildStyle<K extends string> = {
  cssRules: CssRules;
  classesObject: ClassesObject<K>;
  index: number;
};

export const __preStyle = <K extends string>(
  styles: Record<K, KazeStyle>,
  forBuild: { fileName: string; styles: ForBuildStyle<K>[] },
  fileName: string,
  index: number,
): Classes<K> => {
  const { classes, cssRules, classesObject } = createStyle(styles);

  if (forBuild.fileName === fileName) {
    forBuild.styles.push({
      classesObject,
      cssRules,
      index,
    });
  }

  return classes;
};
