export const normalizeNestedProperty = (
  nestedProperty: string,
  nowProperty: string,
): string => {
  let nested = nowProperty;
  if (nowProperty) {
    nested +=
      nestedProperty.charAt(0) === '&'
        ? nestedProperty.slice(1)
        : nestedProperty;
  } else {
    nested = nestedProperty.includes('&')
      ? nestedProperty
      : '&' + nestedProperty;
  }
  return nested;
};
