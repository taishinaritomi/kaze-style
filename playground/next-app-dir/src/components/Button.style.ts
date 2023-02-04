import { style } from '@kaze-style/core';

export const classes = style({
  $button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange',
    },
  },
});
