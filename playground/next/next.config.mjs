import { KazePlugin } from '@kaze-style/webpack-loader';
import * as browserslist from 'browserslist';
import { lazyPostCSS } from 'next/dist/build/webpack/config/blocks/css/index.js';
import { getGlobalCssLoader } from 'next/dist/build/webpack/config/blocks/css/loaders/index.js';

function getSupportedBrowsers(dir, isDevelopment) {
  let browsers
  try {
    browsers = browserslist.loadConfig({
      path: dir,
      env: isDevelopment ? 'development' : 'production',
    });
  } catch { }
  return browsers;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config,{isServer,dir, dev}) {
    config.module.rules.unshift(
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: '@kaze-style/webpack-loader',
            options: {},
          },
        ],
      }
    );

    const cssRules = config.module.rules.find(
      (rule) =>
        Array.isArray(rule.oneOf) &&
        rule.oneOf.some(
          ({ test }) =>
            typeof test === 'object' &&
            typeof test.test === 'function' &&
            test.test('filename.css'),
        ),
    ).oneOf;

    cssRules.unshift({
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
        },
        () => lazyPostCSS(dir, getSupportedBrowsers(dir, dev),undefined),
        [],
      ),
    });

    config.plugins.push(new KazePlugin());

    return config;
  },
};

export default nextConfig;
