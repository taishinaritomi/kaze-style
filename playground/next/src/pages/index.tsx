import { createStyle, mergeStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import { padding } from '@/styles';

const classes = createStyle({
  button: {
    backgroundColor: 'green',
    ...padding,
  },
});

const Home: NextPage = () => {
  return (
    <div>
      <p className={mergeStyle(classes.button)}>black</p>
    </div>
  );
};

export default Home;
