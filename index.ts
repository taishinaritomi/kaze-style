import { createStyle } from '@kaze-style/core';

const { cssRules } = createStyle({
  text: {
    padding: '10px',
    margin: ['10px', '10px', '10px'],
    gap: '10px 20px',
    inset: '0',
  },
});

console.log(cssRules);
