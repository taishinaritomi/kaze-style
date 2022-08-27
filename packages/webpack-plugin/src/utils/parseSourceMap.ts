import type * as Babel from '@babel/core';
import type { WebpackLoaderParams } from '../loader';

export const parseSourceMap = (
  inputSourceMap: WebpackLoaderParams[1],
): Babel.TransformOptions['inputSourceMap'] => {
  try {
    if (typeof inputSourceMap === 'string') {
      return JSON.parse(
        inputSourceMap,
      ) as Babel.TransformOptions['inputSourceMap'];
    }

    return inputSourceMap as Babel.TransformOptions['inputSourceMap'];
  } catch (err) {
    return undefined;
  }
};
