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

const BuildOptionSchema = z
  .object({
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
  outDir: 'dist',
  entries: {
    'src/index.ts': {},
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
    const format = option.format || 'both';
    let formats: ['cjs', 'esm'] | ['cjs'] | ['esm'];

    if (format === 'both') formats = ['cjs', 'esm'];
    else formats = [format];

    formats.forEach((format) => {
      options.push({
        entryPoints: [entryPath],
        bundle: true,
        minify: true,
        format: format,
        platform: 'node',
        plugins: [nodeExternalsPlugin()],
        outExtension: {
          '.js': `.${
            format === 'cjs' ? 'cjs' : format === 'esm' ? 'mjs' : 'js'
          }`,
        },
        outdir: buildOption.outDir,
        outbase: 'src',
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

const build = async () => {
  await fs.remove(buildOption.outDir);
  const typesOutDir = `${buildOption.outDir}/types`;
  await Promise.all([
    buildForOptionsList(resolveEsbuildOptions()),
    exec(
      `tsc ${watch ? '-w' : ''} --outDir ${typesOutDir} -p tsconfig.build.json`,
    ),
    fs.outputJson(`${typesOutDir}/package.json`, { type: 'commonjs' }),
    execCommand && exec(execCommand),
  ]);
};

build();
