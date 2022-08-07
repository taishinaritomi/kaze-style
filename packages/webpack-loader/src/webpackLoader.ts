import path from 'path';
import * as Babel from '@babel/core';
import kazePreset from '@kaze/babel-preset';
import type webpack from 'webpack';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

type WebpackLoaderOptions = unknown;

type WebpackLoaderParams = Parameters<
  webpack.LoaderDefinitionFunction<WebpackLoaderOptions>
>;

const virtualLoaderPath = path.resolve(
  __dirname,
  '..',
  'virtual-loader',
  'index.js',
);
const resourcePath = path.resolve(
  __dirname,
  '..',
  'virtual-loader',
  'kaze.css',
);

const parseSourceMap = (
  inputSourceMap: WebpackLoaderParams[1],
): Babel.TransformOptions['inputSourceMap'] => {
  try {
    if (typeof inputSourceMap === 'string') {
      return JSON.parse(
        inputSourceMap,
      ) as Babel.TransformOptions['inputSourceMap'];
    }

    return inputSourceMap as Babel.TransformOptions['inputSourceMap'];
  } catch (err) {
    return undefined;
  }
};

function toURIComponent(rule: string): string {
  return encodeURIComponent(rule).replace(/!/g, '%21');
}

export function webpackLoader(
  this: webpack.LoaderContext<never>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  try {
    const babelAST = Babel.parseSync(sourceCode, {
      caller: { name: 'kaze' },
      filename: path.relative(process.cwd(), this.resourcePath),
      inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
      sourceMaps: this.sourceMap || false,
    });

    if (babelAST === null)
      return this.callback(null, sourceCode, inputSourceMap);

    const babelFileResult = Babel.transformFromAstSync(babelAST, sourceCode, {
      babelrc: false,
      configFile: false,
      presets: [[kazePreset]],
      filename: path.relative(process.cwd(), this.resourcePath),
      sourceMaps: this.sourceMap || false,
      sourceFileName: path.relative(process.cwd(), this.resourcePath),
      inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
    });

    if (babelFileResult === null)
      return this.callback(null, sourceCode, inputSourceMap);

    const cssRules = (
      babelFileResult.metadata as unknown as { cssRules: string[] }
    ).cssRules;

    if (cssRules.length !== 0) {
      const request = `import ${JSON.stringify(
        this.utils.contextify(
          this.context || this.rootContext,
          `kaze.css!=!${virtualLoaderPath}!${resourcePath}?style=${toURIComponent(
            cssRules.join(' '),
          )}`,
        ),
      )};`;
      return this.callback(
        null,
        `${babelFileResult.code}\n\n${request}` || undefined,
        (babelFileResult.map as Any) || undefined,
      );
    }
    return this.callback(
      null,
      babelFileResult.code || undefined,
      (babelFileResult.map as Any) || undefined,
    );
  } catch (error) {
    return this.callback(null, sourceCode, inputSourceMap);
  }
}
