# React Server Components

Because of various restrictions in `React Server Components`, we need to add some code in `Kaze Style` as well.

## Server => Server

```ts
// ServerComponent.tsx
import { mergeStyle } from '@kaze-style/core';
import { style } from './ServerComponent.style';

const ServerComponent = () => {
  return (
    <div className={style.container}>
      <ServerComponent2 className={style.$base}>Server</ServerComponent2>
    </div>
  );
};

const ServerComponent2 = (props) => {
  return (
    <p className={mergeStyle(style.$client, props.className).string()}>
      {props.children}
    </p>
  );
};
```

## Server => Client

```ts
// ServerComponent.tsx
import { mergeStyle } from '@kaze-style/core';
import { style } from './ServerComponent.style';

const ServerComponent = () => {
  return (
    <div className={style.container}>
      <ClientComponent className={style.$base.static()}>Client</ClientComponent>
    </div>
  );
};
```

```ts
// ClientComponent.tsx
'use client';
import { mergeStyle } from '@kaze-style/core';
import { style } from './ClientComponent.style';
const ClientComponent = (props) => {
  return (
    <p className={mergeStyle(style.$client, props.className)}>
      {props.children}
    </p>
  );
};
```
