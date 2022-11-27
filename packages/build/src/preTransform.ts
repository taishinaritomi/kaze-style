import type {
  BabelFileMetadata,
  TransformOptions as BabelTransformOptions,
} from '@babel/core';
import { transformSync } from '@babel/core';
// @ts-expect-error type
import typescriptSyntax from '@babel/plugin-syntax-typescript';
import type { PreTransformOptions } from '@kaze-style/babel-plugin';
import { preTransformPlugin } from '@kaze-style/babel-plugin';
import { forBuildName as _forBuildName } from './constants';
import type { InputSourceMap } from './transform';

type Args = {
  code: string;
  filename: string;
  sourceMaps: BabelTransformOptions['sourceMaps'];
  inputSourceMap: InputSourceMap;
  options: Omit<PreTransformOptions, 'forBuildName'> &
    Partial<Pick<PreTransformOptions, 'forBuildName'>>;
};

type Metadata = BabelFileMetadata & { transformed?: boolean };

export const preTransform = ({
  code,
  filename,
  inputSourceMap,
  sourceMaps,
  options: { forBuildName = _forBuildName, ...options },
}: Args) => {
  const result = transformSync(code, {
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    filename,
    sourceMaps: sourceMaps || false,
    plugins: [
      [preTransformPlugin, { ...options, forBuildName }],
      typescriptSyntax,
    ],
    sourceFileName: filename,
    inputSourceMap: inputSourceMap,
  });

  return {
    code: result?.code,
    metadata: result?.metadata as Metadata | undefined,
  };
};
