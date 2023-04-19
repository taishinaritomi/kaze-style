import type { BabelOptions } from '@kaze-style/babel-plugin';
import { setupStyle as babelSetupStyle } from '@kaze-style/babel-plugin';
import type { Ast } from '@kaze-style/core';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { setupStyle as swcSetupStyle } from '@kaze-style/swc-plugin';
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

export type SetupStyleOptions = {
  buildInfo: Ast.Node;
  transforms: Transform[];
};

export const setupStyle = async (
  code: string,
  options: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  const transformOption: SetupStyleOptions = {
    buildInfo: {
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
    const [transformedCode, metadata] = await swcSetupStyle(code, {
      filename: options.filename,
      swc: options.swc || {},
      transform: transformOption,
    });
    return [transformedCode, metadata] as const;
  } else {
    const [transformedCode, metadata] = await babelSetupStyle(code, {
      filename: options.filename,
      babel: options.babel || {},
      transform: transformOption,
    });
    return [transformedCode, metadata] as const;
  }
};
