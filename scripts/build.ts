import childProcess from 'child_process';
import path from 'path';
import arg from 'arg';
import type { BuildOptions, Metafile, Plugin, PluginBuild } from 'esbuild';
import { build } from 'esbuild';
import fs from 'fs-extra';
import glob from 'glob';
import { gzipSize } from 'gzip-size';
import pc from 'picocolors';

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

const esBuildOptions: BuildOptions = {
  watch: isWatch,
  entryPoints: glob.sync(`./${entryDir}/**/*.ts`, {
    ignore: ['./**/*.spec.ts'],
  }),
  minify: true,
  platform: 'node',
};

const successLog = (operation: string, time: number, outDir?: string) =>
  pc.bold(
    `🦄 ${pc.green('Success')} ${pc.blue(operation)} ${pc.yellow(
      `${time}ms`,
    )} ${outDir ? pc.magenta(outDir) : ''}`,
  );
const errorLog = (operation: string) =>
  pc.bold(`🐴 ${pc.red('Error')} ${pc.blue(operation)} `);
const startLog = (operation: string, name: string, version: string) =>
  pc.bold(`${pc.blue(operation)} ${pc.cyan(name)} ${pc.gray(version)}`);
const endLog = (operation: string, name: string, time: number) =>
  pc.bold(
    `👌 ${pc.green('Success')} ${pc.blue(operation)} ${pc.cyan(
      name,
    )} ${pc.yellow(`${time}ms`)}`,
  );

const exec = async (cmd: string) => {
  const spawnStream = childProcess.spawn(cmd, { shell: true });
  const stdout: string[] = [];
  const stderr: string[] = [];
  return await new Promise<string>((resolve, reject) => {
    spawnStream.stdout.on('data', (data) => {
      stdout.push(data.toString());
    });
    spawnStream.stderr.on('data', (data) => {
      stderr.push(data.toString());
    });
    spawnStream.on('close', (code) => {
      if (code === 0) resolve(stdout.join('').trim());
      else reject(new Error([...stdout, ...stderr].join('').trim()));
    });
  });
};

const getPackageInfo = async () => {
  const packageJson = await fs.readJSON(
    path.join(process.cwd(), 'package.json'),
  );
  return packageJson;
};

const addExtensionEsBuildPlugin = (): Plugin => {
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

type Report = Record<
  string,
  {
    size: string;
    size_byte: number;
    gzip: string;
    gzip_byte: number;
  }
>;

const bundleSizeReport = async (outputs: Metafile['outputs']) => {
  const report: Report = {};
  for (const file in outputs) {
    const output = outputs[file];
    const buffer = await fs.readFile(file);
    const code = buffer.toString();
    const sizeByte = Buffer.byteLength(code, 'utf8');
    report[output?.entryPoint || ''] = {
      size: formatBytes(sizeByte),
      size_byte: sizeByte,
      gzip: formatBytes(await gzipSize(code)),
      gzip_byte: await gzipSize(code),
    };
  }
  return report;
};

const bundleSize = async () => {
  const now = Date.now();
  const sizeOutDir = `${outDir}-size`;
  sizeEntry.push(`${entryDir}/index.ts`);
  try {
    await fs.remove(sizeOutDir);
    const { metafile } = await build({
      ...esBuildOptions,
      format: 'esm',
      entryPoints: sizeEntry,
      outdir: sizeOutDir,
      bundle: true,
      metafile: true,
    });
    const report = await bundleSizeReport(metafile.outputs);
    await fs.outputJson(`${sizeOutDir}/report.json`, report, { spaces: 2 });
    const time = Date.now() - now;
    console.log(successLog('BundleSize', time, sizeOutDir));
    console.table(report);
  } catch (_) {
    console.log(errorLog('Error BundleSize'));
    process.exit(1);
  }
};

const esmBuild = async () => {
  const now = Date.now();
  try {
    await build({
      ...esBuildOptions,
      format: 'esm',
      outdir: outDir,
      bundle: true,
      plugins: [addExtensionEsBuildPlugin()],
    });
    const time = Date.now() - now;
    console.log(successLog('ESModule', time, outDir));
  } catch (_) {
    console.log(errorLog('ESModule'));
    process.exit(1);
  }
};

const cjsBuild = async () => {
  const now = Date.now();
  try {
    const packageJson = { type: 'commonjs' };
    await Promise.all([
      build({
        ...esBuildOptions,
        format: 'cjs',
        outdir: cjsOutDir,
      }),
      !isCjsOnly && fs.outputJson(`${cjsOutDir}/package.json`, packageJson),
    ]);
    const time = Date.now() - now;
    console.log(successLog('CommonJS', time, cjsOutDir));
  } catch (_) {
    console.log(errorLog('CommonJS'));
    process.exit(1);
  }
};

const tsBuild = async () => {
  const now = Date.now();
  try {
    const stdout = await exec(
      `tsc ${isWatch ? '-w' : ''} --outDir ${outDir} -p tsconfig.build.json`,
    );
    const time = Date.now() - now;
    console.log(successLog('TypeScript', time, outDir));
    stdout && console.log(stdout);
  } catch (error) {
    console.log(errorLog('TypeScript'));
    if (error instanceof Error) console.log(error.message);
    process.exit(1);
  }
};

const execRun = async (execCommand: string) => {
  const now = Date.now();
  try {
    const stdout = await exec(execCommand);
    const time = Date.now() - now;
    console.log(successLog(`${execCommand}`, time));
    stdout && console.log(stdout);
  } catch (error) {
    console.log(errorLog(`${execCommand}`));
    if (error instanceof Error) console.log(error.message);
    process.exit(1);
  }
};

const main = async () => {
  const now = Date.now();
  const { name, version } = await getPackageInfo();
  console.log(startLog('Build', name, version));
  !isWatch && (await fs.remove(outDir));
  await Promise.all([
    !isCjsOnly && esmBuild(),
    cjsBuild(),
    tsBuild(),
    execCommand && execRun(execCommand),
  ]);
  isSize && (await bundleSize());
  const time = Date.now() - now;
  console.log(endLog('ALL', name, time));
};

main();
