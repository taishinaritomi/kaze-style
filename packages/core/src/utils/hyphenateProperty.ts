const cache: Record<string, string> = {};

export const hyphenateProperty = (str: string): string => {
  if (cache.hasOwnProperty(str)) return cache[str] || '';
  const parsedStr = str.includes('-')
    ? str
    : str.replace(/[A-Z]/g, (capital) => '-' + capital.toLowerCase());

  cache[str] = parsedStr;
  return parsedStr;
};
