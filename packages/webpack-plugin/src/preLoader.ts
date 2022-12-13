import { preTransform } from '@kaze-style/build';
import type { LoaderContext } from 'webpack';
import type { WebpackLoaderParams } from './loader';

function loader(
  this: LoaderContext<{ compiler: 'swc' | 'babel' }>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
  additionalData: WebpackLoaderParams[2],
) {
  this.cacheable(true);
  const options = this.getOptions();
  const callback = this.async();
  preTransform(
    sourceCode,
    {
      filename: this.resourcePath,
      preTransformOptions: {
        filename: this.resourcePath,
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

export default loader;
