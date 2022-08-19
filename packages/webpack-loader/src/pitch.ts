import evalCode from 'eval';
import type { LoaderContext } from './loader';

export type StyleData =
  | {
      cssRulesList: string[][];
      classesList: Record<string, string>[];
    }
  | undefined;

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
              process: Object.assign(process, { __styleData: null }),
            },
            true,
          );
          const styleData = process[
            '__styleData' as keyof NodeJS.Process
          ] as StyleData;

          if (styleData) this.data['styleData'] = styleData;

          callback(null);
        } catch (error) {
          callback(null);
        }
      })
      .catch((e) => {
        callback(e);
      });
  }
}
