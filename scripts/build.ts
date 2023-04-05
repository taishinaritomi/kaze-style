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

const EntryOptionSchema = z
  .object({
    dir: z.string(),
    outDir: z.string(),
    files: z.record(
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

const RequiredEntryOptionSchema = EntryOptionSchema.required();

type RequiredEntryOption = z.infer<typeof RequiredEntryOptionSchema>;

const DEFAULT_ENTRY_OPTION: RequiredEntryOption = {
  dir: 'src',
  outDir: 'dist',
  files: {
    'index.ts': {},
  },
};

const getEntryOption = (): RequiredEntryOption => {
  try {
    const entryJsonPath = path.join(process.cwd(), 'entry.json');
    const entryJson = fs.readFileSync(entryJsonPath);
    const entryOption = EntryOptionSchema.parse(
      JSON.parse(entryJson.toString()),
    );
    return Object.assign(DEFAULT_ENTRY_OPTION, entryOption, {
      files: Object.assign(
        {},
        DEFAULT_ENTRY_OPTION.files || {},
        entryOption.files || {},
      ),
    });
  } catch {
    return DEFAULT_ENTRY_OPTION;
  }
};

const entryOption = getEntryOption();

const resolveEsbuildOptions = (): EsbuildOptions[] => {
  const options: EsbuildOptions[] = [];
  Object.entries(entryOption.files || {}).map(([entryPath, option]) => {
    const filename = entryPath.split('.').slice(0, -1).join('.');
    const format = option.format || 'both';
    let formats: ['cjs', 'esm'] | ['cjs'] | ['esm'];

    if (format === 'both') formats = ['cjs', 'esm'];
    else formats = [format];

    formats.forEach((format) => {
      options.push({
        entryPoints: [path.join(entryOption.dir, entryPath)],
        bundle: true,
        minify: true,
        format: format,
        platform: 'node',
        plugins: [nodeExternalsPlugin()],
        outfile: path.join(entryOption.outDir, format, `${filename}.js`),
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
      `${entryOption.outDir}/cjs/package.json`,
      Object.assign({}, distPackageJson, { type: 'commonjs' }),
    ),
    fs.outputJson(
      `${entryOption.outDir}/esm/package.json`,
      Object.assign({}, distPackageJson, { type: 'module' }),
    ),
  ]);
};

const ts = async () => {
  const packageJson = Object.assign({}, distPackageJson, { type: 'commonjs' });
  const outDir = `${entryOption.outDir}/types`;
  await Promise.all([
    exec(`tsc ${watch ? '-w' : ''} --outDir ${outDir} -p tsconfig.build.json`),
    fs.outputJson(`${outDir}/package.json`, packageJson),
  ]);
};

const build = async () => {
  await fs.remove(entryOption.outDir);
  await Promise.all([js(), ts(), execCommand && exec(execCommand)]);
};

build();
