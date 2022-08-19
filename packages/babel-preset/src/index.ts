import type { StyleData } from './transformPlugin';
import { transformPlugin } from './transformPlugin';

const kazePreset = (_: unknown, options: StyleData) => {
  return {
    plugins: [[transformPlugin, options]],
  };
};

export default kazePreset;
