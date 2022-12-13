import { withKazeStyle } from '@kaze-style/next-plugin';
import createBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createBundleAnalyzer({
  enabled: process.env['ANALYZE'] === 'true',
});

//use swc compiler
// import { createKazeStylePlugin } from '@kaze-style/next-plugin';
// const withKazeStyle = createKazeStylePlugin({ swc: true });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

export default withBundleAnalyzer(withKazeStyle(nextConfig));
