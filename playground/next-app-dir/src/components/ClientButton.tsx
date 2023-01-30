'use client';
import type { ClassNameOverride } from '@kaze-style/core';
import { mergeStyle } from '@kaze-style/core';
import type { ComponentProps, FC } from 'react';
import { classes } from './ClientButton.style';

export const ClientButton: FC<ClassNameOverride<ComponentProps<'button'>>> = (
  props,
) => {
  return (
    <button
      {...props}
      className={mergeStyle(classes.$button, props.className)}
    />
  );
};
