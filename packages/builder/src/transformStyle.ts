import type { BabelOptions } from '@kaze-style/babel-plugin';
import { transformStyle as babelTransformStyle } from '@kaze-style/babel-plugin';
import type { Injector } from '@kaze-style/core';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { transformStyle as swcTransformStyle } from '@kaze-style/swc-plugin';
import { DEFAULT_TRANSFORMS } from './constants';
import type { Import, Transform } from './types';

type Options = {
  filename: string;
  swc?: SwcOptions;
  babel?: BabelOptions;
  transform: Partial<TransformStyleOptions>;
};

export type TransformStyleOptions = {
  imports: Import[];
  transforms: Transform[];
  injectArgs: Injector['args'];
};

export const transformStyle = async (
  code: string,
  options: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  const transformOption: TransformStyleOptions = {
    injectArgs: options.transform.injectArgs || [],
    imports: [
      {
        source: '@kaze-style/core',
        specifier: '__className',
      },
      ...(options.transform.imports || []),
    ],
    transforms: [
      ...DEFAULT_TRANSFORMS,
      ...(options.transform.transforms || []),
    ],
  };
  if (compiler === 'swc') {
    const [transformedCode, metadata] = await swcTransformStyle(code, {
      filename: options.filename,
      swc: options.swc || {},
      transform: transformOption,
    });

    return [transformedCode, metadata] as const;
  } else {
    const [transformedCode, metadata] = await babelTransformStyle(code, {
      filename: options.filename,
      babel: options.babel || {},
      transform: transformOption,
    });
    return [transformedCode, metadata] as const;
  }
};
