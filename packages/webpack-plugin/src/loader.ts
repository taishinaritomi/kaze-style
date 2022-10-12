import path from 'path';
import * as Babel from '@babel/core';
import { transformPlugin } from '@kaze-style/babel-plugin';
import { cssRuleObjectsToCssString } from '@kaze-style/build-man';
import type { ForBuildGlobalStyle, ForBuildStyle } from '@kaze-style/core';
import evalCode from 'eval';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
} from 'webpack';
import { getCompiledSource, isChildCompiler } from './compiler';
import { parseSourceMap } from './utils/parseSourceMap';
import { toURIComponent } from './utils/toURIComponent';

export type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<never>>;
export type LoaderContext = _LoaderContext<never> & {
  _compiler: NonNullable<_LoaderContext<never>['_compiler']>;
  _compilation: NonNullable<_LoaderContext<never>['_compilation']>;
};

type ForBuild = {
  fileName: string;
  styles: ForBuildStyle<string>[];
  globalStyles: ForBuildGlobalStyle[];
};

const virtualLoaderPath = require.resolve('./virtualLoader.cjs');
const cssPath = require.resolve('../assets/kaze.css');

function loader(
  this: LoaderContext,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
  additionalData: WebpackLoaderParams[2],
) {
  this.cacheable(true);

  if (isChildCompiler(this._compiler.name)) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  if (additionalData?.['kazeTransformed'] === true) {
    const callback = this.async();

    getCompiledSource(this)
      .then((source) => {
        const __forBuildByKazeStyle: ForBuild = {
          fileName: this.resourcePath,
          styles: [],
          globalStyles: [],
        };

        const window = {};
        evalCode(
          source,
          this.resourcePath,
          {
            __forBuildByKazeStyle,
            window,
          },
          true,
        );

        const styles = __forBuildByKazeStyle?.styles || [];
        const globalStyles = __forBuildByKazeStyle?.globalStyles || [];

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
          callback(null, sourceCode, inputSourceMap);
          return;
        }

        const cssString = cssRuleObjectsToCssString([
          ...(styles.flatMap(({ cssRuleObjects }) => cssRuleObjects) || []),
          ...(globalStyles.flatMap(({ cssRuleObjects }) => cssRuleObjects) ||
            []),
        ]);

        const request = `import ${JSON.stringify(
          this.utils.contextify(
            this.context || this.rootContext,
            `kaze.css!=!${virtualLoaderPath}!${cssPath}?style=${toURIComponent(
              cssString,
            )}`,
          ),
        )};`;

        callback(
          null,
          `${babelFileResult.code}\n\n${request}`,
          babelFileResult.map as unknown as string,
        );
      })
      .catch((error) => {
        callback(error);
      });
    return;
  }
  this.callback(null, sourceCode, inputSourceMap);
}

export default loader;
