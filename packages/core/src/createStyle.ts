import { ClassName } from './ClassName';
import { resolveStyle } from './resolveStyle';
import type { CssRule } from './styleOrder';
import type { Classes, PureClasses } from './types/common';
import type { KazeStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';

type Result<K extends string> = [
  cssRules: CssRule[],
  classes: Classes<K>,
  pureClasses: PureClasses<K>,
];

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const pureClasses = {} as PureClasses<K>;
  const cssRules: CssRule[] = [];

  for (const key in styles) {
    const [object, _cssRules] = resolveStyle(styles[key]);
    cssRules.push(..._cssRules);
    classes[key] = new ClassName(object);
    pureClasses[key] = object;
  }

  return [uniqueCssRules(cssRules), classes, pureClasses];
};
