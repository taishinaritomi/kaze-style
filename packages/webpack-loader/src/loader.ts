import path from 'path';
import * as Babel from '@babel/core';
import kazePreset from '@kaze-style/babel-preset';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
  Compiler,
  Compilation,
} from 'webpack';
import type { ChildCompiler } from './compiler';
import type { StyleData } from './pitch';
import { parseSourceMap } from './utils/parseSourceMap';
import { toURIComponent } from './utils/toURIComponent';

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
  const styleData = this.data.styleData as StyleData;

  if (styleData) {
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
      presets: [[kazePreset, styleData]],
      filename: path.relative(process.cwd(), this.resourcePath),
      sourceMaps: this.sourceMap || false,
      sourceFileName: path.relative(process.cwd(), this.resourcePath),
      inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
    });

    if (babelFileResult === null) {
      this.callback(null, sourceCode, inputSourceMap);
      return;
    }

    const cssRules = styleData.cssRulesList.flat();

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
