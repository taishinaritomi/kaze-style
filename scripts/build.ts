import childProcess from 'child_process';
import path from 'path';
import arg from 'arg';
import type { BuildOptions as EsbuildOptions } from 'esbuild';
import esbuild from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import fs from 'fs-extra';

const args = arg({
  '--watch': Boolean,
  '--exec': String,
});

const watch = args['--watch'] ?? false;
const execCommand = args['--exec'];

const ENTRY_DIR = 'src';
const OUT_DIR = 'dist';

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

type BuildOption = {
  entries: Record<
    string,
    {
      formats?: ('cjs' | 'esm')[];
    }
  >;
};

const getBuildOption = (): BuildOption => {
  try {
    const buildJsonPath = path.join(process.cwd(), 'build.json');
    const buildJson = fs.readFileSync(buildJsonPath);
    const buildOption = JSON.parse(buildJson.toString());
    return {
      ...buildOption,
      entries: {
        'src/index.ts': {},
        ...buildOption.entries,
      },
    };
  } catch {
    return {
      entries: {
        'src/index.ts': {},
      },
    };
  }
};

const buildOption = getBuildOption();

const resolveEsbuildOptions = (): EsbuildOptions[] => {
  const options: EsbuildOptions[] = [];
  Object.entries(buildOption.entries || {}).map(([entryPath, option]) => {
    const formats = option.formats || ['cjs', 'esm'];

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
        outdir: OUT_DIR,
        outbase: ENTRY_DIR,
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
  await fs.remove(OUT_DIR);
  const typesOutDir = `${OUT_DIR}/types`;
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
