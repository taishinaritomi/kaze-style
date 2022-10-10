import { createStyle as createStyleCore } from '@kaze-style/core';
import type { KazeStyle } from '@kaze-style/core';
import { setCssRuleObjects } from '@kaze-style/core/runtime';

export const createStyle = <Key extends string>(
  stylesByKey: Record<Key, KazeStyle>,
): Record<Key, string> => {
  const { classes, cssRuleObjects } = createStyleCore(stylesByKey);

  if (typeof document !== 'undefined') {
    setCssRuleObjects(cssRuleObjects);
  }
  return classes;
};
