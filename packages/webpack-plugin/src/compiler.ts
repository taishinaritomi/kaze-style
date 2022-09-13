import { createCompat } from './compat';
import type { LoaderContext } from './loader';

type Externals = any;

const compilerNamePrefix = 'kaze-style-compiler';

interface CompilationResult {
  source: string;
  fileDependencies: Array<string>;
  contextDependencies: Array<string>;
}

const getCompilerName = (resource: string) =>
  `${compilerNamePrefix}:${resource}`;

export class ChildCompiler {
  externals: Externals | undefined;

  constructor(externals: Externals) {
    this.externals = externals;
  }

  isChildCompiler(name: string | undefined) {
    return typeof name === 'string' && name.startsWith(compilerNamePrefix);
  }

  async getCompiledSource(loader: LoaderContext) {
    const { source, fileDependencies, contextDependencies } =
      await compileVanillaSource(loader, this.externals);

    fileDependencies.forEach((dep) => {
      loader.addDependency(dep);
    });
    contextDependencies.forEach((dep) => {
      loader.addContextDependency(dep);
    });

    return {
      source,
      dependencies: fileDependencies,
    };
  }
}

function getRootCompilation(loader: LoaderContext) {
  let compiler = loader._compiler;
  let compilation = loader._compilation;
  while (compiler.parentCompilation) {
    compilation = compiler.parentCompilation;
    compiler = compilation.compiler;
  }
  return compilation;
}

function compileVanillaSource(
  loader: LoaderContext,
  externals: Externals | undefined,
): Promise<CompilationResult> {
  return new Promise((resolve, reject) => {
    const isWebpack5 = Boolean(
      loader._compiler.webpack && loader._compiler.webpack.version,
    );
    const compat = createCompat(isWebpack5);
    const outputOptions = { filename: loader.resourcePath };

    const compilerName = getCompilerName(loader.resourcePath);
    const childCompiler = getRootCompilation(loader).createChildCompiler(
      compilerName,
      outputOptions,
      [],
    );

    const NodeTemplatePlugin = compat.getNodeTemplatePlugin(loader._compiler);
    const NodeTargetPlugin = compat.getNodeTargetPlugin(loader._compiler);
    const LimitChunkCountPlugin = compat.getLimitChunkCountPlugin(
      loader._compiler,
    );
    const ExternalsPlugin = compat.getExternalsPlugin(loader._compiler);

    new NodeTemplatePlugin(outputOptions).apply(childCompiler);
    new NodeTargetPlugin().apply(childCompiler);

    if (compat.isWebpack5) {
      const {
        EntryOptionPlugin,
        library: { EnableLibraryPlugin },
      } = loader._compiler.webpack;

      new EnableLibraryPlugin('commonjs2').apply(childCompiler);

      EntryOptionPlugin.applyEntryOption(childCompiler, loader.context, {
        child: {
          library: {
            type: 'commonjs2',
          },
          import: [loader.resourcePath],
        },
      });
    } else {
      const { LibraryTemplatePlugin, SingleEntryPlugin } = (() =>
        require('webpack'))();

      new LibraryTemplatePlugin(null, 'commonjs2').apply(childCompiler);
      new SingleEntryPlugin(loader.context, loader.resourcePath).apply(
        childCompiler,
      );
    }

    new LimitChunkCountPlugin({ maxChunks: 1 }).apply(childCompiler);
    new ExternalsPlugin('commonjs', ['@kaze-style/react', externals]).apply(
      childCompiler,
    );

    let source: string;

    if (compat.isWebpack5) {
      childCompiler.hooks.compilation.tap(compilerName, (compilation) => {
        compilation.hooks.processAssets.tap(compilerName, () => {
          source =
            (compilation.assets[loader.resourcePath] &&
              (compilation.assets[loader.resourcePath]?.source() as string)) ||
            '';

          compilation.chunks.forEach((chunk) => {
            chunk.files.forEach((file) => {
              compilation.deleteAsset(file);
            });
          });
        });
      });
    } else {
      childCompiler.hooks.afterCompile.tap(compilerName, (compilation) => {
        source =
          (compilation.assets[loader.resourcePath] &&
            (compilation.assets[loader.resourcePath]?.source() as string)) ||
          '';

        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((file) => {
            delete compilation.assets[file];
          });
        });
      });
    }

    try {
      childCompiler.runAsChild((err, _entries, compilation) => {
        if (err) {
          return reject(err);
        }

        if (!compilation) {
          return reject(
            new Error('Missing compilation in child compiler result'),
          );
        }

        if (compilation.errors.length > 0) {
          return reject(compilation.errors[0]);
        }

        if (!source) {
          return reject(new Error("Didn't get a result from child compiler"));
        }

        resolve({
          source,
          fileDependencies: Array.from(compilation.fileDependencies),
          contextDependencies: Array.from(compilation.contextDependencies),
        });
      });
    } catch (err) {
      reject(err);
    }
  });
}
