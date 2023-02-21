import { isBuildTime } from './isBuildTime';
import { resolveGlobalStyle } from './resolveGlobalStyle';
import { setCssRules } from './setCssRules';
import type { BuildArgument } from './types/common';
import type { KazeGlobalStyle } from './types/style';

export function globalStyle<K extends string>(
  globalStyles: KazeGlobalStyle<K>,
): void;
export function globalStyle<K extends string>(
  globalStyles: KazeGlobalStyle<K>,
  buildArgument: BuildArgument,
  index: number,
): void;
export function globalStyle<K extends string>(
  styles: KazeGlobalStyle<K>,
  buildArgument?: BuildArgument,
  _index?: number,
): void {
  const [cssRules] = resolveGlobalStyle(styles);
  if (isBuildTime(buildArgument)) {
    buildArgument.injector.cssRules.push(...cssRules);
  } else if (typeof document !== 'undefined') setCssRules(cssRules);
}
