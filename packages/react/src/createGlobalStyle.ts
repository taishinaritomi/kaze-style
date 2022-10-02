import { createGlobalStyle as createGlobalStyleCore } from '@kaze-style/core';
import type { KazeGlobalStyle } from '@kaze-style/core';

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): void => {
  const { cssRules } = createGlobalStyleCore(globalStyles);

  if (typeof document !== 'undefined') {
    let globalStyle = document.getElementById(
      'kaze-global-style',
    ) as HTMLStyleElement;
    if (!globalStyle) {
      globalStyle = document.createElement('style');
      globalStyle.id = 'kaze-global-style';
      document.head.prepend(globalStyle);
    }
    const globalStyleSheet = globalStyle.sheet;
    cssRules.forEach((css) => globalStyleSheet?.insertRule(css));
  }
};
