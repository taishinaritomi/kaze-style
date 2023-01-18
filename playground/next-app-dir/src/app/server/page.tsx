import { mergeStyle } from '@kaze-style/react';
import { style } from './page.style';
import { Button } from '@/components/Button';

const Server = () => {
  return (
    <div>
      <h1 className={style.title.str}>Server Component</h1>
      <div className={style.buttonContainer.str}>
        <Button className={style.button}>Button</Button>
        <Button className={mergeStyle(style.button, style.blueButton)}>
          Button
        </Button>
        <Button className={style.button}>Button</Button>
      </div>
    </div>
  );
};

export default Server;
