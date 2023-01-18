import { createStyle as createStyleCore, setCssRules } from '@kaze-style/core';
import type { KazeStyle, Classes } from '@kaze-style/core';

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Classes<K> => {
  const [cssRules, classes] = createStyleCore(styles);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
  return classes;
};
