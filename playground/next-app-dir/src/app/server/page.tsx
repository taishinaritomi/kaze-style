import { mergeStyle } from '@kaze-style/core';
import { classes } from './page.style';
import { Button } from '@/components/Button';
import { ClientButton } from '@/components/ClientButton';

const ServerComponent = () => {
  return (
    <div>
      <h1 className={classes.title}>Server Component</h1>
      <div className={classes.buttonContainer}>
        <Button className={classes.$button}>Button</Button>
        <Button className={mergeStyle(classes.$button, classes.$blueButton)}>
          Button
        </Button>
        <Button className={classes.$button}>Button</Button>
        <ClientButton className={classes.$button.static()}>
          ClientButton
        </ClientButton>
      </div>
    </div>
  );
};

export default ServerComponent;
