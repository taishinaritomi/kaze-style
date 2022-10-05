import { ClassName } from './ClassName';

type ClassNamesArgs = (string | false | undefined | null | ClassName)[];

export const mergeStyle = (..._classNames: ClassNamesArgs): string => {
  const others: string[] = [];
  const styles: ClassName['object'] = {};

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      others.push(className);
    } else if (className instanceof ClassName) {
      others.push(...className.others);
      Object.assign(styles, className.object);
    }
  });
  return new ClassName(styles, others) as unknown as string;
};
