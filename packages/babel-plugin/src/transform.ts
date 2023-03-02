import { transformAsync as babelTransform } from '@babel/core';
import type { TransformOptions as BabelOptions } from '@babel/core';
// @ts-expect-error type
import typescriptSyntax from '@babel/plugin-syntax-typescript';
import { transformPlugin } from './transformPlugin';

type Options = {
  filename: string;
  transformOptions: Record<string, unknown>;
  babelOptions?: BabelOptions;
};

type Metadata = undefined;
type Result = [string, Metadata];

export const transform = async (
  code: string,
  { filename, transformOptions, babelOptions = {} }: Options,
): Promise<Result> => {
  const result = await babelTransform(code, {
    filename,
    caller: { name: 'kaze' },
    babelrc: false,
    configFile: false,
    compact: false,
    ...babelOptions,
    plugins: [
      [transformPlugin, transformOptions],
      [typescriptSyntax, { isTSX: true }],
      ...(babelOptions.plugins || []),
    ],
  });

  return [result?.code ?? '', undefined];
};
