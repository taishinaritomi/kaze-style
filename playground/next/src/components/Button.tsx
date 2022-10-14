import { createStyle, mergeStyle } from '@kaze-style/react';
import type { ComponentProps, FC } from 'react';

const classes = createStyle({
  button: {
    background: 'red',
    borderRadius: '6px',
    ':hover': {
      background: 'orange'
    }
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
