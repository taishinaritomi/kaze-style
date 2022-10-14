import { createGlobalStyle, createStyle } from '@kaze-style/react';
import { resetStyle } from '@kaze-style/themes';

createGlobalStyle(resetStyle);

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
