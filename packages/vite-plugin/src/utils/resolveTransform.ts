import type { TransformOptions } from '@kaze-style/build';
import { extractionStyle, preTransform, transform } from '@kaze-style/build';
import type { CssRule } from '@kaze-style/core';
import type { Loader } from 'esbuild';
import { build } from 'esbuild';

type Options = {
  filename: string;
  compiler: 'swc' | 'babel';
  imports: TransformOptions['imports'];
  transforms: TransformOptions['transforms'];
};

export const resolveTransform = async (
  code: string,
  { filename, compiler, imports, transforms }: Options,
): Promise<[code: string, cssRules: CssRule[]]> => {
  const [preTransformedCode, metadata] = await preTransform(
    code,
    {
      filename,
      preTransformOptions: {
        transforms: transforms,
      },
    },
    compiler,
  );

  if (preTransformedCode && metadata?.isTransformed) {
    const result = await build({
      entryPoints: [filename],
      bundle: true,
      write: false,
      platform: 'node',
      absWorkingDir: process.cwd(),
      outfile: filename + '.out',
      plugins: [
        {
          name: 'kaze-style-pre-transform',
          setup(build) {
            build.onLoad(
              { filter: new RegExp('^' + filename + '$') },
              ({ path: buildPath }) => {
                return {
                  contents: preTransformedCode,
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

    const [transformedCode] = await transform(
      preTransformedCode,
      {
        filename,
        transformOptions: { injectArgs, imports, transforms },
      },
      compiler,
    );

    return [transformedCode, cssRules];
  } else {
    return [code, []];
  }
};
