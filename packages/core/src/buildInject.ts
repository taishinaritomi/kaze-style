import type { Ast } from './types/ast';
import type { BuildInfo, CssRule } from './types/common';

export const buildInject = (
  inject: { cssRules: CssRule[]; args?: Ast.Node[] },
  buildInfo: BuildInfo | undefined,
  index: number | undefined,
) => {
  if (buildInfo) {
    if (
      buildInfo.filename === buildInfo.injector.filename &&
      index !== undefined
    ) {
      buildInfo.injector.cssRules.push(...inject.cssRules);
      if (inject.args) {
        buildInfo.injector.args.push({ value: inject.args, index });
      }
    }
  }
};
