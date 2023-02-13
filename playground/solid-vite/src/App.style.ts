import { globalStyle, style } from '@kaze-style/core';
import { globalTheme } from '@kaze-style/themes';

globalStyle(globalTheme.reset());

export const classes = style({
  $button: {
    padding: '10px 20px',
  },
});
