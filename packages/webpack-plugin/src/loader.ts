import path from 'path';
import * as Babel from '@babel/core';
import { preTransformPlugin, transformPlugin } from '@kaze-style/babel-plugin';
import type { ResolvedStyle, ResolvedGlobalStyle } from '@kaze-style/core';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
  Compiler,
  Compilation,
} from 'webpack';
import type { ChildCompiler } from './compiler';
import { parseSourceMap } from './utils/parseSourceMap';
import { toURIComponent } from './utils/toURIComponent';

type Option = {
  childCompiler?: ChildCompiler;
  pre?: boolean;
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

export const transformedComment = '/* Kaze style Transformed File */';

export function loader(
  this: LoaderContext,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
) {
  this.cacheable(true);
  const { pre, childCompiler } = this.getOptions();
  const isChildCompiler = childCompiler?.isChildCompiler(this._compiler.name);

  if (isChildCompiler) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  if (pre) {
    const filePath = path.relative(process.cwd(), this.resourcePath);

    const babelFileResult = Babel.transformSync(sourceCode, {
      caller: { name: 'kaze' },
      babelrc: false,
      configFile: false,
      compact: false,
      filename: filePath,
      plugins: [[preTransformPlugin]],
      sourceMaps: this.sourceMap || false,
      sourceFileName: filePath,
      inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
    });

    if (babelFileResult === null) {
      this.callback(null, sourceCode, inputSourceMap);
      return;
    }

    if (
      (
        babelFileResult.metadata as
          | (Babel.BabelFileMetadata & { transformed?: boolean })
          | undefined
      )?.transformed === true
    ) {
      this.callback(
        null,
        `${transformedComment}\n${babelFileResult.code}`,
        babelFileResult.map as unknown as string,
      );
      return;
    }

    this.callback(null, sourceCode, inputSourceMap);
  } else {
    const resolvedStyles = this.data.resolvedStyles as
      | ResolvedStyle[]
      | undefined;

    const resolvedGlobalStyles = this.data.resolvedGlobalStyles as
      | ResolvedGlobalStyle[]
      | undefined;

    if (resolvedGlobalStyles || resolvedStyles) {
      const filePath = path.relative(process.cwd(), this.resourcePath);

      const babelFileResult = Babel.transformSync(sourceCode, {
        caller: { name: 'kaze' },
        babelrc: false,
        configFile: false,
        compact: false,
        filename: filePath,
        plugins: [[transformPlugin, { resolvedStyles }]],
        sourceMaps: this.sourceMap || false,
        sourceFileName: filePath,
        inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
      });

      if (babelFileResult === null) {
        this.callback(null, sourceCode, inputSourceMap);
        return;
      }

      const cssRules:string[] = [];

      if (resolvedStyles && resolvedStyles.length !== 0) {
        cssRules.push(...resolvedStyles.flatMap((resolvedStyle) => resolvedStyle.cssRules));
      }

      if (resolvedGlobalStyles && resolvedGlobalStyles.length !== 0) {
        cssRules.push(...resolvedGlobalStyles.flatMap((resolvedGlobalStyle) => resolvedGlobalStyle.cssRules))
      }

      if (cssRules.length !== 0) {
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
}
