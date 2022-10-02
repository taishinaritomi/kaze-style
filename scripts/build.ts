import { exec } from 'child_process';
import arg from 'arg';
import type { BuildResult } from 'esbuild';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import glob from 'fast-glob';

const args = arg({
  '--entry': [String],
  '--watch': Boolean,
});

const isWatch = args['--watch'] || false;
const entries = args['--entry'] || [];
entries.push('./src/index.ts');
console.log(entries);

const cjsBuilds = (): Promise<BuildResult>[] => {
  return entries.map((entry) => {
    const fileName = entry.split('/').slice(-1)[0]?.split('.')[0];
    return build({
      watch: isWatch,
      entryPoints: [entry],
      logLevel: 'info',
      bundle: true,
      platform: 'node',
      format: 'cjs',
      minify: true,
      sourcemap: true,
      outfile: `./dist/${fileName}.cjs`,
      plugins: [nodeExternalsPlugin()],
    });
  });
};

Promise.all([
  build({
    watch: isWatch,
    entryPoints: glob.sync('./src/**/*.ts', { ignore: ['**/*.spec.ts'] }),
    logLevel: 'info',
    format: 'esm',
    minify: true,
    outdir: 'dist',
  }),
  ...cjsBuilds(),
]);

exec(
  `tsc ${
    isWatch ? '-w' : ''
  } --declaration --emitDeclarationOnly --outDir dist`,
);
