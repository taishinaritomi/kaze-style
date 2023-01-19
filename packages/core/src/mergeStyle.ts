import type { ClassNameRecord, ClassNameType } from './ClassName';
import { ClassName } from './ClassName';
import { isObject } from './utils/isObject';

type ClassNamesArgs = (
  | string
  | false
  | undefined
  | null
  | ClassName
  | ClassNameRecord
)[];

export const mergeStyle = (..._classNames: ClassNamesArgs) => {
  const classNameRecord: ClassNameRecord = {};
  const other: string[] = [];

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      other.push(className);
    } else if (className instanceof ClassName) {
      other.push(...className.other());
      Object.assign(classNameRecord, className.static());
    } else if (isObject(className)) {
      Object.assign(classNameRecord, className);
    }
  });
  return new ClassName(classNameRecord, other) as ClassNameType;
};
