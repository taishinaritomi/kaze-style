import { extractStyle, preTransform, transform } from '@kaze-style/build-man';
import type { Loader } from 'esbuild';
import { build } from 'esbuild';

type Args = {
  path: string;
  code: string;
}

export const resolveTransform = async ({code, path }: Args) => {

  const { code: preTransformedCode, metadata } = preTransform({
    code,
    path,
    inputSourceMap: undefined,
    sourceMaps: false,
  });

  if(preTransformedCode && metadata?.transformed) {
    const result = await build({
      entryPoints: [path],
      bundle: true,
      write: false,
      platform: 'node',
      absWorkingDir: process.cwd(),
      outfile: path + '.out',
      plugins: [
        {
          name: 'kaze-style-pre-transform',
          setup(build) {
            build.onLoad(
              { filter: new RegExp('^' + path + '$') }, ({ path: buildPath }) => {
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

    const { styles, cssRuleObjects } = extractStyle({
      code: result.outputFiles[0]?.text || '',
      path: path,
    });

    const { code } = transform({
      code: preTransformedCode,
      path,
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
      code: code,
      cssRuleObjects: [],
    };
  }
};
