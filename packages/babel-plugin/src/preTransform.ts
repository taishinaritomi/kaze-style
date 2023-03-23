import { transformAsync as babelTransform } from '@babel/core';
import type { TransformOptions as BabelOptions } from '@babel/core';
// @ts-expect-error type
import typescriptSyntax from '@babel/plugin-syntax-typescript';
import { preTransformPlugin } from './preTransformPlugin';

type Options = {
  filename: string;
  transform: Record<string, unknown>;
  babel?: BabelOptions;
};

type Metadata = { isTransformed: boolean };
type Result = [string, Metadata];

export const preTransform = async (
  code: string,
  options: Options,
): Promise<Result> => {
  const babelOptions = options.babel || {};
  const transformOptions = options.transform || {};
  const result = await babelTransform(code, {
    filename: options.filename,
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    ...babelOptions,
    plugins: [
      [preTransformPlugin, transformOptions],
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
