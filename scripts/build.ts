import childProcess from 'child_process';
import path from 'path';
import util from 'util';
import arg from 'arg';
import type { BuildOptions, Plugin, PluginBuild } from 'esbuild';
import { build } from 'esbuild';
import fs from 'fs-extra';
import glob from 'glob';

const exec = util.promisify(childProcess.exec);

const addExtensionPlugin = (): Plugin => {
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
        return undefined;
      });
    },
  };
};

const args = arg({
  '--cjsOnly': Boolean,
  '--watch': Boolean,
});

const outDir = 'dist';
const entryDir = 'src';

const isWatch = args['--watch'] || false;
const isCjsOnly= args['--cjsOnly'] || false;

const options: BuildOptions = {
  watch: isWatch,
  entryPoints: glob.sync(`./${entryDir}/**/*.ts`, {
    ignore: ['./**/*.spec.ts'],
  }),
  logLevel: 'info',
  minify: true,
  platform: 'node',
};

const main = async () => {
  await fs.remove(outDir);
  !isCjsOnly && await fs.outputJson(`${outDir}/cjs/package.json`, { type: 'commonjs' });

  await Promise.all([
    !isCjsOnly && build({
      ...options,
      format: 'esm',
      outdir: outDir,
      bundle: true,
      plugins: [addExtensionPlugin()],
    }),
    build({
      ...options,
      format: 'cjs',
      outdir: isCjsOnly ? outDir : `${outDir}/cjs`,
    }),
    exec(
      `tsc ${
        isWatch ? '-w' : ''
      } --declaration --emitDeclarationOnly --outDir ${outDir}`,
    ),
  ]);
};

main();
