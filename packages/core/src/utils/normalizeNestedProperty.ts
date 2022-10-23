export const normalizeNestedProperty = (
  nestedProperty: string,
  nowProperty: string,
): string => {
  let pseudo = nowProperty;
  if (nowProperty) {
    pseudo +=
      nestedProperty.charAt(0) === '&'
        ? nestedProperty.slice(1)
        : nestedProperty;
  } else {
    pseudo =
      nestedProperty.includes('&')
        ? nestedProperty
        : '&' + nestedProperty;
  }
  return pseudo;
};
