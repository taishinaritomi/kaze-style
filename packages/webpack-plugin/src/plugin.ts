import path from 'path';
import { stringToCssRules, cssRulesToString } from '@kaze-style/builder';
import type { TransformOptions } from '@kaze-style/builder';
import type { Compiler, RuleSetRule } from 'webpack';
import { getSource } from './utils/getSource';

type PluginOptions = {
  test?: RuleSetRule['test'];
  swc?: boolean;
  cssLayer?: boolean;
  virtualLoader?: boolean;
  preCssOutputPath?: string;
  imports: TransformOptions['imports'];
  transforms: TransformOptions['transforms'];
  exclude?: RuleSetRule['exclude'];
};

const pluginName = 'KazePlugin';

const loader = require.resolve('@kaze-style/webpack-plugin/loader');
const preLoader = require.resolve('@kaze-style/webpack-plugin/preLoader');

export class Plugin {
  test: NonNullable<RuleSetRule['test']>;
  swc: boolean;
  cssLayer: boolean;
  virtualLoader: boolean;
  preCssOutputPath: string;
  imports: TransformOptions['imports'];
  transforms: TransformOptions['transforms'];
  exclude: NonNullable<RuleSetRule['exclude']>;
  constructor({
    test = /\.(js|mjs|jsx|ts|tsx)$/,
    // test = /style\.(js|ts)$/,
    imports = [],
    transforms = [],
    swc = false,
    cssLayer = false,
    virtualLoader = true,
    preCssOutputPath = path.join(__dirname, 'assets'),
    exclude = /node_modules/,
  }: Partial<PluginOptions> = {}) {
    this.test = test;
    this.swc = swc;
    this.cssLayer = cssLayer;
    this.virtualLoader = virtualLoader;
    this.imports = imports;
    this.transforms = transforms;
    this.preCssOutputPath = preCssOutputPath;
    this.exclude = exclude;
  }

  apply(compiler: Compiler) {
    compiler.options.module?.rules.splice(0, 0, {
      test: this.test,
      exclude: this.exclude,
      use: [
        {
          loader,
          options: {
            compiler: this.swc ? 'swc' : 'babel',
            virtualLoader: this.virtualLoader,
            preCssOutputPath: this.preCssOutputPath,
            imports: this.imports,
            transforms: this.transforms,
          },
        },
        {
          loader: preLoader,
          options: {
            compiler: this.swc ? 'swc' : 'babel',
            transforms: this.transforms,
          },
        },
      ],
    });

    compiler.hooks.compilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets) => {
          Object.entries(assets).forEach(([pathname, source]) => {
            if (pathname.includes('.css')) {
              const [cssRules, otherCss] = stringToCssRules(getSource(source));
              const css = `${cssRulesToString(cssRules, {
                layer: this.cssLayer,
                layerBundle: true,
              })}${otherCss}`;
              compilation.updateAsset(
                pathname,
                new compiler.webpack.sources.RawSource(css),
              );
            }
          });
        },
      );
    });
  }
}
