import { resolveGlobalStyle } from './resolveGlobalStyle';
import { setCssRules } from './setCssRules';
import type { KazeGlobalStyle } from './types/globalStyle';

export const createGlobalStyle = <T extends string>(
  globalStyles: KazeGlobalStyle<T>,
): void => {
  const [cssRules] = resolveGlobalStyle(globalStyles);

  if (typeof document !== 'undefined') {
    setCssRules(cssRules);
  }
};
