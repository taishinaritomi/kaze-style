import { ClassName } from './utils/ClassName';

type ClassNamesArgs = (string | false | undefined | null | ClassName)[];

export const mergeStyle = (..._classNames: ClassNamesArgs): string => {
  const notMatchClassNames: string[] = [];
  const matchStyles: ClassName['object'] = {};

  _classNames.forEach((className) => {
    if (typeof className === 'string') {
      notMatchClassNames.push(className);
    } else if (className instanceof ClassName) {
      Object.assign(matchStyles, className.object);
    }
  });

  const matchClassName = Object.values(matchStyles);

  return [...matchClassName, ...notMatchClassNames].join(' ').trim();
};
