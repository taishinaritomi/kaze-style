// import { classes } from './App.style';

import { globalStyle, style } from '@kaze-style/core';
import { globalTheme } from '@kaze-style/themes';

globalStyle(globalTheme.reset());

export const classes = style({
  button: {
    background: 'red',
    borderRadius: '6px',
    padding: '10px 20px',
    ':hover': {
      background: 'orange',
    },
  },
});

export const App = () => {
  return <button className={classes.button}>button</button>;
};
