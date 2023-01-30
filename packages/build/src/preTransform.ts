import type {
  PreTransformOptions,
  BabelOptions,
} from '@kaze-style/babel-plugin';
import { preTransform as babelPreTransform } from '@kaze-style/babel-plugin';
import type { SwcOptions } from '@kaze-style/swc-plugin';
import { preTransform as swcPreTransform } from '@kaze-style/swc-plugin';
import { FOR_BUILD_NAME } from './constants';

type Options = {
  filename: string;
  swcOptions?: SwcOptions;
  babelOptions?: BabelOptions;
  preTransformOptions: Omit<PreTransformOptions, 'forBuildName'> &
    Partial<Pick<PreTransformOptions, 'forBuildName'>>;
};

export const preTransform = async (
  code: string,
  {
    filename,
    babelOptions = {},
    swcOptions = {},
    preTransformOptions: {
      forBuildName = FOR_BUILD_NAME,
      ...preTransformOptions
    },
  }: Options,
  compiler: 'swc' | 'babel' = 'babel',
) => {
  if (compiler === 'swc') {
    const [transformedCode, metadata] = await swcPreTransform(code, {
      filename,
      swcOptions,
      preTransformOptions: { forBuildName, ...preTransformOptions },
    });
    return [transformedCode, metadata] as const;
  } else {
    const [transformedCode, metadata] = await babelPreTransform(code, {
      filename,
      babelOptions,
      preTransformOptions: { forBuildName, ...preTransformOptions },
    });
    return [transformedCode, metadata] as const;
  }
};
