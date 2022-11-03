import { createGlobalStyle as createGlobalStyleCore } from '@kaze-style/core';
import type { KazeGlobalStyle } from '@kaze-style/core';
import { setCssRuleObjects } from '@kaze-style/core/runtime';

export const createGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
): void => {
  const { cssRuleObjects } = createGlobalStyleCore(globalStyles);

  if (typeof document !== 'undefined') {
    setCssRuleObjects(cssRuleObjects);
  }
};
