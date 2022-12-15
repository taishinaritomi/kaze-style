import {
  createGlobalStyle as createGlobalStyleCore,
  setCssRules,
} from '@kaze-style/core';
import type { KazeGlobalStyle } from '@kaze-style/core';

export const createGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
): void => {
  const [cssRules] = createGlobalStyleCore(globalStyles);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
};
