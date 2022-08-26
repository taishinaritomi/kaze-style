import { createStyle } from '@kaze-style/core';
import { compile, middleware, rulesheet, serialize, stringify } from 'stylis';

export const serializeCSS = (css: string): string[] => {
  const rules: string[] = [];
  serialize(
    compile(css),
    middleware([stringify, rulesheet((rule) => rules.push(rule))]),
  );
  return rules;
};

const now = Date.now();

const { classes, cssRules } = createStyle({
  text: {
    color: 'yellow',
    ':hover,& > a,& h1': {
      color: 'red',
    },
    '.dark &': {
      color: 'white',
    },
    ':hover,& > a,& > h1': {
      color: 'red',
    },
    '& a': {
      color: 'red',
    },
  },
});

console.log(`Time ${Date.now() - now}ms`);

console.log(serializeCSS(cssRules.join('')));

console.log({ classes, cssRules });
