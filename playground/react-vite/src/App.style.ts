import { createGlobalStyle, createStyle } from '@kaze-style/core';
import { theme } from '@kaze-style/themes';

createGlobalStyle(theme.reset());

export const style = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    padding: ['10px', '20px'],
    ':hover': {
      background: 'orange',
    },
  },
});
