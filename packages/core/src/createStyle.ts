import type { ClassNameType } from './ClassName';
import { ClassName } from './ClassName';
import { resolveStyle } from './resolveStyle';
import type { CssRule } from './styleOrder';
import type { Classes, RecordClasses } from './types/common';
import type { KazeStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';

type Result<K extends string> = [
  cssRules: CssRule[],
  classes: Classes<K>,
  recordClasses: RecordClasses<K>,
];

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const recordClasses = {} as RecordClasses<K>;
  const cssRules: CssRule[] = [];

  for (const key in styles) {
    const [classNameRecord, _cssRules] = resolveStyle(styles[key]);
    cssRules.push(..._cssRules);
    classes[key] = new ClassName(classNameRecord) as ClassNameType;
    recordClasses[key] = classNameRecord;
  }

  return [uniqueCssRules(cssRules), classes, recordClasses];
};
