<div>
  <br>
  <h1 align="center"><b>🎐Kaze Style</b></h1>
  <p align="center">Kaze [風] zero-runtime CSS in JS for React.<p>
  <p align="center"><b>🚧 Kaze Style is under development 🚧</b></p>
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
