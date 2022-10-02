export const hyphenateProperty = (str: string): string => {
  const parsedStr = str.includes('-')
    ? str
    : str.replace(/[A-Z]/g, (capital) => '-' + capital.toLowerCase());
  return parsedStr;
};
