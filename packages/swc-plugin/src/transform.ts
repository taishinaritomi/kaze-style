import type { ForBuild } from '@kaze-style/core';
import type { SerializedValues } from '@kaze-style/core/src';
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

// This would live in a better place as well.
interface ImportSpecifier {
  specifier: string;
  source: string;
}

interface Config {
  transforms: {
    from: ImportSpecifier;
    to: ImportSpecifier;
  }[];
  imports: ImportSpecifier[];
  styles: {
    index: number;
    // Each index of the array represent the argument it will replace.
    arguments: SerializedValues[];
  }[],
}

export const transform = async (
  code: string,
  { filename, transformOptions, swcOptions = {} }: Options,
): Promise<Result> => {
  // These options would be passed to swcTransform from the initialisation of the plugin.
  const temp: Config = {
    transforms: [{
      from: {
        specifier: '__preStyle',
        source: '@kaze-style/core'
      },
      to: {
        specifier: '__style',
        source: '@kaze-style/core'
      }
    },
    {
      from: {
        specifier: '__preGlobalStyle',
        source: '@kaze-style/core'
      },
      to: {
        specifier: '__globalStyle',
        source: '@kaze-style/core'
      }
    }],
    imports: [{
      specifier: 'ClassName',
      source: '@kaze-style/core'
    }],
    styles: transformOptions.styles
  };

  // Todo: do some cool stuff here.
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
            '@kaze-style/swc-plugin/_transform',
            { ...transformOptions, ...temp },
          ],
          ...(swcOptions.jsc?.experimental?.plugins || []),
        ],
      },
    },
  });
  return [result.code, undefined];
};
