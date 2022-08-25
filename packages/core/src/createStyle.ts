import { resolveStyle } from './resolveStyle';
import type { KazeStyle } from './types/Style';

type Result<Key extends string> = {
  cssRules: string[];
  classes: Record<Key, string>;
};

export const createStyle = <Key extends string>(
  styles: Record<Key, KazeStyle>,
): Result<Key> => {
  const classes = {} as Record<Key, string>;
  const allCSS = new Set<string>();

  for (const key in styles) {
    const keyStyle: KazeStyle = styles[key];
    const { resultStyle } = resolveStyle({ style: keyStyle });

    Object.values(resultStyle).forEach((rule) => allCSS.add(rule));
    classes[key] = Object.keys(resultStyle).join(' ');
  }

  return { classes, cssRules: Array.from(allCSS) };
};
