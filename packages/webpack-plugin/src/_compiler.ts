import type { LoaderContext } from './loader';

const compilerNamePrefix = 'kaze-style-compiler';

export const isChildCompiler = (name: string | undefined) => {
  return typeof name === 'string' && name.startsWith(compilerNamePrefix);
};

export const getCompiledSource = async (loader: LoaderContext) => {
  loader;
  return;
};
