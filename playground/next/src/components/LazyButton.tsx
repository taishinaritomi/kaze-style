import { createStyle, mergeStyle } from '@kaze-style/react';
import type { ComponentProps, FC } from 'react';

const classes = createStyle({
  button: {
    color: 'blue',
  },
});

const LazyButton: FC<ComponentProps<'button'>> = (props) => {
  return (
    <button
      {...props}
      className={mergeStyle(classes.button, props.className)}
    />
  );
};
// eslint-disable-next-line import/no-default-export
export default LazyButton;
