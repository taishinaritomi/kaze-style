import { transformPlugin } from './transformPlugin';

const kazePreset = (_: unknown, options: unknown) => {
  return {
    plugins: [[transformPlugin, options]],
  };
};

export default kazePreset;
