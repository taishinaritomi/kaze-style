import type { BabelFileMetadata, TransformOptions } from '@babel/core';
import { transformSync } from '@babel/core';
import type { Options } from '@kaze-style/babel-plugin';
import { transformPlugin } from '@kaze-style/babel-plugin';

type Args = {
  code: string;
  path: string;
  inputSourceMap: InputSourceMap;
  sourceMaps: TransformOptions['sourceMaps'];
  options: Options;
};
export type InputSourceMap = TransformOptions['inputSourceMap'];

type Metadata = BabelFileMetadata & { transformed?: boolean };

export const transform = ({
  code,
  path,
  options,
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
    plugins: [[transformPlugin, options]],
    sourceFileName: path,
    inputSourceMap: inputSourceMap,
  });
  return {
    code: result?.code,
    metadata: result?.metadata as Metadata | undefined,
    map: result?.map,
  };
};
