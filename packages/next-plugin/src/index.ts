import { KazePlugin } from '@kaze-style/webpack-loader';
import { loadConfig } from 'browserslist';
import type { NextConfig } from 'next';
import { lazyPostCSS } from 'next/dist/build/webpack/config/blocks/css';
import { getGlobalCssLoader } from 'next/dist/build/webpack/config/blocks/css/loaders';
import type { ConfigurationContext } from 'next/dist/build/webpack/config/utils';
import type { Configuration, RuleSetRule } from 'webpack';

type KazeConfig = Record<string, string>;

const getSupportedBrowsers = (dir: string, isDevelopment: boolean) => {
  try {
    return loadConfig({
      path: dir,
      env: isDevelopment ? 'development' : 'production',
    });
  } catch {}
  return undefined;
};

const kazeStyleConfig = (
  nextConfig: NextConfig,
  kazeConfig: KazeConfig = {},
) => {
  return {
    webpack(config: Configuration & ConfigurationContext, options) {
      kazeConfig;
      const { dir, dev, isServer } = options;

      const cssRules = (
        config.module?.rules?.find(
          (rule) =>
            typeof rule === 'object' &&
            Array.isArray(rule.oneOf) &&
            rule.oneOf.some(
              ({ test }) =>
                test instanceof RegExp &&
                typeof test.test === 'function' &&
                test.test('filename.css'),
            ),
        ) as RuleSetRule
      )?.oneOf;

      cssRules?.unshift({
        test: /kaze\.css$/i,
        sideEffects: true,
        use: getGlobalCssLoader(
          {
            assetPrefix: config.assetPrefix,
            isClient: !isServer,
            isServer,
            isDevelopment: dev,
            future: {},
            experimental: {},
          } as ConfigurationContext,
          () => lazyPostCSS(dir, getSupportedBrowsers(dir, dev), undefined),
          [],
        ),
      });

      config.plugins?.push(new KazePlugin());

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  } as NextConfig;
};

export const createKazeStylePlugin = (kazeConfig: KazeConfig = {}) => {
  return (nextConfig: NextConfig) => {
    return Object.assign(
      {},
      nextConfig,
      kazeStyleConfig(nextConfig, kazeConfig),
    );
  };
};

export const withKazeStyle = (nextConfig: NextConfig) => {
  return Object.assign({}, nextConfig, kazeStyleConfig(nextConfig));
};
