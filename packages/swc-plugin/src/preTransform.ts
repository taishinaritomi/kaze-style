import { transform as swcTransform } from '@swc/core';
import type { Options as SwcOptions } from '@swc/core';

export type PreTransformOptions = {
  filename: string;
  forBuildName: string;
};

type Options = {
  filename: string;
  preTransformOptions: PreTransformOptions;
  swcOptions?: SwcOptions;
};

type Metadata = { isTransformed: boolean };
type Result = [string, Metadata];

const transformed_comment = '__kaze-style-pre-transformed';

export const preTransform = async (
  code: string,
  { filename, preTransformOptions, swcOptions = {} }: Options,
): Promise<Result> => {
  const result = await swcTransform(code, {
    filename,
    swcrc: false,
    ...swcOptions,
    jsc: {
      target: "es2022",
      ...swcOptions.jsc,
      parser: swcOptions.jsc?.parser ?? {
        syntax: 'typescript',
        tsx: true,
      },
      experimental: {
        ...swcOptions.jsc?.experimental,
        plugins: [
          ['@kaze-style/swc-plugin/_pre-transform', preTransformOptions],
          ...(swcOptions.jsc?.experimental?.plugins || []),
        ],
      },
    },
  });
  return [
    result.code,
    { isTransformed: result.code.includes(transformed_comment) },
  ];
};
