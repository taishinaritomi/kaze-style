import { withKazeStyle } from '@kaze-style/next-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
};

export default withKazeStyle(nextConfig);
