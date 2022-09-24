import type { ForBuildGlobalStyle, ForBuildStyle } from '@kaze-style/core';
import evalCode from 'eval';
import type { LoaderContext } from './loader';
import { transformedComment } from './loader';

type ForBuild = {
  fileName: string;
  styles: ForBuildStyle<string>[];
  globalStyles: ForBuildGlobalStyle[];
};

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
            const __forBuildByKazeStyle: ForBuild = {
              fileName: this.resourcePath,
              styles: [],
              globalStyles: [],
            };
            const window = {};
            evalCode(
              source,
              this.resourcePath,
              {
                console,
                __forBuildByKazeStyle,
                window,
              },
              true,
            );

            if (__forBuildByKazeStyle.styles.length !== 0) {
              this.data.styles = __forBuildByKazeStyle.styles;
            }

            if (__forBuildByKazeStyle.globalStyles.length !== 0) {
              this.data.globalStyles = __forBuildByKazeStyle.globalStyles;
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
