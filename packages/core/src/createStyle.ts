import type { ClassNameType } from './ClassName';
import { ClassName } from './ClassName';
import { compileAtomicCss } from './compileAtomicCss';
import { compileNotAtomicCss } from './compileNotAtomicCss';
import type { CssRule } from './styleOrder';
import type { Classes, StaticClasses } from './types/common';
import type { KazeStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';
import { hashStyle } from './utils/hashStyle';

type Result<K extends string> = [
  cssRules: CssRule[],
  classes: Classes<K>,
  staticClasses: StaticClasses<K>,
];

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const staticClasses = {} as StaticClasses<K>;
  const cssRules: CssRule[] = [];

  for (const key in styles) {
    if (key.startsWith('$')) {
      const [_cssRules, classNameRecord] = compileAtomicCss(styles[key]);
      cssRules.push(..._cssRules);
      classes[key] = new ClassName(classNameRecord) as ClassNameType;
      staticClasses[key] = classNameRecord;
    } else {
      const selector = `${hashStyle(styles[key])}`;
      const [_cssRules] = compileNotAtomicCss(
        styles[key],
        'notAtomic',
        `.${selector}`,
      );
      cssRules.push(..._cssRules);
      // @ts-expect-error type
      classes[key] = selector;
      staticClasses[key] = selector;
    }
  }

  return [uniqueCssRules(cssRules), classes, staticClasses];
};
