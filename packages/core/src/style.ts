import { isBuildTime } from './isBuildTime';
import { resolveStyle } from './resolveStyle';
import { setCssRules } from './setCssRules';
import type { BuildArgument, Classes } from './types/common';
import type { KazeStyle } from './types/style';
import { classesSerialize } from './utils/classesSerialize';

export function style<K extends string>(styles: KazeStyle<K>): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildInjector: BuildArgument,
  index: number,
): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildInjector?: BuildArgument,
  index?: number,
): Classes<K> {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);
  if (isBuildTime(buildInjector)) {
    const classesNode = classesSerialize(staticClasses);
    buildInjector.injector.cssRules.push(...cssRules);
    buildInjector.injector.injectArguments.push({
      value: [classesNode],
      index,
    });
  } else if (typeof document !== 'undefined') setCssRules(cssRules);
  return classes;
}
