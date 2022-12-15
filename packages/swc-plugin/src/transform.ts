import type { ForBuild } from '@kaze-style/core';
import { transform as swcTransform } from '@swc/core';
import type { Options as SwcOptions } from '@swc/core';

type TransformOptions = {
  styles: ForBuild[2];
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
  const _styles = transformOptions.styles.map(([classes, index]) => ({
    classes,
    index,
  }));
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
          [
            '@kaze-style/swc-plugin/_transform',
            { ...transformOptions, styles: _styles },
          ],
          ...(swcOptions.jsc?.experimental?.plugins || []),
        ],
      },
    },
  });
  return [result.code, undefined];
};
