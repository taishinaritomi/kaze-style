import { createStyle as createStyleCore } from '@kaze-style/core';
import type { KazeStyle, Classes } from '@kaze-style/core';
import { setCssRules } from '@kaze-style/core/runtime';

export const createStyle = <K extends string>(
  stylesByKey: KazeStyle<K>,
): Classes<K> => {
  const { classes, cssRules } = createStyleCore(stylesByKey);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
  return classes;
};
