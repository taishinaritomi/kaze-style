import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
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

export type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<never>>;
export type LoaderContext<T = unknown> = _LoaderContext<T> & {
  _compiler: NonNullable<_LoaderContext<T>['_compiler']>;
  _compilation: NonNullable<_LoaderContext<T>['_compilation']>;
};

const virtualLoaderPath = require.resolve('./virtualLoader');
const cssPath = require.resolve('../../assets/kaze.css');

function loader(
  this: LoaderContext<{
    compiler: 'swc' | 'babel';
    virtualLoader: boolean;
    preCssOutputPath: string;
  }>,
  sourceCode: WebpackLoaderParams[0],
  inputSourceMap: WebpackLoaderParams[1],
  additionalData: WebpackLoaderParams[2],
) {
  this.cacheable(true);
  const options = this.getOptions();

  if (isChildCompiler(this._compiler.name)) {
    this.callback(null, sourceCode, inputSourceMap);
    return;
  }

  if (additionalData?.['kazeTransformed'] === true) {
    const callback = this.async();

    getCompiledSource(this)
      .then((source) => {
        const [cssRules, styles] = extractionStyle(source, {
          filename: this.resourcePath,
        });
        transform(
          sourceCode,
          {
            filename: this.resourcePath,
            transformOptions: { styles },
          },
          options.compiler,
        ).then(([transformedCode]) => {
          if (!transformedCode) {
            callback(null, sourceCode, inputSourceMap);
            return;
          } else {
            const cssString = cssRulesToString(cssRules);
            if (options.virtualLoader) {
              const virtualResourceLoader = `${virtualLoaderPath}?${JSON.stringify(
                {
                  src: cssString,
                },
              )}`;

              const request = `import ${JSON.stringify(
                this.utils.contextify(
                  this.context || this.rootContext,
                  `kaze.css!=!${virtualResourceLoader}!${cssPath}`,
                ),
              )};`;
              callback(null, `${request}\n\n${transformedCode}`);
            } else {
              if (!fs.existsSync(options.preCssOutputPath))
                fs.mkdirSync(options.preCssOutputPath);
              const hash = createHash('md5').update(cssString).digest('hex');
              const cssPath = path.join(
                options.preCssOutputPath,
                `${hash}.css`,
              );
              fs.writeFileSync(cssPath, cssString);
              const request = `import "${cssPath}";`;
              callback(null, `${request}\n\n${transformedCode}`);
            }
          }
        });
      })
      .catch((error) => {
        callback(error);
      });
    return;
  }
  this.callback(null, sourceCode, inputSourceMap);
}

export default loader;
