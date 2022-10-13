import type { ForBuildGlobalStyle, ForBuildStyle } from '@kaze-style/core';
import evalCode from 'eval';

type Args = {
  code: string;
  path: string;
};

type ForBuild = {
  fileName: string;
  styles: ForBuildStyle<string>[];
  globalStyles: ForBuildGlobalStyle[];
};

export const extractStyle = ({ code, path }: Args) => {
  const __forBuildByKazeStyle: ForBuild = {
    fileName: path,
    styles: [],
    globalStyles: [],
  };

  const window = {};
  evalCode(
    code,
    path,
    {
      __forBuildByKazeStyle,
      window,
    },
    true,
  );

  const { globalStyles, styles } = __forBuildByKazeStyle;

  const cssRuleObjects = ([
    ...styles.flatMap(({ cssRuleObjects }) => cssRuleObjects),
    ...globalStyles.flatMap(({ cssRuleObjects }) => cssRuleObjects)
  ]);

  return {
    globalStyles,
    styles,
    cssRuleObjects
  };
};
