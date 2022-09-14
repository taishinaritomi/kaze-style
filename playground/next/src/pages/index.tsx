import { createStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Button } from '@/components/Button';
const LazyButton = dynamic(() => import('@/components/LazyButton'), {
  suspense: true,
});

const classes = createStyle({
  button: {
    margin: '100px',
  },
});

const Home: NextPage = () => {
  return (
    <div>
      <Button className={classes.button}>Button</Button>
      <LazyButton className={classes.button}>Button</LazyButton>
    </div>
  );
};

export default Home;
