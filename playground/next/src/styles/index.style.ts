import { createStyle } from '@kaze-style/core';

export const classes = createStyle({
  container: {
    display: 'flex',
    gap: '5px',
  },
  $button: {
    padding: ['10px', '20px'],
  },
  $blueButton: {
    background: 'blue',
    ':hover': {
      background: 'skyblue',
    },
  },
});
