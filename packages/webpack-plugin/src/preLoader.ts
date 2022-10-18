import { preTransform } from '@kaze-style/build-man';
import type { LoaderContext } from 'webpack';
import type { WebpackLoaderParams } from './loader';
import { parseSourceMap } from './utils/parseSourceMap';

function loader(
  this: LoaderContext<never>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
  additionalData: WebpackLoaderParams[2],
) {
  this.cacheable(true);

  const { code, metadata } = preTransform({
    code: sourceCode,
    path: this.resourcePath,
    sourceMaps: this.sourceMap,
    inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
  });

  if (!code || metadata?.transformed !== true) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  this.callback(
    null,
    code,
    undefined,
    Object.assign({}, additionalData, { kazeTransformed: true }),
  );
}

export default loader;
