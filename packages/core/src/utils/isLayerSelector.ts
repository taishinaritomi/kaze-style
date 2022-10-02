export const isLayerSelector = (property: string) => {
  return property.substr(0, 6) === '@layer';
};
