import { ClassName } from './ClassName';
import { resolveStyle } from './resolveStyle';
import type { CssRule } from './styleOrder';
import type { Classes, ClassesObject } from './types/common';
import type { KazeStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';

type Result<K extends string> = {
  cssRules: CssRule[];
  classes: Classes<K>;
  classesObject: ClassesObject<K>;
};

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const classesObject = {} as ClassesObject<K>;
  const allCssRules: CssRule[] = [];

  for (const key in styles) {
    const { classNameObject, cssRules } = resolveStyle({
      style: styles[key],
    });
    allCssRules.push(...cssRules);
    classes[key] = new ClassName(classNameObject) as unknown as string;
    classesObject[key] = classNameObject;
  }

  return {
    classes,
    classesObject,
    cssRules: uniqueCssRules(allCssRules),
  };
};
