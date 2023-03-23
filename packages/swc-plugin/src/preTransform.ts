import { transform as swcTransform } from '@swc/core';
import type { Options as SwcOptions } from '@swc/core';

type Options = {
  filename: string;
  transform: Record<string, unknown>;
  swc?: SwcOptions;
};

type Metadata = { isTransformed: boolean };
type Result = [string, Metadata];

const TRANSFORMED_COMMENT = '__KAZE_STYLE_TRANSFORMED_COMMENT';

export const preTransform = async (
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
          [
            '@kaze-style/swc-plugin/_pre-transform',
            { ...transformOptions, transformedComment: TRANSFORMED_COMMENT },
          ],
          ...(swcOptions.jsc?.experimental?.plugins || []),
        ],
      },
    },
  });
  return [
    result.code,
    { isTransformed: result.code.includes(TRANSFORMED_COMMENT) },
  ];
};
