import type { BuildArgument } from './types/common';

export const isBuildTime = (
  buildArgument: BuildArgument | undefined,
): buildArgument is BuildArgument => {
  return buildArgument
    ? buildArgument.filename === buildArgument.injector.filename
    : false;
};
