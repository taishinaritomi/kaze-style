import { createStyle } from '@kaze-style/react';

export const style = createStyle({
  $button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});
