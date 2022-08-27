import { createStyle, mergeStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import { theme } from '@/theme';

const classes = createStyle({
  text: {
    backgroundColor: 'green',
    [theme.screen.xs]: {
      backgroundColor: 'red',
    },
  },
});
const Home: NextPage = () => {
  return (
    <div>
      <p className={mergeStyle(classes.text)}>index</p>
    </div>
  );
};

export default Home;
