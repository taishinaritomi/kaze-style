import childProcess from 'child_process';
import path from 'path';
import util from 'util';
import arg from 'arg';
import type { BuildOptions, Plugin, PluginBuild } from 'esbuild';
import { build } from 'esbuild';
import fs from 'fs-extra';
import glob from 'glob';
import { gzipSize } from 'gzip-size';

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

const formatBytes = (x: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (x === 0) return 'n/a';
  const i = Math.floor(Math.log(x) / Math.log(1024));
  if (i === 0) return `${x}${sizes[i]}`;
  return `${(x / 1024 ** i).toFixed(1)}${sizes[i]}`;
};

const args = arg({
  '--cjsOnly': Boolean,
  '--watch': Boolean,
  '--size': Boolean,
  '--sizeEntry': [String],
});

const outDir = 'dist';
const entryDir = 'src';

const isWatch = args['--watch'] || false;
const isCjsOnly = args['--cjsOnly'] || false;
const isSize = args['--size'] || false;
const sizeEntry = args['--sizeEntry'] || [];

const options: BuildOptions = {
  watch: isWatch,
  entryPoints: glob.sync(`./${entryDir}/**/*.ts`, {
    ignore: ['./**/*.spec.ts'],
  }),
  logLevel: 'info',
  minify: true,
  platform: 'node',
};

const bundleSize = async () => {
  const sizeOutDir = `${outDir}-size`;
  sizeEntry.push(`${entryDir}/index.ts`);
  await fs.remove(sizeOutDir);
  const result = await build({
    ...options,
    format: 'esm',
    entryPoints: sizeEntry,
    outdir: sizeOutDir,
    bundle: true,
    metafile: true,
  });
  const report: Record<string, { size: string; gzip: string }> = {};
  for (const file in result.metafile.outputs) {
    const code = (await fs.readFile(file)).toString();
    report[file] = {
      size: formatBytes(Buffer.byteLength(code, 'utf8')),
      gzip: formatBytes(await gzipSize(code)),
    };
  }
  await fs.outputJson(`${sizeOutDir}/report.json`, report, { spaces: 2 });
};

const main = async () => {
  await fs.remove(outDir);
  !isCjsOnly &&
    (await fs.outputJson(`${outDir}/cjs/package.json`, { type: 'commonjs' }));

  await Promise.all([
    !isCjsOnly &&
      build({
        ...options,
        format: 'esm',
        outdir: outDir,
        bundle: true,
        plugins: [addExtensionPlugin()],
      }),
    isSize && bundleSize(),
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
