import { extractionStyle, preTransform, transform } from '@kaze-style/build';
import type { Loader } from 'esbuild';
import { build } from 'esbuild';

type Args = {
  filename: string;
  code: string;
};

export const resolveTransform = async ({ code, filename }: Args) => {
  const { code: preTransformedCode, metadata } = preTransform({
    code,
    filename,
    inputSourceMap: undefined,
    sourceMaps: false,
    options: {
      filename,
    },
  });

  if (preTransformedCode && metadata?.transformed) {
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

    const { styles, cssRuleObjects } = extractionStyle({
      code: result.outputFiles[0]?.text || '',
      filename,
    });

    const { code } = transform({
      code: preTransformedCode,
      filename,
      options: { styles },
      inputSourceMap: undefined,
      sourceMaps: false,
    });

    return {
      code,
      cssRuleObjects: cssRuleObjects,
    };
  } else {
    return {
      code,
      cssRuleObjects: [],
    };
  }
};
