import { createStyle as createStyleCore } from '@kaze-style/core';
import type { KazeStyle } from '@kaze-style/core';

export const createStyle = <Key extends string>(
  stylesByKey: Record<Key, KazeStyle>,
): Record<Key, string> => {
  const { classes, cssRules } = createStyleCore(stylesByKey);

  if (typeof document !== 'undefined') {
    let div = document.getElementById('kaze') as HTMLDivElement;
    if (!div) {
      div = document.createElement('div');
      div.id = 'kaze';
      const style = document.createElement('style');
      const styleMedia = document.createElement('style');
      const styleGlobal = document.createElement('style');
      style.id = 'kaze-style';
      styleMedia.id = 'kaze-style-media';
      styleGlobal.id = 'kaze-global-style';
      div.appendChild(styleGlobal);
      div.appendChild(style);
      div.appendChild(styleMedia);
      document.head.appendChild(div);
    }

    const style = document.getElementById('kaze-style') as HTMLStyleElement & {
      arr: string[];
    };
    const styleGlobal = document.getElementById(
      'kaze-global-style',
    ) as HTMLStyleElement & { arr: string[] };

    cssRules.forEach((css) => {
      if (css.match(/@media/)) {
        styleGlobal.arr = [...(styleGlobal.arr || []), css];
      } else {
        style.arr = [...(style.arr || []), css];
      }
    });

    style.innerText = Array.from(new Set(style.arr)).join('');
    styleGlobal.innerText = Array.from(new Set(styleGlobal.arr)).join('');
  }
  return classes;
};
