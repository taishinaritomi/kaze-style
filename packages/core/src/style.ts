import { isBuildTime } from './isBuildTime';
import { resolveStyle } from './resolveStyle';
import { setCssRules } from './setCssRules';
import type { BuildArg, Classes } from './types/common';
import type { KazeStyle } from './types/style';
import { classesSerialize } from './utils/classesSerialize';

export function style<K extends string>(styles: KazeStyle<K>): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildArg: BuildArg,
  index: number,
): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildArg?: BuildArg,
  index?: number,
): Classes<K> {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);
  if (isBuildTime(buildArg) && typeof index !== 'undefined') {
    const classesNode = classesSerialize(staticClasses);
    buildArg.injector.cssRules.push(...cssRules);
    buildArg.injector.args.push({ value: [classesNode], index });
  } else if (typeof document !== 'undefined') setCssRules(cssRules);
  return classes;
}
