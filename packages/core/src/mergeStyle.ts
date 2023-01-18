import type { ClassNameObject, ClassNameType } from './ClassName';
import { ClassName } from './ClassName';
import { isObject } from './utils/isObject';

type ClassNamesArgs = (
  | string
  | false
  | undefined
  | null
  | ClassName
  | ClassNameObject
)[];

export const mergeStyle = (..._classNames: ClassNamesArgs) => {
  const styles: ClassNameObject = {};
  const other: string[] = [];

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      other.push(className);
    } else if (className instanceof ClassName) {
      other.push(...className.other);
      Object.assign(styles, className.obj);
    } else if (isObject(className)) {
      Object.assign(styles, className);
    }
  });
  return new ClassName(styles, other) as ClassNameType;
};
