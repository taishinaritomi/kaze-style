import { createGlobalStyle as createGlobalStyleCore } from '@kaze-style/core';
import type { KazeGlobalStyle } from '@kaze-style/core';
import { setCssRuleObjects } from '@kaze-style/core/runtime';

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): void => {
  const { cssRuleObjects } = createGlobalStyleCore(globalStyles);

  if (typeof document !== 'undefined') {
    setCssRuleObjects(cssRuleObjects);
  }
};
