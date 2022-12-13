import { transformAsync as babelTransform } from '@babel/core';
import type { TransformOptions as BabelOptions } from '@babel/core';
// @ts-expect-error type
import typescriptSyntax from '@babel/plugin-syntax-typescript';
import type { PreTransformOptions } from './preTransformPlugin';
import { preTransformPlugin } from './preTransformPlugin';

type Options = {
  filename: string;
  preTransformOptions: PreTransformOptions;
  babelOptions?: BabelOptions;
};

type Metadata = { isTransformed: boolean };
type Result = [string, Metadata];

export const preTransform = async (
  code: string,
  { filename, preTransformOptions, babelOptions = {} }: Options,
): Promise<Result> => {
  const result = await babelTransform(code, {
    filename,
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    ...babelOptions,
    plugins: [
      [preTransformPlugin, preTransformOptions],
      [typescriptSyntax, { isTSX: true }],
      ...(babelOptions.plugins || []),
    ],
  });

  return [
    result?.code ?? '',
    {
      isTransformed:
        (result?.metadata as unknown as Metadata).isTransformed || false,
    },
  ];
};
