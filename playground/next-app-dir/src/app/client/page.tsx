'use client';

import { mergeStyle } from '@kaze-style/core';
import { classes } from './page.style';
import { Button } from '@/components/Button';

const Client = () => {
  return (
    <div>
      <h1 className={classes.title}>Client Component</h1>
      <div className={classes.buttonContainer}>
        <Button className={classes.$button}>Button</Button>
        <Button className={mergeStyle(classes.$button, classes.$blueButton)}>
          Button
        </Button>
        <Button className={classes.$button}>Button</Button>
      </div>
    </div>
  );
};

export default Client;
