import { extractStyle, preTransform, transform } from '@kaze-style/build-man';
import type { Loader } from 'esbuild';
import { build } from 'esbuild';

export const resolveTransform = async (path: string) => {
  let compiledCode = '';
  let transformed = false;
  let cSource = '';
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
            { filter: new RegExp('^' + path + '$') },
            async ({ path: buildPath }) => {
              const source = await compile(buildPath);
              cSource = source;
              const { code, metadata } = preTransform({
                code: source,
                path: buildPath,
                inputSourceMap: undefined,
                sourceMaps: false,
              });
              if (!code || metadata?.transformed !== true) {
                return {
                  contents: source,
                  loader: buildPath.split('.').pop() as Loader,
                };
              }
              compiledCode = code;
              transformed = true;
              return {
                contents: code,
                loader: buildPath.split('.').pop() as Loader,
              };
            },
          );
        },
      },
    ],
  });

  if (!transformed) {
    return {
      code: cSource,
      cssRuleObjects: [],
    };
  }

  const { styles, cssRuleObjects } = extractStyle({
    code: result.outputFiles[0]?.text || '',
    path: path,
  });

  const { code } = transform({
    code: compiledCode,
    path,
    options: { styles },
    inputSourceMap: undefined,
    sourceMaps: false,
  });

  return {
    code,
    cssRuleObjects: cssRuleObjects,
  };
};

const compile = async (path: string) => {
  const result = await build({
    entryPoints: [path],
    platform: 'node',
    absWorkingDir: process.cwd(),
    bundle: false,
    outfile: path + '.out',
    write: false,
  });
  return result.outputFiles[0]?.text || '';
};
