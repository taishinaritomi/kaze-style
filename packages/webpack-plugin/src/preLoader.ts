import path from 'path';
import * as Babel from '@babel/core';
import { preTransformPlugin } from '@kaze-style/babel-plugin';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
} from 'webpack';
import type { ChildCompiler } from './compiler';
import { parseSourceMap } from './utils/parseSourceMap';

type Option = {
  childCompiler?: ChildCompiler;
};

export type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<Option>>;
export type LoaderContext = _LoaderContext<Option>;

export const transformedComment = '/* Kaze style Transformed File */';

function loader(
  this: LoaderContext,
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

  if (
    (
      babelFileResult.metadata as
        | (Babel.BabelFileMetadata & { transformed?: boolean })
        | undefined
    )?.transformed === true
  ) {
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
