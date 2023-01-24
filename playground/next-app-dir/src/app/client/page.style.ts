import { createStyle } from '@kaze-style/core';

export const style = createStyle({
  title: {
    fontSize: '2rem',
    color: 'blue',
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
