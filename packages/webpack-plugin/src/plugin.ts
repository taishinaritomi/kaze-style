import path from 'path';
import { transformCss } from '@kaze-style/build';
import type { Compiler, RuleSetRule } from 'webpack';
import { getSource } from './utils/getSource';

type PluginOptions = {
  test?: RuleSetRule['test'];
  swc?: boolean;
  virtualLoader?: boolean;
  preCssOutputPath?: string;
  exclude?: RuleSetRule['exclude'];
};

const pluginName = 'KazePlugin';

const loader = require.resolve('./loader');
const preLoader = require.resolve('./preLoader');

export class Plugin {
  test: NonNullable<RuleSetRule['test']>;
  swc: boolean;
  virtualLoader: boolean;
  preCssOutputPath: string;
  exclude: NonNullable<RuleSetRule['exclude']>;
  constructor({
    test = /\.(js|mjs|jsx|ts|tsx)$/,
    // test = /style\.(js|ts)$/,
    swc = false,
    virtualLoader = true,
    preCssOutputPath = path.join(__dirname, 'assets'),
    exclude = /node_modules/,
  }: Partial<PluginOptions> = {}) {
    this.test = test;
    this.swc = swc;
    this.virtualLoader = virtualLoader;
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
          },
        },
        {
          loader: preLoader,
          options: { compiler: this.swc ? 'swc' : 'babel' },
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
              const sortedCss = transformCss(getSource(source));
              compilation.updateAsset(
                pathname,
                new compiler.webpack.sources.RawSource(sortedCss),
              );
            }
          });
        },
      );
    });
  }
}
