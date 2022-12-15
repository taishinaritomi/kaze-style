import { createStyle as createStyleCore, setCssRules } from '@kaze-style/core';
import type { KazeStyle } from '@kaze-style/core';

export const createStyle = <K extends string>(
  stylesByKey: KazeStyle<K>,
): Record<K, string> => {
  const [cssRules, classes] = createStyleCore(stylesByKey);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
  return classes as unknown as Record<K, string>;
};
