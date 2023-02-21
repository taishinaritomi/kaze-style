import type {
  // PreTransformOptions,
  BabelOptions,
} from '@kaze-style/babel-plugin';
// import { preTransform as babelPreTransform } from '@kaze-style/babel-plugin';
import type { Node } from '@kaze-style/core';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { preTransform as swcPreTransform } from '@kaze-style/swc-plugin';
import type { Imports, Transforms } from './constants';
import { COLLECTOR_NAME } from './constants';
import {
  DEFAULT_IMPORTS,
  DEFAULT_TRANSFORMS,
  GET_DEFAULT_INJECT_ARGUMENT,
} from './constants';
// import { BUILD_ARGUMENT_NAME } from './constants';

type Options = {
  filename: string;
  swcOptions?: SwcOptions;
  babelOptions?: BabelOptions;
  preTransformOptions: Partial<PreTransformOptions>;
};

export type PreTransformOptions = {
  transforms: Transforms;
  injectArgument: Node;
  imports: Imports;
  collectorExportName: string;
};

export const preTransform = async (
  code: string,
  {
    filename,
    babelOptions = {},
    swcOptions = {},
    preTransformOptions,
  }: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  compiler;
  babelOptions;
  const option: PreTransformOptions = {
    collectorExportName: COLLECTOR_NAME,
    injectArgument: GET_DEFAULT_INJECT_ARGUMENT(filename),
    imports: [...DEFAULT_IMPORTS, ...(preTransformOptions.imports || [])],
    transforms: [
      ...DEFAULT_TRANSFORMS,
      ...(preTransformOptions.transforms || []),
    ],
  };
  // if (compiler === 'swc') {
  const [transformedCode, metadata] = await swcPreTransform(code, {
    filename,
    swcOptions,
    preTransformOptions: option,
  });
  return [transformedCode, metadata] as const;
  // } else {
  //   const [transformedCode, metadata] = await babelPreTransform(code, {
  //     filename,
  //     babelOptions,
  //     preTransformOptions: { buildArgumentName, ...preTransformOptions },
  //   });
  //   return [transformedCode, metadata] as const;
  // }
};
