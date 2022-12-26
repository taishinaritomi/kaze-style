<div>
  <br />
  <br />
  <div align="center">
    <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/taishinaritomi/kaze-style/main/assets/kaze-light.svg">
    <img width="300" height="auto" alt="Kaze" src="https://raw.githubusercontent.com/taishinaritomi/kaze-style/main/assets/kaze-dark.svg">
  </picture>
  </div>
  <br />
  <br />
  <hr />
  <br />
  <p align="center">Kaze [風] zero-runtime CSS in JS for React<p>
  <p align="center"><b>🚧 under development 🚧</b></p>
  <div align="center">
    <a href='https://www.npmjs.com/package/@kaze-style/react'>
      <img src='https://img.shields.io/npm/v/@kaze-style/react?style=for-the-badge'>
    </a>
    <a href='https://github.com/taishinaritomi/kaze-style/blob/main/LICENSE'>
      <img src='https://img.shields.io/github/license/taishinaritomi/kaze-style?style=for-the-badge'>
    </a>
    <a href='https://bundlephobia.com/package/@kaze-style/react'>
      <img src='https://img.shields.io/bundlephobia/minzip/@kaze-style/react?style=for-the-badge'>
    </a>
    <a href='https://github.com/microsoft/typescript'>
      <img src='https://img.shields.io/npm/types/@kaze-style/react?style=for-the-badge'>
    </a>
  </div>
  <br />
</div>

# Features

- **Build** - can choose when to extract css (build time & run time)
- **TypeScript** - Type-safe styles via [csstype](https://github.com/frenic/csstype)
- **Minimal** - [0.3kb](https://shakerphobia.netlify.app/?imports=ClassName,mergeStyle,__globalStyle,__style&pkg=@kaze-style/react) runtime by build time extract
- **Merge** - Style merging ignoring css specificity
- **Theme** - Consistent styling using "@kaze-style/themes"

# Example

```ts
import { createStyle, createGlobalStyle, mergeStyle } from '@kaze-style/react';

createGlobalStyle({
  html: {
    lineHeight: '1.5',
  },
});

const classes = createStyle({
  container: {
    margin: '20px',
  },
  base: {
    color: 'red',
    background: 'black',
  },
  action: {
    color: 'blue',
  },
});

export const App = ({ action }) => {
  return (
    <div className={classes.container}>
      <p className={mergeStyle(classes.base, action && classes.action)}></p>
    </div>
  );
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

# Inspiration

KazeStyle was designed with reference to several CSS in JS libraries.

[microsoft/griffel](https://github.com/microsoft/griffel)

[seek-oss/vanilla-extract](https://github.com/seek-oss/vanilla-extract)

[argyleink/open-props](https://github.com/argyleink/open-props)

[callstack/linaria](https://github.com/callstack/linaria)

# Author

[Taishi Naritomi](https://github.com/taishinaritomi)

# License

[MIT](https://github.com/taishinaritomi/kaze-style/blob/main/LICENSE)
