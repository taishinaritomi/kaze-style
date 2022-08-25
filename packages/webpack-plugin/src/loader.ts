import path from 'path';
import * as Babel from '@babel/core';
import kazePreset from '@kaze-style/babel-plugin';
import type { Options } from '@kaze-style/babel-plugin';
import type { ResolvedStyle } from '@kaze-style/core';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
  Compiler,
  Compilation,
} from 'webpack';
import type { ChildCompiler } from './compiler';
import { parseSourceMap } from './utils/parseSourceMap';
import { toURIComponent } from './utils/toURIComponent';

const importOption: Options['import'] = {
  source: '@kaze-style/react',
  name: 'createStyle',
  transformName: '__style',
};

type Option = {
  childCompiler: ChildCompiler;
};

export type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<Option>>;
export type LoaderContext = _LoaderContext<Option> & {
  _compiler: Compiler;
  _compilation: Compilation;
};

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

export function loader(
  this: LoaderContext,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  const resolvedStyles = this.data.resolvedStyles as ResolvedStyle[];

  if (resolvedStyles) {
    const babelAST = Babel.parseSync(sourceCode, {
      caller: { name: 'kaze' },
      filename: path.relative(process.cwd(), this.resourcePath),
      inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
      sourceMaps: this.sourceMap || false,
    });

    if (babelAST === null) {
      this.callback(null, sourceCode, inputSourceMap);
      return;
    }

    const babelFileResult = Babel.transformFromAstSync(babelAST, sourceCode, {
      babelrc: false,
      configFile: false,
      presets: [[kazePreset, { resolvedStyles, import: importOption }]],
      filename: path.relative(process.cwd(), this.resourcePath),
      sourceMaps: this.sourceMap || false,
      sourceFileName: path.relative(process.cwd(), this.resourcePath),
      inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
    });

    if (babelFileResult === null) {
      this.callback(null, sourceCode, inputSourceMap);
      return;
    }

    const cssRules = resolvedStyles.flatMap(
      (resolvedStyle) => resolvedStyle.cssRules,
    );

    if (cssRules.length) {
      const request = `import ${JSON.stringify(
        this.utils.contextify(
          this.context || this.rootContext,
          `kaze.css!=!${virtualLoaderPath}!${resourcePath}?style=${toURIComponent(
            cssRules.join('\n'),
          )}`,
        ),
      )};`;
      this.callback(
        null,
        `${babelFileResult.code}\n\n${request}`,
        babelFileResult.map as unknown as string,
      );
      return;
    }
  }

  this.callback(null, sourceCode, inputSourceMap);
}
