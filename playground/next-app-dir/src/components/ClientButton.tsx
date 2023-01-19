'use client';
import type { ClassNameOverride } from '@kaze-style/react';
import { mergeStyle } from '@kaze-style/react';
import type { ComponentProps, FC } from 'react';
import { style } from './ClientButton.style';

export const ClientButton: FC<ClassNameOverride<ComponentProps<'button'>>> = (
  props,
) => {
  return (
    <button {...props} className={mergeStyle(style.button, props.className)} />
  );
};
