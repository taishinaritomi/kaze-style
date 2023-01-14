import { mergeStyle } from '@kaze-style/react';
import type { NextPage } from 'next';
import dynamic from 'next/dynamic';
import { Button } from '@/components/Button';
import { style } from '@/styles/index.style';
const LazyButton = dynamic(() =>
  import('@/components/Button').then((module) => module.Button),
);

const Home: NextPage = () => {
  return (
    <div className={style.container}>
      <Button className={style.button}>Button</Button>
      <Button className={mergeStyle(style.button, style.blueButton)}>
        Button
      </Button>
      <LazyButton className={style.button}>Button</LazyButton>
    </div>
  );
};

export default Home;
