import { classes } from './App.style';
import { Button } from './components/Button';

export const App = () => {
  return <Button $class={classes.$button}>button</Button>;
};
