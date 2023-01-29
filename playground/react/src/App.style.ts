import { createStyle, createGlobalStyle } from '@kaze-style/core';
import { globalTheme } from '@kaze-style/themes';

createGlobalStyle(globalTheme.reset());

export const classes = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    padding: ['10px', '20px'],
    ':hover': {
      background: 'orange',
    },
  },
});
