// import type { TransformOptions } from '@kaze-style/build';
import { transform as swcTransform } from '@swc/core';
import type { Options as SwcOptions } from '@swc/core';

type Options = {
  filename: string;
  transform: Record<string, unknown>;
  swc?: SwcOptions;
};

type Metadata = undefined;
type Result = [string, Metadata];

export const transform = async (
  code: string,
  options: Options,
): Promise<Result> => {
  const swcOptions = options.swc || {};
  const transformOptions = options.transform || {};
  const result = await swcTransform(code, {
    filename: options.filename,
    swcrc: false,
    ...swcOptions,
    jsc: {
      target: 'es2022',
      ...swcOptions.jsc,
      experimental: {
        ...swcOptions.jsc?.experimental,
        plugins: [
          ['@kaze-style/swc-plugin/_transform', { ...transformOptions }],
          ...(swcOptions.jsc?.experimental?.plugins || []),
        ],
      },
    },
  });
  return [result.code, undefined];
};
