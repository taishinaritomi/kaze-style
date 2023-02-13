import { style } from '@kaze-style/core';

export const classes = style({
  container: {
    display: 'flex',
    gap: '5px',
  },
  $button: {
    padding: '10px 20px',
  },
  $blueButton: {
    background: 'blue',
    ':hover': {
      background: 'skyblue',
    },
  },
});
