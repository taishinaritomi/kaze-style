import { createStyle, margeStyle, red } from '@kaze-css/react';
import type { NextPage } from 'next';
import { index } from '..';

const classes = createStyle({
  button: {
    color: red,
    backgroundColor: index,
  },
});

const Home: NextPage = () => {
  return (
    <div>
      <p className={margeStyle(classes.button)}>{index}</p>
    </div>
  );
};

export default Home;
