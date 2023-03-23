// import { classes } from './App.style';

import { globalStyle, createStyle } from '@kaze-style/core';
import { globalTheme } from '@kaze-style/themes';

globalStyle(globalTheme.reset());

export const classes = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    padding: '10px 20px',
    ':hover': {
      background: 'orange',
    },
  },
});
