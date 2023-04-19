import type { TransformStyleOptions } from '@kaze-style/builder';
import { setupStyle } from '@kaze-style/builder';
import type { LoaderContext } from 'webpack';
import type { WebpackLoaderParams } from './transformLoader';

function setupLoader(
  this: LoaderContext<{
    compiler: 'swc' | 'babel';
    transforms: TransformStyleOptions['transforms'];
  }>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
  additionalData: WebpackLoaderParams[2],
) {
  this.cacheable(true);
  const options = this.getOptions();
  const callback = this.async();
  setupStyle(
    sourceCode,
    {
      filename: this.resourcePath,
      transform: {
        transforms: options.transforms,
      },
    },
    options.compiler,
  ).then(([transformedCode, metadata]) => {
    if (!transformedCode || metadata?.isTransformed !== true) {
      callback(null, sourceCode, inputSourceMap);
      return;
    } else {
      callback(
        null,
        transformedCode,
        undefined,
        Object.assign({}, additionalData, { kazeTransformed: true }),
      );
    }
  });
}

export default setupLoader;
