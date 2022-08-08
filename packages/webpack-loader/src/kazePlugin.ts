import { sortCSS } from '@kaze-style/core';
import type { Compiler, RuleSetRule, sources } from 'webpack';
import { Compilation } from 'webpack';

type PluginOptions = {
  test: RuleSetRule['test'];
};

const getSource = (assetSource: sources.Source): string => {
  const source = assetSource.source();

  if (typeof source === 'string') source;

  return source.toString();
};

export class KazePlugin {
  test: NonNullable<RuleSetRule['test']>;
  constructor({ test = /\.(js|jsx|ts|tsx)$/ }: Partial<PluginOptions> = {}) {
    this.test = test;
  }

  apply(compiler: Compiler) {
    compiler.hooks.compilation.tap('KazePlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'KazePlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
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
