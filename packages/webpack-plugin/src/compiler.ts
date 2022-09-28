import type { LoaderContext } from './loader';

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

const getCompilerName = (resource: string) => {
  return `${compilerNamePrefix}:${resource}`;
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

    const outputOptions = {
      filename: loader.resourcePath,
    };

    const NodeTemplatePlugin = webpack.node.NodeTemplatePlugin;
    const NodeTargetPlugin = webpack.node.NodeTargetPlugin;
    // const LoaderTargetPlugin = webpack.LoaderTargetPlugin;
    const EntryOptionPlugin = webpack.EntryOptionPlugin;
    const ExternalsPlugin = webpack.ExternalsPlugin;
    const LimitChunkCountPlugin = webpack.optimize.LimitChunkCountPlugin;
    const EnableLibraryPlugin = webpack.library.EnableLibraryPlugin;

    const compilerName = getCompilerName(loader.resourcePath);
    const childCompiler = getRootCompilation(loader).createChildCompiler(
      compilerName,
      outputOptions,
      [],
    );

    new NodeTemplatePlugin(outputOptions).apply(childCompiler);
    new NodeTargetPlugin().apply(childCompiler);
    new EnableLibraryPlugin('commonjs2').apply(childCompiler);

    EntryOptionPlugin.applyEntryOption(childCompiler, loader.context, {
      child: {
        library: {
          type: 'commonjs2',
        },
        import: [loader.resourcePath],
      },
    });

    new LimitChunkCountPlugin({ maxChunks: 1 }).apply(childCompiler);
    new ExternalsPlugin('commonjs', ['@kaze-style/react']).apply(childCompiler);

    let source: string;

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
