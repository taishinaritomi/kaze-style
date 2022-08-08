import { createStyle, mergeStyle, red } from '@kaze-style/react';
import type { NextPage } from 'next';
import { index, padding } from '..';

const classes = createStyle({
  button: {
    color: red,
    backgroundColor: index,
    ...padding
  },
});

const Home: NextPage = () => {
  return (
    <div>
      <p className={mergeStyle(classes.button)}>{index}</p>
    </div>
  );
};

export default Home;
