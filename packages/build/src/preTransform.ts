import type { BabelOptions } from '@kaze-style/babel-plugin';
import { preTransform as babelPreTransform } from '@kaze-style/babel-plugin';
import type { AstNode } from '@kaze-style/core';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { preTransform as swcPreTransform } from '@kaze-style/swc-plugin';
import { BUILD_INJECTOR_NAME } from './constants';
import { DEFAULT_TRANSFORMS } from './constants';
import type { Transform } from './types';

type Options = {
  filename: string;
  swc?: SwcOptions;
  babel?: BabelOptions;
  transform: {
    transforms?: Transform[];
  };
};

export type PreTransformOptions = {
  buildArg: AstNode;
  transforms: Transform[];
};

export const preTransform = async (
  code: string,
  options: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  const transformOption: PreTransformOptions = {
    buildArg: {
      type: 'Object',
      properties: [
        {
          key: 'filename',
          value: {
            type: 'String',
            value: options.filename,
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
      ...(options.transform.transforms || []),
    ],
  };

  if (compiler === 'swc') {
    const [transformedCode, metadata] = await swcPreTransform(code, {
      filename: options.filename,
      swc: options.swc || {},
      transform: transformOption,
    });
    return [transformedCode, metadata] as const;
  } else {
    const [transformedCode, metadata] = await babelPreTransform(code, {
      filename: options.filename,
      babel: options.babel || {},
      transform: transformOption,
    });
    return [transformedCode, metadata] as const;
  }
};
