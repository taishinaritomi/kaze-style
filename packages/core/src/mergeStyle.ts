import { ClassName } from './ClassName';
import { isObject } from './utils/isObject';

type ClassNamesArgs = (
  | string
  | false
  | undefined
  | null
  | ClassName
  | ClassName['Static']
)[];

export const mergeStyle = (..._classNames: ClassNamesArgs) => {
  const classNameStatic: ClassName['Static'] = {};
  const other: string[] = [];

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      other.push(className);
    } else if (className instanceof ClassName) {
      other.push(...className.other());
      Object.assign(classNameStatic, className.static());
    } else if (isObject(className)) {
      Object.assign(classNameStatic, className);
    }
  });
  return new ClassName(classNameStatic, other) as ClassName['Type'];
};
