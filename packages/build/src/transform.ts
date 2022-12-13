import type { TransformOptions, BabelOptions } from '@kaze-style/babel-plugin';
import { transform as babelTransform } from '@kaze-style/babel-plugin';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { transform as swcTransform } from '@kaze-style/swc-plugin';

type Options = {
  filename: string;
  swcOptions?: SwcOptions;
  babelOptions?: BabelOptions;
  transformOptions: TransformOptions;
};

export const transform = async (
  code: string,
  { filename, babelOptions = {}, swcOptions = {}, transformOptions }: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  if (compiler === 'swc') {
    const [transformedCode, metadata] = await swcTransform(code, {
      filename,
      swcOptions,
      transformOptions,
    });
    return [transformedCode, metadata] as const;
  } else {
    const [transformedCode, metadata] = await babelTransform(code, {
      filename,
      babelOptions,
      transformOptions,
    });
    return [transformedCode, metadata] as const;
  }
};
