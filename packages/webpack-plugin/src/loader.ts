import {
  cssRuleObjectsToCssString,
  extractStyle,
  transform,
} from '@kaze-style/build-man';
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
        const { styles, cssRuleObjects } = extractStyle({
          code: source,
          path: this.resourcePath,
        });

        const { code } = transform({
          code: sourceCode,
          path: this.resourcePath,
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

        const cssString = cssRuleObjectsToCssString(cssRuleObjects);

        const request = `import ${JSON.stringify(
          this.utils.contextify(
            this.context || this.rootContext,
            `kaze.css!=!${virtualLoaderPath}!${cssPath}?style=${toURIComponent(
              cssString,
            )}`,
          ),
        )};`;

        callback(null, `${code}\n\n${request}`);
      })
      .catch((error) => {
        callback(error);
      });
    return;
  }
  this.callback(null, sourceCode, inputSourceMap);
}

export default loader;
