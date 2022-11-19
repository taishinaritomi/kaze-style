import type { InputSourceMap } from '@kaze-style/build';
import type { WebpackLoaderParams } from '../loader';

export const parseSourceMap = (
  inputSourceMap: WebpackLoaderParams[1],
): InputSourceMap => {
  try {
    if (typeof inputSourceMap === 'string') {
      return JSON.parse(inputSourceMap) as InputSourceMap;
    }

    return inputSourceMap as InputSourceMap;
  } catch (err) {
    return undefined;
  }
};
