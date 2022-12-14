import type { sources } from 'webpack';

export const getSource = (assetSource: sources.Source): string => {
  const source = assetSource.source();
  if (typeof source === 'string') return source;
  return source.toString();
};
