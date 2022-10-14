import { createStyle, mergeStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Button } from '@/components/Button';
const LazyButton = dynamic(() => import('@/components/Button').then((module) => module.Button));

const classes = createStyle({
  container: {
    display: 'flex',
    gap: "5px"
  },
  button: {
    padding: ['10px','20px']
  },
  blueButton: {
    background: 'blue',
    ":hover": {
      background: 'skyblue',
    }
  }
});

const Home: NextPage = () => {
  return (
    <div className={classes.container}>
      <Button className={classes.button}>Button</Button>
      <Button className={mergeStyle(classes.button,classes.blueButton)}>Button</Button>
      <LazyButton className={classes.button}>Button</LazyButton>
    </div>
  );
};

export default Home;
