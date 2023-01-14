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
const cjsOutDir = `${outDir}/cjs`;
const esmOutDir = `${outDir}/esm`;
const typesOutDir = `${outDir}/types`;
const sizeOutDir = `${outDir}-size`;

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

const getPackageJson = async () => {
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

const timer = () => {
  const now = Date.now();
  return () => Date.now() - now;
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
  const stop = timer();
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
    console.log(successLog('BundleSize', stop(), sizeOutDir));
    return report;
  } catch (_) {
    console.log(errorLog('BundleSize'));
    process.exit(1);
  }
};

const esmBuild = async (_packageJson: Record<string, unknown>) => {
  const stop = timer();
  try {
    const packageJson = Object.assign({}, _packageJson, { type: 'module' });
    await Promise.all([
      build({
        ...esBuildOptions,
        format: 'esm',
        outdir: esmOutDir,
        bundle: true,
        plugins: [addExtensionEsBuildPlugin()],
      }),
      fs.outputJson(`${esmOutDir}/package.json`, packageJson),
    ]);
    console.log(successLog('ESModule', stop(), esmOutDir));
  } catch (_) {
    console.log(errorLog('ESModule'));
    process.exit(1);
  }
};

const cjsBuild = async (_packageJson: Record<string, unknown>) => {
  const stop = timer();
  try {
    const packageJson = Object.assign({}, _packageJson, { type: 'commonjs' });
    await Promise.all([
      build({
        ...esBuildOptions,
        format: 'cjs',
        outdir: cjsOutDir,
      }),
      fs.outputJson(`${cjsOutDir}/package.json`, packageJson),
    ]);
    console.log(successLog('CommonJS', stop(), cjsOutDir));
  } catch (_) {
    console.log(errorLog('CommonJS'));
    process.exit(1);
  }
};

const tsBuild = async () => {
  const stop = timer();
  try {
    const packageJson = { type: 'commonjs' };
    const [stdout] = await Promise.all([
      exec(
        `tsc ${
          isWatch ? '-w' : ''
        } --declaration --emitDeclarationOnly --outDir ${typesOutDir} -p tsconfig.build.json`,
      ),
      fs.outputJson(`${typesOutDir}/package.json`, packageJson),
    ]);
    console.log(successLog('TypeScript', stop(), typesOutDir));
    stdout && console.log(stdout);
  } catch (error) {
    console.log(errorLog('TypeScript'));
    if (error instanceof Error) console.log(error.message);
    process.exit(1);
  }
};

const execRun = async (execCommand: string) => {
  const stop = timer();
  try {
    const stdout = await exec(execCommand);
    console.log(successLog(`${execCommand}`, stop()));
    stdout && console.log(stdout);
  } catch (error) {
    console.log(errorLog(`${execCommand}`));
    if (error instanceof Error) console.log(error.message);
    process.exit(1);
  }
};

type PackageJson = {
  name?: string;
  version?: string;
  sideEffects?: boolean;
};

const main = async () => {
  const stop = timer();
  const {
    name = '@unknown',
    version = '0.0.0',
    sideEffects,
  }: PackageJson = await getPackageJson();
  console.log(startLog('Build', name, version));
  !isWatch && (await fs.remove(outDir));
  const [report] = await Promise.all([
    isSize && bundleSize(),
    !isCjsOnly && esmBuild({ sideEffects }),
    cjsBuild({ sideEffects }),
    tsBuild(),
    execCommand && execRun(execCommand),
  ]);
  if (report) console.table(report);
  console.log(endLog('ALL', name, stop()));
};

main();
