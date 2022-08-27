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

## Example

```ts
import { createStyle } from '@kaze-style/react';
const classes = createStyle({
  button: {
    color: 'red',
  },
});

const Component = () => {
  return <button className={classes.button}>button</button>;
};
```

## Author

[Taishi Naritomi](https://github.com/taishinaritomi)

## License

[MIT](https://github.com/taishinaritomi/kaze-style/blob/main/LICENSE)
