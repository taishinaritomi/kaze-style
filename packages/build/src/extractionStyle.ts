import type { ForBuild } from '@kaze-style/core';
import evalCode from 'eval';
import { FOR_BUILD_NAME } from './constants';

type Options = {
  filename: string;
  forBuildName?: string;
};

export const extractionStyle = (
  code: string,
  { filename, forBuildName = FOR_BUILD_NAME }: Options,
) => {
  const forBuild: ForBuild = [filename, [], []];
  // remove start
  const window = {};
  const cjsGlobal = {};

  if (typeof __dirname !== 'undefined') {
    Object.assign(cjsGlobal, { __dirname });
  }
  if (typeof __filename !== 'undefined') {
    Object.assign(cjsGlobal, { __filename });
  }
  // remove end
  try {
    evalCode(
      code,
      filename,
      {
        [forBuildName]: forBuild,
        // remove start
        window,
        $RefreshReg$: () => undefined,
        ...cjsGlobal,
        // remove end
      },
      true,
    );
  } catch (error) {
    throw error;
  }

  const [, cssRules, styles] = forBuild;
  return [cssRules, styles] as const;
};
