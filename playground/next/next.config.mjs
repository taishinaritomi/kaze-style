import { KazePlugin } from '@kaze/webpack-loader';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.optimization.splitChunks = config.optimization.splitChunks || {
      cacheGroups: {},
    };

    config.module.rules.unshift(
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: '@kaze/webpack-loader',
            options: {},
          },
        ],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
    );

    config.module.rules.unshift();

    config.plugins.push(
      new MiniCssExtractPlugin({
        filename: 'static/chunks/[chunkhash].css',
        chunkFilename: 'static/chunks/[chunkhash].css',
        ignoreOrder: true,
      }),
      new KazePlugin(),
    );

    return config;
  },
};

export default nextConfig;
