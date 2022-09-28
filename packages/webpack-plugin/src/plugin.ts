import { sortCSS } from '@kaze-style/core';
import type { Compiler, RuleSetRule } from 'webpack';
import { getSource } from './utils/getSource';

type PluginOptions = {
  test: RuleSetRule['test'];
};

const pluginName = 'KazePlugin';
const loader = '@kaze-style/webpack-plugin/loader';
const preLoader = '@kaze-style/webpack-plugin/preLoader';

export class Plugin {
  test: NonNullable<RuleSetRule['test']>;
  constructor({
    test = /\.(js|mjs|jsx|ts|tsx)$/,
  }: Partial<PluginOptions> = {}) {
    this.test = test;
  }

  apply(compiler: Compiler) {
    compiler.options.module?.rules.splice(0, 0, {
      test: this.test,
      exclude: /node_modules/,
      use: [
        {
          loader,
        },
        {
          loader: preLoader,
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
              const sortedCSSRules = sortCSS(getSource(source));
              compilation.updateAsset(
                pathname,
                new compiler.webpack.sources.RawSource(sortedCSSRules),
              );
            }
          });
        },
      );
    });
  }
}
