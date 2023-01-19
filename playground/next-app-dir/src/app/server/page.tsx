import { mergeStyle } from '@kaze-style/react';
import { style } from './page.style';
import { Button } from '@/components/Button';
import { ClientButton } from '@/components/ClientButton';

const ServerComponent = () => {
  return (
    <div>
      <h1 className={style.title.string()}>Server Component</h1>
      <div className={style.buttonContainer.string()}>
        <Button className={style.button}>Button</Button>
        <Button className={mergeStyle(style.button, style.blueButton)}>
          Button
        </Button>
        <Button className={style.button}>Button</Button>
        <ClientButton className={style.button.static()}>
          ClientButton
        </ClientButton>
      </div>
    </div>
  );
};

export default ServerComponent;
