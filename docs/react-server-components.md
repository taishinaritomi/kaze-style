# React Server Components

Because of various restrictions in `React Server Components`, we need to add some code in `Kaze Style` as well.

## Server => Server

```ts
// ServerComponent.tsx
import { mergeStyle } from '@kaze-style/core';
import { classes } from './ServerComponent.style';

const ServerComponent = () => {
  return (
    <div className={classes.container}>
      <ServerComponent2 className={classes.$base}>Server</ServerComponent2>
    </div>
  );
};

const ServerComponent2 = (props) => {
  return (
    <p className={mergeStyle(classes.$client, props.className).string()}>
      {props.children}
    </p>
  );
};
```

## Server => Client

```ts
// ServerComponent.tsx
import { mergeStyle } from '@kaze-style/core';
import { classes } from './ServerComponent.style';

const ServerComponent = () => {
  return (
    <div className={classes.container}>
      <ClientComponent className={classes.$base.static()}>Client</ClientComponent>
    </div>
  );
};
```

```ts
// ClientComponent.tsx
'use client';
import { mergeStyle } from '@kaze-style/core';
import { classes } from './ClientComponent.style';
const ClientComponent = (props) => {
  return (
    <p className={mergeStyle(classes.$client, props.className)}>
      {props.children}
    </p>
  );
};
```
