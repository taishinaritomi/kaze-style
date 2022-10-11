export const isLayerSelector = (property: string) => {
  const layer = '@layer';
  return property.substring(0, layer.length) === layer;
};
