import type { BabelOptions } from '@kaze-style/babel-plugin';
import type { Injector } from '@kaze-style/core';
// import { transform as babelTransform } from '@kaze-style/babel-plugin';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { transform as swcTransform } from '@kaze-style/swc-plugin';
import { DEFAULT_TRANSFORMS } from './constants';
import type { Import, Transform } from './types';

type Options = {
  filename: string;
  swcOptions?: SwcOptions;
  babelOptions?: BabelOptions;
  transformOptions: Partial<TransformOptions>;
};

export type TransformOptions = {
  imports: Import[];
  transforms: Transform[];
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
    imports: [
      {
        source: '@kaze-style/core',
        specifier: '__className',
      },
      ...(transformOptions.imports || []),
    ],
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
