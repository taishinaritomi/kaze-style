import { isBuildTime } from './isBuildTime';
import { resolveGlobalStyle } from './resolveGlobalStyle';
import { setCssRules } from './setCssRules';
import type { BuildArg } from './types/common';
import type { KazeGlobalStyle } from './types/style';

export function globalStyle<K extends string>(
  globalStyles: KazeGlobalStyle<K>,
): void;
export function globalStyle<K extends string>(
  globalStyles: KazeGlobalStyle<K>,
  buildArg: BuildArg,
  index: number,
): void;
export function globalStyle<K extends string>(
  styles: KazeGlobalStyle<K>,
  buildArg?: BuildArg,
  _index?: number,
): void {
  const [cssRules] = resolveGlobalStyle(styles);
  if (isBuildTime(buildArg)) {
    buildArg.injector.cssRules.push(...cssRules);
  } else if (typeof document !== 'undefined') setCssRules(cssRules);
}

export const createGlobalStyle = globalStyle;
