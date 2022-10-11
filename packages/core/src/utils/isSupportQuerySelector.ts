export const isSupportQuerySelector = (property: string) => {
  const supports = '@supports';
  return property.substring(0, supports.length) === supports;
};
