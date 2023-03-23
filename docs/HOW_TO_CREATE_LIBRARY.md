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
import { isBuildTime } from './isBuildTime';
import { resolveStyle } from './resolveStyle';
import { setCssRules } from './setCssRules';
import type { BuildArg, Classes } from './types/common';
import type { KazeStyle } from './types/style';
import { classesSerialize } from './utils/classesSerialize';

export function style<K extends string>(styles: KazeStyle<K>): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildArg: BuildArg,
  index: number,
): Classes<K>;
export function style<K extends string>(
  styles: KazeStyle<K>,
  buildArg?: BuildArg,
  index?: number,
): Classes<K> {
  const [cssRules, classes, staticClasses] = resolveStyle(styles);
  if (isBuildTime(buildArg) && typeof index !== 'undefined') {
    const classesNode = classesSerialize(staticClasses);
    buildArg.injector.cssRules.push(...cssRules);
    buildArg.injector.args.push({ value: [classesNode], index });
  } else if (typeof document !== 'undefined') setCssRules(cssRules);
  return classes;
}
```
