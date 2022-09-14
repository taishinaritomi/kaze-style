import type { ResolvedStyle } from '@kaze-style/core';
import evalCode from 'eval';
import type { LoaderContext } from './loader';
import { transformedComment } from './loader';

export function pitch(this: LoaderContext) {
  this.cacheable(true);

  const { childCompiler, pre } = this.getOptions();
  if (!pre && childCompiler) {
    const isChildCompiler = childCompiler.isChildCompiler(this._compiler.name);
    if (!isChildCompiler) {
      const callback = this.async();
      childCompiler
        .getCompiledSource(this)
        .then(({ source }) => {
          if (source.includes(transformedComment)) {
            const __buildStyles: {
              fileName: string;
              resolvedStyles: ResolvedStyle[];
            } = { fileName: this.resourcePath, resolvedStyles: [] };
            const window = {};
            evalCode(
              source,
              this.resourcePath,
              {
                console,
                __buildStyles,
                window,
              },
              true,
            );

            if (__buildStyles.resolvedStyles.length !== 0) {
              this.data.resolvedStyles = __buildStyles.resolvedStyles;
            }
          }
          callback(null);
        })
        .catch((error) => {
          console.error({ resourcePath: this.resourcePath, error });
          callback(null);
        });
    }
  }
}
