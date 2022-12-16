export const normalizeNestSelector = (
  current: string,
  nest: string,
): string => {
  if (current) {
    return current + (nest.charAt(0) === '&' ? nest.slice(1) : nest);
  } else {
    return nest.includes('&') ? nest : '&' + nest;
  }
};
