// import type { PreTransformOptions } from '@kaze-style/build';
import { transform as swcTransform } from '@swc/core';
// import type { Options as SwcOptions } from '@swc/core';

type Options = {
  filename: string;
  preTransformOptions: any;
  swcOptions?: any;
};

type Metadata = { isTransformed: boolean };
type Result = [string, Metadata];

const TRANSFORMED_COMMENT = '__KAZE_STYLE_TRANSFORMED_COMMENT';

export const preTransform = async (
  code: string,
  { filename, preTransformOptions, swcOptions = {} }: Options,
): Promise<Result> => {
  const result = await swcTransform(code, {
    filename,
    swcrc: false,
    ...swcOptions,
    jsc: {
      target: 'es2022',
      ...swcOptions.jsc,
      parser: swcOptions.jsc?.parser ?? {
        syntax: 'typescript',
        tsx: true,
      },
      experimental: {
        ...swcOptions.jsc?.experimental,
        plugins: [
          [
            '@kaze-style/swc-plugin/_pre-transform',
            { ...preTransformOptions, transformedComment: TRANSFORMED_COMMENT },
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
