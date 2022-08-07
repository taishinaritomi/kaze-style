export const isNestedSelector = (property: string): boolean => {
  return /^(:|\[|>|&)/.test(property);
};
