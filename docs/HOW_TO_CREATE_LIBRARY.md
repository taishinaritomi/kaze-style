# How to create Library

Library authors can use kaze-style to create pre-generated CSS in JS.

In kaze-style, there are two ways to create a Library.

## 1. Static assets

type reference [style](./1.STYLE.md) | [globalStyle](./2.GLOBAL_STYLE.md)

```ts
// Example
// @kaze-style/themes theme & globalTheme uses this method.

import { style, globalStyle } from '@kaze-style/core';
import { theme, globalTheme } from '@kaze-style/themes';

globalStyle(globalTheme.reset());

export const classes = style({
  container: {
    ...theme.animation('spin')
  },
});

```

### how to create
// TODO

## 2. Function API

This one can do more than static assets, but is a bit more complicated.

```ts
// Example
// @kaze-style/core style & globalStyle uses this method.

import { cssVar } from 'your-lib';

export const vars = cssVar({
  darkColor: 'black',
  lightColor: 'white',
});

```

### how to create
// TODO
