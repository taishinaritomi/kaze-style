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
      },
      '50%': {
        transform: 'rotate(340deg)',
      },
      to: {
        transform: 'rotate(360deg)',
      },
    },
  },
});

export const App = () => {
  return <button className={classes.button}>button</button>;
};
