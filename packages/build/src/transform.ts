import type {
  BabelFileMetadata,
  TransformOptions as BabelTransformOptions,
} from '@babel/core';
import { transformSync } from '@babel/core';
// @ts-expect-error type
import typescriptSyntax from '@babel/plugin-syntax-typescript';
import type { TransformOptions } from '@kaze-style/babel-plugin';
import { transformPlugin } from '@kaze-style/babel-plugin';

type Args = {
  code: string;
  filename: string;
  inputSourceMap: InputSourceMap;
  sourceMaps: BabelTransformOptions['sourceMaps'];
  options: TransformOptions;
};
export type InputSourceMap = BabelTransformOptions['inputSourceMap'];

type Metadata = BabelFileMetadata & { transformed?: boolean };

export const transform = ({
  code,
  filename,
  options,
  inputSourceMap,
  sourceMaps,
}: Args) => {
  const result = transformSync(code, {
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    filename,
    sourceMaps: sourceMaps || false,
    plugins: [
      [transformPlugin, options],
      [typescriptSyntax, { isTSX: true }],
    ],
    sourceFileName: filename,
    inputSourceMap: inputSourceMap,
  });
  return {
    code: result?.code,
    metadata: result?.metadata as Metadata | undefined,
  };
};
