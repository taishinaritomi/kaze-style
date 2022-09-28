import path from 'path';
import * as Babel from '@babel/core';
import { preTransformPlugin } from '@kaze-style/babel-plugin';
import type { LoaderDefinitionFunction, LoaderContext } from 'webpack';
import { transformedComment } from './utils/constants';
import { parseSourceMap } from './utils/parseSourceMap';

type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<never>>;

type BabelFileMetadata =
  | (Babel.BabelFileMetadata & { transformed?: boolean })
  | undefined;

function loader(
  this: LoaderContext<never>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  this.cacheable(true);
  const filePath = path.relative(process.cwd(), this.resourcePath);

  const babelFileResult = Babel.transformSync(sourceCode, {
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    filename: filePath,
    plugins: [[preTransformPlugin]],
    sourceMaps: this.sourceMap || false,
    sourceFileName: filePath,
    inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
  });

  if (babelFileResult === null) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  if ((babelFileResult.metadata as BabelFileMetadata)?.transformed === true) {
    this.callback(
      null,
      `${transformedComment}\n${babelFileResult.code}`,
      babelFileResult.map as unknown as string,
    );
    return;
  }

  this.callback(null, sourceCode, inputSourceMap);
}

export default loader;
