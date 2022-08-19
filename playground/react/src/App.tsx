import { createStyle } from '@kaze-style/react';

const classes = createStyle({
  button: {
    color: 'red',
    backgroundColor: 'blue',
    '@media (max-width: 600px)': {
      color: 'blue',
      backgroundColor: 'red',
    },
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationDuration: '1s',
    animationName: {
      from: {
        transform: 'rotate(0deg)',
        ':hover': { backgroundColor: 'green' },
      },
      '50%': {
        transform: 'rotate(340deg)',
      },
      to: {
        transform: 'rotate(360deg)',
        ':hover': { backgroundColor: 'green' },
      },
    },
  },
});

export const App = () => {
  return <div className={classes.button}>App</div>;
};