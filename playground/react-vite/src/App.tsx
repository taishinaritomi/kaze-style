import { createGlobalStyle, createStyle } from '@kaze-style/react';
import { resetStyle } from '@kaze-style/themes';

createGlobalStyle(resetStyle);

createGlobalStyle({
  html: {
    backgroundColor: 'blue',
  },
});

const classes = createStyle({
  button: {
    margin: '100px',
  },
});

export const App = () => {
  return (
    <div className="App">
      <div className={classes.button}>button</div>
      App
    </div>
  );
};
