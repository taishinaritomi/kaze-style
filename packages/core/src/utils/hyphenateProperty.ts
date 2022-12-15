export const hyphenateProperty = (property: string): string => {
  const parsedStr = property.includes('-')
    ? property
    : property.replace(/[A-Z]/g, (capital) => '-' + capital.toLowerCase());
  return parsedStr;
};
