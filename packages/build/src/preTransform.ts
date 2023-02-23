import type {
  // PreTransformOptions,
  BabelOptions,
} from '@kaze-style/babel-plugin';
// import { preTransform as babelPreTransform } from '@kaze-style/babel-plugin';
import type { Node } from '@kaze-style/core';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { preTransform as swcPreTransform } from '@kaze-style/swc-plugin';
import { BUILD_INJECTOR_NAME } from './constants';
import { COLLECTOR_EXPORT_NAME, DEFAULT_TRANSFORMS } from './constants';
import type { Transform } from './types';

type Options = {
  filename: string;
  swcOptions?: SwcOptions;
  babelOptions?: BabelOptions;
  preTransformOptions: Partial<PreTransformOptions>;
};

export type PreTransformOptions = {
  buildArg: Node;
  transforms: Transform[];
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
    collectorExportName: COLLECTOR_EXPORT_NAME,
    buildArg: {
      type: 'Object',
      properties: [
        {
          key: 'filename',
          value: {
            type: 'String',
            value: filename,
          },
        },
        {
          key: 'injector',
          value: {
            type: 'Identifier',
            name: BUILD_INJECTOR_NAME,
          },
        },
      ],
    },
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
