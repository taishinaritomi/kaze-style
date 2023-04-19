import { buildInject } from './buildInject';
import { resolveGlobalStyle } from './resolveGlobalStyle';
import { setCssRules } from './setCssRules';
import type { BuildInfo } from './types/common';
import type { KazeGlobalStyle } from './types/style';

export function globalStyle<K extends string>(
  globalStyles: KazeGlobalStyle<K>,
): void;
export function globalStyle<K extends string>(
  globalStyles: KazeGlobalStyle<K>,
  buildInfo: BuildInfo,
  index: number,
): void;
export function globalStyle<K extends string>(
  styles: KazeGlobalStyle<K>,
  buildInfo?: BuildInfo,
  index?: number,
): void {
  const [cssRules] = resolveGlobalStyle(styles);

  buildInject({ cssRules: cssRules }, buildInfo, index);

  if (typeof document !== 'undefined') setCssRules(cssRules);
}

export const createGlobalStyle = globalStyle;
