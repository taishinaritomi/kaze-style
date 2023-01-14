import { mergeStyle } from '@kaze-style/react';
import type { ComponentProps, FC } from 'react';
import { style } from './Button.style';

export const Button: FC<ComponentProps<'button'>> = (props) => {
  return (
    <button {...props} className={mergeStyle(style.button, props.className)} />
  );
};
