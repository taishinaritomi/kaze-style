import { createGlobalStyle, createStyle } from '@kaze-style/react';
import { globalTheme } from '@kaze-style/themes';

createGlobalStyle(globalTheme.reset());

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
