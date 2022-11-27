import {
  cssRulesToString,
  extractionStyle,
  transform,
} from '@kaze-style/build';
import type {
  LoaderDefinitionFunction,
  LoaderContext as _LoaderContext,
} from 'webpack';
import { getCompiledSource, isChildCompiler } from './compiler';
import { parseSourceMap } from './utils/parseSourceMap';

export type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<never>>;
export type LoaderContext = _LoaderContext<never> & {
  _compiler: NonNullable<_LoaderContext<never>['_compiler']>;
  _compilation: NonNullable<_LoaderContext<never>['_compilation']>;
};

const virtualLoaderPath = require.resolve('./virtualLoader');
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
        const { styles, cssRules } = extractionStyle({
          code: source,
          filename: this.resourcePath,
        });

        const { code } = transform({
          code: sourceCode,
          filename: this.resourcePath,
          sourceMaps: this.sourceMap,
          inputSourceMap: parseSourceMap(inputSourceMap) || undefined,
          options: {
            styles,
          },
        });

        if (!code) {
          callback(null, sourceCode, inputSourceMap);
          return;
        }

        const cssString = cssRulesToString(cssRules);

        const virtualResourceLoader = `${virtualLoaderPath}?${JSON.stringify({
          src: cssString,
        })}`;

        const request = `import ${JSON.stringify(
          this.utils.contextify(
            this.context || this.rootContext,
            `kaze.css!=!${virtualResourceLoader}!${cssPath}`,
          ),
        )};`;
        callback(null, `${request}\n\n${code}`);
      })
      .catch((error) => {
        callback(error);
      });
    return;
  }
  this.callback(null, sourceCode, inputSourceMap);
}

export default loader;
