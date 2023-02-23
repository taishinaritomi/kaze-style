import type { BuildArg } from './types/common';

export const isBuildTime = (
  buildArg: BuildArg | undefined,
): buildArg is BuildArg => {
  return buildArg ? buildArg.filename === buildArg.injector.filename : false;
};
