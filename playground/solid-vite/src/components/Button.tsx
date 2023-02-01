import { mergeStyle } from '@kaze-style/core';
import type { Component, JSX } from 'solid-js';
import { classes } from './Button.style';

export const Button: Component<JSX.IntrinsicElements['button']> = (props) => {
  return <button {...props} class={mergeStyle(classes.$button, props.class)} />;
};
