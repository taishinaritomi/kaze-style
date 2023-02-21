import type { BabelOptions } from '@kaze-style/babel-plugin';
import type { Injector } from '@kaze-style/core';
// import { transform as babelTransform } from '@kaze-style/babel-plugin';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { transform as swcTransform } from '@kaze-style/swc-plugin';
import type { Imports, Transforms } from './constants';
import { DEFAULT_IMPORTS, DEFAULT_TRANSFORMS } from './constants';

type Options = {
  filename: string;
  swcOptions?: SwcOptions;
  babelOptions?: BabelOptions;
  transformOptions: Partial<TransformOptions>;
};

export type TransformOptions = {
  transforms: Transforms;
  imports: Imports;
  injectArguments: Injector['injectArguments'];
};

export const transform = async (
  code: string,
  { filename, babelOptions = {}, swcOptions = {}, transformOptions }: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  compiler;
  babelOptions;
  const option: TransformOptions = {
    injectArguments: transformOptions.injectArguments || [],
    imports: [...DEFAULT_IMPORTS, ...(transformOptions.imports || [])],
    transforms: [...DEFAULT_TRANSFORMS, ...(transformOptions.transforms || [])],
  };
  // if (compiler === 'swc') {
  const [transformedCode, metadata] = await swcTransform(code, {
    filename,
    swcOptions,
    transformOptions: option,
  });
  return [transformedCode, metadata] as const;
  // } else {
  //   const [transformedCode, metadata] = await babelTransform(code, {
  //     filename,
  //     babelOptions,
  //     transformOptions,
  //   });
  //   return [transformedCode, metadata] as const;
  // }
};
