import { exec } from 'child_process';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import glob from 'fast-glob';

const isWatch = process.argv[2] === 'watch';

Promise.all([
  build({
    watch: isWatch,
    entryPoints: glob.sync('./src/**/*.ts', { ignore: ['**/*.spec.ts'] }),
    logLevel: 'info',
    format: 'esm',
    minify: true,
    outdir: 'dist',
  }),
  build({
    watch: isWatch,
    entryPoints: ['./src'],
    logLevel: 'info',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    minify: true,
    sourcemap: true,
    outfile: './dist/index.cjs',
    plugins: [nodeExternalsPlugin()],
  }),
]);

exec(
  `tsc ${
    isWatch ? '-w' : ''
  } --declaration --emitDeclarationOnly --outDir dist`,
);
