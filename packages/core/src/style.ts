import { buildInject } from './buildInject';
import { resolveStyle } from './resolveStyle';
import { setCssRules } from './setCssRules';
import type { BuildInfo, Classes } from './types/common';
import type { KazeStyle } from './types/style';
import { classesSerialize } from './utils/classesSerialize';

export function style<K extends string>(styles: KazeStyle<K>): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildInfo: BuildInfo,
  index: number,
): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildInfo?: BuildInfo,
  index?: number,
): Classes<K> {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);

  const classesNode = classesSerialize(staticClasses);
  buildInject({ cssRules: cssRules, args: [classesNode] }, buildInfo, index);

  if (typeof document !== 'undefined') setCssRules(cssRules);

  return classes;
}

export const createStyle = style;
