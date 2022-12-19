import { ClassName } from './ClassName';

type ClassNamesArgs = (string | false | undefined | null | ClassName)[];

export const mergeStyle = (..._classNames: ClassNamesArgs): string => {
  const styles: ClassName['object'] = {};
  const other: string[] = [];

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      other.push(className);
    } else if (className instanceof ClassName) {
      other.push(...className.other);
      Object.assign(styles, className.object);
    }
  });
  return new ClassName(styles, other) as unknown as string;
};
