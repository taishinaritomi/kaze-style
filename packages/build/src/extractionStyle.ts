import type { ForBuild } from '@kaze-style/core';
import evalCode from 'eval';
import { forBuildName as _forBuildName } from './constants';

type Options = {
  filename: string;
  forBuildName?: string;
};

export const extractionStyle = (
  code: string,
  { filename, forBuildName = _forBuildName }: Options,
) => {
  const forBuild: ForBuild = [filename, [], []];
  const window = {};
  const cjsGlobal = {};

  if (typeof __dirname !== 'undefined') {
    Object.assign(cjsGlobal, { __dirname });
  }
  if (typeof __filename !== 'undefined') {
    Object.assign(cjsGlobal, { __filename });
  }
  try {
    evalCode(
      code,
      filename,
      {
        [forBuildName]: forBuild,
        window,
        $RefreshReg$: () => undefined,
        ...cjsGlobal,
      },
      true,
    );
  } catch (error) {
    throw error;
  }

  const [, cssRules, styles] = forBuild;
  return [cssRules, styles] as const;
};
