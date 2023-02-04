import { globalStyle, style } from '@kaze-style/core';
import { globalTheme } from '@kaze-style/themes';

globalStyle(globalTheme.reset());

export const classes = style({
  button: {
    background: 'red',
    borderRadius: '6px',
    padding: ['10px', '20px'],
    ':hover': {
      background: 'orange',
    },
  },
});
