import type { ClassNameType } from './ClassName';
import { ClassName } from './ClassName';
import { resolveStyle } from './resolveStyle';
import type { CssRule } from './styleOrder';
import type { Classes, ObjectClasses } from './types/common';
import type { KazeStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';

type Result<K extends string> = [
  cssRules: CssRule[],
  classes: Classes<K>,
  objectClasses: ObjectClasses<K>,
];

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const objectClasses = {} as ObjectClasses<K>;
  const cssRules: CssRule[] = [];

  for (const key in styles) {
    const [object, _cssRules] = resolveStyle(styles[key]);
    cssRules.push(..._cssRules);
    classes[key] = new ClassName(object) as ClassNameType;
    objectClasses[key] = object;
  }

  return [uniqueCssRules(cssRules), classes, objectClasses];
};
