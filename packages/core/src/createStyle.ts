import { resolveStyle } from './resolveStyle';
import type {
  Classes,
  ClassesObject,
  CssRules,
  KazeStyle,
} from './types/style';
import { ClassName } from './utils/ClassName';

type Result<K extends string> = {
  cssRules: CssRules;
  classes: Classes<K>;
  classesObject: ClassesObject<K>;
};

export const createStyle = <K extends string>(
  styles: Record<K, KazeStyle>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const classesObject = {} as ClassesObject<K>;
  const allCssRules: CssRules = [];

  for (const key in styles) {
    const { cssRules, classNameObject } = resolveStyle({ style: styles[key] });
    allCssRules.push(...cssRules);
    classes[key] = new ClassName(classNameObject) as unknown as string;
    classesObject[key] = classNameObject;
  }

  return { classes, classesObject, cssRules: Array.from(new Set(allCssRules)) };
};
