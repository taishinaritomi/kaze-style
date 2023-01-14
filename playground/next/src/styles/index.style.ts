import { createStyle } from '@kaze-style/react';

export const style = createStyle({
  container: {
    display: 'flex',
    gap: '5px',
  },
  button: {
    padding: ['10px', '20px'],
  },
  blueButton: {
    background: 'blue',
    ':hover': {
      background: 'skyblue',
    },
  },
});
