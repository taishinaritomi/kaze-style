import { resolveStyle } from './resolveStyle';
import { setCssRules } from './setCssRules';
import type { Classes } from './types/common';
import type { KazeStyle } from './types/style';

export const createStyle = <K extends string>(
  styles: KazeStyle<K>,
): Classes<K> => {
  const [cssRules, classes] = resolveStyle(styles);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
  return classes;
};
