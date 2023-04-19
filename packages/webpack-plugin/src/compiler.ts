import type { Compilation } from 'webpack';
import type { LoaderContext } from './transformLoader';

const compilerNamePrefix = 'kaze-style-compiler';

const getRootCompilation = (loader: LoaderContext) => {
  let compiler = loader._compiler;
  let compilation = loader._compilation;
  while (compiler.parentCompilation) {
    compilation = compiler.parentCompilation;
    compiler = compilation.compiler;
  }
  return compilation;
};

const getCompilerName = (filename: string) => {
  return `${compilerNamePrefix}:${filename}`;
};

export const isChildCompiler = (name: string | undefined) => {
  return typeof name === 'string' && name.startsWith(compilerNamePrefix);
};

export const getCompiledSource = async (loader: LoaderContext) => {
  const { source, fileDependencies, contextDependencies } =
    await compileVanillaSource(loader);

  fileDependencies.forEach((dep) => {
    loader.addDependency(dep);
  });
  contextDependencies.forEach((dep) => {
    loader.addContextDependency(dep);
  });

  return source;
};

const compileVanillaSource = async (loader: LoaderContext) => {
  return new Promise<{
    source: string;
    fileDependencies: string[];
    contextDependencies: string[];
  }>((resolve, reject) => {
    const webpack = loader._compiler.webpack;

    const entryPath = loader.resourcePath;

    const outputOptions: Parameters<Compilation['createChildCompiler']>[1] = {
      filename: entryPath,
    };

    const {
      ExternalsPlugin,
      EntryOptionPlugin,
      node: { NodeTemplatePlugin, NodeTargetPlugin },
      optimize: { LimitChunkCountPlugin },
      library: { EnableLibraryPlugin },
    } = webpack;

    const compilerName = getCompilerName(entryPath);
    const childCompiler = getRootCompilation(loader).createChildCompiler(
      compilerName,
      outputOptions,
      [
        new NodeTemplatePlugin(outputOptions),
        new NodeTargetPlugin(),
        new EnableLibraryPlugin('commonjs2'),
        new LimitChunkCountPlugin({ maxChunks: 1 }),
        new ExternalsPlugin('commonjs', ['@kaze-style/core']),
      ],
    );

    EntryOptionPlugin.applyEntryOption(childCompiler, loader.context, {
      child: {
        library: {
          type: 'commonjs2',
        },
        import: [entryPath],
      },
    });

    let source: string;

    childCompiler.hooks.thisCompilation.tap(compilerName, (compilation) => {
      compilation.hooks.processAssets.tap(compilerName, () => {
        source = compilation.assets[entryPath]?.source() as string;

        compilation.chunks.forEach((chunk) => {
          chunk.files.forEach((file) => compilation.deleteAsset(file));
        });
      });
    });

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
};
