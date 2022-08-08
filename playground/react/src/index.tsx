import { createStyle } from '@kaze-style/react';
import * as ReactDOM from 'react-dom';

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

const App = () => {
  return <div className={classes.button}>aaaaffff</div>;
};

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);
