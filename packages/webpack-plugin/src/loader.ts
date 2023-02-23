import { createHash } from 'crypto';
import fs from 'fs';
import path from 'path';
import type { TransformOptions } from '@kaze-style/build';
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
import { DUMMY_CSS_FILE_PATH } from './constatns';

export type WebpackLoaderParams = Parameters<LoaderDefinitionFunction<never>>;
export type LoaderContext<T = unknown> = _LoaderContext<T> & {
  _compiler: NonNullable<_LoaderContext<T>['_compiler']>;
  _compilation: NonNullable<_LoaderContext<T>['_compilation']>;
};

const virtualLoaderPath = require.resolve('./virtualLoader');

function loader(
  this: LoaderContext<{
    compiler: 'swc' | 'babel';
    virtualLoader: boolean;
    preCssOutputPath: string;
    imports: TransformOptions['imports'];
    transforms: TransformOptions['transforms'];
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
        const { injectArgs, cssRules } = extractionStyle(source, {
          filename: this.resourcePath,
        });
        transform(
          sourceCode,
          {
            filename: this.resourcePath,
            transformOptions: {
              injectArgs,
              imports: options.imports,
              transforms: options.transforms,
            },
          },
          options.compiler,
        ).then(([transformedCode]) => {
          if (!transformedCode) {
            callback(null, sourceCode, inputSourceMap);
            return;
          } else {
            const cssString = cssRulesToString(cssRules, { layer: true });
            if (options.virtualLoader) {
              const virtualResourceLoader = `${virtualLoaderPath}?${JSON.stringify(
                {
                  src: cssString,
                },
              )}`;

              const filePrefix = `import ${JSON.stringify(
                this.utils.contextify(
                  this.context || this.rootContext,
                  `kaze.css!=!${virtualResourceLoader}!${DUMMY_CSS_FILE_PATH}`,
                ),
              )};`;
              callback(null, `${filePrefix}\n${transformedCode}`);
            } else {
              if (!fs.existsSync(options.preCssOutputPath))
                fs.mkdirSync(options.preCssOutputPath);
              const hash = createHash('md5').update(cssString).digest('hex');
              const cssPath = path.join(
                options.preCssOutputPath,
                `${hash}.css`,
              );
              fs.writeFileSync(cssPath, cssString);
              const filePrefix = `import "${cssPath}";`;
              callback(null, `${filePrefix}\n${transformedCode}`);
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
