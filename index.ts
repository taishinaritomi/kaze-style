import { createStyle } from '@kaze-style/core';

const [cssRules, classes] = createStyle({
  // Atomic
  base: {
    color: 'red',
    background: 'green',
  },
  // Not Atomic
  $base: {
    color: 'red',
    background: 'green',
    ':hover': {
      background: 'hover',
    },
    '@media (prefers-color-scheme: dark)': {
      color: 'blue',
      '@media (prefers-color-scheme: dark2)': {
        color: 'blue',
      },
    },
  },
});

console.log(cssRules);
console.log(classes.base);
console.log(classes.$base);
