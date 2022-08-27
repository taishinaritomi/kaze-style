import type { Options as _Options } from './transformPlugin';
import { transformPlugin } from './transformPlugin';

export type Options = _Options;

export const kazePreset = (_: unknown, options: Options) => {
  return {
    plugins: [[transformPlugin, options]],
  };
};

export default kazePreset;
