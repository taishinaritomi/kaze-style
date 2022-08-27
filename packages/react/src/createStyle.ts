import { createStyle as createStyleCore } from '@kaze-style/core';
import type { KazeStyle, ResolvedStyle } from '@kaze-style/core';

export const createStyle = <Key extends string>(
  stylesByKey: Record<Key, KazeStyle>,
): Record<Key, string> => {
  const { classes, cssRules } = createStyleCore(stylesByKey);

  //TODO:processに直接入れるの良くない
  if (process && process['__resolvedStyles' as keyof NodeJS.Process]) {
    const resolvedStyles = process[
      '__resolvedStyles' as keyof NodeJS.Process
    ] as unknown as ResolvedStyle[];
    resolvedStyles.push({ classes, cssRules });
  }

  if (typeof document !== 'undefined') {
    let style = document.getElementById('kaze-style') as HTMLStyleElement;
    if (!style) {
      style = document.createElement('style');
      style.id = 'kaze-style';
      document.head.appendChild(style);
    }

    let styleMedia = document.getElementById(
      'kaze-style-media',
    ) as HTMLStyleElement;
    if (!styleMedia) {
      styleMedia = document.createElement('style');
      styleMedia.id = 'kaze-style-media';
      document.head.appendChild(styleMedia);
    }

    const styleSheet = style.sheet;
    const styleSheetMedia = styleMedia.sheet;

    cssRules.forEach((css) => {
      if (css.match(/@media/)) {
        styleSheetMedia?.insertRule(css);
      } else {
        styleSheet?.insertRule(css);
      }
    });
  }
  return classes;
};
