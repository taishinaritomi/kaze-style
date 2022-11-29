import { withKazeStyle } from '@kaze-style/next-plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';
const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: true,
  },
};

export default withBundleAnalyzer(withKazeStyle(nextConfig));
