import { ClassName } from './ClassName';
import { compileAtomicCss } from './compileAtomicCss';
import { compileNotAtomicCss } from './compileNotAtomicCss';
import type { Classes, StaticClasses, CssRule } from './types/common';
import type { KazeStyle } from './types/style';
import { uniqueCssRules } from './uniqueCssRules';
import { hashStyle } from './utils/hashStyle';

type Result<K extends string> = [
  cssRules: CssRule[],
  classes: Classes<K>,
  staticClasses: StaticClasses<K>,
];

export const resolveStyle = <K extends string>(
  styles: KazeStyle<K>,
): Result<K> => {
  const classes = {} as Classes<K>;
  const staticClasses = {} as StaticClasses<K>;
  const cssRules: CssRule[] = [];

  for (const key in styles) {
    if (key.startsWith('$')) {
      const [_cssRules, classNameRecord] = compileAtomicCss(styles[key]);
      cssRules.push(..._cssRules);
      classes[key] = new ClassName(classNameRecord) as ClassName['Type'];
      staticClasses[key] = classNameRecord;
    } else {
      const className = `${hashStyle(styles[key])}`;
      const [_cssRules] = compileNotAtomicCss(
        styles[key],
        'notAtomic',
        `.${className}`,
      );
      cssRules.push(..._cssRules);
      // @ts-expect-error type
      classes[key] = className;
      staticClasses[key] = className;
    }
  }

  return [uniqueCssRules(cssRules), classes, staticClasses];
};
