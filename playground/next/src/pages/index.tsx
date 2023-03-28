import { mergeStyle } from '@kaze-style/core';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Button } from '@/components/Button';
import { classes } from '@/styles/index.style';
const LazyButton = dynamic(() =>
  import('@/components/Button').then((module) => module.Button),
);

const Home: NextPage = () => {
  return (
    <div className={classes.container}>
      <Button className={classes.$button}>Button</Button>
      <Button className={mergeStyle(classes.$button, classes.$blueButton)}>
        Button
      </Button>
      <LazyButton className={classes.$button}>Button</LazyButton>
    </div>
  );
};

export default Home;
