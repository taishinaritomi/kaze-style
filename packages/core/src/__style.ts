import type { Classes, ClassesObject } from './types/style';
import { ClassName } from './utils/ClassName';

export const __style = <K extends string>(styles: ClassesObject<K>) => {
  const classes = {} as Classes<K>;
  for (const key in styles) {
    if (styles.hasOwnProperty(key)) {
      const objectClassName = styles[key] as ClassName['object'];
      classes[key] = new ClassName(objectClassName) as unknown as string;
    }
  }
  return classes;
};
