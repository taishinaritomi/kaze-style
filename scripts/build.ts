import childProcess from 'child_process';
import path from 'path';
import arg from 'arg';
import type { BuildOptions as EsbuildOptions } from 'esbuild';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs-extra';
import { z } from 'zod';

const args = arg({
  '--watch': Boolean,
  '--exec': String,
});

const watch = args['--watch'] ?? false;
const execCommand = args['--exec'];

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

type PackageJson = {
  name?: string;
  version?: string;
  sideEffects?: boolean;
};

const getPackageJson = (): PackageJson => {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = fs.readFileSync(packageJsonPath);
  return JSON.parse(packageJson.toString());
};

const packageJson = getPackageJson();

const distPackageJson = {
  sideEffect: packageJson.sideEffects,
};

const BuildOptionSchema = z
  .object({
    dir: z.string(),
    outDir: z.string(),
    entries: z.record(
      z
        .object({
          format: z.union([
            z.literal('both'),
            z.literal('cjs'),
            z.literal('esm'),
          ]),
        })
        .partial(),
    ),
  })
  .partial();

const RequiredBuildOptionSchema = BuildOptionSchema.required();

type RequiredBuildOption = z.infer<typeof RequiredBuildOptionSchema>;

const DEFAULT_BUILD_OPTION: RequiredBuildOption = {
  dir: 'src',
  outDir: 'dist',
  entries: {
    'index.ts': {},
  },
};

const getBuildOption = (): RequiredBuildOption => {
  try {
    const buildJsonPath = path.join(process.cwd(), 'build.json');
    const buildJson = fs.readFileSync(buildJsonPath);
    const buildOption = BuildOptionSchema.parse(
      JSON.parse(buildJson.toString()),
    );
    return Object.assign(DEFAULT_BUILD_OPTION, buildOption, {
      entries: Object.assign(
        {},
        DEFAULT_BUILD_OPTION.entries || {},
        buildOption.entries || {},
      ),
    });
  } catch {
    return DEFAULT_BUILD_OPTION;
  }
};

const buildOption = getBuildOption();

const resolveEsbuildOptions = (): EsbuildOptions[] => {
  const options: EsbuildOptions[] = [];
  Object.entries(buildOption.entries || {}).map(([entryPath, option]) => {
    const filename = entryPath.split('.').slice(0, -1).join('.');
    const format = option.format || 'both';
    let formats: ['cjs', 'esm'] | ['cjs'] | ['esm'];

    if (format === 'both') formats = ['cjs', 'esm'];
    else formats = [format];

    formats.forEach((format) => {
      options.push({
        entryPoints: [path.join(buildOption.dir, entryPath)],
        bundle: true,
        minify: true,
        format: format,
        platform: 'node',
        plugins: [nodeExternalsPlugin()],
        outfile: path.join(buildOption.outDir, format, `${filename}.js`),
      });
    });
  });
  return options;
};

const buildForOptionsList = async (
  optionsList: (EsbuildOptions | false | undefined)[],
) => {
  if (watch) {
    await Promise.all(
      optionsList.map(async (options) => {
        if (options) {
          const context = await esbuild.context(options);
          await context.watch();
        }
      }),
    );
  } else {
    await Promise.all(
      optionsList.map(async (options) => {
        if (options) await esbuild.build(options);
      }),
    );
  }
  return undefined;
};

const js = async () => {
  await Promise.all([
    buildForOptionsList(resolveEsbuildOptions()),
    fs.outputJson(
      `${buildOption.outDir}/cjs/package.json`,
      Object.assign({}, distPackageJson, { type: 'commonjs' }),
    ),
    fs.outputJson(
      `${buildOption.outDir}/esm/package.json`,
      Object.assign({}, distPackageJson, { type: 'module' }),
    ),
  ]);
};

const ts = async () => {
  const packageJson = Object.assign({}, distPackageJson, { type: 'commonjs' });
  const outDir = `${buildOption.outDir}/types`;
  await Promise.all([
    exec(`tsc ${watch ? '-w' : ''} --outDir ${outDir} -p tsconfig.build.json`),
    fs.outputJson(`${outDir}/package.json`, packageJson),
  ]);
};

const build = async () => {
  await fs.remove(buildOption.outDir);
  await Promise.all([js(), ts(), execCommand && exec(execCommand)]);
};

build();
