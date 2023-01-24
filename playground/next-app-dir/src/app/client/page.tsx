'use client';

import { mergeStyle } from '@kaze-style/core';
import { style } from './page.style';
import { Button } from '@/components/Button';

const Client = () => {
  return (
    <div>
      <h1 className={style.title}>Client Component</h1>
      <div className={style.buttonContainer}>
        <Button className={style.$button}>Button</Button>
        <Button className={mergeStyle(style.$button, style.$blueButton)}>
          Button
        </Button>
        <Button className={style.$button}>Button</Button>
      </div>
    </div>
  );
};

export default Client;
