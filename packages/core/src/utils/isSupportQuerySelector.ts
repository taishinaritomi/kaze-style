export const isSupportQuerySelector = (property: string) => {
  return property.substr(0, 9) === '@supports';
};
