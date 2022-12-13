import type { ForBuildStyle } from '@kaze-style/core';
import { transform as swcTransform } from '@swc/core';
import type { Options as SwcOptions } from '@swc/core';

type TransformOptions = {
  styles: ForBuildStyle<string>[];
};

type Options = {
  filename: string;
  transformOptions: TransformOptions;
  swcOptions?: SwcOptions;
};

type Metadata = undefined;
type Result = [string, Metadata];

export const transform = async (
  code: string,
  { filename, transformOptions, swcOptions = {} }: Options,
): Promise<Result> => {
  const result = await swcTransform(code, {
    filename,
    swcrc: false,
    ...swcOptions,
    jsc: {
      ...swcOptions.jsc,
      parser: swcOptions.jsc?.parser ?? {
        syntax: 'typescript',
        tsx: true,
      },
      experimental: {
        ...swcOptions.jsc?.experimental,
        plugins: [
          ['@kaze-style/swc-plugin/_transform', transformOptions],
          ...(swcOptions.jsc?.experimental?.plugins || []),
        ],
      },
    },
  });
  return [result.code, undefined];
};
