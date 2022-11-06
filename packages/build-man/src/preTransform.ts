import type { BabelFileMetadata, TransformOptions } from '@babel/core';
import { transformSync } from '@babel/core';
// @ts-expect-error type
import typescriptSyntax from '@babel/plugin-syntax-typescript';
import { preTransformPlugin } from '@kaze-style/babel-plugin';
import type { InputSourceMap } from './transform';

type Args = {
  code: string;
  path: string;
  sourceMaps: TransformOptions['sourceMaps'];
  inputSourceMap: InputSourceMap;
};

type Metadata = BabelFileMetadata & { transformed?: boolean };

export const preTransform = ({
  code,
  path,
  inputSourceMap,
  sourceMaps,
}: Args) => {
  const result = transformSync(code, {
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    filename: path,
    sourceMaps: sourceMaps || false,
    plugins: [preTransformPlugin,typescriptSyntax],
    sourceFileName: path,
    inputSourceMap: inputSourceMap,
  });

  return {
    code: result?.code,
    metadata: result?.metadata as Metadata | undefined,
  };
};
