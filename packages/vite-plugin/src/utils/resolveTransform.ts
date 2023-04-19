import type { TransformStyleOptions } from '@kaze-style/builder';
import {
  extractionStyle,
  setupStyle,
  transformStyle,
} from '@kaze-style/builder';
import type { CssRule } from '@kaze-style/core';
import type { Loader } from 'esbuild';
import { build } from 'esbuild';

type Options = {
  filename: string;
  compiler: 'swc' | 'babel';
  imports: TransformStyleOptions['imports'];
  transforms: TransformStyleOptions['transforms'];
};

export const resolveTransform = async (
  code: string,
  { filename, compiler, imports, transforms }: Options,
): Promise<[code: string, cssRules: CssRule[]]> => {
  const [setupStyleCode, metadata] = await setupStyle(
    code,
    {
      filename,
      transform: {
        transforms: transforms,
      },
    },
    compiler,
  );

  if (setupStyleCode && metadata?.isTransformed) {
    const result = await build({
      entryPoints: [filename],
      bundle: true,
      write: false,
      platform: 'node',
      absWorkingDir: process.cwd(),
      outfile: filename + '.out',
      plugins: [
        {
          name: 'kaze-style-setup-style',
          setup(build) {
            build.onLoad(
              { filter: new RegExp('^' + filename + '$') },
              ({ path: buildPath }) => {
                return {
                  contents: setupStyleCode,
                  loader: buildPath.split('.').pop() as Loader,
                };
              },
            );
          },
        },
      ],
    });

    const { injectArgs, cssRules } = extractionStyle(
      result.outputFiles[0]?.text || '',
      {
        filename,
      },
    );

    const [transformedCode] = await transformStyle(
      setupStyleCode,
      {
        filename,
        transform: { injectArgs, imports, transforms },
      },
      compiler,
    );

    return [transformedCode, cssRules];
  } else {
    return [code, []];
  }
};
