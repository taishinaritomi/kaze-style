type ClassNamesArgs = (string | false | undefined | null)[];

export const mergeStyle = (..._classNames: ClassNamesArgs): string => {
  const notMatchStyles = new Set<string>();
  const matchStyles: Record<string, string> = {};

  const classNames = _classNames.filter(Boolean).join(' ').split(' ');

  classNames.forEach((className) => {
    const [hash, property, value] = className.split('-');
    if (!hash || !property || !value) {
      className !== '' && notMatchStyles.add(className);
    } else {
      Object.assign(matchStyles, { [property]: className });
    }
  });

  const matchClasses = Object.values(matchStyles).join(' ');

  const notMatchClasses = Array.from(notMatchStyles).join(' ');

  return [matchClasses, notMatchClasses].join(' ').trim();
};
