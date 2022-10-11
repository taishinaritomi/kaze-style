export const isMediaQuerySelector = (property: string) => {
  const media = '@media';
  return property.substring(0, media.length) === media;
};
