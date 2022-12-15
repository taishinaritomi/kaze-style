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
  evalCode(
    code,
    filename,
    {
      [forBuildName]: forBuild,
      window,
    },
    true,
  );

  const [, cssRules, styles] = forBuild;
  return [cssRules, styles] as const;
};
