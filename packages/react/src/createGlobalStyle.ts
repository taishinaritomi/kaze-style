import { createGlobalStyle as createGlobalStyleCore } from '@kaze-style/core';
import type { KazeGlobalStyle } from '@kaze-style/core';
import { setCssRules } from '@kaze-style/core/runtime';

export const createGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
): void => {
  const { cssRules } = createGlobalStyleCore(globalStyles);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
};
