import type { ForBuild } from '@kaze-style/core';
import evalCode from 'eval';
import { forBuildName as _forBuildName } from './constants';

type Args = {
  code: string;
  filename: string;
  forBuildName?: string;
};

export const extractionStyle = ({
  code,
  filename,
  forBuildName = _forBuildName,
}: Args) => {
  const forBuild: ForBuild = {
    filename,
    styles: [],
    globalStyles: [],
  };

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

  const { globalStyles, styles } = forBuild;

  const cssRules = [
    ...styles.flatMap(({ cssRules }) => cssRules),
    ...globalStyles.flatMap(({ cssRules }) => cssRules),
  ];

  return {
    globalStyles,
    styles,
    cssRules,
  };
};
