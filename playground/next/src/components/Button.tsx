import { mergeStyle } from '@kaze-style/core';
import type { ClassNameOverride } from '@kaze-style/core';
import type { ComponentProps, FC } from 'react';
import { classes } from './Button.style';

export const Button: FC<ClassNameOverride<ComponentProps<'button'>>> = (
  props,
) => {
  return (
    <button
      {...props}
      className={`${mergeStyle(classes.$button, props.className)}`}
    />
  );
};
