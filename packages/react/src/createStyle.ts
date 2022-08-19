import { createStyle as createStyleCore } from '@kaze-style/core';
import type { KazeStyle } from '@kaze-style/core';

type StyleData =
  | {
      cssRulesList: string[][];
      classesList: Record<string, string>[];
    }
  | undefined;

export const createStyle = <Key extends string>(
  stylesByKey: Record<Key, KazeStyle>,
): Record<Key, string> => {
  const { classes, cssRules } = createStyleCore(stylesByKey);

  //TODO:processに直接入れるの良くない
  if (process && process['__styleData' as keyof NodeJS.Process] !== undefined) {
    // let __styleData = process['__styleData' as keyof NodeJS.Process] as unknown as StyleData;
    if (
      !process['__styleData' as keyof NodeJS.Process] as unknown as StyleData
    ) {
      (process['__styleData' as keyof NodeJS.Process] as unknown as StyleData) =
        { cssRulesList: [], classesList: [] };
    }
    (
      process['__styleData' as keyof NodeJS.Process] as unknown as StyleData
    )?.classesList.push(classes);
    (
      process['__styleData' as keyof NodeJS.Process] as unknown as StyleData
    )?.cssRulesList.push(cssRules);
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
