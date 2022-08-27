import type { ResolvedStyle } from '@kaze-style/core';
import evalCode from 'eval';
import type { LoaderContext } from './loader';

export function pitch(this: LoaderContext) {
  this.cacheable(true);

  const { childCompiler } = this.getOptions();
  const isChildCompiler = childCompiler.isChildCompiler(this._compiler.name);
  if (!isChildCompiler) {
    const callback = this.async();
    childCompiler
      .getCompiledSource(this)
      .then(({ source }) => {
        try {
          evalCode(
            source,
            this.resourcePath,
            {
              console,
              process: Object.assign(process, { __resolvedStyles: [] }),
            },
            true,
          );
          const resolvedStyles = process[
            '__resolvedStyles' as keyof NodeJS.Process
          ] as unknown as ResolvedStyle[];

          if (resolvedStyles.length !== 0)
            this.data.resolvedStyles = resolvedStyles;

          callback(null);
        } catch (error) {
          callback(null);
        }
      })
      .catch(() => {
        callback(null);
      });
  }
}
