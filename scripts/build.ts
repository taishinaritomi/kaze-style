import { exec } from 'child_process';
import path from 'path';
import arg from 'arg';
import type { BuildResult, Plugin, PluginBuild } from 'esbuild';
import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import glob from 'glob';

const args = arg({
  '--entry': [String],
  '--watch': Boolean,
});

const isWatch = args['--watch'] || false;
const entries = args['--entry'] || [];
entries.push('./src/index.ts');

const addExtension = (): Plugin => {
  return {
    name: 'add-extension',
    setup(build: PluginBuild) {
      build.onResolve({ filter: /.*/ }, (args) => {
        if (args.importer) {
          const resolvedPath = path.join(args.resolveDir, args.path);
          if (glob.sync(`${resolvedPath}.ts`).length) {
            return { path: `${args.path}.js`, external: true };
          } else if (glob.sync(`${resolvedPath}/index.ts`).length) {
            return { path: `${args.path}/index.js`, external: true };
          }

          return { external: true };
        }
      });
    },
  };
};

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
    entryPoints: glob.sync('./src/**/*.ts', { ignore: ['./**/*.spec.ts'] }),
    logLevel: 'info',
    format: 'esm',
    minify: true,
    outdir: 'dist',
    bundle: true,
    plugins: [addExtension()],
  }),
  ...cjsBuilds(),
]);

exec(
  `tsc ${
    isWatch ? '-w' : ''
  } --declaration --emitDeclarationOnly --outDir dist`,
);
