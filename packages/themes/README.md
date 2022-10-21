<div>
  <br>
  <h1 align="center"><b>🎐Kaze Style</b></h1>
  <p align="center">Kaze [風] zero-runtime CSS in JS for React.<p>
  <p align="center"><b>🚧 Kaze Style is under development 🚧</b></p>
  <div align="center">
    <a href='https://www.npmjs.com/package/@kaze-style/react'>
      <img src='https://img.shields.io/npm/v/@kaze-style/react?style=for-the-badge'>
    </a>
    <a href='https://github.com/taishinaritomi/kaze-style/blob/main/LICENSE'>
      <img src='https://img.shields.io/github/license/taishinaritomi/kaze-style?style=for-the-badge'>
    </a>
    <a href='https://www.npmjs.com/package/@kaze-style/react'>
      <img src='https://img.shields.io/npm/types/@kaze-style/react?style=for-the-badge'>
    </a>
  </div>
  <br>
</div>

## Feature

🛠 &nbsp; KazeStyle can choose when to extract css. (build time & run time)

💪 &nbsp; Type-safe styles via [csstype](https://github.com/frenic/csstype)

🦷 &nbsp; Reuse styles using Atomic CSS

👘 &nbsp; Can ignore specificity and merge styles

🎨 &nbsp; Consistent styling using "@kaze-style/themes" (under development)

## Example

### createStyle

```ts
//Button.tsx
import { createStyle } from '@kaze-style/react';

const classes = createStyle({
  button: {
    color: 'red',
  },
});

const Button = () => {
  return <button className={classes.button}>button</button>;
};
```

### mergeStyle

```ts
//Button.tsx
import { createStyle, mergeStyle } from '@kaze-style/react';

const classes = createStyle({
  red: {
    color: 'red',
  },
});

const Button = (props) => {
  return (
    <button className={mergeStyle(classes.red, props.className)}>button</button>
  );
};
```

```ts
//Component.tsx
import { createStyle } from '@kaze-style/react';
import { Button } from '@kaze-style/react';

const classes = createStyle({
  blue: {
    color: 'blue',
  },
});

const Component = () => {
  return <Button className={classes.blue} />;
};
```

### createGlobalStyle

```ts
//App.tsx
import { createGlobalStyle } from '@kaze-style/react';

createGlobalStyle({
  html: {
    color: 'red',
  },
});

const App = () => {
  return <div></div>;
};
```

### Setup Next.js（build time extract）

```ts
//next.config.mjs
import { withKazeStyle } from '@kaze-style/next-plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withKazeStyle(nextConfig);
```

## Inspiration

KazeStyle was designed with reference to several CSS in JS libraries.

[microsoft/griffel](https://github.com/microsoft/griffel)

[seek-oss/vanilla-extract](https://github.com/seek-oss/vanilla-extract)

[argyleink/open-props](https://github.com/argyleink/open-props)

[callstack/linaria](https://github.com/callstack/linaria)

## Author

[Taishi Naritomi](https://github.com/taishinaritomi)

## License

[MIT](https://github.com/taishinaritomi/kaze-style/blob/main/LICENSE)
