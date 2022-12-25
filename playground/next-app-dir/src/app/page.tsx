import { createStyle, mergeStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import { Button } from '@/components/Button';

const classes = createStyle({
  container: {
    display: 'flex',
    gap: '5px',
  },
  button: {
    padding: ['10px', '20px'],
  },
  blueButton: {
    background: 'blue',
    ':hover': {
      background: 'skyblue',
    },
  },
});

const Home: NextPage = () => {
  return (
    <div className={classes.container}>
      <Button className={classes.button}>Button</Button>
      <Button className={mergeStyle(classes.button, classes.blueButton)}>
        Button
      </Button>
      <Button className={classes.button}>Button</Button>
    </div>
  );
};

export default Home;
