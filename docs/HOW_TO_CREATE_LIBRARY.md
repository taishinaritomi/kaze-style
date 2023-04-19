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
    ...theme.animation('spin'),
  },
});
```

### how to create

```ts
// Example
export const animation = {
  spin: {
    animationDuration: '1s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    animationName: {
      from: {
        transform: 'rotate(0deg)',
      },
      to: {
        transform: 'rotate(360deg)',
      },
    },
  },
} as const;
```

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

```ts
// Example
// @kaze-style/core style api
import { buildInject } from './buildInject';
import { resolveStyle } from './resolveStyle';
import { setCssRules } from './setCssRules';
import type { BuildInfo, Classes } from './types/common';
import type { KazeStyle } from './types/style';
import { classesSerialize } from './utils/classesSerialize';

export function style<K extends string>(styles: KazeStyle<K>): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildInfo: BuildInfo,
  index: number,
): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildInfo?: BuildInfo,
  index?: number,
): Classes<K> {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);

  const classesNode = classesSerialize(staticClasses);
  buildInject({ cssRules: cssRules, args: [classesNode] }, buildInfo, index);

  if (typeof document !== 'undefined') setCssRules(cssRules);

  return classes;
}

export const createStyle = style;
```
