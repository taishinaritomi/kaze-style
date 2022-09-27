import path from 'path';
import * as Babel from '@babel/core';
import { preTransformPlugin, transformPlugin } from '@kaze-style/babel-plugin';
import type { ForBuildGlobalStyle, ForBuildStyle } from '@kaze-style/core';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
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
  _compiler: NonNullable<_LoaderContext<Option>['_compiler']>;
  _compilation: NonNullable<_LoaderContext<Option>['_compilation']>;
};

const virtualLoaderPath = '@kaze-style/webpack-plugin/virtualLoader';
const cssPath = '@kaze-style/webpack-plugin/assets/kaze.css';

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
    const styles = this.data.styles as ForBuildStyle<string>[] | undefined;

    const globalStyles = this.data.globalStyles as
      | ForBuildGlobalStyle[]
      | undefined;

    if (sourceCode.includes(transformedComment)) {
      const filePath = path.relative(process.cwd(), this.resourcePath);

      const babelFileResult = Babel.transformSync(sourceCode, {
        caller: { name: 'kaze' },
        babelrc: false,
        configFile: false,
        compact: false,
        filename: filePath,
        plugins: [[transformPlugin, { styles: styles || [] }]],
        sourceMaps: this.sourceMap || false,
        sourceFileName: filePath,
        inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
      });

      if (babelFileResult === null) {
        this.callback(null, sourceCode, inputSourceMap);
        return;
      }

      const cssRules: string[] = [];

      if (styles && styles.length !== 0) {
        cssRules.push(...styles.flatMap((style) => style.cssRules));
      }

      if (globalStyles && globalStyles.length !== 0) {
        cssRules.push(
          ...globalStyles.flatMap((globalStyle) => globalStyle.cssRules),
        );
      }

      const request = `import ${JSON.stringify(
        this.utils.contextify(
          this.context || this.rootContext,
          `kaze.css!=!${virtualLoaderPath}!${cssPath}?style=${toURIComponent(
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
    this.callback(null, sourceCode, inputSourceMap);
  }
}
