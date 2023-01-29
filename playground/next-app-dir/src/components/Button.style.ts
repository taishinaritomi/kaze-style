import { createStyle } from '@kaze-style/core';

export const classes = createStyle({
  $button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});
