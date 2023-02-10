import esbuild from 'esbuild';
import type { BuildOptions } from 'esbuild';
import fs from 'fs-extra';
import { CJS_OUT_DIR, ESBUILD_OPTIONS } from './constants';
import { logger } from './utils/logger';
import { timer } from './utils/timer';

type Options = {
  packageJson: Record<string, unknown>;
  watch: boolean;
};

const esbuildOptions: BuildOptions = {
  ...ESBUILD_OPTIONS,
  format: 'cjs',
  outdir: CJS_OUT_DIR,
};

export const cjsBuild = async (options: Options) => {
  const stop = timer();
  try {
    const packageJson = Object.assign({}, options.packageJson, {
      type: 'commonjs',
    });
    if (options.watch) {
      const [ctx] = await Promise.all([
        esbuild.context(esbuildOptions),
        fs.outputJson(`${CJS_OUT_DIR}/package.json`, packageJson),
      ]);
      await ctx?.watch();
    } else {
      await Promise.all([
        esbuild.build(esbuildOptions),
        fs.outputJson(`${CJS_OUT_DIR}/package.json`, packageJson),
      ]);
    }
    logger.success('CommonJS', CJS_OUT_DIR, stop());
  } catch {
    logger.error('CommonJS');
    process.exit(1);
  }
};
