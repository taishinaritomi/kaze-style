import type { BuildOptions } from 'esbuild';
import glob from 'glob';

export const OUT_DIR = 'dist';
export const CJS_OUT_DIR = `${OUT_DIR}/cjs`;
export const ESM_OUT_DIR = `${OUT_DIR}/esm`;
export const TYPES_OUT_DIR = `${OUT_DIR}/types`;
export const SIZE_OUT_DIR = `${OUT_DIR}-size`;

export const ENTRY_DIR = 'src';

export const ESBUILD_OPTIONS: BuildOptions = {
  entryPoints: glob.sync(`./${ENTRY_DIR}/**/*.ts`, {
    ignore: ['./**/*.spec.ts'],
  }),
  minify: true,
  platform: 'node',
};
