import { createStyle } from './createStyle';
import type {
  Classes,
  ClassesObject,
  CssRules,
  KazeStyle,
} from './types/style';
import { STYLE_START_COMMENT, STYLE_END_COMMENT } from './utils/constants';

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
      cssRules: [STYLE_START_COMMENT, ...cssRules, STYLE_END_COMMENT],
      index,
    });
  }

  return classes;
};
