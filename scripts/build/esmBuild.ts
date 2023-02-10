import esbuild from 'esbuild';
import type { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import { ESBUILD_OPTIONS, ESM_OUT_DIR } from './constants';
import { addExtensionPlugin } from './utils/esBuildPlugin';
import { logger } from './utils/logger';
import { timer } from './utils/timer';

type Options = {
  packageJson: Record<string, unknown>;
  watch: boolean;
};

const esbuildOptions: BuildOptions = {
  ...ESBUILD_OPTIONS,
  format: 'esm',
  outdir: ESM_OUT_DIR,
  bundle: true,
  plugins: [addExtensionPlugin()],
};

export const esmBuild = async (options: Options) => {
  const stop = timer();
  try {
    const packageJson = Object.assign({}, options.packageJson, {
      type: 'module',
    });
    if (options.watch) {
      const [ctx] = await Promise.all([
        esbuild.context(esbuildOptions),
        fs.outputJson(`${ESM_OUT_DIR}/package.json`, packageJson),
      ]);
      await ctx?.watch();
    } else {
      await Promise.all([
        esbuild.build(esbuildOptions),
        fs.outputJson(`${ESM_OUT_DIR}/package.json`, packageJson),
      ]);
    }
    logger.success('ESModule', ESM_OUT_DIR, stop());
  } catch {
    logger.error('ESModule');
    process.exit(1);
  }
};
