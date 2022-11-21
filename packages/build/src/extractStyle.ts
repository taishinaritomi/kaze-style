import type { ForBuild } from '@kaze-style/core';
import evalCode from 'eval';
import { forBuildName as _forBuildName } from './utils/constants';

type Args = {
  code: string;
  filename: string;
  forBuildName?: string;
};

export const extractStyle = ({
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

  const cssRuleObjects = [
    ...styles.flatMap(({ cssRuleObjects }) => cssRuleObjects),
    ...globalStyles.flatMap(({ cssRuleObjects }) => cssRuleObjects),
  ];

  return {
    globalStyles,
    styles,
    cssRuleObjects,
  };
};
