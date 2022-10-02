export const isMediaQuerySelector = (property: string) => {
  return property.substr(0, 6) === '@media';
};
