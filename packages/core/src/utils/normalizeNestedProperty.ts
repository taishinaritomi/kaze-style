export const normalizeNestedProperty = (nestedProperty: string): string => {
  return nestedProperty.charAt(0) === '&'
    ? nestedProperty.slice(1)
    : nestedProperty;
};
