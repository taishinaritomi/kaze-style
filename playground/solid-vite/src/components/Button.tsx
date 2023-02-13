import type { ClassOverride } from '@kaze-style/core';
import { mergeStyle } from '@kaze-style/core';
import type { Component, JSX } from 'solid-js';
import { classes } from './Button.style';

export const Button: Component<
  ClassOverride<JSX.IntrinsicElements['button']>
> = (props) => {
  return (
    <button
      {...props}
      class={`${mergeStyle(classes.$button, props.$class)} ${
        props.class || ''
      }`}
    />
  );
};
