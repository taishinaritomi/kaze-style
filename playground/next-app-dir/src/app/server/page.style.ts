import { style } from '@kaze-style/core';

export const classes = style({
  title: {
    fontSize: '2rem',
    color: 'green',
    marginBottom: '1.5rem',
  },
  buttonContainer: {
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
