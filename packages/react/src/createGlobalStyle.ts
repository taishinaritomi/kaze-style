import { createGlobalStyle as createGlobalStyleCore } from '@kaze-style/core';
import type { KazeGlobalStyle } from '@kaze-style/core';

export const createGlobalStyle = (globalStyles: KazeGlobalStyle): void => {
  const { cssRules } = createGlobalStyleCore(globalStyles);

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

    const styleGlobal = document.getElementById(
      'kaze-global-style',
    ) as HTMLStyleElement & { arr: string[] };

    styleGlobal.arr = [...(styleGlobal.arr || []), ...cssRules];
    styleGlobal.innerText = Array.from(new Set(styleGlobal.arr)).join('');
  }
};
