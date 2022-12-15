import { ClassName } from './ClassName';

type ClassNamesArgs = (string | false | undefined | null | ClassName)[];

export const mergeStyle = (..._classNames: ClassNamesArgs): string => {
  const styles: ClassName['o'] = {};
  const etc: string[] = [];

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      etc.push(className);
    } else if (className instanceof ClassName) {
      etc.push(...className.e);
      Object.assign(styles, className.o);
    }
  });
  return new ClassName(styles, etc) as unknown as string;
};
