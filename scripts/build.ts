import childProcess from 'child_process';
import path from 'path';
import arg from 'arg';
import type { BuildOptions, Plugin, PluginBuild } from 'esbuild';
import { build } from 'esbuild';
import fs from 'fs-extra';
import glob from 'glob';
import { gzipSize } from 'gzip-size';

const args = arg({
  '--cjsOnly': Boolean,
  '--watch': Boolean,
  '--size': Boolean,
  '--sizeEntry': [String],
  '--exec': String,
});

const isWatch = args['--watch'] || false;
const isCjsOnly = args['--cjsOnly'] || false;
const isSize = args['--size'] || false;
const sizeEntry = args['--sizeEntry'] || [];
const execCommand = args['--exec'];

const outDir = 'dist';
const cjsOutDir = isCjsOnly ? outDir : `${outDir}/cjs`;
const entryDir = 'src';

const options: BuildOptions = {
  watch: isWatch,
  entryPoints: glob.sync(`./${entryDir}/**/*.ts`, {
    ignore: ['./**/*.spec.ts'],
  }),
  // logLevel: 'info',
  minify: true,
  platform: 'node',
};

const exec = async (cmd: string) => {
  const _spawn = childProcess.spawn(cmd, { shell: true });
  await new Promise<void>((resolve, reject) => {
    _spawn.stdout.on('data', (data) => {
      const log = data.toString();
      log && console.log(log);
    });
    _spawn.stderr.on('data', (data) => {
      const log = data.toString();
      log && console.log(log);
    });
    _spawn.on('close', (code) => {
      console.log(cmd, 'exit', code);
      if (code === 0) {
        return resolve();
      }
      reject();
    });
  });
};

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

const bundleSize = async () => {
  const sizeOutDir = `${outDir}-size`;
  sizeEntry.push(`${entryDir}/index.ts`);
  await fs.remove(sizeOutDir);
  const result = await build({
    ...options,
    format: 'esm',
    logLevel: 'info',
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
  !isWatch && (await fs.remove(outDir));

  await Promise.all([
    !isCjsOnly &&
      build({
        ...options,
        format: 'esm',
        outdir: outDir,
        bundle: true,
        plugins: [addExtensionPlugin()],
      }),
    !isCjsOnly &&
      fs.outputJson(`${cjsOutDir}/package.json`, { type: 'commonjs' }),
    build({
      ...options,
      format: 'cjs',
      outdir: cjsOutDir,
    }),
    isSize && bundleSize(),
    exec(
      `tsc ${isWatch ? '-w' : ''} --outDir ${outDir} -p tsconfig.build.json`,
    ),
    execCommand && exec(execCommand),
  ]);
};

main();
