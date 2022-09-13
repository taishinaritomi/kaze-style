import { createStyle, mergeStyle } from '@kaze-style/react';
import type { ComponentProps, FC } from 'react';

const classes = createStyle({
  button: {
    color: 'red',
  },
});

export const Button: FC<ComponentProps<'button'>> = (props) => {
  return (
    <button
      {...props}
      className={mergeStyle(classes.button, props.className)}
    />
  );
};
