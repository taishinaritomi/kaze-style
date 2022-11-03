import { ClassName } from './ClassName';
import { resolveStyle } from './resolveStyle';
import type { CssRuleObject } from './styleOrder';
import type { Classes, ClassesObject } from './types/common';
import type { KazeStyle } from './types/style';
import { cssRuleObjectsUniquify } from './utils/cssRuleObjectsUniquify';

type Result<K extends string> = {
  cssRuleObjects: CssRuleObject[];
  classes: Classes<K>;
  classesObject: ClassesObject<K>;
};

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const classesObject = {} as ClassesObject<K>;
  const allCssRuleObjects: CssRuleObject[] = [];

  for (const key in styles) {
    const { classNameObject, cssRuleObjects } = resolveStyle({
      style: styles[key],
    });
    allCssRuleObjects.push(...cssRuleObjects);
    classes[key] = new ClassName(classNameObject) as unknown as string;
    classesObject[key] = classNameObject;
  }

  return {
    classes,
    classesObject,
    cssRuleObjects: cssRuleObjectsUniquify(allCssRuleObjects),
  };
};
