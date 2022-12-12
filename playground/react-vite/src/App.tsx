import { createGlobalStyle, createStyle } from '@kaze-style/react';
import { globalTheme } from '@kaze-style/themes';

createGlobalStyle(globalTheme.reset());

const classes = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    padding: ['10px', '20px'],
    ':hover': {
      background: 'orange',
    },
  },
});

export const App = () => {
  return <button className={classes.button}>button</button>;
};
